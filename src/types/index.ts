import { NotificationTriggerInput } from 'expo-notifications';

// Alarm Types
export interface Alarm {
  id: string;
  time: string;
  label: string;
  days: number[];
  enabled: boolean;
  createdAt: string;
  notificationId?: string;
}

export interface CreateAlarmParams {
  hours: number;
  minutes: number;
  label?: string;
  days?: number[];
  enabled?: boolean;
}

// Sound Types
export interface SoundConfig {
  name: string;
  path: any; // Required asset
  volume: number;
  vibrationPattern: number[];
}

export interface VolumeFadeConfig {
  initialVolume: number;
  maxVolume: number;
  fadeInDuration: number;
  fadeSteps: number;
}

export interface SoundConstants {
  DEFAULT_ALARM: SoundConfig;
  SNOOZE_DURATION: number;
  VOLUME_FADE: VolumeFadeConfig;
}

// Colors Types
export interface Colors {
  primary: string;
  background: string;
  surface: string;
  tabBarBackground: string;
  tabBarInactive: string;
  tabBarActive: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  error: string;
  success: string;
}

// Navigation Types
export type RootTabParamList = {
  Alarm: undefined;
  Clock: undefined;
  Stopwatch: undefined;
  Timer: undefined;
};

export type AlarmScreenParams = undefined;
export type ClockScreenParams = undefined;
export type StopwatchScreenParams = undefined;
export type TimerScreenParams = undefined;