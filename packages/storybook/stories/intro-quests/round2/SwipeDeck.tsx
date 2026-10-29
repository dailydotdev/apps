import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { QuestId } from '../data';
import { introQuests } from '../data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
  QuestGlyph,
  RewardTag,
  SegmentMeter,
} from '../kit';
import { useSim } from '../sim';
import { QuestPreview } from './previews';

// 9 · The deck. A stack of cards, one decision on top: do it, or send it to
// the back. Hick's law in physical form, and it is the natural shape on a
// phone (drag the card left to defer it). Deferred cards come back around
// with a "Saved for later" tag instead of vanishing.

const SWIPE_THRESHOLD = 80;

export const SwipeDeck = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [order, setOrder] = useState<QuestId[]>(() =>
    introQuests.map(({ id }) => id),
  );
  const [deferred, setDeferred] = useState<QuestId[]>([]);
  const [leaving, setLeaving] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef<number | null>(null);
  const deck = order
    .map((id) => introQuests.find((quest) => quest.id === id)!)
    .filter(
      (quest) => sim.phaseOf(quest.id) !== 'claimed' && !sim.isBlockedBy(quest),
    );
  const [top, ...under] = deck;
  const blockedLeft = introQuests.filter(
    (quest) => sim.phaseOf(quest.id) !== 'claimed' && sim.isBlockedBy(quest),
  );

  const sendToBack = () => {
    if (!top || leaving) {
      return;
    }

    setLeaving(true);
    window.setTimeout(() => {
      setOrder((value) => [...value.filter((id) => id !== top.id), top.id]);
      setDeferred((value) => [...value, top.id]);
      setLeaving(false);
      setDragX(0);
    }, 220);
  };

  if (!top && blockedLeft.length === 0) {
    return (
      <PopupShell device={device} width="28rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="28rem">
      <div className="flex flex-col gap-4 p-6">
        <header className="flex flex-col gap-2 pr-8">
          <p className="iq-tabular font-bold text-text-tertiary typo-footnote">
            {deck.length} {deck.length === 1 ? 'card' : 'cards'} left
          </p>
          <SegmentMeter />
        </header>

        {top && (
          <div className="relative mb-7" style={{ minHeight: '27rem' }}>
            {under.slice(0, 2).map((quest, index) => (
              <div
                key={quest.id}
                aria-hidden
                className="absolute inset-x-0 top-0 h-full rounded-24 border border-border-subtlest-tertiary bg-background-subtle transition-transform duration-300"
                style={{
                  transform: `translateY(${(index + 1) * 14}px) scale(${
                    1 - (index + 1) * 0.05
                  })`,
                  zIndex: 1 - index,
                }}
              />
            ))}
            <article
              key={top.id}
              onPointerDown={(event) => {
                if ((event.target as HTMLElement).closest('button')) {
                  return;
                }
                dragStart.current = event.clientX;
                (event.currentTarget as HTMLElement).setPointerCapture(
                  event.pointerId,
                );
              }}
              onPointerMove={(event) => {
                if (dragStart.current !== null) {
                  setDragX(Math.min(0, event.clientX - dragStart.current));
                }
              }}
              onPointerUp={() => {
                dragStart.current = null;

                if (dragX < -SWIPE_THRESHOLD) {
                  sendToBack();
                  return;
                }

                setDragX(0);
              }}
              className={classNames(
                'iq-rise iq-elevated absolute inset-0 z-2 flex touch-pan-y select-none flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-default p-5',
                dragX === 0 && 'transition-transform duration-200',
              )}
              style={{
                transform: leaving
                  ? 'translateX(-120%) rotate(-8deg)'
                  : `translateX(${dragX}px) rotate(${dragX / 30}deg)`,
                transition: leaving
                  ? 'transform 220ms ease-in, opacity 220ms'
                  : undefined,
                opacity: leaving ? 0 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <QuestGlyph quest={top} size="lg" showDone={false} />
                <div className="flex flex-col items-end gap-1">
                  <RewardTag xp={top.xp} cores={top.cores} />
                  {deferred.includes(top.id) && (
                    <span className="rounded-max bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2">
                      Saved for later
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="iq-balance font-bold text-text-primary typo-title2">
                  {top.name}
                </h2>
                <p className="iq-pretty text-text-secondary typo-callout">
                  {top.pitch}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-16 bg-background-subtle p-3">
                <QuestPreview id={top.id} />
              </div>
              <div className="empty:hidden">
                <QuestDetail quest={top} compact />
              </div>
              <QuestCta quest={top} size={ButtonSize.Large} block />
            </article>
          </div>
        )}

        {!top && blockedLeft.length > 0 && (
          <p className="text-center text-text-tertiary typo-callout">
            Only {blockedLeft[0].name.toLowerCase()} is left, and it needs your
            API key first.
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={sendToBack}
            disabled={!top || deck.length < 2}
          >
            Later
          </Button>
          <span className="text-text-quaternary typo-caption1">
            {device === 'mobile'
              ? 'Swipe left for later'
              : 'Drag left for later'}
          </span>
          <HideForever />
        </div>
      </div>
    </PopupShell>
  );
};
