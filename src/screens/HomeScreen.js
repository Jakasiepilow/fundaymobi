import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, TextInput, RefreshControl, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [events,     setEvents]     = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/events');
      const open = res.data.data.filter(e => e.status === 'open');
      setEvents(open);
      setFiltered(open);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSearch = (text) => {
    setSearch(text);
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(text.toLowerCase()) ||
      e.venue.toLowerCase().includes(text.toLowerCase())
    ));
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetail', { event: item })}>
      {item.poster_url
        ? <Image source={{ uri: item.poster_url }} style={styles.poster} />
        : <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="musical-notes" size={40} color="#c7d2fe" />
          </View>
      }
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OPEN</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={13} color="#6b7280" />
          <Text style={styles.cardMeta} numberOfLines={1}>{item.venue}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={13} color="#6b7280" />
          <Text style={styles.cardMeta}>
            {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        {item.artists?.length > 0 && (
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={13} color="#6b7280" />
            <Text style={styles.cardMeta} numberOfLines={1}>{item.artists.map(a => a.name).join(', ')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerSub}>Temukan konser favoritmu</Text>
        </View>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari konser atau venue..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Belum ada konser tersedia</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#f9fafb' },
  header:            { backgroundColor: '#6366f1', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:          { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSub:         { color: '#c7d2fe', fontSize: 13, marginTop: 2 },
  avatarBox:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  avatarText:        { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  searchBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  searchInput:       { flex: 1, fontSize: 14, color: '#111827' },
  card:              { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  poster:            { width: '100%', height: 160 },
  posterPlaceholder: { backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  cardBody:          { padding: 14 },
  cardTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle:         { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1, marginRight: 8 },
  badge:             { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText:         { color: '#16a34a', fontSize: 10, fontWeight: 'bold' },
  cardRow:           { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  cardMeta:          { fontSize: 12, color: '#6b7280', flex: 1 },
  empty:             { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText:         { color: '#9ca3af', fontSize: 14 },
});
