/**
 * Everything that knows the EX.CO player global lives here, so `ExcoPlayer`
 * only deals in "create a player in this element" and "destroy it".
 *
 * The embed script loads in `multiple` mode, where every mount creates its
 * own instance bound to its own element. The post page remounts per post and
 * the post modal mounts per open, so a single page-wide player would have to
 * survive being destroyed and initialized again on the same id.
 */

export type ExcoPlaybackMode = 'play-in-view' | 'click-to-play' | 'auto-play';

type ExcoStickyDevice = { enabled?: boolean };

export type ExcoInitOptions = {
  playbackMode?: ExcoPlaybackMode;
  mute?: boolean;
  content?: {
    playlistId?: string;
  };
  sticky?: {
    desktop?: ExcoStickyDevice;
    mobile?: ExcoStickyDevice;
  };
};

/** The player events the analytics read, out of everything EX.CO emits. */
export const EXCO_EVENTS = [
  'player-ready',
  'player-in',
  'player-muted',
  'player-unmuted',
  'player-sticky',
  'player-static',
  'player-closed',
  'content-start',
  'content-progress',
  'content-end',
  'content-error',
  'cta-clicked',
  'slot-start',
  'slot-auction-completed',
  'slot-end',
  'ad-impression',
  'ad-started',
  'ad-play',
  'ad-pause',
  'ad-first-quartile',
  'ad-midpoint',
  'ad-third-quartile',
  'ad-completed',
  'ad-skipped',
  'ad-clicked',
  'ad-error',
] as const;

export type ExcoEventName = (typeof EXCO_EVENTS)[number];

/**
 * The union of every event's metadata, all optional: which fields arrive
 * depends on the event (EX.CO's AdEvent, ContentEvent and player payloads).
 */
export type ExcoEventData = {
  playerId?: string;
  adId?: string;
  cpm?: number;
  skippable?: boolean;
  viewability?: boolean;
  clickUrl?: string;
  bid?: boolean;
  id?: string;
  title?: string;
  url?: string;
  progress?: number | { time?: number; duration?: number };
  duration?: number;
  error?: unknown;
};

export type ExcoPlayerInstance = {
  /** Every other call errors until the promise settles. */
  init: (options?: ExcoInitOptions) => Promise<void>;
  on: (name: ExcoEventName, listener: (data?: ExcoEventData) => void) => void;
  destroy: () => void;
};

type ExcoPlayerRegistry = {
  create: (options: { selector: string }) => Promise<ExcoPlayerInstance>;
};

declare global {
  interface Window {
    ExCoPlayer?: {
      connect: (playerId?: string) => ExcoPlayerRegistry;
    };
  }
}

export const getExcoPlayerScriptSrc = (playerId: string): string =>
  `https://player.ex.co/player/${playerId}`;

// One script per player id for the page's lifetime. A failure stays cached
// too: it is almost always a content blocker, which would block every retry.
const registries = new Map<string, Promise<ExcoPlayerRegistry>>();
const blockedPlayers = new Set<string>();

/** The player's script was blocked earlier in this page's lifetime. */
export const isExcoPlayerBlocked = (playerId: string): boolean =>
  blockedPlayers.has(playerId);

export const setExcoPlayerBlocked = (playerId: string): void => {
  blockedPlayers.add(playerId);
};

export const loadExcoPlayer = (
  playerId: string,
): Promise<ExcoPlayerRegistry> => {
  const cached = registries.get(playerId);

  if (cached) {
    return cached;
  }

  const registry = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.className = 'exco-player';
    script.src = getExcoPlayerScriptSrc(playerId);
    script.async = true;
    script.setAttribute('programmatic', 'true');
    script.setAttribute('multiple', 'true');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error('Failed to load the EX.CO player')),
    );
    document.head.appendChild(script);
  })
    .then(() => {
      if (!window.ExCoPlayer) {
        throw new Error('The EX.CO player script defined no API');
      }

      return window.ExCoPlayer.connect(playerId);
    })
    .catch((error) => {
      setExcoPlayerBlocked(playerId);
      throw error;
    });

  registries.set(playerId, registry);

  return registry;
};
