from flask import request, jsonify
from model import predict_leak, WINDOW_SIZE
from .firebase import get_firestore_client
from firebase_admin import firestore

# Firestore client
db = get_firestore_client()

def create_routes(app):
    """
    Registers all routes to the Flask app.
    """

    @app.route('/predict', methods=['POST'])
    def predict():
        """
        Endpoint to predict leaks based on input values.
        """
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

    @app.route('/send-water-data', methods=['POST'])
    def send_water_data():
        """
        Endpoint to send water flow data to Firestore.
        """
        data = request.json  # Expecting JSON payload
        water_data = data.get('water_flow')  # Array of numbers

        if not water_data or not isinstance(water_data, list):
            return jsonify({"error": "Invalid or missing 'water_flow' data. Must be an array."}), 400

        # Create a Firestore document with the data
        doc_ref = db.collection('daily_water_usage').document()
        doc_ref.set({
            "water_flow": water_data,
            "timestamp": firestore.SERVER_TIMESTAMP  # Store current server time
        })

        return jsonify({"message": "Water flow data saved successfully!"}), 200

    @app.route('/')
    def home():
        """
        Home route.
        """
        return "Welcome to the API!"
