import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  BookmarkIcon,
  CoreIcon,
  DiscussIcon,
  EyeIcon,
  ReadingStreakIcon,
  ReputationIcon,
  StarIcon,
  UpvoteIcon,
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

// The badge takes the colour of the action it tracks, not of the claim state,
// so a milestone is recognisable before its title is read.
enum MilestoneAccent {
  Streak = 'streak',
  Upvote = 'upvote',
  Default = 'default',
}

// Tinted fills come from the overlay palette: an alpha modifier on an
// accent token (`/12`) resolves to a bare `var()` and renders transparent.
const accentClasses: Record<MilestoneAccent, string> = {
  [MilestoneAccent.Streak]:
    'border-accent-bacon-default bg-overlay-active-bacon text-accent-bacon-default',
  [MilestoneAccent.Upvote]:
    'border-accent-avocado-default bg-overlay-active-avocado text-accent-avocado-default',
  [MilestoneAccent.Default]:
    'border-accent-cabbage-default bg-overlay-active-cabbage text-accent-cabbage-default',
};

type MilestoneVisual = {
  Icon: ComponentType<IconProps>;
  accent: MilestoneAccent;
  // Some glyphs only get their solid fill from the secondary variant; the
  // outline reads as an empty circle at badge size.
  secondary?: boolean;
};

const eventVisuals: Record<string, MilestoneVisual> = {
  read_post: { Icon: EyeIcon, accent: MilestoneAccent.Default },
  brief_read: { Icon: EyeIcon, accent: MilestoneAccent.Default },
  visit_explore_page: { Icon: EyeIcon, accent: MilestoneAccent.Default },
  post_upvote: { Icon: UpvoteIcon, accent: MilestoneAccent.Upvote },
  comment_upvote: { Icon: UpvoteIcon, accent: MilestoneAccent.Upvote },
  comment_create: { Icon: DiscussIcon, accent: MilestoneAccent.Default },
  hot_take_create: { Icon: DiscussIcon, accent: MilestoneAccent.Default },
  hot_take_vote: { Icon: DiscussIcon, accent: MilestoneAccent.Default },
  visit_discussions_page: {
    Icon: DiscussIcon,
    accent: MilestoneAccent.Default,
  },
  bookmark_post: { Icon: BookmarkIcon, accent: MilestoneAccent.Default },
  visit_read_it_later_page: {
    Icon: BookmarkIcon,
    accent: MilestoneAccent.Default,
  },
};

const fallbackVisual: MilestoneVisual = {
  Icon: StarIcon,
  accent: MilestoneAccent.Default,
  secondary: true,
};

const streakVisual: MilestoneVisual = {
  Icon: ReadingStreakIcon,
  accent: MilestoneAccent.Streak,
  secondary: true,
};

// Streak milestones are named by the server, so match on the event family
// rather than enumerating every `*_streak` variant it may add.
const getMilestoneVisual = (eventType: string): MilestoneVisual => {
  if (eventType.includes('streak')) {
    return streakVisual;
  }

  return eventVisuals[eventType] ?? fallbackVisual;
};

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
    <span className="inline-flex w-3.5 justify-center font-black lowercase leading-none text-accent-avocado-default typo-caption2">
      xp
    </span>
  );
};

const RewardChip = ({ reward }: { reward: QuestReward }): ReactElement => (
  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-8 border border-border-subtlest-tertiary bg-surface-float px-1.5 py-0.5 font-bold tabular-nums text-text-primary typo-caption2">
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
  const { Icon, accent, secondary } = getMilestoneVisual(quest.quest.eventType);
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
        'relative flex items-center gap-3 overflow-hidden rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-3.5',
        quest.locked && 'opacity-64',
      )}
    >
      <span
        className={classNames(
          'flex size-12 shrink-0 items-center justify-center self-start rounded-full border-2',
          accentClasses[accent],
        )}
        aria-hidden
      >
        <Icon size={IconSize.Small} secondary={secondary} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Typography
          tag={TypographyTag.H4}
          type={TypographyType.Footnote}
          bold
          className="line-clamp-2"
        >
          {quest.quest.name}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
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

        {!canClaim && (
          <div className="flex flex-col gap-1">
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
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {value}/{target}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
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
          </div>
        )}
      </div>

      {canClaim && (
        <Button
          variant={ButtonVariant.Primary}
          color={ColorName.Cheese}
          size={ButtonSize.Small}
          className="quest-claim-shine shrink-0"
          disabled={isClaiming}
          loading={isClaiming}
          onClick={() =>
            onClaim(quest.userQuestId!, quest.quest.id, quest.quest.type)
          }
        >
          Claim
        </Button>
      )}

      {isClaimed && (
        <span
          className="pointer-events-none absolute inset-0 z-1 grid place-items-center"
          aria-hidden
        >
          <span className="-rotate-12 rounded-8 border-[3px] border-accent-avocado-default px-2.5 py-0.5 font-black uppercase tracking-[0.16em] text-accent-avocado-default typo-footnote">
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
};

export const MilestoneQuestList = ({
  quests,
  showLevelSystem,
  claimingQuestId,
  onClaim,
}: MilestoneQuestListProps): ReactElement => {
  const ordered = sortMilestoneQuests(quests);

  return (
    <div className="flex flex-col gap-2.5">
      {ordered.map((quest) => (
        <MilestoneQuestCard
          key={quest.rotationId}
          quest={quest}
          showLevelSystem={showLevelSystem}
          isClaiming={claimingQuestId === quest.userQuestId}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
};
