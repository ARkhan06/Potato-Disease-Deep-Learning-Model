from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
import tensorflow as tf

app = FastAPI()

# Add CORS middleware to fix CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load Keras model
MODEL = tf.keras.models.load_model("my_model.keras")

# Class labels (adjust if needed)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]
IMAGE_SIZE = 256   # use the same size you trained on

@app.get("/")
def home():
    return {"message": "API is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Open image
    image = Image.open(file.file).convert("RGB")

    # Just convert to numpy float32 (no resize, no /255)
    img_array = np.array(image, dtype=np.float32)

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)  # shape (1, H, W, 3)

    # Run prediction
    preds = MODEL.predict(img_array, verbose=0)[0]

    # Get chosen class
    chosen_idx = np.argmax(preds)
    chosen_class = CLASS_NAMES[chosen_idx]

    return {
        "predictions": {CLASS_NAMES[i]: float(preds[i]) for i in range(len(CLASS_NAMES))},
        "chosen_class": chosen_class,
        "confidence": float(preds[chosen_idx])
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)