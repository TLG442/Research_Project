from flask import jsonify
from services.dynamodb_service import scan_table

table_name = "PowerConsumption"

def get_daily_consumption(date):
    """Route to get daily total consumption for a specific day."""
    try:
        items = scan_table(table_name)

        # Extract the date from x_Timestamp and filter records for the given date
        total_kWh = 0
        for item in items:
            timestamp = item['x_Timestamp']['S']
            record_date = timestamp.split('T')[0]  # Get the date part of the timestamp
            
            if record_date == date:
                total_kWh += float(item['t_kWh']['N'])

        return jsonify({
            "date": date,
            "total_kWh": total_kWh
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
