import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Candidate } from './catalog';
import type { FrameData } from './frames';
import type { Person } from './people';
import { ME } from './people';
import { FrameStyles, FrameThumb } from './frames';
import { DeliveryState } from './ranking';

/**
 * The entry point in the feed.
 *
 * The card is frame one rendered as a card, not an advert for frame one. Its
 * face is whatever the engine ranked first, so it is different every week and
 * different between two people on the same day — which is also why it does not
 * need a headline explaining what Replay is.
 *
 * Card chrome follows the app theme; the frame inside it does not, because it
 * is the same canvas that gets exported.
 */

export interface FeedCardProps {
  candidate: Candidate;
  data?: FrameData;
  state: DeliveryState;
  frameCount: number;
  resumeAtFrame?: number;
  windowLabel?: string;
  person?: Person;
  list?: boolean;
  onOpen?: () => void;
  onDismiss?: () => void;
}

const stateCopy = (
  state: DeliveryState,
  count: number,
  resumeAtFrame?: number,
): { label: string; cta: string } => {
  switch (state) {
    case DeliveryState.Resumable:
      return {
        label: `Picks up at ${resumeAtFrame ?? 1} of ${count}`,
        cta: 'Keep going',
      };
    case DeliveryState.Seen:
      return { label: `${count} moments`, cta: 'See your week again' };
    default:
      return { label: `${count} moments`, cta: 'Open your week' };
  }
};

export const FeedCard = ({
  candidate,
  data,
  state,
  frameCount,
  resumeAtFrame,
  windowLabel = 'W37',
  person = ME,
  list = false,
  onOpen,
  onDismiss,
}: FeedCardProps): ReactElement => {
  const copy = stateCopy(state, frameCount, resumeAtFrame);

  if (state === DeliveryState.Dismissed) {
    return (
      <div className="flex w-[21rem] max-w-full items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-text-quaternary typo-footnote">
        Dismissed. Nothing here again until Monday.
      </div>
    );
  }

  // Seen collapses to a single row. A daily visitor should not be handed the
  // same full-bleed card six days running.
  if (state === DeliveryState.Seen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-[21rem] max-w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <FrameStyles />
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: candidate.hue }}
        />
        <span className="flex flex-1 flex-col">
          <span className="font-bold text-text-primary typo-footnote">
            {copy.cta}
          </span>
          <span className="text-text-quaternary typo-caption2">
            Week 37 · {copy.label}
          </span>
        </span>
        <span className="text-text-quaternary typo-caption1">→</span>
      </button>
    );
  }

  return (
    <div
      className={classNames(
        'relative flex max-w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float',
        list ? 'w-[36rem] flex-row items-stretch' : 'w-[21rem] flex-col',
      )}
    >
      <FrameStyles />

      <div
        className={classNames(
          'flex shrink-0 justify-center',
          list ? 'p-3' : 'w-full p-3 pb-0',
        )}
      >
        <FrameThumb
          width={list ? 104 : 170}
          candidate={candidate}
          data={data}
          windowLabel={windowLabel}
          person={person}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="uppercase tracking-[0.14em] text-text-quaternary typo-caption2">
            Replay · Week 37
          </span>
          <span className="font-bold text-text-primary typo-callout">
            {state === DeliveryState.Resumable
              ? 'You left off part-way'
              : 'Your week is ready'}
          </span>
          <span className="text-text-tertiary typo-footnote">{copy.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote"
          >
            {copy.cta}
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="rounded-10 px-2 py-1.5 text-text-quaternary typo-footnote hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
