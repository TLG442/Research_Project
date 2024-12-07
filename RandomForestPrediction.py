import pandas as pd
import requests
import numpy as np
import joblib
from datetime import datetime

# Load the trained model and scaler
model = joblib.load('wind_power_model.pkl')
scaler = joblib.load('scaler.pkl')


# Function to fetch weather data from OpenWeatherMap API
def get_weather_data(api_key, lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}"

    response = requests.get(url)
    data = response.json()

    if data["cod"] == "200":
        wind_speed = data["list"][0]["wind"]["speed"]  # Wind speed in m/s
        wind_direction_10m = data["list"][0]["wind"]["deg"]  # Wind direction at 10m
        wind_direction_100m = data["list"][0]["wind"]["deg"]  # Wind direction at 100m
        wind_gusts = data["list"][0]["wind"].get("gust", None)  # Wind gusts in m/s (optional)
        current_hour = datetime.now().hour  # Current hour of the day
        temperature = data["list"][0]["main"]["temp"] - 273.15  # Temperature in Celsius
        humidity = data["list"][0]["main"]["humidity"]  # Humidity percentage

        return {
            "wind_speed": wind_speed,
            "wind_direction_10m": wind_direction_10m,
            "wind_direction_100m": wind_direction_100m,
            "wind_gusts": wind_gusts,
            "hour": current_hour,
            "temperature": temperature,
            "humidity": humidity
        }
    else:
        print(f"Error fetching data: {data['message']}")
        return None


# Example city coordinates for Kandy, Sri Lanka
lat = 7.17
lon = 80.38
api_key = "258a66e060386b1c1f1117bd0f830107"  # Replace with your OpenWeatherMap API key

# Fetch weather data
weather_data = get_weather_data(api_key, lat, lon)

if weather_data:
    windspeed_100m = weather_data["wind_speed"] + 2
    windspeed_10m = weather_data["wind_speed"]
    wind_direction_10m = weather_data["wind_direction_10m"]
    wind_direction_100m = weather_data["wind_direction_100m"]
    Hour = weather_data["hour"]
    temperature_2m = weather_data["temperature"]
    relativehumidity_2m = weather_data["humidity"]
    windgusts_10m = weather_data["wind_gusts"]

    # Provide a custom dew point (in Celsius)
    dewpoint_2m = 75  # Custom dew point, set it to your desired value

    # Print the weather data
    print(f"Hour: {Hour}")
    print(f"Temperature: {temperature_2m} °C")
    print(f"Humidity: {relativehumidity_2m} %")
    print(f"Wind Speed 10m: {windspeed_10m} m/s")
    print(f"Wind Speed 100m: {windspeed_100m} m/s")
    print(f"Wind Direction (10m): {wind_direction_10m}°")
    print(f"Wind Direction (100m): {wind_direction_100m}°")
    print(f"wind gusts: {windgusts_10m} °m/s")  # Display custom dew point
    print(f"Dew Point: {dewpoint_2m} °F")  # Display custom dew point

    # Encode wind direction as sine and cosine (as done in training)
    sin_wind_10m = np.sin(np.radians(wind_direction_10m))
    cos_wind_10m = np.cos(np.radians(wind_direction_10m))
    sin_wind_100m = np.sin(np.radians(wind_direction_100m))
    cos_wind_100m = np.cos(np.radians(wind_direction_100m))

    # Features should be ordered exactly as used in training
    columns = ['temperature_2m', 'relativehumidity_2m', 'dewpoint_2m', 'windspeed_10m',
               'windspeed_100m', 'windgusts_10m', 'Hour', 'sin_wind_10m', 'cos_wind_10m',
               'sin_wind_100m', 'cos_wind_100m']

    # Features before standardization (from weather data)
    features = np.array([[temperature_2m, relativehumidity_2m, dewpoint_2m, windspeed_10m,
                          windspeed_100m, windgusts_10m, Hour, sin_wind_10m, cos_wind_10m,
                          sin_wind_100m, cos_wind_100m]])

    # Ensure the features DataFrame is created with the correct order of columns
    features_df = pd.DataFrame(features, columns=columns)

    # Standardize the features using the same scaler
    features_scaled = scaler.transform(features_df)

    # Make prediction
    predicted_power = model.predict(features_scaled)
    print(f"Predicted wind power: {predicted_power[0]}")

else:
    print("Could not retrieve weather data.")
