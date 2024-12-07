import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
import joblib

# Load the dataset
print("Loading dataset...")
data = pd.read_csv('location1.csv')

# Convert 'Time' column to datetime
print("Converting 'Time' column to datetime...")
data['Time'] = pd.to_datetime(data['Time'])

# Extract the 'Hour' column and drop 'Date' and 'Time'
print("Extracting 'Hour' column...")
data['Hour'] = data['Time'].dt.hour  # Extract the hour as an integer
data.drop(['Time'], axis=1, inplace=True)  # Drop the 'Time' column

# Encode wind direction as sine and cosine
print("Encoding wind direction as sine and cosine...")
data['sin_wind_10m'] = np.sin(np.radians(data['winddirection_10m']))
data['cos_wind_10m'] = np.cos(np.radians(data['winddirection_10m']))
data['sin_wind_100m'] = np.sin(np.radians(data['winddirection_100m']))
data['cos_wind_100m'] = np.cos(np.radians(data['winddirection_100m']))

# Drop original wind direction columns
print("Dropping original wind direction columns...")
data.drop(['winddirection_10m', 'winddirection_100m'], axis=1, inplace=True)

pd.set_option('display.max_columns', None)

# Separate features (X) and target (y)
print("Separating features and target...")
X = data.drop(['Power'], axis=1)
y = data['Power']

# Print feature names and values before standardization
print("\nFeatures before standardization:")
print(X.head())

# Standardize features
print("\nStandardizing features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Print feature names and values after standardization
print("\nFeatures after standardization:")
scaled_df = pd.DataFrame(X_scaled, columns=X.columns)
print(scaled_df.head())

# Train-test split
print("\nSplitting dataset into training and test sets...")
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# # Hyperparameter tuning with GridSearchCV
print("Starting hyperparameter tuning with GridSearchCV...")
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5, 10]
}

# Set verbose level for GridSearchCV
grid_search = GridSearchCV(RandomForestRegressor(random_state=42), param_grid, cv=5, scoring='neg_mean_squared_error', n_jobs=-1, verbose=3)
grid_search.fit(X_train, y_train)

# Print the best parameters found
print(f"Best Parameters: {grid_search.best_params_}")
best_model = grid_search.best_estimator_

# Evaluate the model
print("Evaluating the model...")
y_pred = best_model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f'RMSE: {rmse}')

# Cross-validation to assess consistency
print("Performing cross-validation...")
cv_scores = cross_val_score(best_model, X_scaled, y, cv=5, scoring='neg_mean_squared_error', n_jobs=-1)
rmse_cv_scores = np.sqrt(-cv_scores)
print(f"Cross-validated RMSE: {rmse_cv_scores.mean()} ± {rmse_cv_scores.std()}")

# Feature importance analysis
print("Analyzing feature importance...")
importances = best_model.feature_importances_
feature_names = X.columns
sorted_indices = np.argsort(importances)[::-1]

print("Feature Importance:")
for idx in sorted_indices:
    print(f"{feature_names[idx]}: {importances[idx]}")

# Save the model and scaler
print("Saving the model and scaler...")
joblib.dump(best_model, 'wind_power_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Process completed successfully!")
