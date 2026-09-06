import offlineDiseases from '../data/offline_diseases.json';
import * as tf from '@tensorflow/tfjs';

let localModel = null;
let classNames = null;

// Normalize "Paddy_Bacterial_Blight" -> " paddy bacterial blight "
const normalize = (s) => ` ${String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()} `;

// Find the best-matching offline protocol for a predicted class name.
// Scores records by crop match + disease-keyword overlap so "Paddy_Blast"
// finds the Paddy Blast record instead of the first Paddy record.
const lookupProtocol = (predictedClass) => {
  const pred = normalize(predictedClass);
  const predWords = pred.split(' ').filter(Boolean);
  const cropWord = predWords[0] || '';

  let best = null;
  let bestScore = 0;

  for (const d of offlineDiseases) {
    const crop = normalize(d.crop_name).split(' ').filter(Boolean)[0] || '';
    // Wrong crop -> skip
    if (crop && crop !== cropWord) continue;

    const hay = normalize(d.disease_name);
    const hayWords = hay.split(' ').filter(Boolean);
    let score = 0;
    for (let i = 0; i < hayWords.length; i++) {
      if (hayWords[i].length > 2 && predWords.includes(hayWords[i])) score += 1;
      const bigram = `${hayWords[i]} ${hayWords[i + 1] || ''}`.trim();
      if (bigram.includes(' ') && pred.includes(` ${bigram} `)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }

  return best;
};

export async function loadLocalModel() {
  try {
    if (!localModel) {
      // It expects the model.json to be in the public/model/ folder
      localModel = await tf.loadLayersModel('/model/model.json');

      // Load classes
      const response = await fetch('/model/classes.json');
      classNames = await response.json();
    }
    return true;
  } catch (err) {
    console.warn("No local model found or TFJS failed. Falling back to JSON.", err);
    return false;
  }
}

export async function runInBrowserVisionInference(imageElement) {
  try {
    const isLoaded = await loadLocalModel();
    if (!isLoaded) {
      throw new Error("MODEL_NOT_INSTALLED");
    }

    // Prepare image for TFJS MobileNetV2 (224x224)
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims(0)
      .div(255.0); // Normalize to 0-1

    const predictions = await localModel.predict(tensor).data();

    // Find highest probability
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] > maxProb) {
        maxProb = predictions[i];
        maxIndex = i;
      }
    }

    const predictedClass = classNames[maxIndex];

    // Use the JSON strictly as a dictionary to lookup treatments for the predicted class
    const protocol = lookupProtocol(predictedClass)
      || { organic_remedy: "Maintain soil health.", chemical_remedy: "Consult local agriculture officer." };

    return {
      disease: `${predictedClass} (${(maxProb * 100).toFixed(1)}%)`,
      treatment: `Organic: ${protocol.organic_remedy}\n\nChemical: ${protocol.chemical_remedy}`
    };

  } catch (error) {
    console.error("TFJS Inference Error", error);
    throw error;
  }
}
