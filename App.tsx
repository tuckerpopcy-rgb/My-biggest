import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './context/AppContext';
import TutorialScreen from './screens/TutorialScreen';
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import MarketScreen from './screens/MarketScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import QuizScreen from './screens/QuizScreen';
import AIScreen from './screens/AIScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AboutDeveloperScreen from './screens/AboutDeveloperScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import PremiumScreen from './screens/PremiumScreen';
import StudioScreen from './screens/StudioScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { palette, t, unreadCount } = useApp();
  const unread = unreadCount();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            FeedTab: focused ? 'home' : 'home-outline',
            MarketTab: focused ? 'storefront' : 'storefront-outline',
            MessagesTab: focused ? 'chatbubbles' : 'chatbubbles-outline',
            QuizTab: focused ? 'help-circle' : 'help-circle-outline',
            ProfileTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedScreen} options={{ title: t('feed') }} />
      <Tab.Screen name="MarketTab" component={MarketScreen} options={{ title: t('market') }} />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{ title: t('messages'), tabBarBadge: unread > 0 ? unread : undefined }}
      />
      <Tab.Screen name="QuizTab" component={QuizScreen} options={{ title: t('quiz') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}

function RootNav() {
  const { ready, user, tutorialSeen, palette, dark, t } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme.colors : DefaultTheme.colors),
      background: palette.bg,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.header },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        {!tutorialSeen ? (
          <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ headerShown: false }} />
        ) : !user ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AboutDeveloper" component={AboutDeveloperScreen} options={{ title: t('aboutDev') }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="SalonAI" component={AIScreen} options={{ title: t('salonAI') }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('notifications') }} />
            <Stack.Screen name="AboutDeveloper" component={AboutDeveloperScreen} options={{ title: t('aboutDev') }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: t('profile') }} />
            <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: t('premium') }} />
            <Stack.Screen name="Studio" component={StudioScreen} options={{ title: t('studio') }} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNav />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
