import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { CoreIcon } from '../../icons';
import { RootPortal } from '../../tooltips/Portal';

type AnimationPhase = 'idle' | 'appear' | 'fly' | 'done';

interface ClaimRewardAnimationProps {
  amount: string;
  onComplete: () => void;
}

const WALLET_BUTTON_SELECTOR = 'a[href="/wallet"]';

export function ClaimRewardAnimation({
  amount,
  onComplete,
}: ClaimRewardAnimationProps): ReactElement | null {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [flyTarget, setFlyTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setPhase('appear'));

    const walletBtn = document.querySelector(WALLET_BUTTON_SELECTOR);

    if (walletBtn) {
      const rect = walletBtn.getBoundingClientRect();
      setFlyTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    const appearTimer = setTimeout(() => setPhase('fly'), 1200);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') {
    return null;
  }

  const centerX =
    typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const centerY =
    typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

  const isFly = phase === 'fly' && flyTarget;
  const targetX = isFly ? flyTarget.x : centerX;
  const targetY = isFly ? flyTarget.y : centerY;
  const targetScale = isFly ? 0.15 : 1;
  const targetOpacity = isFly ? 0 : 1;
  const showBackdrop = phase === 'appear';

  return (
    <RootPortal>
      <div className="pointer-events-none fixed inset-0 z-max">
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            opacity: showBackdrop ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
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
            +{amount}
          </span>
        </div>
      </div>
    </RootPortal>
  );
}
