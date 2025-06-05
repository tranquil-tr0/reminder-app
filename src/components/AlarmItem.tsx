import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
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
      className="px-4 py-3 border-b border-divider"
      onPress={() => onPress(alarm)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className={`text-3xl font-light mb-1 ${alarm.enabled ? 'text-text-primary' : 'text-text-secondary opacity-70'}`}>
            {formatTime(alarmTime)}
          </Text>
          {alarm.label && (
            <Text className={`text-base mb-0.5 ${alarm.enabled ? 'text-text-primary' : 'text-text-secondary opacity-70'}`}>
              {alarm.label}
            </Text>
          )}
          <Text className={`text-sm ${alarm.enabled ? 'text-text-secondary' : 'text-text-secondary opacity-70'}`}>
            {formatWeekdays(alarm.days)}
          </Text>
        </View>
        
        <View className="flex-row items-center ml-4">
          <Switch
            value={alarm.enabled}
            onValueChange={() => onToggle(alarm.id)}
            trackColor={{ false: Colors.surface, true: Colors.primary }}
            thumbColor={Colors.textPrimary}
          />
          <TouchableOpacity
            className="ml-4 p-2"
            onPress={() => onDelete(alarm.id)}
          >
            <Text className="text-error text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};



export default AlarmItem;