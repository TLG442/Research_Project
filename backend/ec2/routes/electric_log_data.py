from flask import request, jsonify
from services.dynamodb_service import put_item
from datetime import datetime

table_name = "PowerConsumption"

def log_data():
    """Route to log energy consumption data."""
    try:
        # Read data from request
        data = request.json
        timestamp = data.get('x_Timestamp', datetime.now().isoformat())
        t_kWh = data['t_kWh']
        avg_voltage = data['z_Avg Voltage (Volt)']
        avg_current = data['z_Avg Current (Amp)']

        # Prepare the item to insert into DynamoDB
        item = {
            'x_Timestamp': {'S': timestamp},
            't_kWh': {'N': str(t_kWh)},
            'z_Avg Voltage (Volt)': {'N': str(avg_voltage)},
            'z_Avg Current (Amp)': {'N': str(avg_current)},
        }

        # Insert the data into DynamoDB
        put_item(table_name, item)

        return jsonify({"message": "Data logged successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
