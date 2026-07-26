import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password)
      return Alert.alert('Error', 'Nama, email, dan password wajib diisi');
    setLoading(true);
    try {
      await register(form.name, form.email.trim(), form.password, form.phone);
    } catch (err) {
      Alert.alert('Registrasi Gagal', err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="musical-notes" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>Daftar dan mulai pesan tiket</Text>
        </View>

        <View style={styles.form}>
          {[
            { key: 'name',  label: 'Nama Lengkap', icon: 'person-outline',   placeholder: 'Nama kamu',        keyboard: 'default' },
            { key: 'email', label: 'Email',         icon: 'mail-outline',     placeholder: 'email@kamu.com',   keyboard: 'email-address' },
            { key: 'phone', label: 'No. HP',        icon: 'call-outline',     placeholder: '08xxxxxxxxxx',     keyboard: 'phone-pad' },
          ].map(({ key, label, icon, placeholder, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={keyboard}
                  autoCapitalize="none"
                  value={form[key]}
                  onChangeText={v => set(key, v)}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 karakter"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPass}
                value={form.password}
                onChangeText={v => set('password', v)}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Daftar</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f9fafb' },
  header:       { backgroundColor: '#6366f1', paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  logoBox:      { width: 64, height: 64, backgroundColor: '#4f46e5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title:        { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle:     { fontSize: 13, color: '#c7d2fe', marginTop: 4 },
  form:         { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 24 },
  inputGroup:   { marginBottom: 16 },
  label:        { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9fafb' },
  inputIcon:    { marginRight: 8 },
  input:        { height: 46, color: '#111827', fontSize: 14 },
  btn:          { backgroundColor: '#6366f1', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  loginRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText:    { color: '#6b7280', fontSize: 13 },
  loginLink:    { color: '#6366f1', fontWeight: '600', fontSize: 13 },
});
