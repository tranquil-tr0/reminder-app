import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import AlarmItem from '../components/AlarmItem';
import AddAlarmModal from '../components/AddAlarmModal';
import AlarmTriggeredModal from '../components/AlarmTriggeredModal';
import { loadAlarms, saveAlarms, updateAlarm, deleteAlarm } from '../utils/storageUtils';
import { getNextAlarmTime } from '../utils/alarmUtils';
import {
  requestNotificationPermissions,
  scheduleAlarmNotification,
  cancelAlarmNotification,
  addNotificationResponseHandler,
  addNotificationReceivedHandler,
} from '../utils/notificationUtils';
import Sounds from '../constants/Sounds';
import { Alarm } from '../types';

export default function AlarmScreen(): React.JSX.Element {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [triggeredAlarm, setTriggeredAlarm] = useState<Alarm | null>(null);
  const [notificationIds, setNotificationIds] = useState<Record<string, string>>({});

  // Initialize notifications and load alarms
  useEffect(() => {
    const initializeApp = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Alarm notifications require permission to work properly',
          [{ text: 'OK' }]
        );
      }
      await loadStoredAlarms();
    };

    initializeApp();

    // Set up notification handlers
    const notificationResponse = addNotificationResponseHandler(handleNotificationResponse);
    const notificationReceived = addNotificationReceivedHandler(handleNotificationReceived);

    return () => {
      notificationResponse();
      notificationReceived();
    };
  }, []);

  const loadStoredAlarms = async (): Promise<void> => {
    try {
      const storedAlarms = await loadAlarms();
      setAlarms(storedAlarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  };

  const handleSaveAlarm = async (alarm: Alarm): Promise<void> => {
    try {
      let updatedAlarms;
      if (selectedAlarm) {
        // Edit existing alarm
        updatedAlarms = alarms.map(a => 
          a.id === alarm.id ? alarm : a
        );
      } else {
        // Add new alarm
        updatedAlarms = [...alarms, alarm];
      }

      // Sort alarms by time
      updatedAlarms.sort((a, b) => {
        const nextTimeA = getNextAlarmTime(a);
        const nextTimeB = getNextAlarmTime(b);
        
        if (!nextTimeA && !nextTimeB) return 0;
        if (!nextTimeA) return 1;
        if (!nextTimeB) return -1;
        
        return nextTimeA.getTime() - nextTimeB.getTime();
      });

      await saveAlarms(updatedAlarms);
      setAlarms(updatedAlarms);
      setSelectedAlarm(null);
    } catch (error) {
      console.error('Error saving alarm:', error);
    }
  };

  const handleToggleAlarm = async (alarmId: string): Promise<void> => {
    try {
      const alarm = alarms.find(a => a.id === alarmId);
      if (!alarm) return;

      const updatedAlarm = await updateAlarm(alarmId, {
        enabled: !alarm.enabled
      });

      // Schedule or cancel notification based on enabled state
      if (updatedAlarm.enabled) {
        const notificationId = await scheduleAlarmNotification(updatedAlarm);
        if (notificationId) {
          setNotificationIds(prev => ({
            ...prev,
            [alarmId]: notificationId
          }));
        }
      } else {
        const notificationId = notificationIds[alarmId];
        if (notificationId) {
          await cancelAlarmNotification(notificationId);
          setNotificationIds(prev => {
            const updated = { ...prev };
            delete updated[alarmId];
            return updated;
          });
        }
      }

      setAlarms(current =>
        current.map(a => (a.id === alarmId ? updatedAlarm : a))
      );
    } catch (error) {
      console.error('Error toggling alarm:', error);
    }
  };

  const handleDeleteAlarm = async (alarmId: string): Promise<void> => {
    try {
      // Cancel notification if it exists
      const notificationId = notificationIds[alarmId];
      if (notificationId) {
        await cancelAlarmNotification(notificationId);
        setNotificationIds(prev => {
          const updated = { ...prev };
          delete updated[alarmId];
          return updated;
        });
      }

      await deleteAlarm(alarmId);
      setAlarms(current => current.filter(a => a.id !== alarmId));
    } catch (error) {
      console.error('Error deleting alarm:', error);
    }
  };

  const handlePressAlarm = (alarm: Alarm): void => {
    setSelectedAlarm(alarm);
    setModalVisible(true);
  };

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setSelectedAlarm(null);
  };

  const renderEmpty = (): React.JSX.Element => (
    <View className="flex-1 items-center justify-center pb-24">
      <Ionicons name="alarm-outline" size={48} color={Colors.textSecondary} />
      <View className="items-center mt-4">
        <Text className="text-lg font-semibold text-text-secondary mb-2">No alarms set</Text>
        <Text className="text-sm text-text-secondary text-center">
          Tap the + button to create an alarm
        </Text>
      </View>
    </View>
  );

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = (notification: any): void => {
    const alarmId = notification.request.content.data.alarmId;
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
      setTriggeredAlarm(alarm);
    }
  };

  // Handle received notification (when alarm triggers)
  const handleNotificationReceived = (notification: any): void => {
    const alarmId = notification.request.content.data.alarmId;
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
      setTriggeredAlarm(alarm);
    }
  };

  // Handle snooze action
  const handleSnooze = async (): Promise<void> => {
    if (!triggeredAlarm) return;

    // Create new alarm time 5 minutes from now
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + Sounds.SNOOZE_DURATION);

    const updatedAlarm = {
      ...triggeredAlarm,
      time: snoozeTime.toISOString(),
      days: [], // One-time alarm for snooze
    };

    // Schedule new notification
    const notificationId = await scheduleAlarmNotification(updatedAlarm);
    if (notificationId) {
      setNotificationIds(prev => ({
        ...prev,
        [updatedAlarm.id]: notificationId
      }));
    }

    setTriggeredAlarm(null);
  };

  // Handle dismiss action
  const handleDismiss = (): void => {
    setTriggeredAlarm(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={alarms}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AlarmItem
            alarm={item}
            onToggle={handleToggleAlarm}
            onPress={handlePressAlarm}
            onDelete={handleDeleteAlarm}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <TouchableOpacity
        className="absolute right-4 bottom-4 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <AddAlarmModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveAlarm}
        initialAlarm={selectedAlarm}
      />
      <AlarmTriggeredModal
        visible={!!triggeredAlarm}
        alarm={triggeredAlarm}
        onSnooze={handleSnooze}
        onDismiss={handleDismiss}
      />
    </SafeAreaView>
  );
}
