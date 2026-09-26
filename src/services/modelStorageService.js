// KrishiSetu AI - on-device model loading and inference.
//
// The reasoning lives in ./offlineDiagnosis (pure, unit-testable in Node). This
// file is only the browser-facing wrapper: load the model, sample the pixels for
// the leaf guard, run one prediction, and hand the numbers to the decision layer.
import * as tf from '@tensorflow/tfjs';
import {
  rankCandidates,
  gate,
  assessLeafPixels,
  composeOfflineResult
} from './offlineDiagnosis';
import {
  hasInstalledModel,
  createOPFSIOHandler,
  readModelFileText,
  isNonEmptyClassList
} from './storageService';
import { getTranslation } from '../translations';

// Localised section labels and fallbacks for the offline result card. Built
// here, at the i18n boundary, so ./offlineDiagnosis stays free of translations
// and can still be unit-tested in plain Node.
const labelsFor = (lang) => ({
  organic: getTranslation(lang, 'organicLabel'),
  chemical: getTranslation(lang, 'chemicalLabel'),
  advice: getTranslation(lang, 'advice'),
  fallbackOrganic: getTranslation(lang, 'noRemedyOrganic'),
  fallbackChemical: getTranslation(lang, 'noRemedyChemical')
});

let localModel = null;
let classNames = null;
let modelSource = null;

export async function loadLocalModel() {
  try {
    // Assign only after BOTH pieces are in hand. A model without class names
    // cannot be used, and caching it would poison every later call (the previous
    // version returned `true` and then threw a TypeError on classNames[maxIndex]).
    if (!localModel || !classNames) {
      const loaded = await loadModelAndClasses();
      localModel = loaded.model;
      classNames = loaded.names;
      modelSource = loaded.source;
      console.log('Local model ready: ' + loaded.names.length + ' classes (from ' + loaded.source + ')');
    }
    return true;
  } catch (err) {
    localModel = null;
    classNames = null;
    console.warn('No local model found or TFJS failed. Falling back to JSON.', err);
    return false;
  }
}

export const isLocalModelLoaded = () => Boolean(localModel && classNames);

export const getModelSource = () => modelSource;

// Drop the in-memory model so the next scan reloads it (used after Delete Model).
export const unloadLocalModel = () => {
  localModel = null;
  classNames = null;
  modelSource = null;
};

// Prefer the copy stored on the device (OPFS): it is the one that works in
// airplane mode and survives a cache clear. Fall back to the copy that ships
// with the site, which is what a fresh install uses.
async function loadModelAndClasses() {
  // A storage failure while CHECKING must not block a scan: the server copy
  // (precached by the service worker) may be perfectly good, and scans should
  // degrade to it. The download/Settings paths surface that error instead;
  // only here is silently falling back the right call.
  let installed = false;
  try {
    installed = await hasInstalledModel();
  } catch (err) {
    console.warn('Could not check device storage for the model; using the server copy.', err);
  }
  if (installed) {
    try {
      const model = await tf.loadLayersModel(createOPFSIOHandler());
      const names = JSON.parse(await readModelFileText('classes.json'));
      if (!isNonEmptyClassList(names)) {
        throw new Error('stored classes.json is not a class list');
      }
      return { model, names, source: 'device storage' };
    } catch (err) {
      console.warn('Stored model could not be loaded, using the server copy instead.', err);
    }
  }

  const model = await tf.loadLayersModel('/model/model.json');
  const response = await fetch('/model/classes.json');
  const names = await response.json();
  if (!isNonEmptyClassList(names)) {
    throw new Error('classes.json is missing or empty');
  }
  return { model, names, source: 'server' };
}

// Sample a small canvas so the leaf guard can look at real pixels without
// touching TensorFlow. Best-effort: this must never be able to block a scan.
const samplePixels = (imageElement, size = 64) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imageElement, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
};

// `cropId` comes from the crop picker on the scan screen. Passing it is what
// gives the on-device model the context it otherwise cannot have.
export async function runInBrowserVisionInference(imageElement, cropId = 'general', lang = 'en') {
  const isLoaded = await loadLocalModel();
  if (!isLoaded) {
    throw new Error('MODEL_NOT_INSTALLED');
  }

  // Leaf guard first: no point warming up the model for a photo of a wall.
  let leaf = { verdict: 'unclear', leafFraction: 0, detail: 0 };
  try {
    const image = samplePixels(imageElement);
    leaf = assessLeafPixels(image.data, image.width, image.height);
  } catch (err) {
    console.warn('Leaf guard skipped', err);
  }

  if (leaf.verdict === 'no_leaf') {
    return {
      status: 'not_a_leaf',
      disease: null,
      treatment: null,
      confidence: null,
      leaf
    };
  }

  // tidy() disposes the input tensor and the prediction tensor, so repeated
  // scans cannot leak the 224x224x3 buffer the way the old version did.
  const predictions = tf.tidy(() => {
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims(0)
      .div(255.0); // the model's own Rescaling layer expects 0-1 input
    return Array.from(localModel.predict(tensor).dataSync());
  });

  const { candidates, masked, cropMissing, global } = rankCandidates(predictions, classNames, cropId);
  const gateResult = gate(candidates, { global, cropMissing });

  // The trained Other class said this is not a leaf of the selected crop. Same
  // shape as the pixel guard's answer, so the UI handles both the same way.
  if (gateResult.status === 'not_a_leaf') {
    return {
      status: 'not_a_leaf',
      disease: null,
      treatment: null,
      confidence: null,
      leaf,
      other: gateResult.other ? gateResult.other.name : null
    };
  }

  // The farmer picked a crop this model has no classes for (Maize in a model
  // trained without the corn classes). There is no honest answer to give, so
  // this is surfaced as its own outcome rather than a low-confidence guess at
  // some other crop's disease.
  if (gateResult.status === 'crop_not_in_model') {
    throw new Error('CROP_NOT_IN_MODEL');
  }

  return composeOfflineResult({
    candidates,
    gateResult,
    leaf,
    masked,
    cropId,
    lang,
    labels: labelsFor(lang)
  });
}
