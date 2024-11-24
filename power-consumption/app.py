from flask import Flask
from routes import log_data, get_accumulated_data, get_daily_consumption

app = Flask(__name__)

# Define routes
app.add_url_rule('/log', 'log_data', log_data, methods=['POST'])
app.add_url_rule('/accumulate', 'get_accumulated_data', get_accumulated_data, methods=['GET'])
app.add_url_rule('/accumulate/<date>', 'get_daily_consumption', get_daily_consumption, methods=['GET'])

if __name__ == '__main__':
    app.run(debug=True)
