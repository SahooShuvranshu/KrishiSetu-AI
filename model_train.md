# KrishiSetu AI - Complete Model Training Guide
## Vertex AI + Google Colab Integration

> **Last Updated:** August 24, 2026
> **Deadline:** September 30, 2026
> **Focus:** Odisha Crops Only

---

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Part 1: Google Cloud Setup](#part-1-google-cloud-setup)
- [Part 2: Colab Training](#part-2-colab-training)
- [Part 3: Deploy to Vertex AI](#part-3-deploy-to-vertex-acai)
- [Part 4: Download for Mobile](#part-4-download-for-mobile)
- [Troubleshooting](#troubleshooting)
- [Cost Estimate](#cost-estimate)

---

## Overview

### What We're Building
A crop disease classifier for Odisha farmers that:
- Runs 100% offline on mobile phones via TensorFlow.js
- Trained on Google Vertex AI (hackathon requirement)
- Integrates with Gemini API for cloud-based diagnosis

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Google Colab (GPU)     →    Vertex AI Model Registry    │
│  ┌─────────────┐              ┌─────────────────┐       │
│  │ PlantVillage │              │ Model Stored     │       │
│  │ Rice Disease │ ──train──→  │ Online Endpoint  │       │
│  │ Cotton Leaf  │              │ Version Control  │       │
│  └─────────────┘              └─────────────────┘       │
│          │                              │                 │
│          ▼                              ▼                 │
│  ┌─────────────┐              ┌─────────────────┐       │
│  │ TFJS Export │              │ Cloud Inference  │       │
│  │ (Mobile)    │              │ (Backup)         │       │
│  └─────────────┘              └─────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Datasets Used
| # | Dataset | URL | Size | Classes |
|---|---------|-----|------|---------|
| 1 | PlantVillage | [kaggle.com/datasets/emmarex/plantdisease](https://www.kaggle.com/datasets/emmarex/plantdisease) | 54K images | 38 classes |
| 2 | Rice Disease | [kaggle.com/datasets/anshulm257/rice-disease-dataset](https://www.kaggle.com/datasets/anshulm257/rice-disease-dataset) | 3,829 images | 4 classes |
| 3 | Cotton Leaf | [kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset](https://www.kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset) | 1,710 images | 4 classes |

---

## Prerequisites

### What You Need
- [ ] Google Account (Gmail)
- [ ] Kaggle Account (free)
- [ ] Computer with internet access
- [ ] 2-3 hours of time

### What You'll Get
- Trained model in Vertex AI Model Registry
- TensorFlow.js model for mobile deployment
- Google AI integration for hackathon

---

## Part 1: Google Cloud Setup

### Step 1.1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** (top-left)
3. Click **New Project**
4. Enter project details:
   - **Project name:** `KrishiSetu AI`
   - **Organization:** Leave as "No organization"
   - **Location:** Leave as default
5. Click **Create**
6. Wait for project creation (1-2 minutes)
7. Select the new project from dropdown

### Step 1.2: Enable Required APIs

1. Go to **APIs & Services** > **Library**
2. Search and enable these APIs:
   - [ ] **Vertex AI API** - Click > Enable
   - [ ] **Cloud Storage API** - Click > Enable
   - [ ] **Compute Engine API** - Click > Enable
   - [ ] **Cloud Resource Manager API** - Click > Enable

### Step 1.3: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Enter details:
   - **Service account name:** `krishisetu-sa`
   - **Service account ID:** `krishisetu-sa@krishisetu-ai.iam.gserviceaccount.com`
   - **Description:** `KrishiSetu AI training service account`
4. Click **Create and Continue**
5. Grant roles (click **Select a role** for each):
   - [ ] **Vertex AI** > **Vertex AI Admin**
   - [ ] **Storage** > **Storage Admin**
   - [ ] **Compute** > **Compute Admin**
6. Click **Continue**
7. Click **Done**

### Step 1.4: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON**
5. Click **Create**
6. Save the JSON file to your computer
7. **IMPORTANT:** Keep this file secure - it gives access to your project

### Step 1.5: Create Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Enter details:
   - **Bucket name:** `krishisetu-ai-storage` (must be globally unique)
   - **Location type:** Region
   - **Location:** `us-central1`
   - **Storage class:** Standard
4. Click **Create**
5. Note the bucket name for later

---

## Part 2: Colab Training

### Step 2.1: Open Google Colab

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Sign in with your Google account
3. Click **File** > **Upload notebook**
4. Select `notebooks/KrishiSetu_Real_Model_Training.ipynb`
5. Wait for upload

### Step 2.2: Enable GPU Runtime

1. Click **Runtime** menu (top)
2. Click **Change runtime type**
3. Under **Hardware accelerator**:
   - Select **T4 GPU**
4. Under **Runtime shape**:
   - Select **Standard**
5. Click **Save**
6. Wait for GPU connection (green checkmark in top-right)

### Step 2.3: Upload Service Account Key

1. Click **Files** icon (left sidebar, folder icon)
2. Click **Upload to session storage** (page with up arrow)
3. Select the JSON key file from Part 1, Step 1.4
4. Wait for upload

### Step 2.4: Run Environment Setup

1. Find **Section 1: Install Packages**
2. Click the play button or press Shift+Enter
3. Wait for installation (2-3 minutes)
4. Verify output shows:
   ```
   NumPy version: 1.26.4
   OK: NumPy compatible
   ```

### Step 2.5: Connect to Google Cloud

1. Find **Section 2: Authenticate with Google Cloud**
2. Update the service account path:
   ```python
   SERVICE_ACCOUNT_KEY = '/content/your-key-file.json'  # Change this!
   ```
3. Run the cell
4. Verify output shows:
   ```
   Authenticated with project: krishisetu-ai
   ```

### Step 2.6: Initialize Vertex AI

1. Find **Section 3: Initialize Vertex AI**
2. Run the cell
3. Verify output shows:
   ```
   Vertex AI initialized
   Project: krishisetu-ai
   Region: us-central1
   ```

### Step 2.7: Download Datasets

**IMPORTANT:** Do this BEFORE running the notebook!

#### Download Rice Disease Dataset:
1. Go to [kaggle.com/datasets/anshulm257/rice-disease-dataset](https://www.kaggle.com/datasets/anshulm257/rice-disease-dataset)
2. Click **Download** (free account required)
3. Save the zip file

#### Download Cotton Leaf Disease Dataset:
1. Go to [kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset](https://www.kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset)
2. Click **Download**
3. Save the zip file

#### Upload to Colab:
1. In Colab, click **Files** icon (left sidebar)
2. Click **Upload to session storage**
3. Select BOTH zip files
4. Wait for upload

### Step 2.8: Run Training

1. Click **Runtime** > **Run all**
2. Or press Shift+Enter on each cell
3. Wait for training to complete (~15-30 minutes)
4. Watch for output:
   ```
   Phase 1 best val accuracy: 0.XXXX
   Phase 2 best val accuracy: 0.XXXX
   ```

### Step 2.9: Verify Training

Check these outputs:
- [ ] Dataset loaded with correct number of classes
- [ ] Training accuracy > 80%
- [ ] Validation accuracy > 75%
- [ ] No errors in training loop

---

## Part 3: Deploy to Vertex AI

### Step 3.1: Upload Model to Vertex AI

1. Find **Section 11: Upload Model to Vertex AI**
2. Run the cell
3. Wait for upload (1-2 minutes)
4. Verify output shows:
   ```
   Model registered in Vertex AI!
   Model Resource Name: projects/xxx/locations/us-central1/models/xxx
   ```

### Step 3.2: Verify in Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project: `KrishiSetu AI`
3. Go to **Vertex AI** > **Model Registry**
4. Verify model appears in list
5. Click on model to see details

### Step 3.3: Create Online Endpoint (Optional)

1. In Vertex AI > **Online Prediction**
2. Click **Create Endpoint**
3. Select your model
4. Configure:
   - **Machine type:** `n1-standard-4`
   - **Min replicas:** 1
   - **Max replicas:** 1
5. Click **Deploy**
6. Wait for deployment (5-10 minutes)

---

## Part 4: Download for Mobile

### Step 4.1: Export to TensorFlow.js

1. Find **Section 12: Quantize & Export to TensorFlow.js**
2. Run the cell
3. Wait for export (1-2 minutes)
4. Verify output shows:
   ```
   Export complete!
   ```

### Step 4.2: Download Model Files

1. Find **Section 13: Download the Model**
2. Run the cell
3. In **Files** sidebar, find `tfjs_model.zip`
4. Right-click > **Download**
5. Save to your computer

### Step 4.3: Install in KrishiSetu App

1. Extract `tfjs_model.zip`
2. Copy contents to `KrishiSetu-AI/public/model/`
3. Your folder should look like:
   ```
   KrishiSetu-AI/
   └── public/
       └── model/
           ├── model.json
           ├── group1-shard1of1.bin
           ├── classes.json
           └── metadata.json
   ```

### Step 4.4: Test the Model

1. Open terminal in KrishiSetu-AI folder
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open browser to `http://localhost:5173`
4. Go to Settings > Download Offline Model
5. Test with crop leaf photos

---

## Troubleshooting

### Issue 1: NumPy Error
```
AttributeError: module 'numpy' has no attribute 'object'
```

**Solution:**
```python
!pip install numpy==1.26.4
```
Then restart runtime and run all cells.

### Issue 2: GPU Not Available
```
WARNING: No GPU detected!
```

**Solution:**
1. Runtime > Change runtime type
2. Select T4 GPU
3. Save
4. Wait for connection

### Issue 3: Authentication Failed
```
google.auth.exceptions.DefaultCredentialsError
```

**Solution:**
1. Verify service account JSON is uploaded
2. Check path is correct in notebook
3. Verify service account has correct roles

### Issue 4: Dataset Not Found
```
WARNING: No rice dataset found!
```

**Solution:**
1. Download datasets from Kaggle
2. Upload zip files to Colab Files sidebar
3. Verify filenames contain "rice" or "cotton"

### Issue 5: Training Too Slow
**Solution:**
1. Verify GPU is enabled
2. Reduce epochs: `epochs=5` instead of `epochs=10`
3. Use smaller batch size: `BATCH_SIZE=16`

### Issue 6: Vertex AI Upload Failed
```
PermissionDenied: 403
```

**Solution:**
1. Verify service account has `Vertex AI Admin` role
2. Verify Vertex AI API is enabled
3. Check project ID is correct

---

## Cost Estimate

### Training Costs
| Resource | Usage | Cost |
|----------|-------|------|
| Colab GPU (T4) | 2 hours | Free (12 hrs/day) |
| Cloud Storage | 1 GB | ~$0.02/month |
| Vertex AI Model Registry | 1 model | Free |
| **Total** | | **~$0.02** |

### If Deploying Endpoint
| Resource | Usage | Cost |
|----------|-------|------|
| Vertex AI Endpoint | 1 hour | ~$0.10 |
| Cloud Storage | 1 GB | ~$0.02/month |
| **Total** | | **~$0.12** |

---

## Vertex AI Benefits for Hackathon

| Feature | Benefit |
|---------|---------|
| **Model Registry** | Version control for ML models |
| **Online Endpoints** | Cloud-based inference backup |
| **AutoML** | Could improve model automatically |
| **Monitoring** | Track model performance |
| **Integration** | Works with other Google Cloud services |
| **Credits** | Google provides free credits for hackathons |

---

## Next Steps After Training

1. **Test mobile inference** - Run app on Android phone
2. **Collect real photos** - Get actual Odisha crop photos
3. **Retrain with real data** - Improve model accuracy
4. **Deploy cloud endpoint** - Enable online backup
5. **Add more crops** - Expand to other Odisha crops

---

## Resources

### Documentation
- [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)
- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [Google Colab Guide](https://colab.research.google.com/notebooks/intro.ipynb)

### Datasets
- [PlantVillage](https://github.com/spmohanty/plantvillage-dataset)
- [Rice Disease Dataset](https://www.kaggle.com/datasets/anshulm257/rice-disease-dataset)
- [Cotton Leaf Disease](https://www.kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset)

### Support
- Google Cloud Support: [cloud.google.com/support](https://cloud.google.com/support)
- Kaggle Forums: [kaggle.com/discussions](https://www.kaggle.com/discussions)
- Stack Overflow: [stackoverflow.com](https://stackoverflow.com)

---

## Quick Reference Commands

```bash
# Check Colab GPU
!nvidia-smi

# Check NumPy version
!python -c "import numpy; print(numpy.__version__)"

# Check TensorFlow version
!python -c "import tensorflow; print(tensorflow.__version__)"

# Check TensorFlow.js version
!python -c "import tensorflowjs; print(tensorflowjs.__version__)"

# List files in Colab
!ls -la /content/

# Check disk space
!df -h
```

---

*Guide created for KrishiSetu AI - Google AI Hackathon 2026*
