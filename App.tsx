import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import AcademyScreen from './screens/AcademyScreen';
import ClassroomScreen from './screens/ClassroomScreen';
import AcademyAdminScreen from './screens/AcademyAdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { palette, t, unreadCount } = useApp();
  const insets = useSafeAreaInsets();
  const unread = unreadCount();
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 6);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.border,
          height: 56 + bottom,
          paddingBottom: bottom,
          paddingTop: 6,
          elevation: 8,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            FeedTab: focused ? 'home' : 'home-outline',
            MarketTab: focused ? 'storefront' : 'storefront-outline',
            MessagesTab: focused ? 'chatbubbles' : 'chatbubbles-outline',
            AcademyTab: focused ? 'school' : 'school-outline',
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
      <Tab.Screen name="AcademyTab" component={AcademyScreen} options={{ title: t('academy') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}

function GlowWash() {
  const { palette, settings } = useApp();
  if (!settings.glow) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.glowA, { backgroundColor: palette.primary }]} />
      <View style={[styles.glowB, { backgroundColor: palette.accent }]} />
    </View>
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

  const gate = !tutorialSeen ? 'tutorial' : user ? 'app' : 'auth';

  return (
    <NavigationContainer key={gate} theme={navTheme}>
      <GlowWash />
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
            <Stack.Screen name="AcademyAdmin" component={AcademyAdminScreen} options={{ title: 'Academy desk' }} />
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
            <Stack.Screen name="Academy" component={AcademyScreen} options={{ title: t('academy') }} />
            <Stack.Screen name="Classroom" component={ClassroomScreen} options={{ title: t('classroom') }} />
            <Stack.Screen name="AcademyAdmin" component={AcademyAdminScreen} options={{ title: 'Academy desk' }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: t('quiz') }} />
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

const styles = StyleSheet.create({
  webStage: {
    flex: 1,
    backgroundColor: '#07140C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: '100%',
    maxWidth: 412,
    flex: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  installBar: {
    position: 'absolute',
    top: 10,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  glowA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -70,
    right: -50,
    opacity: 0.14,
  },
  glowB: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 80,
    left: -60,
    opacity: 0.1,
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <PhoneShell>
            <RootNav />
          </PhoneShell>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, tap, palette } = useApp();
  const [installEvt, setInstallEvt] = React.useState<any>(null);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const width =
    settings.fitMode === 'fill' ? '100%' : settings.fitMode === 'tablet' ? 768 : 412;
  const scale = settings.uiScale === 'compact' ? 0.92 : settings.uiScale === 'large' ? 1.08 : 1;

  const frame = (
    <View style={[styles.phone, { maxWidth: width as any, transform: [{ scale }] }]}>
      {children}
    </View>
  );

  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View style={styles.webStage}>
      {!installed ? (
        <Pressable
          onPress={async () => {
            tap();
            if (installEvt?.prompt) {
              installEvt.prompt();
              try {
                await installEvt.userChoice;
              } catch {
                /* ignore */
              }
              setInstallEvt(null);
            }
          }}
          style={[styles.installBar, { backgroundColor: palette.primary }]}
        >
          <Text style={{ color: palette.primaryText, fontWeight: '800' }}>
            {installEvt ? 'Install Salone Na We Yon' : 'Add Salone Na We Yon to your home screen'}
          </Text>
        </Pressable>
      ) : null}
      {frame}
    </View>
  );
}
