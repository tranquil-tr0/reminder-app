import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNextAlarmTime } from './alarmUtils';
import { setAndroidAlarm, isAndroidAlarmSupported, isAlarmResultSuccess } from './androidAlarmUtils';
import { Alarm } from '../types';
import { DateTriggerInput } from 'expo-notifications';

// Configure notifications for alarms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * @returns Promise resolving to boolean indicating if permissions were granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule notification for an alarm
 * @param alarm Alarm object to schedule notification for
 * @returns Promise resolving to notification identifier or result indicator
 */
export const scheduleAlarmNotification = async (alarm: Alarm): Promise<string | null> => {
  // Use Android system alarm if supported and available
  if (isAndroidAlarmSupported()) {
    try {
      const result = await setAndroidAlarm(alarm);
      if (isAlarmResultSuccess(result)) {
        // Return a success indicator for Android alarms
        // Note: Android system alarms don't return a traditional identifier
        return `android_alarm_${alarm.id}`;
      } else {
        console.warn('Android alarm was not set successfully, falling back to notification');
      }
    } catch (error) {
      console.error('Error setting Android alarm, falling back to notification:', error);
    }
  }

  // Fallback to expo-notifications for iOS or if Android alarm fails
  const nextAlarmTime = getNextAlarmTime(alarm);
  
  if (!nextAlarmTime) {
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: 'Time to wake up!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { alarmId: alarm.id },
      },
      trigger: {
        date: nextAlarmTime,
        channelId: Platform.OS === 'android' ? 'alarms' : undefined,
      } as DateTriggerInput,
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling alarm notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification or alarm
 * @param notificationId ID of the notification to cancel
 */
export const cancelAlarmNotification = async (notificationId: string): Promise<void> => {
  try {
    // Check if this is an Android alarm identifier
    if (notificationId.startsWith('android_alarm_')) {
      // Android system alarms are managed by the system alarm app
      // We can't programmatically cancel them, but we can show the alarms list
      console.log('Android alarm cannot be cancelled programmatically. User must disable it in the system alarm app.');
      return;
    }
    
    // Cancel expo-notifications scheduled notification
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling alarm notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllAlarmNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

/**
 * Show Android system alarms (opens system alarm app)
 * This is useful for users to manage their Android alarms
 */
export const showAndroidSystemAlarms = async (): Promise<void> => {
  if (isAndroidAlarmSupported()) {
    try {
      const { showAndroidAlarms } = await import('./androidAlarmUtils');
      await showAndroidAlarms();
    } catch (error) {
      console.error('Error showing Android system alarms:', error);
    }
  }
};

/**
 * Add notification response handler
 * @param handler Function to handle notification response
 * @returns Cleanup function
 */
export const addNotificationResponseHandler = (
  handler: (response: Notifications.NotificationResponse) => void
): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return () => subscription.remove();
};

/**
 * Add notification received handler
 * @param handler Function to handle received notification
 * @returns Cleanup function
 */
export const addNotificationReceivedHandler = (
  handler: (notification: Notifications.Notification) => void
): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return () => subscription.remove();
};