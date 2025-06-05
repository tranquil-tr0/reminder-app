import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types/index.js';

const ALARMS_STORAGE_KEY = '@alarms';

/**
 * Save alarms to AsyncStorage
 * @param alarms Array of alarms to save
 */
export const saveAlarms = async (alarms: Alarm[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
  } catch (error) {
    console.error('Error saving alarms:', error);
    throw error;
  }
};

/**
 * Load alarms from AsyncStorage
 * @returns Promise resolving to array of alarms
 */
export const loadAlarms = async (): Promise<Alarm[]> => {
  try {
    const alarmsJson = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
    return alarmsJson ? JSON.parse(alarmsJson) : [];
  } catch (error) {
    console.error('Error loading alarms:', error);
    return [];
  }
};

/**
 * Update a single alarm in storage
 * @param alarmId ID of the alarm to update
 * @param updates Partial alarm object with updates
 * @returns Updated alarm object
 */
export const updateAlarm = async (
  alarmId: string, 
  updates: Partial<Alarm>
): Promise<Alarm> => {
  try {
    const alarms = await loadAlarms();
    const alarmIndex = alarms.findIndex(alarm => alarm.id === alarmId);
    
    if (alarmIndex === -1) {
      throw new Error('Alarm not found');
    }

    alarms[alarmIndex] = { ...alarms[alarmIndex], ...updates };
    await saveAlarms(alarms);
    
    return alarms[alarmIndex];
  } catch (error) {
    console.error('Error updating alarm:', error);
    throw error;
  }
};

/**
 * Delete an alarm from storage
 * @param alarmId ID of the alarm to delete
 */
export const deleteAlarm = async (alarmId: string): Promise<void> => {
  try {
    const alarms = await loadAlarms();
    const updatedAlarms = alarms.filter(alarm => alarm.id !== alarmId);
    await saveAlarms(updatedAlarms);
  } catch (error) {
    console.error('Error deleting alarm:', error);
    throw error;
  }
};