# TechCycle MobileNetV2 Training on Google Colab GPU

This notebook reproduces the exact, leak-free **TechCycle MobileNetV2** transfer learning pipeline on Google Colab using a free T4 GPU.

---

### Step 1: Select GPU Runtime
In the Colab menu, navigate to:
**Runtime** $\to$ **Change runtime type** $\to$ **Hardware accelerator: T4 GPU** (or A100/V100).

Run the cell below to verify GPU availability:

```python
import tensorflow as tf
print("TensorFlow Version:", tf.__version__)
gpus = tf.config.list_physical_devices('GPU')
print("GPUs Available:", gpus)
assert len(gpus) > 0, "No GPU detected! Please change runtime type to GPU."
!nvidia-smi
```

---

### Step 2: Clone Repository or Mount Google Drive

#### Option A: Clone from GitHub (Recommended)
```python
%cd /content
!git clone https://github.com/somyaparidaa/DebugNChill.git
%cd /content/DebugNChill/backend
```

#### Option B: Upload Repository ZIP
If your repository has local changes not yet pushed to GitHub:
```python
# Upload DebugNChill.zip via Colab Files pane, then:
%cd /content
!unzip -q DebugNChill.zip
%cd /content/DebugNChill/backend
```

---

### Step 3: Install ML Dependencies
Google Colab has TensorFlow and NumPy pre-installed. Run this cell to ensure all pipeline packages match:

```python
!pip install -r requirements-ml.txt
```

---

### Step 4: Verify Dataset and Leak-Free Splits
Run the automated test suite to confirm all 10,989 images, 36 classes, and 0 duplicate leakage:

```python
!pytest tests/test_ml_pipeline.py -v
```

---

### Step 5: Run a 10-Second Smoke Test
Verify GPU tensor execution on a small batch before launching the full run:

```python
!python train_model.py --smoke-test
```

---

### Step 6: Launch Full GPU Training & Evaluation
This executes:
1. **Phase 1 Warmup:** 8 epochs on classification head (backbone frozen) with Adam `1e-3`.
2. **Phase 2 Fine-Tuning:** 12 epochs unfreezing top 30 MobileNetV2 layers (`BatchNormalization` strictly frozen) with Adam `1e-5`.
3. **Phase 3 Test Evaluation:** Evaluates on the untouched 1,633 test images, generating accuracy, precision, recall, macro F1, weighted F1, and a confusion matrix.

*(Expected run time on Google Colab T4 GPU: ~3 to 5 minutes total)*

```python
!python train_model.py --epochs-p1 8 --epochs-p2 12
```

---

### Step 7: Inspect Evaluation Results
View the generated test metrics and classification report:

```python
import json

with open("reports/test_evaluation_report.json") as f:
    report = json.load(f)

print("=== FINAL TEST METRICS ===")
for k, v in report["metrics"].items():
    print(f"{k}: {v:.4f}")
```

---

### Step 8: Package & Download Model Artifacts
Compress all generated models and evaluation reports into a zip file and download them back to your local repository:

```python
import shutil
from google.colab import files

# Create zip archive of models and reports
shutil.make_archive("/content/techcycle_artifacts", "zip", "/content/DebugNChill/backend", "models")
shutil.make_archive("/content/techcycle_reports", "zip", "/content/DebugNChill/backend", "reports")

print("Downloading trained model and reports...")
files.download("/content/techcycle_artifacts.zip")
files.download("/content/techcycle_reports.zip")
```

Once downloaded, extract the contents into your local repository's `backend/models/` and `backend/reports/` directories.
