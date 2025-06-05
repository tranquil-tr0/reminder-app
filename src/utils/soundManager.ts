import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

interface SoundManagerState {
  sound: Audio.Sound | null;
  isLoaded: boolean;
  isPlaying: boolean;
  vibrationInterval: number | null;
}

class SoundManager implements SoundManagerState {
  sound: Audio.Sound | null = null;
  isLoaded: boolean = false;
  isPlaying: boolean = false;
  vibrationInterval: number | null = null;

  /**
   * Load and cache alarm sound
   */
  async loadSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        {
          isLooping: true,
          shouldPlay: false,
          volume: 1.0,
        },
        this._onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading sound:', error);
      this.isLoaded = false;
    }
  }

  /**
   * Start playing alarm sound with haptic feedback
   */
  async playAlarm(): Promise<void> {
    try {
      if (!this.isLoaded) {
        await this.loadSound();
      }

      // Configure audio session for alarm
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Start vibration pattern
      this.startVibrationPattern();

      // Play sound
      if (this.sound) {
        await this.sound.playAsync();
      }
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  }

  /**
   * Stop alarm sound and haptics
   */
  async stopAlarm(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.stopAsync();
        this.isPlaying = false;
      }
      
      // Stop vibration
      this.stopVibrationPattern();
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  }

  /**
   * Set alarm volume
   * @param volume - Volume level (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.sound) {
        await this.stopAlarm();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
      }
    } catch (error) {
      console.error('Error cleaning up sound:', error);
    }
  }

  private startVibrationPattern(): void {
    // Clear any existing interval
    this.stopVibrationPattern();

    // Create vibration pattern that repeats every 2 seconds
    this.vibrationInterval = setInterval(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 2000);
  }

  private stopVibrationPattern(): void {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
  }

  // Private methods
  private _onPlaybackStatusUpdate = (status: any): void => {
    if (status.isLoaded) {
      this.isPlaying = status.isPlaying;
    }
  };
}

// Export singleton instance
export default new SoundManager();