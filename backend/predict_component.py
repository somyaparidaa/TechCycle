# predict_component.py
import os
import json
import numpy as np
from PIL import Image

# -----------------------------------------------------------------------------
# 1. Path Configuration
# -----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
KERAS_MODEL_PATH = os.path.join(MODELS_DIR, "component_classifier.keras")
H5_MODEL_PATH = os.path.join(MODELS_DIR, "component_classifier.h5")
ROOT_H5_PATH = os.path.join(BASE_DIR, "component_classifier.h5")
LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
MODELS_LABELS_PATH = os.path.join(MODELS_DIR, "class_labels.json")

# -----------------------------------------------------------------------------
# 2. Dynamic Class Labels & Recycling Guidelines Loader
# -----------------------------------------------------------------------------
class_labels = {}
active_labels_path = LABELS_PATH if os.path.exists(LABELS_PATH) else MODELS_LABELS_PATH
if os.path.exists(active_labels_path):
    try:
        with open(active_labels_path, "r", encoding="utf-8") as f:
            raw_labels = json.load(f)
            class_labels = {int(k): v for k, v in raw_labels.items()}
    except Exception as e:
        print(f"[!] Warning: Could not parse {active_labels_path}: {e}")

# -----------------------------------------------------------------------------
# 3. Model Loader
# -----------------------------------------------------------------------------
model = None

def load_active_model():
    """Attempts to load trained weights from .keras or .h5."""
    global model
    candidates = [KERAS_MODEL_PATH, H5_MODEL_PATH, ROOT_H5_PATH]
    for path in candidates:
        if os.path.exists(path):
            # Prefer standalone Keras 3.x loader if available, fallback to tf.keras
            try:
                import keras
                model = keras.models.load_model(path)
                print(f"[✓] Loaded active model weights from {path} via Keras {keras.__version__}")
                return model
            except Exception as e_keras:
                try:
                    from tensorflow.keras.models import load_model
                    model = load_model(path)
                    print(f"[✓] Loaded active model weights from {path} via tf.keras")
                    return model
                except Exception as e_tf:
                    print(f"[!] Warning: Found model file at {path} but failed to load (Keras error: {e_keras}, TF error: {e_tf})")
    return None

load_active_model()

def is_model_loaded():
    """Returns True if the ML model is resident in memory."""
    return model is not None

# -----------------------------------------------------------------------------
# 4. Inference Function
# -----------------------------------------------------------------------------
def predict_image(img_path):
    """
    Classifies an input image using MobileNetV2.
    Returns:
        dict: { prediction, confidence, recycling_guide, status }
    """
    try:
        if model is not None:
            try:
                from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
            except (ImportError, ModuleNotFoundError):
                try:
                    from keras.applications.mobilenet_v2 import preprocess_input
                except (ImportError, ModuleNotFoundError):
                    def preprocess_input(x):
                        return (x / 127.5) - 1.0

            # 1. Load and standardize image to RGB 224x224
            img = Image.open(img_path).convert("RGB").resize((224, 224))
            img_array = np.array(img, dtype=np.float32)
            img_array = np.expand_dims(img_array, axis=0)

            # 2. Apply MobileNetV2 normalization [-1, 1]
            img_array = preprocess_input(img_array)

            # 3. Predict class probabilities
            prediction = model.predict(img_array, verbose=0)
            predicted_index = int(np.argmax(prediction[0]))
            confidence = float(prediction[0][predicted_index]) * 100

            # 4. Map to verified component metadata
            label_info = class_labels.get(predicted_index, {
                "name": f"Component-{predicted_index}",
                "guide": "Recycle through certified electronic waste drop-off facilities."
            })

            component_name = label_info.get("name", "Unknown Component")
            recycling_guide = label_info.get("guide", "Dispose according to local hazardous electronic regulations.")

            # 5. Low confidence threshold warning
            if confidence < 40.0:
                recycling_guide = f"Low confidence ({round(confidence, 1)}%). Please ensure the component is clearly centered with good lighting. " + recycling_guide

            return {
                "prediction": component_name,
                "confidence": round(confidence, 2),
                "recycling_guide": recycling_guide,
                "status": "success"
            }

        # If model weights are not loaded, report model unavailable
        return {
            "prediction": "Model Unavailable",
            "confidence": 0.0,
            "recycling_guide": "Model weights are pending training or download. Please execute train_model.py or download the weights from Colab.",
            "status": "model_unavailable"
        }

    except Exception as e:
        return {"error": str(e), "status": "error"}
