import tensorflow as tf
import numpy as np

# Path to your trained model
MODEL_PATH = "model.keras"  # Update with "model.h5" if using the older format

# Load the model
model = tf.keras.models.load_model(MODEL_PATH)

# Model-specific configurations
WINDOW_SIZE = 50  # Replace with the window size used in training

def predict_leak(input_values):
    """
    Prepares the input and performs prediction using the loaded model.
    """
    # Reshape input to match model's expected shape
    input_values = np.array(input_values, dtype=np.float32).reshape(1, WINDOW_SIZE, 1)

    # Perform prediction
    prediction = model.predict(input_values)
    predicted_class = np.argmax(prediction)  # Multiclass classification
    
    return {
        "predicted_class": int(predicted_class),
        "raw_prediction": prediction.tolist()
    }
