import type { Ad } from '../../graphql/posts';

const STORAGE_KEY = 'squad_boost_clicks';
export const SQUAD_BOOST_CLICK_TTL_MS = 30 * 60 * 1000;

interface SquadBoostClick {
  squadId: string;
  genId: string;
  timestamp: number;
}

function readClicks(): SquadBoostClick[] {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    const clicks = stored ? (JSON.parse(stored) as SquadBoostClick[]) : [];
    const now = Date.now();

    return clicks.filter(
      (click) => now - click.timestamp < SQUAD_BOOST_CLICK_TTL_MS,
    );
  } catch {
    return [];
  }
}

function writeClicks(clicks: SquadBoostClick[]): void {
  try {
    if (clicks.length) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage blocked (private mode, quota) so only joins on the card count.
  }
}

/**
 * Remembers a click on a promoted squad card, so joining that squad from its
 * page later in the session is still credited to the boost.
 */
export function storeSquadBoostClick(ad: Ad): void {
  const squadId = ad.data?.source?.id;
  const genId = ad.generationId;

  if (!squadId || !genId) {
    return;
  }

  const clicks = readClicks().filter((click) => click.squadId !== squadId);
  writeClicks([...clicks, { squadId, genId, timestamp: Date.now() }]);
}

/**
 * Returns the generation id of a recent promoted-card click for this squad and
 * forgets it, so a click credits one join at most.
 */
export function consumeSquadBoostClick(squadId: string): string | undefined {
  const clicks = readClicks();
  const click = clicks.find((item) => item.squadId === squadId);

  if (!click) {
    return undefined;
  }

  writeClicks(clicks.filter((item) => item !== click));

  return click.genId;
}
