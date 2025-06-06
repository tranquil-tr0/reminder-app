import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

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
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className="bg-background rounded-t-3xl min-h-[60%] max-h-[90%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-divider">
              <TouchableOpacity
                onPress={onClose}
                className="min-w-[60px] py-2"
              >
                <Text className="text-base text-text-secondary">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-text-primary">
                {initialAlarm ? 'Edit Alarm' : 'Add Alarm'}
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                className="min-w-[60px] py-2"
              >
                <Text className="text-base text-primary font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Time Picker Section */}
              <View className="px-4 py-6 border-b border-divider">
                <TouchableOpacity
                  className="bg-surface p-6 rounded-2xl items-center"
                  onPress={showTimePickerModal}
                  activeOpacity={0.7}
                >
                  <Text className="text-4xl font-light text-text-primary mb-2">
                    {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                  <Text className="text-sm text-text-secondary">Tap to change time</Text>
                </TouchableOpacity>
              </View>

              {/* Label Input Section */}
              <View className="px-4 py-6 border-b border-divider">
                <TextInput
                  className="text-base text-text-primary p-4 bg-surface rounded-2xl"
                  placeholder="Alarm label"
                  placeholderTextColor={Colors.textSecondary}
                  value={label}
                  onChangeText={setLabel}
                  maxLength={30}
                />
              </View>

              {/* Weekday Selection Section */}
              <View className="px-4 py-6">
                <Text className="text-base font-semibold text-text-primary mb-4">Repeat</Text>
                <View className="flex-row justify-between gap-2">
                  {WEEKDAYS.map(day => (
                    <TouchableOpacity
                      key={day.id}
                      className={`flex-1 aspect-square justify-center items-center rounded-2xl ${
                        selectedDays.includes(day.id) ? 'bg-primary' : 'bg-surface'
                      }`}
                      onPress={() => toggleDay(day.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm ${
                          selectedDays.includes(day.id)
                            ? 'text-white font-semibold'
                            : 'text-text-primary'
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
          <View className="bg-background border-t border-divider">
            <TouchableOpacity
              className="p-4 items-end"
              onPress={() => setShowTimePicker(false)}
            >
              <Text className="text-primary font-semibold text-base">Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};



export default AddAlarmModal;