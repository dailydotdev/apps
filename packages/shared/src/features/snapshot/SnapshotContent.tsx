import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import colors from '../../styles/colors';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/**
 * The production "Happening Now" wordmark animates across
 * blueCheese -> cheese -> avocado. A still frame has to pick a position, and
 * the yellow-to-green end is the one the brand shots use.
 */
/** Fire, for a take that ran hot: yellow core through orange into red. */
export const HOT_TAKE_EYEBROW_GRADIENT = `linear-gradient(100deg, ${colors.cheese['40']} 0%, ${colors.ketchup['10']} 48%, ${colors.ketchup['50']} 100%)`;

export const HIGHLIGHTS_EYEBROW_GRADIENT = `linear-gradient(120deg, ${colors.cheese['40']} 0%, ${colors.avocado['10']} 52%, ${colors.avocado['40']} 100%)`;

export interface SnapshotAvatar {
  src?: string;
  name: string;
  handle?: string;
}

export interface SnapshotStat {
  value: string;
  label: string;
}

export interface SnapshotContentProps {
  eyebrow?: string;
  eyebrowGradient?: string;
  avatar?: SnapshotAvatar;
  emoji?: string;
  title: string;
  /** 0 lets the title run in full, for frames that grow to fit. */
  titleLines?: number;
  meta?: string[];
  body?: string;
  /** 0 lets the body run in full, for frames that grow to fit. */
  bodyLines?: number;
  stat?: SnapshotStat;
  /**
   * 'display' sets the number apart at headline scale; 'inline' keeps it level
   * with its label, so the pair reads as one sentence.
   */
  statVariant?: 'display' | 'inline';
  /** Centres the copy and its stat, for a card that is one short statement. */
  centered?: boolean;
}

// 0 means no clamp: a growing frame carries the copy instead of cutting it.
const clamp = (lines: number) =>
  lines
    ? {
        display: '-webkit-box' as const,
        WebkitBoxOrient: 'vertical' as const,
        WebkitLineClamp: lines,
        overflow: 'hidden' as const,
      }
    : {};

export function SnapshotContent({
  eyebrow,
  eyebrowGradient,
  avatar,
  emoji,
  title,
  titleLines = 4,
  meta,
  body,
  bodyLines = 7,
  stat,
  statVariant = 'display',
  centered,
}: SnapshotContentProps): ReactElement {
  const isInlineStat = statVariant === 'inline';
  const statColor = eyebrowGradient
    ? {
        color: 'transparent',
        backgroundImage: eyebrowGradient,
        backgroundClip: 'text' as const,
        WebkitBackgroundClip: 'text' as const,
      }
    : { color: colors.cabbage['10'] };
  return (
    <>
      {eyebrow && (
        <span
          className="font-bold uppercase"
          style={{
            fontSize: 22,
            letterSpacing: 2,
            ...(eyebrowGradient
              ? {
                  color: 'transparent',
                  backgroundImage: eyebrowGradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                }
              : { color: colors.cabbage['10'] }),
          }}
        >
          {eyebrow}
        </span>
      )}

      {emoji && (
        <span
          className="flex items-center justify-center rounded-24"
          style={{
            width: 112,
            height: 112,
            fontSize: 60,
            background: 'rgba(177, 75, 215, 0.16)',
          }}
        >
          {emoji}
        </span>
      )}

      {avatar && (
        <div className="flex items-center gap-4">
          {avatar.src && (
            <img
              src={avatar.src}
              alt=""
              crossOrigin="anonymous"
              className="size-16 rounded-16 object-cover"
            />
          )}
          <div className="flex flex-col">
            <span
              className="font-bold text-white"
              style={{ fontSize: 30, lineHeight: 1.2 }}
            >
              {avatar.name}
            </span>
            {avatar.handle && (
              <span style={{ color: MUTED, fontSize: 24, lineHeight: 1.3 }}>
                {avatar.handle}
              </span>
            )}
          </div>
        </div>
      )}

      <h1
        className={classNames(
          'snapshot-copy font-bold text-white',
          centered && 'text-center',
        )}
        style={{ fontSize: 56, lineHeight: 1.15, ...clamp(titleLines) }}
      >
        {title}
      </h1>

      {meta && meta.length > 0 && (
        <span style={{ color: MUTED, fontSize: 26, lineHeight: 1.3 }}>
          {meta.join(' · ')}
        </span>
      )}

      {body && (
        <>
          <span style={{ height: 1, background: DIVIDER }} />
          <p
            style={{
              color: MUTED,
              fontSize: 28,
              lineHeight: 1.55,
              ...clamp(bodyLines),
            }}
          >
            {body}
          </p>
        </>
      )}

      {stat && (
        <div
          className={classNames(
            'mt-auto flex items-baseline gap-2',
            centered && 'justify-center',
          )}
        >
          <span
            className="font-bold"
            style={{ ...statColor, fontSize: isInlineStat ? 28 : 64 }}
          >
            {stat.value}
          </span>
          <span style={{ color: MUTED, fontSize: 28 }}>{stat.label}</span>
        </div>
      )}
    </>
  );
}
