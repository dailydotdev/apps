import { webappUrl } from '../../lib/constants';
import type { ExcoEventData, ExcoEventName } from './exco';
import type { ExcoPlayerFailure } from './ExcoPlayer';

/**
 * postMessage contract between the extension's post page (parent) and the
 * EX.CO embed page, which hosts the player on the webapp origin because
 * extension pages can't load remote scripts. The parent passes the ids in the
 * URL and removes the frame to destroy the player; the frame only reports
 * the player's events and failures back.
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
      type: 'event';
      name: ExcoEventName;
      data: ExcoEventData;
    }
  | {
      source: typeof excoFrameSource;
      type: 'error';
      reason: ExcoPlayerFailure;
    };

export const isExcoFrameMessage = (data: unknown): data is ExcoFrameMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as ExcoFrameMessage).source === excoFrameSource &&
  ((data as ExcoFrameMessage).type === 'event' ||
    (data as ExcoFrameMessage).type === 'error');

/**
 * The fields the analytics read, in a shape postMessage can clone: EX.CO's
 * payloads may carry errors and other objects that don't survive it.
 */
export const toExcoFrameEventData = ({
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
  error,
}: ExcoEventData): ExcoEventData =>
  JSON.parse(
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
      error: error === undefined ? undefined : String(error),
    }),
  );
