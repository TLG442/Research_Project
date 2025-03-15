import numpy as np
import tensorflow as tf

# Load the model
model = tf.keras.models.load_model('models/smart_meter_model.keras')

def predict_with_model(features):
    try:
        # Convert the input data to a numpy array
        input_data = np.array(features)

        # Reshape the input data to match the model's expected input
        input_data = input_data.reshape((1, input_data.shape[0], 1)) 

        # Predict using the model
        prediction = model.predict(input_data)

        # Return the prediction as a list
        return prediction.tolist()

    except Exception as e:
        raise ValueError(f"Prediction failed: {str(e)}")
