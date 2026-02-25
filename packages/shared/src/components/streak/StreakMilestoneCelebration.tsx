import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { StreakMilestone } from '../../lib/streakMilestones';
import { RewardType } from '../../lib/streakMilestones';
import { CoreIcon } from '../icons';
import { RootPortal } from '../tooltips/Portal';
import { MILESTONE_ICON_URLS } from './popup/icons/milestoneIcons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MilestoneShareActions } from './MilestoneShareActions';

type CelebrationPhase = 'enter' | 'reveal' | 'rewards';

interface StreakMilestoneCelebrationProps {
  milestone: StreakMilestone;
  streakDay: number;
  onComplete: () => void;
}

const rewardIcon: Record<RewardType, string> = {
  [RewardType.Cores]: '',
  [RewardType.Cosmetic]: '\u2728',
  [RewardType.Perk]: '\u26A1',
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const PARTICLE_COLORS = [
  'rgba(255, 149, 0, 0.8)',
  'rgba(255, 116, 84, 0.8)',
  'rgba(255, 200, 60, 0.8)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(255, 170, 100, 0.7)',
];

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

export function StreakMilestoneCelebration({
  milestone,
  streakDay,
  onComplete,
}: StreakMilestoneCelebrationProps): ReactElement | null {
  const [phase, setPhase] = useState<CelebrationPhase>('enter');
  const particles = useMemo(() => generateParticles(20), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('reveal'), 100),
      setTimeout(() => setPhase('rewards'), 800),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const isVisible = phase !== 'enter';
  const showRewards = phase === 'rewards';

  return (
    <RootPortal>
      <div
        className="fixed inset-0 z-max flex items-center justify-center"
        style={{
          opacity: 1,
          transition: 'opacity 0.6s ease-out',
        }}
      >
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-out',
          }}
        />

        {isVisible &&
          particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
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

        <div
          className="relative z-1 flex flex-col items-center gap-4"
          style={{
            transform: isVisible ? 'scale(1)' : 'scale(0.5)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 120,
              height: 120,
              filter: 'drop-shadow(0 0 30px rgba(255, 149, 0, 0.5))',
            }}
          >
            <img
              src={MILESTONE_ICON_URLS[milestone.tier]}
              alt={milestone.label}
              className="size-full object-contain transition-transform duration-300 hover:scale-150"
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <Typography
              bold
              type={TypographyType.LargeTitle}
              className="text-accent-bacon-default"
            >
              {milestone.label}
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
            >
              Day {streakDay} Milestone!
            </Typography>
          </div>

          {showRewards && milestone.rewards.length > 0 && (
            <div
              className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default/80 px-6 py-3"
              style={{
                opacity: showRewards ? 1 : 0,
                transform:
                  showRewards
                    ? 'translateY(0)'
                    : 'translateY(8px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <Typography
                bold
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="uppercase tracking-wider"
              >
                Rewards Unlocked
              </Typography>
              {milestone.rewards.map((reward) => (
                <div
                  key={reward.description}
                  className="flex items-center gap-2"
                >
                  {reward.type === RewardType.Cores ? (
                    <CoreIcon size={IconSize.XSmall} />
                  ) : (
                    <span>{rewardIcon[reward.type]}</span>
                  )}
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {reward.description}
                  </Typography>
                </div>
              ))}
            </div>
          )}
          {showRewards && (
            <>
              <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default/80 px-6 py-4">
                <MilestoneShareActions
                  message={`I just reached ${milestone.label} (${streakDay} day streak) on daily.dev`}
                />
              </div>
              <Button
                className="w-full max-w-sm"
                onClick={onComplete}
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
              >
                Close
              </Button>
            </>
          )}
        </div>
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
