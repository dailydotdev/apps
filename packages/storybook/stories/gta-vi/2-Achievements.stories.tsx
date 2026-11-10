import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { Case, Page } from '../hero-cover/parts';
import {
  AchievementDetail,
  AchievementShelfCard,
} from './production/AchievementShelfCard';
import type { GtaViMoment } from './data';
import {
  getShelf,
  GTA_VI_RELEASE_AT,
  readOnGtaDayAchievement,
  viceCityAchievement,
} from './data';

const meta: Meta = {
  title: 'GTA VI/2. Event achievements',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

/** Game Center's Achievement shelf: its header and grid, as production. */
const Shelf = ({ moment }: { moment: GtaViMoment }): ReactElement => (
  <section className="flex max-w-[86rem] flex-col gap-4 rounded-24 bg-background-subtle p-6">
    <h2 className="font-bold text-text-primary typo-title3">
      Achievement shelf
    </h2>
    <div className="grid grid-cols-3 gap-2 tablet:gap-3 laptop:grid-cols-5">
      {getShelf(moment).map((item) => (
        <AchievementShelfCard
          key={item.achievement.id}
          userAchievement={item}
        />
      ))}
    </div>
  </section>
);

const unlocked = (
  achievement: UserAchievement['achievement'],
): UserAchievement => ({
  achievement,
  progress: 1,
  unlockedAt: GTA_VI_RELEASE_AT,
  createdAt: null,
  updatedAt: null,
});

const DetailFrame = ({
  userAchievement,
}: {
  userAchievement: UserAchievement;
}): ReactElement => (
  <div className="w-[26.25rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2">
    <AchievementDetail userAchievement={userAchievement} />
  </div>
);

const moments: { moment: GtaViMoment; title: string; note: string }[] = [
  {
    moment: 'releaseRead',
    title: 'Nov 19, after a read',
    note: 'Both event achievements lead the shelf. Made It to Vice City is everyone’s, so its chip says Free; the read is the one to earn, so its chip says Rare. Rarity percentages don’t exist on day one, so the chips name the kind instead. Click a card for its detail.',
  },
  {
    moment: 'releaseNotRead',
    title: 'Nov 19, no read yet',
    note: 'Opening daily.dev on release day unlocks Made It to Vice City. Still Read waits, grayed like any locked achievement, and says what to do instead of a 0 / 1 count.',
  },
  {
    moment: 'afterMissed',
    title: 'Nov 20 on, the day missed',
    note: 'Release day is gone, so Still Read can’t be earned and leaves the shelf. Made It to Vice City stays.',
  },
  {
    moment: 'before',
    title: 'Before Nov 19',
    note: 'Nothing on the shelf: the achievements are a surprise on the day. The streak calendar’s VI day is the teaser.',
  },
];

export const EventAchievements: StoryObj = {
  name: '2. Event achievements',
  render: () => (
    <div id="__next">
      <Page
        chapter="GTA VI · 2"
        question="How do we mark the day for the readers who were there?"
        title="Event achievements"
        goal="Two achievements dated to release day: Made It to Vice City for everyone who opens daily.dev that day, and Still Read on GTA VI Day for those who also read a post."
        metric="Release-day reads against a normal Thursday, and shelf opens that week."
      >
        <Case
          title="The detail"
          note="What a card opens: production’s detail modal, with the event chip and the full date beside a calendar."
        >
          <div className="flex flex-wrap items-start gap-10">
            <DetailFrame userAchievement={unlocked(viceCityAchievement)} />
            <DetailFrame userAchievement={unlocked(readOnGtaDayAchievement)} />
          </div>
        </Case>

        {moments.map(({ moment, title, note }) => (
          <Case key={moment} title={title} note={note}>
            <Shelf moment={moment} />
          </Case>
        ))}
      </Page>
    </div>
  ),
};
