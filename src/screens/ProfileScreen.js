import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Info */}
      <View style={styles.section}>
        {[
          { icon: 'person-outline',  label: 'Nama',      value: user?.name },
          { icon: 'mail-outline',    label: 'Email',     value: user?.email },
          { icon: 'call-outline',    label: 'No. HP',    value: user?.phone || '-' },
          { icon: 'shield-outline',  label: 'Role',      value: user?.role },
        ].map(({ icon, label, value }, i) => (
          <View key={i} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name={icon} size={18} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { backgroundColor: '#6366f1', paddingTop: 60, paddingBottom: 30, alignItems: 'center' },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name:        { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  email:       { color: '#c7d2fe', fontSize: 13, marginTop: 2 },
  section:     { backgroundColor: '#fff', marginTop: 16, marginHorizontal: 16, borderRadius: 14, padding: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  infoIcon:    { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoLabel:   { fontSize: 11, color: '#9ca3af', marginBottom: 1 },
  infoValue:   { fontSize: 14, color: '#111827', fontWeight: '500' },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  logoutText:  { color: '#dc2626', fontSize: 15, fontWeight: '600' },
});
