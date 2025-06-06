import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { Audio } from 'expo-av';
import AppNavigator from './src/navigation/AppNavigator';
import soundManager from './src/utils/soundManager';
import { cancelAllAlarmNotifications } from './src/utils/notificationUtils';
import { useTheme } from './src/hooks/useTheme';
import { getNavigationTheme } from './src/theme/navigationTheme';
import './src/app.css';

export default function App(): React.JSX.Element {
  const { isDark } = useTheme();

  useEffect(() => {
    const initializeAudio = async (): Promise<void> => {
      try {
        // Configure audio session
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Preload alarm sound
        await soundManager.loadSound();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - cancel all notifications and reschedule
        cancelAllAlarmNotifications();
      }
    });

    return () => {
      // Cleanup
      subscription.remove();
      soundManager.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={getNavigationTheme(isDark)}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
