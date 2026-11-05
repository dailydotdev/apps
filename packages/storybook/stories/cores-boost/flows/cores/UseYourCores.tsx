import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
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
import { minAward, minBoost } from './fixtures';

// New wallet section: what the balance can do, and whether it covers it.
// Each row opens the real flow (the feed for Award, the latest post for Boost).

export type CoresUse = 'award' | 'boost' | 'streak';

interface UseDefinition {
  title: string;
  description: string;
  icon: ReactNode;
  /** Cheapest way to use it, or null when the price is set at the time */
  from: number | null;
}

const heart = awards.find(({ name }) => name === 'Heart');

const uses: Record<CoresUse, UseDefinition> = {
  award: {
    title: 'Give an award',
    description: 'Thank a creator for a post or a comment',
    icon: <Image src={heart?.image} alt="Award" className="size-6" />,
    from: minAward,
  },
  boost: {
    title: 'Boost your post',
    description: 'Show your post to more developers',
    icon: <BoostIcon size={IconSize.Small} />,
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
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Price varies
      </Typography>
    );
  }

  if (balance >= from) {
    return (
      <Typography
        type={TypographyType.Footnote}
        className="text-accent-avocado-default"
        bold
      >
        You have enough
      </Typography>
    );
  }

  return (
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {formatCoresCurrency(from - balance)} more needed
    </Typography>
  );
};

export const CoresUseRow = ({
  use,
  balance,
  onClick,
  isPrimary,
  isCompact,
}: {
  use: CoresUse;
  balance: number;
  onClick?: () => void;
  isPrimary?: boolean;
  /** Title only, for the first Cores sheet */
  isCompact?: boolean;
}): ReactElement => {
  const { title, description, icon, from } = uses[use];

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          'flex w-full items-center gap-3 rounded-14 border p-3 text-left transition-colors hover:bg-surface-hover',
          isPrimary
            ? 'border-accent-cabbage-default'
            : 'border-border-subtlest-tertiary',
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          {!isCompact && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="hidden tablet:block"
            >
              {description}
            </Typography>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          {from !== null && (
            <span className="flex items-center gap-1">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                From
              </Typography>
              <CoreIcon size={IconSize.Size16} />
              <Typography type={TypographyType.Footnote} bold>
                {formatCoresCurrency(from)}
              </Typography>
            </span>
          )}
          <Coverage balance={balance} from={from} />
        </span>
        <ArrowIcon
          size={IconSize.Small}
          className="shrink-0 rotate-90 text-text-tertiary"
        />
      </button>
    </li>
  );
};

export const UseYourCores = ({
  balance,
  order = ['award', 'boost', 'streak'],
  onUse,
  className,
}: {
  balance: number;
  order?: CoresUse[];
  onUse?: (use: CoresUse) => void;
  className?: string;
}): ReactElement => (
  <section className={classNames('flex w-full flex-col gap-4', className)}>
    <Typography type={TypographyType.Body} bold>
      Use your Cores
    </Typography>
    <ul className="flex flex-col gap-2">
      {order.map((use) => (
        <CoresUseRow
          key={use}
          use={use}
          balance={balance}
          onClick={() => onUse?.(use)}
        />
      ))}
    </ul>
  </section>
);
