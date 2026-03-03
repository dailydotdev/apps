import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
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
import { ButtonSize } from '../buttons/Button';
import { MilestoneShareActions } from './MilestoneShareActions';
import CloseButton from '../CloseButton';

type CelebrationPhase =
  | 'enter'
  | 'showcase'
  | 'shrink'
  | 'popover';

interface StreakMilestoneCelebrationProps {
  milestone: StreakMilestone;
  streakDay: number;
  onComplete: () => void;
}

interface CelebrationLayout {
  badgeStartX: number;
  badgeStartY: number;
  badgeStartSize: number;
  badgeEndX: number;
  badgeEndY: number;
  badgeEndSize: number;
  popoverLeft: number;
  popoverTop: number;
  popoverWidth: number;
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

const POPOVER_MAX_WIDTH = 420;
const VIEWPORT_PADDING = 16;
const POPOVER_ICON_CENTER_OFFSET_Y = 76;

const getCelebrationLayout = (): CelebrationLayout => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const badgeStartSize = Math.min(224, Math.max(viewportWidth - 64, 120));
  const badgeStartX = viewportWidth / 2;
  const badgeStartY = viewportHeight / 2;
  const popoverWidth = Math.min(
    POPOVER_MAX_WIDTH,
    Math.max(viewportWidth - VIEWPORT_PADDING * 2, 280),
  );
  const popoverLeft = Math.max((viewportWidth - popoverWidth) / 2, VIEWPORT_PADDING);
  const popoverTop = Math.max((viewportHeight - 560) / 2, VIEWPORT_PADDING);

  return {
    badgeStartX,
    badgeStartY,
    badgeStartSize,
    badgeEndX: popoverLeft + popoverWidth / 2,
    badgeEndY: popoverTop + POPOVER_ICON_CENTER_OFFSET_Y,
    badgeEndSize: 120,
    popoverLeft,
    popoverTop,
    popoverWidth,
  };
};

export function StreakMilestoneCelebration({
  milestone,
  streakDay,
  onComplete,
}: StreakMilestoneCelebrationProps): ReactElement | null {
  const [phase, setPhase] = useState<CelebrationPhase>('enter');
  const particles = useMemo(() => generateParticles(20), []);
  const [layout, setLayout] = useState<CelebrationLayout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateLayout = () => {
      setLayout(getCelebrationLayout());
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('showcase'), 80),
      setTimeout(() => setPhase('shrink'), 900),
      setTimeout(() => setPhase('popover'), 1340),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const isVisible = phase !== 'enter';
  const showTravelBadge =
    phase === 'showcase' || phase === 'shrink' || phase === 'popover';
  const showPopover = phase === 'popover';
  const showRewards = showPopover;

  return (
    <RootPortal>
      <div
        className="fixed inset-0 z-max p-4"
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

        {showTravelBadge && layout && (
          <div
            className="pointer-events-none absolute z-2 flex items-center justify-center"
            style={{
              left: phase === 'showcase' ? layout.badgeStartX : layout.badgeEndX,
              top: phase === 'showcase' ? layout.badgeStartY : layout.badgeEndY,
              width:
                phase === 'showcase'
                  ? layout.badgeStartSize
                  : layout.badgeEndSize,
              height:
                phase === 'showcase'
                  ? layout.badgeStartSize
                  : layout.badgeEndSize,
              opacity: 1,
              transform: 'translate(-50%, -50%)',
              transition:
                'left 0.38s cubic-bezier(0.4, 0, 0.2, 1), top 0.38s cubic-bezier(0.4, 0, 0.2, 1), width 0.38s cubic-bezier(0.4, 0, 0.2, 1), height 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-out',
              filter: 'drop-shadow(0 0 42px rgba(255, 149, 0, 0.58))',
            }}
          >
            {particles.map((p) => (
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
            <img
              src={MILESTONE_ICON_URLS[milestone.tier]}
              alt={milestone.label}
              className="relative z-1 size-full object-contain"
            />
          </div>
        )}

        {showPopover && layout && (
          <div
            className="absolute z-1 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2"
            style={{
              left: layout.popoverLeft,
              top: layout.popoverTop,
              width: layout.popoverWidth,
              transform: showPopover ? 'scale(1)' : 'scale(0.9)',
              opacity: showPopover ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <CloseButton
              size={ButtonSize.Small}
              className="absolute right-2 top-2 z-2"
              onClick={onComplete}
            />
            <div className="relative z-1 flex flex-col items-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 120,
                  height: 120,
                }}
              >
                {/* Keep layout space while the traveling badge remains visible */}
                <span className="size-full" aria-hidden />
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
                  className="bg-background-default/80 flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-6 py-3"
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
                <div className="mt-3 flex w-full flex-col items-center">
                  <MilestoneShareActions
                    message={`I just reached ${milestone.label} (${streakDay} day streak) on daily.dev`}
                  />
                </div>
              )}
            </div>
          </div>
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
