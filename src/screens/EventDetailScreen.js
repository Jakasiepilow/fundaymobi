import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${event.id}`)
      .then(r => setDetail(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView>
        {/* Poster */}
        {detail.poster_url
          ? <Image source={{ uri: detail.poster_url }} style={styles.poster} />
          : <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons name="musical-notes" size={60} color="#c7d2fe" />
            </View>
        }

        <View style={styles.body}>
          {/* Title & status */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{detail.title}</Text>
            <View style={[styles.badge, { backgroundColor: detail.status === 'open' ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.badgeText, { color: detail.status === 'open' ? '#16a34a' : '#dc2626' }]}>
                {detail.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Info */}
          {[
            { icon: 'calendar-outline',  text: new Date(detail.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
            { icon: 'time-outline',      text: detail.event_time?.slice(0, 5) + ' WIB' },
            { icon: 'location-outline',  text: detail.venue },
          ].map(({ icon, text }, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={icon} size={16} color="#6366f1" />
              <Text style={styles.infoText}>{text}</Text>
            </View>
          ))}

          {/* Artis */}
          {detail.artists?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Artis</Text>
              <View style={styles.artistsRow}>
                {detail.artists.map(a => (
                  <View key={a.id} style={styles.artistChip}>
                    <Text style={styles.artistName}>{a.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Deskripsi */}
          {detail.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tentang Event</Text>
              <Text style={styles.desc}>{detail.description}</Text>
            </View>
          )}

          {/* Kategori tiket */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori Tiket</Text>
            {detail.categories?.map(cat => (
              <View key={cat.id} style={styles.catCard}>
                <View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catSisa}>Sisa: {cat.quota - cat.sold} tiket</Text>
                </View>
                <Text style={styles.catPrice}>{fmt(cat.price)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      {detail.status === 'open' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => navigation.navigate('Order', { event: detail })}
          >
            <Text style={styles.orderBtnText}>Pesan Tiket Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  poster:            { width: '100%', height: 240 },
  posterPlaceholder: { backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  body:              { padding: 20 },
  titleRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title:             { fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1, marginRight: 10 },
  badge:             { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:         { fontSize: 11, fontWeight: 'bold' },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText:          { fontSize: 14, color: '#374151' },
  section:           { marginTop: 20 },
  sectionTitle:      { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  artistsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  artistChip:        { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  artistName:        { color: '#6366f1', fontSize: 13, fontWeight: '500' },
  desc:              { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  catCard:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  catName:           { fontSize: 15, fontWeight: '600', color: '#111827' },
  catSisa:           { fontSize: 12, color: '#6b7280', marginTop: 2 },
  catPrice:          { fontSize: 15, fontWeight: 'bold', color: '#6366f1' },
  footer:            { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  orderBtn:          { backgroundColor: '#6366f1', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  orderBtnText:      { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
