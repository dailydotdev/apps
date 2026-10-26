import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { FeedHeroProviders } from '../features/feed/feedHero.mocks';
import { HeroInFeed } from './widgets/frame';
import { campaignStrips } from './widgets/adSlot';
import type { RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';

/*
 * The stage for the internal promo film. A capture script drives it frame
 * by frame through window.__promo: captions, phases and the spotlight. The
 * product inside is the real rail, not a mock-up.
 */

const meta: Meta = {
  title: 'Hero Cover/Archive/Promo film stage',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Caption = { kicker: string; title: string; sub: string };
type Phase = 'intro' | 'stage' | 'end';
type Spot = { x: number; y: number; w: number; h: number } | null;

type PromoApi = {
  caption: (caption: Caption) => void;
  phase: (phase: Phase) => void;
  spotlight: (selector: string | null) => void;
  setEditing: (value: boolean) => void;
};

declare global {
  interface Window {
    __promo?: PromoApi;
  }
}

const rail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('agents', 'm'),
  rw('streak', 's'),
  rw('notifications', 's'),
  rw('mybrief', 'm'),
  rw('codingagents', 'm'),
  rw('trending', 's'),
  rw('bookmarks', 's'),
  rw('squads', 'm'),
  rw('continue', 'm'),
];

const greeting = {
  title: 'Good morning, Tsahi',
  subtitle: '12 new since yesterday',
};

const ease = 'cubic-bezier(0.2, 0, 0, 1)';

const CaptionBlock = ({
  caption,
  isLeaving,
}: {
  caption: Caption;
  isLeaving: boolean;
}): ReactElement => (
  <div
    className="flex flex-col"
    style={{
      transition: `opacity 420ms ${ease}, transform 520ms ${ease}, filter 420ms ${ease}`,
      opacity: isLeaving ? 0 : 1,
      transform: isLeaving ? 'translateY(-12px)' : 'none',
      filter: isLeaving ? 'blur(6px)' : 'none',
    }}
  >
    <span
      className="font-bold uppercase text-accent-cabbage-default"
      style={{ fontSize: 15, letterSpacing: '0.16em' }}
    >
      {caption.kicker}
    </span>
    <span
      className="mt-3 font-bold text-text-primary"
      style={{ fontSize: 42, lineHeight: 1.08, letterSpacing: '-0.02em' }}
    >
      {caption.title}
    </span>
    <span
      className="mt-2 text-text-tertiary"
      style={{ fontSize: 19, lineHeight: 1.4 }}
    >
      {caption.sub}
    </span>
  </div>
);

const Film = (): ReactElement => {
  const [caption, setCaption] = useState<Caption | null>(null);
  const [leaving, setLeaving] = useState<Caption | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [spot, setSpot] = useState<Spot>(null);
  const [isEditing, setIsEditing] = useState(false);

  const onEditingChange = useCallback((value: boolean) => {
    setIsEditing(value);
  }, []);

  useEffect(() => {
    window.__promo = {
      caption: (next) => {
        setCaption((current) => {
          setLeaving(current);
          return next;
        });
      },
      phase: setPhase,
      setEditing: setIsEditing,
      spotlight: (selector) => {
        if (!selector) {
          setSpot(null);
          return;
        }
        const element = document.querySelector(selector);
        const rect = element?.getBoundingClientRect();
        setSpot(
          rect
            ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
            : null,
        );
      },
    };
  }, []);

  const stageStyle: CSSProperties = {
    transition: `opacity 700ms ${ease}, transform 900ms ${ease}`,
    opacity: phase === 'stage' ? 1 : 0,
    transform: phase === 'stage' ? 'none' : 'translateY(48px)',
  };

  return (
    <FeedHeroProviders>
      <div
        className="relative overflow-hidden bg-background-default"
        style={{ width: 1920, height: 1080 }}
      >
        {/* The brand's glow along the top edge, behind everything. */}
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: '-40% -10% auto -10%',
            height: 560,
            background:
              'radial-gradient(45% 60% at 20% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 26%, transparent), transparent 70%), radial-gradient(40% 55% at 80% 0%, color-mix(in srgb, var(--theme-accent-onion-default) 24%, transparent), transparent 70%)',
          }}
        />

        {/* Captions, top left, one at a time. */}
        <div
          className="absolute"
          style={{
            zIndex: 2,
            left: 72,
            top: 36,
            width: 1776,
            height: 130,
            transition: `opacity 500ms ${ease}, transform 1100ms ${ease}`,
            opacity: phase === 'end' ? 0 : 1,
            transformOrigin: 'left top',
            // The opening caption sits large in the middle of the frame and
            // glides up into the caption band as the product rises in.
            transform:
              phase === 'intro' ? 'translate(40px, 330px) scale(1.7)' : 'none',
          }}
        >
          {leaving && leaving !== caption && (
            <div className="absolute inset-0" key={`out-${leaving.title}`}>
              <CaptionBlock caption={leaving} isLeaving />
            </div>
          )}
          {caption && (
            <div
              className="absolute inset-0 animate-[promoIn_620ms_cubic-bezier(0.2,0,0,1)_both]"
              key={caption.title}
            >
              <CaptionBlock caption={caption} isLeaving={false} />
            </div>
          )}
        </div>

        {/* The product, in a window, never cropped. */}
        <div
          className="absolute overflow-hidden rounded-t-24 border border-b-0 border-border-subtlest-tertiary bg-background-default"
          style={{
            left: 72,
            right: 72,
            top: 176,
            bottom: 0,
            boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
            ...stageStyle,
          }}
        >
          <div className="flex h-10 items-center gap-2 border-b border-border-subtlest-tertiary px-4">
            {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
              <span
                key={color}
                className="size-3 rounded-max"
                style={{ background: color }}
              />
            ))}
            <span className="ml-4 rounded-8 bg-surface-float px-3 py-0.5 text-text-tertiary typo-caption1">
              app.daily.dev
            </span>
          </div>
          <div className="px-6 pt-4 [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!p-0">
            <HeroInFeed
              columns={5}
              chipsTrailing={
                <div data-rail-overlay className="flex shrink-0 items-center">
                  {isEditing ? (
                    <Button
                      variant={ButtonVariant.Primary}
                      size={ButtonSize.Small}
                      onClick={() => setIsEditing(false)}
                    >
                      Done
                    </Button>
                  ) : (
                    <Button
                      variant={ButtonVariant.Float}
                      size={ButtonSize.Small}
                      icon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Customize hero
                    </Button>
                  )}
                </div>
              }
            >
              <WidgetRail
                initialWidgets={rail()}
                strips={campaignStrips.slice(0, 1)}
                header="greeting"
                greeting={greeting}
                hasHoverEdit
                customizeShortcut="E"
                isEditing={isEditing}
                onEditingChange={onEditingChange}
              />
            </HeroInFeed>
          </div>
        </div>

        {/* A spotlight: everything but one element dims. */}
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-24"
          style={{
            transition: `opacity 500ms ${ease}, left 420ms ${ease}, top 420ms ${ease}, width 420ms ${ease}, height 420ms ${ease}`,
            opacity: spot ? 1 : 0,
            left: (spot?.x ?? 0) - 12,
            top: (spot?.y ?? 0) - 12,
            width: (spot?.w ?? 0) + 24,
            height: (spot?.h ?? 0) + 24,
            boxShadow:
              '0 0 0 4000px rgba(14,18,23,0.72), 0 0 0 2px var(--theme-accent-cabbage-default)',
          }}
        />

        {/* The close. */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{
            transition: `opacity 700ms ${ease}`,
            opacity: phase === 'end' ? 1 : 0,
          }}
        >
          <span
            className="font-bold uppercase text-accent-cabbage-default"
            style={{ fontSize: 18, letterSpacing: '0.16em' }}
          >
            daily.dev · hero cover
          </span>
          <span
            className="mt-6 font-bold text-text-primary"
            style={{ fontSize: 88, lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            Your feed’s front page,
            <br />
            built by you.
          </span>
          <span className="mt-8 text-text-tertiary" style={{ fontSize: 24 }}>
            V1 ships the rail · V2 adds stacks
          </span>
        </div>

        <style>{`
          @keyframes promoIn {
            from { opacity: 0; transform: translateY(16px); filter: blur(8px); }
            to { opacity: 1; transform: none; filter: none; }
          }
          [role="region"] { scroll-snap-type: none !important; }
        `}</style>
      </div>
    </FeedHeroProviders>
  );
};

export const PromoFilm: StoryObj = {
  name: 'Promo film stage',
  render: () => <Film />,
};
