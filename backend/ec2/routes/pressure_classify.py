from flask import request, jsonify
from services.pressure_classify_model_service import predict_with_model, WINDOW_SIZE


def classify_leak():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract input parameters
        values = data.get('values')
        topology = float(data.get('topology', 0.0))
        sensor = float(data.get('sensor', 0.0))

        # Validate input
        if not values or len(values) != WINDOW_SIZE:
            return jsonify({'error': f'Expected {WINDOW_SIZE} values, got {len(values) if values else 0}'}), 400

        # Call the service to make a prediction
        predicted_category = predict_with_model(values, topology, sensor)

        return jsonify({
            'status': 'success',
            'predicted_category': str(predicted_category)
        })

    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500