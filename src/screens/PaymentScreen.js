import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function PaymentScreen({ route, navigation }) {
  const { order } = route.params;
  const [proof,   setProof]   = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk upload bukti');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) setProof(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!proof) return Alert.alert('Perhatian', 'Upload bukti transfer terlebih dahulu');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('proof', {
        uri:  proof.uri,
        name: 'proof.jpg',
        type: 'image/jpeg',
      });
      fd.append('payment_method', 'transfer');

      await api.post(`/payments/${order.order_id}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Berhasil!', 'Bukti transfer berhasil diupload. Tunggu verifikasi admin.', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Order summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ringkasan Pesanan</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Kode Pesanan</Text>
          <Text style={styles.value}>{order.order_code}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{fmt(order.total_price)}</Text>
        </View>
      </View>

      {/* Rekening tujuan */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transfer ke Rekening</Text>
        {[
          { bank: 'BCA',     no: '1234567890', nama: 'Tiket Konser Indonesia' },
          { bank: 'Mandiri', no: '0987654321', nama: 'Tiket Konser Indonesia' },
        ].map((rek, i) => (
          <View key={i} style={[styles.rekCard, i > 0 && { marginTop: 10 }]}>
            <Text style={styles.rekBank}>{rek.bank}</Text>
            <Text style={styles.rekNo}>{rek.no}</Text>
            <Text style={styles.rekNama}>a.n. {rek.nama}</Text>
          </View>
        ))}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={16} color="#6366f1" />
          <Text style={styles.noteText}>Transfer sesuai nominal total. Jangan kurang/lebih.</Text>
        </View>
      </View>

      {/* Upload bukti */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Bukti Transfer</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          {proof
            ? <Image source={{ uri: proof.uri }} style={styles.proofImg} />
            : <>
                <Ionicons name="cloud-upload-outline" size={32} color="#6366f1" />
                <Text style={styles.uploadText}>Pilih foto dari galeri</Text>
                <Text style={styles.uploadSub}>JPG, PNG maks. 5MB</Text>
              </>
          }
        </TouchableOpacity>
        {proof && (
          <TouchableOpacity onPress={pickImage} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Ganti foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleUpload} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>Kirim Bukti Transfer</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardTitle:   { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 14 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label:       { fontSize: 13, color: '#6b7280' },
  value:       { fontSize: 13, color: '#111827', fontFamily: 'monospace' },
  divider:     { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  totalLabel:  { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalValue:  { fontSize: 18, fontWeight: 'bold', color: '#6366f1' },
  rekCard:     { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12 },
  rekBank:     { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  rekNo:       { fontSize: 18, fontWeight: 'bold', color: '#6366f1', marginTop: 2 },
  rekNama:     { fontSize: 12, color: '#6b7280', marginTop: 2 },
  noteBox:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#eef2ff', borderRadius: 8, padding: 10 },
  noteText:    { fontSize: 12, color: '#6366f1', flex: 1 },
  uploadBtn:   { borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12, height: 160, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText:  { fontSize: 14, color: '#6366f1', fontWeight: '500' },
  uploadSub:   { fontSize: 12, color: '#9ca3af' },
  proofImg:    { width: '100%', height: '100%', borderRadius: 10 },
  changeBtn:   { marginTop: 10, alignItems: 'center' },
  changeBtnText:{ color: '#6366f1', fontSize: 13 },
  submitBtn:   { backgroundColor: '#6366f1', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  submitText:  { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
