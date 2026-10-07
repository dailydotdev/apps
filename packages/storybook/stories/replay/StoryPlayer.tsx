import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import type { Candidate } from './catalog';
import type { FrameData } from './frames';
import type { Person } from './people';
import { ME } from './people';
import { actionsFor, FrameStyles, FrameThumb } from './frames';
import { useSnapshot } from './CardActions';

/**
 * The story viewer.
 *
 * Two decisions here are load-bearing rather than cosmetic:
 *
 * 1. Share is per frame, not one step at the end. A share button after the last
 *    frame only catches people who finished, and asks them to pick a favourite
 *    from memory. Every frame is authored to stand alone as an image, so every
 *    frame gets its own button.
 * 2. Sharing pays. The reward toast is the loop closing — the sharer gets an
 *    achievement, which is itself a thing worth showing off next week.
 */

const AUTO_ADVANCE_MS = 6000;

const playerCss = `
/* In production this is a full-screen dark overlay. It carries its own ground
   here too, because the progress bar and the share row are both white-on-dark
   and would vanish against the light theme otherwise. */
.rp-player {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 1.5rem;
  background: #0C0E13;
}
.rp-progress, .rp-actions, .rp-counter { width: 100%; }
/* Under the frame, not over it: the frame is the artifact and carries no
   chrome for a story it cannot page through. */
.rp-progress { display: flex; gap: 0.25rem; }
.rp-seg {
  flex: 1 1 0;
  min-width: 0;
  height: 3px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.2);
}
.rp-seg.is-done { background: rgb(255 255 255 / 0.42); }
.rp-seg.is-live { background: #F6F7F9; }

.rp-stage { position: relative; display: flex; justify-content: center; }
/* The house enter: opacity and a short rise with a blur, on a decelerating
   curve with no overshoot. It fires per frame, so advancing feels like a cut
   to a new card rather than a swap of text inside the same one. */
@keyframes rpFrameIn {
  from { opacity: 0; transform: translateY(10px) scale(0.99); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.rp-stage > * { animation: rpFrameIn 380ms cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Tap targets sit above the frame but below the controls. */
.rp-tap {
  position: absolute;
  inset: 0 auto 0 0;
  width: 32%;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 3;
}
.rp-tap.is-next { inset: 0 0 0 auto; width: 68%; }
.rp-tap:focus-visible { outline: 2px solid #F6F7F9; outline-offset: -4px; }
/* The tap zones are invisible until you go looking for them, which is fine on
   a phone and hopeless on a desktop review. A chevron fades in under the
   cursor so the gesture is discoverable without adding permanent chrome. */
.rp-tap::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 1.75rem;
  height: 1.75rem;
  margin-top: -0.875rem;
  border-radius: 50%;
  background: rgb(12 14 19 / 0.5) no-repeat center /
    0.7rem auto;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.16);
  opacity: 0;
  transition: opacity 160ms ease;
}
.rp-tap::after { left: 0.75rem; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F6F7F9' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 5l-7 7 7 7'/%3E%3C/svg%3E"); }
.rp-tap.is-next::after { left: auto; right: 0.75rem; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F6F7F9' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 5l7 7-7 7'/%3E%3C/svg%3E"); }
.rp-tap:hover::after { opacity: 1; }
@media (hover: none) { .rp-tap::after { display: none; } }

.rp-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 4;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 50%;
  background: rgb(12 14 19 / 0.55);
  color: #F6F7F9;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
}

.rp-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.rp-action {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  border-radius: 0.625rem;
  padding: 0.5rem 0.5rem;
  background: rgb(255 255 255 / 0.1);
  color: #F6F7F9;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background 150ms;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rp-action:hover { background: rgb(255 255 255 / 0.18); }
.rp-action:active { transform: scale(0.96); }
.rp-action.is-primary { background: #F6F7F9; color: #0C0E13; }
.rp-action:focus-visible { outline: 2px solid #F6F7F9; outline-offset: 2px; }

.rp-reward {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgb(87 224 135 / 0.14);
  color: #57E087;
  font-size: 0.75rem;
  font-weight: 600;
  animation: rpRise 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes rpRise {
  from { opacity: 0; transform: translateY(6px); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}

.rp-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: rgb(246 247 249 / 0.5);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .rp-stage > * { animation: none; }
  .rp-action { transition: none; }
  .rp-reward { animation: none; }
}
`;

export interface PlayerFrame {
  candidate: Candidate;
  data?: FrameData;
}

export interface StoryPlayerProps {
  frames: PlayerFrame[];
  startAt?: number;
  windowLabel?: string;
  person?: Person;
  autoAdvance?: boolean;
  onClose?: () => void;
  /** Fired with the candidate id, so the stories can show what got shared. */
  onShare?: (candidateId: string, channel: string) => void;
  /** Rendered width. The canvas is authored at 360 and scaled to fit. */
  width?: number;
}

export const StoryPlayer = ({
  frames,
  startAt = 0,
  windowLabel = 'W37',
  person = ME,
  autoAdvance = false,
  onClose,
  onShare,
  width = 320,
}: StoryPlayerProps): ReactElement => {
  const [index, setIndex] = useState(startAt);
  const [shared, setShared] = useState<string[]>([]);

  const current = frames[Math.min(index, frames.length - 1)];
  const atEnd = index >= frames.length - 1;

  const next = useCallback(() => {
    setIndex((value) => Math.min(value + 1, frames.length - 1));
  }, [frames.length]);

  const previous = useCallback(() => {
    setIndex((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    if (!autoAdvance || atEnd) {
      return undefined;
    }
    const timer = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [autoAdvance, atEnd, index, next]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        next();
      }
      if (event.key === 'ArrowLeft') {
        previous();
      }
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, previous, onClose]);

  const share = useCallback(
    (channel: string) => {
      const id = current.candidate.id;
      setShared((value) => (value.includes(id) ? value : [...value, id]));
      onShare?.(id, channel);
    },
    [current, onShare],
  );

  const justShared = useMemo(
    () => shared.includes(current.candidate.id),
    [shared, current],
  );

  const playerRef = useRef<HTMLDivElement>(null);
  const snap = useSnapshot(playerRef, `${current?.candidate.id ?? 'card'}-W37`);

  return (
    <div ref={playerRef} className="rp-player">
      <FrameStyles />
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: playerCss }} />


      <div className="rp-stage">
        <FrameThumb
          key={current.candidate.id}
          width={width}
          candidate={current.candidate}
          data={current.data}
          windowLabel={windowLabel}
          person={person}
        />
        <button
          type="button"
          className="rp-tap"
          onClick={previous}
          aria-label="Previous frame"
        />
        <button
          type="button"
          className="rp-tap is-next"
          onClick={next}
          aria-label="Next frame"
        />
        {onClose && (
          <button
            type="button"
            className="rp-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {justShared ? (
        <div className="rp-reward">
          <span aria-hidden>◆</span>
          <span>Shared. Signal Boost achievement unlocked.</span>
        </div>
      ) : (
        <div className="rp-actions">
          {(() => {
            const actions = actionsFor(current.candidate);
            return [
              <button
                key="snapshot"
                type="button"
                className="rp-action"
                onClick={snap.snapshot}
                disabled={snap.status === 'busy'}
              >
                {snap.status === 'done' ? 'Saved' : 'Snapshot'}
              </button>,
              ...[actions.primary, ...actions.rest].map((label, position) => (
                <button
                  key={label}
                  type="button"
                  className={`rp-action${position === 0 ? ' is-primary' : ''}`}
                  onClick={() => {
                    if (label === 'Copy image') {
                      snap.copy();
                    }
                    return actions.shares ? share(label) : undefined;
                  }}
                >
                  {label === 'Copy image' && snap.copied ? 'Copied' : label}
                </button>
              )),
            ];
          })()}
        </div>
      )}

      <div className="rp-progress">
        {frames.map((frame, position) => (
          <span
            key={frame.candidate.id}
            className={[
              'rp-seg',
              position < index ? 'is-done' : '',
              position === index ? 'is-live' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>

      <div className="rp-counter">
        {index + 1} / {frames.length} · {current.candidate.id}
      </div>
    </div>
  );
};
