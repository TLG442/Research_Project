


from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np

app = Flask(__name__)

# Load your trained model
MODEL_PATH = "model.keras"  # Replace with "model.h5" if using the older format
model = tf.keras.models.load_model(MODEL_PATH)

# Define the input shape for the model
WINDOW_SIZE = 50  # Replace this with the window size used in your model

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Parse input data from the request
        data = request.json
        if not data or 'values' not in data:
            return jsonify({"error": "Invalid input, 'values' key missing."}), 400
        
        input_values = np.array(data['values'], dtype=np.float32)
        
        
        print(input_values)
        # Ensure the input is reshaped to match the model's expected shape
        # if len(input_values) != WINDOW_SIZE:
        #     return jsonify({"error": f"Input length must be {WINDOW_SIZE}."}), 400
        
        input_values = input_values.reshape(1, WINDOW_SIZE, 1)  # Batch size of 1

        # Perform prediction
        prediction = model.predict(input_values)
        predicted_class = np.argmax(prediction)  # For multiclass classification

        return jsonify({
            "predicted_class": int(predicted_class),
            "raw_prediction": prediction.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "Welcome to the Leak Detection Model API!"

if __name__ == '__main__':
    app.run(debug=True)
