import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Candidate } from './catalog';
import type { FrameData } from './frames';
import { actionsFor, FrameStyles, FrameThumb } from './frames';
import { useSnapshot } from './CardActions';
import type { Person } from './people';
import { ME } from './people';

/**
 * The deck.
 *
 * A story is a slideshow: one card at a time, no sense that it is part of
 * anything. A deck is an object you hold. The two cards peeking out behind the
 * top one are doing the same job the opener's moment count does — they say
 * there is more without saying what — except physically, which is stronger.
 *
 * The one thing this deliberately does NOT copy from Tinder is the meaning of
 * the gesture. A swipe there is a judgement, and it destroys the card. There is
 * no judgement to make about your own week, and throwing away your own Top
 * Reader badge is a strange thing to ask someone to do. So a card thrown here
 * goes to the BACK of the deck: the gesture is the same, the tactility is the
 * same, and nothing is ever lost. You can keep going round.
 */

const THROW_THRESHOLD = 90;
const PEEK = 3;

export interface DeckCard {
  candidate: Candidate;
  data?: FrameData;
}

export interface CardDeckProps {
  cards: DeckCard[];
  width?: number;
  person?: Person;
  windowLabel?: string;
  onShare?: (candidateId: string, channel: string) => void;
  /** Fired every time the top card changes, with the new top card's id. */
  onTop?: (candidateId: string) => void;
}

const deckCss = `
/*
 * The deck has no surface of its own. An outer panel behind the cards reads as
 * a second object and makes it ambiguous what is actually draggable, so the
 * wrapper is transparent, sized to the card, and carries no padding.
 * The card is the only thing that looks like a thing.
 */
.rp-deck {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: none;
  padding: 0;
}
.rp-deck-stage { position: relative; display: flex; justify-content: center; }
.rp-deck-card {
  position: absolute;
  top: 0;
  left: 50%;
  /* The gesture belongs to the card, not to the space around it. */
  touch-action: none;
  transform-origin: 50% 90%;
  will-change: transform, opacity;
  cursor: grab;
  user-select: none;
}
.rp-deck-card.is-top { cursor: grab; z-index: 4; }
.rp-deck-card.is-top:active { cursor: grabbing; }
/* Only the top card animates back; the ones behind slide up as the stack
   shifts, which is the movement that makes it read as a deck. */
.rp-deck-card.is-settling { transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.rp-deck-card.is-behind { transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms; }
.rp-deck-card.is-gone { transition: transform 260ms ease-in, opacity 260ms ease-in; opacity: 0; }


/* The only position indicator. It lives under the card, in the viewer's
   chrome, so the card itself stays clean enough to export. */
.rp-deck-dots { display: flex; gap: 0.375rem; align-items: center; }
.rp-deck-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.22);
  transition: background 220ms cubic-bezier(0.16, 1, 0.3, 1), width 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.rp-deck-dot.is-live { width: 1.25rem; border-radius: 999px; background: #F6F7F9; }
@media (prefers-reduced-motion: reduce) { .rp-deck-dot { transition: none; } }

.rp-deck-hint {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(246 247 249 / 0.4);
  text-align: center;
}

.rp-deck-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.375rem; width: 100%; }
.rp-deck-action {
  flex: 0 1 auto;
  white-space: nowrap;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.5rem;
  background: rgb(255 255 255 / 0.1);
  color: #F6F7F9;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background 150ms;
}
.rp-deck-action:hover { background: rgb(255 255 255 / 0.18); }
.rp-deck-action:active { transform: scale(0.96); }
.rp-deck-action.is-primary { background: #F6F7F9; color: #0C0E13; }
.rp-deck-action:focus-visible { outline: 2px solid #F6F7F9; outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .rp-deck-card, .rp-deck-card.is-settling, .rp-deck-card.is-behind, .rp-deck-card.is-gone {
    transition: none;
  }
  .rp-deck-action { transition: none; }
}
`;

export const CardDeck = ({
  cards,
  width = 320,
  person = ME,
  windowLabel = 'W37',
  onShare,
  onTop,
}: CardDeckProps): ReactElement => {
  const deckRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [thrown, setThrown] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const height = (width * 16) / 9;
  const top = order[0];

  useEffect(() => {
    onTop?.(cards[top].candidate.id);
  }, [top, cards, onTop]);

  const cycle = useCallback((direction: number) => {
    setThrown(direction);
    window.setTimeout(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
      setThrown(null);
      setDrag(null);
    }, 220);
  }, []);

  const back = useCallback(() => {
    setOrder((current) => [
      current[current.length - 1],
      ...current.slice(0, -1),
    ]);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        cycle(1);
      }
      if (event.key === 'ArrowLeft') {
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cycle, back]);

  const onPointerDown = (event: React.PointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!start.current) {
      return;
    }
    setDrag({
      x: event.clientX - start.current.x,
      y: event.clientY - start.current.y,
    });
  };

  const onPointerUp = () => {
    if (drag && Math.abs(drag.x) > THROW_THRESHOLD) {
      cycle(drag.x > 0 ? 1 : -1);
    } else {
      setDrag(null);
    }
    start.current = null;
  };

  const visible = useMemo(() => order.slice(0, PEEK), [order]);

  const snap = useSnapshot(deckRef, `${cards[top]?.candidate.id ?? 'card'}-W37`);

  return (
    <div ref={deckRef} className="rp-deck" style={{ width }}>
      <FrameStyles />
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: deckCss }} />

      <div className="rp-deck-stage" style={{ width, height }}>
        {[...visible].reverse().map((cardIndex) => {
          const depth = visible.indexOf(cardIndex);
          const isTop = depth === 0;
          const card = cards[cardIndex];

          let transform = `translateX(-50%) translateY(${depth * 10}px) scale(${
            1 - depth * 0.05
          })`;

          if (isTop && thrown) {
            transform = `translateX(calc(-50% + ${thrown * 520}px)) rotate(${
              thrown * 26
            }deg)`;
          } else if (isTop && drag) {
            transform = `translateX(calc(-50% + ${drag.x}px)) translateY(${
              drag.y * 0.35
            }px) rotate(${drag.x / 22}deg)`;
          }

          return (
            <div
              key={card.candidate.id}
              className={[
                'rp-deck-card',
                isTop ? 'is-top' : 'is-behind',
                isTop && thrown ? 'is-gone' : '',
                isTop && !drag && !thrown ? 'is-settling' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                transform,
                opacity: depth === 0 ? 1 : 0.55 - depth * 0.15,
              }}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
            >
              <FrameThumb
                width={width}
                candidate={card.candidate}
                data={card.data}
                person={person}
                windowLabel={windowLabel}
              />
            </div>
          );
        })}
      </div>

      <div className="rp-deck-dots">
        {cards.map((card, index) => (
          <span
            key={card.candidate.id}
            className={`rp-deck-dot${index === order.indexOf(top) ? ' is-live' : ''}`}
          />
        ))}
      </div>

      <div className="rp-deck-actions">
        {(() => {
          const actions = actionsFor(cards[top].candidate);
          return [
            <button
              key="snapshot"
              type="button"
              className="rp-deck-action"
              onClick={snap.snapshot}
              disabled={snap.status === 'busy'}
            >
              {snap.status === 'done' ? 'Saved' : 'Snapshot'}
            </button>,
            ...[actions.primary, ...actions.rest].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`rp-deck-action${index === 0 ? ' is-primary' : ''}`}
                onClick={() => {
                  if (label === 'Copy image') {
                    snap.copy();
                  }
                  return actions.shares
                    ? onShare?.(cards[top].candidate.id, label)
                    : undefined;
                }}
              >
                {label === 'Copy image' && snap.copied ? 'Copied' : label}
              </button>
            )),
          ];
        })()}
      </div>

      <span className="rp-deck-hint">
        Drag the card · arrow keys work too
      </span>
    </div>
  );
};
