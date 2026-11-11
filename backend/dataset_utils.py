# backend/dataset_utils.py
"""
TechCycle ML Subsystem - Dataset Audit, Validation, and Partitioning Utilities
Handles hash-based duplicate detection, class imbalance computation,
and grouped stratified 70/15/15 train/val/test splitting to prevent data leakage.
"""

import os
import json
import hashlib
import random
from collections import defaultdict
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "data", "images")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
MODELS_DIR = os.path.join(BASE_DIR, "models")
CLASS_LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
SPLIT_PATH = os.path.join(BASE_DIR, "dataset_split.json")
AUDIT_REPORT_PATH = os.path.join(REPORTS_DIR, "dataset_audit.json")

# ---------------------------------------------------------------------------
# Default Recycling Guidance per verified component
# ---------------------------------------------------------------------------
RECYCLING_GUIDES = {
    "Bypass-capacitor": "Can be recycled at e-waste centers. May contain harmful dielectric materials—do not dispose in regular trash.",
    "Electrolytic-capacitor": "Contains liquid/gel electrolytes—handle carefully and recycle at specialized e-waste facilities.",
    "Integrated-micro-circuit": "Should be removed from circuit boards and sent to certified electronic refining plants.",
    "LED": "Do not throw in trash. Recycle at e-waste facility. May contain trace amounts of gallium, arsenic, or lead.",
    "PNP-transistor": "Contains semiconductors. Recycle with other discrete electronics or at e-waste drop-offs.",
    "armature": "High scrap metal content (copper windings, steel shaft). Recycle at metal recovery or e-waste yards.",
    "attenuator": "May contain resistive carbon or ceramic materials—send to e-waste recycling.",
    "cartridge-fuse": "Contains metal alloy filaments and glass/ceramic cartridges. Recycle through specialized facilities.",
    "clip-lead": "Metal and PVC/rubber components—sanitize and reuse if intact, otherwise route to cable recycling.",
    "electric-relay": "Contains copper coils, silver contact points, and plastics. Recycle responsibly for precious metals.",
    "filament": "Typically found in specialized vacuum or incandescent equipment—recycle through lighting programs.",
    "heat-sink": "Made of extruded aluminum or copper—valuable scrap metal. Highly recyclable at metal scrap facilities.",
    "induction-coil": "Contains high-purity enameled copper wire. Extract and recycle for copper reclamation.",
    "jumper-cable": "Reusable wire harnesses. If damaged, strip for insulated copper wire recycling.",
    "junction-transistor": "Semiconductor device. Group with silicon-based components for e-waste processing.",
    "light-circuit": "Printed circuit sub-assembly—the entire sub-board should be sent to PCB refining.",
    "limiter-clipper": "Circuit wave-shaping network—recycle alongside PCB waste streams.",
    "local-oscillator": "RF oscillator module—handle with PCB waste or salvage quartz crystal resonators.",
    "memory-chip": "Contains precious metals (gold wire bonding, copper). Certified e-waste refiners can reclaim metals.",
    "microchip": "Silicon IC with packaging—do not throw in municipal trash. Recycle with e-waste.",
    "microprocessor": "High value CPU—refine for gold, silver, and copper recovery with professional electronic recyclers.",
    "multiplexer": "Logic/analog IC switch—route to electronic scrap sorting.",
    "omni-directional-antenna": "Inspect for physical reuse. Broken antennas should be recycled for brass/copper/aluminum.",
    "potential-divider": "Resistive network—recycle with PCB scrap.",
    "potentiometer": "Variable resistor. Test for reuse or recycle for copper wipers and resistive tracks.",
    "pulse-generator": "Timing/pulse module—recycle with small electronic assemblies.",
    "relay": "Electromechanical switch containing copper coil and contacts—disassemble or recycle at e-waste facility.",
    "rheostat": "Heavy-duty variable wirewound resistor—salvage ceramic core and nickel-chromium or copper resistance wire.",
    "semi-conductor": "General semiconductor package—recycle at specialized e-waste electronic plants.",
    "semiconductor-diode": "Small two-terminal semiconductor—recycle as part of board-level e-waste.",
    "shunt": "Precision low-resistance current sensor (often manganin or brass)—valuable alloy recycling.",
    "solenoid": "Contains heavy copper wire electromagnetic coil—recycle for copper and ferrous core recovery.",
    "stabilizer": "Power regulation unit with transformers and control boards—drop off at bulk e-waste collection points.",
    "step-down-transformer": "Heavy transformer—recycle for iron laminations and primary/secondary copper windings.",
    "step-up-transformer": "High-voltage transformer—do not scrap in general trash. Recycle for copper and silicon steel.",
    "transistor": "General transistor package—recycle with electronic components."
}


def compute_file_hash(filepath, block_size=65536):
    """Computes MD5 hash of an image file."""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        buf = f.read(block_size)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(block_size)
    return hasher.hexdigest()


def audit_dataset(dataset_dir=DATASET_DIR):
    """
    Performs complete audit of the dataset directory.
    Validates images, detects duplicates, detects inter-class collisions,
    and returns audit statistics.
    """
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    categories = sorted([
        d for d in os.listdir(dataset_dir)
        if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith(".")
    ])

    audit = {
        "dataset_path": os.path.abspath(dataset_dir),
        "total_categories": len(categories),
        "categories": categories,
        "class_counts": {},
        "corrupted_images": [],
        "hash_to_files": defaultdict(list),
        "duplicate_groups": {},
        "inter_class_duplicates": {},
        "intra_class_duplicates": {},
        "image_extensions": set(),
        "resolutions_sample": set()
    }

    total_images = 0
    for cat in categories:
        cat_path = os.path.join(dataset_dir, cat)
        files = sorted([f for f in os.listdir(cat_path) if not f.startswith(".")])
        audit["class_counts"][cat] = len(files)
        total_images += len(files)

        for filename in files:
            img_path = os.path.join(cat_path, filename)
            rel_path = os.path.relpath(img_path, BASE_DIR)
            ext = os.path.splitext(filename)[1].lower()
            audit["image_extensions"].add(ext)

            # Validate readability with PIL
            try:
                with Image.open(img_path) as img:
                    img.verify()
                if len(audit["resolutions_sample"]) < 20:
                    with Image.open(img_path) as img:
                        audit["resolutions_sample"].add(f"{img.size[0]}x{img.size[1]}")
            except Exception as e:
                audit["corrupted_images"].append({"path": rel_path, "error": str(e)})
                continue

            file_hash = compute_file_hash(img_path)
            audit["hash_to_files"][file_hash].append((rel_path, cat))

    audit["total_images"] = total_images
    audit["image_extensions"] = sorted(list(audit["image_extensions"]))
    audit["resolutions_sample"] = sorted(list(audit["resolutions_sample"]))

    # Analyze duplicates
    for file_hash, records in audit["hash_to_files"].items():
        if len(records) > 1:
            classes_in_group = {rec[1] for rec in records}
            paths = [rec[0] for rec in records]
            audit["duplicate_groups"][file_hash] = {
                "count": len(records),
                "classes": sorted(list(classes_in_group)),
                "paths": paths
            }
            if len(classes_in_group) > 1:
                audit["inter_class_duplicates"][file_hash] = {
                    "classes": sorted(list(classes_in_group)),
                    "paths": paths
                }
            else:
                audit["intra_class_duplicates"][file_hash] = {
                    "class": list(classes_in_group)[0],
                    "paths": paths
                }

    # Summary metrics
    audit["summary"] = {
        "total_images": total_images,
        "valid_images": total_images - len(audit["corrupted_images"]),
        "corrupted_images_count": len(audit["corrupted_images"]),
        "unique_hashes": len(audit["hash_to_files"]),
        "total_duplicate_hashes": len(audit["duplicate_groups"]),
        "inter_class_duplicate_hashes": len(audit["inter_class_duplicates"]),
        "intra_class_duplicate_hashes": len(audit["intra_class_duplicates"]),
        "min_class": min(audit["class_counts"].items(), key=lambda x: x[1]),
        "max_class": max(audit["class_counts"].items(), key=lambda x: x[1]),
        "imbalance_ratio": round(
            max(audit["class_counts"].values()) / max(1, min(audit["class_counts"].values())), 2
        )
    }

    # Clean hash_to_files for serializability
    del audit["hash_to_files"]

    return audit


def create_grouped_stratified_split(
    dataset_dir=DATASET_DIR,
    train_ratio=0.70,
    val_ratio=0.15,
    test_ratio=0.15,
    seed=42
):
    """
    Creates a leak-free 70/15/15 dataset split.
    All duplicate images (sharing the same MD5 hash) are assigned as an indivisible
    group to the SAME split, preventing inter-split data leakage.
    Within hash groups, classes are stratified to preserve class distribution.
    """
    random.seed(seed)
    categories = sorted([
        d for d in os.listdir(dataset_dir)
        if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith(".")
    ])

    # 1. Group all files by hash
    hash_to_files = defaultdict(list)
    for cat in categories:
        cat_dir = os.path.join(dataset_dir, cat)
        for fname in sorted(os.listdir(cat_dir)):
            if fname.startswith("."):
                continue
            fpath = os.path.join(cat_dir, fname)
            rel_path = os.path.relpath(fpath, BASE_DIR)
            h = compute_file_hash(fpath)
            hash_to_files[h].append((rel_path, cat))

    # 2. Assign primary class to each hash group (using majority class in group)
    class_to_hash_groups = defaultdict(list)
    for h, items in hash_to_files.items():
        # items is list of (rel_path, cat)
        cats = [it[1] for it in items]
        primary_cat = max(set(cats), key=cats.count)
        class_to_hash_groups[primary_cat].append((h, items))

    splits = {
        "train": [],
        "val": [],
        "test": []
    }
    split_class_counts = {
        "train": defaultdict(int),
        "val": defaultdict(int),
        "test": defaultdict(int)
    }

    # 3. Stratify by primary class across hash groups
    for cat, groups in sorted(class_to_hash_groups.items()):
        random.shuffle(groups)
        n = len(groups)
        n_train = int(round(n * train_ratio))
        n_val = int(round(n * val_ratio))
        # Ensure at least 1 in val and test if group has >= 3 items
        if n >= 3:
            n_train = max(1, n_train)
            n_val = max(1, n_val)
            if n_train + n_val >= n:
                n_train = n - 2
                n_val = 1

        train_groups = groups[:n_train]
        val_groups = groups[n_train:n_train + n_val]
        test_groups = groups[n_train + n_val:]

        for h, items in train_groups:
            for rel_path, c in items:
                splits["train"].append({"path": rel_path, "class": c, "hash": h})
                split_class_counts["train"][c] += 1

        for h, items in val_groups:
            for rel_path, c in items:
                splits["val"].append({"path": rel_path, "class": c, "hash": h})
                split_class_counts["val"][c] += 1

        for h, items in test_groups:
            for rel_path, c in items:
                splits["test"].append({"path": rel_path, "class": c, "hash": h})
                split_class_counts["test"][c] += 1

    # 4. Verify ZERO hash overlap between splits
    train_hashes = {item["hash"] for item in splits["train"]}
    val_hashes = {item["hash"] for item in splits["val"]}
    test_hashes = {item["hash"] for item in splits["test"]}

    overlap_train_val = train_hashes.intersection(val_hashes)
    overlap_train_test = train_hashes.intersection(test_hashes)
    overlap_val_test = val_hashes.intersection(test_hashes)

    assert len(overlap_train_val) == 0, f"Hash leakage between train and val: {len(overlap_train_val)}"
    assert len(overlap_train_test) == 0, f"Hash leakage between train and test: {len(overlap_train_test)}"
    assert len(overlap_val_test) == 0, f"Hash leakage between val and test: {len(overlap_val_test)}"

    split_metadata = {
        "seed": seed,
        "target_ratios": {"train": train_ratio, "val": val_ratio, "test": test_ratio},
        "total_samples": len(splits["train"]) + len(splits["val"]) + len(splits["test"]),
        "split_sizes": {
            "train": len(splits["train"]),
            "val": len(splits["val"]),
            "test": len(splits["test"])
        },
        "split_percentages": {
            "train": round(len(splits["train"]) / (len(splits["train"]) + len(splits["val"]) + len(splits["test"])) * 100, 2),
            "val": round(len(splits["val"]) / (len(splits["train"]) + len(splits["val"]) + len(splits["test"])) * 100, 2),
            "test": round(len(splits["test"]) / (len(splits["train"]) + len(splits["val"]) + len(splits["test"])) * 100, 2),
        },
        "leakage_verification": {
            "train_val_hash_overlap": len(overlap_train_val),
            "train_test_hash_overlap": len(overlap_train_test),
            "val_test_hash_overlap": len(overlap_val_test),
            "status": "PASSED_ZERO_LEAKAGE"
        },
        "splits": splits
    }

    return split_metadata


def generate_class_labels_json(dataset_dir=DATASET_DIR):
    """
    Generates canonical class_labels.json directly from filesystem categories.
    Guarantees consistent 0..35 indices and associates verified recycling advice.
    """
    categories = sorted([
        d for d in os.listdir(dataset_dir)
        if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith(".")
    ])

    labels_data = {}
    for idx, cat in enumerate(categories):
        guide = RECYCLING_GUIDES.get(
            cat,
            "Recycle through certified electronic waste drop-off facilities. Dispose of hazardous parts safely."
        )
        labels_data[str(idx)] = {
            "name": cat,
            "guide": guide
        }

    return labels_data


if __name__ == "__main__":
    print("[*] Running TechCycle dataset audit and split generation...")

    # 1. Audit
    audit_data = audit_dataset()
    os.makedirs(REPORTS_DIR, exist_ok=True)
    with open(AUDIT_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2)
    print(f"[✓] Saved audit report to {AUDIT_REPORT_PATH}")
    print(f"    - Total images: {audit_data['summary']['total_images']}")
    print(f"    - Categories: {audit_data['total_categories']}")
    print(f"    - Unique hashes: {audit_data['summary']['unique_hashes']}")
    print(f"    - Inter-class duplicates: {audit_data['summary']['inter_class_duplicate_hashes']}")

    # 2. Canonical class labels
    labels_dict = generate_class_labels_json()
    with open(CLASS_LABELS_PATH, "w", encoding="utf-8") as f:
        json.dump(labels_dict, f, indent=2)
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(os.path.join(MODELS_DIR, "class_labels.json"), "w", encoding="utf-8") as f:
        json.dump(labels_dict, f, indent=2)
    print(f"[✓] Saved canonical class labels to {CLASS_LABELS_PATH} and {MODELS_DIR}/class_labels.json")

    # 3. Stratified group split
    split_info = create_grouped_stratified_split()
    with open(SPLIT_PATH, "w", encoding="utf-8") as f:
        json.dump(split_info, f, indent=2)
    print(f"[✓] Saved leak-free dataset split to {SPLIT_PATH}")
    print(f"    - Train: {split_info['split_sizes']['train']} ({split_info['split_percentages']['train']}%)")
    print(f"    - Val:   {split_info['split_sizes']['val']} ({split_info['split_percentages']['val']}%)")
    print(f"    - Test:  {split_info['split_sizes']['test']} ({split_info['split_percentages']['test']}%)")
    print(f"    - Leakage verification: {split_info['leakage_verification']['status']}")

