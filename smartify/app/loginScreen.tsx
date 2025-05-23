import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, LinearGradient as SvgLinearGradient, Stop, Defs } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase/supabaseClient'; // Import Supabase client

const LoginScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animation
  const buttonScale = useRef(new Animated.Value(1)).current; // For button press animation
  const router = useRouter();
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Fade-in animation on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Button press animation
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = async () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    setLoading(true); // Show loading indicator
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // Log in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        // Successfully logged in, Supabase will handle session persistence
        router.replace('/(tabs)'); // Redirect to tabs after login
      } else {
        throw new Error('Login failed: No session data returned');
      }
    } catch (error) {
      console.error('Login failed:', error);
  
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const AccountSignin = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    router.replace('./SignUp'); // Navigate to SignUp screen
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Gradient */}
      <View style={styles.background}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34baeb" stopOpacity="1" />
              <Stop offset="1" stopColor="#1e90ff" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          <Path d="M0 0 H1000 V1000 H0 Z" fill="url(#grad)" />
        </Svg>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo or Header */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Smartify</Text>
          <Text style={styles.subtitle}>Control Your Smart Home, Seamlessly</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={AccountSignin}
          >
            <Text style={styles.forgotText}>Don't have an account?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading} // Disable button while loading
          >
            <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                      <SvgLinearGradient id="buttonGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#34baeb" stopOpacity="1" />
                        <Stop offset="1" stopColor="#4682b4" stopOpacity="1" />
                      </SvgLinearGradient>
                    </Defs>
                    <Path
                      d={`M0 0 H${300} V${50} H0 Z`}
                      fill="url(#buttonGrad)"
                    />
                  </Svg>
                  <Text style={styles.buttonText}>Login</Text>
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Wave Decoration */}
      <View style={styles.waveContainer}>
        <Svg height="150" width="100%">
          <Path
            d="M0 100 Q100 50 200 100 T400 100 T600 100 V150 H0 Z"
            fill="rgba(255, 255, 255, 0.3)"
          />
        </Svg>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f7ff',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
  },
  forgotText: {
    color: '#e0f7ff',
    fontSize: 14,
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default LoginScreen;