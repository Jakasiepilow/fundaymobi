import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrderScreen({ route, navigation }) {
  const { event } = route.params;
  const [quantities, setQuantities] = useState({});
  const [loading,    setLoading]    = useState(false);

  const setQty = (catId, delta) => {
    setQuantities(prev => {
      const cur = prev[catId] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [catId]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const totalPrice = event.categories?.reduce((sum, cat) => {
    return sum + (quantities[cat.id] || 0) * cat.price;
  }, 0) || 0;

  const handleOrder = async () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ ticket_category_id: parseInt(id), quantity: qty }));

    if (items.length === 0) return Alert.alert('Perhatian', 'Pilih minimal 1 tiket');

    setLoading(true);
    try {
      const res = await api.post('/orders', { event_id: event.id, items });
      navigation.replace('Payment', { order: res.data.data });
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Event info */}
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventRow}>
            <Ionicons name="location-outline" size={13} color="#6b7280" />
            <Text style={styles.eventMeta}>{event.venue}</Text>
          </View>
          <View style={styles.eventRow}>
            <Ionicons name="calendar-outline" size={13} color="#6b7280" />
            <Text style={styles.eventMeta}>
              {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Kategori */}
        <Text style={styles.sectionTitle}>Pilih Kategori Tiket</Text>
        {event.categories?.map(cat => {
          const available = cat.quota - cat.sold;
          const qty = quantities[cat.id] || 0;
          return (
            <View key={cat.id} style={styles.catCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catPrice}>{fmt(cat.price)}</Text>
                <Text style={styles.catSisa}>Sisa {available} tiket</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                  onPress={() => setQty(cat.id, -1)}
                  disabled={qty === 0}
                >
                  <Ionicons name="remove" size={18} color={qty === 0 ? '#d1d5db' : '#6366f1'} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty >= available && styles.qtyBtnDisabled]}
                  onPress={() => setQty(cat.id, 1)}
                  disabled={qty >= available}
                >
                  <Ionicons name="add" size={18} color={qty >= available ? '#d1d5db' : '#6366f1'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{totalItems} tiket dipilih</Text>
          <Text style={styles.footerTotal}>{fmt(totalPrice)}</Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderBtnText}>Lanjut Bayar</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  eventTitle:    { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  eventRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eventMeta:     { fontSize: 13, color: '#6b7280' },
  sectionTitle:  { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  catCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  catName:       { fontSize: 15, fontWeight: '600', color: '#111827' },
  catPrice:      { fontSize: 14, color: '#6366f1', fontWeight: 'bold', marginTop: 2 },
  catSisa:       { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn:        { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled:{ borderColor: '#f3f4f6' },
  qtyText:       { fontSize: 16, fontWeight: 'bold', color: '#111827', minWidth: 20, textAlign: 'center' },
  footer:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', elevation: 8 },
  footerLabel:   { fontSize: 12, color: '#6b7280' },
  footerTotal:   { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  orderBtn:      { backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  orderBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
