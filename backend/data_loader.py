import tensorflow as tf
import os

# Define dataset path
dataset_path = r"C:\Users\HP\DebugNChillFinal\DebugNChill\backend\processed_images"

# Load images using ImageDataGenerator
train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,  # Normalize images
    validation_split=0.2  # 80% train, 20% validation
)

# Create Training Set
train_generator = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# Create Validation Set
val_generator = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# Print class labels
print("Classes:", train_generator.class_indices)
