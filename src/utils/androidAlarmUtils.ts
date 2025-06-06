import { Platform } from 'react-native';
import { setAlarm, showAlarms } from 'expo-alarm';
import { Alarm } from '../types';

// Import types directly from the types file since they're not exported from index
interface SetAlarmParams {
  hour?: number;
  minutes?: number;
  days?: number[];
  message?: string;
  ringtoneUri?: string;
  vibrate?: boolean;
  skipUi?: boolean;
}

interface AlarmResult {
  resultCode: ResultCode;
  data?: string;
  extra?: object;
}

enum ResultCode {
  Success = -1,
  Canceled = 0,
  FirstUser = 1,
}

/**
 * Set an alarm using Android's system alarm app via expo-alarm
 * @param alarm Alarm object to set
 * @returns Promise resolving to AlarmResult
 */
export const setAndroidAlarm = async (alarm: Alarm): Promise<AlarmResult | null> => {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const alarmTime = new Date(alarm.time);
    
    const setAlarmParams: SetAlarmParams = {
      hour: alarmTime.getHours(),
      minutes: alarmTime.getMinutes(),
      days: alarm.days.length > 0 ? alarm.days : undefined,
      message: alarm.label || 'Alarm',
      vibrate: true,
      skipUi: false, // Show the alarm UI for user confirmation
    };

    const result = await setAlarm(setAlarmParams);
    return result;
  } catch (error) {
    console.error('Error setting Android alarm:', error);
    return null;
  }
};

/**
 * Show all alarms in the system alarm app
 * @returns Promise resolving to AlarmResult
 */
export const showAndroidAlarms = async (): Promise<AlarmResult | null> => {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const result = await showAlarms({});
    return result;
  } catch (error) {
    console.error('Error showing Android alarms:', error);
    return null;
  }
};

/**
 * Check if expo-alarm is available and supported
 */
export const isAndroidAlarmSupported = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Check if an alarm result indicates success
 */
export const isAlarmResultSuccess = (result: AlarmResult | null): boolean => {
  return result?.resultCode === ResultCode.Success;
};