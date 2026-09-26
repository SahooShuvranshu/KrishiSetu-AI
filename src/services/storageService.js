// KrishiSetu AI - device storage for the installed app and the offline model.
//
// What the web platform actually allows (and what this file therefore does):
//   * navigator.storage.persist()  - ask the browser to exempt our data from
//     eviction. This is the only "keep my data" permission a PWA can request.
//   * Origin Private File System (OPFS) - real files, private to this origin,
//     where the model lives. This is NOT the HTTP cache, so clearing the cache no
//     longer deletes the model, and a loaded model survives a hard reload.
//   * navigator.storage.estimate() - honest used/quota numbers for Settings.
//
// A PWA cannot write into the phone's Downloads folder: there is no such
// permission for web apps. Persistent + origin-private is the ceiling, and it is
// what "stored on the device" can mean for this project.
// Everything degrades gracefully: no OPFS -> fall back to the server copy.
import { OPFS_MODEL_DIR } from '../config/constants';

// ---------------------------------------------------------------- pure helpers
// These are exported separately so they can be unit-tested without a browser.

export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '0 B';
  if (n < 1024) return Math.round(n) + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Validate a model.json and list the weight shards it needs.
export function parseModelManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('model.json is not an object');
  }
  if (manifest.format !== 'layers-model') {
    throw new Error('model.json is not a Layers model (got ' + String(manifest.format) + ')');
  }
  const groups = Array.isArray(manifest.weightsManifest) ? manifest.weightsManifest : [];
  const shards = [];
  let weightCount = 0;
  for (const group of groups) {
    const paths = (group && group.paths) || [];
    for (const path of paths) {
      if (typeof path === 'string' && path && shards.indexOf(path) === -1) {
        shards.push(path);
      }
    }
    weightCount += ((group && group.weights) || []).length;
  }
  if (shards.length === 0) {
    throw new Error('model.json has no weight shards');
  }
  return { shards, shardCount: shards.length, weightCount };
}

export function isNonEmptyClassList(value) {
  return Array.isArray(value)
    && value.length > 1
    && value.every((name) => typeof name === 'string' && name.length > 0);
}

// tfjs wants all weights in one buffer, in manifest order.
export function concatBuffers(buffers) {
  const total = buffers.reduce((sum, b) => sum + (b ? b.byteLength : 0), 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const buffer of buffers) {
    if (!buffer) continue;
    out.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  return out.buffer;
}

// ---------------------------------------------------------------- browser only

export const isOPFSAvailable = () =>
  typeof navigator !== 'undefined'
  && !!navigator.storage
  && typeof navigator.storage.getDirectory === 'function';

// Ask for storage that the browser will not evict under disk pressure.
export async function requestPersistentStorage() {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) {
      return { supported: false, persisted: false };
    }
    if (navigator.storage.persisted && await navigator.storage.persisted()) {
      return { supported: true, persisted: true };
    }
    return { supported: true, persisted: await navigator.storage.persist() };
  } catch (err) {
    return { supported: false, persisted: false, error: String((err && err.message) || err) };
  }
}

export async function getStorageStatus() {
  const status = { opfs: isOPFSAvailable(), supported: false, persisted: false, usage: 0, quota: 0 };
  try {
    if (navigator.storage && navigator.storage.persisted) {
      status.supported = true;
      status.persisted = await navigator.storage.persisted();
    }
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      status.usage = estimate.usage || 0;
      status.quota = estimate.quota || 0;
    }
  } catch (err) {
    status.error = String((err && err.message) || err);
  }
  return status;
}

const modelDir = async (create) => {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(OPFS_MODEL_DIR, { create: !!create });
};

const writeEntry = async (dir, entry) => {
  const handle = await dir.getFileHandle(entry.name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(entry.text !== undefined ? entry.text : entry.buffer);
  await writable.close();
};

// entries: [{ name, text }] or [{ name, buffer }]
export async function saveModelFiles(entries) {
  if (!isOPFSAvailable()) {
    throw new Error('This browser has no Origin Private File System, so the model cannot be stored on the device.');
  }
  const dir = await modelDir(true);
  for (const entry of entries) {
    await writeEntry(dir, entry);
  }
  return entries.map((e) => e.name);
}

// A missing file/dir is a normal "not installed" answer. Every OTHER error
// (SecurityError, UnknownError, quota trouble) must propagate: swallowing them
// here once made a transient Android OPFS read failure look exactly like "model
// not installed", which silently cleared the installed flag with no error box.
const isNotFound = (err) =>
  !!err && (err.name === 'NotFoundError' || err.name === 'TypeMismatchError');

export async function readModelFileText(name) {
  try {
    const dir = await modelDir(false);
    const handle = await dir.getFileHandle(name);
    const file = await handle.getFile();
    return await file.text();
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function readModelFileBuffer(name) {
  try {
    const dir = await modelDir(false);
    const handle = await dir.getFileHandle(name);
    const file = await handle.getFile();
    return await file.arrayBuffer();
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function listModelFiles() {
  if (!isOPFSAvailable()) return [];
  try {
    const dir = await modelDir(false);
    const out = [];
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind !== 'file') continue;
      const file = await handle.getFile();
      out.push({ name, size: file.size });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

export async function deleteModelFiles() {
  if (!isOPFSAvailable()) return false;
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(OPFS_MODEL_DIR, { recursive: true });
    return true;
  } catch (err) {
    return false;
  }
}

// Is a usable model actually stored? Returns null when OPFS is unavailable, so
// the caller can fall back to the legacy flag instead of reporting a lie.
// model.json and classes.json are written FIRST and are tiny, so checking only
// those once reported "MODEL INSTALLED" for a download that died halfway
// through the multi-megabyte shard. Every shard the manifest names must be
// present and non-empty. Storage errors other than "file missing" propagate.
export async function hasInstalledModel() {
  if (!isOPFSAvailable()) return null;
  const files = await listModelFiles();
  const byName = {};
  for (const f of files) byName[f.name.toLowerCase()] = f;
  if (!byName['model.json'] || byName['model.json'].size === 0) return false;
  if (!byName['classes.json'] || byName['classes.json'].size === 0) return false;

  // Storage errors here are real problems and propagate; only a missing or
  // corrupt model.json is an honest "not installed".
  const modelJsonText = await readModelFileText('model.json');
  if (modelJsonText === null) return false;
  let manifest;
  try {
    manifest = parseModelManifest(JSON.parse(modelJsonText));
  } catch (err) {
    // Truncated or wrong-format model.json cannot be loaded either, so this is
    // still an honest "not installed", not a swallowed storage failure.
    console.warn('Stored model.json is unreadable, treating the model as not installed.', err);
    return false;
  }
  return manifest.shards.every(
    (s) => byName[s.toLowerCase()] && byName[s.toLowerCase()].size > 0
  );
}

// Install from files the user picked by hand (the offline path in Settings).
export async function installModelFromFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) throw new Error('No files were selected.');

  const entries = [];
  for (const file of files) {
    const name = String(file.name).split(/[\\/]/).pop();
    if (name.toLowerCase().endsWith('.json')) {
      entries.push({ name, text: await file.text() });
    } else {
      entries.push({ name, buffer: await file.arrayBuffer() });
    }
  }

  const byName = {};
  for (const entry of entries) byName[entry.name.toLowerCase()] = entry;
  if (!byName['model.json'] || !byName['classes.json']) {
    throw new Error('Select model.json, classes.json and every .bin shard together.');
  }

  const manifest = parseModelManifest(JSON.parse(byName['model.json'].text));
  for (const shard of manifest.shards) {
    if (!byName[shard.toLowerCase()]) {
      throw new Error('Missing weight shard: ' + shard);
    }
  }
  if (!isNonEmptyClassList(JSON.parse(byName['classes.json'].text))) {
    throw new Error('classes.json is not a list of class names.');
  }

  // Write shards first and model.json last. model.json is what turns
  // hasInstalledModel() true, so an interrupted install leaves the model
  // honestly "not installed" (retryable) instead of a broken "installed".
  const ordered = entries.filter(
    (e) => e.name.toLowerCase() !== 'model.json' && e.name.toLowerCase() !== 'classes.json'
  );
  ordered.push(byName['classes.json'], byName['model.json']);
  await saveModelFiles(ordered);
  return ordered.map((e) => e.name);
}

// A tfjs IOHandler that reads the model straight out of OPFS.
export const createOPFSIOHandler = () => ({
  load: async () => {
    const modelJsonText = await readModelFileText('model.json');
    if (!modelJsonText) throw new Error('stored model.json is missing');
    const parsed = JSON.parse(modelJsonText);
    const manifest = parseModelManifest(parsed);

    const weightSpecs = [];
    const buffers = [];
    for (const group of parsed.weightsManifest) {
      for (const path of group.paths) {
        const buffer = await readModelFileBuffer(path);
        if (!buffer) throw new Error('stored weight shard is missing: ' + path);
        buffers.push(buffer);
      }
      weightSpecs.push(...(group.weights || []));
    }

    return {
      modelTopology: parsed.modelTopology,
      weightSpecs,
      weightData: concatBuffers(buffers),
      format: parsed.format,
      generatedBy: parsed.generatedBy,
      convertedBy: parsed.convertedBy,
      userDefinedMetadata: parsed.userDefinedMetadata
    };
  }
});
