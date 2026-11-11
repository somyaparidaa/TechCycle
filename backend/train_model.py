# backend/train_model.py
"""
TechCycle ML Subsystem - Production MobileNetV2 Transfer Learning Pipeline
Uses leak-free group-stratified splits from dataset_split.json.
Implements two-phase training (warmup + fine-tuning), class weighting,
callbacks, and evaluation on the untouched test split.
"""

import os
import sys
import json
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight

# -----------------------------------------------------------------------------
# 1. Environment & Paths Configuration
# -----------------------------------------------------------------------------
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SPLIT_PATH = os.path.join(BASE_DIR, "dataset_split.json")
LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

MODEL_SAVE_PATH = os.path.join(MODELS_DIR, "component_classifier.keras")
LEGACY_H5_PATH = os.path.join(MODELS_DIR, "component_classifier.h5")
ROOT_H5_PATH = os.path.join(BASE_DIR, "component_classifier.h5")
CONFIG_SAVE_PATH = os.path.join(MODELS_DIR, "training_config.json")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
RANDOM_SEED = 42

tf.random.set_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# -----------------------------------------------------------------------------
# 2. Load Dataset Split and Class Mappings
# -----------------------------------------------------------------------------
if not os.path.exists(SPLIT_PATH):
    raise FileNotFoundError(f"dataset_split.json not found at {SPLIT_PATH}. Run dataset_utils.py first.")

with open(SPLIT_PATH, "r", encoding="utf-8") as f:
    split_info = json.load(f)

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    class_labels_raw = json.load(f)

# Map class name -> index (0..35)
class_to_idx = {v["name"]: int(k) for k, v in class_labels_raw.items()}
idx_to_class = {int(k): v["name"] for k, v in class_labels_raw.items()}
NUM_CLASSES = len(class_to_idx)
print(f"[*] Loaded {NUM_CLASSES} classes from {LABELS_PATH}")

train_items = split_info["splits"]["train"]
val_items = split_info["splits"]["val"]
test_items = split_info["splits"]["test"]

print(f"[*] Split sizes: Train={len(train_items)}, Val={len(val_items)}, Test={len(test_items)}")

# -----------------------------------------------------------------------------
# 3. Compute Balanced Class Weights
# -----------------------------------------------------------------------------
train_labels = [class_to_idx[item["class"]] for item in train_items]
unique_classes = np.unique(train_labels)
class_weights_arr = compute_class_weight(
    class_weight="balanced",
    classes=unique_classes,
    y=train_labels
)
class_weight_dict = {int(i): float(w) for i, w in zip(unique_classes, class_weights_arr)}
print(f"[*] Computed balanced class weights for {len(class_weight_dict)} classes")

# -----------------------------------------------------------------------------
# 4. Native tf.data Pipeline with Decoupled Augmentation
# -----------------------------------------------------------------------------
def load_and_preprocess_image(path, label_idx, augment=False):
    """Loads image, applies augmentations if requested, and scales to [-1, 1]."""
    img_bytes = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img_bytes, channels=3)
    img = tf.image.resize(img, IMG_SIZE)

    if augment:
        img = tf.image.random_flip_left_right(img)
        img = tf.image.random_brightness(img, max_delta=0.1)
        img = tf.image.random_contrast(img, lower=0.9, upper=1.1)

    img = preprocess_input(img)
    label_one_hot = tf.one_hot(label_idx, depth=NUM_CLASSES)
    return img, label_one_hot


def create_tf_dataset(items, augment=False, shuffle=True, batch_size=BATCH_SIZE):
    """Creates an optimized tf.data.Dataset from split items."""
    paths = [os.path.normpath(os.path.join(BASE_DIR, item["path"])) for item in items]
    labels = [class_to_idx[item["class"]] for item in items]

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=min(len(paths), 2048), seed=RANDOM_SEED)

    ds = ds.map(
        lambda p, l: load_and_preprocess_image(p, l, augment=augment),
        num_parallel_calls=tf.data.AUTOTUNE
    )
    ds = ds.batch(batch_size)
    ds = ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    return ds

# -----------------------------------------------------------------------------
# 5. MobileNetV2 Transfer Learning Architecture
# -----------------------------------------------------------------------------
def build_mobilenet_model(num_classes=NUM_CLASSES, weights="imagenet"):
    """
    Constructs MobileNetV2 transfer learning model with custom classification head.
    """
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights=weights
    )
    base_model.trainable = False

    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), name="image_input")
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization(name="head_batch_norm")(x)
    x = layers.Dense(
        256,
        activation="relu",
        kernel_regularizer=regularizers.l2(1e-4),
        name="dense_features"
    )(x)
    x = layers.Dropout(0.4, name="dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="classification_output")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="TechCycle_MobileNetV2")
    return model, base_model

# -----------------------------------------------------------------------------
# 6. Main Training & Evaluation Loop
# -----------------------------------------------------------------------------
def train_pipeline(smoke_test=False, epochs_p1=8, epochs_p2=12):
    print("=" * 60)
    print(" TechCycle MobileNetV2 Training Pipeline")
    print(f" Mode: {'SMOKE TEST (1 batch / 1 epoch)' if smoke_test else 'FULL PRODUCTION TRAINING'}")
    print("=" * 60)

    # In smoke test, run on tiny slice
    if smoke_test:
        cur_train_items = train_items[:64]
        cur_val_items = val_items[:32]
        cur_test_items = test_items[:32]
        cur_batch_size = 16
        epochs_p1 = 1
        epochs_p2 = 1
        weights = None  # Don't download weights during smoke test
    else:
        cur_train_items = train_items
        cur_val_items = val_items
        cur_test_items = test_items
        cur_batch_size = BATCH_SIZE
        weights = "imagenet"

    train_ds = create_tf_dataset(cur_train_items, augment=True, shuffle=True, batch_size=cur_batch_size)
    val_ds = create_tf_dataset(cur_val_items, augment=False, shuffle=False, batch_size=cur_batch_size)
    test_ds = create_tf_dataset(cur_test_items, augment=False, shuffle=False, batch_size=cur_batch_size)

    model, base_model = build_mobilenet_model(num_classes=NUM_CLASSES, weights=weights)
    model.summary()

    # --- Phase 1: Feature Extraction Warmup ---
    print("\n>>> Phase 1: Warmup Training of Classification Head (Backbone Frozen) <<<")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.TopKCategoricalAccuracy(k=3, name="top_3_accuracy")]
    )

    callbacks_p1 = [
        EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.2, patience=2, min_lr=1e-6, verbose=1)
    ]

    history_p1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_p1,
        class_weight=class_weight_dict if not smoke_test else None,
        callbacks=callbacks_p1 if not smoke_test else []
    )

    # --- Phase 2: Fine-Tuning Top Convolutional Blocks ---
    print("\n>>> Phase 2: Fine-Tuning Top 30 Layers (BatchNormalization Frozen) <<<")
    base_model.trainable = True

    # Freeze bottom layers and protect all BatchNormalization layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    for layer in base_model.layers[-30:]:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    trainable_count = sum(np.prod(v.shape) for v in model.trainable_variables)
    print(f"[*] Trainable parameters in Phase 2: {trainable_count:,}")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.TopKCategoricalAccuracy(k=3, name="top_3_accuracy")]
    )

    callbacks_p2 = [
        ModelCheckpoint(MODEL_SAVE_PATH, monitor="val_loss", save_best_only=True, verbose=1),
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.2, patience=2, min_lr=1e-7, verbose=1)
    ]

    history_p2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_p2,
        class_weight=class_weight_dict if not smoke_test else None,
        callbacks=callbacks_p2 if not smoke_test else []
    )

    # --- Phase 3: Evaluate on Untouched Test Set ---
    print("\n>>> Phase 3: Independent Evaluation on Untouched Test Split <<<")
    # Collect true labels and predictions
    y_true_list = []
    y_pred_list = []
    for x_b, y_b in test_ds:
        preds = model.predict(x_b, verbose=0)
        y_true_list.extend(np.argmax(y_b.numpy(), axis=1))
        y_pred_list.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true_list)
    y_pred = np.array(y_pred_list)

    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, precision_score, recall_score
    test_acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    macro_prec = precision_score(y_true, y_pred, average="macro", zero_division=0)
    macro_rec = recall_score(y_true, y_pred, average="macro", zero_division=0)

    print(f"[✓] Test Accuracy:     {test_acc * 100:.2f}%")
    print(f"[✓] Macro Precision:   {macro_prec:.4f}")
    print(f"[✓] Macro Recall:      {macro_rec:.4f}")
    print(f"[✓] Macro F1-Score:    {macro_f1:.4f}")
    print(f"[✓] Weighted F1-Score: {weighted_f1:.4f}")

    test_metrics = {
        "accuracy": float(test_acc),
        "macro_precision": float(macro_prec),
        "macro_recall": float(macro_rec),
        "macro_f1": float(macro_f1),
        "weighted_f1": float(weighted_f1)
    }

    if not smoke_test:
        # Save detailed classification report and confusion matrix
        target_names = [idx_to_class[i] for i in range(NUM_CLASSES)]
        report_dict = classification_report(y_true, y_pred, target_names=target_names, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_true, y_pred).tolist()

        eval_results = {
            "metrics": test_metrics,
            "classification_report": report_dict,
            "confusion_matrix": cm
        }
        eval_path = os.path.join(REPORTS_DIR, "test_evaluation_report.json")
        with open(eval_path, "w", encoding="utf-8") as f:
            json.dump(eval_results, f, indent=2)
        print(f"[✓] Saved test evaluation report to {eval_path}")

        # Save model formats
        model.save(MODEL_SAVE_PATH)
        print(f"[✓] Saved model to {MODEL_SAVE_PATH}")
        try:
            model.save(LEGACY_H5_PATH)
            model.save(ROOT_H5_PATH)
            print(f"[✓] Saved legacy compatibility weights to {LEGACY_H5_PATH} and {ROOT_H5_PATH}")
        except Exception as e:
            print(f"[!] Warning saving H5 format: {e}")

        # Save training metadata configuration
        config_data = {
            "model_name": "MobileNetV2_TransferLearning",
            "num_classes": NUM_CLASSES,
            "image_size": list(IMG_SIZE),
            "batch_size": BATCH_SIZE,
            "phase1_epochs_trained": len(history_p1.history.get("loss", [])),
            "phase2_epochs_trained": len(history_p2.history.get("loss", [])),
            "test_evaluation": test_metrics,
            "leak_free_split": True,
            "class_weighting": True
        }
        with open(CONFIG_SAVE_PATH, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=2)
        print(f"[✓] Training config metadata saved to {CONFIG_SAVE_PATH}")

    print("\n[✓] Pipeline execution finished successfully!")
    return test_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TechCycle MobileNetV2 Training Script")
    parser.add_argument("--smoke-test", action="store_true", help="Run 1-batch dry run without downloading weights")
    parser.add_argument("--epochs-p1", type=int, default=8, help="Phase 1 warmup epochs")
    parser.add_argument("--epochs-p2", type=int, default=12, help="Phase 2 fine-tuning epochs")
    args = parser.parse_args()

    train_pipeline(
        smoke_test=args.smoke_test,
        epochs_p1=args.epochs_p1,
        epochs_p2=args.epochs_p2
    )
