// ============================================================
// Salon na we yon - Main Application
// Sierra Leone is Ours 🇸🇱
// Developed by Henry Tucker
// ============================================================

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppProvider, useApp } from './lib/context';
import { authService } from './lib/auth';
import { getUnreadCount } from './lib/notifications';

// Screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import QuizScreen from './screens/QuizScreen';
import TeachScreen from './screens/TeachScreen';
import ChatScreen from './screens/ChatScreen';
import MarketScreen from './screens/MarketScreen';
import NewsScreen from './screens/NewsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import DeveloperPortal from './screens/DeveloperPortal';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ===== TAB NAVIGATOR =====
function MainTabs() {
  const { user, theme } = useApp();
  const c = theme.colors;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    }, 5000);
    getUnreadCount().then(setUnreadCount);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          let IconComponent: any = Ionicons;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'News':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'Market':
              IconComponent = MaterialIcons;
              iconName = focused ? 'storefront' : 'storefront';
              break;
            case 'Quiz':
              IconComponent = FontAwesome;
              iconName = 'trophy';
              size = focused ? size + 1 : size;
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
          }

          return <IconComponent name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 82 : 60,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          tabBarBadge: user?.quizHighScore > 0 ? `${user.quizHighScore}` : undefined,
          tabBarBadgeStyle: {
            backgroundColor: c.accent,
            fontSize: 9,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
          },
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: c.error,
            fontSize: 9,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
          },
        }}
      />
    </Tab.Navigator>
  );
}

// ===== STACK NAVIGATOR =====
function AppStack() {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: c.surface,
        },
        headerTintColor: c.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: c.background,
        },
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Profile */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Settings with LARGE Developer Symbol */}
      <Stack.Screen
        name="Settings"
        options={({ navigation }) => ({
          headerTitle: 'Settings',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('DeveloperPortal')}
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: c.primary + '18',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 6,
                borderWidth: 2.5,
                borderColor: c.primary + '50',
                shadowColor: c.primary,
                shadowOpacity: 0.3,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 22 }}>⚙️</Text>
              <Text style={{ fontSize: 7, fontWeight: '800', color: c.primary, letterSpacing: 0.5 }}>DEV</Text>
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => <SettingsScreen {...props} onDevAccess={() => props.navigation.navigate('DeveloperPortal')} />}
      </Stack.Screen>

      {/* Notifications */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerTitle: 'Notifications' }}
      />

      {/* Post Detail */}
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ headerShown: false }}
      />

      {/* News Detail */}
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ headerShown: false }}
      />

      {/* Learn / Teach */}
      <Stack.Screen
        name="Teach"
        component={TeachScreen}
        options={{ headerShown: false }}
      />

      {/* Developer Portal */}
      <Stack.Screen
        name="DeveloperPortal"
        component={DeveloperPortal}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ===== AUTH WRAPPER =====
function AuthWrapper() {
  const { user, loading, theme } = useApp();
  const c = theme.colors;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <View style={[styles.loadingLogo, { backgroundColor: c.primary }]}>
          <Text style={styles.loadingEmoji}>🇸🇱</Text>
        </View>
        <Text style={[styles.loadingTitle, { color: c.text }]}>Salon na we yon</Text>
        <Text style={[styles.loadingSubtitle, { color: c.textSecondary }]}>Loading your experience...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={() => {}} />;
  }

  return <AppStack />;
}

// ===== ROOT APP =====
export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...FontAwesome.font,
    ...MaterialIcons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: '#007A3D',
              background: '#F5FFF5',
              card: '#FFFFFF',
              text: '#1B5E20',
              border: '#C8E6C9',
              notification: '#CE1126',
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <StatusBar style="auto" />
          <AuthWrapper />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingEmoji: {
    fontSize: 50,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 15,
    marginTop: 8,
  },
});
