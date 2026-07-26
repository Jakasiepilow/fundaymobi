import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email dan password wajib diisi');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Gagal', err.response?.data?.message || 'Periksa koneksi internet kamu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons name="musical-notes" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Tiket Konser</Text>
        <Text style={styles.subtitle}>Pesan tiket konser favoritmu</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Masuk</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="email@kamu.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Masuk</Text>
          }
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Daftar sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  header:      { backgroundColor: '#6366f1', paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logoBox:     { width: 64, height: 64, backgroundColor: '#4f46e5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title:       { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle:    { fontSize: 13, color: '#c7d2fe', marginTop: 4 },
  form:        { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 24 },
  formTitle:   { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 24 },
  inputGroup:  { marginBottom: 16 },
  label:       { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  inputWrapper:{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9fafb' },
  inputIcon:   { marginRight: 8 },
  input:       { height: 46, color: '#111827', fontSize: 14 },
  btn:         { backgroundColor: '#6366f1', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText:     { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText:{ color: '#6b7280', fontSize: 13 },
  registerLink:{ color: '#6366f1', fontWeight: '600', fontSize: 13 },
});
