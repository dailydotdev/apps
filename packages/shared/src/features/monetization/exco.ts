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

export type ExcoInitOptions = {
  playbackMode?: ExcoPlaybackMode;
  mute?: boolean;
  content?: {
    playlistId?: string;
  };
};

export type ExcoPlayerInstance = {
  /** Every other call errors until the promise settles. */
  init: (options?: ExcoInitOptions) => Promise<void>;
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
  }).then(() => {
    if (!window.ExCoPlayer) {
      throw new Error('The EX.CO player script defined no API');
    }

    return window.ExCoPlayer.connect(playerId);
  });

  registries.set(playerId, registry);

  return registry;
};
