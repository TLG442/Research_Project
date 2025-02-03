import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WaterUsageInsights() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F9FC' }}>
      <View style={{ height: '30%', backgroundColor: '#34baeb', padding: 20 }}>
       
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Water usage insights</Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          marginTop: -30,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          padding: 20,
        }}>
        <View style={{ alignSelf: 'center', width: 50, height: 5, backgroundColor: '#34baeb', borderRadius: 10 }} />
        {/* Add Insights Content Here */}
      </View>
    </View>
  );
}
