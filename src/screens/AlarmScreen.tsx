import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Surface,
  Snackbar,
  IconButton,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AlarmItem from '../components/AlarmItem';
import AddAlarmModal from '../components/AddAlarmModal';
import AlarmTriggeredModal from '../components/AlarmTriggeredModal';
import { loadAlarms, saveAlarms, updateAlarm, deleteAlarm } from '../utils/storageUtils';
import { getNextAlarmTime, getTimeUntilAlarm } from '../utils/alarmUtils';
import {
  requestNotificationPermissions,
  scheduleAlarmNotification,
  cancelAlarmNotification,
  addNotificationResponseHandler,
  addNotificationReceivedHandler,
  showAndroidSystemAlarms,
} from '../utils/notificationUtils';
import { isAndroidAlarmSupported } from '../utils/androidAlarmUtils';
import { Alarm } from '../types';

export default function AlarmScreen(): React.JSX.Element {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [triggeredAlarm, setTriggeredAlarm] = useState<Alarm | null>(null);
  const [notificationIds, setNotificationIds] = useState<Record<string, string>>({});
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const theme = usePaperTheme();

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
      let isNewAlarm = false;
      
      if (selectedAlarm) {
        // Edit existing alarm
        updatedAlarms = alarms.map(a =>
          a.id === alarm.id ? alarm : a
        );
      } else {
        // Add new alarm
        updatedAlarms = [...alarms, alarm];
        isNewAlarm = true;
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

      // Show toast notification if alarm is enabled and it's a new alarm or edit
      if (alarm.enabled) {
        const timeUntil = getTimeUntilAlarm(alarm);
        if (timeUntil) {
          const actionText = isNewAlarm ? 'Alarm set' : 'Alarm updated';
          setSnackbarMessage(`${actionText} - ${timeUntil}`);
          setSnackbarVisible(true);
        }
      }

      // Schedule notification for enabled alarms
      if (alarm.enabled) {
        const notificationId = await scheduleAlarmNotification(alarm);
        if (notificationId) {
          setNotificationIds(prev => ({
            ...prev,
            [alarm.id]: notificationId
          }));
          
          // Show additional message for Android users about system alarms
          if (isAndroidAlarmSupported() && notificationId.startsWith('android_alarm_')) {
            setTimeout(() => {
              setSnackbarMessage('Alarm set using Android system. You can manage it in your system alarm app.');
              setSnackbarVisible(true);
            }, 2000);
          }
        }
      }
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
          
          // Show appropriate message based on alarm type
          const timeUntil = getTimeUntilAlarm(updatedAlarm);
          if (timeUntil) {
            const message = isAndroidAlarmSupported() && notificationId.startsWith('android_alarm_')
              ? `Android system alarm enabled - ${timeUntil}`
              : `Alarm enabled - ${timeUntil}`;
            setSnackbarMessage(message);
            setSnackbarVisible(true);
          }
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
          
          // Show message about disabling Android alarms
          if (isAndroidAlarmSupported() && notificationId.startsWith('android_alarm_')) {
            setSnackbarMessage('Please disable the alarm in your system alarm app');
            setSnackbarVisible(true);
          }
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
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingBottom: 96, 
      paddingHorizontal: 24 
    }}>
      <Surface 
        style={{
          width: 128,
          height: 128,
          borderRadius: 64,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
          elevation: 2
        }}
      >
        <Surface
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.primaryContainer
          }}
        >
          <Ionicons 
            name="alarm-outline" 
            size={48} 
            color={theme.colors.primary} 
          />
        </Surface>
      </Surface>
      
      <View style={{ alignItems: 'center', maxWidth: 320 }}>
        <Text 
          variant="headlineMedium" 
          style={{ 
            color: theme.colors.onBackground,
            marginBottom: 8,
            textAlign: 'center'
          }}
        >
          Wake up on time
        </Text>
        <Text 
          variant="titleLarge" 
          style={{ 
            color: theme.colors.onSurfaceVariant,
            marginBottom: 16,
            textAlign: 'center'
          }}
        >
          No alarms set
        </Text>
        <Text 
          variant="bodyLarge" 
          style={{ 
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32
          }}
        >
          Create your first alarm to never oversleep again. Set multiple alarms for different days of the week.
        </Text>
        
        <FAB
          icon="plus"
          label="Create First Alarm"
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: theme.colors.primary
          }}
        />
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
    snoozeTime.setMinutes(snoozeTime.getMinutes());

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

  // Handle showing Android system alarms
  const handleShowSystemAlarms = async (): Promise<void> => {
    try {
      await showAndroidSystemAlarms();
    } catch (error) {
      console.error('Error showing system alarms:', error);
      Alert.alert(
        'Error',
        'Could not open system alarm app',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background 
      }}
    >
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
        style={{ paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
        }}
      />

      {/* Show system alarms button for Android */}
      {isAndroidAlarmSupported() && (
        <FAB
          icon="alarm"
          size="small"
          onPress={handleShowSystemAlarms}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 88,
            backgroundColor: theme.colors.secondaryContainer,
          }}
        />
      )}

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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{
          backgroundColor: theme.colors.inverseSurface,
        }}
      >
        <Text style={{ color: theme.colors.inverseOnSurface }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </SafeAreaView>
  );
}
