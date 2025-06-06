import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Switch, Button, Surface, useTheme } from 'react-native-paper';
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
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(alarm)}
      activeOpacity={0.7}
    >
      <Surface 
        style={{
          marginHorizontal: 8,
          marginVertical: 4,
          borderRadius: 12,
          padding: 16,
          elevation: 1
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View style={{ flex: 1 }}>
            <Text 
              variant="displaySmall"
              style={{
                color: alarm.enabled ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                opacity: alarm.enabled ? 1 : 0.7,
                fontWeight: '300',
                marginBottom: 4
              }}
            >
              {formatTime(alarmTime)}
            </Text>
            {alarm.label && (
              <Text 
                variant="bodyLarge"
                style={{
                  color: alarm.enabled ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                  opacity: alarm.enabled ? 1 : 0.7,
                  marginBottom: 2
                }}
              >
                {alarm.label}
              </Text>
            )}
            <Text 
              variant="bodyMedium"
              style={{
                color: alarm.enabled ? theme.colors.onSurfaceVariant : theme.colors.onSurfaceVariant,
                opacity: alarm.enabled ? 1 : 0.7
              }}
            >
              {formatWeekdays(alarm.days)}
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 16
          }}>
            <Switch
              value={alarm.enabled}
              onValueChange={() => onToggle(alarm.id)}
            />
            <Button
              mode="text"
              textColor={theme.colors.error}
              onPress={() => onDelete(alarm.id)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </Button>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

export default AlarmItem;