import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';
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
  const [time, setTime] = useState<Date>(
    initialAlarm ? new Date(initialAlarm.time) : new Date()
  );
  const [label, setLabel] = useState<string>(initialAlarm?.label || '');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialAlarm?.days || []);

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl max-h-[90%]">
          <View className="flex-row justify-between items-center p-4 border-b border-divider">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base text-text-secondary">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text-primary">
              {initialAlarm ? 'Edit Alarm' : 'Add Alarm'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-base text-primary font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View className="py-5 border-b border-divider">
              <TouchableOpacity
                className="bg-surface p-5 rounded-lg items-center"
                onPress={() => {
                  // For now, we'll use a simple time display
                  // In a real app, you'd implement a proper time picker modal
                }}
              >
                <Text className="text-3xl font-light text-text-primary mb-1">
                  {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text className="text-sm text-text-secondary">Tap to change time</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4 border-b border-divider">
              <TextInput
                className="text-base text-text-primary p-2 bg-surface rounded-lg"
                placeholder="Alarm label"
                placeholderTextColor={Colors.textSecondary}
                value={label}
                onChangeText={setLabel}
                maxLength={30}
              />
            </View>

            <View className="p-4">
              <Text className="text-base font-semibold text-text-primary mb-3">Repeat</Text>
              <View className="flex-row flex-wrap justify-between">
                {WEEKDAYS.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    className={`w-[13%] aspect-square justify-center items-center rounded-lg mb-2 ${
                      selectedDays.includes(day.id) ? 'bg-primary' : 'bg-surface'
                    }`}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text
                      className={`text-sm text-text-primary ${
                        selectedDays.includes(day.id) ? 'font-semibold' : ''
                      }`}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};



export default AddAlarmModal;