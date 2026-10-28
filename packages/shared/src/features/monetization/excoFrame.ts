import { webappUrl } from '../../lib/constants';
import type { ExcoEventData, ExcoEventName } from './exco';
import { getExcoErrorMessage } from './exco';
import type { ExcoPlayerFailure } from './ExcoPlayer';

/**
 * postMessage contract between the extension's post page (parent) and the
 * EX.CO embed page, which hosts the player on the webapp origin because
 * extension pages can't load remote scripts. The parent passes the ids in the
 * URL and removes the frame to destroy the player; the frame reports `ready`
 * once the page runs, then the player's events and failures.
 */

export const excoFramePath = 'embed/exco';

export const excoFrameSource = 'dd-exco-frame';

export const getExcoFrameUrl = ({
  playerId,
  playlistId,
}: {
  playerId: string;
  playlistId: string;
}): string =>
  `${webappUrl}${excoFramePath}?${new URLSearchParams({
    playerId,
    playlistId,
  })}`;

export type ExcoFrameMessage =
  | {
      source: typeof excoFrameSource;
      type: 'ready';
    }
  | {
      source: typeof excoFrameSource;
      type: 'event';
      name: ExcoEventName;
      data: ExcoEventData;
    }
  | {
      source: typeof excoFrameSource;
      type: 'error';
      reason: ExcoPlayerFailure;
      error?: string;
    };

export const isExcoFrameMessage = (data: unknown): data is ExcoFrameMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as ExcoFrameMessage).source === excoFrameSource &&
  ['ready', 'event', 'error'].includes((data as ExcoFrameMessage).type);

/**
 * The fields the analytics read, in a shape postMessage can clone: EX.CO's
 * payloads may carry errors and other objects that don't survive it.
 */
export const toExcoFrameEventData = (data: ExcoEventData): ExcoEventData => {
  const {
    playerId,
    adId,
    cpm,
    skippable,
    viewability,
    clickUrl,
    bid,
    id,
    title,
    url,
    progress,
    duration,
  } = data;

  return JSON.parse(
    JSON.stringify({
      playerId,
      adId,
      cpm,
      skippable,
      viewability,
      clickUrl,
      bid,
      id,
      title,
      url,
      progress,
      duration,
      error: getExcoErrorMessage(data),
    }),
  );
};
