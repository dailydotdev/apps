import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  DevPlusIcon,
  ShareIcon,
  SlackIcon,
  SparkleIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import {
  cloudinaryCharm404,
  getCoreCurrencyImage,
} from '@dailydotdev/shared/src/lib/image';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { PlaygroundTier } from './rewardsPlayground.data';
import { PLAYGROUND_TIERS } from './rewardsPlayground.data';
import { SecretsScratch } from './SecretsCardStack';

// PLAYGROUND ONLY — see rewardsPlayground.data.tsx.
//
// Design language (rebuilt from scratch): every reward is a designed OBJECT —
// a coin, a membership card, a coupon, an emblem, a plaque, a keycard — not a
// glyph on a disc. The object is the hero; a short kicker + headline + line sit
// under it. Motion = jakub.kr house style (staged de-blur enter, spring pops),
// all reduced-motion-guarded.

const STAGGER_STEP = 70;

// Patchy selfie assets (Vite resolves these to bundled asset URLs). The selfie
// animation is a TRANSPARENT animated WebP — matted from the black-bg source via
// a border flood-fill silhouette + unpremultiplied edges, so Patchy floats
// cleanly on any background. `patchy-first` is its first frame (idle preview).
const patchyAnimUrl = new URL('./assets/patchy-anim.webp', import.meta.url)
  .href;
const patchyFirstUrl = new URL('./assets/patchy-first.png', import.meta.url)
  .href;
const patchyCardUrl = new URL('./assets/patchy-card.png', import.meta.url).href;
// The animated WebP is 144 frames @ 24fps.
const PATCHY_ANIM_MS = 6000;

export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'motion-safe:animate-funnel-step-in motion-safe:will-change-[transform,opacity,filter]',
      className,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// Confetti for the moment of unlock. Reduced motion hides it.
const CONFETTI: ReadonlyArray<{
  tx: string;
  ty: string;
  delay: string;
  color: string;
}> = [
  {
    tx: '-72px',
    ty: '-38px',
    delay: '0ms',
    color: 'bg-accent-cabbage-default',
  },
  { tx: '68px', ty: '-48px', delay: '30ms', color: 'bg-accent-cheese-default' },
  {
    tx: '-40px',
    ty: '-64px',
    delay: '60ms',
    color: 'bg-accent-avocado-default',
  },
  { tx: '44px', ty: '-60px', delay: '20ms', color: 'bg-accent-bun-default' },
  { tx: '-96px', ty: '-8px', delay: '50ms', color: 'bg-accent-onion-default' },
  { tx: '92px', ty: '-14px', delay: '70ms', color: 'bg-accent-cheese-default' },
  {
    tx: '-16px',
    ty: '-78px',
    delay: '10ms',
    color: 'bg-accent-cabbage-default',
  },
  {
    tx: '20px',
    ty: '-80px',
    delay: '90ms',
    color: 'bg-accent-avocado-default',
  },
  { tx: '-58px', ty: '-58px', delay: '40ms', color: 'bg-accent-bun-default' },
  {
    tx: '58px',
    ty: '-34px',
    delay: '80ms',
    color: 'bg-accent-cabbage-default',
  },
  {
    tx: '-30px',
    ty: '-30px',
    delay: '100ms',
    color: 'bg-accent-cheese-default',
  },
  { tx: '34px', ty: '-72px', delay: '55ms', color: 'bg-accent-onion-default' },
];

const ConfettiBurst = (): ReactElement => (
  <span
    aria-hidden
    className="z-10 pointer-events-none absolute inset-x-0 top-12 mx-auto h-0 w-0 motion-reduce:hidden"
  >
    {CONFETTI.map((piece) => (
      <span
        key={`${piece.tx}-${piece.ty}`}
        className={classNames(
          'absolute size-1.5 rounded-2 opacity-0 motion-safe:animate-reaction-burst',
          piece.color,
        )}
        style={
          {
            '--burst-tx': piece.tx,
            '--burst-ty': piece.ty,
            animationDelay: piece.delay,
          } as React.CSSProperties
        }
      />
    ))}
  </span>
);

const useCountUp = (target: number, ms = 900): number => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
};

// Just the level chip (profile-image style) — no "reward unlocked" label.
const GameBanner = ({ tier }: { tier: PlaygroundTier }): ReactElement => {
  const level = PLAYGROUND_TIERS.findIndex((item) => item.id === tier.id) + 1;
  if (level <= 0) {
    return <></>;
  }
  return (
    <span
      className="rounded-8 border border-border-subtlest-tertiary px-2.5 py-0.5 font-bold text-accent-cabbage-default typo-caption1"
      style={{ backgroundColor: '#17111f' }}
    >
      Lvl {level}
    </span>
  );
};

// The copy under the hero object: a big cinematic headline + the line. The
// kicker/level now live in the GameBanner above the object.
const RevealCopy = ({
  tier,
  delayBase = 0,
  hideHeadline = false,
}: {
  tier: PlaygroundTier;
  delayBase?: number;
  hideHeadline?: boolean;
}): ReactElement => (
  <FlexCol className="items-center gap-1.5 text-center">
    {!hideHeadline && (
      <Reveal delay={delayBase}>
        <Typography
          tag={TypographyTag.H3}
          bold
          type={TypographyType.Title1}
          className="[text-wrap:balance]"
        >
          {tier.reveal.headline}
        </Typography>
      </Reveal>
    )}
    <Reveal delay={delayBase + STAGGER_STEP}>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-sm [text-wrap:pretty]"
      >
        {tier.reveal.body}
      </Typography>
    </Reveal>
  </FlexCol>
);

// Standard scene scaffold: hero object, then copy, then an optional action.
const Scene = ({
  object,
  tier,
  action,
  hideHeadline,
}: {
  object: ReactNode;
  tier: PlaygroundTier;
  action?: ReactNode;
  hideHeadline?: boolean;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <GameBanner tier={tier} />
    </Reveal>
    <Reveal
      delay={STAGGER_STEP}
      className="relative flex items-center justify-center"
    >
      {object}
    </Reveal>
    <RevealCopy
      tier={tier}
      delayBase={STAGGER_STEP * 3}
      hideHeadline={hideHeadline}
    />
    {action && <Reveal delay={STAGGER_STEP * 6}>{action}</Reveal>}
  </FlexCol>
);

// Every reveal closes on a solid Primary CTA — the confident, "take the win"
// action, never a ghost button.
const primaryButton = (label: string, icon?: ReactElement): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Medium}
    variant={ButtonVariant.Primary}
    icon={icon}
  >
    {label}
  </Button>
);

const shareButton = (label: string): ReactElement =>
  primaryButton(label, <ShareIcon />);

// ── Objects ────────────────────────────────────────────────────────────────

// Cores → the REAL daily.dev Cores stack (the art grows with the amount) on a
// shiny multi-hue gradient (gold + purple glow, glossy top light) with a gold
// border — echoing the Cores brand artwork.
const CoresStack = ({ amount }: { amount: number }): ReactElement => {
  const shown = useCountUp(amount);
  return (
    <div
      className="relative flex w-72 max-w-full flex-col items-center gap-2 overflow-hidden rounded-24 p-6 shadow-2 ring-1 ring-inset ring-border-subtlest-tertiary motion-safe:animate-reward-pop"
      // Fixed dark base (like the Plus card) so the shiny market-cover look and
      // white total read correctly in BOTH themes — a premium dark artifact on
      // the light/dark pop-up.
      style={{ backgroundColor: '#0b0e14' }}
    >
      {/* daily.dev "market cover" gradient blobs: a violet→purple blob and a
          pink→yellow ellipse (lighten), heavily blurred. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-64 w-72 rounded-full blur-[64px]"
        style={{ backgroundImage: 'linear-gradient(135deg, #ce3df3, #7147ed)' }}
      />
      <span
        aria-hidden
        className="opacity-80 pointer-events-none absolute -bottom-28 -right-10 h-56 w-80 -rotate-[26deg] rounded-full blur-[80px] [mix-blend-mode:lighten]"
        style={{ backgroundImage: 'linear-gradient(180deg, #fe7ab6, #ffef3f)' }}
      />
      <img
        src={getCoreCurrencyImage(amount)}
        alt="daily.dev Cores"
        loading="lazy"
        className="relative h-40 w-auto select-none object-contain"
      />
      <span className="relative flex items-baseline gap-2">
        <span className="text-4xl font-black tabular-nums leading-none text-white mobileL:text-5xl">
          +{shown.toLocaleString()}
        </span>
        <span className="font-black uppercase tracking-widest text-accent-cheese-default typo-title2">
          Cores
        </span>
      </span>
    </div>
  );
};

// A gold EMV-style chip, echoing the reference ad card.
const CardChip = (): ReactElement => (
  <span className="relative flex h-7 w-10 items-center justify-center overflow-hidden rounded-6 bg-gradient-to-br from-accent-cheese-default to-accent-bun-default">
    <span className="bg-accent-bun-default/60 absolute inset-y-1 left-1/2 w-px -translate-x-1/2" />
    <span className="bg-accent-bun-default/60 absolute inset-x-1 top-1/2 h-px -translate-y-1/2" />
    <span className="ring-accent-bun-default/60 size-3 rounded-2 ring-1" />
  </span>
);

// Plus → a real daily.dev membership card, in the spirit of the premium ad
// card: deep-purple aurora, gold chip, mono details, the authentic logo. The
// card gradient is an inline style so it matches the brand card exactly.
const PlusCard = ({ duration }: { duration?: string }): ReactElement => (
  <div
    className="relative aspect-[1.586] w-72 max-w-full overflow-hidden rounded-16 p-4 shadow-2 ring-1 ring-inset ring-accent-bacon-default motion-safe:animate-reward-pop"
    style={
      {
        // Leans toward the Plus pink-red brand color, over a deep base.
        backgroundImage:
          'radial-gradient(120% 90% at 80% 8%, rgba(232,64,128,0.6), transparent 55%), linear-gradient(135deg, #4a1533 0%, #1a0d1e 60%, #34163f 100%)',
        // The card is ALWAYS dark, so pin the logo/text-primary paths to white
        // — otherwise in light theme the daily.dev logo fills dark and vanishes.
        '--theme-text-primary': '#FFFFFF',
      } as React.CSSProperties
    }
  >
    {/* Oversized Plus icon watermark bleeding off the right edge. */}
    <span className="pointer-events-none absolute -bottom-8 -right-10 text-white opacity-[0.08] [&_svg]:size-44">
      <DevPlusIcon />
    </span>
    {/* Diagonal foil sheen. */}
    <span
      aria-hidden
      className="via-white/15 absolute -inset-x-10 -top-12 h-24 -rotate-12 bg-gradient-to-r from-transparent to-transparent"
    />
    <FlexCol className="relative h-full justify-between">
      <FlexRow className="items-center justify-between">
        <LogoText isPlus className={{ container: 'h-5 w-auto' }} />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          bold
          className="uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
        >
          Membership
        </Typography>
      </FlexRow>

      <CardChip />

      <FlexRow className="items-end justify-between">
        <FlexCol className="gap-0.5">
          <span
            className="text-[0.6rem] uppercase tracking-widest"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Member
          </span>
          <LogoText className={{ container: 'h-3.5 w-auto' }} />
        </FlexCol>
        <FlexCol className="items-end gap-0.5">
          <span
            className="text-[0.6rem] uppercase tracking-widest"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Valid thru
          </span>
          <span className="font-mono text-sm font-bold uppercase text-white">
            {duration ?? 'member'}
          </span>
        </FlexCol>
      </FlexRow>
    </FlexCol>
  </div>
);

// Council → a big Slack app-tile, a ring of member avatars, and the private
// channel — so it reads as "you're in the room" with a real community.
// Real member avatars — daily.dev uses rounded-corner squares, not circles.
const COUNCIL_MEMBERS = [
  'https://i.pravatar.cc/96?img=12',
  'https://i.pravatar.cc/96?img=32',
  'https://i.pravatar.cc/96?img=45',
  'https://i.pravatar.cc/96?img=5',
];
const CouncilObject = ({
  channel,
  user,
}: {
  channel?: string;
  user: LoggedUser | null;
}): ReactElement => (
  <FlexCol className="items-center gap-4">
    {channel && (
      <FlexRow className="items-center gap-2 rounded-10 bg-surface-float px-3 py-1.5 motion-safe:animate-reward-pop [&_svg]:size-5">
        <SlackIcon />
        <Typography bold type={TypographyType.Footnote}>
          {channel}
        </Typography>
      </FlexRow>
    )}
    <FlexRow className="items-center">
      {COUNCIL_MEMBERS.map((src) => (
        <span
          key={src}
          className="-ml-2.5 size-10 overflow-hidden rounded-12 bg-surface-float ring-2 ring-background-default first:ml-0"
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        </span>
      ))}
      {/* The visitor stands out with a colorful gradient ring. Inner picture is
          clipped to a radius concentric with the frame (12 − 2px pad = 10). */}
      <span className="-ml-2.5 rounded-12 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default p-0.5">
        <span className="block size-10 overflow-hidden rounded-[10px]">
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-accent-cabbage-default text-white [&_svg]:size-5">
              <VIcon />
            </span>
          )}
        </span>
      </span>
    </FlexRow>
  </FlexCol>
);

// Picture with Patchy → a 3-stage flow. The selfie animation is a real <video>
// on a dark stage with mix-blend-screen (its black background drops out cleanly
// — no matting artifacts, crisp at full res). "Take a selfie" plays it; onEnded
// swaps to Patchy holding a card frame with the visitor's photo in it.
const PatchyPictureReveal = ({
  tier,
  user,
}: {
  tier: PlaygroundTier;
  user: LoggedUser | null;
}): ReactElement => {
  const [stage, setStage] = useState<'idle' | 'playing' | 'result'>('idle');
  // Drives the smooth grow-in of the animation when playing starts.
  const [grown, setGrown] = useState(false);

  // The transparent WebP plays once on mount; advance to the result when it
  // finishes (its length is fixed at PATCHY_ANIM_MS).
  useEffect(() => {
    if (stage !== 'playing') {
      setGrown(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => setGrown(true));
    const done = setTimeout(() => setStage('result'), PATCHY_ANIM_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [stage]);

  if (stage === 'result') {
    return (
      <FlexCol className="items-center gap-5">
        <Reveal delay={0}>
          <GameBanner tier={tier} />
        </Reveal>
        <Reveal delay={STAGGER_STEP} className="w-full">
          <div className="relative mx-auto w-full max-w-xs motion-safe:animate-reward-pop">
            <img
              src={patchyCardUrl}
              alt="Patchy holding a frame with you in it"
              className="w-full select-none object-contain"
            />
            {/* The visitor's photo dropped into the card frame the dog holds. */}
            <span
              className="absolute overflow-hidden rounded-[10%]"
              style={{
                left: '45.5%',
                top: '42%',
                width: '39.5%',
                height: '39.5%',
              }}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-accent-cabbage-default text-white [&_svg]:size-10">
                  <VIcon />
                </span>
              )}
            </span>
          </div>
        </Reveal>
        <RevealCopy tier={tier} delayBase={STAGGER_STEP * 3} />
        <Reveal delay={STAGGER_STEP * 6}>{shareButton('Post it')}</Reveal>
      </FlexCol>
    );
  }

  if (stage === 'playing') {
    return (
      <FlexCol className="items-center gap-6">
        <Reveal delay={0}>
          <GameBanner tier={tier} />
        </Reveal>
        {/* Transparent WebP — floats cleanly, grows in, plays once. */}
        <img
          key="patchy-anim"
          src={patchyAnimUrl}
          alt="Patchy taking a selfie with you"
          className={classNames(
            'h-64 w-auto select-none object-contain motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out',
            grown ? 'scale-100' : 'scale-90',
          )}
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Say cheese…
        </Typography>
      </FlexCol>
    );
  }

  // idle: the animation's first frame (paused preview), floating transparent.
  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <GameBanner tier={tier} />
      </Reveal>
      <Reveal delay={STAGGER_STEP}>
        <img
          src={patchyFirstUrl}
          alt="Patchy"
          className="h-48 w-auto select-none object-contain"
        />
      </Reveal>
      <FlexCol className="items-center gap-1.5 text-center">
        <Reveal delay={STAGGER_STEP * 2}>
          <Typography
            tag={TypographyTag.H3}
            bold
            type={TypographyType.Title1}
            className="[text-wrap:balance]"
          >
            Say cheese with Patchy
          </Typography>
        </Reveal>
        <Reveal delay={STAGGER_STEP * 3}>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-sm [text-wrap:pretty]"
          >
            Patchy wants a photo with you. Snap one and take it anywhere.
          </Typography>
        </Reveal>
      </FlexCol>
      <Reveal delay={STAGGER_STEP * 5}>
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          onClick={() => setStage('playing')}
        >
          Take a selfie
        </Button>
      </Reveal>
    </FlexCol>
  );
};

// ── Interactive reveals (own their layout) ──────────────────────────────────

// A "note from daily.dev" card: a big sticker emoji, the grateful/funny
// message, and a signature. The whole message is data, so any level generates
// its own note. Dark card matching the Secret scratch card, with a gray border
// (the colorful frame already lives on the whole pop-up).
const JokeReveal = ({ tier }: { tier: PlaygroundTier }): ReactElement => {
  const { reveal } = tier;
  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <GameBanner tier={tier} />
      </Reveal>
      <Reveal delay={STAGGER_STEP} className="w-full">
        <div
          className="relative mx-auto w-full max-w-xs -rotate-1 rounded-24 border border-border-subtlest-tertiary px-6 pb-6 pt-7 text-center shadow-2 motion-safe:animate-reward-pop"
          style={{ backgroundColor: '#17111f' }}
        >
          <span
            aria-hidden
            className="bg-white/10 ring-white/15 mx-auto mb-4 flex size-20 -rotate-6 items-center justify-center rounded-full text-5xl shadow-2 ring-1"
          >
            {reveal.emoji ?? '💛'}
          </span>
          <Typography
            tag={TypographyTag.H3}
            bold
            type={TypographyType.Title2}
            className="text-white [text-wrap:balance]"
          >
            {reveal.headline}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            className="mt-2 [text-wrap:pretty]"
            style={{ color: 'rgba(255, 255, 255, 0.72)' }}
          >
            {reveal.body}
          </Typography>
          <FlexRow className="mt-5 items-center justify-center gap-1.5 border-t border-dashed border-border-subtlest-tertiary pt-4">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              className="italic"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              With love, the daily.dev team
            </Typography>
          </FlexRow>
        </div>
      </Reveal>
      <Reveal delay={STAGGER_STEP * 4}>
        {shareButton('Share the bragging rights')}
      </Reveal>
    </FlexCol>
  );
};

// The real daily.dev store sells these — a mini gallery so "the swag store"
// isn't abstract: you can picture the stickers/tee/hoodie you'll spend it on.
// Real product shots from the daily.dev store (store.daily.dev) so the reward
// reads as the actual shop, not clip-art. Duplicated + marquee'd below for a
// seamless auto-scrolling strip.
const SWAG_IMAGES: ReadonlyArray<string> = [
  'https://store.daily.dev/cdn/shop/files/unisex-premium-hoodie-black-front-64f840b15db90.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/kiss-cut-holographic-stickers-grey-4x4-front-64f88c587f9b4.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/enamel-mug-white-12oz-front-64f85e69428dd.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/unisex-premium-hoodie-team-royal-front-64f89116e8970.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/all-over-print-minimalist-backpack-white-front-64f85ba2ac64c.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/sports-water-bottle-charcoal-front-65799c386b8d1.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/embroidered-patches-black-square-3x3-front-64f89d10b2560.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/laptop-sleeve-13-front-64f861ac52f4e.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/hardcover-bound-notebook-black-front-64f85fe913dbb.jpg?width=360',
  'https://store.daily.dev/cdn/shop/files/tie-dye-beanie-ocean-front-64f8aa98343d3.jpg?width=360',
];

// An auto-scrolling strip of real store products. The list is rendered twice
// and slid -50% so it loops seamlessly; a scoped keyframe keeps it self-
// contained, motion-safe so reduced-motion users get a static strip.
const SwagMarquee = (): ReactElement => (
  // Negative margin cancels the pop-up's horizontal padding so the strip runs
  // edge-to-edge and is cut cleanly by the modal border (overflow-hidden).
  <div className="relative -mx-8 overflow-hidden">
    <style>
      {`@keyframes swagMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
    </style>
    <div className="flex w-max gap-3 px-3 motion-safe:[animation:swagMarquee_26s_linear_infinite]">
      {[...SWAG_IMAGES, ...SWAG_IMAGES].map((src, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="size-24 shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-white"
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="size-full object-contain"
          />
        </span>
      ))}
    </div>
  </div>
);

// Swag → a wrapped gift the user taps: it shakes, then "pops" and is replaced by
// the prize. The code isn't shown — we tell them it's coming by email (so the
// real flow can generate a single-use code server-side).
const SwagReveal = ({ tier }: { tier: PlaygroundTier }): ReactElement => {
  const { reveal } = tier;
  const percent = reveal.percent ?? 50;
  const [stage, setStage] = useState<'gift' | 'opening' | 'revealed'>('gift');

  useEffect(() => {
    if (stage !== 'opening') {
      return undefined;
    }
    const timer = setTimeout(() => setStage('revealed'), 620);
    return () => clearTimeout(timer);
  }, [stage]);

  if (stage === 'revealed') {
    return (
      <FlexCol className="items-center gap-5">
        <Reveal delay={0}>
          <GameBanner tier={tier} />
        </Reveal>
        <Reveal delay={STAGGER_STEP} className="w-full">
          <FlexCol className="relative items-center gap-1 text-center">
            <ConfettiBurst />
            {/* Outline pill: colorful gradient border + gradient text, no fill. */}
            <span className="rounded-8 bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default p-px motion-safe:animate-reward-pop">
              <span className="block rounded-[7px] bg-background-default px-3 py-1">
                <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text font-black uppercase tracking-widest text-transparent typo-callout">
                  {percent}% off
                </span>
              </span>
            </span>
            <Typography bold type={TypographyType.Title2} className="mt-1">
              Everything in the daily.dev swag store
            </Typography>
          </FlexCol>
        </Reveal>
        <Reveal delay={STAGGER_STEP * 2} className="w-full">
          <SwagMarquee />
        </Reveal>
        <Reveal delay={STAGGER_STEP * 3}>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-xs text-center [text-wrap:pretty]"
          >
            Check your inbox. We&apos;ll email your code and the details within
            24 hours.
          </Typography>
        </Reveal>
        <Reveal delay={STAGGER_STEP * 4}>
          {primaryButton('Browse the store')}
        </Reveal>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <GameBanner tier={tier} />
      </Reveal>
      <Reveal delay={STAGGER_STEP}>
        <button
          type="button"
          aria-label="Open your gift"
          onClick={() => stage === 'gift' && setStage('opening')}
          className={classNames(
            'text-7xl leading-none transition-transform',
            stage === 'opening'
              ? 'motion-safe:animate-nudge-shake'
              : 'cursor-pointer hover:scale-110',
          )}
        >
          🎁
        </button>
      </Reveal>
      <RevealCopy tier={tier} delayBase={STAGGER_STEP * 2} />
      <Reveal delay={STAGGER_STEP * 5}>
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          disabled={stage === 'opening'}
          onClick={() => stage === 'gift' && setStage('opening')}
        >
          Open the gift
        </Button>
      </Reveal>
    </FlexCol>
  );
};

// Roast → user hits "Roast me", we "generate" it on the backend (a few-second
// loading beat with rotating status lines), then type the burn out live like
// someone is writing it in real time.
const TYPE_MS = 15;
const ROAST_LOADING_STEPS = [
  'Scanning your reading history…',
  'Counting your unopened bookmarks…',
  'Cooking up something painful…',
];
const ROAST_STEP_MS = 850;

const RoastReveal = ({ tier }: { tier: PlaygroundTier }): ReactElement => {
  const { reveal } = tier;
  const full = reveal.roastText ?? '';
  const [stage, setStage] = useState<'idle' | 'loading' | 'typing'>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [typed, setTyped] = useState('');

  // "Backend" generation: walk the status lines, then reveal the roast.
  useEffect(() => {
    if (stage !== 'loading') {
      return undefined;
    }
    const stepper = setInterval(() => {
      setLoadingStep((step) =>
        Math.min(step + 1, ROAST_LOADING_STEPS.length - 1),
      );
    }, ROAST_STEP_MS);
    const finish = setTimeout(
      () => setStage('typing'),
      ROAST_STEP_MS * ROAST_LOADING_STEPS.length,
    );
    return () => {
      clearInterval(stepper);
      clearTimeout(finish);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'typing') {
      return undefined;
    }
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setTyped(full);
      return undefined;
    }
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTyped(full.slice(0, index));
      if (index >= full.length) {
        clearInterval(interval);
      }
    }, TYPE_MS);
    return () => clearInterval(interval);
  }, [stage, full]);

  const done = typed.length >= full.length;

  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <GameBanner tier={tier} />
      </Reveal>
      {/* Patchy calmly getting roasted in the flames (the daily.dev "404" charm
          — a dog on fire, perfect for a roast). */}
      <Reveal delay={STAGGER_STEP}>
        <span className="relative flex items-center justify-center">
          <span
            aria-hidden
            className="bg-accent-ketchup-default/25 absolute inset-0 m-auto size-24 rounded-full blur-2xl motion-safe:animate-glow-pulse"
          />
          <img
            src={cloudinaryCharm404}
            alt="Patchy getting roasted"
            loading="lazy"
            className={classNames(
              'relative h-32 w-auto select-none object-contain',
              stage === 'loading'
                ? 'motion-safe:animate-mascot-bob'
                : 'motion-safe:animate-reward-pop',
            )}
          />
        </span>
      </Reveal>
      {stage === 'idle' && (
        <>
          <RevealCopy tier={tier} delayBase={STAGGER_STEP * 2} />
          <Reveal delay={STAGGER_STEP * 5}>
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={() => setStage('loading')}
            >
              Roast me
            </Button>
          </Reveal>
        </>
      )}
      {stage === 'loading' && (
        <FlexCol className="items-center gap-4 py-2">
          {/* Heat gauge climbs mild → charred as the burn is generated. */}
          <div className="h-3 w-52 overflow-hidden rounded-8 bg-surface-float ring-1 ring-inset ring-border-subtlest-tertiary">
            <div
              className="h-full rounded-8 bg-gradient-to-r from-accent-cheese-default via-accent-bun-default to-accent-ketchup-default transition-[width] duration-700 ease-out"
              style={{
                width: `${
                  ((loadingStep + 1) / ROAST_LOADING_STEPS.length) * 100
                }%`,
              }}
            />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="text-center"
          >
            {ROAST_LOADING_STEPS[loadingStep]}
          </Typography>
        </FlexCol>
      )}
      {stage === 'typing' && (
        <>
          <div className="min-h-24 w-full rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 text-left">
            <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text font-black uppercase tracking-widest text-transparent typo-caption2">
              Fresh burn
            </span>
            <Typography
              type={TypographyType.Footnote}
              className="mt-2 italic [text-wrap:pretty]"
            >
              {typed}
              {!done && (
                <span
                  aria-hidden
                  className="ml-px inline-block h-4 w-0.5 translate-y-0.5 bg-text-primary motion-safe:animate-glow-pulse"
                />
              )}
            </Typography>
          </div>
          {done && (
            <Reveal delay={0}>{shareButton('Share #IGotRoasted')}</Reveal>
          )}
        </>
      )}
    </FlexCol>
  );
};

// Real, authentic causes rendered like the live causes tab (`GivebackCauseCard`/
// `CauseEmblem`: real logo on a white tile, name, category) so it reads as the
// actual product, not clip-art. A titled, scrollable stack of "the causes we
// fund" makes clear there are many — capped by the "add yours" slot that's the
// new thing this reward unlocks. Logos via the DuckDuckGo icon service, with the
// product's brand-tinted sparkle fallback.
const CAUSES: ReadonlyArray<{
  name: string;
  category: string;
  domain: string;
}> = [
  {
    name: 'Electronic Frontier Foundation',
    category: 'Digital rights',
    domain: 'eff.org',
  },
  {
    name: 'Open Source Collective',
    category: 'Open source',
    domain: 'opencollective.com',
  },
  { name: 'Girls Who Code', category: 'Education', domain: 'girlswhocode.com' },
  {
    name: 'Internet Archive',
    category: 'Digital preservation',
    domain: 'archive.org',
  },
  { name: 'freeCodeCamp', category: 'Education', domain: 'freecodecamp.org' },
  {
    name: "Let's Encrypt",
    category: 'Web security',
    domain: 'letsencrypt.org',
  },
];

const CauseLogo = ({ domain }: { domain: string }): ReactElement => {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-12 bg-white">
      {failed ? (
        <span className="flex size-full items-center justify-center bg-accent-cabbage-flat text-accent-cabbage-default [&_svg]:size-4">
          <SparkleIcon />
        </span>
      ) : (
        <img
          src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-6 object-contain"
        />
      )}
    </span>
  );
};

const CAUSE_ROTATE_MS = 2600;

// A looping conveyor of cause cards. Each card is placed by its slot relative to
// the current front (0 = front). On every tick `front` advances: the front card
// (slot 0 → the last slot) FALLS DOWN and fades, clipped off the bottom, while
// the card behind it rises into the front spot and a fresh one fades in at the
// back. Because the leaving card exits downward + fades (never flies across to
// the back), there is no z-index pop or flicker.
const causeSlot = (
  rel: number,
  count: number,
): { y: number; scale: number; z: number; opacity: number } => {
  if (rel === 0) {
    return { y: 0, scale: 1, z: 50, opacity: 1 };
  }
  if (rel === 1) {
    return { y: -9, scale: 0.95, z: 40, opacity: 0.5 };
  }
  if (rel === 2) {
    return { y: -18, scale: 0.9, z: 30, opacity: 0.28 };
  }
  if (rel === count - 1) {
    // The card that just left the front: fall down + fade (clipped off bottom).
    return { y: 34, scale: 0.92, z: 20, opacity: 0 };
  }
  // Parked, invisible, at the back position (fades in as it reaches slot 2).
  return { y: -18, scale: 0.88, z: 10, opacity: 0 };
};

const CausesStack = (): ReactElement => {
  const [front, setFront] = useState(0);
  const count = CAUSES.length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const id = setInterval(
      () => setFront((value) => (value + 1) % count),
      CAUSE_ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [count]);

  return (
    <FlexCol className="mx-auto w-full max-w-xs gap-3 motion-safe:animate-reward-pop">
      <Typography
        bold
        type={TypographyType.Footnote}
        className="px-1 text-center"
      >
        The causes we fund
      </Typography>
      {/* overflow-hidden clips the leaving card as it falls off the bottom. */}
      <div className="relative mx-auto h-20 w-full overflow-hidden">
        {CAUSES.map((cause, index) => {
          const rel = (index - front + count) % count;
          const pos = causeSlot(rel, count);
          return (
            <FlexRow
              key={cause.domain}
              className="absolute inset-x-0 bottom-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-2.5 duration-500 ease-out motion-safe:transition-[transform,opacity]"
              style={{
                backgroundColor: '#17111f',
                transform: `translateY(${pos.y}px) scale(${pos.scale})`,
                zIndex: pos.z,
                opacity: pos.opacity,
              }}
            >
              <CauseLogo domain={cause.domain} />
              <FlexCol className="min-w-0 flex-1">
                <Typography
                  bold
                  type={TypographyType.Footnote}
                  className="truncate text-white"
                  tag={TypographyTag.Span}
                >
                  {cause.name}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                >
                  {cause.category}
                </Typography>
              </FlexCol>
            </FlexRow>
          );
        })}
      </div>
    </FlexCol>
  );
};

// Suggest a cause → a celebration that the privilege is unlocked, then a
// "Suggest now" button that opens the actual suggest-a-cause form (a separate
// step).
const SuggestCauseReveal = ({
  tier,
}: {
  tier: PlaygroundTier;
}): ReactElement => {
  const [view, setView] = useState<'unlocked' | 'form' | 'sent'>('unlocked');

  if (view === 'sent') {
    return (
      <FlexCol className="items-center gap-4 text-center">
        <Reveal delay={0}>
          <span className="bg-accent-avocado-default/15 flex size-16 items-center justify-center rounded-full text-accent-avocado-default motion-safe:animate-reward-pop [&_svg]:size-8">
            <VIcon />
          </span>
        </Reveal>
        <Reveal delay={STAGGER_STEP}>
          <Typography bold type={TypographyType.Title2}>
            Sent for review.
          </Typography>
        </Reveal>
        <Reveal delay={STAGGER_STEP * 2}>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="max-w-xs [text-wrap:pretty]"
          >
            Thanks for the nomination. We&apos;ll vet the cause and add it to
            the giveback list if it&apos;s a fit.
          </Typography>
        </Reveal>
      </FlexCol>
    );
  }

  if (view === 'form') {
    return (
      <FlexCol className="items-center gap-5">
        <Typography bold type={TypographyType.Title2}>
          Suggest a cause
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="-mt-3 max-w-xs text-center [text-wrap:pretty]"
        >
          A nonprofit, open-source fund, or community initiative daily.dev
          should support.
        </Typography>
        <FlexCol className="w-full max-w-sm gap-3">
          <input
            type="text"
            placeholder="Name of the cause"
            className="w-full rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5 text-text-primary typo-callout placeholder:text-text-quaternary"
          />
          <input
            type="url"
            placeholder="Link (website or donation page)"
            className="w-full rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5 text-text-primary typo-callout placeholder:text-text-quaternary"
          />
          <textarea
            rows={3}
            placeholder="Why should we support it?"
            className="w-full resize-none rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5 text-text-primary typo-callout placeholder:text-text-quaternary"
          />
          <Button
            type="button"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={() => setView('sent')}
            className="mt-1 self-center"
          >
            Submit for review
          </Button>
        </FlexCol>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="items-center gap-5">
      <Reveal delay={0}>
        <GameBanner tier={tier} />
      </Reveal>
      <RevealCopy tier={tier} delayBase={STAGGER_STEP} />
      <Reveal delay={STAGGER_STEP * 3} className="w-full">
        <CausesStack />
      </Reveal>
      <Reveal delay={STAGGER_STEP * 5}>
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          onClick={() => setView('form')}
        >
          Suggest now
        </Button>
      </Reveal>
    </FlexCol>
  );
};

const TriviaReveal = ({ tier }: { tier: PlaygroundTier }): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <GameBanner tier={tier} />
    </Reveal>
    <RevealCopy tier={tier} delayBase={STAGGER_STEP} />
    <Reveal delay={STAGGER_STEP * 3} className="w-full">
      <SecretsScratch fact={tier.reveal.fact ?? ''} />
    </Reveal>
  </FlexCol>
);

const revealBody = (
  tier: PlaygroundTier,
  user: LoggedUser | null,
): ReactElement => {
  const { reveal } = tier;
  switch (reveal.kind) {
    case 'joke':
      return <JokeReveal tier={tier} />;
    case 'roast':
      return <RoastReveal tier={tier} />;
    case 'mascotHug':
      return <PatchyPictureReveal tier={tier} user={user} />;
    case 'trivia':
      return <TriviaReveal tier={tier} />;
    case 'cores':
      return (
        <Scene
          tier={tier}
          // The card already shows "+N Cores" big, so skip the duplicate
          // headline; the body line still gives context.
          hideHeadline
          object={<CoresStack amount={reveal.amount ?? 500} />}
          action={primaryButton('View your balance')}
        />
      );
    case 'plus':
      return (
        <Scene
          tier={tier}
          object={<PlusCard duration={reveal.duration} />}
          action={primaryButton('Explore what Plus unlocks')}
        />
      );
    case 'swagDiscount':
      return <SwagReveal tier={tier} />;
    case 'suggestCause':
      return <SuggestCauseReveal tier={tier} />;
    case 'council':
      return (
        <Scene
          tier={tier}
          object={<CouncilObject channel={reveal.channel} user={user} />}
          action={primaryButton('Join the Slack', <SlackIcon />)}
        />
      );
    default:
      // Invariant: a new reveal kind without a branch here should fail loudly.
      throw new Error(`Unhandled reveal kind: ${reveal.kind}`);
  }
};

interface RewardRevealContentProps {
  tier: PlaygroundTier;
  user: LoggedUser | null;
}

// Each reveal is now self-composing (object + copy + action), so the content is
// just the scene — no shared header prefixing every pop-up.
export const RewardRevealContent = ({
  tier,
  user,
}: RewardRevealContentProps): ReactElement => revealBody(tier, user);

interface RevealDialogShellProps {
  onClose: () => void;
  children: ReactNode;
}

// The founding-style surface shared by every reward pop-up AND the gallery: a
// colorful gradient frame (purple→pink→gold) around an opaque base with a faint
// colorful wash (true low opacity via color-mix — the Tailwind `/opacity`
// modifier doesn't take on these token gradient stops). The frame is a 1px
// hairline on top/sides but ~8px at the bottom (`pb-2`); the inner bottom
// corners use ELLIPTICAL radii (23×16) concentric with the outer rounded-24, so
// the thicker band curves smoothly around the corner. Reused so gallery
// previews match the real pop-up.
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
          <ConfettiBurst />
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
  tier,
  user,
  onClose,
}: RewardRevealContentProps & { onClose: () => void }): ReactElement => (
  <RevealDialogShell onClose={onClose}>
    <RewardRevealContent tier={tier} user={user} />
  </RevealDialogShell>
);
