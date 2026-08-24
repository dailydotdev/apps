import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  CoreIcon,
  ReputationIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  getQuestStatusLabel,
  getVisibleQuestRewards,
} from '@dailydotdev/shared/src/components/quest/QuestCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ColorName } from '@dailydotdev/shared/src/styles/colors';
import type {
  QuestReward,
  QuestType,
  UserQuest,
} from '@dailydotdev/shared/src/graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
} from '@dailydotdev/shared/src/graphql/quests';
import { sortMilestoneQuests } from '../../lib/gameCenter';

// Only the glyph carries the reward's colour — the amount inherits the text
// token so the chip stays legible on the light surface too.
const RewardChipIcon = ({ type }: { type: QuestRewardType }): ReactElement => {
  if (type === QuestRewardType.Cores) {
    return (
      <CoreIcon size={IconSize.XSmall} className="text-accent-cheese-default" />
    );
  }

  if (type === QuestRewardType.Reputation) {
    return (
      <ReputationIcon
        size={IconSize.XSmall}
        className="text-accent-onion-default"
      />
    );
  }

  return (
    <span className="inline-flex w-3.5 justify-center font-black lowercase leading-none text-accent-avocado-default typo-subhead">
      xp
    </span>
  );
};

const RewardChip = ({ reward }: { reward: QuestReward }): ReactElement => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-8 border border-border-subtlest-tertiary bg-surface-float px-1.5 py-0.5 font-bold tabular-nums text-text-primary typo-subhead">
    <RewardChipIcon type={reward.type} />+{reward.amount.toLocaleString()}
  </span>
);

type MilestoneQuestCardProps = {
  quest: UserQuest;
  showLevelSystem: boolean;
  isClaiming: boolean;
  onClaim: (userQuestId: string, questId: string, questType: QuestType) => void;
};

const MilestoneQuestCard = ({
  quest,
  showLevelSystem,
  isClaiming,
  onClaim,
}: MilestoneQuestCardProps): ReactElement => {
  const target = Math.max(quest.quest.targetCount, 1);
  const value = Math.min(Math.max(quest.progress, 0), target);
  const percentage = Math.min(100, Math.round((value / target) * 100));
  const isClaimed = quest.status === QuestStatus.Claimed;
  const canClaim = quest.claimable && !!quest.userQuestId && !isClaimed;
  const visibleRewards = getVisibleQuestRewards(quest.rewards, showLevelSystem);
  const statusLabel = getQuestStatusLabel(quest);

  return (
    <article
      className={classNames(
        'relative flex w-60 shrink-0 flex-col gap-2 overflow-hidden rounded-14 border border-border-subtlest-tertiary p-4',
        // Only a claimable milestone gets a filled surface, so the ones you
        // can act on read forward of the ones you cannot.
        canClaim && 'bg-background-subtle',
        quest.locked && 'opacity-64',
      )}
    >
      <Typography
        tag={TypographyTag.H4}
        type={TypographyType.Subhead}
        bold
        className="line-clamp-2"
      >
        {quest.quest.name}
      </Typography>
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
        className="line-clamp-2"
      >
        {quest.quest.description}
      </Typography>

      {visibleRewards.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleRewards.map((reward, index) => (
            <RewardChip
              key={`${quest.rotationId}-${reward.type}-${index.toString()}`}
              reward={reward}
            />
          ))}
        </div>
      )}

      {/* Pushes the claim button and progress bar to a shared baseline so
          neighbouring cards in the scroller line up. */}
      <div className="mt-auto flex flex-col gap-1 pt-1">
        {canClaim ? (
          <Button
            variant={ButtonVariant.Primary}
            color={ColorName.Cheese}
            size={ButtonSize.Medium}
            className="quest-claim-shine w-full"
            disabled={isClaiming}
            loading={isClaiming}
            onClick={() =>
              onClaim(quest.userQuestId!, quest.quest.id, quest.quest.type)
            }
          >
            Claim
          </Button>
        ) : (
          <>
            <ProgressBar
              percentage={percentage}
              shouldShowBg
              className={{
                wrapper: 'h-1.5 rounded-14',
                bar: 'h-full rounded-14',
                barColor: classNames(
                  isClaimed && 'bg-accent-avocado-default',
                  !isClaimed && quest.locked && 'bg-accent-cabbage-bolder',
                  !isClaimed && !quest.locked && 'bg-accent-cabbage-default',
                ),
              }}
            />
            <div className="flex items-center justify-between gap-2">
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {value}/{target}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                color={
                  isClaimed
                    ? TypographyColor.StatusSuccess
                    : TypographyColor.Secondary
                }
                bold={isClaimed}
              >
                {statusLabel}
              </Typography>
            </div>
          </>
        )}
      </div>

      {isClaimed && (
        <span
          className="pointer-events-none absolute inset-0 z-1 grid place-items-center"
          aria-hidden
        >
          <span className="-rotate-12 rounded-8 border-[3px] border-accent-avocado-default px-2.5 py-0.5 font-black uppercase tracking-[0.16em] text-accent-avocado-default typo-subhead">
            Claimed
          </span>
        </span>
      )}
    </article>
  );
};

type MilestoneQuestListProps = {
  quests: UserQuest[];
  showLevelSystem: boolean;
  claimingQuestId?: string;
  onClaim: (userQuestId: string, questId: string, questType: QuestType) => void;
  /** Trails the quests, so sponsored cards never sit ahead of earned ones. */
  trailing?: ReactNode;
};

export const MilestoneQuestList = ({
  quests,
  showLevelSystem,
  claimingQuestId,
  onClaim,
  trailing,
}: MilestoneQuestListProps): ReactElement => {
  const ordered = sortMilestoneQuests(quests);

  return (
    <div className="-mx-4 flex items-stretch gap-3 overflow-x-auto px-4 pb-2 laptop:mx-0 laptop:px-0">
      {ordered.map((quest) => (
        <MilestoneQuestCard
          key={quest.rotationId}
          quest={quest}
          showLevelSystem={showLevelSystem}
          isClaiming={claimingQuestId === quest.userQuestId}
          onClaim={onClaim}
        />
      ))}
      {trailing}
    </div>
  );
};
