import type { ForwardedRef, ReactElement, ReactNode } from 'react';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { GivebackGiftButtonVariant } from './GivebackGiftButton';
import { GivebackGiftButton } from './GivebackGiftButton';
import { GivebackInvitePrompt } from './GivebackInvitePrompt';
import type { GivebackInvitePromptData } from '../givebackInvitePrompts';

// Imperative API the header/rail wiring drives. This surface is an acquisition
// hook — everything here is generic + community-framed to pull people into
// /giveback, never a personal reward notice.
export interface GivebackGiftDockHandle {
  // Ambient community money landing in the pot (social proof), e.g. "+$8".
  // This bare dollar jump on the gift is the engagement/attention mechanism.
  pulseActivity: (label: string) => void;
  // The full invite bubble (rotating messages).
  showPrompt: (prompt: GivebackInvitePromptData) => void;
  reset: () => void;
}

interface ValuePop {
  id: string;
  label: string;
  // Horizontal nudge (px) off the gift centre so it reads beside the icon and
  // rapid pops don't stack exactly on top of each other.
  dx: number;
}

interface GivebackGiftDockProps {
  variant?: GivebackGiftButtonVariant;
  showLabel?: boolean;
  onOpenGiveback?: () => void;
  // Override where the invite prompt opens (defaults follow the variant).
  promptPlacement?: 'below' | 'above';
  promptAlign?: 'start' | 'end';
  // Custom anchor (e.g. the sidebar's own styled gift link). When provided it
  // replaces the built-in gift button; the money/prompt overlays anchor to it.
  children?: ReactNode;
}

const GIFT_POP_MS = 380;
const VALUE_POP_LIFETIME_MS = 2000;
const MILESTONE_TOAST_DELAY_MS = 180;

let popCounter = 0;

export const GivebackGiftDock = forwardRef(function GivebackGiftDock(
  {
    variant = 'header',
    showLabel = false,
    onOpenGiveback,
    promptPlacement,
    promptAlign,
    children,
  }: GivebackGiftDockProps,
  ref: ForwardedRef<GivebackGiftDockHandle>,
): ReactElement {
  const isRail = variant === 'rail';
  const [pops, setPops] = useState<ValuePop[]>([]);
  const [popping, setPopping] = useState(false);
  const [glowKey, setGlowKey] = useState(0);
  const [prompt, setPrompt] = useState<GivebackInvitePromptData | null>(null);
  const timers = useRef<number[]>([]);

  const track = useCallback((id: number) => {
    timers.current.push(id);
  }, []);

  const popGift = useCallback(() => {
    setPopping(false);
    window.requestAnimationFrame(() => setPopping(true));
    track(window.setTimeout(() => setPopping(false), GIFT_POP_MS + 40));
  }, [track]);

  const pulseActivity = useCallback(
    (label: string) => {
      popCounter += 1;
      const id = `giveback-pop-${popCounter.toString()}`;
      // Bias to the right of the icon with a little spread.
      const dx = Math.round(Math.random() * 18) + 6;
      setPops((current) => [...current, { id, label, dx }]);
      popGift();
      track(
        window.setTimeout(() => {
          setPops((current) => current.filter((pop) => pop.id !== id));
        }, VALUE_POP_LIFETIME_MS),
      );
    },
    [popGift, track],
  );

  const showPrompt = useCallback(
    (next: GivebackInvitePromptData) => {
      if (next.celebrate) {
        setGlowKey((current) => current + 1);
      }
      popGift();
      track(window.setTimeout(() => setPrompt(next), MILESTONE_TOAST_DELAY_MS));
    },
    [popGift, track],
  );

  const reset = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setPops([]);
    setPopping(false);
    setPrompt(null);
  }, []);

  useImperativeHandle(ref, () => ({ pulseActivity, showPrompt, reset }), [
    pulseActivity,
    showPrompt,
    reset,
  ]);

  return (
    <div className="relative inline-flex">
      <span
        className={classNames(
          'relative inline-flex',
          popping && 'giveback-gift-pop',
        )}
      >
        {/* Soft glow bloom on a celebratory community moment. */}
        {glowKey > 0 && (
          <span
            key={glowKey}
            aria-hidden
            className="giveback-glow-bloom bg-accent-cabbage-default/50 pointer-events-none absolute left-1/2 top-1/2 size-16 rounded-full blur-lg"
          />
        )}
        {children ?? (
          <GivebackGiftButton
            variant={variant}
            showLabel={showLabel}
            onClick={onOpenGiveback}
          />
        )}
      </span>

      {/* Community money landing in the pot — bare green numerals that pop in
         beside the gift and drift up (Polymarket-style real-time jump). Offset
         to the right of the icon per-pop so they stay legible, not on the
         glyph. */}
      <div className="pointer-events-none absolute inset-0">
        {pops.map((pop) => (
          <span
            key={pop.id}
            style={{ left: `calc(50% + ${pop.dx}px)` }}
            className="giveback-value-rise absolute top-1 whitespace-nowrap font-bold tabular-nums text-status-success typo-callout [text-shadow:0_1px_3px_var(--theme-background-default)]"
          >
            {pop.label}
          </span>
        ))}
      </div>

      <GivebackInvitePrompt
        open={Boolean(prompt)}
        eyebrow={prompt?.eyebrow}
        headline={prompt?.headline}
        body={prompt?.body}
        ctaLabel={prompt?.ctaLabel}
        celebrate={prompt?.celebrate}
        dropdown={isRail}
        placement={promptPlacement ?? (isRail ? 'above' : 'below')}
        align={promptAlign ?? (isRail ? 'start' : 'end')}
        onClick={onOpenGiveback}
        onClose={() => setPrompt(null)}
      />
    </div>
  );
});

export default GivebackGiftDock;
