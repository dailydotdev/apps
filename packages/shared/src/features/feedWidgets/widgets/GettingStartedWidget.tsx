import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { useQuestDashboard } from '../../../hooks/useQuestDashboard';
import { useClaimQuestReward } from '../../../hooks/useClaimQuestReward';
import type { UserQuest } from '../../../graphql/quests';
import {
  QuestRewardType,
  QuestStatus,
  isQuestClaimed,
} from '../../../graphql/quests';
import type { QuestDestination } from '../../../components/quest/QuestCard';
import {
  getIntroQuestDestination,
  getQuestDestinationUrl,
} from '../../../components/quest/questDestinations';
import { getCurrentBrowserName } from '../../../lib/func';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { IconSize } from '../../../components/Icon';
import { FlagIcon } from '../../../components/icons/Flag';
import { VIcon } from '../../../components/icons/V';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// Rewards, the avocado of the intro quests popup, kept low so the steps lead.
const questStyle: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--theme-accent-avocado-default) 16%, transparent) 0%, transparent 70%)',
};

type IntroQuestCopy = {
  pitch: string;
  cta: string;
  doneLabel: string;
  duration: string;
};

// The intro quests popup redesign's copy (#7049), by the quest's event type.
const introQuestCopy: Record<string, IntroQuestCopy> = {
  extension_install: {
    pitch: 'Every new tab becomes your feed. One click, free.',
    cta: 'Install the extension',
    doneLabel: 'Extension installed',
    duration: '10 sec',
  },
  notifications_enable: {
    pitch: 'Replies, mentions and your streak. Nothing else.',
    cta: 'Turn on',
    doneLabel: 'Notifications on',
    duration: '5 sec',
  },
  brief_generate: {
    pitch: 'Your AI agent reads the day for you. The first one is free.',
    cta: 'Generate for free',
    doneLabel: 'Brief ready',
    duration: '1 min',
  },
  profile_complete: {
    pitch: 'Five details so other developers know who they are talking to.',
    cta: 'Finish profile',
    doneLabel: 'Profile complete',
    duration: '2 min',
  },
  api_token_create: {
    pitch: 'Plug your feed into scripts, agents and your terminal.',
    cta: 'Create key',
    doneLabel: 'Key created',
    duration: '10 sec',
  },
  api_profile_fetch: {
    pitch: 'Paste one command in your terminal. We will spot the call.',
    cta: 'Open API settings',
    doneLabel: 'First call received',
    duration: '30 sec',
  },
};

type Phase = 'todo' | 'done' | 'claimable' | 'claimed';

type IntroStep = {
  quest: UserQuest;
  phase: Phase;
  pitch: string;
  cta: string;
  doneLabel: string;
  duration?: string;
  xp: number;
  cores: number;
  destination: QuestDestination | null;
};

const rewardAmount = (quest: UserQuest, type: QuestRewardType): number =>
  quest.rewards
    .filter((reward) => reward.type === type)
    .reduce((sum, reward) => sum + reward.amount, 0);

const questPhase = (quest: UserQuest): Phase => {
  if (isQuestClaimed(quest)) {
    return 'claimed';
  }
  if (quest.claimable && !!quest.userQuestId) {
    return 'claimable';
  }
  return quest.status === QuestStatus.Completed ? 'done' : 'todo';
};

const toStep = (
  quest: UserQuest,
  destination: QuestDestination | null,
): IntroStep => {
  const copy = introQuestCopy[quest.quest.eventType];

  return {
    quest,
    phase: questPhase(quest),
    pitch: copy?.pitch ?? quest.quest.description,
    cta: copy?.cta ?? destination?.label ?? 'Get started',
    doneLabel: copy?.doneLabel ?? quest.quest.name,
    duration: copy?.duration,
    xp: rewardAmount(quest, QuestRewardType.Xp),
    cores: rewardAmount(quest, QuestRewardType.Cores),
    destination,
  };
};

const formatRewards = (xp: number, cores: number): string =>
  cores > 0 ? `${xp} XP and ${cores} Cores` : `${xp} XP`;

const StepCircle = ({ phase }: { phase: Phase }): ReactElement => {
  const isDone = phase !== 'todo';

  return (
    <span
      className={classNames(
        'flex size-5 shrink-0 items-center justify-center rounded-max',
        isDone
          ? 'bg-accent-avocado-default text-white'
          : 'border-2 border-dashed border-border-subtlest-secondary',
      )}
    >
      {isDone && (
        <VIcon
          secondary
          size={IconSize.XXSmall}
          className="animate-raise-hand-pop motion-reduce:animate-none"
        />
      )}
    </span>
  );
};

/** One segment per quest: claimed is avocado, claimable a lighter avocado. */
const StepMeter = ({
  steps,
  isCompact,
}: {
  steps: IntroStep[];
  isCompact?: boolean;
}): ReactElement => {
  const claimed = steps.filter(({ phase }) => phase === 'claimed').length;

  return (
    <div
      role="meter"
      aria-label="Setup progress"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={claimed}
      className={classNames('flex', isCompact ? 'gap-0.5' : 'gap-1')}
    >
      {steps.map(({ quest, phase }) => (
        <span
          key={quest.rotationId}
          className={classNames(
            'rounded-max transition-colors duration-300 motion-reduce:transition-none',
            isCompact ? 'h-1 w-2.5' : 'h-1.5 flex-1',
            phase === 'claimed' && 'bg-accent-avocado-default',
            phase === 'claimable' && 'bg-accent-avocado-subtler',
            (phase === 'todo' || phase === 'done') && 'bg-surface-float',
          )}
        />
      ))}
    </div>
  );
};

const StepRewards = ({ step }: { step: IntroStep }): ReactElement => (
  <span className="inline-flex flex-wrap items-center gap-1.5 tabular-nums text-text-tertiary typo-caption1">
    <span className="font-bold text-accent-avocado-default">+{step.xp} XP</span>
    {step.cores > 0 && (
      <>
        <span aria-hidden>·</span>
        <span>+{step.cores} Cores</span>
      </>
    )}
    {!!step.duration && (
      <>
        <span aria-hidden>·</span>
        <span>{step.duration}</span>
      </>
    )}
  </span>
);

type StepActions = {
  claimingId?: string;
  onClaim: (step: IntroStep) => void;
  onDestinationClick: (step: IntroStep) => void;
};

const StepButton = ({
  step,
  isShort,
  claimingId,
  onClaim,
  onDestinationClick,
}: StepActions & {
  step: IntroStep;
  isShort?: boolean;
}): ReactElement | null => {
  const width = isShort ? 'shrink-0' : 'w-full';

  if (step.phase === 'claimable') {
    return (
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        color={ButtonColor.Avocado}
        size={ButtonSize.Small}
        loading={claimingId === step.quest.userQuestId}
        onClick={() => onClaim(step)}
        className={width}
        aria-label={isShort ? `Claim ${step.quest.quest.name}` : undefined}
      >
        {isShort ? 'Claim' : `Claim +${step.xp} XP`}
      </Button>
    );
  }

  if (step.phase !== 'todo' || !step.destination) {
    return null;
  }

  const href = getQuestDestinationUrl(step.destination);
  const onClick = () => onDestinationClick(step);

  if (step.destination.openInNewTab) {
    return (
      <Button
        tag="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={onClick}
        className={width}
      >
        {step.cta}
      </Button>
    );
  }

  return (
    <Link href={href} passHref>
      <Button
        tag="a"
        href={href}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={onClick}
        className={width}
      >
        {step.cta}
      </Button>
    </Link>
  );
};

/** The step you are on, the same card on Small and Large. */
const StepCard = ({
  step,
  isCompact,
  className,
  ...actions
}: StepActions & {
  step: IntroStep;
  isCompact?: boolean;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'animate-coach-card-in flex min-h-0 flex-1 flex-col',
      className,
    )}
  >
    <span className="flex items-center gap-2.5">
      <StepCircle phase={step.phase} />
      <span
        className={classNames(
          'min-w-0 flex-1 font-bold text-text-primary typo-callout',
          isCompact && 'truncate',
        )}
      >
        {step.quest.quest.name}
      </span>
    </span>
    <p
      className={classNames(
        'mt-1 pl-[1.875rem] text-text-secondary typo-footnote',
        isCompact && 'line-clamp-2',
      )}
    >
      {step.pitch}
    </p>
    <div className="mt-auto flex flex-col gap-2 pt-3">
      <StepButton step={step} {...actions} />
      <StepRewards step={step} />
    </div>
  </div>
);

const StepRow = ({
  step,
  isActive,
  canExpand,
  onSelect,
  ...actions
}: StepActions & {
  step: IntroStep;
  isActive: boolean;
  /** Tall opens the active step in the list; Large shows it on the left. */
  canExpand: boolean;
  onSelect: () => void;
}): ReactElement => {
  const isOpen = canExpand && isActive;
  const isClaimed = step.phase === 'claimed';

  return (
    <li
      className={classNames(
        'snap-start rounded-12 transition-colors duration-150 motion-reduce:transition-none',
        isActive ? 'bg-surface-float' : !isClaimed && 'hover:bg-surface-hover',
      )}
    >
      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          disabled={isClaimed}
          aria-expanded={canExpand ? isOpen : undefined}
          aria-current={!canExpand && isActive ? 'step' : undefined}
          onClick={onSelect}
          className="flex min-h-9 min-w-0 flex-1 items-center gap-2.5 py-1.5 pl-2 text-left"
        >
          <StepCircle phase={step.phase} />
          <span
            className={classNames(
              'min-w-0 flex-1 truncate typo-footnote',
              isClaimed ? 'text-text-tertiary' : 'font-bold text-text-primary',
            )}
          >
            {isClaimed ? step.doneLabel : step.quest.quest.name}
          </span>
          {!isOpen && !isClaimed && step.phase !== 'claimable' && (
            <span className="shrink-0 font-bold tabular-nums text-accent-avocado-default typo-caption1">
              +{step.xp} XP
            </span>
          )}
        </button>
        {!isOpen && step.phase === 'claimable' && (
          <StepButton step={step} isShort {...actions} />
        )}
      </div>
      {isOpen && (
        <div className="animate-coach-card-in flex flex-col gap-2.5 pb-3 pl-9 pr-3">
          <p className="text-text-secondary typo-footnote">{step.pitch}</p>
          <StepButton step={step} {...actions} />
          <StepRewards step={step} />
        </div>
      )}
    </li>
  );
};

/**
 * The intro quests, from the same quest dashboard and claim the intro quests
 * popup uses, in the popup redesign's checklist: the rewards left over a count
 * title and a segmented meter, then only the step the reader is on open with
 * its one button, which goes where the quest is done or claims it. Small is
 * that step alone, Tall opens it in the list, and Large gives it the left half
 * beside the list. Once every quest is claimed it thanks the reader and stays
 * until they remove it.
 */
export const GettingStartedWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.GettingStarted>): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const scroll = useWidgetScroll();
  const { data, isPending, isError } = useQuestDashboard();
  const {
    mutate: claimQuestReward,
    isPending: isClaimPending,
    variables,
  } = useClaimQuestReward();
  const [selectedId, setSelectedId] = useState<string>();
  const claimingId = isClaimPending ? variables?.userQuestId : undefined;
  const isSmall = size === FeedWidgetSize.Small;
  const isLarge = size === FeedWidgetSize.Large;

  const steps = useMemo(() => {
    const browserName = getCurrentBrowserName();
    return (data?.intro ?? []).map((quest) =>
      toStep(
        quest,
        getIntroQuestDestination(quest.quest.eventType, browserName),
      ),
    );
  }, [data?.intro]);

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.IntroQuestModal,
      extra: JSON.stringify({ origin: Origin.FeedWidgets, size }),
    }),
    { condition: steps.length > 0 },
  );

  const onClaim = useCallback(
    ({ quest }: IntroStep) =>
      claimQuestReward({
        userQuestId: quest.userQuestId as string,
        questId: quest.quest.id,
        questType: quest.quest.type,
      }),
    [claimQuestReward],
  );

  const onDestinationClick = useCallback(
    ({ quest }: IntroStep) =>
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.FeedWidget,
        target_id: FeedWidgetKind.GettingStarted,
        extra: JSON.stringify({
          origin: Origin.FeedWidgets,
          size,
          quest: quest.quest.eventType,
        }),
      }),
    [logEvent, size],
  );

  const header = (trailing?: ReactElement) => (
    <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
      <FlagIcon
        secondary
        size={IconSize.Size16}
        className="shrink-0 text-accent-avocado-default"
      />
      <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-caption1">
        Getting started
      </span>
      {trailing}
    </header>
  );

  const frame = (children: ReactElement) => (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={questStyle}
      />
      {children}
    </div>
  );

  if (!steps.length) {
    let message = 'Nothing left to set up.';
    if (!user) {
      message = 'Log in to set up daily.dev.';
    } else if (isError) {
      message = 'Intro quests are unavailable right now.';
    }

    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.GettingStarted}
        isPending={!!user && isPending}
        message={message}
      />
    );
  }

  const open = steps.filter(({ phase }) => phase !== 'claimed');
  const active =
    open.find(({ quest }) => quest.rotationId === selectedId) ??
    open.find(({ phase }) => phase === 'claimable') ??
    open[0];

  if (!active) {
    const totalXp = steps.reduce((sum, step) => sum + step.xp, 0);
    const totalCores = steps.reduce((sum, step) => sum + step.cores, 0);

    return frame(
      <>
        {header()}
        <div className="m-auto flex flex-col items-center gap-2 px-4 text-center">
          <span
            className={classNames(
              'flex animate-raise-hand-pop items-center justify-center rounded-max bg-accent-avocado-default text-white motion-reduce:animate-none',
              isSmall ? 'size-9' : 'size-12',
            )}
          >
            <VIcon secondary size={IconSize.Small} />
          </span>
          <span className="font-bold text-text-primary typo-callout">
            You’re all set
          </span>
          <span className="font-bold tabular-nums text-accent-avocado-default typo-caption1">
            +{formatRewards(totalXp, totalCores)} earned
          </span>
          {!isSmall && (
            <span className="text-text-tertiary typo-footnote">
              Remove this widget to make room for another one.
            </span>
          )}
        </div>
      </>,
    );
  }

  const actions: StepActions = { claimingId, onClaim, onDestinationClick };

  if (isSmall) {
    return frame(
      <>
        {header(
          <span className="flex shrink-0 items-center gap-2">
            <StepMeter steps={steps} isCompact />
            <span className="tabular-nums text-text-tertiary typo-caption1">
              {steps.length - open.length}/{steps.length}
            </span>
          </span>,
        )}
        <StepCard
          key={active.quest.rotationId}
          step={active}
          isCompact
          className="mt-3 px-4"
          {...actions}
        />
      </>,
    );
  }

  const xpLeft = open.reduce((sum, step) => sum + step.xp, 0);
  const coresLeft = open.reduce((sum, step) => sum + step.cores, 0);
  const summary = (
    <div className="flex flex-col gap-2.5">
      <span className="flex flex-col gap-0.5">
        <span className="font-bold tabular-nums text-accent-avocado-default typo-footnote">
          Earn {formatRewards(xpLeft, coresLeft)}
        </span>
        <span
          className={classNames(
            'font-bold text-text-primary',
            isLarge ? 'typo-title3' : 'typo-body',
          )}
        >
          {open.length === 1
            ? 'One last thing to set up'
            : `${open.length} things to set up daily.dev`}
        </span>
      </span>
      <StepMeter steps={steps} />
    </div>
  );

  const list = (
    <div
      ref={scroll.ref}
      onScroll={scroll.onScroll}
      style={scroll.style}
      className={classNames('px-2', scroll.className)}
    >
      <ol className="flex flex-col gap-0.5">
        {steps.map((step) => (
          <StepRow
            key={step.quest.rotationId}
            step={step}
            isActive={step.quest.rotationId === active.quest.rotationId}
            canExpand={!isLarge}
            onSelect={() => setSelectedId(step.quest.rotationId)}
            {...actions}
          />
        ))}
      </ol>
    </div>
  );

  if (isLarge) {
    return frame(
      <>
        {header()}
        <div className="mt-1 flex min-h-0 flex-1 gap-2">
          <div className="flex w-1/2 shrink-0 flex-col pl-4 pt-3">
            {summary}
            <StepCard
              key={active.quest.rotationId}
              step={active}
              className="mt-5"
              {...actions}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-2">
            {list}
          </div>
        </div>
      </>,
    );
  }

  return frame(
    <>
      {header()}
      <div className="mt-3 px-4">{summary}</div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">{list}</div>
    </>,
  );
};
