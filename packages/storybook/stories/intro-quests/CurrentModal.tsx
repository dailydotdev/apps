import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TourIcon } from '@dailydotdev/shared/src/components/icons';
import { QuestCard } from '@dailydotdev/shared/src/components/quest/QuestCard';
import type { UserQuest } from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  QuestType,
} from '@dailydotdev/shared/src/graphql/quests';
import { introQuests } from './data';
import { PopupShell } from './kit';
import type { Phase } from './sim';
import { useSim } from './sim';

// Today's IntroQuestModal, rebuilt from the real QuestCard so the comparison is
// honest. Only the data is mocked. The hints are the production strings from
// getIntroRequirementHint.

const statusByPhase: Record<Phase, QuestStatus> = {
  todo: QuestStatus.InProgress,
  working: QuestStatus.InProgress,
  ready: QuestStatus.Completed,
  claimed: QuestStatus.Claimed,
};

const hintByEvent: Record<string, string> = {
  notifications_enable:
    'Needs browser push permission — the email and in-app toggles do not count.',
  profile_complete: 'Add Headline, Work experience and Education.',
};

const hasDestination = new Set([
  'extension_install',
  'notifications_enable',
  'brief_generate',
  'profile_complete',
  'api_token_create',
  'api_profile_fetch',
]);

export const CurrentModal = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const { phaseOf } = useSim();
  const [queryClient] = useState(() => new QueryClient());
  const quests: UserQuest[] = introQuests.map((quest, index) => {
    const phase = phaseOf(quest.id);

    return {
      userQuestId: `uq-${quest.id}`,
      rotationId: `rot-${quest.id}`,
      progress: phase === 'ready' || phase === 'claimed' ? 1 : 0,
      status: statusByPhase[phase],
      completedAt: null,
      claimedAt: null,
      locked: false,
      claimable: phase === 'ready',
      quest: {
        id: `q-${index}`,
        name: quest.name,
        description: quest.description,
        type: QuestType.Intro,
        eventType: quest.eventType,
        targetCount: 1,
      },
      rewards: [
        { type: QuestRewardType.Xp, amount: quest.xp },
        { type: QuestRewardType.Cores, amount: quest.cores },
      ],
    };
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PopupShell device={device} width="35rem" bodyClassName="gap-4 p-6">
        <div className="flex items-start gap-3 border-b border-border-subtlest-tertiary pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
            <TourIcon />
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <h1 className="font-bold text-text-primary typo-title3">
              Intro quests
            </h1>
            <p className="mt-1 text-text-tertiary typo-callout">
              Get the most out of daily.dev with these quick wins.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {quests.map((userQuest, index) => (
            <QuestCard
              key={userQuest.rotationId}
              quest={userQuest}
              onClaim={() => undefined}
              destination={
                hasDestination.has(userQuest.quest.eventType)
                  ? { label: 'Settings', path: '/settings' }
                  : null
              }
              onDestinationClick={() => undefined}
              showLevelSystem
              isClaiming={false}
              isClaimAnimating={false}
              showClaimedStamp={false}
              animateClaimedStamp={false}
              suppressPersistedClaimedStamp={false}
              eyebrow={`Step ${(index + 1).toString().padStart(2, '0')}`}
              hint={
                userQuest.status === QuestStatus.InProgress
                  ? hintByEvent[userQuest.quest.eventType]
                  : undefined
              }
              showLockIcon={false}
            />
          ))}
        </div>
        <div className="flex justify-center border-t border-border-subtlest-tertiary pt-2">
          <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
            Don&apos;t show me this again
          </Button>
        </div>
      </PopupShell>
    </QueryClientProvider>
  );
};
