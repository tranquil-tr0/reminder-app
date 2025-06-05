import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNextAlarmTime } from './alarmUtils.js';
import { Alarm } from '../types/index.js';
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
 * @returns Promise resolving to notification identifier or null
 */
export const scheduleAlarmNotification = async (alarm: Alarm): Promise<string | null> => {
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
 * Cancel a scheduled notification
 * @param notificationId ID of the notification to cancel
 */
export const cancelAlarmNotification = async (notificationId: string): Promise<void> => {
  try {
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