import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, Image, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function MyTicketsScreen() {
  const [orders,     setOrders]     = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const openDetail = async (order) => {
    const res = await api.get(`/orders/${order.id}`);
    setSelected(res.data.data);
  };

  const statusColor = (s) => ({
    paid:      { bg: '#dcfce7', text: '#16a34a' },
    pending:   { bg: '#fef9c3', text: '#ca8a04' },
    cancelled: { bg: '#fee2e2', text: '#dc2626' },
  }[s] || { bg: '#f3f4f6', text: '#6b7280' });

  const renderOrder = ({ item }) => {
    const color = statusColor(item.status);
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
        <View style={styles.cardTop}>
          <Text style={styles.orderCode}>{item.order_code}</Text>
          <View style={[styles.badge, { backgroundColor: color.bg }]}>
            <Text style={[styles.badgeText, { color: color.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.eventTitle}>{item.event_title}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.total}>{fmt(item.total_price)}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiket Saya</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="ticket-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Belum ada tiket</Text>
          </View>
        }
      />

      {/* Detail modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detail Pesanan</Text>
            <View style={{ width: 24 }} />
          </View>

          {selected && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {/* Info */}
              <View style={styles.infoCard}>
                <Text style={styles.infoEventTitle}>{selected.event_title}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kode</Text>
                  <Text style={styles.infoValue}>{selected.order_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total</Text>
                  <Text style={[styles.infoValue, { color: '#6366f1', fontWeight: 'bold' }]}>{fmt(selected.total_price)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(selected.status).bg }]}>
                    <Text style={[styles.badgeText, { color: statusColor(selected.status).text }]}>{selected.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {/* Tiket & QR */}
              <Text style={styles.sectionTitle}>Tiket & QR Code</Text>
              {selected.items?.map((item, i) => (
                <View key={i} style={styles.ticketSection}>
                  <Text style={styles.categoryName}>{item.category_name} × {item.quantity}</Text>
                  {item.tickets?.map((t, j) => (
                    <View key={j} style={styles.ticketCard}>
                      <View style={styles.ticketLeft}>
                        <Text style={styles.ticketCode}>{t.ticket_code}</Text>
                        <View style={[styles.badge, {
                          backgroundColor: t.status === 'active' ? '#dcfce7' : '#fee2e2',
                          marginTop: 4, alignSelf: 'flex-start'
                        }]}>
                          <Text style={[styles.badgeText, { color: t.status === 'active' ? '#16a34a' : '#dc2626' }]}>
                            {t.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      {t.qr_code_url && (
                        <Image source={{ uri: t.qr_code_url }} style={styles.qrImg} />
                      )}
                    </View>
                  ))}
                </View>
              ))}

              {/* Payment status */}
              {selected.payment && (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Status Pembayaran</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Metode</Text>
                    <Text style={styles.infoValue}>{selected.payment.payment_method}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValue}>{selected.payment.status}</Text>
                  </View>
                  {selected.payment.proof_url && (
                    <Image source={{ uri: selected.payment.proof_url }} style={{ width: '100%', height: 180, borderRadius: 10, marginTop: 10 }} resizeMode="contain" />
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header:          { backgroundColor: '#6366f1', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle:     { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderCode:       { fontSize: 12, fontFamily: 'monospace', color: '#6b7280' },
  badge:           { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText:       { fontSize: 10, fontWeight: 'bold' },
  eventTitle:      { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 },
  cardBottom:      { flexDirection: 'row', justifyContent: 'space-between' },
  total:           { fontSize: 15, fontWeight: 'bold', color: '#6366f1' },
  date:            { fontSize: 12, color: '#9ca3af' },
  empty:           { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText:       { color: '#9ca3af', fontSize: 14 },
  modalHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle:      { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  infoCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  infoEventTitle:  { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel:       { fontSize: 13, color: '#6b7280' },
  infoValue:       { fontSize: 13, color: '#111827' },
  cardTitle:       { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  sectionTitle:    { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  ticketSection:   { marginBottom: 12 },
  categoryName:    { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  ticketCard:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  ticketLeft:      { flex: 1 },
  ticketCode:      { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', color: '#111827' },
  qrImg:           { width: 70, height: 70, borderRadius: 8 },
});
