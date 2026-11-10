import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { AchievementShelfCard } from './AchievementShelfCard';
import type { GtaViMoment } from '../data';
import {
  getShelf,
  GTA_VI_RELEASE_AT,
  readOnGtaDayAchievement,
  viceCityAchievement,
} from '../data';

/*
 * Game Center's Achievement shelf (webapp/pages/game-center), its three
 * branches as production has them: placeholders while pending, the cards,
 * or EmptyStateCard. Extra states stress the GTA VI cards: long copy and an
 * image that fails to load (LazyImage falls back to the default art).
 */

export type ShelfState =
  | GtaViMoment
  | 'loading'
  | 'empty'
  | 'longText'
  | 'brokenImage';

const unlocked = (
  achievement: UserAchievement['achievement'],
): UserAchievement => ({
  achievement,
  progress: 1,
  unlockedAt: GTA_VI_RELEASE_AT,
  createdAt: null,
  updatedAt: null,
});

const stressShelf = (state: 'longText' | 'brokenImage'): UserAchievement[] => {
  const rest = getShelf('releaseRead').slice(2);
  if (state === 'brokenImage') {
    return [
      unlocked({ ...viceCityAchievement, image: '/missing/vice-city.webp' }),
      unlocked({
        ...readOnGtaDayAchievement,
        image: '/missing/still-read.webp',
      }),
      ...rest,
    ];
  }
  return [
    unlocked({
      ...viceCityAchievement,
      name: 'Made It to Vice City Before Everyone Else in the Group Chat',
      description:
        'You survived the wait, the delays, the trailers and every rumor. Now go make some memories.',
    }),
    unlocked({
      ...readOnGtaDayAchievement,
      name: 'Still Read on GTA VI Day While the Download Crawled Along',
    }),
    ...rest,
  ];
};

/** The empty card, copied from the game-center page. */
const EmptyStateCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => (
  <div className="rounded-16 border border-dashed border-border-subtlest-tertiary bg-background-subtle p-5">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography
      type={TypographyType.Subhead}
      color={TypographyColor.Tertiary}
      className="mt-1"
    >
      {description}
    </Typography>
  </div>
);

export const Shelf = ({
  state,
  openFirst = false,
}: {
  state: ShelfState;
  /** Opens Still Read's detail, for device frames. */
  openFirst?: boolean;
}): ReactElement => {
  let content: ReactElement;

  if (state === 'loading') {
    content = (
      <div
        aria-busy
        className="grid grid-cols-3 gap-2 tablet:gap-3 laptop:grid-cols-5"
      >
        {[0, 1, 2, 3, 4].map((placeholder) => (
          <ElementPlaceholder
            key={placeholder}
            className="h-[10.5rem] rounded-16 tablet:h-[17rem]"
          />
        ))}
      </div>
    );
  } else if (state === 'empty') {
    content = (
      <EmptyStateCard
        title="No achievements to surface yet"
        description="Once your profile achievements load, this section will highlight your rarest and closest milestones."
      />
    );
  } else {
    const items =
      state === 'longText' || state === 'brokenImage'
        ? stressShelf(state)
        : getShelf(state);
    content = (
      <div className="grid grid-cols-3 gap-2 tablet:gap-3 laptop:grid-cols-5">
        {items.map((item, index) => (
          <AchievementShelfCard
            key={item.achievement.id}
            userAchievement={item}
            initialExpanded={openFirst && index === 1}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <h2 className="font-bold text-text-primary typo-title3">
        Achievement shelf
      </h2>
      {content}
    </section>
  );
};
