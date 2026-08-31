import { fromCDN } from '../../lib/links';

let shutter: HTMLAudioElement | null = null;

/**
 * One shared element rather than one per press: rewinding an existing clip is
 * instant, while a fresh Audio has to fetch and decode before it plays.
 */
export function playShutterSound(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!shutter) {
    shutter = new Audio(fromCDN('/sounds/shutter.mp3'));
    shutter.volume = 0.45;
  }

  shutter.currentTime = 0;
  // Autoplay policy rejects until the page has been interacted with, and the
  // capture must not fail because the sound did.
  shutter.play().catch(() => {});
}
