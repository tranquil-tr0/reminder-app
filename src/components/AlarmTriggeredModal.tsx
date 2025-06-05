import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
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
      <View className="flex-1 bg-background justify-between items-center py-12">
        <Animated.View
          style={{ transform: [{ scale: breatheAnim }] }}
          className="flex-1 justify-center items-center"
        >
          <Text className="text-6xl font-light text-text-primary mb-4">
            {formatTime(new Date(alarm.time))}
          </Text>
          {alarm.label && (
            <Text className="text-2xl text-text-secondary text-center">{alarm.label}</Text>
          )}
        </Animated.View>

        <View className="flex-row justify-around px-8" style={{ width: SCREEN_WIDTH }}>
          <TouchableOpacity
            className="items-center p-4"
            onPress={handleSnooze}
          >
            <Ionicons
              name="time-outline"
              size={32}
              color={Colors.textPrimary}
            />
            <Text className="text-base text-text-primary mt-2">Snooze</Text>
            <Text className="text-sm text-text-secondary mt-1">5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center p-4"
            onPress={handleDismiss}
          >
            <Ionicons
              name="close-circle-outline"
              size={32}
              color={Colors.textPrimary}
            />
            <Text className="text-base text-text-primary mt-2">Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
