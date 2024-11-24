from flask import Flask
from routes.routes import create_routes

# Initialize Flask app
app = Flask(__name__)

# Register routes
create_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
