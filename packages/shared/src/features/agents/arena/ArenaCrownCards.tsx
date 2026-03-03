import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { IconSize } from '../../../components/Icon';
import type { CrownData } from './types';
import Link from '../../../components/utilities/Link';
import {
  CROWN_SPARK_COUNT,
  crownHoverAnimations,
  runCrownMouseEnterAnimation,
} from './ArenaCrownAnimations';
import { getAgentEntityPath } from './links';

interface ArenaCrownCardsProps {
  crowns: CrownData[];
  tab?: 'coding-agents' | 'llms';
  loading?: boolean;
  animated?: boolean;
  forceGrid?: boolean;
  compact?: boolean;
  hideEntityName?: boolean;
}

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const CrownCard = ({
  crown,
  tab,
  loading,
  animated = true,
  compact = false,
  hideEntityName = false,
}: {
  crown: CrownData;
  tab?: 'coding-agents' | 'llms';
  loading?: boolean;
  animated?: boolean;
  compact?: boolean;
  hideEntityName?: boolean;
}): ReactElement => {
  const hasEntity = !loading && !!crown.entity;
  const hoverClass =
    hasEntity && animated ? crownHoverAnimations[crown.type] : undefined;
  let rowClassName = 'h-7 tablet:h-8 tablet:gap-2';
  if (compact) {
    rowClassName = 'h-6';
  }

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasEntity || !animated) {
        return;
      }

      runCrownMouseEnterAnimation(e.currentTarget, crown.type, crown.glowColor);
    },
    [animated, hasEntity, crown.glowColor, crown.type],
  );

  return (
    <div
      className={classNames(
        'group relative flex flex-1 flex-col items-center overflow-hidden rounded-16 border',
        compact
          ? 'min-w-[122px] gap-1.5 px-1.5 py-2 tablet:min-w-0 tablet:gap-2 tablet:px-2 tablet:py-2.5'
          : 'min-w-[170px] gap-2 p-3 tablet:min-w-0 tablet:gap-3 tablet:p-5',
        'border-border-subtlest-tertiary transition-shadow duration-300',
        hoverClass,
      )}
      onMouseEnter={handleMouseEnter}
    >
      {hasEntity && tab && (
        <Link href={getAgentEntityPath(crown.entity.entity, tab)}>
          <a
            className="z-20 absolute inset-0 rounded-16"
            aria-label={`Open ${crown.entity.name} page`}
          />
        </Link>
      )}
      {hasEntity && (
        <div
          className="group-hover:!opacity-30 pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-300"
          style={{
            backgroundColor: crown.glowColor,
            animation: animated ? 'pulse 3s ease-in-out infinite' : undefined,
            opacity: 0.15,
          }}
        />
      )}

      <div className="flex flex-col items-center gap-1">
        <div className="crown-icon-wrapper relative transition-transform duration-300">
          <crown.icon
            size={compact ? IconSize.Medium : IconSize.Large}
            secondary={hasEntity}
            className={classNames(
              hasEntity ? crown.iconColor : 'text-text-quaternary',
            )}
          />

          {hasEntity &&
            crown.type !== 'most-loved' &&
            crown.type !== 'fastest-rising' &&
            crown.type !== 'most-discussed' &&
            crown.type !== 'most-controversial' &&
            crown.type !== 'developers-choice' && (
              <div className="z-10 pointer-events-none absolute inset-0">
                {Array.from({ length: CROWN_SPARK_COUNT }, (_, i) => (
                  <div
                    key={i}
                    className="crown-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
                    style={{ backgroundColor: crown.glowColor }}
                  />
                ))}
              </div>
            )}

          {hasEntity && crown.type === 'most-controversial' && (
            <>
              <div
                className="crown-flame-glow pointer-events-none absolute left-1/2 top-[45%] h-[165%] w-[165%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
                style={{
                  background: `radial-gradient(circle, color-mix(in srgb, ${crown.glowColor} 48%, var(--theme-accent-cheese-default)) 0%, color-mix(in srgb, ${crown.glowColor} 30%, transparent) 42%, transparent 72%)`,
                }}
              />
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-flame-ember absolute left-1/2 top-[52%] h-[3px] w-[3px] rounded-full opacity-0"
                    style={{
                      backgroundColor:
                        i % 2 === 0
                          ? 'var(--theme-accent-cheese-default)'
                          : crown.glowColor,
                      boxShadow:
                        i % 2 === 0
                          ? '0 0 4px color-mix(in srgb, var(--theme-accent-cheese-default) 85%, transparent)'
                          : `0 0 4px color-mix(in srgb, ${crown.glowColor} 85%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {hasEntity && crown.type === 'developers-choice' && (
            <>
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <div
                  className="crown-medal-sheen absolute left-1/2 top-1/2 h-[155%] w-[42%] -translate-x-[170%] -translate-y-1/2 rotate-[18deg] opacity-0"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--theme-accent-cheese-default) 85%, white) 50%, transparent 100%)',
                    filter: 'blur(1px)',
                  }}
                />
              </div>
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 2 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-medal-glint absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full opacity-0"
                    style={{
                      backgroundColor: 'var(--theme-accent-cheese-default)',
                      boxShadow:
                        '0 0 4px color-mix(in srgb, var(--theme-accent-cheese-default) 90%, white)',
                    }}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 16 }, (_, i) => (
                  <div
                    key={i}
                    className="crown-medal-particle z-10 absolute left-1/2 top-1/2 h-[4px] w-[4px] rounded-full opacity-0"
                    style={{
                      backgroundColor:
                        i % 3 === 0
                          ? 'white'
                          : 'var(--theme-accent-cheese-default)',
                      boxShadow:
                        '0 0 8px color-mix(in srgb, var(--theme-accent-cheese-default) 98%, white)',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {hasEntity && crown.type === 'most-discussed' && (
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="crown-sound-particle absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full opacity-0"
                  style={{ backgroundColor: crown.glowColor }}
                />
              ))}
            </div>
          )}

          {hasEntity && crown.type === 'most-loved' && (
            <div
              className="crown-bloom pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{
                width: '260%',
                height: '260%',
                background: `radial-gradient(circle, color-mix(in srgb, ${crown.glowColor} 50%, white) 0%, color-mix(in srgb, ${crown.glowColor} 30%, transparent) 40%, transparent 70%)`,
              }}
            />
          )}
        </div>

        <span
          className={classNames(
            'text-center tracking-wider',
            compact ? 'typo-caption2' : 'typo-caption2 tablet:typo-caption1',
          )}
          style={hasEntity ? { color: crown.glowColor } : undefined}
        >
          {crown.label}
        </span>
      </div>

      {!hideEntityName && (
        <div className={classNames('flex items-center gap-1.5', rowClassName)}>
          {loading ? (
            <>
              <Placeholder
                className={classNames(
                  'shrink-0 rounded-8',
                  compact ? 'h-5 w-5' : 'h-6 w-6 tablet:h-8 tablet:w-8',
                )}
              />
              <Placeholder
                className={classNames(
                  compact ? 'h-3 w-12' : 'h-4 w-16 tablet:h-5 tablet:w-20',
                )}
              />
            </>
          ) : (
            <>
              <img
                src={crown.entity?.logo}
                alt={crown.entity?.name}
                className={classNames(
                  'shrink-0 rounded-8 bg-surface-float object-cover',
                  compact ? 'h-5 w-5' : 'h-6 w-6 tablet:h-8 tablet:w-8',
                )}
              />
              <span
                className={classNames(
                  'font-bold text-text-primary',
                  compact
                    ? 'max-w-full whitespace-nowrap text-center typo-footnote'
                    : 'truncate typo-callout',
                )}
              >
                {crown.entity?.name}
              </span>
            </>
          )}
        </div>
      )}

      <div className={classNames('flex items-center', compact ? 'h-4' : 'h-5')}>
        {loading ? (
          <Placeholder
            className={classNames(compact ? 'h-3 w-12' : 'h-4 w-16')}
          />
        ) : (
          <span
            className={classNames(
              'text-text-tertiary',
              compact ? 'typo-caption2' : 'typo-caption1',
            )}
          >
            {crown.stat}
          </span>
        )}
      </div>
    </div>
  );
};

export const ArenaCrownCards = ({
  crowns,
  tab,
  loading,
  animated = true,
  forceGrid = false,
  compact = false,
  hideEntityName = false,
}: ArenaCrownCardsProps): ReactElement => {
  let layoutClassName =
    'flex gap-3 overflow-x-auto tablet:grid tablet:grid-cols-5 tablet:overflow-visible';
  if (forceGrid) {
    layoutClassName = compact
      ? 'grid grid-cols-5 gap-2 overflow-visible'
      : 'grid grid-cols-5 gap-3 overflow-visible';
  }

  return (
    <div
      className={classNames(
        layoutClassName,
        !animated && '[&_*]:transition-none [&_*]:[animation:none!important]',
      )}
    >
      {crowns.map((crown) => (
        <CrownCard
          key={crown.type}
          crown={crown}
          tab={tab}
          loading={loading}
          animated={animated}
          compact={compact}
          hideEntityName={hideEntityName}
        />
      ))}
    </div>
  );
};
