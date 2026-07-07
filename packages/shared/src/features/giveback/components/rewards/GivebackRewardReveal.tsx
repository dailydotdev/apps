import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import {
  DevPlusIcon,
  SparkleIcon,
  UserIcon,
  VIcon,
} from '../../../../components/icons';
import LogoText from '../../../../svg/LogoText';
import { getCoreCurrencyImage } from '../../../../lib/image';
import { anchorDefaultRel } from '../../../../lib/strings';
import { FlexCol, FlexRow } from '../../../../components/utilities';
import type { LoggedUser } from '../../../../lib/user';
import { useCountUp, usePrefersReducedMotion } from '../../useGivebackMotion';
import { GivebackConfettiBurst } from '../GivebackConfettiBurst';
import { GivebackReveal as Reveal } from '../GivebackReveal';
import type { RewardReveal } from './rewardReveal';
import { GivebackSecretScratch } from './GivebackSecretScratch';

// The reward-claim reveal: a cinematic pop-up shown after a contributor claims a
// reward on the journey. Every reward is a designed OBJECT — a coin, a
// membership card, a coupon, an emblem — with a short headline + line under it.
// Motion is the giveback house style (staged de-blur enter, spring pops), all
// reduced-motion-guarded. See `rewardReveal.ts` for how a reward tier resolves
// to one of these.

const STAGGER_STEP = 70;
const STORE_URL = 'https://store.daily.dev';

// The level chip (profile-image style) — no "reward unlocked" label. Hidden when
// the level isn't known (e.g. the founding award, which isn't a numbered tier).
const LevelChip = ({
  levelNumber,
}: {
  levelNumber?: number;
}): ReactElement | null => {
  if (!levelNumber || levelNumber <= 0) {
    return null;
  }
  return (
    <span className="rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2.5 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
      Lvl {levelNumber}
    </span>
  );
};

// The copy under the hero object: a big cinematic headline + the line.
const RevealCopy = ({
  reveal,
  delayBase = 0,
  hideHeadline = false,
}: {
  reveal: RewardReveal;
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
          {reveal.headline}
        </Typography>
      </Reveal>
    )}
    <Reveal delay={delayBase + STAGGER_STEP}>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-sm [text-wrap:pretty]"
      >
        {reveal.body}
      </Typography>
    </Reveal>
  </FlexCol>
);

// Standard scene scaffold: hero object, then copy, then an optional action.
const Scene = ({
  object,
  reveal,
  levelNumber,
  action,
  hideHeadline,
}: {
  object: ReactNode;
  reveal: RewardReveal;
  levelNumber?: number;
  action?: ReactNode;
  hideHeadline?: boolean;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
    </Reveal>
    <Reveal
      delay={STAGGER_STEP}
      className="relative flex items-center justify-center"
    >
      {object}
    </Reveal>
    <RevealCopy
      reveal={reveal}
      delayBase={STAGGER_STEP * 3}
      hideHeadline={hideHeadline}
    />
    {action && <Reveal delay={STAGGER_STEP * 6}>{action}</Reveal>}
  </FlexCol>
);

// Every reveal closes on a solid Primary CTA — the confident "take the win"
// action. With no destination wired yet, it simply dismisses the celebration.
const DismissButton = ({
  label,
  icon,
  onClose,
}: {
  label: string;
  icon?: ReactElement;
  onClose: () => void;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Medium}
    variant={ButtonVariant.Primary}
    icon={icon}
    onClick={onClose}
  >
    {label}
  </Button>
);

// ── Objects ────────────────────────────────────────────────────────────────

// Cores → the real daily.dev Cores stack (art grows with the amount) on a shiny
// multi-hue gradient with a gold border — echoing the Cores brand artwork.
const CoresStack = ({ amount }: { amount: number }): ReactElement => {
  const shown = useCountUp(amount, true, 900);
  return (
    <div
      className="relative flex w-72 max-w-full flex-col items-center gap-2 overflow-hidden rounded-24 p-6 shadow-2 ring-1 ring-inset ring-border-subtlest-tertiary motion-safe:animate-reward-pop"
      // Fixed dark base (like the Plus card) so the shiny market-cover look and
      // white total read correctly in BOTH themes.
      style={{ backgroundColor: '#0b0e14' }}
    >
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

// A gold EMV-style chip for the membership card.
const CardChip = (): ReactElement => (
  <span className="relative flex h-7 w-10 items-center justify-center overflow-hidden rounded-6 bg-gradient-to-br from-accent-cheese-default to-accent-bun-default">
    <span className="bg-accent-bun-default/60 absolute inset-y-1 left-1/2 w-px -translate-x-1/2" />
    <span className="bg-accent-bun-default/60 absolute inset-x-1 top-1/2 h-px -translate-y-1/2" />
    <span className="ring-accent-bun-default/60 size-3 rounded-2 ring-1" />
  </span>
);

// Plus → a real daily.dev membership card: deep-purple aurora, gold chip, mono
// details, the authentic logo.
const PlusCard = ({ duration }: { duration?: string }): ReactElement => (
  <div
    className="relative aspect-[1.586] w-72 max-w-full overflow-hidden rounded-16 p-4 shadow-2 ring-1 ring-inset ring-accent-bacon-default motion-safe:animate-reward-pop"
    style={
      {
        backgroundImage:
          'radial-gradient(120% 90% at 80% 8%, rgba(232,64,128,0.6), transparent 55%), linear-gradient(135deg, #4a1533 0%, #1a0d1e 60%, #34163f 100%)',
        // The card is ALWAYS dark, so pin the logo/text-primary paths to white
        // — otherwise in light theme the daily.dev logo fills dark and vanishes.
        '--theme-text-primary': '#FFFFFF',
      } as React.CSSProperties
    }
  >
    <span className="pointer-events-none absolute -bottom-8 -right-10 text-white opacity-[0.08] [&_svg]:size-44">
      <DevPlusIcon />
    </span>
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

// A ring of teammate tiles with the visitor standing out in a gradient frame —
// used by the Council seat reveal so it reads as "you're in the room". The
// teammates are neutral tiles (no fabricated faces); the visitor is the one real
// avatar.
const TEAMMATE_TILES = 3;
const MemberRing = ({ user }: { user: LoggedUser | null }): ReactElement => (
  <FlexCol className="items-center gap-4">
    <FlexRow className="items-center">
      {Array.from({ length: TEAMMATE_TILES }).map((_, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="-ml-2.5 flex size-10 items-center justify-center rounded-12 bg-surface-float text-text-tertiary ring-2 ring-background-default first:ml-0 [&_svg]:size-5"
        >
          <UserIcon />
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

// Picture with Patchy → an asset-light 2-stage flow. "Take a selfie" plays a
// brief beat, then Patchy poses beside the visitor's photo.
// PLACEHOLDER: uses the invite-friends charm until the bespoke animated selfie
// asset is uploaded to the CDN.
const PatchyPictureReveal = ({
  reveal,
  levelNumber,
  user,
  onClose,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
  user: LoggedUser | null;
  onClose: () => void;
}): ReactElement => {
  const [stage, setStage] = useState<'idle' | 'playing' | 'result'>('idle');

  useEffect(() => {
    if (stage !== 'playing') {
      return undefined;
    }
    const done = setTimeout(() => setStage('result'), 1100);
    return () => clearTimeout(done);
  }, [stage]);

  if (stage === 'result') {
    return (
      <FlexCol className="items-center gap-5">
        <Reveal delay={0}>
          <LevelChip levelNumber={levelNumber} />
        </Reveal>
        <Reveal delay={STAGGER_STEP} className="w-full">
          <FlexRow className="items-end justify-center gap-3 motion-safe:animate-reward-pop">
            {reveal.image && (
              <img
                src={reveal.image}
                alt="Patchy"
                loading="lazy"
                className="h-40 w-auto select-none object-contain"
              />
            )}
            <span className="mb-2 rounded-16 bg-gradient-to-br from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default p-0.5">
              <span className="block size-24 overflow-hidden rounded-[14px]">
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
            </span>
          </FlexRow>
        </Reveal>
        <RevealCopy reveal={reveal} delayBase={STAGGER_STEP * 3} />
        <Reveal delay={STAGGER_STEP * 6}>
          <DismissButton label="Nice shot" onClose={onClose} />
        </Reveal>
      </FlexCol>
    );
  }

  if (stage === 'playing') {
    return (
      <FlexCol className="items-center gap-6">
        <Reveal delay={0}>
          <LevelChip levelNumber={levelNumber} />
        </Reveal>
        {reveal.image && (
          <img
            src={reveal.image}
            alt="Patchy taking a selfie with you"
            loading="lazy"
            className="h-48 w-auto select-none object-contain motion-safe:animate-mascot-bob"
          />
        )}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Say cheese…
        </Typography>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <LevelChip levelNumber={levelNumber} />
      </Reveal>
      {reveal.image && (
        <Reveal delay={STAGGER_STEP}>
          <img
            src={reveal.image}
            alt="Patchy"
            loading="lazy"
            className="h-48 w-auto select-none object-contain"
          />
        </Reveal>
      )}
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

// A "note from daily.dev" card: a big sticker emoji, the grateful/funny message,
// and a signature. The whole message is data, so any custom reward gets its own
// note. Dark card matching the Secret scratch card.
const NoteReveal = ({
  reveal,
  levelNumber,
  onClose,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
  onClose: () => void;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
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
      <DismissButton label="Love it" onClose={onClose} />
    </Reveal>
  </FlexCol>
);

// Real product shots from the daily.dev store so the swag reward reads as the
// actual shop. Duplicated + marquee'd for a seamless auto-scrolling strip.
const SWAG_IMAGES: ReadonlyArray<string> = [
  `${STORE_URL}/cdn/shop/files/unisex-premium-hoodie-black-front-64f840b15db90.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/kiss-cut-holographic-stickers-grey-4x4-front-64f88c587f9b4.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/enamel-mug-white-12oz-front-64f85e69428dd.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/unisex-premium-hoodie-team-royal-front-64f89116e8970.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/all-over-print-minimalist-backpack-white-front-64f85ba2ac64c.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/sports-water-bottle-charcoal-front-65799c386b8d1.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/embroidered-patches-black-square-3x3-front-64f89d10b2560.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/laptop-sleeve-13-front-64f861ac52f4e.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/hardcover-bound-notebook-black-front-64f85fe913dbb.jpg?width=360`,
  `${STORE_URL}/cdn/shop/files/tie-dye-beanie-ocean-front-64f8aa98343d3.jpg?width=360`,
];

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
// the prize. The code isn't shown — we tell them it's coming by email, so the
// real flow can generate a single-use code server-side.
const SwagReveal = ({
  reveal,
  levelNumber,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
}): ReactElement => {
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
          <LevelChip levelNumber={levelNumber} />
        </Reveal>
        <Reveal delay={STAGGER_STEP} className="w-full">
          <FlexCol className="relative items-center gap-1 text-center">
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
          <Button
            tag="a"
            href={STORE_URL}
            target="_blank"
            rel={anchorDefaultRel}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
          >
            Browse the store
          </Button>
        </Reveal>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <LevelChip levelNumber={levelNumber} />
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
      <RevealCopy reveal={reveal} delayBase={STAGGER_STEP * 2} />
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

// The causes we already fund, rendered as a looping conveyor of cards so
// "suggest a cause" reads as joining a real, curated list.
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

// Place each card by its slot relative to the current front (0 = front). On
// every tick `front` advances: the front card falls down + fades, clipped off
// the bottom, while the card behind rises into the front and a fresh one fades
// in at the back. Because the leaving card exits downward, there's no z-index
// pop or flicker.
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
    return { y: 34, scale: 0.92, z: 20, opacity: 0 };
  }
  return { y: -18, scale: 0.88, z: 10, opacity: 0 };
};

const CausesStack = (): ReactElement => {
  const [front, setFront] = useState(0);
  const reduced = usePrefersReducedMotion();
  const count = CAUSES.length;

  useEffect(() => {
    if (reduced) {
      return undefined;
    }
    const id = setInterval(
      () => setFront((value) => (value + 1) % count),
      CAUSE_ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [count, reduced]);

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

// Suggest a cause → a celebration that the privilege is unlocked, over the
// carousel of causes we already fund. "Suggest now" is the entry to the real
// nomination flow.
// PLACEHOLDER: the nomination flow doesn't exist yet, so the CTA dismisses for
// now — wire it to the suggest-a-cause form once that endpoint lands.
const SuggestCauseReveal = ({
  reveal,
  levelNumber,
  onClose,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
  onClose: () => void;
}): ReactElement => (
  <FlexCol className="items-center gap-5">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
    </Reveal>
    <RevealCopy reveal={reveal} delayBase={STAGGER_STEP} />
    <Reveal delay={STAGGER_STEP * 3} className="w-full">
      <CausesStack />
    </Reveal>
    <Reveal delay={STAGGER_STEP * 5}>
      <DismissButton label="Suggest now" onClose={onClose} />
    </Reveal>
  </FlexCol>
);

const TriviaReveal = ({
  reveal,
  levelNumber,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
    </Reveal>
    <RevealCopy reveal={reveal} delayBase={STAGGER_STEP} />
    <Reveal delay={STAGGER_STEP * 3} className="w-full">
      <GivebackSecretScratch fact={reveal.fact ?? ''} />
    </Reveal>
  </FlexCol>
);

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
