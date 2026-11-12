import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  CoreIcon,
  ReadingStreakIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { awards } from '../../real/catalog';
import { minAward, minBoost } from '../../flows/cores/fixtures';
import type { CoresUse } from '../../flows/cores/UseYourCores';
import { streakFreezeProducts } from '../../real/handlers';
import { BoostHeroTile } from './BoostHeroTile';
import { useStreakRecoverState } from './UseTileFlows';

// "Use your Cores" in the new look: in the wallet, three compact boxes in a
// row (Boost with today's deal, then award and streak, described only);
// rows in the first Cores sheet that only describe each use.

export type { CoresUse };

interface UseDefinition {
  title: string;
  description: string;
  icon: ReactNode;
  tint: string;
  from: number | null;
}

const awardImages = awards.map(({ image }) => image).filter(Boolean);

/** Every award image in turn, one at a time; the Heart alone on reduced motion */
const AwardsCycle = (): ReactElement => {
  const [index, setIndex] = useState(() =>
    Math.max(
      awards.findIndex(({ name }) => name === 'Heart'),
      0,
    ),
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const interval = setInterval(
      () => setIndex((current) => (current + 1) % awardImages.length),
      1200,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative size-7">
      {awardImages.map((image, position) => (
        <Image
          key={image}
          src={image}
          alt={position === index ? 'Award' : ''}
          className={classNames(
            'absolute inset-0 size-full transition-all duration-300',
            position === index ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />
      ))}
    </span>
  );
};

const uses: Record<CoresUse, UseDefinition> = {
  award: {
    title: 'Give an award',
    description: 'Thank a creator for a post or a comment',
    icon: <AwardsCycle />,
    tint: 'bg-overlay-float-cabbage',
    from: minAward,
  },
  boost: {
    title: 'Boost your post',
    description: 'Show your post to more developers',
    icon: (
      <BoostIcon
        size={IconSize.Small}
        className="text-accent-blueCheese-default"
      />
    ),
    tint: 'bg-overlay-float-blueCheese',
    from: minBoost,
  },
  streak: {
    title: 'Restore a lost streak',
    description: 'Bring back a streak the day after it breaks',
    icon: (
      <ReadingStreakIcon
        secondary
        size={IconSize.Small}
        className="text-accent-bacon-default"
      />
    ),
    tint: 'bg-overlay-float-bacon',
    from: null,
  },
};

/** The price as a chip at the end of a row */
const PriceChip = ({ from }: { from: number | null }): ReactElement => (
  <span className="flex shrink-0 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-2 py-1 typo-caption1">
    {from === null ? (
      <span className="text-text-tertiary">Varies</span>
    ) : (
      <>
        <CoreIcon size={IconSize.Size16} />
        <strong className="tabular-nums">{formatCoresCurrency(from)}+</strong>
      </>
    )}
  </span>
);

const UseIcon = ({
  use,
  className = 'size-10',
}: {
  use: CoresUse;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-12',
      uses[use].tint,
      className,
    )}
  >
    {uses[use].icon}
  </span>
);

export const CoresUseTile = ({
  use,
  override,
}: {
  use: CoresUse;
  /** Copy and price that depend on the viewer, like a streak to restore */
  override?: Partial<Pick<UseDefinition, 'title' | 'description' | 'from'>>;
}): ReactElement => {
  const { title, description, from } = { ...uses[use], ...override };

  return (
    <li className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
      <span className="flex w-full items-center gap-2">
        <UseIcon use={use} className="size-8" />
        <span className="min-w-0 flex-1 font-bold typo-callout">{title}</span>
      </span>
      <span className="text-text-tertiary typo-footnote">{description}</span>
      <span className="mt-auto flex pt-1">
        <PriceChip from={from} />
      </span>
    </li>
  );
};

export const UseYourCoresTiles = ({
  balance,
}: {
  balance: number;
}): ReactElement => {
  const recover = useStreakRecoverState();
  const canRecover = !!recover?.canRecover;
  const streakOverride = canRecover
    ? {
        title: `Restore your ${recover.oldStreakLength}-day streak`,
        description: 'It broke yesterday. Bring it back before it’s gone',
        from: recover.cost,
      }
    : {
        title: 'Protect your streak',
        description: 'Streak freezes cover the days you miss reading',
        from: Math.min(...streakFreezeProducts.map(({ value }) => value)),
      };

  return (
    <ul className="flex flex-col gap-2 laptop:grid laptop:grid-cols-3 laptop:gap-3">
      <BoostHeroTile balance={balance} />
      {(['award', 'streak'] as CoresUse[]).map((use) => (
        <CoresUseTile
          key={use}
          use={use}
          override={use === 'streak' ? streakOverride : undefined}
        />
      ))}
    </ul>
  );
};

/** One use, described: what it does and what it costs, nothing to tap */
export const CoresUseRow = ({ use }: { use: CoresUse }): ReactElement => {
  const { title, description, from } = uses[use];

  return (
    <li className="flex w-full items-center gap-4 py-3 text-left">
      <UseIcon use={use} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-subhead">{title}</span>
        <span className="text-text-tertiary typo-footnote">{description}</span>
      </span>
      <PriceChip from={from} />
    </li>
  );
};
