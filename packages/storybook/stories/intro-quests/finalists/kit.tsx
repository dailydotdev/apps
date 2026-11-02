import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ArrowIcon,
  ChromeIcon,
  CopyIcon,
  KeyIcon,
  LockIcon,
  PlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { IntroQuest } from '../data';
import {
  introQuests,
  mockStories,
  profileFields,
  reminderTimes,
  totalRewards,
} from '../data';
import { PopupShell, QuestDetail, SegmentMeter, Spinner } from '../kit';
import { useSim } from '../sim';
import { QuestPreview, TerminalPreview } from '../round2/previews';

// Shared by every finalist, after the round three review:
// - one size everywhere: a narrow, tall popup on desktop that matches the
//   phone sheet, so desktop and mobile are the same design
// - round one B's header: green reward line, title, segmented bar
// - one solid button in view (the step you are on); everything else is a
//   small Float button with a short verb
// - chips are the design system's rounded rectangles (Float buttons), never
//   circular pills

export type Frame = 'modal' | 'panel';

export const POPUP_WIDTH = '24rem';

const label: Record<IntroQuest['id'], string> = {
  extension: 'Add to Chrome',
  notifications: 'Turn on notifications',
  brief: 'Generate my brief',
  profile: 'Edit profile',
  apiKey: 'Create API key',
  apiCall: 'Copy command',
  read3: 'Open today’s picks',
  reminder: 'Set daily reminder',
  story: 'Follow story',
};

const shortLabel: Record<IntroQuest['id'], string> = {
  extension: 'Add to Chrome',
  notifications: 'Turn on',
  brief: 'Generate',
  profile: 'Edit',
  apiKey: 'Create key',
  apiCall: 'Copy',
  read3: 'Read',
  reminder: 'Set',
  story: 'Follow',
};

const getIcon = (
  id: IntroQuest['id'],
  short: boolean,
): ReactElement | undefined => {
  switch (id) {
    case 'extension':
      return <ChromeIcon size={short ? IconSize.Size16 : IconSize.XSmall} />;
    case 'apiKey':
      return <KeyIcon />;
    case 'apiCall':
      return <CopyIcon />;
    default:
      return undefined;
  }
};

const working: Record<IntroQuest['id'], string> = {
  extension: 'Waiting for the install',
  notifications: 'Waiting for your browser',
  brief: 'Writing your brief',
  profile: 'Saving',
  apiKey: 'Creating your key',
  apiCall: 'Listening for your call',
  read3: 'Reading',
  reminder: 'Saving your reminder',
  story: 'Following',
};

export const needsInput = (quest: IntroQuest): boolean =>
  ['apiCall', 'reminder', 'story'].includes(quest.id);

export const FinalCta = ({
  quest,
  isPrimary = false,
  short = false,
  onOpen,
}: {
  quest: IntroQuest;
  isPrimary?: boolean;
  short?: boolean;
  onOpen?: () => void;
}): ReactElement | null => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const blocker = sim.isBlockedBy(quest);
  const size = short ? ButtonSize.Small : ButtonSize.Medium;
  const width = short ? 'shrink-0' : 'w-full';

  if (phase === 'claimed') {
    return null;
  }

  if (phase === 'ready') {
    return (
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Avocado}
        size={size}
        className={classNames('iq-pop', width)}
        data-cta
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          sim.claim(quest.id);
        }}
      >
        {short ? 'Claim' : `Claim +${quest.xp} XP`}
      </Button>
    );
  }

  if (phase === 'working') {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={size}
        className={width}
        disabled
        icon={<Spinner />}
      >
        {short ? undefined : working[quest.id]}
      </Button>
    );
  }

  if (blocker) {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={size}
        className={width}
        disabled
        icon={<LockIcon />}
      >
        {short ? undefined : 'Needs your API key'}
      </Button>
    );
  }

  if (quest.id === 'notifications' && sim.state.permission === 'blocked') {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={size}
        className={width}
        data-cta
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();

          if (short && onOpen) {
            onOpen();
            return;
          }

          sim.allowPermission();
        }}
      >
        {short ? 'Fix' : 'I unblocked it, check again'}
      </Button>
    );
  }

  return (
    <Button
      variant={isPrimary ? ButtonVariant.Primary : ButtonVariant.Float}
      size={size}
      className={width}
      icon={getIcon(quest.id, short)}
      data-cta
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();

        if (onOpen && short && needsInput(quest)) {
          onOpen();
          return;
        }

        sim.start(quest.id);
      }}
    >
      {short ? shortLabel[quest.id] : label[quest.id]}
    </Button>
  );
};

export const ProfileChips = (): ReactElement => {
  const sim = useSim();

  return (
    <div className="flex flex-wrap gap-2">
      {profileFields.map((field) =>
        sim.state.profileDone.includes(field.id) ? (
          <span
            key={field.id}
            className="iq-pop inline-flex h-8 items-center gap-1 rounded-10 bg-accent-avocado-flat px-3 font-bold text-accent-avocado-default typo-footnote"
          >
            <VIcon size={IconSize.Size16} secondary />
            {field.label}
          </span>
        ) : (
          <Button
            key={field.id}
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              sim.completeField(field.id);
            }}
          >
            {field.label}
          </Button>
        ),
      )}
    </div>
  );
};

export const ReminderPicker = (): ReactElement => {
  const [time, setTime] = useState('9:00');

  return (
    <div className="flex flex-wrap gap-2">
      {reminderTimes.map((option) =>
        option === time ? (
          <Button
            key={option}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            size={ButtonSize.Small}
            className="iq-tabular"
            aria-pressed
          >
            {option}
          </Button>
        ) : (
          <Button
            key={option}
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="iq-tabular"
            onClick={() => setTime(option)}
          >
            {option}
          </Button>
        ),
      )}
    </div>
  );
};

export const StoryPicker = (): ReactElement => {
  const [picked, setPicked] = useState(mockStories[0].id);

  return (
    <div className="flex flex-col gap-1.5">
      {mockStories.map((story) => {
        const isPicked = story.id === picked;

        return (
          <button
            key={story.id}
            type="button"
            onClick={() => setPicked(story.id)}
            aria-pressed={isPicked}
            className={classNames(
              'flex items-center gap-3 rounded-12 border px-3 py-2 text-left transition-colors duration-150',
              isPicked
                ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                : 'border-border-subtlest-tertiary hover:bg-surface-hover',
            )}
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary typo-footnote">
                {story.title}
              </span>
              <span className="text-text-tertiary typo-caption1">
                {story.posts} posts so far
              </span>
            </span>
            {isPicked && (
              <VIcon
                size={IconSize.Size16}
                className="text-accent-cabbage-default"
                secondary
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// The inline work for the step you are on. Anything visual ("what you get")
// lives in the stage instead; this is only what needs a click or typing.
export const QuestWork = ({
  quest,
}: {
  quest: IntroQuest;
}): ReactElement | null => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);

  if (phase === 'claimed') {
    return null;
  }

  switch (quest.id) {
    case 'notifications':
      return sim.state.permission === 'blocked' ? (
        <QuestDetail quest={quest} />
      ) : null;
    case 'profile':
      return phase === 'ready' ? null : <ProfileChips />;
    case 'reminder':
      return phase === 'todo' ? <ReminderPicker /> : null;
    case 'story':
      return phase === 'todo' ? <StoryPicker /> : null;
    case 'apiKey':
      return sim.state.token ? <QuestDetail quest={quest} /> : null;
    case 'apiCall':
      return sim.isBlockedBy(quest) ? null : <QuestDetail quest={quest} />;
    default:
      return null;
  }
};

// Picture of the result plus the inline work, for layouts that show both
// inside the open step (cards, journey).
export const QuestStage = ({
  quest,
}: {
  quest: IntroQuest;
}): ReactElement | null => {
  const sim = useSim();

  if (sim.phaseOf(quest.id) === 'claimed') {
    return null;
  }

  if (['profile', 'read3', 'reminder', 'story'].includes(quest.id)) {
    return <QuestWork quest={quest} />;
  }

  if (quest.id === 'apiKey' || quest.id === 'apiCall') {
    return (
      <div className="flex flex-col gap-2">
        <QuestWork quest={quest} />
        {sim.isDone('apiCall') && <TerminalPreview />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <QuestWork quest={quest} />
      {!(
        quest.id === 'notifications' && sim.state.permission === 'blocked'
      ) && (
        <div className="flex items-center justify-center overflow-hidden rounded-14 bg-background-subtle p-3 [&>*]:min-w-0">
          <QuestPreview id={quest.id} />
        </div>
      )}
    </div>
  );
};

export const Meta = ({ quest }: { quest: IntroQuest }): ReactElement => {
  const extra =
    quest.id === 'brief' ? 'Free' : quest.optional ? 'Optional' : null;

  return (
    <span className="iq-tabular inline-flex items-center gap-1.5 text-text-tertiary typo-caption1">
      <span className="font-bold text-accent-avocado-default">
        +{quest.xp} XP
      </span>
      <span aria-hidden>·</span>
      <span>{quest.minutes}</span>
      {extra && (
        <>
          <span aria-hidden>·</span>
          <span>{extra}</span>
        </>
      )}
    </span>
  );
};

export const SetupHeader = ({
  title,
  eyebrow = `Earn ${totalRewards.xp} XP and ${totalRewards.cores} Cores`,
  quests = introQuests,
  showMeter = true,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  quests?: IntroQuest[];
  showMeter?: boolean;
}): ReactElement => (
  <header className="flex flex-col gap-4 p-5 pb-4 pr-14">
    <div className="flex flex-col gap-1">
      <p className="font-bold text-accent-avocado-default typo-footnote">
        {eyebrow}
      </p>
      <h2 className="iq-balance font-bold text-text-primary typo-title2">
        {title}
      </h2>
    </div>
    {showMeter && <SegmentMeter quests={quests} />}
  </header>
);

const fixedHeight = {
  desktop: 'h-[46rem]',
  mobile: 'h-[88%]',
};

const fitHeight = {
  desktop: 'max-h-[min(46rem,100%)]',
  mobile: undefined,
};

export const Surface = ({
  frame,
  device = 'desktop',
  fitContent = false,
  onClose,
  children,
}: {
  frame: Frame;
  device?: 'desktop' | 'mobile';
  fitContent?: boolean;
  onClose?: () => void;
  children: ReactNode;
}): ReactElement => {
  if (frame === 'modal') {
    return (
      <PopupShell
        device={device}
        width={POPUP_WIDTH}
        className={(fitContent ? fitHeight : fixedHeight)[device]}
      >
        {children}
      </PopupShell>
    );
  }

  return (
    <section
      role="dialog"
      aria-label="Set up daily.dev"
      className={classNames(
        'iq-rise iq-elevated relative flex min-h-0 shrink flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default',
        fitContent ? 'max-h-[min(46rem,100%)]' : 'h-[46rem] max-h-full',
      )}
      style={{ width: POPUP_WIDTH }}
    >
      <CloseButton
        size={ButtonSize.Small}
        className="!absolute right-3 top-3 z-1"
        onClick={onClose}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  );
};

export const ChevronIcon = ({ open }: { open: boolean }): ReactElement => (
  <ArrowIcon
    size={IconSize.Size16}
    className={classNames(
      'shrink-0 text-text-quaternary transition-transform duration-200',
      open ? 'rotate-0' : 'rotate-180',
    )}
  />
);
