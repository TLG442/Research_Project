from flask import jsonify
from services.dynamodb_service import scan_table

table_name = "PowerConsumption"


def get_accumulated_data():
    """Route to get accumulated data from DynamoDB."""
    try:
        items = scan_table(table_name)
        total_kWh = sum(float(item['t_kWh']['N']) for item in items)

        return jsonify({
            "total_kWh": total_kWh,
            "records": items
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

