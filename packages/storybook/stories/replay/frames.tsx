import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { describeStanding, StandingForm } from './standing';
import type { StandingInput } from './standing';
import { RaritySparkles } from '@dailydotdev/shared/src/features/profile/components/achievements/RaritySparkles';
import type { AchievementRarityTier } from '@dailydotdev/shared/src/features/profile/components/achievements/achievementRarity';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons/gift';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { ReputationLightningIcon } from '@dailydotdev/shared/src/components/icons/ReputationLightning';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import type { Candidate } from './catalog';
import { Category, FrameLayout, Shareability } from './catalog';
import { asset, GOLD_GRADIENT, RarityTier, rarityRgb, rarityTierFor } from './assets';
import { monogramOf, sourceBy, sourceLogo } from './sources';
import type { StreakTier } from './assets';
import { charmArt, GLASS, HERO_PANEL, streakTierArt } from './assets';
import { BadgeMedal } from './BadgeMedal';

import type { Person } from './people';
import { Avatar, AvatarStack, ME } from './people';

/**
 * The product's own icon set. A frame about a reward shows the icon the reward
 * already uses everywhere else in the app, so the frame reads as a trophy the
 * person recognises rather than a mock-up someone drew for it.
 */
const ICONS = {
  medal: MedalIcon,
  medalBadge: MedalBadgeIcon,
  star: StarIcon,
  sparkle: SparkleIcon,
  core: CoreIcon,
  gift: GiftIcon,
  streak: HotIcon,
  reputation: ReputationLightningIcon,
  magic: MagicIcon,
} as const;

export type FrameIcon = keyof typeof ICONS;

/** One of the product's icons, sized by its container. */
export const FrameIconGlyph = ({
  icon,
}: {
  icon: FrameIcon;
}): ReactElement => {
  const Glyph = ICONS[icon];
  return <Glyph />;
};

/**
 * The share canvases.
 *
 * These deliberately do not follow the Storybook light/dark toggle: a frame is
 * an image that will be exported and posted, so it holds one fixed look
 * wherever it renders. Everything is scoped to `rp-` classes for the same
 * reason — nothing here should inherit from the app shell.
 *
 * Every frame is a package, not a caption. It carries an eyebrow, a hero, the
 * claim, supporting detail, where that puts them against everyone else, and a
 * face. A frame with only a headline on it is a tweet someone could have typed
 * themselves, and nobody posts one of those.
 *
 * Sizing runs on container queries against a fixed authoring width, so the same
 * component is correct as a thumbnail, in the viewer, and at 1080x1920.
 */

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

// Ground and panel, sampled from the marketing site rather than invented.
const INK = '#0F0F12';
const PANEL_TOP = '#17171C';
const PAPER = '#F6F7F9';

const frameCss = `
/*
 * The house frame, taken from the long landing page rather than invented.
 *
 * Three things make it read as daily.dev instead of "a dark card with a
 * gradient", and all three are structural:
 *
 * 1. A DOUBLE BORDER. A padded outer frame carrying a cabbage tint and a 1px
 *    hairline, with the real panel nested inside it and its own hairline.
 *    Radii stay concentric (32 - 8 = 24), which is the detail that stops it
 *    looking like two boxes that happen to be near each other.
 * 2. A LIT TOP LIP on the inner panel. An inset 0 1px 0 in white at 10% is what
 *    sells glass; without it the panel is just a fill.
 * 3. A TOP GLOW THROWN FROM OUTSIDE THE EDGE, from three offset sources in
 *    cabbage, onion and bacon, so no single hue is identifiable. One centred
 *    radial in one colour is exactly what makes a background look generic.
 */
.rp-frame {
  container-type: inline-size;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  border-radius: 7.6cqw;
  padding: 1.9cqw;
  background: color-mix(in srgb, #CE3DF3 6%, transparent);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
  font-family: ${SANS};
  isolation: isolate;
  --theme-text-primary: ${PAPER};
}

.rp-panel {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* Pins the eyebrow to the top and the footer to the bottom, so the hero
     absorbs the slack instead of the whole block floating in the middle. */
  justify-content: space-between;
  gap: 5cqw;
  overflow: hidden;
  border-radius: 5.7cqw;
  padding: 7cqw 6.2cqw;
  color: ${PAPER};
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%, color-mix(in srgb, #CE3DF3 8%, transparent) 0%, transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%, color-mix(in srgb, #4A7EEE 7%, transparent) 0%, transparent 70%),
    ${INK};
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.12),
    inset 0 1px 0 rgb(255 255 255 / 0.1);
  isolation: isolate;
}

/*
 * The top glow. Sources sit just outside the top edge so the light falls into
 * the panel rather than sitting on it, and three hues overlap so none of them
 * is nameable. This is the single biggest difference between the house look
 * and a generic gradient.
 */
.rp-topglow {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(80% 62% at 50% -8%, color-mix(in srgb, #CE3DF3, transparent 62%) 0%, transparent 62%),
    radial-gradient(58% 48% at 10% -12%, color-mix(in srgb, #6B56DD, transparent 66%) 0%, transparent 58%),
    radial-gradient(58% 48% at 90% -12%, color-mix(in srgb, #F25D82, transparent 72%) 0%, transparent 58%);
}

/* The frame's own hue, kept low so a card reads as its family without the
   whole panel taking a colour cast. */
.rp-grain {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: radial-gradient(72% 44% at 50% 104%, var(--rp-hue) 0%, transparent 66%);
  opacity: 0.14;
}

/* Blur orbs in screen blend, the way the landing page lights its scroll. */
.rp-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(14cqw);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: -1;
  opacity: 0.45;
}
.rp-orb--a { width: 58cqw; height: 58cqw; left: -16cqw; top: 2cqw; background: #BA56E1; }
.rp-orb--b { width: 46cqw; height: 46cqw; right: -14cqw; bottom: 8cqw; background: #4A7EEE; }

/* Charm, the daily.dev mascot. Sits low and quiet, at a size where it reads as
   brand texture rather than a sticker dropped on a chart. */
/* Charm sits in the footer's right slot as a flow element, not as an absolute
   overlay. An absolutely positioned mascot can always be made to collide with
   a full-width row; a laid-out one cannot, and the wordmark moving to the top
   right is what freed the space for it. */
.rp-charm {
  width: 20cqw;
  height: 20cqw;
  object-fit: contain;
  flex-shrink: 0;
  margin-bottom: -2cqw;
  opacity: 0.95;
  pointer-events: none;
}

/* ---- shared type ---- */

/* The top row carries who it is about on the left and who made it on the
   right. The headline is the title, so no category tag sits above it. */
.rp-labelrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3cqw;
  min-width: 0;
  flex-shrink: 1;
}

.rp-hero {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4.6cqw;
}

/* ---- the 4:5 export ----
   Same content, 30% less height. The hero zooms down instead of reflowing,
   further for layouts that carry a visual, so nothing spills past the top row
   or into the standing block. */
.is-4-5 .rp-panel { gap: 3.4cqw; padding-top: 5.4cqw; padding-bottom: 5.4cqw; }
.is-4-5 .rp-hero { zoom: 0.84; }
.is-4-5 .rp-hero:has(.rp-badge, .rp-skyline, .rp-rows, .rp-podium, .rp-chips, .rp-posts, .rp-week, .rp-quotes, .rp-flame-wrap, .rp-level, .rp-people, .rp-tiles, .rp-ring, .rp-progress, .rp-split) { zoom: 0.7; }
/* Width-driven visuals ignore zoom (a 1fr grid still fills the panel), so
   they get a narrower track instead. */
.is-4-5 .rp-matrix-grid { width: 62%; margin: 0 auto; }
.is-4-5 .rp-plate { width: 40cqw; height: 40cqw; }
.is-4-5 .rp-hero:has(.rp-matrix, .rp-plate) { gap: 3cqw; }
.is-4-5 .rp-hero:has(.rp-posts) { zoom: 0.64; }

.rp-statement {
  font-size: 11.8cqw;
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.rp-statement.is-small { font-size: 8.8cqw; }

/* "47" and "18,420" cannot share a size. Long figures step down rather than
   running off the card. */
.rp-huge.is-long { font-size: 27cqw; }
.rp-huge.is-xlong { font-size: 21cqw; }
.rp-huge {
  font-size: 38cqw;
  white-space: nowrap;
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: -0.055em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(160deg, ${PAPER} 12%, var(--rp-hue) 92%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.rp-unit {
  font-size: 5.1cqw;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(246 247 249 / 0.8);
}
.rp-note {
  font-size: 4.2cqw;
  line-height: 1.38;
  color: rgb(246 247 249 / 0.62);
  text-wrap: pretty;
}

/* ---- standing: where this puts them against everyone else ---- */

.rp-standing {
  display: flex;
  align-items: center;
  gap: 4cqw;
  padding: 4.2cqw 4.4cqw;
  border-radius: 3.6cqw;
  background: rgb(255 255 255 / 0.07);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.09);
  flex-shrink: 1;
}
.rp-standing-figure {
  font-size: 9.8cqw;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--rp-hue);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.rp-standing-copy {
  display: flex;
  flex-direction: column;
  gap: 0.6cqw;
  flex: 1 1 auto;
  min-width: 0;
}
.rp-standing-label {
  font-family: ${MONO};
  font-size: 2.7cqw;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(246 247 249 / 0.5);
}
.rp-standing-scope {
  font-size: 3.9cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.9);
  line-height: 1.2;
}
/* A bar showing the whole population with them near one end. */
.rp-standing-bar {
  position: relative;
  height: 1.6cqw;
  border-radius: 999px;
  margin-top: 1.4cqw;
  background: linear-gradient(90deg, var(--rp-hue) 0%, rgb(255 255 255 / 0.12) 100%);
}
.rp-standing-pin {
  position: absolute;
  top: 50%;
  width: 3cqw;
  height: 3cqw;
  border-radius: 50%;
  background: ${PAPER};
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0.8cqw rgb(12 14 19 / 0.85);
}

/* ---- context chips: two supporting facts, kept quiet ---- */

.rp-context {
  display: flex;
  flex-wrap: wrap;
  gap: 2cqw;
  flex-shrink: 1;
}
.rp-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 1.6cqw;
  min-width: 0;
  padding: 1.7cqw 2.8cqw;
  border-radius: 2.4cqw;
  background: rgb(255 255 255 / 0.05);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07);
}
.rp-chip-value {
  font-size: 3.7cqw;
  white-space: nowrap;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.rp-chip-label {
  font-family: ${MONO};
  font-size: 2.3cqw;
  line-height: 1;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgb(246 247 249 / 0.5);
}

/* ---- footer ---- */

.rp-charmrow { display: flex; justify-content: flex-end; flex-shrink: 1; }
.rp-foot-who { display: flex; align-items: center; gap: 2.4cqw; min-width: 0; flex: 0 1 auto; }
.rp-foot-handle {
  font-size: 3.5cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.82);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}
/* The wordmark moved to the top right. It is the one thing on the card that
   is about us rather than about them, so it belongs in the corner rather than
   sharing the footer with their name. */
/* The real lockup. Both halves paint themselves with --theme-text-primary,
   which the frame pins, so the wordmark is the product's own artwork rather
   than the mark next to the words typed out in a mono face. */
.rp-mark { display: flex; align-items: center; gap: 2.3cqw; flex-shrink: 0; }
.rp-wordmark { height: 3.9cqw; display: flex; }
.rp-wordmark svg { height: 100%; width: auto; }
.rp-logo { width: 5.1cqw; height: 5.1cqw; flex-shrink: 0; display: flex; }
.rp-logo svg { width: 100%; height: 100%; }

/* The medal sits in a positioned box so the rarity sparkles can orbit it. */
.rp-medal-wrap { position: relative; display: flex; }

/* ---- rows ---- */

.rp-rows { display: flex; flex-direction: column; gap: 3.4cqw; }
.rp-row {
  display: flex;
  align-items: center;
  gap: 3.2cqw;
  font-size: 4.5cqw;
  flex-shrink: 1;
}
.rp-row-rank {
  font-family: ${MONO};
  font-size: 3.2cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.38);
  width: 4.5cqw;
  flex-shrink: 0;
}
.rp-row-label { font-weight: 700; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-row-value {
  font-family: ${MONO};
  font-size: 3.4cqw;
  font-variant-numeric: tabular-nums;
  color: rgb(246 247 249 / 0.66);
  flex-shrink: 0;
}
.rp-row.is-muted .rp-row-label { color: rgb(246 247 249 / 0.42); font-weight: 600; }
.rp-row.is-you .rp-row-label { color: var(--rp-hue); }
.rp-row.is-you .rp-row-value { color: var(--rp-hue); }

.rp-track {
  height: 2.4cqw;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  overflow: hidden;
  flex: 1 1 auto;
  min-width: 0;
}
.rp-fill { display: block; height: 100%; border-radius: 999px; background: var(--rp-hue); }
.rp-fill.is-down { background: rgb(255 255 255 / 0.26); }

/* ---- week strip ---- */

.rp-week { display: flex; gap: 2.6cqw; }
.rp-day { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 2.4cqw; }
.rp-day-cell {
  width: 100%;
  aspect-ratio: 1;
  /* A circle, not a rounded square. The reading streak's own visual language
     is round: the rail badge, the popup calendar and the day strip are all
     rings with a flame inside, and a square here reads as a different feature. */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.5cqw solid rgb(246 247 249 / 0.5);
  background: transparent;
}
/* Read: the disc is ours, so the flame on it is white. Same glyph-to-disc
   ratio the platform uses, roughly three quarters. */
.rp-day-cell.is-on {
  background: var(--rp-hue);
  border-color: transparent;
  box-shadow: 0 0 4cqw -1.5cqw var(--rp-hue);
}
.rp-day-cell.is-miss { border-style: dashed; border-color: rgb(246 247 249 / 0.34); }
.rp-day-flame { width: 74%; height: 74%; display: flex; color: #FFFFFF; }
.rp-day-flame svg { width: 100%; height: 100%; }
.rp-day-label { font-family: ${MONO}; font-size: 2.6cqw; color: rgb(246 247 249 / 0.42); }

/* The tier badge on a week strip, so a perfect week reads as a streak thing
   rather than a generic calendar. */
.rp-week-flame { display: flex; align-items: center; gap: 3cqw; }
.rp-week-flame img { width: 18cqw; height: 18cqw; object-fit: contain; }
.rp-week-tier {
  font-family: ${MONO};
  font-size: 3.2cqw;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rp-hue);
}

/* ---- ring ---- */

.rp-ring { display: flex; align-items: center; gap: 4cqw; }
.rp-ring-svg { width: 36cqw; height: 36cqw; flex-shrink: 0; }
.rp-ring-pct {
  font-size: 9.5cqw;
  font-weight: 800;
  letter-spacing: -0.04em;
  fill: ${PAPER};
  font-variant-numeric: tabular-nums;
}

/* ---- split ---- */

.rp-split { display: flex; align-items: flex-end; gap: 4cqw; }
.rp-split-part { display: flex; flex-direction: column; gap: 1.2cqw; flex: 1 1 0; min-width: 0; }
/* A five-character figure does not fit a half-width column at the display
   size, so long numbers step down rather than clipping. */
.rp-split-figure.is-long { font-size: 14cqw; }
.rp-split-figure.is-xlong { font-size: 11.5cqw; }
.rp-split-figure {
  font-size: 19.5cqw;
  white-space: nowrap;
  font-weight: 800;
  line-height: 0.84;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}
.rp-split-part.is-lead .rp-split-figure { color: var(--rp-hue); }
.rp-split-part.is-trail .rp-split-figure { color: rgb(246 247 249 / 0.34); }
.rp-split-label {
  font-family: ${MONO};
  font-size: 2.8cqw;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(246 247 249 / 0.55);
}

/* ---- badge: the real artwork on a plate ---- */

.rp-badge { display: flex; flex-direction: column; align-items: center; gap: 4.4cqw; text-align: center; }
.rp-plate {
  position: relative;
  width: 58cqw;
  height: 58cqw;
  border-radius: 6cqw;
  padding: 1cqw;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4cqw 14cqw -4cqw var(--rp-hue);
}
.rp-plate-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5cqw;
  background: #14161C;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
/* The product's own badge plate, used the way the app uses it: as the texture
   behind the subject, not as the subject. */
.rp-plate-texture {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}
.rp-plate-art { width: 74%; height: 74%; object-fit: contain; }
.rp-plate-glyph { font-size: 17cqw; font-weight: 800; color: var(--rp-hue); }
/* Product icons are drawn at whatever size the slot gives them. */
.rp-icon { display: flex; color: var(--rp-hue); }
.rp-icon svg { width: 100%; height: 100%; }
.rp-icon-plate { width: 26cqw; height: 26cqw; }
.rp-rarity.is-plain {
  color: rgb(246 247 249 / 0.62);
  background: rgb(255 255 255 / 0.06);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
}
.rp-rarity {
  font-family: ${MONO};
  font-size: 2.8cqw;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--rp-hue);
  padding: 1.4cqw 3cqw;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px currentcolor;
}

/* ---- podium ---- */

.rp-podium { display: flex; align-items: flex-end; justify-content: center; gap: 4cqw; }
.rp-step { display: flex; flex-direction: column; align-items: center; gap: 1.8cqw; flex: 1 1 0; min-width: 0; }
.rp-step-name {
  font-size: 3cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  flex-shrink: 1;
}
.rp-step.is-you .rp-step-name { color: ${PAPER}; }
.rp-step-block {
  width: 100%;
  border-radius: 2.4cqw 2.4cqw 0 0;
  background: rgb(255 255 255 / 0.09);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2cqw;
  font-family: ${MONO};
  font-size: 3.4cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.5);
}
.rp-step.is-you .rp-step-block {
  background: linear-gradient(180deg, var(--rp-hue), transparent 160%);
  color: ${INK};
}

/* ---- skyline ---- */

.rp-skyline { display: flex; align-items: flex-end; gap: 2.6cqw; }
.rp-tower { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: 1.4cqw; }
.rp-tower-stack { display: flex; flex-direction: column-reverse; gap: 1.1cqw; }
.rp-window { height: 2.6cqw; border-radius: 0.7cqw; background: var(--rp-hue); }
.rp-window.is-dim { background: rgb(255 255 255 / 0.1); }
.rp-tower-label {
  font-family: ${MONO};
  font-size: 2.5cqw;
  color: rgb(246 247 249 / 0.45);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}

/* ---- progress ---- */

.rp-progress { display: flex; flex-direction: column; gap: 3.4cqw; }
.rp-progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2cqw;
  font-family: ${MONO};
  font-size: 3.2cqw;
  color: rgb(246 247 249 / 0.6);
  font-variant-numeric: tabular-nums;
}
.rp-progress-track {
  height: 4.4cqw;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  overflow: hidden;
}
.rp-progress-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--rp-hue), ${PAPER});
}
.rp-reward {
  display: flex;
  align-items: center;
  gap: 2cqw;
  font-size: 3.4cqw;
  font-weight: 700;
  color: var(--rp-hue);
}

/* ---- people strip ---- */

.rp-people { display: flex; flex-direction: column; gap: 3cqw; flex-shrink: 1; }
.rp-people-note { font-size: 3.4cqw; color: rgb(246 247 249 / 0.62); text-wrap: pretty; }

/* ---- closer ---- */

.rp-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 3cqw; }
.rp-tile {
  border-radius: 3.4cqw;
  padding: 4cqw;
  background: rgb(255 255 255 / 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.6cqw;
  min-width: 0;
}
.rp-tile-figure {
  font-size: 9.8cqw;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--rp-hue);
}
.rp-tile-label {
  font-family: ${MONO};
  font-size: 2.6cqw;
  line-height: 1.25;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgb(246 247 249 / 0.5);
  overflow-wrap: anywhere;
  flex-shrink: 1;
}

/* ---- post rows: the track-list pattern ---- */

.rp-posts { display: flex; flex-direction: column; }
.rp-post {
  display: flex;
  align-items: center;
  gap: 3.8cqw;
  padding: 3.8cqw 0;
  position: relative;
}
/* Inset hairline, aligned to the text column rather than the card edge. The
   detail Apple uses on every track list, and the reason a dense list still
   reads as one object instead of a stack of boxes. */
.rp-post + .rp-post::before {
  content: '';
  position: absolute;
  top: 0;
  left: 17.2cqw;
  right: 0;
  height: 1px;
  background: rgb(255 255 255 / 0.09);
}
.rp-post-art {
  position: relative;
  width: 14cqw;
  height: 14cqw;
  flex-shrink: 0;
  border-radius: 3cqw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 4.4cqw;
  letter-spacing: -0.02em;
  color: rgb(12 14 19 / 0.8);
}
.rp-post-art img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rp-post-body { display: flex; flex-direction: column; gap: 0.8cqw; flex: 1 1 auto; min-width: 0; }
.rp-post-title {
  font-size: 3.9cqw;
  font-weight: 700;
  line-height: 1.24;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-wrap: pretty;
}
.rp-post-meta {
  font-size: 2.9cqw;
  color: rgb(246 247 249 / 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}
/* Read rows recede. They are still there, because "you already saw these" is
   half the information, but they must never compete with the ones that are
   still worth a tap. */
.rp-post.is-read .rp-post-art { opacity: 0.38; }
.rp-post.is-read .rp-post-title { color: rgb(246 247 249 / 0.42); font-weight: 600; }
.rp-post.is-read .rp-post-meta { color: rgb(246 247 249 / 0.32); }
.rp-post-state {
  flex-shrink: 0;
  width: 6.4cqw;
  height: 6.4cqw;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rp-post-state svg { width: 68%; height: 68%; }
/* The icon set's arrow points up, because it is the upvote glyph. A quarter
   turn makes it the "go and read this" affordance. */
.rp-post-state .rp-arrow { transform: rotate(90deg); }
.rp-post-state.is-read {
  background: rgb(255 255 255 / 0.12);
  color: rgb(246 247 249 / 0.55);
}
.rp-post-state.is-new {
  background: var(--rp-hue);
  color: ${INK};
}
.rp-posts-legend {
  display: flex;
  align-items: center;
  gap: 3cqw;
  font-family: ${MONO};
  font-size: 2.6cqw;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(246 247 249 / 0.45);
  flex-shrink: 1;
}
.rp-legend-key { display: flex; align-items: center; gap: 1.4cqw; }
.rp-legend-dot {
  width: 2.4cqw;
  height: 2.4cqw;
  border-radius: 50%;
  flex-shrink: 0;
}

/*
 * The hero panel, from Tomer's Game Center redesign.
 *
 * Artwork behind, and a DIRECTIONAL scrim over it: nearly opaque on the left
 * where the type sits, fading to almost nothing on the right where the art
 * should be visible. Laying type over unmodified artwork and hoping is what
 * makes hero panels illegible.
 */
.rp-panel.is-hero {
  background-color: ${HERO_PANEL.color};
  background-image: ${HERO_PANEL.scrim}, var(--rp-hero-art);
  background-size: auto, cover;
  background-position: center, 46% 50%;
}
.rp-panel.is-hero .rp-topglow,
.rp-panel.is-hero .rp-grain { display: none; }

/* Frosted glass, also from the Game Center HUD. Brighter than a low-alpha
   fill, with a border you can actually see, which is what lets whatever is
   behind read as glass rather than as a tint. */
.rp-glass {
  background: ${GLASS.fill};
  border: ${GLASS.border};
  color: #FFFFFF;
}

/* The claim shine: one skewed sweep across the thing you are meant to press.
   Lifted from the quest claim button, and used here on the only frame that
   asks for anything. */
@keyframes rpShine {
  0% { left: -60%; }
  22% { left: 130%; }
  100% { left: 130%; }
}
.rp-cta { position: relative; overflow: hidden; isolation: isolate; }
.rp-cta::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 45%;
  transform: skewX(-18deg);
  pointer-events: none;
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 0.75), transparent);
  animation: rpShine 2.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) { .rp-cta::after { display: none; } }

/*
 * Level, in the product's own language.
 *
 * daily.dev does not draw a level as a number on its own: it is a frosted-glass
 * rounded SQUARE badge sitting over a progress track on a deep violet ground,
 * and the readout is XP in this level against the XP the level needs. A recap
 * that shows "14" and nothing else is showing a different product's level.
 */
.rp-level { display: flex; flex-direction: column; gap: 4.4cqw; }
.rp-level-head { display: flex; align-items: center; gap: 4cqw; min-width: 0; }
.rp-level-badge {
  width: 22cqw;
  height: 22cqw;
  flex-shrink: 0;
  border-radius: 4.6cqw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${GLASS.fill};
  border: ${GLASS.border};
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -1px 0 rgb(255 255 255 / 0.12),
    0 2cqw 6cqw -2cqw rgb(0 0 0 / 0.65);
  color: #FFFFFF;
  font-size: 10cqw;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.rp-level-copy { display: flex; flex-direction: column; gap: 1cqw; flex: 1 1 auto; min-width: 0; }
.rp-level-title {
  font-size: 7.4cqw;
  overflow-wrap: anywhere;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.02;
  text-wrap: balance;
}
.rp-level-track {
  height: 3.2cqw;
  border-radius: 999px;
  /* The track colour from the Game Center HUD, not a generic grey. */
  background: #5A1E75;
  overflow: hidden;
}
.rp-level-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--rp-hue), ${PAPER});
}
.rp-level-readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 3cqw;
  font-family: ${MONO};
  font-size: 3cqw;
  letter-spacing: 0.08em;
  color: rgb(246 247 249 / 0.6);
  font-variant-numeric: tabular-nums;
}

/*
 * The contribution grid.
 *
 * Kept in the shape developers already know, because that familiarity is the
 * entire value: nobody has to be taught how to read it. Two modes share the
 * renderer — intensity, where a cell says how much, and reign, where a cell
 * says which topic took the day. The second one is the more interesting
 * object: a year of reading becomes a map of shifting eras, and the winner is
 * whoever owns the most of the picture. Nothing has to be labelled.
 */
.rp-matrix { display: flex; flex-direction: column; gap: 3cqw; }
.rp-matrix-grid { display: grid; gap: 0.8cqw; }
.rp-matrix-cell { aspect-ratio: 1; border-radius: 22%; }
.rp-matrix-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 2cqw 3.4cqw;
  font-family: ${MONO};
  font-size: 2.7cqw;
  letter-spacing: 0.06em;
  color: rgb(246 247 249 / 0.6);
}
.rp-matrix-key { display: flex; align-items: center; gap: 1.4cqw; }
.rp-matrix-swatch {
  width: 2.4cqw;
  height: 2.4cqw;
  border-radius: 30%;
  flex-shrink: 0;
}

/* ---- chips: a nameable wall ---- */

.rp-chips { display: flex; flex-wrap: wrap; gap: 2.4cqw; align-items: center; }
.rp-name-chip {
  padding: 2.6cqw 4cqw;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.05);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
  font-size: 4cqw;
  font-weight: 600;
  white-space: nowrap;
}
.rp-chips-more {
  font-size: 4cqw;
  font-weight: 800;
  color: var(--rp-hue);
  white-space: nowrap;
}

/* ---- quotes: real comment text, which is the whole hook ---- */

.rp-quotes { display: flex; flex-direction: column; gap: 3cqw; }
.rp-quote {
  display: flex;
  gap: 3.2cqw;
  padding: 4cqw;
  border-radius: 3.4cqw;
  background: rgb(255 255 255 / 0.05);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}
.rp-quote-body { display: flex; flex-direction: column; gap: 1.2cqw; flex: 1 1 auto; min-width: 0; }
.rp-quote-who { font-size: 4cqw; font-weight: 700; }
.rp-quote-text {
  font-size: 3.7cqw;
  line-height: 1.4;
  color: rgb(246 247 249 / 0.66);
  text-wrap: pretty;
}
.rp-quote-score {
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  flex-shrink: 0;
  font-size: 3.8cqw;
  font-weight: 800;
  color: ${'#FFE24C'};
  font-variant-numeric: tabular-nums;
}
.rp-quote-score svg { width: 4cqw; height: 4cqw; }

/* ---- opener: the establishing shot ---- */

.rp-opener-lead {
  font-size: 4.4cqw;
  font-weight: 700;
  color: rgb(246 247 249 / 0.66);
  line-height: 1.3;
  text-wrap: pretty;
}
/* The count is the information gap: it says how much is coming without
   saying what any of it is. */
.rp-opener-count {
  display: flex;
  align-items: center;
  gap: 2.4cqw;
  padding: 3cqw 4cqw;
  border-radius: 999px;
  align-self: flex-start;
  background: ${GLASS.fill};
  border: ${GLASS.border};
  color: #FFFFFF;
  font-weight: 800;
  font-size: 4.2cqw;
  letter-spacing: -0.01em;
}

/* ---- handoff: the turn forward ---- */

.rp-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2cqw;
  padding: 4.4cqw;
  border-radius: 3.4cqw;
  background: ${PAPER};
  color: ${INK};
  font-weight: 800;
  font-size: 4.2cqw;
  letter-spacing: -0.01em;
}

/* ---- streak artwork ---- */

/* Embers rising off the tier badge, lifted from the milestone-rewards
   celebration vocabulary. Seeded so every render lands identically, which
   keeps an exported still frame stable, and three passes rather than an
   infinite loop: a celebration is allowed to be rich, it is not allowed to
   keep moving after it has landed. */
@keyframes rpEmber {
  0% { opacity: 0; transform: scale(0.4) translateY(0); }
  30% { opacity: 1; transform: scale(1.1) translateY(-4cqw); }
  100% { opacity: 0; transform: scale(0.5) translateY(-11cqw); }
}
.rp-ember {
  position: absolute;
  border-radius: 50%;
  animation: rpEmber var(--rp-ember-duration) ease-out var(--rp-ember-delay) 3 both;
  opacity: 0;
}

.rp-flame-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.rp-flame { width: 34cqw; height: 34cqw; object-fit: contain; }
@media (prefers-reduced-motion: reduce) {
  .rp-ember { animation: none; opacity: 0.5; }
}

.rp-flame-count {
  font-size: 23cqw;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
`;

export const FrameStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: frameCss }} />
);

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

export interface FrameRow {
  label: string;
  value?: string;
  weight?: number;
  muted?: boolean;
  isYou?: boolean;
  person?: Person;
}

export interface FrameData {
  /** Overrides the candidate headline when the copy is user-specific. */
  headline?: string;
  note?: string;
  value?: string;
  unit?: string;
  /**
   * Where this puts them against everyone else. The single most requested
   * thing on any of these frames, and the reason someone learns something
   * about themselves rather than just reading their own numbers back.
   */
  standing?: { figure: string; label: string; scope: string; pin?: number };
  /** Rank in a group; the standing line is generated by describeStanding(). */
  standingFrom?: StandingInput;
  /** Supporting facts. Two or three, never more. */
  context?: { value: string; label: string }[];
  rows?: FrameRow[];
  percent?: number;
  shift?: { label: string; weight: number; direction: 'up' | 'down'; value?: string }[];
  days?: { label: string; state: 'on' | 'off' | 'miss' }[];
  badge?: {
    glyph?: string;
    /** Illustration shown as the subject of the badge. */
    art?: keyof typeof asset;
    /** Product artwork used as the plate texture behind the subject. */
    texture?: keyof typeof asset;
    /** The product's own icon for this reward. */
    icon?: FrameIcon;
    /**
     * Renders the real badge medal instead of a plate. `rarityPct` is the
     * share of people holding it, so lower is rarer, and it picks the tier.
     */
    medal?: { imageUrl: string; rarityPct: number };
    /** A badge about a person shows the person. */
    person?: Person;
    name: string;
    rarity?: string;
    gold?: boolean;
  };
  podium?: { rank: number; person: Person; isYou?: boolean; height: number; value?: string }[];
  split?: { figure: string; label: string }[];
  towers?: { label: string; lit: number; total: number }[];
  progress?: { current: number; target: number; label: string; reward?: string };
  tiles?: { figure: string; label: string }[];
  people?: Person[];
  peopleMore?: number;
  peopleNote?: string;
  /**
   * Streak frames render the real artwork rather than a number on its own.
   * `tier` picks the named badge off the ladder, which is the thing worth
   * bragging about; `lost` swaps in the broken-streak art.
   */
  flame?: { count: string; lost?: boolean; tier?: StreakTier; label?: string };
  /**
   * The grid. `cells` are indices into `palette`, which is what lets one
   * renderer do both modes: an intensity ramp, or one colour per contender.
   */
  matrix?: {
    cols: number;
    cells: number[];
    palette: string[];
    legend?: { label: string; colour: string }[];
  };
  /** Level frames: the badge number, and XP inside the level versus what it needs. */
  level?: { level: number; xpInLevel: number; xpToNextLevel: number; title?: string };
  /** Puts the daily.dev hero artwork behind the panel, with the scrim over it. */
  heroArt?: boolean;
  /** Charm, the daily.dev mascot, for the frames it genuinely belongs on. */
  charm?: keyof typeof charmArt;
  /** Opener: the line under the title, and how many moments are coming. */
  lead?: string;
  momentCount?: number;
  /**
   * A track list of posts. `read` marks the ones they already saw, which is
   * what turns a list of headlines into a list of things they still have to
   * look at.
   */
  posts?: {
    title: string;
    sourceId: string;
    meta?: string;
    read?: boolean;
  }[];
  /** Shown under a post list when read state is meaningful. */
  postsLegend?: boolean;
  /** Handoff: the button under the list. */
  cta?: string;
  /** Chips: nameable things, plus an overflow count. */
  chips?: string[];
  chipsMore?: string;
  /** Quotes: real comment text with who said it and how it scored. */
  quotes?: { who: string; text: string; score: string; person?: Person }[];
}

export interface FrameProps {
  candidate: Candidate;
  data?: FrameData;
  windowLabel?: string;
  person?: Person;
  className?: string;
  style?: React.CSSProperties;
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

/** The streak's own ramp: bacon pink through warm red, plus a little white. */
const EMBER_COLORS = [
  'rgba(236, 82, 122, 0.9)',
  'rgba(255, 116, 84, 0.85)',
  'rgba(248, 103, 137, 0.85)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(211, 68, 56, 0.75)',
];

const seeded = (seed: number): number => {
  const value = Math.sin(seed * 9301 + 49297) * 49297;
  return value - Math.floor(value);
};

const Embers = ({ count = 10 }: { count?: number }): ReactElement => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="rp-ember"
        style={
          {
            left: `${12 + seeded(index * 7) * 74}%`,
            top: `${14 + seeded(index * 13) * 58}%`,
            width: `${1 + seeded(index * 3) * 1.6}cqw`,
            height: `${1 + seeded(index * 3) * 1.6}cqw`,
            background: EMBER_COLORS[index % EMBER_COLORS.length],
            '--rp-ember-delay': `${seeded(index * 5) * 1400}ms`,
            '--rp-ember-duration': `${1.4 + seeded(index * 11) * 1.4}s`,
          } as React.CSSProperties
        }
      />
    ))}
  </>
);

const Ring = ({ percent }: { percent: number }): ReactElement => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg className="rp-ring-svg" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--rp-hue)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
        transform="rotate(-90 50 50)"
      />
      <text
        className="rp-ring-pct"
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {percent}%
      </text>
    </svg>
  );
};

const Standing = ({
  standing,
}: {
  standing: NonNullable<FrameData['standing']>;
}): ReactElement => (
  <div className="rp-standing">
    <span className="rp-standing-figure">{standing.figure}</span>
    <span className="rp-standing-copy">
      <span className="rp-standing-label">{standing.label}</span>
      <span className="rp-standing-scope">{standing.scope}</span>
      {standing.pin !== undefined && (
        <span className="rp-standing-bar">
          <span className="rp-standing-pin" style={{ left: `${standing.pin}%` }} />
        </span>
      )}
    </span>
  </div>
);

const Context = ({
  items,
}: {
  items: NonNullable<FrameData['context']>;
}): ReactElement => (
  <div className="rp-context">
    {items.slice(0, 2).map((item) => (
      <span key={item.label} className="rp-chip">
        <span className="rp-chip-value">{item.value}</span>
        <span className="rp-chip-label">{item.label}</span>
      </span>
    ))}
  </div>
);

const People = ({
  people,
  more,
  note,
}: {
  people: Person[];
  more?: number;
  note?: string;
}): ReactElement => (
  <div className="rp-people">
    <AvatarStack people={people} size={40} more={more} />
    {note && <span className="rp-people-note">{note}</span>}
  </div>
);

/**
 * The track-list row: artwork, title, source, state.
 *
 * Modelled on how Apple Music and Spotify render a list of tracks, because the
 * problem is identical — a run of items that have to be scannable, tappable and
 * distinguishable at a glance. The source logo is the artwork, the source name
 * and read time are the artist line, and the trailing marker says whether this
 * is something they already saw or something still waiting for them.
 */
const PostList = ({
  posts,
  legend,
}: {
  posts: NonNullable<FrameData['posts']>;
  legend?: boolean;
}): ReactElement => (
  <div className="rp-posts">
    {posts.map((post) => {
      const source = sourceBy(post.sourceId);
      const logo = sourceLogo(source);

      return (
        <span
          key={post.title}
          className={`rp-post${post.read ? ' is-read' : ''}`}
        >
          <span
            className="rp-post-art"
            style={{
              background: `linear-gradient(150deg, ${source.tint}, ${source.tint}55)`,
            }}
          >
            {monogramOf(source.name)}
            {logo && <img src={logo} alt="" />}
          </span>
          <span className="rp-post-body">
            <span className="rp-post-title">{post.title}</span>
            <span className="rp-post-meta">
              {source.name}
              {post.meta ? ` · ${post.meta}` : ''}
            </span>
          </span>
          {/* A plus said "add this to something". An arrow says "this opens
              the post", which is the only thing a row here can do. */}
          <span className={`rp-post-state ${post.read ? 'is-read' : 'is-new'}`}>
            {post.read ? <VIcon /> : <ArrowIcon className="rp-arrow" />}
          </span>
        </span>
      );
    })}
    {legend && (
      <span className="rp-posts-legend">
        <span className="rp-legend-key">
          <span
            className="rp-legend-dot"
            style={{ background: 'rgb(255 255 255 / 0.28)' }}
          />
          You read this
        </span>
        <span className="rp-legend-key">
          <span
            className="rp-legend-dot"
            style={{ background: 'var(--rp-hue)' }}
          />
          Open and read
        </span>
      </span>
    )}
  </div>
);

const Rows = ({ rows }: { rows: FrameRow[] }): ReactElement => (
  <div className="rp-rows">
    {rows.map((row, index) => (
      <div
        key={row.label}
        className={['rp-row', row.muted ? 'is-muted' : '', row.isYou ? 'is-you' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {row.person ? (
          <Avatar person={row.person} size={26} />
        ) : (
          <span className="rp-row-rank">{index + 1}</span>
        )}
        <span className="rp-row-label">{row.label}</span>
        {row.weight !== undefined && (
          <span className="rp-track">
            <span
              className={`rp-fill${row.muted ? ' is-down' : ''}`}
              style={{ width: `${Math.round(row.weight * 100)}%` }}
            />
          </span>
        )}
        {row.value && <span className="rp-row-value">{row.value}</span>}
      </div>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Layouts                                                                     */
/* -------------------------------------------------------------------------- */

const heroFor = (
  layout: FrameLayout,
  headline: string,
  data: FrameData,
): ReactNode => {
  switch (layout) {
    case FrameLayout.BigNumber:
      return (
        <>
          {data.flame ? (
            <div className="rp-flame-wrap">
              {!data.flame.lost && <Embers />}
              <img
                className="rp-flame"
                src={
                  data.flame.lost
                    ? asset.streakLost
                    : data.flame.tier
                    ? streakTierArt(data.flame.tier)
                    : asset.streakFire
                }
                alt=""
              />
              <span className="rp-flame-count">{data.flame.count}</span>
            </div>
          ) : (
            <div
              className={[
                'rp-huge',
                (data.value ?? '').length >= 6 ? 'is-xlong' : '',
                (data.value ?? '').length === 5 ? 'is-long' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {data.value ?? '—'}
            </div>
          )}
          {data.unit && <div className="rp-unit">{data.unit}</div>}
        </>
      );

    case FrameLayout.Shift:
      return (
        <>
          <div className="rp-statement">{headline}</div>
          <div className="rp-rows">
            {(data.shift ?? []).map((row) => (
              <div key={row.label} className="rp-row">
                <span className="rp-row-label">{row.label}</span>
                <span className="rp-track">
                  <span
                    className={`rp-fill${row.direction === 'down' ? ' is-down' : ''}`}
                    style={{ width: `${Math.round(row.weight * 100)}%` }}
                  />
                </span>
                {row.value && <span className="rp-row-value">{row.value}</span>}
              </div>
            ))}
          </div>
        </>
      );

    case FrameLayout.Share:
      return (
        <div className="rp-ring">
          <Ring percent={data.percent ?? 0} />
          <span style={{ flex: '1 1 auto', minWidth: 0 }}>
            <span className="rp-statement is-small">{headline}</span>
          </span>
        </div>
      );

    case FrameLayout.Ranked:
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          {data.posts ? (
            <PostList posts={data.posts} legend={data.postsLegend} />
          ) : (
            <Rows rows={data.rows ?? []} />
          )}
        </>
      );

    case FrameLayout.Week:
      return (
        <>
          {data.flame && (
            <span className="rp-week-flame">
              <img
                src={
                  data.flame.lost
                    ? asset.streakLost
                    : data.flame.tier
                    ? streakTierArt(data.flame.tier)
                    : asset.streakFire
                }
                alt=""
              />
              {data.flame.label && (
                <span className="rp-week-tier">{data.flame.label}</span>
              )}
            </span>
          )}
          <div className="rp-statement">{headline}</div>
          <div className="rp-week">
            {(data.days ?? []).map((day, index) => (
              <span
                // Day labels repeat across a longer catch-up window.
                // eslint-disable-next-line react/no-array-index-key
                key={`${day.label}-${index}`}
                className="rp-day"
              >
                <span
                  className={`rp-day-cell${
                    day.state === 'on'
                      ? ' is-on'
                      : day.state === 'miss'
                      ? ' is-miss'
                      : ''
                  }`}
                >
                  {day.state === 'on' && (
                    <span className="rp-day-flame">
                      <HotIcon secondary />
                    </span>
                  )}
                </span>
                <span className="rp-day-label">{day.label}</span>
              </span>
            ))}
          </div>
        </>
      );

    case FrameLayout.Badge: {
      const tier = data.badge?.medal
        ? rarityTierFor(data.badge.medal.rarityPct)
        : null;

      if (data.badge?.medal && tier) {
        return (
          <div className="rp-badge">
            <span className="rp-medal-wrap">
              <BadgeMedal
                imageUrl={data.badge.medal.imageUrl}
                tier={tier}
                size={182}
              />
              <RaritySparkles tier={tier as unknown as AchievementRarityTier} />
            </span>
            <span className="rp-statement is-small">
              {data.badge.name ?? headline}
            </span>
            {data.badge.rarity && (
              // The coloured chip is reserved for the sub-1% band. Tomer's
              // Game Center redesign makes this rule explicit and it is right:
              // if every tier gets its own colour, gold stops meaning anything.
              // Everything below the rarest band takes a plain dark chip.
              <span
                className={`rp-rarity${
                  tier === RarityTier.Emerald ? '' : ' is-plain'
                }`}
                style={
                  tier === RarityTier.Emerald
                    ? { color: `rgb(${rarityRgb[tier]})` }
                    : undefined
                }
              >
                {data.badge.rarity}
              </span>
            )}
          </div>
        );
      }

      return (
        <div className="rp-badge">
          <span
            className="rp-plate"
            style={{
              background: data.badge?.gold
                ? GOLD_GRADIENT
                : 'linear-gradient(135deg, var(--rp-hue), rgb(255 255 255 / 0.08))',
            }}
          >
            <span className="rp-plate-inner">
              {data.badge?.texture && (
                <img
                  className="rp-plate-texture"
                  src={asset[data.badge.texture]}
                  alt=""
                />
              )}
              {data.badge?.icon ? (
                (() => {
                  const Glyph = ICONS[data.badge.icon];
                  return (
                    <span className="rp-icon rp-icon-plate">
                      <Glyph />
                    </span>
                  );
                })()
              ) : data.badge?.person ? (
                <Avatar
                  person={data.badge.person}
                  size={104}
                  ring="rgba(255,255,255,0.22)"
                />
              ) : data.badge?.art ? (
                <img className="rp-plate-art" src={asset[data.badge.art]} alt="" />
              ) : (
                <span className="rp-plate-glyph">{data.badge?.glyph ?? '★'}</span>
              )}
            </span>
          </span>
          <span className="rp-statement is-small">{data.badge?.name ?? headline}</span>
          {data.badge?.rarity && <span className="rp-rarity">{data.badge.rarity}</span>}
        </div>
      );
    }

    case FrameLayout.Podium:
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          <div className="rp-podium">
            {(data.podium ?? []).map((step) => (
              <span key={step.person.login} className={`rp-step${step.isYou ? ' is-you' : ''}`}>
                <Avatar
                  person={step.person}
                  size={step.isYou ? 74 : 52}
                  ring={step.isYou ? 'var(--rp-hue)' : 'rgba(255,255,255,0.12)'}
                  dim={step.isYou ? 1 : 0.8}
                />
                <span className="rp-step-name">{step.isYou ? 'you' : step.person.name}</span>
                <span className="rp-step-block" style={{ height: `${step.height}px` }}>
                  {step.value ?? step.rank}
                </span>
              </span>
            ))}
          </div>
        </>
      );

    case FrameLayout.Skyline:
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          <div className="rp-skyline">
            {(data.towers ?? []).map((tower) => (
              <span key={tower.label} className="rp-tower">
                <span className="rp-tower-stack">
                  {Array.from({ length: tower.total }, (_, index) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className={`rp-window${index < tower.lit ? '' : ' is-dim'}`}
                    />
                  ))}
                </span>
                <span className="rp-tower-label">{tower.label}</span>
              </span>
            ))}
          </div>
        </>
      );

    case FrameLayout.Split:
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          <div className="rp-split">
            {(data.split ?? []).map((part, index) => (
              <span
                key={part.label}
                className={`rp-split-part ${index === 0 ? 'is-lead' : 'is-trail'}`}
              >
                <span
                  className={[
                    'rp-split-figure',
                    part.figure.length >= 6 ? 'is-xlong' : '',
                    part.figure.length === 5 ? 'is-long' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {part.figure}
                </span>
                <span className="rp-split-label">{part.label}</span>
              </span>
            ))}
          </div>
        </>
      );

    case FrameLayout.Progress: {
      const { current = 0, target = 1, label = '', reward } = data.progress ?? {};
      return (
        <>
          <div className="rp-statement">{headline}</div>
          <div className="rp-progress">
            <span className="rp-progress-head">
              <span>{label}</span>
              <span>
                {current} / {target}
              </span>
            </span>
            <span className="rp-progress-track">
              <span
                className="rp-progress-fill"
                style={{ width: `${Math.min(100, Math.round((current / target) * 100))}%` }}
              />
            </span>
            {reward && (
              <span className="rp-reward">
                <span aria-hidden>◆</span>
                {reward}
              </span>
            )}
          </div>
        </>
      );
    }

    case FrameLayout.Opener:
      return (
        <>
          <div className="rp-statement">{headline}</div>
          {data.tiles && (
            <div className="rp-tiles">
              {data.tiles.map((tile) => (
                <span key={tile.label} className="rp-tile">
                  <span className="rp-tile-figure">{tile.figure}</span>
                  <span className="rp-tile-label">{tile.label}</span>
                </span>
              ))}
            </div>
          )}
          {data.lead && <div className="rp-opener-lead">{data.lead}</div>}
          {data.momentCount !== undefined && (
            <span className="rp-opener-count">
              {data.momentCount} moments &nbsp;&rarr;
            </span>
          )}
        </>
      );

    case FrameLayout.Handoff:
      return (
        <>
          <div className="rp-statement">{headline}</div>
          {data.note && <div className="rp-note">{data.note}</div>}
          {data.posts && (
            <PostList posts={data.posts} legend={data.postsLegend} />
          )}
          {data.cta && <span className="rp-cta">{data.cta}</span>}
        </>
      );

    case FrameLayout.Level: {
      const { level = 1, xpInLevel = 0, xpToNextLevel = 1, title } =
        data.level ?? {};
      const total = xpInLevel + xpToNextLevel;
      const pct = total ? Math.min(100, (xpInLevel / total) * 100) : 0;

      return (
        <div className="rp-level">
          <div className="rp-level-head">
            <span className="rp-level-badge">{level}</span>
            <span className="rp-level-copy">
              <span className="rp-level-title">{title ?? headline}</span>
            </span>
          </div>
          <span className="rp-level-track">
            <span className="rp-level-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="rp-level-readout">
            <span>{xpInLevel.toLocaleString()} XP in level</span>
            <span>{xpToNextLevel.toLocaleString()} to go</span>
          </span>
        </div>
      );
    }

    case FrameLayout.Matrix: {
      const { cols = 7, cells = [], palette = [], legend } = data.matrix ?? {};
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          <div className="rp-matrix">
            <div
              className="rp-matrix-grid"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {cells.map((value, index) => (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="rp-matrix-cell"
                  style={{ background: palette[value] ?? palette[0] }}
                />
              ))}
            </div>
            {legend && (
              <div className="rp-matrix-legend">
                {legend.map((key) => (
                  <span key={key.label} className="rp-matrix-key">
                    <span
                      className="rp-matrix-swatch"
                      style={{ background: key.colour }}
                    />
                    {key.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    case FrameLayout.Chips:
      return (
        <>
          <div className="rp-statement">{headline}</div>
          <div className="rp-chips">
            {(data.chips ?? []).map((chip) => (
              <span key={chip} className="rp-name-chip">
                {chip}
              </span>
            ))}
            {data.chipsMore && (
              <span className="rp-chips-more">{data.chipsMore}</span>
            )}
          </div>
        </>
      );

    case FrameLayout.Quotes:
      return (
        <>
          <div className="rp-statement is-small">{headline}</div>
          <div className="rp-quotes">
            {(data.quotes ?? []).map((quote) => (
              <span key={quote.who} className="rp-quote">
                {quote.person && <Avatar person={quote.person} size={40} />}
                <span className="rp-quote-body">
                  <span className="rp-quote-who">{quote.who}</span>
                  <span className="rp-quote-text">{quote.text}</span>
                </span>
                <span className="rp-quote-score">
                  <UpvoteIcon />
                  {quote.score}
                </span>
              </span>
            ))}
          </div>
        </>
      );

    case FrameLayout.Statement:
    default:
      return <div className="rp-statement">{headline}</div>;
  }
};

/** Layouts that are celebrating something, and so earn the aurora. */
const CELEBRATORY = new Set([
  FrameLayout.Badge,
  FrameLayout.Podium,
  FrameLayout.Opener,
]);

export const Frame = ({
  candidate,
  data = {},
  windowLabel = 'W37',
  person = ME,
  className,
  style,
}: FrameProps): ReactElement => {
  const generated = data.standingFrom ? describeStanding(data.standingFrom) : undefined;
  const standing =
    generated && generated.form !== StandingForm.None ? generated : data.standing;
  return (
  <div
    className={['rp-frame', className].filter(Boolean).join(' ')}
    style={
      {
        '--rp-hue': candidate.hue,
        '--rp-hero-art': `url("${asset.heroArt}")`,
        ...style,
      } as React.CSSProperties
    }
  >
    <div
      className={[
        'rp-panel',
        data.heroArt ? 'is-hero' : '',
        data.charm ? 'has-charm' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="rp-topglow" aria-hidden />
      <span className="rp-grain" aria-hidden />
      {(CELEBRATORY.has(candidate.layout) ||
        candidate.category === Category.Crown) && (
        <>
          <span className="rp-orb rp-orb--a" aria-hidden />
          <span className="rp-orb rp-orb--b" aria-hidden />
        </>
      )}

    <div className="rp-labelrow">
      <span className="rp-foot-who">
        <Avatar person={person} size={30} ring="rgba(255,255,255,0.16)" />
        <span className="rp-foot-handle">
          {person.handle} · {windowLabel}
        </span>
      </span>
      <span className="rp-mark">
        <span className="rp-logo">
          <LogoIcon />
        </span>
        <span className="rp-wordmark">
          <LogoText />
        </span>
      </span>
    </div>

    <div className="rp-hero">
      {heroFor(candidate.layout, data.headline ?? candidate.headline, data)}
      {data.note && candidate.layout !== FrameLayout.Handoff && (
        <div className="rp-note">{data.note}</div>
      )}
      {data.people && (
        <People people={data.people} more={data.peopleMore} note={data.peopleNote} />
      )}
    </div>

    {data.context && <Context items={data.context} />}
    {standing && <Standing standing={standing} />}

    {data.charm && (
      <div className="rp-charmrow">
        <img className="rp-charm" src={charmArt[data.charm]} alt="" />
      </div>
    )}
    </div>
  </div>
);
};

/**
 * The one width every frame is authored at. Export is this times three, so
 * 1080x1920. Previews scale the whole canvas rather than reflowing it, which is
 * the only way a thumbnail is honest about what gets posted.
 */
export const DESIGN_WIDTH = 420;
export const DESIGN_HEIGHT = (DESIGN_WIDTH * 16) / 9;

/** A frame at any size, rendered at the design width and scaled down to fit. */
export type FrameAspect = '9:16' | '4:5';

const aspectRatio: Record<FrameAspect, number> = { '9:16': 16 / 9, '4:5': 5 / 4 };

export const FrameThumb = ({
  width = 260,
  aspect = '9:16',
  ...frameProps
}: FrameProps & { width?: number; aspect?: FrameAspect }): ReactElement => (
  <div
    style={{
      width,
      height: width * aspectRatio[aspect],
      position: 'relative',
      overflow: 'hidden',
      borderRadius: (17 / DESIGN_WIDTH) * width,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: DESIGN_WIDTH,
        height: DESIGN_WIDTH * aspectRatio[aspect],
        transform: `scale(${width / DESIGN_WIDTH})`,
        transformOrigin: 'top left',
        position: 'absolute',
        inset: 0,
      }}
    >
      <Frame
        {...frameProps}
        className={[frameProps.className, aspect === '4:5' ? 'is-4-5' : '']
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  </div>
);


/**
 * What the buttons under a card say, by shareability tier (spec v3 §3, §4).
 *
 * Copy link is 75–87% of all daily.dev sharing and the social buttons combined
 * are ~11%, so "Copy image" leads and X and LinkedIn follow. 1:1 beats
 * broadcast for a first-time sharer and share-to-squad already exists, so it
 * sits second. Tier B cards earn their slot on engagement, not distribution:
 * they get a single "read this" action and no share buttons at all.
 */
export const actionsFor = (
  candidate: Candidate,
): { primary: string; rest: string[]; shares: boolean } =>
  candidate.shareability === Shareability.B
    ? { primary: 'Next →', rest: [], shares: false }
    : {
        primary: 'Copy image',
        rest: ['Send to squad', 'Copy link', 'X'],
        shares: true,
      };
