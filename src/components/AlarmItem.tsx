import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import Colors from '../constants/Colors';
import { formatTime, formatWeekdays } from '../utils/alarmUtils';
import { Alarm } from '../types';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (alarmId: string) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (alarmId: string) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onPress, onDelete }) => {
  const alarmTime = new Date(alarm.time);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(alarm)}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={[
            styles.timeText,
            !alarm.enabled && styles.disabledText
          ]}>
            {formatTime(alarmTime)}
          </Text>
          {alarm.label && (
            <Text style={[
              styles.labelText,
              !alarm.enabled && styles.disabledText
            ]}>
              {alarm.label}
            </Text>
          )}
          <Text style={[
            styles.repeatText,
            !alarm.enabled && styles.disabledText
          ]}>
            {formatWeekdays(alarm.days)}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <Switch
            value={alarm.enabled}
            onValueChange={() => onToggle(alarm.id)}
            trackColor={{ false: Colors.surface, true: Colors.primary }}
            thumbColor={Colors.textPrimary}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(alarm.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  repeatText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  deleteButton: {
    marginLeft: 16,
    padding: 8,
  },
  deleteText: {
    color: Colors.error,
    fontSize: 14,
  },
});

export default AlarmItem;