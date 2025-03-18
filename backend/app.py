from venv import logger
from flask import Flask, jsonify, request
import logging
from routes import log_data, get_accumulated_data, get_daily_consumption, predict , log_water_usage , get_water_usage
from lamdas.microgrid_schedule import run_ga_for_day, get_schedule, get_daily_schedule  

app = Flask(__name__)

# Define routes
app.add_url_rule('/log', 'log_data', log_data, methods=['POST'])
app.add_url_rule('/accumulate', 'get_accumulated_data', get_accumulated_data, methods=['GET'])
app.add_url_rule('/accumulate/<date>', 'get_daily_consumption', get_daily_consumption, methods=['GET'])
app.add_url_rule('/predict', 'predict', predict, methods=['POST'])
app.add_url_rule('/log_water', 'log_water_usage', log_water_usage, methods=['POST'])
app.add_url_rule('/get_log_water', 'get_log_water_usage', get_water_usage, methods=['GET'])


# Constants
HEALTH_CHECK_PATH = "/health"
ALL_SCHEDULES_PATH = "/schedules"

# Health Check Endpoint
@app.route(HEALTH_CHECK_PATH, methods=['GET'])
def health_check():
    logger.info("Health check requested")
    return jsonify({"message": "Health Check OK"}), 200

# Get All Schedules Endpoint
@app.route(ALL_SCHEDULES_PATH, methods=['GET'])
def get_schedules():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400
    
    logger.info(f"Fetching schedules for user_id: {user_id}")
    schedules = get_daily_schedule(user_id)
    return jsonify(schedules), 200

# Create Schedule Endpoint
@app.route(ALL_SCHEDULES_PATH, methods=['POST'])
def create_schedule():
    try:
        body = request.get_json()
        user_id = body.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        logger.info(f"Generating 24-hour schedule for user_id: {user_id}")
        run_ga_for_day(user_id)
        return jsonify({"message": f"24-hour schedule created for {user_id}"}), 200
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

# Handle 404 Errors
@app.errorhandler(404)
def resource_not_found(e):
    return jsonify({"error": "Resource Not Found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
