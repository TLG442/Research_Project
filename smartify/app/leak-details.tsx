import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
const { width, height } = Dimensions.get('window');

const LeakDetails = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState({
    status: '',
    category: '',
    severity: '',
    lastUpdated: 'May 15, 2025, 11:00 PM',
  });
  const [accelerometerPrediction, setAccelerometerPrediction] = useState({
    futureCategory: '',
    confidenceCategory: '',
    futureSeverity: '',
    confidenceSeverity: '',
    predictedTime: 'May 16, 2025, 01:00 AM',
  });
  const [pressureData, setPressureData] = useState({
    status: '',
    category: '',
    severity: '',
    lastUpdated: 'May 15, 2025, 11:00 PM',
  });
  const [pressurePrediction, setPressurePrediction] = useState({
    futureCategory: '',
    confidenceCategory: '',
    futureSeverity: '',
    confidenceSeverity: '',
    predictedTime: 'May 16, 2025, 12:00 AM',
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchAllData();
  }, [navigation]);

  const fetchPressuredata = async () => {
    try {
      const response = await fetch('https://oqyqqcdzli.execute-api.eu-north-1.amazonaws.com/dev');
      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      console.log(parsedBody);

      if (parsedBody.message === 'No pressure values found in DynamoDB') {
        setPressureData({
          status: 'No pressure values detected',
          category: '',
          severity: '',
          lastUpdated: new Date().toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }),
        });
        setPressurePrediction({
          futureCategory: '',
          confidenceCategory: '',
          futureSeverity: '',
          confidenceSeverity: '',
          predictedTime: '',
        });
        return null; // Return null to indicate no data for further processing
      } else if (parsedBody.pressure_values && Array.isArray(parsedBody.pressure_values)) {
        return parsedBody.pressure_values; // Return the pressure values for classification and prediction
      } else {
        setPressureData({
          status: 'Invalid pressure data format',
          category: '',
          severity: '',
          lastUpdated: new Date().toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }),
        });
        setPressurePrediction({
          futureCategory: '',
          confidenceCategory: '',
          futureSeverity: '',
          confidenceSeverity: '',
          predictedTime: '',
        });
        return null;
      }
    } catch (error) {
      console.error('Error fetching pressure data:', error);
      setPressureData({
        status: 'Error fetching data',
        category: '',
        severity: '',
        lastUpdated: new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      });
      setPressurePrediction({
        futureCategory: '',
        confidenceCategory: '',
        futureSeverity: '',
        confidenceSeverity: '',
        predictedTime: '',
      });
      return null;
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch pressure data
      const pressureValues = await fetchPressuredata();
      
      if (pressureValues) {
        // Pressure Classification API call
        try {
          const pressureClassifyResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/classify_leak', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: pressureValues,
              topology: 1.0,
              sensor: 1.0,
            }),
          });
          const pressureClassifyData = await pressureClassifyResponse.json();

          setPressureData({
            status: pressureClassifyData.predicted_category !== 'No Leak' ? 'Active' : 'Inactive',
            category: pressureClassifyData.predicted_category || 'Unknown',
            severity: '15%', // Hardcoded to match original
            lastUpdated: new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          });
        } catch (classificationError) {
          console.error('Error classifying pressure data:', classificationError);
          setPressureData({
            status: 'Error processing pressure data',
            category: '',
            severity: '',
            lastUpdated: new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          });
        }

        // Pressure Prediction API call
        try {
          const pressurePredictResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/predict_leak', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: pressureValues,
            }),
          });
          const pressurePredictData = await pressurePredictResponse.json();

          setPressurePrediction({
            futureCategory: pressurePredictData.predicted_category || 'Unknown',
            confidenceCategory: `${(pressurePredictData.confidence * 100).toFixed(0)}%`,
            futureSeverity: '30%', // Hardcoded to match original
            confidenceSeverity: '85%', // Hardcoded to match original
            predictedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          });
        } catch (predictionError) {
          console.error('Error predicting pressure data:', predictionError);
          setPressurePrediction({
            futureCategory: '',
            confidenceCategory: '',
            futureSeverity: '',
            confidenceSeverity: '',
            predictedTime: '',
          });
        }
      }

      // Accelerometer Classification API call (unchanged)
      const accelClassifyResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/classify_accelerometer_leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
            0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1,
            0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2,
            0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3,
            0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4,
            0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5,
            0.7, 0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6,
            0.8, 0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
            0.9, 1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
            1.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 0.7
          ],
        }),
      });
      const accelClassifyData = await accelClassifyResponse.json();

      // Accelerometer Forecast API call (unchanged)
      const accelForecastResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/forecast_accelerometer_leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1,
            0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2,
            0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3,
            0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4,
            0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5,
            0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6,
            0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
            0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
            0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9
          ],
        }),
      });
      const accelForecastData = await accelForecastResponse.json();

      // Update Accelerometer state (unchanged)
      setAccelerometerData({
        status: accelClassifyData.predicted_category !== 'No Leak' ? 'Active' : 'Inactive',
        category: accelClassifyData.predicted_category,
        severity: '5%',
        lastUpdated: new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      });

      setAccelerometerPrediction({
        futureCategory: accelForecastData.predicted_category,
        confidenceCategory: `${(accelForecastData.confidence * 100).toFixed(0)}%`,
        futureSeverity: '15%',
        confidenceSeverity: '80%',
        predictedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only update accelerometer states on general error, as pressure errors are handled in fetchPressuredata
      setAccelerometerData({
        status: 'Error fetching data',
        category: '',
        severity: '',
        lastUpdated: new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      });
      setAccelerometerPrediction({
        futureCategory: '',
        confidenceCategory: '',
        futureSeverity: '',
        confidenceSeverity: '',
        predictedTime: '',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leak Detection Details</Text>
      </View>

      {/* Main Content - Split Screen */}
      <View style={styles.splitContainer}>
        {/* Pressure Sensor Leak Detection */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#d9d8d7', '#d9d8d7']}
            style={styles.gradientBackground}
          >
            <Text style={styles.sectionTitle}>Pressure Sensor Leak Detection</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>Current Status: {pressureData.status}</Text>
              {pressureData.status === 'Active' || pressureData.status === 'Inactive' ? (
                <>
                  <Text style={styles.detailText}>Leak Category: {pressureData.category}</Text>
                  <Text style={styles.detailText}>Severity: {pressureData.severity}</Text>
                  <Text style={styles.detailText}>Last Updated: {pressureData.lastUpdated}</Text>
                </>
              ) : null}
            </View>
            {(pressureData.status === 'Active' || pressureData.status === 'Inactive') && (
              <View style={styles.predictionContainer}>
                <Text style={styles.predictionTitle}>Leak Prediction</Text>
                <Text style={styles.predictionText}>
                  Future Category: {pressurePrediction.futureCategory} ({pressurePrediction.confidenceCategory})
                </Text>
                <Text style={styles.predictionText}>
                  Future Severity: {pressurePrediction.futureSeverity} ({pressurePrediction.confidenceSeverity})
                </Text>
                <Text style={styles.predictionText}>Predicted Time: {pressurePrediction.predictedTime}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Accelerometer Sensor Leak Detection */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#d9d8d7', '#d9d8d7']}
            style={styles.gradientBackground}
          >
            <Text style={styles.sectionTitle}>Accelerometer Sensor Leak Detection</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>Current Status: {accelerometerData.status}</Text>
              <Text style={styles.detailText}>Leak Category: {accelerometerData.category}</Text>
              <Text style={styles.detailText}>Severity: {accelerometerData.severity}</Text>
              <Text style={styles.detailText}>Last Updated: {accelerometerData.lastUpdated}</Text>
            </View>
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionTitle}>Leak Prediction</Text>
              <Text style={styles.predictionText}>
                Future Category: {accelerometerPrediction.futureCategory} ({accelerometerPrediction.confidenceCategory})
              </Text>
              <Text style={styles.predictionText}>
                Future Severity: {accelerometerPrediction.futureSeverity} ({accelerometerPrediction.confidenceSeverity})
              </Text>
              <Text style={styles.predictionText}>Predicted Time: {accelerometerPrediction.predictedTime}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 33,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  splitContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 16,
  },
  gradientBackground: {
    borderRadius: 10,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  predictionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 6,
  },
  predictionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  predictionText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    lineHeight: 16,
  },
});

export default LeakDetails;