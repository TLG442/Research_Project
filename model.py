import tensorflow as tf
import numpy as np

# Paths to models
CLASSIFICATION_MODEL_PATH = "classify.keras"
FORECAST_MODEL_PATH = "Regression.keras"

# Load models
classification_model = tf.keras.models.load_model(CLASSIFICATION_MODEL_PATH)
forecast_model = tf.keras.models.load_model(FORECAST_MODEL_PATH)

# Model-specific configurations
WINDOW_SIZE = 50

def predict_leak(input_values):
    """
    Prepares the input and performs prediction using the classification model.
    """
    input_values = np.array(input_values, dtype=np.float32).reshape(1, WINDOW_SIZE, 1)

    # Perform prediction using the classification model
    prediction = classification_model.predict(input_values)
    predicted_class = np.argmax(prediction)  # Multiclass classification

    return {
        "predicted_class": int(predicted_class),
        "raw_prediction": prediction.tolist()
    }

def predict_forecast(input_values):
    """
    Prepares the input and performs prediction using the forecast model.
    Assumes that input_values are already in the required format (normalized if needed).
    """
    try:
        # Reshape the input for LSTM model if necessary
        input_values = np.array(input_values, dtype=np.float32).reshape(1, WINDOW_SIZE, 1)

        # Perform prediction using the forecast model
        predicted_value = forecast_model.predict(input_values)

        # Return the raw predicted value
        return {
            "predicted_value": float(predicted_value[0][0])  # Convert to float for JSON compatibility
        }

    except Exception as e:
        return {"error": str(e)}

