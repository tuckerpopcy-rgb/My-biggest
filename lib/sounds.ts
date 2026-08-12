import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let clickSound: Audio.Sound | null = null;
let successSound: Audio.Sound | null = null;
let notifySound: Audio.Sound | null = null;
let loaded = false;

export async function loadSounds() {
  if (loaded) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    const click = await Audio.Sound.createAsync(require('../assets/sounds/click.wav'), {
      volume: 0.45,
    });
    const success = await Audio.Sound.createAsync(require('../assets/sounds/success.wav'), {
      volume: 0.5,
    });
    const notify = await Audio.Sound.createAsync(require('../assets/sounds/notify.wav'), {
      volume: 0.5,
    });
    clickSound = click.sound;
    successSound = success.sound;
    notifySound = notify.sound;
    loaded = true;
  } catch {
    loaded = false;
  }
}

async function play(sound: Audio.Sound | null) {
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {
    /* ignore */
  }
}

export async function playClick(enabled: boolean) {
  if (!enabled) return;
  await play(clickSound);
}

export async function playSuccess(enabled: boolean) {
  if (!enabled) return;
  await play(successSound);
}

export async function playNotify(enabled: boolean) {
  if (!enabled) return;
  await play(notifySound);
}

export async function haptic(enabled: boolean, style: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (!enabled || Platform.OS === 'web') return;
  try {
    if (style === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (style === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (style === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* ignore */
  }
}
