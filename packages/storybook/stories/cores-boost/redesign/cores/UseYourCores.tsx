import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  ArrowIcon,
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
import {
  AwardTileFlow,
  StreakTileFlow,
  useStreakRecoverState,
} from './UseTileFlows';

// "Use your Cores" in the new look: in the wallet, Boost takes the main tile
// and the award and streak tiles stack beside it, each opening its flow;
// compact rows in the first Cores sheet.

export type { CoresUse };

interface UseDefinition {
  title: string;
  description: string;
  icon: ReactNode;
  tint: string;
  from: number | null;
}

const heart = awards.find(({ name }) => name === 'Heart');

const uses: Record<CoresUse, UseDefinition> = {
  award: {
    title: 'Give an award',
    description: 'Thank a creator for a post or a comment',
    icon: <Image src={heart?.image} alt="Award" className="size-7" />,
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

const Coverage = ({
  balance,
  from,
}: {
  balance: number;
  from: number | null;
}): ReactElement => {
  if (from === null) {
    return (
      <span className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
        Price varies
      </span>
    );
  }

  if (balance >= from) {
    return (
      <span className="rounded-8 bg-action-upvote-float px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
        You have enough
      </span>
    );
  }

  return (
    <span className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
      {formatCoresCurrency(from - balance)} more needed
    </span>
  );
};

const FromPrice = ({ from }: { from: number | null }): ReactElement | null =>
  from === null ? null : (
    <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
      From
      <CoreIcon size={IconSize.Size16} />
      <strong className="text-text-primary">{formatCoresCurrency(from)}</strong>
    </span>
  );

const UseIcon = ({ use }: { use: CoresUse }): ReactElement => (
  <span
    className={classNames(
      'flex size-10 shrink-0 items-center justify-center rounded-12',
      uses[use].tint,
    )}
  >
    {uses[use].icon}
  </span>
);

export const CoresUseTile = ({
  use,
  balance,
  override,
  onClick,
}: {
  use: CoresUse;
  balance: number;
  /** Copy and price that depend on the viewer, like a streak to restore */
  override?: Partial<Pick<UseDefinition, 'title' | 'description' | 'from'>>;
  onClick?: () => void;
}): ReactElement => {
  const { title, description, from } = { ...uses[use], ...override };

  return (
    <li className="flex">
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 text-left transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
      >
        <span className="flex w-full items-start justify-between">
          <UseIcon use={use} />
          <ArrowIcon
            size={IconSize.Small}
            className="rotate-90 text-text-quaternary transition-transform group-hover:translate-x-0.5 group-hover:text-text-tertiary"
          />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-bold typo-callout">{title}</span>
          <span className="text-text-tertiary typo-footnote">
            {description}
          </span>
        </span>
        <span className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <FromPrice from={from} />
          <Coverage balance={balance} from={from} />
        </span>
      </button>
    </li>
  );
};

export const UseYourCoresTiles = ({
  balance,
  onUse,
}: {
  balance: number;
  onUse?: (use: CoresUse) => void;
}): ReactElement => {
  const [openUse, setOpenUse] = useState<CoresUse>();
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
    <ul className="flex flex-col gap-2 tablet:grid tablet:grid-cols-3 tablet:grid-rows-2 tablet:gap-3">
      <BoostHeroTile
        balance={balance}
        className="tablet:col-span-2 tablet:row-span-2"
      />
      {(['award', 'streak'] as CoresUse[]).map((use) => (
        <CoresUseTile
          key={use}
          use={use}
          balance={balance}
          override={use === 'streak' ? streakOverride : undefined}
          onClick={() => {
            setOpenUse(use);
            onUse?.(use);
          }}
        />
      ))}
      {openUse === 'award' && (
        <AwardTileFlow onDone={() => setOpenUse(undefined)} />
      )}
      {openUse === 'streak' && (
        <StreakTileFlow
          canRecover={canRecover}
          onDone={() => setOpenUse(undefined)}
        />
      )}
    </ul>
  );
};

/** One fixed-height row, for the first Cores sheet */
export const CoresUseRow = ({
  use,
  balance,
  isPrimary,
  onClick,
}: {
  use: CoresUse;
  balance: number;
  isPrimary?: boolean;
  onClick?: () => void;
}): ReactElement => {
  const { title, from } = uses[use];

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          'flex min-h-16 w-full items-center gap-3 rounded-14 px-3 py-2 text-left transition-colors hover:bg-surface-hover',
          isPrimary
            ? 'bg-surface-float ring-1 ring-accent-cabbage-default'
            : 'bg-surface-float',
        )}
      >
        <UseIcon use={use} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-bold typo-subhead">{title}</span>
          <span className="flex flex-wrap items-center gap-2">
            <FromPrice from={from} />
            <Coverage balance={balance} from={from} />
          </span>
        </span>
        <ArrowIcon
          size={IconSize.Small}
          className="shrink-0 rotate-90 text-text-quaternary"
        />
      </button>
    </li>
  );
};
