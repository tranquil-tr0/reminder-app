import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';
import { Audio } from 'expo-av';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import soundManager from './src/utils/soundManager';
import { cancelAllAlarmNotifications } from './src/utils/notificationUtils';

export default function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

