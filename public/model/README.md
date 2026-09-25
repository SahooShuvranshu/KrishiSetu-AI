# KrishiSetu AI — Public assets

Put your trained model files here:

- `model.json` — TF.js Layers-format model (exported by the Colab notebook)
- `group1-shard*.bin` — model weight shard(s)
- `classes.json` — JSON array of class names in the model's output order
- `metadata.json` — (optional) training metadata; the app ignores it

These files are **tracked by git** (only `*.tflite` is ignored), so a fresh
clone ships with the current model and Vercel serves it from the repo. To ship
a retrained model: replace all files here, commit, and push — then remind users
to hard-reload, because the service worker precaches the old weights.

## How to get these files

Run `notebooks/KrishiSetu_Model_Training.ipynb` on Google Colab (T4 GPU). At the
end it produces `tfjs_model.zip`. Then, from the repo root:

```bash
mkdir -p public/model
unzip -o tfjs_model.zip -d public/model
ls public/model   # model.json, group1-shard*.bin, classes.json
```

## How the app uses them

There are two layers, and they are not the same thing:

1. **This folder** is the copy that ships with the site. TensorFlow.js loads it
   from `/model/model.json`, so it must live at exactly this path. This is what
   a fresh install uses before anything is downloaded.
2. **On-device storage (OPFS)** is where **Settings → Download** writes the
   model. That copy is what actually works in airplane mode and survives a
   cache clear, and it takes priority over this folder when present.

So: copy the files here, rebuild/redeploy for the hosted site to have them, then
use **Settings → Download** in the app to install onto a device. Deleting them
here while a device already has them installed is harmless for that device.

## Contract

The app feeds the model `224x224x3` pixels in the `[0, 1]` range and expects a
`Rescaling(scale=2.0, offset=-1.0)` first layer inside the model. See
[`MODEL_PLAN.md`](../../MODEL_PLAN.md) §1, and `document.md` §11 for the full
preprocessing contract. The notebook's Step 9 asserts all of it.
