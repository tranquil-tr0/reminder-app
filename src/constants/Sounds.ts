import { SoundConstants } from '../types';

/**
 * Sound configuration constants
 */
const sounds: SoundConstants = {
  // Default alarm sound
  DEFAULT_ALARM: {
    name: 'Default',
    path: require('../../assets/sounds/alarm.mp3'),
    volume: 1.0,
    vibrationPattern: [0, 250, 250, 250],
  },

  // Snooze duration in minutes
  SNOOZE_DURATION: 5,

  // Alarm volume fade configuration
  VOLUME_FADE: {
    initialVolume: 0.3,
    maxVolume: 1.0,
    fadeInDuration: 10000, // 10 seconds
    fadeSteps: 20,
  },
};

export default sounds;