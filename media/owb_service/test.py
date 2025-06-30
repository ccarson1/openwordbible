# import tensorflow as tf
# from tensorflow.python.client import device_lib

# print("TensorFlow:", tf.__version__)
# print("List Physical GPUs:", tf.config.list_physical_devices('GPU'))
# print("Local devices:")
# for device in device_lib.list_local_devices():
#     print(device.name, device.device_type)
    
# from ctypes import cdll
# cdll.LoadLibrary("cudnn64_8.dll")  # Should succeed silently

# import tensorflow as tf
# print(tf.config.list_physical_devices('GPU'))  # Should show your GPU

from transformers import AutoTokenizer, TFAutoModelForTokenClassification
import os

model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
cache_dir = os.path.join("models", "dbmdz-bert-large")

os.makedirs(cache_dir, exist_ok=True)

print("📦 Downloading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=cache_dir)

print("📥 Downloading & converting PyTorch model to TensorFlow...")
model = TFAutoModelForTokenClassification.from_pretrained(
    model_name,
    cache_dir=cache_dir,
    from_pt=True  # Convert from PyTorch
)

# Save model to the snapshot directory
snapshot_dir = os.path.join(
    cache_dir,
    "models--dbmdz--bert-large-cased-finetuned-conll03-english",
    "snapshots"
)

# Get the first (and only) snapshot hash dir
snapshot_hash = os.listdir(snapshot_dir)[0]
final_snapshot_path = os.path.join(snapshot_dir, snapshot_hash)

# Save model in TensorFlow format (this will create tf_model.h5)
print(f"💾 Saving TensorFlow model to {final_snapshot_path} ...")
model.save_pretrained(final_snapshot_path)

print("✅ Done! Model saved as tf_model.h5 in:")
print(final_snapshot_path)