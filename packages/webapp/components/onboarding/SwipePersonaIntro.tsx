import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  MAX_PERSONAS,
  PersonaSelector,
} from '@dailydotdev/shared/src/components/onboarding/PersonaSelector';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RootPortal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import type { GQLPersona } from '@dailydotdev/shared/src/graphql/feedSettings';

interface SwipePersonaIntroProps {
  initialSelectedPersonas?: GQLPersona[];
  onSelectionChange: (selected: GQLPersona[]) => void;
  onStart: () => void;
  loading: boolean;
  loadingLabel?: string;
}

const surfaceClassName =
  'w-full overflow-hidden rounded-[2rem] bg-background-default shadow-[0_24px_90px_-48px_rgba(0,0,0,0.58)]';

const panelClassName = 'overflow-hidden';

const floatingEmojiPlacements = [
  {
    className: 'left-3 top-[18%]',
    tx: '4rem',
    ty: '-3rem',
    rz: '-18deg',
    ry: '32deg',
  },
  {
    className: 'right-3 top-[24%]',
    tx: '-4.5rem',
    ty: '-2rem',
    rz: '18deg',
    ry: '-34deg',
  },
  {
    className: 'bottom-[14%] left-6',
    tx: '5rem',
    ty: '-4.5rem',
    rz: '12deg',
    ry: '28deg',
  },
  {
    className: 'bottom-[18%] right-6',
    tx: '-5rem',
    ty: '-4rem',
    rz: '-12deg',
    ry: '-28deg',
  },
] as const;

type FloatingEmoji = {
  id: string;
  emoji: string;
  placementIndex: number;
};

type SwipePersonaIntroHeadingVariant = 'persona' | 'swipe';

const swipePersonaIntroHeadingCopy: Record<
  SwipePersonaIntroHeadingVariant,
  {
    eyebrow: string;
    title: string;
    description: ReactElement;
  }
> = {
  persona: {
    eyebrow: 'Personalize your daily.dev feed',
    title: 'What kind of dev are you?',
    description: (
      <>
        Pick up to 3 roles.
        <br />
        We&apos;ll line up posts you&apos;ll actually want to read.
      </>
    ),
  },
  swipe: {
    eyebrow: 'Teach us what you like',
    title: 'Swipe to tune your feed',
    description: (
      <>
        Swipe right → on posts you want more of.
        <br />
        Swipe left ← on posts that are not for you.
      </>
    ),
  },
};

export function SwipePersonaIntroHeading({
  variant = 'persona',
}: {
  variant?: SwipePersonaIntroHeadingVariant;
}): ReactElement {
  const copy = swipePersonaIntroHeadingCopy[variant];

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-[0.5rem] border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-text-secondary typo-footnote">
        <MagicIcon
          aria-hidden
          className="text-accent-cheese-default"
          secondary
          size={IconSize.XXSmall}
        />
        {copy.eyebrow}
      </span>
      <h1 className="text-balance text-center font-bold text-text-primary typo-title1">
        {copy.title}
      </h1>
      <p className="mx-auto max-w-[32rem] text-balance text-center text-text-tertiary typo-body">
        {copy.description}
      </p>
    </div>
  );
}

export function SwipePersonaIntro({
  initialSelectedPersonas = [],
  onSelectionChange,
  onStart,
  loading,
  loadingLabel,
}: SwipePersonaIntroProps): ReactElement {
  const [selectedCount, setSelectedCount] = useState(
    initialSelectedPersonas.length,
  );
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const selectedPersonasRef = useRef<Set<string>>(
    new Set(initialSelectedPersonas.map((persona) => persona.id)),
  );
  const floatingEmojiCountRef = useRef(0);
  const cleanupTimersRef = useRef<number[]>([]);
  const shouldShowActions = selectedCount >= MAX_PERSONAS;
  const handleSelectionChange = useCallback(
    (selected: GQLPersona[]) => {
      const previousIds = selectedPersonasRef.current;
      const addedPersona = selected.find(
        (persona) => !previousIds.has(persona.id),
      );
      selectedPersonasRef.current = new Set(
        selected.map((persona) => persona.id),
      );

      if (addedPersona) {
        const count = floatingEmojiCountRef.current;
        floatingEmojiCountRef.current += 1;
        const floatingEmoji: FloatingEmoji = {
          id: `${addedPersona.id}-${count}`,
          emoji: addedPersona.emoji,
          placementIndex: count % floatingEmojiPlacements.length,
        };

        setFloatingEmojis((current) => [...current, floatingEmoji]);
        const timer = window.setTimeout(() => {
          setFloatingEmojis((current) =>
            current.filter((item) => item.id !== floatingEmoji.id),
          );
        }, 3200);
        cleanupTimersRef.current.push(timer);
      }

      setSelectedCount(selected.length);
      onSelectionChange(selected);
    },
    [onSelectionChange],
  );

  useEffect(() => {
    const timersRef = cleanupTimersRef;
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const renderNextButton = (): ReactElement => (
    <Button
      aria-disabled={loading}
      className={classNames('w-full tablet:w-auto', {
        readOnly: loading,
      })}
      size={ButtonSize.Medium}
      variant={loading ? ButtonVariant.Float : ButtonVariant.Primary}
      type="button"
      onClick={onStart}
    >
      {loading ? loadingLabel ?? 'Loading…' : 'Next →'}
    </Button>
  );

  return (
    <div className={surfaceClassName}>
      {floatingEmojis.length > 0 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-3 overflow-hidden"
        >
          {floatingEmojis.map((item) => {
            const placement = floatingEmojiPlacements[item.placementIndex];

            return (
              <span
                key={item.id}
                className={`swipe-persona-floating-emoji absolute select-none text-[5rem] leading-none ${placement.className}`}
                style={
                  {
                    '--emoji-tx': placement.tx,
                    '--emoji-ty': placement.ty,
                    '--emoji-rz': placement.rz,
                    '--emoji-ry': placement.ry,
                  } as CSSProperties
                }
              >
                {item.emoji}
              </span>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-8 px-5 pb-8 pt-5 tablet:gap-6 tablet:p-7">
        <SwipePersonaIntroHeading />
        <div className={panelClassName}>
          <div
            className={classNames(
              'px-4 py-5 tablet:px-6 tablet:py-6',
              shouldShowActions && 'pb-24 tablet:pb-6',
            )}
          >
            <PersonaSelector
              initialActiveIds={initialSelectedPersonas.map(
                (persona) => persona.id,
              )}
              mode="seed"
              onSelectionChange={handleSelectionChange}
            />
          </div>
          {shouldShowActions ? (
            <>
              <RootPortal>
                <div className="bg-background-default/95 fixed inset-x-0 bottom-0 z-modal flex min-h-16 justify-center border-t border-border-subtlest-tertiary px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md tablet:hidden">
                  <div className="w-full max-w-[46rem]">
                    {renderNextButton()}
                  </div>
                </div>
              </RootPortal>
              <div className="hidden min-h-16 justify-end px-4 py-3 tablet:flex">
                {renderNextButton()}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
