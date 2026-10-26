import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { CompactQuestRow } from '@dailydotdev/shared/src/components/quest/CompactQuestList';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * The intro quests a new reader gets, as a widget instead of a modal: the
 * production QuestType.Intro quests and their CompactQuestRow, so claiming
 * works exactly as it does today. The widget retires itself once every
 * quest is claimed.
 */

const intro = (
  id: string,
  name: string,
  description: string,
  eventType: string,
  status: QuestStatus,
  cores = 5,
): UserQuest =>
  ({
    userQuestId: id,
    rotationId: 'intro',
    progress: status === QuestStatus.InProgress ? 0 : 1,
    status,
    completedAt: null,
    claimedAt: status === QuestStatus.Claimed ? new Date().toISOString() : null,
    locked: false,
    claimable: status === QuestStatus.Completed,
    rewards: [
      { type: QuestRewardType.Xp, amount: 10 },
      { type: QuestRewardType.Cores, amount: cores },
    ],
    quest: {
      id,
      name,
      description,
      type: QuestType.Intro,
      eventType,
      targetCount: 1,
    },
  } as UserQuest);

const all: [string, string, string, string][] = [
  [
    'q-ext',
    'Install the browser extension',
    'Your feed on every new tab',
    'extension_install',
  ],
  [
    'q-notif',
    'Turn on notifications',
    'Hear back when someone replies',
    'notifications_enable',
  ],
  [
    'q-brief',
    'Generate your first brief',
    'Your last 24 hours, summarized',
    'brief_generate',
  ],
  [
    'q-profile',
    'Complete your profile',
    'Add a photo and what you work on',
    'profile_complete',
  ],
  [
    'q-token',
    'Create an API token',
    'Use daily.dev from your tools',
    'api_token_create',
  ],
];

export type IntroStage = 'fresh' | 'progress' | 'claimable' | 'done';

const statusesFor: Record<IntroStage, QuestStatus[]> = {
  fresh: Array(5).fill(QuestStatus.InProgress),
  progress: [
    QuestStatus.Claimed,
    QuestStatus.Claimed,
    QuestStatus.InProgress,
    QuestStatus.InProgress,
    QuestStatus.InProgress,
  ],
  claimable: [
    QuestStatus.Claimed,
    QuestStatus.Claimed,
    QuestStatus.Completed,
    QuestStatus.InProgress,
    QuestStatus.InProgress,
  ],
  done: Array(5).fill(QuestStatus.Claimed),
};

export const introQuests = (stage: IntroStage): UserQuest[] =>
  all.map(([id, name, description, eventType], i) =>
    intro(
      id,
      name,
      description,
      eventType,
      statusesFor[stage][i],
      i === 4 ? 20 : 5,
    ),
  );

const Ring = ({
  done,
  total,
}: {
  done: number;
  total: number;
}): ReactElement => {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex size-14 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 52 52"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="5"
          className="stroke-surface-float"
        />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-accent-cheese-default transition-[stroke-dashoffset] duration-500"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done / total)}
        />
      </svg>
      <span className="font-bold tabular-nums text-text-primary typo-callout">
        {done}/{total}
      </span>
    </span>
  );
};

export const IntroQuestsWidget = ({
  size,
  stage = 'progress',
}: {
  size: WidgetSize;
  stage?: IntroStage;
}): ReactElement => {
  const [quests, setQuests] = useState(() => introQuests(stage));
  const claim = (quest: UserQuest) =>
    setQuests((current) =>
      current.map((q) =>
        q.userQuestId === quest.userQuestId
          ? ({
              ...q,
              status: QuestStatus.Claimed,
              claimable: false,
              claimedAt: new Date(),
            } as UserQuest)
          : q,
      ),
    );
  const done = quests.filter((q) => q.status === QuestStatus.Claimed).length;
  const isDone = done === quests.length;
  const cores = quests
    .filter((q) => q.status !== QuestStatus.Claimed)
    .reduce(
      (sum, q) =>
        sum +
        (q.rewards.find((r) => r.type === QuestRewardType.Cores)?.amount ?? 0),
      0,
    );
  const next = quests.find((q) => q.status !== QuestStatus.Claimed);

  if (isDone) {
    return (
      <Stack>
        <WidgetLabel kind="introquests" />
        <div className="m-auto flex flex-col items-center gap-2 text-center">
          <Ring done={done} total={quests.length} />
          <span className="font-bold text-text-primary typo-callout">
            You’re all set.
          </span>
          <span className="text-text-tertiary typo-footnote">
            This widget makes room for another one tomorrow.
          </span>
        </div>
      </Stack>
    );
  }

  const header = (
    <div className="mt-3 flex items-center gap-3">
      <Ring done={done} total={quests.length} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-callout">
          Get the most out of daily.dev
        </span>
        <span className="text-text-tertiary typo-footnote">
          {cores} Cores left to earn
        </span>
      </span>
    </div>
  );

  if (size === 's') {
    return (
      <Stack>
        <WidgetLabel kind="introquests" link="View all" />
        {header}
        {next && (
          <div className="-mx-2 mt-auto">
            <CompactQuestRow quest={next} isClaiming={false} onClaim={claim} />
          </div>
        )}
      </Stack>
    );
  }

  return (
    <Stack>
      <WidgetLabel kind="introquests" />
      {header}
      <Scroll
        isUnderHeader={false}
        className={classNames(
          '-mx-2',
          size === 'l' && '[&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-x-4',
        )}
      >
        <div className="flex flex-col">
          {quests.map((quest) => (
            <CompactQuestRow
              key={quest.userQuestId}
              quest={quest}
              isClaiming={false}
              onClaim={claim}
            />
          ))}
        </div>
      </Scroll>
    </Stack>
  );
};
