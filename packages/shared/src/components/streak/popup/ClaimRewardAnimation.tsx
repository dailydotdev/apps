import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CoreIcon } from '../../icons';
import { RootPortal } from '../../tooltips/Portal';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useIsLightTheme } from '../../../hooks/utils';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import CursorAiDarkLogo from './icons/cursor-ai-dark.svg';
import CursorAiLightLogo from './icons/cursor-ai-light.svg';

type AnimationPhase = 'idle' | 'appear' | 'fly';

export type ClaimReward =
  | {
      type: 'cores';
      amount: string;
      milestoneDay: number;
      milestoneLabel: string;
    }
  | {
      type: 'coupon';
      code: string;
      title: string;
      milestoneDay: number;
      milestoneLabel: string;
    };

interface ClaimRewardAnimationProps {
  reward: ClaimReward;
  onComplete: () => void;
}

const WALLET_BUTTON_SELECTOR = 'a[href="/wallet"]';
const PARTICLE_COLORS = [
  'rgba(255, 149, 0, 0.8)',
  'rgba(255, 116, 84, 0.8)',
  'rgba(255, 200, 60, 0.8)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(255, 170, 100, 0.7)',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.6,
    duration: 1 + Math.random() * 1.5,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  }));

export function ClaimRewardAnimation({
  reward,
  onComplete,
}: ClaimRewardAnimationProps): ReactElement | null {
  const isLightTheme = useIsLightTheme();
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [copied, setCopied] = useState(false);
  const [showCouponDetails, setShowCouponDetails] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const particles = useMemo(() => generateParticles(20), []);

  useEffect(() => {
    requestAnimationFrame(() => setPhase('appear'));

    if (reward.type === 'coupon') {
      const revealTimer = setTimeout(() => setShowCouponDetails(true), 700);
      return () => clearTimeout(revealTimer);
    }

    const walletBtn = document.querySelector(WALLET_BUTTON_SELECTOR);

    if (walletBtn) {
      const rect = walletBtn.getBoundingClientRect();
      setFlyTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    const appearTimer = setTimeout(() => setPhase('fly'), 1200);
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, reward.type]);

  const handleCopyCode = useCallback(async () => {
    if (reward.type !== 'coupon') {
      return;
    }

    await navigator.clipboard.writeText(reward.code);
    setCopied(true);
  }, [reward]);

  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

  const isFly = phase === 'fly' && flyTarget && reward.type === 'cores';
  const targetX = isFly ? flyTarget.x : centerX;
  const targetY = isFly ? flyTarget.y : centerY;
  const targetScale = isFly ? 0.15 : 1;
  const targetOpacity = isFly ? 0 : 1;
  const showBackdrop = phase !== 'idle';
  const CursorLogo = isLightTheme ? CursorAiLightLogo : CursorAiDarkLogo;

  return (
    <RootPortal>
      <div className="pointer-events-auto fixed inset-0 z-max">
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            opacity: showBackdrop ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
        {reward.type === 'coupon' &&
          showBackdrop &&
          particles.map((p) => (
            <div
              key={p.id}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: p.color,
                opacity: 0,
                animation: `streak-particle ${p.duration}s ease-out ${p.delay}s forwards`,
              }}
            />
          ))}
        {reward.type === 'coupon' ? (
          <div
            className="absolute left-1/2 top-1/2 z-1 flex w-[20rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4"
            style={{
              transform: `translate(-50%, -50%) scale(${
                phase === 'idle' ? 0.6 : 1
              })`,
              opacity: phase === 'idle' ? 0 : 1,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              className="flex size-24 items-center justify-center rounded-full"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--theme-accent-bacon-default), transparent 78%) 0%, transparent 72%)',
                filter: isLightTheme
                  ? 'drop-shadow(0 0 30px rgba(255, 149, 0, 0.5))'
                  : 'drop-shadow(0 0 32px rgba(255, 255, 255, 0.72))',
              }}
            >
              <CursorLogo
                aria-label="Cursor AI"
                className="size-16 object-contain"
              />
            </div>

            <div
              className="flex min-h-[11.5rem] w-full flex-col items-center justify-center rounded-16 border-0 bg-transparent p-4 text-center shadow-none"
              style={{
                opacity: showCouponDetails ? 1 : 0,
                transform: showCouponDetails
                  ? 'translateY(0)'
                  : 'translateY(8px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <Typography
                bold
                type={TypographyType.LargeTitle}
                className="text-accent-bacon-default"
              >
                Cursor AI
              </Typography>
              <Typography
                bold
                type={TypographyType.Body}
                color={TypographyColor.Primary}
                className="mt-1"
              >
                Day 4 Milestone!
              </Typography>
              <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-12 bg-surface-float px-3 py-2">
                <Typography type={TypographyType.Callout}>
                  {reward.code}
                </Typography>
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={handleCopyCode}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Button
                className="mt-2 w-full"
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                tag="a"
                href="https://cursor.com/redeem"
              >
                Redeem on cursor.com
              </Button>
              <Button
                className="mt-3 w-full"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={onComplete}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="absolute"
              style={{
                left: targetX,
                top: targetY,
                transform: `translate(-50%, -50%) scale(${
                  phase === 'idle' ? 0.3 : targetScale
                })`,
                opacity: phase === 'idle' ? 0 : targetOpacity,
                filter:
                  phase === 'appear'
                    ? 'drop-shadow(0 0 40px rgba(255, 116, 84, 0.6))'
                    : 'none',
                transition:
                  phase === 'fly'
                    ? 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div style={{ width: 160, height: 160 }}>
                <CoreIcon className="h-full w-full" />
              </div>
              <span
                className="absolute whitespace-nowrap font-bold text-text-primary typo-giga1"
                style={{ top: 0, right: -16, transform: 'translate(100%, 0)' }}
              >
                +{reward.amount}
              </span>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes streak-particle {
          0% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.2) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-60px);
          }
        }
      `}</style>
    </RootPortal>
  );
}
