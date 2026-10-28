import { useCallback, useRef, useState } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { AdActions } from '../../lib/ads';
import { LogEvent, TargetType } from '../../lib/log';
import type { ExcoEventData, ExcoEventName } from './exco';
import { getExcoErrorMessage } from './exco';
import type { ExcoPlayerFailure } from './ExcoPlayer';
import { useViewability } from './useViewability';
import { videoCriteria, viewabilityLogExtra } from './viewability';

export type ExcoPlacement = 'rail' | 'inline';

interface UseExcoPlayerLoggingProps {
  playerId: string;
  playlistId: string;
  placement: ExcoPlacement;
}

interface UseExcoPlayerLogging {
  onEvent: (
    name: ExcoEventName,
    data: ExcoEventData,
    element: HTMLElement,
  ) => void;
  onError: (reason: ExcoPlayerFailure, error?: string) => void;
}

const adQuartiles: Partial<Record<ExcoEventName, number>> = {
  'ad-first-quartile': 25,
  'ad-midpoint': 50,
  'ad-third-quartile': 75,
};

const stickyActions: Partial<Record<ExcoEventName, string>> = {
  'player-sticky': 'stick',
  'player-static': 'unstick',
  'player-closed': 'close',
};

const contentExtra = (data: ExcoEventData): Record<string, unknown> => ({
  content_id: data.id,
  title: data.title,
  duration: data.duration,
});

/**
 * The error, plus the payload's field names while EX.CO's error payloads
 * stay undocumented, so a missing message can still be traced.
 */
const errorExtra = (data: ExcoEventData): Record<string, unknown> => ({
  error: getExcoErrorMessage(data) ?? null,
  error_fields: Object.keys(data).sort().join(','),
});

const adExtra = (data: ExcoEventData): Record<string, unknown> => ({
  ad_id: data.adId,
  cpm: data.cpm,
  skippable: data.skippable,
  ad_viewability: data.viewability,
});

/**
 * Logs the EX.CO player in three groups:
 * - The player: impression, load, errors, content progress, sound, sticky and
 *   the "Go to post" click, under target_type `video player`.
 * - Its ad breaks: the Kueez slots' request, fill and empty events, so fill
 *   rate is one query across providers.
 * - Its video ads: the internal ads' AdActions with ad_provider_id `exco`
 *   (impression with cpm, MRC video viewable impression, click), plus
 *   `video ad progress` for the start, quartiles, completion and skip.
 */
export const useExcoPlayerLogging = ({
  playerId,
  playlistId,
  placement,
}: UseExcoPlayerLoggingProps): UseExcoPlayerLogging => {
  const { logEvent } = useLogContext();
  const [ad, setAd] = useState({ sequence: 0, isPlaying: false });
  const adIdRef = useRef<string>();
  const hasLoggedImpression = useRef(false);

  const getExtra = useCallback(
    (extra?: Record<string, unknown>): string =>
      JSON.stringify({
        provider: 'exco',
        format: 'video',
        surface: 'post',
        placement,
        player_id: playerId,
        playlist_id: playlistId,
        ...extra,
      }),
    [placement, playerId, playlistId],
  );

  const logPlayerEvent = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.VideoPlayer,
        target_id: playerId,
        extra: getExtra(extra),
      }),
    [getExtra, logEvent, playerId],
  );

  const logSlotEvent = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) =>
      logEvent({ event_name: eventName, extra: getExtra(extra) }),
    [getExtra, logEvent],
  );

  const logAdEvent = useCallback(
    (
      eventName: LogEvent | AdActions,
      data: ExcoEventData,
      extra?: Record<string, unknown>,
    ) =>
      logEvent({
        event_name: eventName,
        target_type: 'ad',
        target_id: data.adId ?? adIdRef.current ?? playerId,
        ad_provider_id: 'exco',
        extra: getExtra({ ...adExtra(data), ...extra }),
      }),
    [getExtra, logEvent, playerId],
  );

  const { ref: setViewabilityElement } = useViewability<HTMLElement>({
    enabled: ad.isPlaying,
    trackingKey: `${ad.sequence}`,
    criteria: videoCriteria,
    onViewable: (data) =>
      logAdEvent(AdActions.Viewable, {}, viewabilityLogExtra(data)),
  });

  const setAdPlaying = (isPlaying: boolean) =>
    setAd((current) => ({ ...current, isPlaying }));

  const onEvent = (
    name: ExcoEventName,
    data: ExcoEventData,
    element: HTMLElement,
  ) => {
    switch (name) {
      case 'player-ready':
        // The player's own box: sticky mode moves it out of our container.
        setViewabilityElement(
          element.querySelector<HTMLElement>('.pbs__player') ?? element,
        );
        logPlayerEvent(LogEvent.VideoPlayerLoad);
        break;
      case 'player-in':
        if (!hasLoggedImpression.current) {
          hasLoggedImpression.current = true;
          logPlayerEvent(LogEvent.Impression);
        }
        break;
      case 'player-muted':
      case 'player-unmuted':
        logPlayerEvent(LogEvent.VideoSound, {
          muted: name === 'player-muted',
        });
        break;
      case 'player-sticky':
      case 'player-static':
      case 'player-closed':
        logPlayerEvent(LogEvent.VideoSticky, { action: stickyActions[name] });
        break;
      case 'content-start':
        logPlayerEvent(LogEvent.VideoProgress, {
          milestone: 'start',
          ...contentExtra(data),
        });
        break;
      case 'content-progress':
        logPlayerEvent(LogEvent.VideoProgress, {
          milestone: typeof data.progress === 'number' ? data.progress : null,
          ...contentExtra(data),
        });
        break;
      case 'content-end':
        logPlayerEvent(LogEvent.VideoProgress, {
          milestone: 'complete',
          ...contentExtra(data),
        });
        break;
      case 'content-error':
        logPlayerEvent(LogEvent.VideoPlayerError, {
          reason: 'content_error',
          ...contentExtra(data),
          ...errorExtra(data),
        });
        break;
      case 'cta-clicked':
        logPlayerEvent(LogEvent.Click, {
          cta: 'go to post',
          url: data.url,
          title: data.title,
        });
        break;
      case 'slot-start':
        logSlotEvent(LogEvent.RequestAdSlot);
        break;
      case 'slot-auction-completed':
        if (data.bid) {
          logSlotEvent(LogEvent.FillAdSlot);
        } else {
          logSlotEvent(LogEvent.EmptyAdSlot, { reason: 'no_bid' });
        }
        break;
      case 'ad-impression':
        logAdEvent(AdActions.Impression, data);
        break;
      case 'ad-started':
        adIdRef.current = data.adId;
        setAd((current) => ({
          sequence: current.sequence + 1,
          isPlaying: true,
        }));
        logAdEvent(LogEvent.VideoAdProgress, data, { milestone: 'start' });
        break;
      case 'ad-play':
        setAdPlaying(true);
        break;
      case 'ad-pause':
        setAdPlaying(false);
        break;
      case 'ad-first-quartile':
      case 'ad-midpoint':
      case 'ad-third-quartile':
        logAdEvent(LogEvent.VideoAdProgress, data, {
          milestone: adQuartiles[name],
        });
        break;
      case 'ad-completed':
      case 'ad-skipped':
        setAdPlaying(false);
        logAdEvent(LogEvent.VideoAdProgress, data, {
          milestone: name === 'ad-completed' ? 'complete' : 'skip',
        });
        break;
      case 'ad-clicked':
        logAdEvent(AdActions.Click, data, { click_url: data.clickUrl });
        break;
      case 'ad-error':
        setAdPlaying(false);
        logSlotEvent(LogEvent.AdSlotError, {
          error_type: 'ad_error',
          ...errorExtra(data),
        });
        break;
      case 'slot-end':
        setAdPlaying(false);
        break;
      default:
        break;
    }
  };

  // A blocked script is a content blocker in the reader's browser, not a
  // player failure: it never loads for that reader (Oct 2026: 3 of ~1.1K
  // blocked readers ever loaded it). It gets its own event so the error rate
  // tracks the failures we can act on.
  const onError = (reason: ExcoPlayerFailure, error?: string) =>
    logPlayerEvent(
      reason === 'blocked'
        ? LogEvent.VideoPlayerBlocked
        : LogEvent.VideoPlayerError,
      { reason, error: error ?? null },
    );

  return { onEvent, onError };
};
