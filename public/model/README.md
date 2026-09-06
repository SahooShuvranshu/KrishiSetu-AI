# KrishiSetu AI — Public assets

Put your trained model files here:

- `model.json` — TF.js Layers-format model (exported by the Colab notebook)
- `group1-shard1of1.bin` — model weights shard
- `classes.json` — JSON array of class names in the model's output order
- `metadata.json` — (optional) training metadata

## How to get these files

Run `notebooks/KrishiSetu_Real_Model_Training.ipynb` on Google Colab (T4 GPU).
At the end it produces `tfjs_model.zip`. Then, from the repo root:

```bash
mkdir -p public/model
unzip tfjs_model.zip -d public/model
```

The app loads the model with `tf.loadLayersModel('/model/model.json')`,
so these files must live at exactly this path.
