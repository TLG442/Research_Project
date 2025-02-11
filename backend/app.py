from flask import Flask
from routes import log_data, get_accumulated_data, get_daily_consumption, predict , log_water_usage , get_water_usage

app = Flask(__name__)

# Define routes
app.add_url_rule('/log', 'log_data', log_data, methods=['POST'])
app.add_url_rule('/accumulate', 'get_accumulated_data', get_accumulated_data, methods=['GET'])
app.add_url_rule('/accumulate/<date>', 'get_daily_consumption', get_daily_consumption, methods=['GET'])
app.add_url_rule('/predict', 'predict', predict, methods=['POST'])
app.add_url_rule('/log_water', 'log_water_usage', log_water_usage, methods=['POST'])
app.add_url_rule('/get_log_water', 'get_log_water_usage', get_water_usage, methods=['GET'])
if __name__ == '__main__':
    app.run(debug=True)
