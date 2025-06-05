import React, { useState } from 'react';
import {
  StyleSheet,
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
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {initialAlarm ? 'Edit Alarm' : 'Add Alarm'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={styles.timeDisplay}
                onPress={() => {
                  // For now, we'll use a simple time display
                  // In a real app, you'd implement a proper time picker modal
                }}
              >
                <Text style={styles.timeDisplayText}>
                  {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text style={styles.timeDisplayLabel}>Tap to change time</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.labelInput}
                placeholder="Alarm label"
                placeholderTextColor={Colors.textSecondary}
                value={label}
                onChangeText={setLabel}
                maxLength={30}
              />
            </View>

            <View style={styles.weekdaysContainer}>
              <Text style={styles.sectionTitle}>Repeat</Text>
              <View style={styles.weekdayButtons}>
                {WEEKDAYS.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.id) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.id) && styles.dayButtonTextSelected,
                      ]}
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


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  timePickerContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  timeDisplay: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  timeDisplayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  labelInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  weekdaysContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  weekdayButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayButtonTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default AddAlarmModal;