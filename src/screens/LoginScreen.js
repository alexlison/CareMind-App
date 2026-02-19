import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/LoginStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons
            name="brain"
            size={30}
            color="#2E7D32"
          />
        </View>

        <Text style={styles.title}>
          Care<Text style={styles.light}>Mind</Text>
        </Text>

        <Text style={styles.subtitle}>
          Welcome back, please login
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sign In</Text>

        {/* EMAIL */}
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="email-outline"
            size={18}
            color="#6B7280"
          />
          <Text style={styles.labelText}>Email Address</Text>
        </View>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          style={styles.inputBox}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={18}
            color="#6B7280"
          />
          <Text style={styles.labelText}>Password</Text>
        </View>

        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        © 2025 CareMind. All rights reserved.
      </Text>
    </View>
  );
};

export default LoginScreen;
