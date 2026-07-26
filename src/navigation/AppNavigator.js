import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen     from '../screens/HomeScreen';
import EventDetail    from '../screens/EventDetailScreen';
import OrderScreen    from '../screens/OrderScreen';
import MyTickets      from '../screens/MyTicketsScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import PaymentScreen  from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, paddingTop: 4, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Beranda: focused ? 'home'   : 'home-outline',
            Tiketku: focused ? 'ticket' : 'ticket-outline',
            Profil:  focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Tiketku" component={MyTickets} />
      <Tab.Screen name="Profil"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"        component={TabNavigator} />
            <Stack.Screen name="EventDetail" component={EventDetail}
              options={{ headerShown: true, title: 'Detail Event' }} />
            <Stack.Screen name="Order"   component={OrderScreen}
              options={{ headerShown: true, title: 'Pesan Tiket' }} />
            <Stack.Screen name="Payment" component={PaymentScreen}
              options={{ headerShown: true, title: 'Pembayaran' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
