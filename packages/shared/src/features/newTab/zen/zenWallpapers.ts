import { zenWallpaperGradients } from '../../../styles/custom';

// Six curated gradient wallpapers tuned to feel like different times of day.
// They're pure CSS so they render instantly without a network round-trip and
// don't bloat the Zen bundle. When we introduce photo wallpapers (Plus) we'll
// extend this list with `{ kind: 'image'; src: string }` entries.
export interface ZenWallpaper {
  id: keyof typeof zenWallpaperGradients;
  label: string;
  gradient: string;
  // Tailwind-compatible color token used for the semi-opaque tint layer.
  overlayClassName: string;
}

export const ZEN_WALLPAPERS: ZenWallpaper[] = [
  {
    id: 'dawn',
    label: 'Dawn',
    gradient: zenWallpaperGradients.dawn,
    overlayClassName: 'bg-overlay-quaternary-cabbage',
  },
  {
    id: 'noon',
    label: 'Noon',
    gradient: zenWallpaperGradients.noon,
    overlayClassName: 'bg-overlay-quaternary-blueCheese',
  },
  {
    id: 'forest',
    label: 'Forest',
    gradient: zenWallpaperGradients.forest,
    overlayClassName: 'bg-overlay-quaternary-avocado',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    gradient: zenWallpaperGradients.sunset,
    overlayClassName: 'bg-overlay-quaternary-ketchup',
  },
  {
    id: 'night',
    label: 'Night',
    gradient: zenWallpaperGradients.night,
    overlayClassName: 'bg-overlay-quaternary-onion',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    gradient: zenWallpaperGradients.aurora,
    overlayClassName: 'bg-overlay-quaternary-lettuce',
  },
];

// "auto" is a sentinel — the resolver checks for it explicitly and delegates
// to `pickWallpaperForTime`. We default to auto so a fresh Zen homepage
// always feels contextual (dawn gradient at 7am, night at 11pm) instead of
// landing on a flat green that's jarring for first-time users.
export const DEFAULT_WALLPAPER_ID: ZenWallpaper['id'] | 'auto' = 'auto';

export const getWallpaperById = (id: string): ZenWallpaper =>
  ZEN_WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? ZEN_WALLPAPERS[0];

// Picks a wallpaper based on local time so the default feel matches the
// moment. Users can still override in settings. Evening (>=20) reuses
// "night" rather than "aurora" — aurora's green reads as a mistake when it
// appears without the user opting in.
export const pickWallpaperForTime = (date: Date = new Date()): ZenWallpaper => {
  const hour = date.getHours();
  if (hour < 6) {
    return getWallpaperById('night');
  }
  if (hour < 10) {
    return getWallpaperById('dawn');
  }
  if (hour < 16) {
    return getWallpaperById('noon');
  }
  if (hour < 20) {
    return getWallpaperById('sunset');
  }
  return getWallpaperById('night');
};
