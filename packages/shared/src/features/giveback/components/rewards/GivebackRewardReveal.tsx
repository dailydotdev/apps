import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import type { LoggedUser } from '../../../../lib/user';
import { GivebackConfettiBurst } from '../GivebackConfettiBurst';
import type { RewardReveal } from './rewardReveal';
import { DismissButton, Scene } from './revealScaffold';
import {
  CoresStack,
  MemberRing,
  NoteReveal,
  PatchyPictureReveal,
  PlusCard,
  SuggestCauseReveal,
  SwagReveal,
  TriviaReveal,
} from './revealScenes';

// The reward-claim reveal: a cinematic pop-up shown after a contributor claims a
// reward on the journey. Every reward is a designed OBJECT — a coin, a
// membership card, a coupon, an emblem — with a short headline + line under it.
// Motion is the giveback house style (staged de-blur enter, spring pops), all
// reduced-motion-guarded. See `rewardReveal.ts` for how a reward tier resolves
// to one of these.

interface RevealBodyProps {
  reveal: RewardReveal;
  levelNumber?: number;
  user: LoggedUser | null;
  onClose: () => void;
}

const revealBody = ({
  reveal,
  levelNumber,
  user,
  onClose,
}: RevealBodyProps): ReactElement => {
  switch (reveal.kind) {
    case 'note':
      return (
        <NoteReveal
          reveal={reveal}
          levelNumber={levelNumber}
          onClose={onClose}
        />
      );
    case 'mascotHug':
      return (
        <PatchyPictureReveal
          reveal={reveal}
          levelNumber={levelNumber}
          user={user}
          onClose={onClose}
        />
      );
    case 'trivia':
      return <TriviaReveal reveal={reveal} levelNumber={levelNumber} />;
    case 'cores':
      return (
        <Scene
          reveal={reveal}
          levelNumber={levelNumber}
          // The card already shows "+N Cores" big, so skip the duplicate
          // headline; the body line still gives context.
          hideHeadline
          object={<CoresStack amount={reveal.amount ?? 500} />}
          action={<DismissButton label="View your balance" onClose={onClose} />}
        />
      );
    case 'plus':
      return (
        <Scene
          reveal={reveal}
          levelNumber={levelNumber}
          object={<PlusCard duration={reveal.duration} />}
          action={
            <DismissButton
              label="Explore what Plus unlocks"
              onClose={onClose}
            />
          }
        />
      );
    case 'swagDiscount':
      return <SwagReveal reveal={reveal} levelNumber={levelNumber} />;
    case 'suggestCause':
      return (
        <SuggestCauseReveal
          reveal={reveal}
          levelNumber={levelNumber}
          onClose={onClose}
        />
      );
    case 'council':
      return (
        <Scene
          reveal={reveal}
          levelNumber={levelNumber}
          object={<MemberRing user={user} />}
          action={<DismissButton label="Take your seat" onClose={onClose} />}
        />
      );
    default:
      // Invariant: a new reveal kind without a branch here should fail loudly.
      throw new Error(`Unhandled reveal kind: ${reveal.kind as string}`);
  }
};

export interface RewardRevealContentProps {
  reveal: RewardReveal;
  // The tier's level number, for the "Lvl N" chip. Omit for non-tier rewards.
  levelNumber?: number;
  user: LoggedUser | null;
  onClose?: () => void;
}

// Each reveal is self-composing (object + copy + action), so the content is just
// the scene — no shared header prefixing every pop-up.
export const RewardRevealContent = ({
  reveal,
  levelNumber,
  user,
  onClose = () => undefined,
}: RewardRevealContentProps): ReactElement =>
  revealBody({ reveal, levelNumber, user, onClose });

// The founding-style surface shared by every reward pop-up: a colorful gradient
// frame (purple→pink→gold) around an opaque base with a faint colorful wash
// (true low opacity via color-mix — the Tailwind `/opacity` modifier doesn't
// take on these token gradient stops). The frame is a 1px hairline on top/sides
// but ~8px at the bottom (`pb-2`); the inner bottom corners use ELLIPTICAL radii
// (23×16) concentric with the outer rounded-24, so the thicker band curves
// smoothly around the corner.
const REVEAL_WASH =
  'linear-gradient(to bottom right, color-mix(in srgb, var(--theme-accent-avocado-default) 10%, transparent), color-mix(in srgb, var(--theme-accent-cabbage-default) 10%, transparent), color-mix(in srgb, var(--theme-accent-cheese-default) 10%, transparent))';

export const RevealSurface = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'rounded-24 bg-gradient-to-r from-accent-cabbage-default via-accent-bacon-default to-accent-cheese-default p-px pb-2',
      className,
    )}
  >
    <div
      className="relative overflow-hidden rounded-t-[23px] rounded-bl-[23px_16px] rounded-br-[23px_16px] bg-background-default"
      style={{ backgroundImage: REVEAL_WASH }}
    >
      {children}
    </div>
  </div>
);

interface RevealDialogShellProps {
  onClose: () => void;
  children: ReactNode;
}

// The reward pop-up: the shared surface on a blurred backdrop, with confetti +
// close, rising + de-blurring in. Backdrop click dismisses.
export const RevealDialogShell = ({
  onClose,
  children,
}: RevealDialogShellProps): ReactElement => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className={classNames(
        'fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper p-4 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        role="presentation"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-24 shadow-2 motion-safe:animate-funnel-step-in motion-safe:will-change-[transform,opacity,filter]"
      >
        <RevealSurface>
          <GivebackConfettiBurst
            trigger={1}
            className="top-12"
            pieceCount={16}
          />
          <div className="relative max-h-[85vh] overflow-y-auto overflow-x-hidden px-8 pb-10 pt-6">
            {children}
          </div>
          {/* Rendered LAST so it paints above the scroll layer, z-20 to be sure
              nothing intercepts the click. Subtle, with equal top/right insets. */}
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
            className="z-20 absolute right-4 top-4"
          />
        </RevealSurface>
      </div>
    </div>
  );
};

export const RewardRevealDialog = ({
  reveal,
  levelNumber,
  user,
  onClose,
}: RewardRevealContentProps & { onClose: () => void }): ReactElement => (
  <RevealDialogShell onClose={onClose}>
    <RewardRevealContent
      reveal={reveal}
      levelNumber={levelNumber}
      user={user}
      onClose={onClose}
    />
  </RevealDialogShell>
);
