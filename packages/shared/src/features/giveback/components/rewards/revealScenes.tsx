import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import {
  DevPlusIcon,
  SlackIcon,
  SparkleIcon,
  VIcon,
} from '../../../../components/icons';
import LogoText from '../../../../svg/LogoText';
import {
  cloudinaryGivebackCouncilMembers,
  cloudinaryGivebackPatchyCardFrame,
  cloudinaryGivebackPatchySelfieMov,
  cloudinaryGivebackPatchySelfieWebm,
  getCoreCurrencyImage,
} from '../../../../lib/image';
import { anchorDefaultRel } from '../../../../lib/strings';
import { getDomainFromUrl } from '../../../../lib/links';
import { FlexCol, FlexRow } from '../../../../components/utilities';
import type { LoggedUser } from '../../../../lib/user';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureGivebackSuggestCause } from '../../../../lib/featureManagement';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import { useCountUp, usePrefersReducedMotion } from '../../useGivebackMotion';
import { useContributionCausePicker } from '../../hooks/useContributionCausePicker';
import type { ContributionCause } from '../../types';
import { GivebackReveal as Reveal } from '../GivebackReveal';
import { GivebackSuggestCauseModal } from '../GivebackSuggestCauseModal';
import type { RewardReveal } from './rewardReveal';
import { GivebackSecretScratch } from './GivebackSecretScratch';
import {
  CardChip,
  DismissButton,
  LevelChip,
  RevealCopy,
  STAGGER_STEP,
  STORE_URL,
} from './revealScaffold';

// ── Objects ────────────────────────────────────────────────────────────────

// Cores → the real daily.dev Cores stack (art grows with the amount) on a shiny
// multi-hue gradient with a gold border — echoing the Cores brand artwork.
export const CoresStack = ({ amount }: { amount: number }): ReactElement => {
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

// Plus → a real daily.dev membership card: deep-purple aurora, gold chip, mono
// details, the authentic logo.
export const PlusCard = ({ duration }: { duration?: string }): ReactElement => (
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

// A ring of real teammate avatars (Slack profile photos) with the visitor
// standing out in a gradient frame — so the Council seat reveal reads as
// "you're in the room" with the actual team.
export const MemberRing = ({
  user,
}: {
  user: LoggedUser | null;
}): ReactElement => (
  <FlexCol className="items-center gap-4">
    {/* A Slack pill above the ring — signals this is a real space you're
        joining, not just a badge. */}
    <FlexRow className="items-center gap-2 rounded-10 bg-surface-float px-3 py-1.5 motion-safe:animate-reward-pop [&_svg]:size-5">
      <SlackIcon />
      <Typography bold type={TypographyType.Footnote}>
        daily.dev Council
      </Typography>
    </FlexRow>
    <FlexRow className="items-center">
      {cloudinaryGivebackCouncilMembers.map((src) => (
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

// Council → a seat in the private contributor Slack. The invite link is emailed,
// so the reveal celebrates the seat and sends the user to their inbox rather
// than implying there's a room to walk into right now.
export const CouncilReveal = ({
  reveal,
  levelNumber,
  user,
  onClose,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
  user: LoggedUser | null;
  onClose: () => void;
}): ReactElement => (
  <FlexCol className="items-center gap-6">
    <Reveal delay={0}>
      <LevelChip levelNumber={levelNumber} />
    </Reveal>
    <Reveal
      delay={STAGGER_STEP}
      className="relative flex items-center justify-center"
    >
      <MemberRing user={user} />
    </Reveal>
    <RevealCopy reveal={reveal} delayBase={STAGGER_STEP * 3} />
    <Reveal delay={STAGGER_STEP * 5}>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-xs text-center [text-wrap:pretty]"
      >
        Check your inbox. We&apos;ll email your invite link to the private Slack
        shortly.
      </Typography>
    </Reveal>
    <Reveal delay={STAGGER_STEP * 6}>
      <DismissButton label="Got it" onClose={onClose} />
    </Reveal>
  </FlexCol>
);

// Picture with Patchy → a 3-stage flow built on the bespoke selfie video. A
// single transparent <video> (WebM for most browsers, HEVC-alpha .mov for
// Safari — the PersonaMascot source-order pattern) stays mounted across idle and
// playing: idle shows it paused on its first frame, "Take a selfie" plays it
// once, and onEnded advances to the result — Patchy holding a card frame with
// the visitor's photo dropped in. Reduced motion skips playback straight to the
// framed result.
export const PatchyPictureReveal = ({
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Fail-safe: `onEnded` is the normal path to the result, but if it never
  // fires (a source that can't decode, or a browser that drops the event),
  // don't strand the user on the playing stage. The clip is ~6s; this generous
  // cap only trips on a genuine fault, so it won't truncate normal playback.
  useEffect(() => {
    if (stage !== 'playing') {
      return undefined;
    }
    const done = setTimeout(() => setStage('result'), 12000);
    return () => clearTimeout(done);
  }, [stage]);

  const play = () => {
    if (reducedMotion) {
      setStage('result');
      return;
    }
    setStage('playing');
    // A rejected play() (autoplay policy, not-yet-ready) must not leave the
    // user staring at a frozen frame — jump straight to the result. `play()`
    // returns undefined outside modern browsers (jsdom, legacy), so guard the
    // `.catch` with optional chaining too.
    videoRef.current?.play()?.catch(() => setStage('result'));
  };

  if (stage === 'result') {
    return (
      <FlexCol className="items-center gap-5">
        <Reveal delay={0}>
          <LevelChip levelNumber={levelNumber} />
        </Reveal>
        <Reveal delay={STAGGER_STEP} className="w-full">
          <div className="relative mx-auto w-full max-w-xs motion-safe:animate-reward-pop">
            <img
              src={cloudinaryGivebackPatchyCardFrame}
              alt="Patchy holding a frame with you in it"
              loading="lazy"
              className="w-full select-none object-contain"
            />
            {/* The visitor's photo dropped into the card frame Patchy holds. */}
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
        <RevealCopy reveal={reveal} delayBase={STAGGER_STEP * 3} />
        <Reveal delay={STAGGER_STEP * 6}>
          <DismissButton label="Nice shot" onClose={onClose} />
        </Reveal>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="items-center gap-6">
      <Reveal delay={0}>
        <LevelChip levelNumber={levelNumber} />
      </Reveal>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        onEnded={() => setStage('result')}
        onError={() => setStage('result')}
        aria-label="Patchy taking a selfie with you"
        className="h-48 w-auto select-none object-contain"
      >
        {/* WebM first: every browser that can plays VP9 alpha uses it; Safari
            can't, so it falls through to the HEVC-alpha .mov. */}
        <source src={cloudinaryGivebackPatchySelfieWebm} type="video/webm" />
        <source
          src={cloudinaryGivebackPatchySelfieMov}
          type='video/quicktime; codecs="hvc1"'
        />
      </video>
      {stage === 'playing' ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Say cheese…
        </Typography>
      ) : (
        <>
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
                Patchy wants a photo with you. Grab yours to keep forever.
              </Typography>
            </Reveal>
          </FlexCol>
          <Reveal delay={STAGGER_STEP * 5}>
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              onClick={play}
            >
              Take a selfie
            </Button>
          </Reveal>
        </>
      )}
    </FlexCol>
  );
};

// ── Interactive reveals (own their layout) ──────────────────────────────────

// A "note from daily.dev" card: a big sticker emoji, the grateful/funny message,
// and a signature. The whole message is data, so any custom reward gets its own
// note. Dark card matching the Secret scratch card.
export const NoteReveal = ({
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
export const SwagReveal = ({
  reveal,
  levelNumber,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
}): ReactElement => {
  const percent = reveal.percent ?? 0;
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
            Check your inbox. We&apos;ll email your discount code and the
            details shortly.
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

// How many of the live causes to cycle through — enough to read as a real,
// curated list without stacking 100 absolutely-positioned cards.
const DISPLAYED_CAUSES = 6;

// A cause doesn't always ship its own logo, so fall back to its site favicon.
const faviconForUrl = (url: string | null): string | null =>
  url ? `https://icons.duckduckgo.com/ip3/${getDomainFromUrl(url)}.ico` : null;

const CauseLogo = ({ cause }: { cause: ContributionCause }): ReactElement => {
  const [failed, setFailed] = useState(false);
  const src = cause.logoUrl ?? faviconForUrl(cause.url);
  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-12 bg-white">
      {!src || failed ? (
        <span className="flex size-full items-center justify-center bg-accent-cabbage-flat text-accent-cabbage-default [&_svg]:size-4">
          <SparkleIcon />
        </span>
      ) : (
        <img
          src={src}
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

const CausesStack = ({
  causes,
}: {
  causes: ContributionCause[];
}): ReactElement => {
  const shown = causes.slice(0, DISPLAYED_CAUSES);
  const [front, setFront] = useState(0);
  const reduced = usePrefersReducedMotion();
  const count = shown.length;

  useEffect(() => {
    // Nothing to rotate through with a single card.
    if (reduced || count <= 1) {
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
        Already on the list
      </Typography>
      {/* overflow-hidden clips the leaving card as it falls off the bottom. */}
      <div className="relative mx-auto h-20 w-full overflow-hidden">
        {shown.map((cause, index) => {
          const rel = (index - front + count) % count;
          const pos = causeSlot(rel, count);
          return (
            <FlexRow
              key={cause.id}
              className="absolute inset-x-0 bottom-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-2.5 duration-500 ease-out motion-safe:transition-[transform,opacity]"
              style={{
                backgroundColor: '#17111f',
                transform: `translateY(${pos.y}px) scale(${pos.scale})`,
                zIndex: pos.z,
                opacity: pos.opacity,
              }}
            >
              <CauseLogo cause={cause} />
              <FlexCol className="min-w-0 flex-1">
                <Typography
                  bold
                  type={TypographyType.Footnote}
                  className="truncate text-white"
                  tag={TypographyTag.Span}
                >
                  {cause.title}
                </Typography>
                {cause.category && (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    className="truncate"
                    style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                  >
                    {cause.category}
                  </Typography>
                )}
              </FlexCol>
            </FlexRow>
          );
        })}
      </div>
    </FlexCol>
  );
};

// Suggest a cause → a celebration that the privilege is unlocked, over the
// carousel of the live causes we already fund. "Suggest now" opens the same
// nomination modal the Causes tab uses. The flow is gated on
// `featureGivebackSuggestCause` (the team rolls it out with the feature access);
// when it's off the CTA just dismisses, keeping the celebration harmless.
export const SuggestCauseReveal = ({
  reveal,
  levelNumber,
  onClose,
}: {
  reveal: RewardReveal;
  levelNumber?: number;
  onClose: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  // Cache hit: the roadmap already loads the cause picker, so this reuses it.
  const { causes } = useContributionCausePicker(true);
  const { value: canSuggest } = useConditionalFeature({
    feature: featureGivebackSuggestCause,
    shouldEvaluate: true,
  });
  const [showModal, setShowModal] = useState(false);

  const onSuggest = () => {
    if (!canSuggest) {
      onClose();
      return;
    }
    logEvent({
      event_name: LogEvent.OpenGivebackCauseSuggestion,
      extra: JSON.stringify({ origin: 'reward_reveal' }),
    });
    setShowModal(true);
  };

  return (
    <FlexCol className="items-center gap-5">
      <Reveal delay={0}>
        <LevelChip levelNumber={levelNumber} />
      </Reveal>
      <RevealCopy reveal={reveal} delayBase={STAGGER_STEP} />
      {causes.length > 0 && (
        <Reveal delay={STAGGER_STEP * 3} className="w-full">
          <CausesStack causes={causes} />
        </Reveal>
      )}
      <Reveal delay={STAGGER_STEP * 5}>
        <DismissButton label="Suggest now" onClose={onSuggest} />
      </Reveal>
      {/* Opens over the celebration; closing it tears down the whole reveal so
          the visitor lands back on the page, not the confetti. */}
      {showModal && (
        <GivebackSuggestCauseModal onClose={onClose} origin="reward_reveal" />
      )}
    </FlexCol>
  );
};

export const TriviaReveal = ({
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
