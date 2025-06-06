import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Surface, 
  useTheme,
  Chip
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createAlarm } from '../utils/alarmUtils';
import { Alarm } from '../types';

interface WeekdayOption {
  id: number;
  label: string;
}

const WEEKDAYS: WeekdayOption[] = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

interface AddAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: Alarm) => void;
  initialAlarm?: Alarm | null;
}

const AddAlarmModal: React.FC<AddAlarmModalProps> = ({ visible, onClose, onSave, initialAlarm }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [label, setLabel] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const theme = useTheme();

  // Reset form when modal visibility changes or initialAlarm changes
  React.useEffect(() => {
    if (visible) {
      if (initialAlarm) {
        setTime(new Date(initialAlarm.time));
        setLabel(initialAlarm.label);
        setSelectedDays(initialAlarm.days);
      } else {
        // Reset to defaults for new alarm
        setTime(new Date());
        setLabel('');
        setSelectedDays([]);
      }
    }
  }, [visible, initialAlarm]);

  const handleSave = (): void => {
    const alarm = initialAlarm
      ? {
          ...initialAlarm,
          time: time.toISOString(),
          label,
          days: selectedDays,
        }
      : createAlarm({
          hours: time.getHours(),
          minutes: time.getMinutes(),
          label,
          days: selectedDays,
        });

    onSave(alarm);
    onClose();
  };

  const toggleDay = (dayId: number): void => {
    setSelectedDays(days =>
      days.includes(dayId)
        ? days.filter(d => d !== dayId)
        : [...days, dayId]
    );
  };

  const onTimeChange = (event: any, selectedTime?: Date): void => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const showTimePickerModal = (): void => {
    setShowTimePicker(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Surface style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            minHeight: '60%',
            maxHeight: '90%'
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outline
            }}>
              <Button
                mode="text"
                onPress={onClose}
                textColor={theme.colors.onSurfaceVariant}
              >
                Cancel
              </Button>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {initialAlarm ? 'Edit Alarm' : 'Add Alarm'}
              </Text>
              <Button
                mode="text"
                onPress={handleSave}
                textColor={theme.colors.primary}
              >
                Save
              </Button>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Time Picker Section */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 24,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outline
              }}>
                <Surface
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    alignItems: 'center',
                    elevation: 1
                  }}
                >
                  <Button
                    mode="text"
                    onPress={showTimePickerModal}
                    contentStyle={{ padding: 8 }}
                  >
                    <Text 
                      variant="displayMedium" 
                      style={{ 
                        color: theme.colors.onSurface,
                        fontWeight: '300'
                      }}
                    >
                      {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </Button>
                  <Text 
                    variant="bodyMedium" 
                    style={{ 
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 8
                    }}
                  >
                    Tap to change time
                  </Text>
                </Surface>
              </View>

              {/* Label Input Section */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 24,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outline
              }}>
                <TextInput
                  label="Alarm label"
                  value={label}
                  onChangeText={setLabel}
                  mode="outlined"
                  maxLength={30}
                  style={{ backgroundColor: theme.colors.surface }}
                />
              </View>

              {/* Weekday Selection Section */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 24,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outline
              }}>
                <Text 
                  variant="titleMedium" 
                  style={{ 
                    color: theme.colors.onSurface,
                    marginBottom: 16
                  }}
                >
                  Repeat
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  {WEEKDAYS.map(day => (
                    <Chip
                      key={day.id}
                      selected={selectedDays.includes(day.id)}
                      onPress={() => toggleDay(day.id)}
                      mode={selectedDays.includes(day.id) ? 'flat' : 'outlined'}
                    >
                      {day.label}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>
          </Surface>
        </KeyboardAvoidingView>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={time}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
        
        {/* iOS Time Picker Done Button */}
        {showTimePicker && Platform.OS === 'ios' && (
          <Surface style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline
          }}>
            <View style={{ padding: 16, alignItems: 'flex-end' }}>
              <Button
                mode="text"
                onPress={() => setShowTimePicker(false)}
                textColor={theme.colors.primary}
              >
                Done
              </Button>
            </View>
          </Surface>
        )}
      </View>
    </Modal>
  );
};

export default AddAlarmModal;