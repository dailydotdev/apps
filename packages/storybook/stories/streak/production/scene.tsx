import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { subDays } from 'date-fns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  streakFreezeProductsQueryOptions,
  userStreakFreezeDatesQueryOptions,
} from '@dailydotdev/shared/src/graphql/streakFreeze';
import type {
  QuestDashboard,
  UserQuest,
} from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import type { UserStreak } from '@dailydotdev/shared/src/graphql/users';
import { DayOfWeek } from '@dailydotdev/shared/src/lib/date';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import { GtaViPinOpenContext, gtaViFreezeDayFeature } from '../gtaViParts';

/*
 * Production's own providers (BootDataProvider: auth, settings, logging,
 * alerts) around a query cache seeded with a reader's streak, history,
 * freezes and quests, so the real streak components render as they do for a
 * logged-in reader. "Today" comes from installClock in the story's
 * beforeEach, since production reads new Date() throughout.
 */

export const timezone = 'Europe/Helsinki';

const user = { ...defaultUser, timezone };

/** Freezes the page's clock at noon on a day; returns the restore. */
export const installClock = (isoDay: string): (() => void) => {
  const RealDate = Date;
  const offset = new RealDate(`${isoDay}T12:00:00`).getTime() - RealDate.now();

  class StoryDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(RealDate.now() + offset);
      } else {
        // @ts-expect-error forwards Date's own overloads
        super(...args);
      }
    }

    static now(): number {
      return RealDate.now() + offset;
    }
  }

  globalThis.Date = StoryDate as DateConstructor;
  return () => {
    globalThis.Date = RealDate;
  };
};

const readerBoot = () => ({
  ...defaultBootData,
  user,
  settings: {
    ...defaultBootData.settings,
    theme: 'darcula',
    optOutReadingStreak: false,
  },
});

/**
 * Boots as a logged-in reader with streaks on. Call from beforeEach, so
 * Storybook's mock restore undoes it before the next story.
 */
export const bootAsStreakReader = (): void => {
  getBootMock.mockReturnValue({
    ...readerBoot(),
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });
};

const makeQuest = (
  id: string,
  name: string,
  description: string,
  progress: number,
  targetCount: number,
  type: QuestType,
  xp: number,
): UserQuest =>
  ({
    userQuestId: id,
    rotationId: `rotation-${id}`,
    progress,
    status: QuestStatus.InProgress,
    completedAt: null,
    claimedAt: null,
    locked: false,
    claimable: false,
    rewards: [{ type: QuestRewardType.Xp, amount: xp }],
    quest: { id, name, description, type, eventType: id, targetCount },
  }) as UserQuest;

const questDashboard = {
  level: { level: 7, totalXp: 2400, xpInLevel: 180, xpToNextLevel: 400 },
  currentStreak: 2,
  longestStreak: 31,
  daily: {
    regular: [
      makeQuest(
        'share-squad',
        'Hey, Check This Out...',
        'Share 1 post to another squad',
        0,
        1,
        QuestType.Daily,
        25,
      ),
      makeQuest(
        'post-link',
        'Link drop',
        'Post a link',
        0,
        1,
        QuestType.Daily,
        25,
      ),
      makeQuest(
        'bookmark',
        "I'll Get to It Any Day Now...",
        'Bookmark 3 posts',
        0,
        3,
        QuestType.Daily,
        10,
      ),
    ],
    plus: [],
  },
  weekly: {
    regular: [
      makeQuest(
        'follow',
        'Mutuals Any% Speedrun',
        'Follow 5 users',
        0,
        5,
        QuestType.Weekly,
        80,
      ),
    ],
    plus: [],
  },
  milestone: [],
  intro: [],
} as unknown as QuestDashboard;

interface ProductionSceneProps {
  /** Days before today (0 is today) the reader read. */
  reads?: number[];
  /** gta_vi_freeze_day; off is production as it is today. */
  isEnabled?: boolean;
  /** Pins every GTA VI tooltip open. */
  pinOpen?: boolean;
  children: ReactNode;
}

export const ProductionScene = ({
  reads = [4, 1, 0],
  isEnabled = true,
  pinOpen = false,
  children,
}: ProductionSceneProps): ReactElement => {
  const [client] = useState(() => {
    const today = new Date();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    const streak: UserStreak = {
      current: 2,
      max: 31,
      total: 759,
      weekStart: DayOfWeek.Monday,
      lastViewAt: subDays(today, Math.min(...reads, 99)),
      freezesAvailable: 0,
    };
    queryClient.setQueryData(
      generateQueryKey(RequestKey.UserStreak, user),
      streak,
    );
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ReadingStreak30Days, user),
      reads.map((offset) => ({
        date: subDays(today, offset).toISOString(),
        reads: 1,
      })),
    );
    queryClient.setQueryData(
      userStreakFreezeDatesQueryOptions({ user }).queryKey,
      [],
    );
    queryClient.setQueryData(streakFreezeProductsQueryOptions().queryKey, []);
    queryClient.setQueryData(
      generateQueryKey(RequestKey.QuestDashboard, user),
      questDashboard,
    );
    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock(readerBoot())}
      >
        <ActiveFeedContext.Provider value={{ items: [], queryKey: [] }}>
          <FeatureOverrides values={{ [gtaViFreezeDayFeature.id]: isEnabled }}>
            <GtaViPinOpenContext.Provider value={pinOpen}>
              {children}
            </GtaViPinOpenContext.Provider>
          </FeatureOverrides>
        </ActiveFeedContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

export { user as productionUser };
