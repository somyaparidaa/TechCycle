import os
import cv2
import numpy as np

# Define paths
dataset_path = r"C:\Users\HP\DebugNChillFinal\DebugNChill\backend\data\images"
output_path = r"C:\Users\HP\DebugNChillFinal\DebugNChill\backend\processed_images"

# Create output directory
os.makedirs(output_path, exist_ok=True)

# Process images
for category in os.listdir(dataset_path):
    category_path = os.path.join(dataset_path, category)
    output_category_path = os.path.join(output_path, category)
    os.makedirs(output_category_path, exist_ok=True)

    for img_name in os.listdir(category_path):
        img_path = os.path.join(category_path, img_name)
        img = cv2.imread(img_path)

        if img is None:
            print(f"Skipping {img_name} (Cannot load)")
            continue

        # Resize to 224x224
        img = cv2.resize(img, (224, 224))

        # Normalize to [0, 1]
        img = img / 255.0

        # Save processed image
        new_img_path = os.path.join(output_category_path, img_name)
        cv2.imwrite(new_img_path, (img * 255).astype(np.uint8))

print("✅ Preprocessing complete! Images are saved in", output_path)
