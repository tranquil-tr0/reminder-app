import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import soundManager from '../utils/soundManager';
import { formatTime } from '../utils/alarmUtils';
import { Alarm } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AlarmTriggeredModalProps {
  visible: boolean;
  alarm: Alarm | null;
  onSnooze: () => void;
  onDismiss: () => void;
}

export default function AlarmTriggeredModal({
  visible,
  alarm,
  onSnooze,
  onDismiss
}: AlarmTriggeredModalProps): React.JSX.Element | null {
  // Animation value for breathing effect
  const breatheAnim = new Animated.Value(1);
  const theme = useTheme();

  useEffect(() => {
    let breathingAnimation: Animated.CompositeAnimation | undefined;

    if (visible) {
      // Start sound and haptics
      soundManager.playAlarm();

      // Start breathing animation
      breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathingAnimation.start();
    }

    return () => {
      if (breathingAnimation) {
        breathingAnimation.stop();
      }
      soundManager.stopAlarm();
    };
  }, [visible]);

  const handleDismiss = (): void => {
    soundManager.stopAlarm();
    onDismiss();
  };

  const handleSnooze = (): void => {
    soundManager.stopAlarm();
    onSnooze();
  };

  if (!visible || !alarm) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <Surface style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 48
      }}>
        <Animated.View
          style={{ 
            transform: [{ scale: breatheAnim }],
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text 
            variant="displayLarge"
            style={{
              color: theme.colors.onBackground,
              marginBottom: 16,
              fontWeight: '300'
            }}
          >
            {formatTime(new Date(alarm.time))}
          </Text>
          {alarm.label && (
            <Text 
              variant="headlineSmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                paddingHorizontal: 32
              }}
            >
              {alarm.label}
            </Text>
          )}
        </Animated.View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 32,
          width: SCREEN_WIDTH
        }}>
          <Button
            mode="outlined"
            onPress={handleSnooze}
            icon={() => (
              <Ionicons
                name="time-outline"
                size={24}
                color={theme.colors.onSurface}
              />
            )}
            contentStyle={{ 
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'column',
              height: 80
            }}
            labelStyle={{ 
              fontSize: 16,
              marginTop: 8
            }}
            style={{ 
              borderRadius: 12,
              minWidth: 120
            }}
          >
            Snooze{'\n'}5 min
          </Button>

          <Button
            mode="contained"
            onPress={handleDismiss}
            icon={() => (
              <Ionicons
                name="close-circle-outline"
                size={24}
                color={theme.colors.onPrimary}
              />
            )}
            contentStyle={{ 
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'column',
              height: 80
            }}
            labelStyle={{ 
              fontSize: 16,
              marginTop: 8
            }}
            style={{ 
              borderRadius: 12,
              minWidth: 120
            }}
            buttonColor={theme.colors.primary}
          >
            Dismiss
          </Button>
        </View>
      </Surface>
    </Modal>
  );
}
