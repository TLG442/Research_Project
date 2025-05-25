import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
const { width, height } = Dimensions.get('window');

// Define dataset keys as a union type
type DatasetKey = 'LO_CC_0.47 LPS_A2' | 'LO_GL_0.18 LPS_A2' | 'LO_OL_0.47 LPS_A2';

// Define datasets type as a record
type Datasets = Record<DatasetKey, number[]>;

const LeakDetails = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>('LO_CC_0.47 LPS_A2');
  const [accelerometerData, setAccelerometerData] = useState({
    status: '',
    category: '',
    severity: '',
    lastUpdated: 'May 15, 2025, 11:00 PM',
  });
  const [accelerometerPrediction, setAccelerometerPrediction] = useState<{
    futureCategory: string;
    confidenceCategory: string;
    futureSeverity: string;
    confidenceSeverity: string;
    predictedTime: string;
    probabilities: { [key: string]: number };
  }>({
    futureCategory: '',
    confidenceCategory: '',
    futureSeverity: '',
    confidenceSeverity: '',
    predictedTime: '',
    probabilities: {
      'CC Leak': 0,
      'Gasket Leak (GL)': 0,
      'LC Leak': 0,
      'No Leak': 0,
    },
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

  // Define datasets with explicit typing
  const datasets: Datasets = {
    'LO_CC_0.47 LPS_A2': [
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
    'LO_GL_0.18 LPS_A2': [
      // Placeholder values (replace with actual data if available)
     -0.001033248, -0.001369904, -0.001158901, -0.001416135, -0.001253734, -0.000879145, -0.000866105, -0.000925376, -0.000749935, -0.000327337, -0.000280514, -0.000201684, -0.000198721, -0.0000944, -0.000167307, -0.000298888, -0.000514039, -0.00000846, 0.0000846, 0.000376795, 0.000194242, -0.0000903, 0.000181203, 0.000631658, 0.000738345, 0.000338269, 0.000497707, 0.000683816, 0.000821916, 0.000344196, 0.001798693, 0.002060075, 0.002134163, 0.002139497, 0.002186321, 0.002352871, 0.002303084, 0.00246667, 0.002680636, 0.00240088, 0.002194619, -0.000638507, -0.000778385, -0.000803279, -0.001032063, -0.000786683, -0.000658659, -0.000330894, -0.000499814, -0.000460696, -0.000300666, 0.00041947, 0.000741901, 0.000482297, 0.000585427, 0.000603208, 0.000548679, 0.000575351, 0.000270108, 0.000191872, 0.000205504, 0.000913192, 0.001969391, 0.00145611, 0.00169734, 0.001742978, 0.0018793, 0.001594802, 0.001294894, 0.00097187, 0.001355943, 0.001176353, 0.003256152, 0.004456971, 0.003876713, 0.003933613, 0.003695346, 0.004217518, 0.004330725, 0.004409554, 0.004231743, 0.004130391, 0.004309387, 0.003491456, 0.002344573, 0.002820515, 0.00244474, 0.002369467, 0.002192841, 0.001668298, 0.001600137, 0.002036367, 0.002327385, 0.002112826, 0.002319087, 0.004953064, 0.0051451, 0.005109538, 0.005606817
    ],
    'LO_OL_0.47 LPS_A2': [
       -0.003161649, -0.003581876, -0.003522013, -0.003506603, -0.002993913, -0.002232289, -0.002515008, -0.002776391, -0.002741421, -0.002983245, -0.003069187, -0.003287302, -0.003247591, -0.003279004, -0.003084004, -0.002347866, -0.002023064, -0.001817396, -0.001803171, -0.001478369, -0.001676332, -0.001698855, -0.002160571, -0.002138641, -0.001906894, -0.000765346, -0.000470179, -0.000601167, -0.000519966, -0.000144784, -0.000512854, -0.000907002, -0.000932488, -0.001006576, -0.001126303, -0.000379495, 0.001611991, 0.001194727, 0.001416991, 0.001520122, 0.001810547, 0.00161851, 0.001534939, 0.001379058, 0.001134864, 0.000830807, 0.001073223, -0.00024673, -0.000547231, -0.00103799, -0.0008584, -0.000957382, -0.000802093, -0.000438173, 2.65E-05, 0.000536825, 0.000197206, 0.000163422, 0.00235702, 0.001757203, 0.001908343, 0.002358205, 0.002441184, 0.002282932, 0.002383099, 0.002151352, 0.002091488, 0.001932644, 0.00230012, 0.001435958, 0.001262888, 0.001271186, 0.000920305, 0.000790503, 0.000574758, 0.000901338, 0.000274257, 0.000839697, 0.001038846, 0.001579392, -0.000573902, -0.001383536, -0.001575572, -0.002360905, -0.002227547, -0.002248884, -0.001751605, -0.002077, -0.001892669, -0.002134492, -0.00157735, -0.000503963, -0.000759419, -0.001083035, -0.001259068, -0.001396576, -0.001680481, -0.001478962 , -0.001478962
    ],
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchAllData();
  }, [navigation, selectedDataset]);

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
        return null;
      } else if (parsedBody.pressure_values && Array.isArray(parsedBody.pressure_values)) {
        return parsedBody.pressure_values;
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
            status: pressureClassifyData.predicted_category !== 'No Leak' ? 'Active' : 'Active',
            category: pressureClassifyData.predicted_category || 'Unknown',
            severity: '15%',
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
            futureSeverity: '30%',
            confidenceSeverity: '85%',
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

      // Accelerometer Classification API call
      const accelClassifyResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/classify_accelerometer_leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: datasets[selectedDataset],
        }),
      });
      const accelClassifyData = await accelClassifyResponse.json();

      console.log(accelClassifyData);

      // Accelerometer Forecast API call
      const accelForecastResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/forecast_accelerometer_leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: datasets[selectedDataset],
        }),
      });
      const accelForecastData = await accelForecastResponse.json();

      // Update Accelerometer state
      setAccelerometerData({
        status: accelClassifyData.predicted_category !== 'No Leak' ? 'Active' : 'Active',
        category: accelClassifyData.predicted_category,
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
        futureCategory: accelForecastData.predicted_category,
        confidenceCategory: `${(accelForecastData.confidence * 100).toFixed(3)}%`,
        futureSeverity: '',
        confidenceSeverity: '80%',
        predictedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        probabilities: accelForecastData.probabilities || {
          'CC Leak': 0,
          'Gasket Leak (GL)': 0,
          'LC Leak': 0,
          'No Leak': 0,
        },
      });
    } catch (error) {
      console.error('Error fetching data:', error);
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
        probabilities: {
          'CC Leak': 0,
          'Gasket Leak (GL)': 0,
          'LC Leak': 0,
          'No Leak': 0,
        },
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

      {/* Dataset Selection Dropdown */}
   

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
              <Text style={styles.detailText}>Last Updated: {accelerometerData.lastUpdated}</Text>
            </View>
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionTitle}>Leak Prediction</Text>
              <Text style={styles.predictionText}>
                Future Category: {accelerometerPrediction.futureCategory}
              </Text>
              <Text style={styles.predictionText}>
                Future Leak Occurrence Confidence: {accelerometerPrediction.confidenceCategory}
              </Text>
              <Text style={styles.predictionText}>
                CC Leak Probability: {((accelerometerPrediction.probabilities['CC Leak'] || 0) * 100).toFixed(3)}%
              </Text>
              <Text style={styles.predictionText}>
                Gasket Leak (GL) Probability: {((accelerometerPrediction.probabilities['Gasket Leak (GL)'] || 0) * 100).toFixed(3)}%
              </Text>
              <Text style={styles.predictionText}>
                LC Leak Probability: {((accelerometerPrediction.probabilities['LC Leak'] || 0) * 100).toFixed(3)}%
              </Text>
              <Text style={styles.predictionText}>
                No Leak Probability: {((accelerometerPrediction.probabilities['No Leak'] || 0) * 100).toFixed(3)}%
              </Text>
              <Text style={styles.predictionText}>Predicted Time: {accelerometerPrediction.predictedTime}</Text>
            </View>
          </LinearGradient>
        </View>

           <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Dataset:</Text>
        <Picker
          selectedValue={selectedDataset}
          onValueChange={(itemValue) => setSelectedDataset(itemValue as DatasetKey)}
          style={styles.picker}
        >
          <Picker.Item label="circumferential crack leak" value="LO_CC_0.47 LPS_A2" />
          <Picker.Item label="No leak" value="LO_GL_0.18 LPS_A2" />
          <Picker.Item label="Orifice leak" value="LO_OL_0.47 LPS_A2" />
        </Picker>
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
  dropdownContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 10,
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