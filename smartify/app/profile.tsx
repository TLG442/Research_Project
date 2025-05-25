import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');
const FREQUENCY = 7;
const INITIAL_AMPLITUDE = 20;
const INITIAL_VERTICAL_OFFSET = 100;

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const waveAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  const wave = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 2],
  });

  const handleSignOut = () => {
    router.push('/loginScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Gradient Header */}
      <View style={styles.header}>
 <LinearGradient
  
  
>
  {[
    <Text key="header-title" style={styles.headerTitle}>Profile</Text>
  ]}
</LinearGradient>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={require('../assets/images/3333.png')} // Replace with actual user image
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Tharukalg</Text>
        <Text style={styles.userEmail}>tharukalg@gmail.com</Text>

      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  gradientHeader: {
    width: '100%',
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginBottom: 15,
  },
  waveContainer: {
    height: 100,
    overflow: 'hidden',
    width: '100%',
  },
  wave: {
    position: 'absolute',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;