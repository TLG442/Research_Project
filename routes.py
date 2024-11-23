from flask import request, jsonify
from model import predict_leak, WINDOW_SIZE

def create_routes(app):
    """
    Registers all routes to the Flask app.
    """

    @app.route('/predict', methods=['POST'])
    def predict():
        try:
            # Parse input data from the request
            data = request.json
            if not data or 'values' not in data:
                return jsonify({"error": "Invalid input, 'values' key missing."}), 400

            input_values = data['values']

            # Validate input length
            if len(input_values) != WINDOW_SIZE:
                return jsonify({"error": f"Input length must be {WINDOW_SIZE}."}), 400

            # Perform prediction
            result = predict_leak(input_values)
            return jsonify(result)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/')
    def home():
        return "Welcome to the Leak Detection Model API!"
