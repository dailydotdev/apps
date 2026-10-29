import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  ArrowIcon,
  ChromeIcon,
  CopyIcon,
  CoreIcon,
  EdgeIcon,
  KeyIcon,
  LockIcon,
  PlusIcon,
  VIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserQuest } from '../../graphql/quests';
import { cloudinaryPatchyFed } from '../../lib/image';
import { BrowserName } from '../../lib/func';
import { webappUrl } from '../../lib/constants';
import { getCompletionItems } from '../../lib/profileCompletion';
import {
  IntroQuestEventType,
  getIntroQuestStep,
  getQuestXp,
} from './introQuestSteps';
import {
  getApiProfileCommand,
  useIntroQuestChecklist,
} from './IntroQuestChecklistContext';

export const CoresAmount = ({
  amount,
  size = IconSize.Size16,
}: {
  amount: number;
  size?: IconSize;
}): ReactElement => (
  <span className="inline-flex items-center gap-0.5 align-middle">
    <CoreIcon size={size} aria-hidden />
    <span className="tabular-nums">{amount}</span>
    <span className="sr-only">Cores</span>
  </span>
);

const Spinner = (): ReactElement => (
  <span
    aria-hidden
    className="inline-block size-4 animate-spin rounded-max border-2 border-text-tertiary border-t-transparent motion-reduce:animate-none"
  />
);

const isEventType = (quest: UserQuest, eventType: IntroQuestEventType) =>
  quest.quest.eventType === eventType;

const StatusCircle = ({ quest }: { quest: UserQuest }): ReactElement => {
  const { phaseOf, blockedBy } = useIntroQuestChecklist();
  const phase = phaseOf(quest);

  if (phase === 'claimed' || phase === 'ready') {
    return (
      <span
        className={classNames(
          'flex size-6 shrink-0 items-center justify-center rounded-max',
          phase === 'claimed'
            ? 'bg-accent-avocado-default text-white'
            : 'border-2 border-accent-avocado-default text-accent-avocado-default',
        )}
      >
        <VIcon size={IconSize.XXSmall} secondary />
      </span>
    );
  }

  if (phase === 'working') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center">
        <Spinner />
      </span>
    );
  }

  if (blockedBy(quest)) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-max bg-surface-float text-text-quaternary">
        <LockIcon size={IconSize.XXSmall} />
      </span>
    );
  }

  return (
    <span className="size-6 shrink-0 rounded-max border-2 border-dashed border-border-subtlest-secondary" />
  );
};

const PrimaryAction = ({
  quest,
}: {
  quest: UserQuest;
}): ReactElement | null => {
  const checklist = useIntroQuestChecklist();
  const phase = checklist.phaseOf(quest);
  const step = getIntroQuestStep(quest);

  if (phase === 'claimed') {
    return null;
  }

  if (phase === 'ready') {
    return (
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Avocado}
        size={ButtonSize.Medium}
        className="w-full"
        loading={checklist.isClaiming(quest)}
        onClick={() => checklist.claim(quest)}
      >
        Claim +{getQuestXp(quest)} XP
      </Button>
    );
  }

  if (phase === 'working') {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
        disabled
        icon={<Spinner />}
      >
        {step?.workingLabel ?? 'Working on it'}
      </Button>
    );
  }

  if (checklist.blockedBy(quest)) {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
        disabled
        icon={<LockIcon />}
      >
        Create your API key first
      </Button>
    );
  }

  if (checklist.isUnsupported(quest)) {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
        icon={<CopyIcon />}
        onClick={() => checklist.start(quest)}
      >
        Copy the install link
      </Button>
    );
  }

  if (
    isEventType(quest, IntroQuestEventType.NotificationsEnable) &&
    checklist.notificationPermission === 'denied'
  ) {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        className="w-full"
        onClick={checklist.recheckNotifications}
      >
        I unblocked it, check again
      </Button>
    );
  }

  const isEdge = checklist.browserName === BrowserName.Edge;
  const icons: Partial<Record<string, ReactElement>> = {
    [IntroQuestEventType.ExtensionInstall]: isEdge ? (
      <EdgeIcon size={IconSize.XSmall} />
    ) : (
      <ChromeIcon size={IconSize.XSmall} />
    ),
    [IntroQuestEventType.ApiTokenCreate]: <KeyIcon />,
    [IntroQuestEventType.ApiProfileFetch]: <CopyIcon />,
  };
  const labels: Partial<Record<string, string>> = {
    [IntroQuestEventType.ExtensionInstall]: isEdge
      ? 'Add to Edge'
      : 'Add to Chrome',
    [IntroQuestEventType.PostRead]:
      quest.progress > 0 ? 'Keep reading' : undefined,
    [IntroQuestEventType.BriefGenerate]: checklist.isBriefFree
      ? undefined
      : 'Open briefings',
  };

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="w-full"
      icon={icons[quest.quest.eventType]}
      onClick={() => checklist.start(quest)}
    >
      {labels[quest.quest.eventType] ?? step?.cta ?? 'Start'}
    </Button>
  );
};

const CopyField = ({
  value,
  display,
  message,
  multiline,
}: {
  value: string;
  display?: string;
  message: string;
  multiline?: boolean;
}): ReactElement => {
  const { copyText } = useIntroQuestChecklist();
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={classNames(
        'flex gap-2 rounded-10 bg-background-subtle',
        multiline ? 'items-start p-2 pl-3' : 'items-center py-1 pl-3 pr-1',
      )}
    >
      <code
        className={classNames(
          'min-w-0 flex-1 font-mono',
          multiline
            ? 'whitespace-pre-wrap break-all text-text-secondary typo-caption2'
            : 'truncate text-text-primary typo-caption1',
        )}
      >
        {display ?? value}
      </code>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={copied ? <VIcon /> : <CopyIcon />}
        onClick={async () => setCopied(await copyText(value, message))}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
};

const Note = ({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'warning';
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1 rounded-12 p-3 typo-caption1',
      tone === 'warning'
        ? 'bg-accent-ketchup-flat text-text-primary'
        : 'bg-surface-float text-text-secondary',
    )}
  >
    {children}
  </div>
);

const ProgressSegments = ({ quest }: { quest: UserQuest }): ReactElement => {
  const target = quest.quest.targetCount;
  const progress = Math.min(quest.progress, target);

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1" aria-hidden>
        {Array.from({ length: target }).map((_, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={classNames(
              'h-1.5 flex-1 rounded-max transition-colors duration-300',
              index < progress
                ? 'bg-accent-avocado-default'
                : 'bg-surface-hover',
            )}
          />
        ))}
      </div>
      <span className="shrink-0 tabular-nums text-text-tertiary typo-caption1">
        {progress} of {target} read
      </span>
    </div>
  );
};

const StepWork = ({ quest }: { quest: UserQuest }): ReactElement | null => {
  const checklist = useIntroQuestChecklist();
  const { user } = useAuthContext();
  const phase = checklist.phaseOf(quest);

  if (phase === 'claimed') {
    return null;
  }

  switch (quest.quest.eventType) {
    case IntroQuestEventType.ExtensionInstall:
      if (checklist.isUnsupported(quest)) {
        return (
          <Note>
            The extension runs on desktop Chrome and Edge. Open daily.dev there
            to install it.
          </Note>
        );
      }
      return phase === 'working' ? (
        <p className="text-text-tertiary typo-caption1">
          Finish the install in the new tab. This updates on its own.
        </p>
      ) : null;

    case IntroQuestEventType.PostRead:
      return quest.quest.targetCount > 1 ? (
        <ProgressSegments quest={quest} />
      ) : null;

    case IntroQuestEventType.NotificationsEnable:
      return checklist.notificationPermission === 'denied' &&
        phase === 'todo' ? (
        <Note tone="warning">
          <p className="font-bold">Your browser is blocking notifications</p>
          <ol className="flex list-inside list-decimal flex-col gap-0.5 text-text-secondary">
            <li>Click the lock icon next to the address</li>
            <li>Set Notifications to Allow</li>
          </ol>
        </Note>
      ) : null;

    case IntroQuestEventType.BriefGenerate:
      return phase === 'ready' ? (
        <button
          type="button"
          onClick={() => checklist.navigate(`${webappUrl}briefing`)}
          className="inline-flex w-fit items-center gap-1 font-bold text-text-link typo-caption1 hover:underline"
        >
          Read your brief
          <ArrowIcon className="rotate-90" size={IconSize.XXSmall} />
        </button>
      ) : null;

    case IntroQuestEventType.ProfileComplete:
      if (!user?.profileCompletion) {
        return null;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {getCompletionItems(user.profileCompletion).map((item) =>
            item.completed ? (
              <span
                key={item.label}
                className="inline-flex h-8 items-center gap-1 rounded-10 bg-accent-avocado-flat px-3 font-bold text-accent-avocado-default typo-footnote"
              >
                <VIcon size={IconSize.Size16} secondary />
                {item.label}
              </span>
            ) : (
              <Button
                key={item.label}
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                onClick={() => checklist.navigate(item.redirectPath)}
              >
                {item.label}
              </Button>
            ),
          )}
        </div>
      );

    case IntroQuestEventType.ApiTokenCreate:
      return checklist.token ? (
        <div className="flex flex-col gap-1">
          <CopyField value={checklist.token} message="API key copied" />
          <p className="text-text-quaternary typo-caption2">
            Shown once. Keep it somewhere safe.
          </p>
        </div>
      ) : null;

    case IntroQuestEventType.ApiProfileFetch:
      if (checklist.blockedBy(quest)) {
        return null;
      }
      return (
        <div className="flex flex-col gap-1.5">
          <CopyField
            multiline
            value={getApiProfileCommand(checklist.token)}
            display={getApiProfileCommand(
              checklist.token &&
                `${checklist.token.slice(0, 7)}••••${checklist.token.slice(
                  -4,
                )}`,
            )}
            message="Command copied"
          />
          {phase === 'working' && (
            <p className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
              <span className="size-2 animate-pulse rounded-max bg-accent-avocado-default" />
              Listening for your first call
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

const Meta = ({ quest }: { quest: UserQuest }): ReactElement => {
  const step = getIntroQuestStep(quest);
  const { isBriefFree } = useIntroQuestChecklist();
  const extra =
    (step?.free && isBriefFree && 'Free') ||
    (step?.optional && 'Optional') ||
    null;
  const parts = [step?.minutes, extra].filter(Boolean);

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums text-text-tertiary typo-caption1">
      <span className="font-bold text-accent-avocado-default">
        +{getQuestXp(quest)} XP
      </span>
      {parts.map((part) => (
        <React.Fragment key={part}>
          <span aria-hidden>·</span>
          <span>{part}</span>
        </React.Fragment>
      ))}
    </span>
  );
};

const SegmentMeter = (): ReactElement => {
  const { quests, phaseOf, doneCount } = useIntroQuestChecklist();

  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={quests.length}
      aria-valuenow={doneCount}
      aria-label={`${doneCount} of ${quests.length} done`}
    >
      {quests.map((quest) => {
        const phase = phaseOf(quest);

        return (
          <span
            key={quest.rotationId}
            className={classNames(
              'h-1.5 flex-1 rounded-max transition-colors duration-300',
              phase === 'claimed' && 'bg-accent-avocado-default',
              phase === 'ready' && 'bg-accent-avocado-subtler',
              phase === 'working' && 'animate-pulse bg-surface-hover',
              phase === 'todo' && 'bg-surface-float',
            )}
          />
        );
      })}
    </div>
  );
};

const Header = (): ReactElement => {
  const { quests, doneCount, totals } = useIntroQuestChecklist();
  const left = quests.length - doneCount;

  return (
    <header className="flex flex-col gap-4 p-5 pb-4 pr-14">
      <div className="flex flex-col gap-1">
        <h2 className="text-balance font-bold text-text-primary typo-title3">
          {left === 0 && 'Claim your rewards'}
          {left === 1 && 'One last thing to set up'}
          {left > 1 && `${left} things to set up daily.dev`}
        </h2>
        <p className="flex items-center gap-1 text-text-primary typo-footnote">
          Earn
          <span className="font-bold tabular-nums text-accent-avocado-default">
            {totals.xp} XP
          </span>
          and
          <CoresAmount amount={totals.cores} />
        </p>
      </div>
      <SegmentMeter />
    </header>
  );
};

const RowSummary = ({ quest }: { quest: UserQuest }): ReactElement => {
  const { isUnsupported } = useIntroQuestChecklist();

  if (isUnsupported(quest)) {
    return (
      <span className="font-normal text-text-quaternary">Chrome or Edge</span>
    );
  }

  if (quest.quest.targetCount > 1 && quest.progress > 0) {
    return (
      <>
        {Math.min(quest.progress, quest.quest.targetCount)}/
        {quest.quest.targetCount}
      </>
    );
  }

  return <>+{getQuestXp(quest)} XP</>;
};

const Row = ({
  quest,
  isOpen,
  onOpen,
}: {
  quest: UserQuest;
  isOpen: boolean;
  onOpen: () => void;
}): ReactElement => {
  const checklist = useIntroQuestChecklist();
  const phase = checklist.phaseOf(quest);
  const claimed = phase === 'claimed';
  const step = getIntroQuestStep(quest);

  return (
    <li
      className={classNames(
        'rounded-16 transition-colors duration-150',
        isOpen ? 'bg-surface-float' : !claimed && 'hover:bg-surface-hover',
      )}
    >
      <div className="flex items-center gap-2 pr-3">
        <button
          type="button"
          disabled={claimed}
          onClick={onOpen}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left disabled:cursor-default"
        >
          <StatusCircle quest={quest} />
          <span
            className={classNames(
              'min-w-0 flex-1 truncate typo-callout',
              claimed ? 'text-text-tertiary' : 'font-bold text-text-primary',
            )}
          >
            {claimed && step ? step.doneLabel : quest.quest.name}
          </span>
          {!isOpen && !claimed && phase !== 'ready' && (
            <span className="shrink-0 font-bold tabular-nums text-accent-avocado-default typo-caption1">
              <RowSummary quest={quest} />
            </span>
          )}
        </button>
        {!isOpen && phase === 'ready' && (
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Avocado}
            size={ButtonSize.Small}
            className="shrink-0"
            loading={checklist.isClaiming(quest)}
            onClick={() => checklist.claim(quest)}
          >
            Claim
          </Button>
        )}
      </div>
      {isOpen && !claimed && (
        <div className="flex animate-composer-in flex-col gap-3 px-3 pb-3 pl-12 motion-reduce:animate-none">
          <p className="text-pretty text-text-secondary typo-footnote">
            {step?.pitch ?? quest.quest.description}
          </p>
          <div className="empty:hidden">
            <StepWork quest={quest} />
          </div>
          <PrimaryAction quest={quest} />
          <Meta quest={quest} />
        </div>
      )}
    </li>
  );
};

const Footer = (): ReactElement => {
  const { readyQuests, isClaimingAny, claimAll, hide } =
    useIntroQuestChecklist();
  const xp = readyQuests.reduce((acc, quest) => acc + getQuestXp(quest), 0);

  return (
    <footer className="mt-auto flex flex-col items-center gap-3 p-5 pt-4">
      {readyQuests.length > 1 && (
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Avocado}
          size={ButtonSize.Medium}
          className="w-full"
          loading={isClaimingAny}
          onClick={claimAll}
        >
          Claim all +{xp} XP
        </Button>
      )}
      <button
        type="button"
        onClick={hide}
        className="text-text-quaternary typo-caption1 hover:text-text-tertiary hover:underline"
      >
        Don&apos;t show this again
      </button>
    </footer>
  );
};

const Completion = (): ReactElement => {
  const { totals, onRequestClose } = useIntroQuestChecklist();

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <img
        src={cloudinaryPatchyFed}
        alt=""
        className="size-32 object-contain"
      />
      <div className="flex flex-col gap-1">
        <h2 className="text-balance font-bold text-text-primary typo-title2">
          You are all set
        </h2>
        <p className="text-pretty text-text-tertiary typo-callout">
          daily.dev is set up the way it is meant to be used.
        </p>
      </div>
      <span className="flex items-center gap-2 rounded-max bg-surface-float px-3 py-1.5 font-bold tabular-nums text-text-primary typo-callout">
        +{totals.xp} XP
        <span aria-hidden className="text-text-quaternary">
          ·
        </span>
        <CoresAmount amount={totals.cores} size={IconSize.XSmall} />
      </span>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="mt-2"
        onClick={onRequestClose}
      >
        Back to my feed
      </Button>
    </div>
  );
};

const Loading = (): ReactElement => (
  <div className="flex flex-col gap-4 p-5" aria-busy aria-label="Loading">
    <span className="h-6 w-3/4 animate-pulse rounded-max bg-surface-float" />
    <span className="h-3 w-40 animate-pulse rounded-max bg-surface-float" />
    <span className="h-1.5 w-full animate-pulse rounded-max bg-surface-float" />
    <div className="flex flex-col gap-3 pt-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex items-center gap-3 px-3"
        >
          <span className="size-6 animate-pulse rounded-max bg-surface-float" />
          <span className="h-3 flex-1 animate-pulse rounded-max bg-surface-float" />
          <span className="h-3 w-10 animate-pulse rounded-max bg-surface-float" />
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = (): ReactElement => {
  const { refetch } = useIntroQuestChecklist();

  return (
    <div className="flex flex-col items-start gap-3 p-5 pr-14">
      <h2 className="font-bold text-text-primary typo-title3">
        Your setup list didn&apos;t load
      </h2>
      <p className="text-text-tertiary typo-callout">
        Check your connection and try again.
      </p>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        onClick={() => refetch()}
      >
        Try again
      </Button>
    </div>
  );
};

export const IntroQuestChecklist = (): ReactElement => {
  const { quests, isPending, isError, phaseOf, currentQuest } =
    useIntroQuestChecklist();
  const [openId, setOpenId] = useState<string>();
  const currentId = currentQuest?.rotationId;
  const previousCurrentId = useRef(currentId);
  const openQuest = quests.find((quest) => quest.rotationId === openId);
  const activeId =
    openQuest && phaseOf(openQuest) !== 'claimed' ? openId : currentId;

  useEffect(() => {
    if (previousCurrentId.current !== currentId) {
      previousCurrentId.current = currentId;
      setOpenId(undefined);
    }
  }, [currentId]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorState />;
  }

  if (quests.every((quest) => phaseOf(quest) === 'claimed')) {
    return <Completion />;
  }

  return (
    <>
      <Header />
      <ol className="flex flex-col gap-1 px-2">
        {quests.map((quest) => (
          <Row
            key={quest.rotationId}
            quest={quest}
            isOpen={quest.rotationId === activeId}
            onOpen={() => setOpenId(quest.rotationId)}
          />
        ))}
      </ol>
      <Footer />
    </>
  );
};
