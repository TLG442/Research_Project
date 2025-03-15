from flask import request, jsonify
from services.electric_model_service import predict_with_model

def predict():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Check if 'features' is provided in the request
        if 'features' not in data:
            return jsonify({"error": "No input data provided"}), 400

        # Call the service to make a prediction
        prediction = predict_with_model(data['features'])

        # Return the prediction in JSON format
        return jsonify({'prediction': prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
