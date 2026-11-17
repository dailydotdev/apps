import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { CoreIcon } from '../icons/Core';
import { BoostIcon } from '../icons/Boost';
import { ReadingStreakIcon } from '../icons/ReadingStreak';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { formatCoresCurrency } from '../../lib/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { useFeaturesReadyContext } from '../GrowthBookProvider';
import { gqlClient } from '../../graphql/common';
import type { UserStreakRecoverData } from '../../graphql/users';
import { USER_STREAK_RECOVER_QUERY } from '../../graphql/users';
import { getProductsQueryOptions, ProductType } from '../../graphql/njord';
import { streakFreezeProductsQueryOptions } from '../../graphql/streakFreeze';
import { generateQueryKey, RequestKey } from '../../lib/query';
import {
  boostSettingsFeature,
  featureStreakFreeze,
} from '../../lib/featureManagement';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';

export type CoresUse = 'award' | 'boost' | 'streak';

interface CoresUseCopy {
  title: string;
  description: string;
  /** The starting price, unless `isExact` */
  from?: number;
  isExact?: boolean;
}

const isDefined = (
  definition?: CoresUseDefinition,
): definition is CoresUseDefinition => !!definition;

const tints: Record<CoresUse, string> = {
  award: 'bg-overlay-float-cabbage',
  boost: 'bg-overlay-float-blueCheese',
  streak: 'bg-overlay-float-bacon',
};

const useAwardImages = (): { images: string[]; from?: number } => {
  const { data } = useQuery(getProductsQueryOptions());

  return useMemo(() => {
    const awards = (data?.edges ?? [])
      .map(({ node }) => node)
      .filter(({ type }) => type === ProductType.Award);
    const prices = awards.map(({ value }) => value).filter((value) => value);

    return {
      images: awards.map(({ image }) => image).filter(Boolean),
      from: prices.length ? Math.min(...prices) : undefined,
    };
  }, [data]);
};

/** Every award image in turn; the first alone on reduced motion */
const AwardsCycle = ({ images }: { images: string[] }): ReactElement => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (
      images.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const interval = setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      1200,
    );

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <span className="relative size-7">
      {images.map((image, position) => (
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

const PriceChip = ({
  from,
  isExact,
}: Pick<CoresUseCopy, 'from' | 'isExact'>): ReactElement => (
  <span className="flex shrink-0 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-2 py-1 typo-caption1">
    {from === undefined ? (
      <span className="text-text-tertiary">Varies</span>
    ) : (
      <>
        {!isExact && <span className="text-text-tertiary">From</span>}
        <CoreIcon size={IconSize.Size16} />
        <strong className="tabular-nums">{formatCoresCurrency(from)}</strong>
      </>
    )}
  </span>
);

const UseIcon = ({
  use,
  icon,
  className,
}: {
  use: CoresUse;
  icon: ReactNode;
  className: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-12',
      tints[use],
      className,
    )}
  >
    {icon}
  </span>
);

interface CoresUseDefinition extends CoresUseCopy {
  use: CoresUse;
  icon: ReactNode;
}

/** Same key and shape as `useStreakRecover`, so both read one answer */
const useStreakRecoverState = (
  isEnabled: boolean,
): UserStreakRecoverData | undefined => {
  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: () =>
      gqlClient.request<{ streakRecover: UserStreakRecoverData }>(
        USER_STREAK_RECOVER_QUERY,
      ),
    enabled: isEnabled,
  });

  return data?.streakRecover;
};

/** What the viewer can spend Cores on, with today's prices */
const useCoresUses = ({
  withStreakState,
}: {
  /** Pitch restoring a streak that just broke, when there is one */
  withStreakState: boolean;
}): Record<CoresUse, CoresUseDefinition | undefined> => {
  const { user } = useAuthContext();
  const hasCoresAccess = useHasAccessToCores();
  const { isStreaksEnabled } = useReadingStreak();
  const { getFeatureValue } = useFeaturesReadyContext();
  const awards = useAwardImages();
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: hasCoresAccess && isStreaksEnabled,
  });
  const { data: freezes } = useQuery({
    ...streakFreezeProductsQueryOptions(),
    enabled: isStreakFreezeEnabled,
  });
  const recover = useStreakRecoverState(
    withStreakState && !!user && isStreaksEnabled,
  );
  const freezePrices = (freezes ?? []).map(({ value }) => value);

  const streak = ((): CoresUseDefinition | undefined => {
    const icon = (
      <ReadingStreakIcon
        secondary
        size={IconSize.Small}
        className="text-accent-bacon-default"
      />
    );

    if (!isStreaksEnabled) {
      return undefined;
    }

    if (recover?.canRecover) {
      return {
        use: 'streak',
        icon,
        title: `Restore your ${recover.oldStreakLength}-day streak`,
        description: 'It broke yesterday. Bring it back before it’s gone',
        from: recover.cost,
        isExact: true,
      };
    }

    if (isStreakFreezeEnabled) {
      return {
        use: 'streak',
        icon,
        title: 'Protect your streak',
        description: 'Streak freezes cover the days you miss reading',
        from: freezePrices.length ? Math.min(...freezePrices) : undefined,
      };
    }

    return {
      use: 'streak',
      icon,
      title: 'Restore a lost streak',
      description: 'Bring back a streak the day after it breaks',
    };
  })();

  return {
    award: {
      use: 'award',
      icon: <AwardsCycle images={awards.images} />,
      title: 'Give an award',
      description: 'Thank a creator for a post or a comment',
      from: awards.from,
    },
    boost: {
      use: 'boost',
      icon: (
        <BoostIcon
          size={IconSize.Small}
          className="text-accent-blueCheese-default"
        />
      ),
      title: 'Boost your post',
      description: 'Show your post to more developers',
      from: getFeatureValue(boostSettingsFeature)?.min,
    },
    streak,
  };
};

const CoresUseTile = ({
  definition,
}: {
  definition: CoresUseDefinition;
}): ReactElement => (
  <li className="flex w-56 shrink-0 snap-start flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
    <span className="flex w-full items-center gap-2">
      <UseIcon use={definition.use} icon={definition.icon} className="size-8" />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        className="min-w-0 flex-1"
        bold
      >
        {definition.title}
      </Typography>
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {definition.description}
    </Typography>
    <span className="mt-auto flex pt-1">
      <PriceChip from={definition.from} isExact={definition.isExact} />
    </span>
  </li>
);

/** The wallet's "Use your Cores": what Cores are for, nothing to tap */
export const UseYourCoresTiles = (): ReactElement => {
  const uses = useCoresUses({ withStreakState: true });
  const tiles = [uses.award, uses.streak].filter(isDefined);

  return (
    <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 tablet:-mx-6 tablet:scroll-px-6 tablet:px-6 laptop:mx-0 laptop:gap-3 laptop:overflow-visible laptop:px-0">
      {tiles.map((definition) => (
        <CoresUseTile key={definition.use} definition={definition} />
      ))}
    </ul>
  );
};

/** Each use as a row that describes it, with its price */
export const CoresUseRows = ({
  order,
}: {
  order: CoresUse[];
}): ReactElement => {
  const uses = useCoresUses({ withStreakState: false });

  return (
    <ul className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
      {order
        .map((use) => uses[use])
        .filter(isDefined)
        .map((definition) => (
          <li
            key={definition.use}
            className="flex w-full items-center gap-4 py-3 text-left"
          >
            <UseIcon
              use={definition.use}
              icon={definition.icon}
              className="size-10"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Subhead}
                bold
              >
                {definition.title}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {definition.description}
              </Typography>
            </span>
            <PriceChip from={definition.from} isExact={definition.isExact} />
          </li>
        ))}
    </ul>
  );
};
