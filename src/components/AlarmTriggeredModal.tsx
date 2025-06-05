import React, { useEffect } from 'react';
import {
  StyleSheet,
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
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.contentContainer,
            { transform: [{ scale: breatheAnim }] }
          ]}
        >
          <Text style={styles.time}>
            {formatTime(new Date(alarm.time))}
          </Text>
          {alarm.label && (
            <Text style={styles.label}>{alarm.label}</Text>
          )}
        </Animated.View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSnooze}
          >
            <Ionicons 
              name="time-outline" 
              size={32} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.buttonText}>Snooze</Text>
            <Text style={styles.buttonSubtext}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleDismiss}
          >
            <Ionicons 
              name="close-circle-outline" 
              size={32} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.buttonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 56,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH,
    paddingHorizontal: 32,
  },
  button: {
    alignItems: 'center',
    padding: 16,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  buttonSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});