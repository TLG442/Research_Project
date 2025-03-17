import joblib
import pandas as pd
import numpy as np
from scipy.stats import skew, kurtosis
import warnings
import os

MODEL_PATH = 'models/pressure_classify_model.pkl'
SCALER_PATH = 'models/pressure_classify_scaler.pkl'

EXPECTED_COLUMNS = [
    'Mean', 'Std', 'Min', 'Max', 'Skewness', 'Kurtosis', 'PeakToPeak', 'Median',
    'Mode', 'FirstQuartile', 'ThirdQuartile', 'RootMeanSquare', 'RootSumSquares',
    'PeakToRMS', 'Variance', 'PeakPosition', 'FFT_Mean', 'FFT_Std', 'FFT_Min',
    'FFT_Max', 'FFT_Skewness', 'FFT_Kurtosis', 'FFT_PeakToPeak', 'FFT_Median',
    'FFT_Mode', 'FFT_PeakPosition', 'MeanFrequency', 'Topology_LO', 'Sensor_P1',
    'Sensor_P2'
]

NUMERIC_FEATURES = [
    'Mean', 'Std', 'Min', 'Max', 'Skewness', 'Kurtosis', 'PeakToPeak', 'Median',
    'Mode', 'FirstQuartile', 'ThirdQuartile', 'RootMeanSquare', 'RootSumSquares',
    'PeakToRMS', 'Variance', 'PeakPosition', 'FFT_Mean', 'FFT_Std', 'FFT_Min',
    'FFT_Max', 'FFT_Skewness', 'FFT_Kurtosis', 'FFT_PeakToPeak', 'FFT_Median',
    'FFT_Mode', 'FFT_PeakPosition', 'MeanFrequency'
]

CATEGORICAL_FEATURES = ['Topology', 'Sensor']

WINDOW_DURATION_SECONDS = 0.004
SAMPLING_RATE = 24936.80
WINDOW_SIZE = int(WINDOW_DURATION_SECONDS * SAMPLING_RATE)  # 99

if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    print(f"Error: Missing required files: {MODEL_PATH} or {SCALER_PATH}")
    model, scaler = None, None
else:
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Model and scaler loaded successfully!")
        print("Expected columns:", EXPECTED_COLUMNS)
        print("Model feature names:", model.feature_names_in_.tolist())
    except Exception as e:
        print(f"Error loading model or scaler: {e}")
        model, scaler = None, None

def extract_features_per_window(values, topology, sensor):
    features = {}
    features['Mean'] = np.mean(values)
    features['Std'] = np.std(values)
    features['Min'] = np.min(values)
    features['Max'] = np.max(values)
    features['Skewness'] = skew(values)
    features['Kurtosis'] = kurtosis(values)
    features['PeakToPeak'] = np.ptp(values)
    features['Median'] = np.median(values)
    features['Mode'] = pd.Series(values).mode()[0] if not pd.Series(values).mode().empty else np.nan
    features['FirstQuartile'] = np.percentile(values, 25)
    features['ThirdQuartile'] = np.percentile(values, 75)
    features['RootMeanSquare'] = np.sqrt(np.mean(values ** 2))
    features['RootSumSquares'] = np.sqrt(np.sum(values ** 2))
    features['PeakToRMS'] = features['PeakToPeak'] / features['RootMeanSquare'] if features['RootMeanSquare'] != 0 else np.nan
    features['Variance'] = np.var(values)
    features['PeakPosition'] = np.argmax(values)
    fft_values = np.abs(np.fft.fft(values))
    freqs = np.fft.fftfreq(len(values))
    features['FFT_Mean'] = np.mean(fft_values)
    features['FFT_Std'] = np.std(fft_values)
    features['FFT_Min'] = np.min(fft_values)
    features['FFT_Max'] = np.max(fft_values)
    features['FFT_Skewness'] = skew(fft_values)
    features['FFT_Kurtosis'] = kurtosis(fft_values)
    features['FFT_PeakToPeak'] = np.ptp(fft_values)
    features['FFT_Median'] = np.median(fft_values)
    features['FFT_Mode'] = pd.Series(fft_values).mode()[0] if not pd.Series(fft_values).mode().empty else np.nan
    features['FFT_PeakPosition'] = np.argmax(fft_values)
    features['MeanFrequency'] = np.mean(freqs)
    features['Topology'] = topology
    features['Sensor'] = sensor
    return pd.Series(features)

def predict_with_model(values, topology, sensor):
    if model is None or scaler is None:
        raise Exception('Model or scaler not loaded. Check server logs.')
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        features = extract_features_per_window(np.array(values), topology, sensor)
    feature_df = pd.DataFrame([features])
    X_numeric = feature_df[NUMERIC_FEATURES].copy()
    X_categorical = feature_df[CATEGORICAL_FEATURES].copy()
    X_scaled_numeric = pd.DataFrame(scaler.transform(X_numeric), columns=NUMERIC_FEATURES, index=X_numeric.index)
    X_categorical_encoded = pd.DataFrame(0, index=[0], columns=['Topology_LO', 'Sensor_P1', 'Sensor_P2'])
    if topology == 1.0:
        X_categorical_encoded['Topology_LO'] = 1
    if sensor == 1.0:
        X_categorical_encoded['Sensor_P1'] = 1
    elif sensor == 2.0:
        X_categorical_encoded['Sensor_P2'] = 1
    X_scaled = pd.concat([X_scaled_numeric, X_categorical_encoded], axis=1)
    X_scaled = X_scaled.reindex(columns=EXPECTED_COLUMNS, fill_value=0)
    missing_features = [col for col in model.feature_names_in_ if col not in X_scaled.columns]
    if missing_features:
        print("Missing features in X_scaled:", missing_features)
    extra_features = [col for col in X_scaled.columns if col not in model.feature_names_in_]
    if extra_features:
        print("Extra features in X_scaled:", extra_features)
    prediction = model.predict(X_scaled)
    return prediction[0]