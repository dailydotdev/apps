import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useDiscoverHotTakes } from '../../../hooks/useDiscoverHotTakes';
import { useVoteHotTake } from '../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { HotIcon } from '../../icons/Hot';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { PlusUserBadge } from '../../PlusUserBadge';
import type { HotTake } from '../../../graphql/user/userHotTake';

const SWIPE_THRESHOLD = 80;
const DISMISS_ANIMATION_MS = 340;
const BUTTON_DISMISS_ANIMATION_MS = 620;
const DISMISS_FLY_DISTANCE = 760;
const BUTTON_DISMISS_FLY_DISTANCE = 620;
const BUTTON_FLY_KICK_DELAY_MS = 42;
const SKIP_DISMISS_ANIMATION_MS = 520;
const SKIP_DISMISS_FLY_DISTANCE = 600;
const SKIP_DRAG_ELASTICITY_FACTOR = 0.3;

const getElasticDelta = (delta: number): number => {
  const absoluteDelta = Math.abs(delta);
  if (absoluteDelta <= SWIPE_THRESHOLD) {
    return delta;
  }

  const overshoot = absoluteDelta - SWIPE_THRESHOLD;
  return (
    Math.sign(delta) *
    (SWIPE_THRESHOLD + overshoot * SKIP_DRAG_ELASTICITY_FACTOR)
  );
};

const EFFECT_KEYFRAMES = `
  @keyframes hotTakeFlame {
    0% { transform: translateX(-50%) translateY(1px) scaleY(0.92) scaleX(1.08); opacity: 0.72; }
    35% { transform: translateX(-50%) translateY(-3px) scaleY(1.22) scaleX(0.82); opacity: 0.95; }
    70% { transform: translateX(-50%) translateY(-1px) scaleY(0.84) scaleX(1.18); opacity: 0.82; }
    100% { transform: translateX(-50%) translateY(0) scaleY(1.04) scaleX(0.96); opacity: 0.88; }
  }
  @keyframes hotTakeIcicleShimmer {
    0%, 100% { opacity: 0.72; filter: brightness(0.95); transform: translateY(0); }
    50% { opacity: 1; filter: brightness(1.2); transform: translateY(1px); }
  }
  @keyframes hotTakeEmber {
    0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0; }
    12% { opacity: 1; }
    55% { transform: translateY(-44px) translateX(7px) scale(0.82) rotate(18deg); opacity: 0.85; }
    100% { transform: translateY(-90px) translateX(-7px) scale(0.28) rotate(-12deg); opacity: 0; }
  }
  @keyframes hotTakeSnowfall {
    0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
    12% { opacity: 1; }
    50% { transform: translateY(30px) translateX(8px) scale(1); opacity: 0.92; }
    100% { transform: translateY(66px) translateX(-5px) scale(0.72); opacity: 0; }
  }
  @keyframes hotTakeHeatShimmer {
    0%, 100% { transform: scale(1) translateY(0); opacity: 0.65; }
    50% { transform: scale(1.04) translateY(-4px); opacity: 0.95; }
  }
  @keyframes hotTakeFrostBreath {
    0%, 100% { opacity: 0.5; transform: translateY(0); }
    50% { opacity: 0.9; transform: translateY(2px); }
  }
  @keyframes hotTakeBadgePulse {
    0% { transform: translateX(-50%) scale(0.92); opacity: 0; }
    100% { transform: translateX(-50%) scale(1); opacity: 1; }
  }
`;

const FLAMES: ReadonlyArray<{ left: string; size: number; delay: number }> = [
  { left: '5%', size: 30, delay: 0 },
  { left: '14%', size: 42, delay: 0.12 },
  { left: '23%', size: 26, delay: 0.28 },
  { left: '32%', size: 46, delay: 0.05 },
  { left: '41%', size: 34, delay: 0.2 },
  { left: '50%', size: 50, delay: 0.08 },
  { left: '59%', size: 38, delay: 0.22 },
  { left: '68%', size: 44, delay: 0.15 },
  { left: '77%', size: 28, delay: 0.3 },
  { left: '86%', size: 48, delay: 0.1 },
  { left: '95%', size: 32, delay: 0.18 },
];

const EMBERS: ReadonlyArray<{
  left: string;
  bottom: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '10%', bottom: '8%', size: 4, delay: 0, duration: 2.4 },
  { left: '20%', bottom: '15%', size: 3, delay: 0.6, duration: 2.8 },
  { left: '30%', bottom: '5%', size: 5, delay: 0.2, duration: 2.2 },
  { left: '40%', bottom: '20%', size: 3, delay: 1.0, duration: 2.6 },
  { left: '50%', bottom: '10%', size: 4, delay: 0.4, duration: 3.0 },
  { left: '60%', bottom: '18%', size: 5, delay: 0.8, duration: 2.5 },
  { left: '70%', bottom: '6%', size: 3, delay: 0.15, duration: 2.7 },
  { left: '80%', bottom: '12%', size: 4, delay: 0.5, duration: 2.3 },
  { left: '90%', bottom: '8%', size: 3, delay: 0.9, duration: 2.9 },
  { left: '15%', bottom: '25%', size: 3, delay: 1.3, duration: 2.1 },
  { left: '35%', bottom: '30%', size: 4, delay: 0.35, duration: 2.6 },
  { left: '55%', bottom: '28%', size: 3, delay: 0.7, duration: 2.4 },
  { left: '75%', bottom: '22%', size: 5, delay: 0.25, duration: 2.8 },
  { left: '45%', bottom: '35%', size: 3, delay: 1.1, duration: 2.2 },
  { left: '85%', bottom: '18%', size: 4, delay: 0.55, duration: 2.5 },
  { left: '25%', bottom: '32%', size: 3, delay: 0.45, duration: 3.0 },
];

const ICICLE_SHAPES = [
  // bumpy left side, off-center tip
  'polygon(5% 0%, 95% 0%, 88% 8%, 80% 20%, 84% 32%, 76% 48%, 68% 62%, 58% 78%, 52% 92%, 48% 100%, 44% 88%, 36% 70%, 26% 52%, 20% 38%, 16% 24%, 12% 12%)',
  // right-leaning asymmetric
  'polygon(10% 0%, 90% 0%, 86% 12%, 80% 28%, 76% 42%, 72% 58%, 64% 72%, 56% 86%, 52% 100%, 44% 80%, 38% 62%, 28% 44%, 22% 28%, 16% 14%)',
  // wide with ridge in middle
  'polygon(2% 0%, 98% 0%, 90% 6%, 84% 18%, 88% 30%, 78% 46%, 70% 60%, 62% 74%, 54% 88%, 50% 100%, 42% 82%, 34% 64%, 24% 48%, 18% 32%, 14% 18%, 8% 6%)',
  // narrow and crooked
  'polygon(15% 0%, 85% 0%, 78% 14%, 74% 30%, 68% 48%, 64% 62%, 58% 76%, 54% 90%, 52% 100%, 44% 84%, 38% 66%, 30% 50%, 24% 34%, 20% 18%)',
  // fat with bulge then taper
  'polygon(8% 0%, 92% 0%, 86% 10%, 82% 24%, 78% 38%, 82% 50%, 74% 64%, 64% 78%, 54% 90%, 48% 100%, 40% 84%, 30% 66%, 22% 50%, 18% 36%, 14% 22%, 10% 10%)',
];

const ICICLES: ReadonlyArray<{
  left: string;
  height: number;
  width: number;
  delay: number;
  shape: number;
  rotate: number;
}> = [
  { left: '5%', height: 30, width: 10, delay: 0, shape: 0, rotate: 4 },
  { left: '13%', height: 50, width: 13, delay: 0.4, shape: 2, rotate: -2 },
  { left: '22%', height: 22, width: 8, delay: 0.9, shape: 3, rotate: 3 },
  { left: '31%', height: 58, width: 15, delay: 0.2, shape: 4, rotate: -1 },
  { left: '40%', height: 35, width: 10, delay: 0.7, shape: 1, rotate: 2 },
  { left: '50%', height: 65, width: 15, delay: 0.1, shape: 0, rotate: -3 },
  { left: '59%', height: 42, width: 12, delay: 0.5, shape: 3, rotate: 1 },
  { left: '68%', height: 55, width: 14, delay: 0.8, shape: 2, rotate: -4 },
  { left: '77%', height: 28, width: 9, delay: 0.3, shape: 1, rotate: 3 },
  { left: '86%', height: 48, width: 13, delay: 0.6, shape: 4, rotate: -2 },
  { left: '95%', height: 35, width: 11, delay: 0.15, shape: 0, rotate: 2 },
];

const SNOWFLAKES: ReadonlyArray<{
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '8%', top: '12%', size: 4, delay: 0, duration: 3 },
  { left: '18%', top: '30%', size: 6, delay: 0.5, duration: 3.5 },
  { left: '28%', top: '6%', size: 3, delay: 1.2, duration: 2.8 },
  { left: '38%', top: '45%', size: 5, delay: 0.3, duration: 3.2 },
  { left: '48%', top: '18%', size: 7, delay: 0.8, duration: 3.8 },
  { left: '58%', top: '52%', size: 4, delay: 0.1, duration: 3 },
  { left: '68%', top: '22%', size: 6, delay: 0.6, duration: 3.4 },
  { left: '78%', top: '38%', size: 3, delay: 1.0, duration: 2.6 },
  { left: '88%', top: '8%', size: 5, delay: 0.4, duration: 3.6 },
  { left: '93%', top: '48%', size: 4, delay: 0.7, duration: 3.1 },
  { left: '12%', top: '62%', size: 3, delay: 1.5, duration: 2.9 },
  { left: '42%', top: '72%', size: 5, delay: 0.2, duration: 3.3 },
  { left: '62%', top: '58%', size: 4, delay: 0.9, duration: 3.7 },
  { left: '82%', top: '68%', size: 6, delay: 0.35, duration: 2.7 },
  { left: '22%', top: '78%', size: 3, delay: 1.1, duration: 3.5 },
  { left: '52%', top: '35%', size: 5, delay: 0.65, duration: 3.1 },
];

const HotTakeCard = ({
  hotTake,
  isTop,
  offset,
  swipeDelta,
  skipDeltaY = 0,
  isDismissAnimating,
  isDragging,
  dismissDurationMs,
}: {
  hotTake: HotTake;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
  skipDeltaY?: number;
  isDismissAnimating: boolean;
  isDragging: boolean;
  dismissDurationMs: number;
}): ReactElement => {
  const isSkipAnimating = isTop && isDismissAnimating && skipDeltaY !== 0;
  const rotation = isTop ? Math.max(Math.min(swipeDelta * 0.08, 18), -18) : 0;
  const translateX = isTop ? swipeDelta : 0;
  const stackScale = isTop ? 1 : 1 - offset * 0.05;
  const translateY = isTop ? 0 : offset * 8;
  const getDismissProgress = (): number => {
    if (!isTop || !isDismissAnimating) {
      return 0;
    }
    if (isSkipAnimating) {
      return Math.min(Math.abs(skipDeltaY) / SKIP_DISMISS_FLY_DISTANCE, 1);
    }
    return Math.min(Math.abs(swipeDelta) / DISMISS_FLY_DISTANCE, 1);
  };
  const dismissProgress = getDismissProgress();
  const scale = isTop ? 1 - dismissProgress * 0.06 : stackScale;
  const dismissLift = isTop ? dismissProgress * -22 : 0;
  const translateYWithOutro =
    translateY + dismissLift + (isTop ? skipDeltaY : 0);

  const intensity = isTop
    ? Math.min(Math.abs(swipeDelta) / SWIPE_THRESHOLD, 1)
    : 0;
  const effectIntensity = isTop ? intensity ** 0.78 : 0;
  const getSwipeDirection = (): 'right' | 'left' | null => {
    if (!isTop || Math.abs(swipeDelta) <= 20) {
      return null;
    }
    return swipeDelta > 0 ? 'right' : 'left';
  };
  const swipeDirection = getSwipeDirection();

  const accentColor =
    swipeDirection === 'right'
      ? 'var(--theme-accent-ketchup-default)'
      : 'var(--theme-accent-blueCheese-default)';
  let transition =
    'transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease';
  if (isTop) {
    if (isDismissAnimating) {
      transition = `transform ${dismissDurationMs}ms cubic-bezier(0.16, 0.86, 0.22, 1), opacity ${dismissDurationMs}ms ease-out, filter ${dismissDurationMs}ms ease-out, border-color 0.2s ease, box-shadow 0.2s ease`;
    } else if (isDragging) {
      transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
    } else {
      transition =
        'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.2s ease';
    }
  }

  return (
    <div
      className={classNames(
        'absolute inset-0 flex select-none flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2',
        !isTop && 'pointer-events-none',
      )}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateYWithOutro}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 10 - offset,
        transition,
        opacity: isTop ? 1 - dismissProgress * 0.75 : 1,
        filter:
          isTop && isDismissAnimating
            ? `blur(${dismissProgress * 1.8}px)`
            : undefined,
        borderColor: swipeDirection
          ? `color-mix(in srgb, ${accentColor} ${Math.round(
              effectIntensity * 100,
            )}%, var(--theme-border-subtlest-tertiary))`
          : undefined,
        boxShadow: swipeDirection
          ? `0 0 ${6 + effectIntensity * 24}px ${
              2 + effectIntensity * 8
            }px color-mix(in srgb, ${accentColor} ${Math.round(
              effectIntensity * 65,
            )}%, transparent), 0 0 ${10 + effectIntensity * 34}px ${
              4 + effectIntensity * 14
            }px color-mix(in srgb, ${accentColor} ${Math.round(
              effectIntensity * 42,
            )}%, transparent)`
          : undefined,
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      {isTop && <style>{EFFECT_KEYFRAMES}</style>}

      {swipeDirection === 'right' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(180deg, rgba(255,150,20,${
                effectIntensity * 0.08
              }) 0%, rgba(255,90,0,${
                effectIntensity * 0.16
              }) 42%, rgba(100,20,0,${effectIntensity * 0.24}) 100%)`,
              boxShadow: [
                `inset 0 ${-55 * effectIntensity}px ${44 * effectIntensity}px ${
                  -16 * effectIntensity
                }px rgba(255,100,0,0.4)`,
                `inset ${26 * effectIntensity}px 0 ${28 * effectIntensity}px ${
                  -14 * effectIntensity
                }px rgba(255,60,0,0.15)`,
                `inset ${-26 * effectIntensity}px 0 ${28 * effectIntensity}px ${
                  -14 * effectIntensity
                }px rgba(255,60,0,0.15)`,
              ].join(', '),
              animation: `hotTakeHeatShimmer ${
                0.6 + (1 - effectIntensity) * 0.4
              }s ease-in-out infinite`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              right: '-10%',
              bottom: '-16%',
              height: '44%',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 100%, rgba(255,80,0,${
                effectIntensity * 0.42
              }) 0%, rgba(255,125,0,${
                effectIntensity * 0.24
              }) 40%, transparent 78%)`,
              filter: `blur(${5 + effectIntensity * 5}px)`,
              animation: 'hotTakeHeatShimmer 1.1s ease-in-out infinite',
            }}
          />
          {FLAMES.map((flame, i) => (
            <div
              key={flame.left}
              style={{
                position: 'absolute',
                bottom: -2,
                left: flame.left,
                width: flame.size * 0.55,
                height: flame.size * effectIntensity,
                background:
                  'radial-gradient(ellipse at 50% 88%, #fff29a 0%, #ffcf3d 20%, #ff8a00 45%, #ff3b00 66%, rgba(0,0,0,0) 84%)',
                borderRadius: '50% 50% 20% 20%',
                filter: `blur(${1.4 + effectIntensity * 1.8}px) saturate(${
                  1 + effectIntensity * 0.35
                })`,
                animation: `hotTakeFlame ${
                  0.3 + i * 0.06
                }s ease-in-out infinite alternate`,
                animationDelay: `${flame.delay}s`,
                transform: 'translateX(-50%)',
                opacity: 0.45 + effectIntensity * 0.55,
                willChange: 'transform, opacity, filter',
              }}
            />
          ))}
          {EMBERS.map((ember) => (
            <div
              key={`${ember.left}-${ember.bottom}`}
              style={{
                position: 'absolute',
                left: ember.left,
                bottom: ember.bottom,
                width: ember.size,
                height: ember.size,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, #fff6ba 0%, #ffcb58 22%, #ff7a1a 54%, rgba(255,80,0,0.2) 80%, transparent 100%)',
                boxShadow: `0 0 ${ember.size + 3}px rgba(255,120,0,${
                  0.35 + effectIntensity * 0.55
                })`,
                animation: `hotTakeEmber ${ember.duration}s ease-out infinite`,
                animationDelay: `${ember.delay}s`,
                opacity: 0.3 + effectIntensity * 0.7,
              }}
            />
          ))}
        </div>
      )}

      {swipeDirection === 'left' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-16">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(180deg, rgba(210,240,255,${
                effectIntensity * 0.22
              }) 0%, rgba(140,210,255,${
                effectIntensity * 0.12
              }) 42%, rgba(120,170,255,${effectIntensity * 0.1}) 100%)`,
              boxShadow: [
                `inset 0 ${52 * effectIntensity}px ${42 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(150,210,255,0.35)`,
                `inset ${24 * effectIntensity}px 0 ${26 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(130,200,255,0.12)`,
                `inset ${-24 * effectIntensity}px 0 ${26 * effectIntensity}px ${
                  -15 * effectIntensity
                }px rgba(130,200,255,0.12)`,
              ].join(', '),
              backdropFilter: `blur(${effectIntensity * 1.2}px)`,
              animation: `hotTakeFrostBreath ${
                0.85 + (1 - effectIntensity) * 0.35
              }s ease-in-out infinite`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: `${18 + effectIntensity * 10}%`,
              background: `linear-gradient(180deg, rgba(225,245,255,${
                effectIntensity * 0.42
              }) 0%, rgba(170,220,255,${
                effectIntensity * 0.14
              }) 75%, transparent 100%)`,
              filter: `blur(${1.5 + effectIntensity * 1.2}px)`,
              animation: 'hotTakeFrostBreath 1.2s ease-in-out infinite',
            }}
          />
          {ICICLES.map((icicle, i) => (
            <div
              key={icicle.left}
              style={{
                position: 'absolute',
                top: -1,
                left: icicle.left,
                width: icicle.width,
                height: icicle.height * effectIntensity,
                background:
                  'linear-gradient(180deg, rgba(220,240,255,0.95) 0%, rgba(140,210,255,0.85) 40%, rgba(100,180,255,0.5) 100%)',
                clipPath: ICICLE_SHAPES[icicle.shape],
                transform: `translateX(-50%) rotate(${icicle.rotate}deg)`,
                transformOrigin: 'top center',
                boxShadow: `0 2px ${
                  4 + effectIntensity * 4
                }px rgba(175,220,255,${0.3 + effectIntensity * 0.4})`,
                filter: `saturate(${1 + effectIntensity * 0.25})`,
                animation: `hotTakeIcicleShimmer ${
                  2 + i * 0.2
                }s ease-in-out infinite`,
                animationDelay: `${icicle.delay}s`,
              }}
            />
          ))}
          {SNOWFLAKES.map((flake) => (
            <div
              key={`${flake.left}-${flake.top}`}
              style={{
                position: 'absolute',
                left: flake.left,
                top: flake.top,
                width: flake.size,
                height: flake.size,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, white 0%, rgba(200,230,255,0.8) 60%, transparent 100%)',
                boxShadow: `0 0 ${
                  flake.size + effectIntensity * 2
                }px rgba(200,230,255,${0.35 + effectIntensity * 0.5})`,
                animation: `hotTakeSnowfall ${flake.duration}s ease-in-out infinite`,
                animationDelay: `${flake.delay}s`,
                opacity: 0.35 + effectIntensity * 0.65,
              }}
            />
          ))}
        </div>
      )}

      {isTop && swipeDirection && (
        <div
          className={classNames(
            'z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 px-4 py-1 font-bold typo-title3',
            swipeDirection === 'right'
              ? 'bg-accent-ketchup-default text-white'
              : 'bg-accent-blueCheese-default text-white',
          )}
          style={{
            opacity: effectIntensity,
            animation: 'hotTakeBadgePulse 0.18s ease-out',
            boxShadow: `0 6px ${12 + effectIntensity * 10}px rgba(0,0,0,${
              0.1 + effectIntensity * 0.18
            })`,
          }}
        >
          {swipeDirection === 'right' ? 'HOT 🔥' : 'COLD 🥶'}
        </div>
      )}

      {isTop && isSkipAnimating && (
        <div
          className="z-20 absolute left-1/2 top-4 -translate-x-1/2 rounded-10 bg-overlay-quaternary-cabbage px-4 py-1 font-bold text-white typo-title3"
          style={{
            opacity: dismissProgress,
            animation: 'hotTakeBadgePulse 0.18s ease-out',
            boxShadow: `0 6px ${12 + dismissProgress * 10}px rgba(0,0,0,${
              0.1 + dismissProgress * 0.18
            })`,
          }}
        >
          SKIP 😐
        </div>
      )}

      <div className="pointer-events-none relative flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <div className="flex size-16 items-center justify-center rounded-16 bg-overlay-quaternary-cabbage text-[2.5rem]">
          {hotTake.emoji}
        </div>

        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="text-center"
        >
          {hotTake.title}
        </Typography>

        {hotTake.subtitle && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            {hotTake.subtitle}
          </Typography>
        )}

        {hotTake.upvotes > 0 && (
          <div className="flex items-center gap-1 rounded-10 bg-surface-hover px-3 py-1">
            <HotIcon className="text-accent-cabbage-default" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              bold
            >
              {hotTake.upvotes}
            </Typography>
          </div>
        )}
      </div>

      {hotTake.user && (
        <a
          href={hotTake.user.permalink}
          className="relative flex items-center gap-3 border-t border-border-subtlest-tertiary p-4 hover:bg-surface-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ProfilePicture
            user={hotTake.user}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1">
              <span className="truncate font-bold typo-callout">
                {hotTake.user.name}
              </span>
              {hotTake.user.isPlus && (
                <PlusUserBadge
                  user={{ isPlus: hotTake.user.isPlus }}
                  tooltip={false}
                />
              )}
              <span className="truncate text-text-tertiary typo-footnote">
                @{hotTake.user.username}
              </span>
            </div>
            <div className="flex gap-2">
              <ReputationUserBadge user={hotTake.user} disableTooltip />
              {hotTake.user.companies?.length > 0 && (
                <VerifiedCompanyUserBadge
                  user={{ companies: hotTake.user.companies }}
                />
              )}
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

const EmptyState = ({
  onClose,
  username,
}: {
  onClose: ModalProps['onRequestClose'];
  username?: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <span className="text-[3rem]">🎉</span>
    <Typography
      type={TypographyType.Title3}
      color={TypographyColor.Primary}
      bold
      className="text-center"
    >
      You&apos;ve seen all the hot takes!
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Tertiary}
      className="text-center"
    >
      Share your own hot takes and let others vote on them.
    </Typography>
    {username && (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        tag="a"
        href={`${webappUrl}${username}#hot-takes`}
        onClick={(e) => {
          onClose?.(e);
        }}
      >
        Share your hot takes
      </Button>
    )}
  </div>
);

const HotAndColdModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { currentTake, nextTake, isEmpty, isLoading, dismissCurrent } =
    useDiscoverHotTakes();
  const { toggleUpvote, toggleDownvote } = useVoteHotTake();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const [swipeDelta, setSwipeDelta] = useState(0);
  const swipeDeltaRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDurationMs, setDismissDurationMs] =
    useState(DISMISS_ANIMATION_MS);
  const [animatingTakeId, setAnimatingTakeId] = useState<string | null>(null);
  const animatingTakeIdRef = useRef<string | null>(null);
  const flyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [skipDelta, setSkipDelta] = useState(0);
  const swipeDeltaYRef = useRef(0);

  useEffect(() => {
    animatingTakeIdRef.current = animatingTakeId;
  }, [animatingTakeId]);

  useEffect(() => {
    if (!isAnimating) {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      setSkipDelta(0);
      swipeDeltaYRef.current = 0;
      setIsDragging(false);
    }
  }, [currentTake?.id, isAnimating]);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current) {
        clearTimeout(flyTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const startDismissAnimation = useCallback(
    ({
      takeId,
      durationMs,
      flyDelayMs,
      onFly,
    }: {
      takeId: string;
      durationMs: number;
      flyDelayMs: number;
      onFly: () => void;
    }) => {
      if (flyTimerRef.current) {
        clearTimeout(flyTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      animatingTakeIdRef.current = takeId;
      setAnimatingTakeId(takeId);
      setDismissDurationMs(durationMs);
      setIsAnimating(true);
      setIsDragging(false);

      flyTimerRef.current = setTimeout(() => {
        if (animatingTakeIdRef.current !== takeId) {
          flyTimerRef.current = null;
          return;
        }
        onFly();
        flyTimerRef.current = null;
      }, flyDelayMs);

      dismissTimerRef.current = setTimeout(() => {
        if (animatingTakeIdRef.current !== takeId) {
          dismissTimerRef.current = null;
          return;
        }
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(0);
        swipeDeltaYRef.current = 0;
        animatingTakeIdRef.current = null;
        setAnimatingTakeId(null);
        dismissCurrent();
        setIsAnimating(false);
        dismissTimerRef.current = null;
      }, durationMs);
    },
    [dismissCurrent],
  );

  const handleDismiss = useCallback(
    (direction: 'left' | 'right', source: 'swipe' | 'button' = 'swipe') => {
      if (!currentTake || isAnimating) {
        return;
      }

      const isButtonSource = source === 'button';
      const durationMs = isButtonSource
        ? BUTTON_DISMISS_ANIMATION_MS
        : DISMISS_ANIMATION_MS;
      const vote = direction === 'right' ? 'hot' : 'cold';

      logEvent({
        event_name: LogEvent.VoteHotAndCold,
        target_id: currentTake.id,
        extra: JSON.stringify({ vote, direction, hotTakeId: currentTake.id }),
      });

      if (direction === 'right') {
        toggleUpvote({
          payload: currentTake,
          origin: Origin.HotAndCold,
        });
      } else {
        toggleDownvote({
          payload: currentTake,
          origin: Origin.HotAndCold,
        });
      }

      let initialPush: number;
      let flyDistance: number;
      if (isButtonSource) {
        initialPush =
          direction === 'right'
            ? SWIPE_THRESHOLD * 0.45
            : -SWIPE_THRESHOLD * 0.45;
        flyDistance =
          direction === 'right'
            ? BUTTON_DISMISS_FLY_DISTANCE
            : -BUTTON_DISMISS_FLY_DISTANCE;
      } else {
        initialPush =
          direction === 'right'
            ? Math.max(swipeDelta, SWIPE_THRESHOLD * 1.25)
            : Math.min(swipeDelta, -SWIPE_THRESHOLD * 1.25);
        flyDistance =
          direction === 'right' ? DISMISS_FLY_DISTANCE : -DISMISS_FLY_DISTANCE;
      }
      setSwipeDelta(initialPush);

      startDismissAnimation({
        takeId: currentTake.id,
        durationMs,
        flyDelayMs: isButtonSource ? BUTTON_FLY_KICK_DELAY_MS : 0,
        onFly: () => setSwipeDelta(flyDistance),
      });
    },
    [
      currentTake,
      isAnimating,
      startDismissAnimation,
      toggleDownvote,
      toggleUpvote,
      logEvent,
      swipeDelta,
    ],
  );

  const handleSkip = useCallback(
    (source: 'swipe' | 'button' = 'button') => {
      if (!currentTake || isAnimating) {
        return;
      }

      logEvent({
        event_name: LogEvent.SkipHotTake,
        target_id: currentTake.id,
      });

      startDismissAnimation({
        takeId: currentTake.id,
        durationMs: SKIP_DISMISS_ANIMATION_MS,
        flyDelayMs: source === 'button' ? BUTTON_FLY_KICK_DELAY_MS : 0,
        onFly: () => setSkipDelta(-SKIP_DISMISS_FLY_DISTANCE),
      });
    },
    [currentTake, isAnimating, startDismissAnimation, logEvent],
  );

  const isCurrentTakeAnimating =
    !!currentTake && isAnimating && animatingTakeId === currentTake.id;
  const cardSwipeDelta =
    isAnimating && !isCurrentTakeAnimating ? 0 : swipeDelta;
  const cardSkipDelta = isAnimating && !isCurrentTakeAnimating ? 0 : skipDelta;

  const handleSwiped = (direction: 'left' | 'right') => {
    setIsDragging(false);
    setSkipDelta(0);
    if (Math.abs(swipeDeltaRef.current) > SWIPE_THRESHOLD) {
      handleDismiss(direction, 'swipe');
    } else {
      setSwipeDelta(0);
      swipeDeltaRef.current = 0;
      swipeDeltaYRef.current = 0;
    }
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isAnimating) {
        setIsDragging(true);
        setSwipeDelta(e.deltaX);
        if (e.deltaY < 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          setSkipDelta(getElasticDelta(e.deltaY));
        } else {
          setSkipDelta(0);
        }
        swipeDeltaRef.current = e.deltaX;
        swipeDeltaYRef.current = e.deltaY;
      }
    },
    onSwipedLeft: () => handleSwiped('left'),
    onSwipedRight: () => handleSwiped('right'),
    onSwipedUp: () => {
      setIsDragging(false);
      if (
        swipeDeltaYRef.current < 0 &&
        Math.abs(swipeDeltaYRef.current) > SWIPE_THRESHOLD
      ) {
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        handleSkip('swipe');
      } else {
        setSwipeDelta(0);
        swipeDeltaRef.current = 0;
        setSkipDelta(0);
        swipeDeltaYRef.current = 0;
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
  });

  return (
    <Modal {...props} onRequestClose={onRequestClose} size={ModalSize.Small}>
      <Modal.Header title="Hot Takes" />
      <Modal.Body className="!p-0">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center p-6">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Loading hot takes...
            </Typography>
          </div>
        )}

        {!isLoading && isEmpty && (
          <EmptyState onClose={onRequestClose} username={user?.username} />
        )}

        {!isLoading && !isEmpty && currentTake && (
          <>
            <div
              {...handlers}
              className="relative mx-4 mt-2 select-none"
              style={{ height: '26rem' }}
            >
              {nextTake && (
                <HotTakeCard
                  key={nextTake.id}
                  hotTake={nextTake}
                  isTop={false}
                  offset={1}
                  swipeDelta={0}
                  isDismissAnimating={false}
                  isDragging={false}
                  dismissDurationMs={DISMISS_ANIMATION_MS}
                />
              )}
              <HotTakeCard
                key={currentTake.id}
                hotTake={currentTake}
                isTop
                offset={0}
                swipeDelta={cardSwipeDelta}
                skipDeltaY={cardSkipDelta}
                isDismissAnimating={isCurrentTakeAnimating}
                isDragging={isDragging}
                dismissDurationMs={dismissDurationMs}
              />
            </div>

            <div className="flex items-center justify-center gap-4 p-4 pt-3">
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                icon={
                  <span className="text-[1.375rem] leading-none" aria-hidden>
                    ❄️
                  </span>
                }
                onClick={() => handleDismiss('left', 'button')}
                disabled={isAnimating}
                className="!size-14 rounded-full"
                aria-label="Cold take - downvote"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                icon={
                  <span className="text-[1.375rem] leading-none" aria-hidden>
                    😐
                  </span>
                }
                onClick={() => handleSkip('button')}
                disabled={isAnimating}
                className="!size-12 rounded-full"
                aria-label="Skip hot take"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                icon={
                  <span className="text-[1.375rem] leading-none" aria-hidden>
                    🔥
                  </span>
                }
                onClick={() => handleDismiss('right', 'button')}
                disabled={isAnimating}
                className="!size-14 rounded-full"
                aria-label="Hot take - upvote"
              />
            </div>

            {user?.username && (
              <div className="px-4 pb-4">
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Medium}
                  tag="a"
                  href={`${webappUrl}${user.username}#hot-takes`}
                  className="w-full"
                  onClick={(e) => {
                    onRequestClose?.(e);
                  }}
                >
                  Add your own hot take
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HotAndColdModal;
