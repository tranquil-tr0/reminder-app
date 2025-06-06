import { Alarm, CreateAlarmParams } from '../types/index.js';

/**
 * Format time to 12-hour format with AM/PM
 * @param date Date object to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format weekdays for display
 * @param days Array of day indices (0-6, where 0 is Sunday)
 * @returns Formatted weekday string
 */
export const formatWeekdays = (days: number[]): string => {
  if (!days || days.length === 0) return 'One time';
  if (days.length === 7) return 'Every day';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.sort().map(day => dayNames[day]).join(', ');
};

/**
 * Create a new alarm object
 * @param params Parameters for creating an alarm
 * @returns New alarm object
 */
export const createAlarm = ({
  hours,
  minutes,
  label = '',
  days = [],
  enabled = true
}: CreateAlarmParams): Alarm => {
  const now = new Date();
  const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  return {
    id: Math.random().toString(36).substr(2, 9),
    time: time.toISOString(),
    label,
    days,
    enabled,
    createdAt: new Date().toISOString()
  };
};

/**
 * Calculate next alarm time
 * @param alarm Alarm object
 * @returns Date object of next alarm time or null if no next time
 */
export const getNextAlarmTime = (alarm: Alarm): Date | null => {
  const now = new Date();
  const alarmTime = new Date(alarm.time);
  
  // If no repeat days and alarm time has passed, return null
  if (!alarm.days.length && alarmTime < now) {
    return null;
  }

  // If no repeat days and alarm time is in future, return the time
  if (!alarm.days.length && alarmTime > now) {
    return alarmTime;
  }

  // Find next occurrence for repeating alarms
  const currentDay = now.getDay();
  const sortedDays = [...alarm.days].sort();
  
  // Find next day
  const nextDay = sortedDays.find(day => {
    if (day === currentDay) {
      return alarmTime > now;
    }
    return day > currentDay;
  }) ?? sortedDays[0];

  // Calculate days to add
  let daysToAdd = nextDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  const nextTime = new Date(alarmTime);
  nextTime.setDate(now.getDate() + daysToAdd);
  
  return nextTime;
};

/**
 * Calculate time until alarm and format as human-readable string
 * @param alarm Alarm object
 * @returns Human-readable string like "in 4 hours" or "in 2 days 3 hours"
 */
export const getTimeUntilAlarm = (alarm: Alarm): string | null => {
  const nextAlarmTime = getNextAlarmTime(alarm);
  if (!nextAlarmTime) return null;

  const now = new Date();
  const timeDiff = nextAlarmTime.getTime() - now.getTime();
  
  if (timeDiff <= 0) return null;

  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `in ${days} day${days === 1 ? '' : 's'}`;
    }
    return `in ${days} day${days === 1 ? '' : 's'} ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `in ${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `in ${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
  } else if (minutes > 0) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    return 'in less than a minute';
  }
};