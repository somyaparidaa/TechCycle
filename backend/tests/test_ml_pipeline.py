# backend/tests/test_ml_pipeline.py
"""
TechCycle ML Subsystem - Unit and Integration Tests
Tests class mapping integrity, image preprocessing ranges,
and resilient inference error/fallback handling.
"""

import os
import json
import pytest
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
SPLIT_PATH = os.path.join(BASE_DIR, "dataset_split.json")
DATA_DIR = os.path.join(BASE_DIR, "data", "images")


def test_class_labels_count_and_content():
    """Verify that class_labels.json contains exactly 36 classes and zero ghost 'images'."""
    assert os.path.exists(LABELS_PATH), "class_labels.json not found"
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = json.load(f)

    assert len(labels) == 36, f"Expected 36 classes, found {len(labels)}"
    names = [v["name"] for v in labels.values()]
    assert "images" not in names, "Ghost class 'images' detected in class labels!"

    # Verify every class has guidance
    for k, v in labels.items():
        assert "name" in v and len(v["name"]) > 0, f"Class {k} missing name"
        assert "guide" in v and len(v["guide"]) > 10, f"Class {k} missing recycling guidance"


def test_alphabetical_class_ordering():
    """Verify class indices match exact alphabetical sort of physical directories if present."""
    if not os.path.exists(DATA_DIR):
        pytest.skip(f"Physical dataset directory {DATA_DIR} not present in repository (lightweight repo mode)")
    physical_dirs = sorted([
        d for d in os.listdir(DATA_DIR)
        if os.path.isdir(os.path.join(DATA_DIR, d)) and not d.startswith(".")
    ])
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = json.load(f)

    for idx, dir_name in enumerate(physical_dirs):
        assert str(idx) in labels, f"Index {idx} missing in labels"
        assert labels[str(idx)]["name"] == dir_name, (
            f"Index {idx} mismatch: expected {dir_name}, found {labels[str(idx)]['name']}"
        )


def test_dataset_split_accounting_and_leakage():
    """Verify dataset split accounting and zero duplicate leakage."""
    assert os.path.exists(SPLIT_PATH), "dataset_split.json not found"
    with open(SPLIT_PATH, "r", encoding="utf-8") as f:
        split_info = json.load(f)

    train = split_info["splits"]["train"]
    val = split_info["splits"]["val"]
    test = split_info["splits"]["test"]

    total = len(train) + len(val) + len(test)
    assert total == 10989, f"Expected 10989 images, found {total}"

    train_hashes = {item["hash"] for item in train}
    val_hashes = {item["hash"] for item in val}
    test_hashes = {item["hash"] for item in test}

    assert len(train_hashes.intersection(val_hashes)) == 0, "Train-Val hash leakage detected!"
    assert len(train_hashes.intersection(test_hashes)) == 0, "Train-Test hash leakage detected!"
    assert len(val_hashes.intersection(test_hashes)) == 0, "Val-Test hash leakage detected!"


def test_inference_preprocessing_normalization():
    """Verify input normalization scales strictly between [-1.0, 1.0]."""
    try:
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    except (ImportError, ModuleNotFoundError):
        from keras.applications.mobilenet_v2 import preprocess_input

    dummy_pixels = np.linspace(0, 255, num=224 * 224 * 3, dtype=np.float32).reshape((1, 224, 224, 3))
    processed = preprocess_input(dummy_pixels)

    assert processed.shape == (1, 224, 224, 3)
    assert processed.min() >= -1.0, f"Expected min >= -1.0, got {processed.min()}"
    assert processed.max() <= 1.0, f"Expected max <= 1.0, got {processed.max()}"


def test_predict_component_fallback_mode(tmp_path):
    """Verify predict_component returns clean structured response even in fallback mode."""
    import sys
    sys.path.insert(0, BASE_DIR)
    from predict_component import predict_image

    # Create a small valid test JPEG
    test_img_path = tmp_path / "test_part.jpg"
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    img.save(test_img_path)

    result = predict_image(str(test_img_path))
    assert isinstance(result, dict), "Result must be a dictionary"
    assert "prediction" in result, "Result missing 'prediction'"
    assert "confidence" in result, "Result missing 'confidence'"
    assert "recycling_guide" in result, "Result missing 'recycling_guide'"
    assert result.get("status") in ["success", "fallback", "model_unavailable"]
