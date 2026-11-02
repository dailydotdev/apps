import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ArrowIcon,
  BellIcon,
  BriefIcon,
  ChromeIcon,
  CopyIcon,
  CoreIcon,
  EyeIcon,
  HotIcon,
  KeyIcon,
  LockIcon,
  MagicIcon,
  TerminalIcon,
  TimerIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinaryPatchyFed } from '@dailydotdev/shared/src/lib/image';
import type { IntroQuest, QuestId } from './data';
import {
  curlCommand,
  introQuests,
  maskedToken,
  mockUser,
  profileFields,
  totalRewards,
} from './data';
import { useSim } from './sim';

const motionCss = `
@keyframes iqRise {
  from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes iqPop {
  from { opacity: 0; transform: scale(0.25); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes iqSpin { to { transform: rotate(360deg); } }
@keyframes iqPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
@keyframes iqShimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
@keyframes iqPrompt {
  from { opacity: 0; transform: translateY(-6px); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.iq-rise { animation: iqRise 380ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--iq-delay, 0ms); }
.iq-pop { animation: iqPop 300ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.iq-spin { animation: iqSpin 800ms linear infinite; }
.iq-pulse { animation: iqPulse 1.4s ease-in-out infinite; }
.iq-prompt { animation: iqPrompt 220ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: top left; }
.iq-shimmer { position: relative; overflow: hidden; }
.iq-shimmer::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, var(--theme-surface-hover), transparent);
  animation: iqShimmer 1.2s linear infinite;
}
.iq-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms, box-shadow 200ms, border-color 150ms; }
.iq-press:active { transform: scale(0.98); }
.iq-bar { transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1); transform-origin: left; }
.iq-elevated {
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.4), 0 16px 40px -12px rgb(0 0 0 / 0.5);
}
.iq-tabular { font-variant-numeric: tabular-nums; }
.iq-balance { text-wrap: balance; }
.iq-pretty { text-wrap: pretty; }
.iq-logo { outline: 1px solid rgb(0 0 0 / 0.08); outline-offset: -1px; }
@media (prefers-reduced-motion: reduce) {
  .iq-rise, .iq-pop, .iq-prompt { animation-duration: 1ms; animation-delay: 0ms; }
  .iq-spin, .iq-pulse, .iq-shimmer::after { animation: none; }
  .iq-press, .iq-bar { transition: none; }
}
`;

export const IntroMotion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: motionCss }} />
);

export const Spinner = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'iq-spin inline-block size-4 rounded-max border-2 border-current border-t-transparent',
      className,
    )}
  />
);

const glyphSize = {
  sm: 'size-8 rounded-10',
  md: 'size-10 rounded-12',
  lg: 'size-14 rounded-16',
} as const;

const glyphIcon: Record<QuestId, ReactElement | null> = {
  extension: <ChromeIcon />,
  notifications: <BellIcon secondary />,
  brief: <BriefIcon secondary />,
  profile: null,
  apiKey: <KeyIcon secondary />,
  apiCall: <TerminalIcon />,
  read3: <EyeIcon />,
  reminder: <TimerIcon />,
  story: <HotIcon />,
};

const glyphTone: Record<QuestId, string> = {
  extension: 'iq-logo bg-white',
  notifications: 'bg-surface-float text-text-primary',
  brief: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  profile: 'bg-surface-float',
  apiKey: 'bg-accent-water-flat text-accent-water-default',
  apiCall: 'bg-surface-float text-text-primary',
  read3: 'bg-surface-float text-text-primary',
  reminder: 'bg-surface-float text-text-primary',
  story: 'bg-surface-float text-text-primary',
};

export const QuestGlyph = ({
  quest,
  size = 'md',
  showDone = true,
  muted = false,
}: {
  quest: IntroQuest;
  size?: keyof typeof glyphSize;
  showDone?: boolean;
  muted?: boolean;
}): ReactElement => {
  const { isDone } = useSim();
  const done = showDone && isDone(quest.id);

  if (done) {
    return (
      <span
        className={classNames(
          'flex shrink-0 items-center justify-center bg-accent-avocado-flat text-accent-avocado-default',
          glyphSize[size],
        )}
      >
        <VIcon className="iq-pop" secondary />
      </span>
    );
  }

  if (quest.id === 'profile') {
    return (
      <img
        src={mockUser.image}
        alt=""
        className={classNames(
          'shrink-0 object-cover',
          glyphSize[size],
          muted && 'opacity-50 grayscale',
        )}
      />
    );
  }

  return (
    <span
      className={classNames(
        'relative flex shrink-0 items-center justify-center',
        glyphSize[size],
        glyphTone[quest.id],
        size === 'lg' && '[&_svg]:size-7',
        muted && 'opacity-50 grayscale',
      )}
    >
      {glyphIcon[quest.id]}
      {quest.id === 'notifications' && (
        <span
          aria-hidden
          className={classNames(
            'absolute rounded-max bg-accent-ketchup-default ring-2 ring-surface-float',
            size === 'sm'
              ? 'right-1.5 top-1.5 size-1.5'
              : 'right-2 top-2 size-2',
          )}
        />
      )}
    </span>
  );
};

export const RewardTag = ({
  xp,
  cores,
  tone = 'muted',
  className,
}: {
  xp: number;
  cores: number;
  tone?: 'muted' | 'bold' | 'done';
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'iq-tabular inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap',
      tone === 'bold' && 'font-bold text-text-primary typo-callout',
      tone === 'muted' && 'text-text-tertiary typo-caption1',
      tone === 'done' && 'text-text-quaternary typo-caption1 line-through',
      className,
    )}
  >
    <span>+{xp} XP</span>
    <span className="inline-flex items-center gap-0.5">
      <CoreIcon
        size={tone === 'bold' ? IconSize.Size16 : IconSize.XXSmall}
        className={tone === 'done' ? undefined : 'text-accent-cheese-default'}
      />
      {cores}
    </span>
  </span>
);

const workingLabel: Record<QuestId, string> = {
  extension: 'Waiting for install',
  notifications: 'Waiting',
  brief: 'Generating',
  profile: 'Saving',
  apiKey: 'Creating',
  apiCall: 'Listening',
  read3: 'Reading',
  reminder: 'Saving',
  story: 'Following',
};

const ctaIcon: Record<QuestId, ReactElement> = {
  extension: <ChromeIcon />,
  notifications: <BellIcon />,
  brief: <MagicIcon />,
  profile: <ArrowIcon className="rotate-90" />,
  apiKey: <KeyIcon />,
  apiCall: <CopyIcon />,
  read3: <EyeIcon />,
  reminder: <TimerIcon />,
  story: <HotIcon />,
};

export const useCtaLabel = (
  quest: IntroQuest,
  canOpenDetail = false,
): string => {
  const { state } = useSim();

  if (quest.id === 'notifications' && state.permission === 'blocked') {
    return canOpenDetail ? 'How to unblock' : 'Check again';
  }

  if (quest.id === 'profile') {
    const next = profileFields.find(
      ({ id }) => !state.profileDone.includes(id),
    );

    return next ? `Add ${next.label.toLowerCase()}` : quest.cta;
  }

  return quest.cta;
};

export const QuestCta = ({
  quest,
  size = ButtonSize.Small,
  block = false,
  quiet = false,
  onOpenDetail,
}: {
  quest: IntroQuest;
  size?: ButtonSize;
  block?: boolean;
  quiet?: boolean;
  onOpenDetail?: () => void;
}): ReactElement | null => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const blocker = sim.isBlockedBy(quest);
  const label = useCtaLabel(quest, !!onOpenDetail);
  const width = block ? 'w-full' : undefined;

  if (phase === 'claimed') {
    return (
      <span className="iq-pop inline-flex shrink-0 items-center gap-1 font-bold text-accent-avocado-default typo-footnote">
        <VIcon size={IconSize.Size16} secondary />
        Done
      </span>
    );
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
        Claim +{quest.xp} XP
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
        {workingLabel[quest.id]}
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
        {blocker.cta} first
      </Button>
    );
  }

  const isUnblock =
    quest.id === 'notifications' && sim.state.permission === 'blocked';

  return (
    <Button
      variant={
        quiet || isUnblock ? ButtonVariant.Secondary : ButtonVariant.Primary
      }
      size={size}
      className={width}
      data-cta
      icon={isUnblock ? undefined : ctaIcon[quest.id]}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();

        if (isUnblock) {
          if (onOpenDetail) {
            onOpenDetail();
          } else {
            sim.allowPermission();
          }
          return;
        }

        if (quest.id === 'profile') {
          const next = profileFields.find(
            ({ id }) => !sim.state.profileDone.includes(id),
          );

          if (next) {
            sim.completeField(next.id);
            return;
          }
        }

        sim.start(quest.id);
      }}
    >
      {label}
    </Button>
  );
};

const CopyButton = ({ copyKey }: { copyKey: string }): ReactElement => {
  const { state, copy } = useSim();
  const copied = state.copied === copyKey;

  return (
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={copied ? <VIcon /> : <CopyIcon />}
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        copy(copyKey);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
};

const NotificationPreview = (): ReactElement => (
  <div className="flex items-start gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-2">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-text-primary text-surface-invert">
      <BellIcon size={IconSize.XXSmall} secondary />
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-text-primary typo-caption1">
        Nimrod replied to your comment
      </p>
      <p className="truncate text-text-tertiary typo-caption2">
        Good catch on the Bun test runner. Did you try it with workspaces?
      </p>
    </div>
  </div>
);

export const QuestDetail = ({
  quest,
  compact = false,
}: {
  quest: IntroQuest;
  compact?: boolean;
}): ReactElement | null => {
  const sim = useSim();
  const phase = sim.phaseOf(quest.id);
  const { state } = sim;

  switch (quest.id) {
    case 'extension':
      if (phase === 'working') {
        return (
          <p className="text-text-tertiary typo-caption1">
            Finish the install in the new tab. This updates on its own.
          </p>
        );
      }
      return phase === 'todo' && !compact ? (
        <p className="text-text-tertiary typo-caption1">
          Opens the Chrome Web Store. We detect the install automatically.
        </p>
      ) : null;

    case 'notifications':
      if (state.permission === 'blocked' && phase === 'todo') {
        return (
          <div className="flex flex-col gap-1.5 rounded-12 bg-accent-ketchup-flat p-3 text-text-primary typo-caption1">
            <p className="font-bold">Your browser is blocking notifications</p>
            <ol className="flex list-inside list-decimal flex-col gap-0.5 text-text-secondary">
              <li>Click the lock icon next to app.daily.dev</li>
              <li>Set Notifications to Allow</li>
              <li>Reload this page</li>
            </ol>
          </div>
        );
      }
      return phase === 'todo' && !compact ? <NotificationPreview /> : null;

    case 'brief':
      if (phase === 'working') {
        return (
          <div className="flex flex-col gap-1.5">
            <span className="iq-shimmer h-2 w-full rounded-max bg-surface-float" />
            <span className="iq-shimmer h-2 w-4/5 rounded-max bg-surface-float" />
            <span className="iq-shimmer h-2 w-3/5 rounded-max bg-surface-float" />
          </div>
        );
      }
      if (phase === 'ready' || phase === 'claimed') {
        return (
          <button
            type="button"
            className="inline-flex w-fit items-center gap-1 font-bold text-text-link typo-caption1 hover:underline"
          >
            Read your brief
            <ArrowIcon className="rotate-90" size={IconSize.XXSmall} />
          </button>
        );
      }
      return null;

    case 'profile':
      if (phase === 'claimed') {
        return null;
      }
      return (
        <div className="flex flex-wrap gap-1.5">
          {profileFields.map((field) => {
            const done = state.profileDone.includes(field.id);

            return (
              <button
                key={field.id}
                type="button"
                disabled={done}
                onClick={(event) => {
                  event.stopPropagation();
                  sim.completeField(field.id);
                }}
                className={classNames(
                  'iq-press inline-flex h-8 items-center gap-1 rounded-10 px-3 typo-footnote',
                  done
                    ? 'bg-surface-float text-text-tertiary [&_svg]:text-accent-avocado-default'
                    : 'bg-surface-float text-text-primary hover:bg-surface-hover',
                )}
              >
                {done ? (
                  <VIcon size={IconSize.XXSmall} secondary />
                ) : (
                  <span className="font-bold">+</span>
                )}
                {field.label}
              </button>
            );
          })}
        </div>
      );

    case 'apiKey':
      if (!state.token) {
        return null;
      }
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-subtle py-1 pl-3 pr-1">
            <code className="min-w-0 flex-1 truncate font-mono text-text-primary typo-caption1">
              {phase === 'claimed' ? maskedToken : state.token}
            </code>
            {phase !== 'claimed' && <CopyButton copyKey="token" />}
          </div>
          {phase !== 'claimed' && (
            <p className="text-text-quaternary typo-caption2">
              Shown once. Keep it somewhere safe.
            </p>
          )}
        </div>
      );

    case 'apiCall':
      if (phase === 'claimed' || sim.isBlockedBy(quest)) {
        return null;
      }
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2 rounded-10 bg-background-subtle p-2 pl-3">
            <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-text-secondary typo-caption2">
              {curlCommand(maskedToken)}
            </code>
            <CopyButton copyKey="curl" />
          </div>
          {phase === 'working' && (
            <p className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
              <span className="iq-pulse size-2 rounded-max bg-accent-avocado-default" />
              Listening for your first call
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

export const ProgressMeter = ({
  className,
  showRewards = true,
}: {
  className?: string;
  showRewards?: boolean;
}): ReactElement => {
  const { doneCount, earned } = useSim();
  const ratio = doneCount / introQuests.length;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="iq-tabular font-bold text-text-primary typo-footnote">
          {doneCount} of {introQuests.length} done
        </span>
        {showRewards && (
          <span className="iq-tabular inline-flex items-center gap-1 text-text-tertiary typo-caption1">
            {earned.xp}/{totalRewards.xp} XP
            <span aria-hidden>·</span>
            <CoreIcon
              size={IconSize.XXSmall}
              className="text-accent-cheese-default"
            />
            {earned.cores}/{totalRewards.cores}
          </span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-max bg-surface-float">
        <div
          className="iq-bar h-full w-full rounded-max bg-accent-avocado-default"
          style={{ transform: `scaleX(${Math.max(ratio, 0.02)})` }}
        />
      </div>
    </div>
  );
};

export const SegmentMeter = ({
  className,
  quests = introQuests,
}: {
  className?: string;
  quests?: IntroQuest[];
}): ReactElement => {
  const { phaseOf } = useSim();

  return (
    <div className={classNames('flex gap-1', className)}>
      {quests.map((quest) => {
        const phase = phaseOf(quest.id);

        return (
          <span
            key={quest.id}
            className={classNames(
              'h-1.5 flex-1 rounded-max transition-colors duration-300',
              phase === 'claimed' && 'bg-accent-avocado-default',
              phase === 'ready' && 'bg-accent-avocado-subtler',
              phase === 'working' && 'iq-pulse bg-surface-hover',
              phase === 'todo' && 'bg-surface-float',
            )}
          />
        );
      })}
    </div>
  );
};

export const ClaimAllBar = (): ReactElement | null => {
  const { claimableCount, claimAll, phaseOf } = useSim();

  if (claimableCount < 2) {
    return null;
  }

  const pending = introQuests.filter(({ id }) => phaseOf(id) === 'ready');
  const xp = pending.reduce((acc, quest) => acc + quest.xp, 0);

  return (
    <Button
      variant={ButtonVariant.Primary}
      color={ButtonColor.Avocado}
      size={ButtonSize.Medium}
      className="iq-rise w-full"
      onClick={claimAll}
    >
      Claim all +{xp} XP
    </Button>
  );
};

export const CompletionHero = ({
  onClose,
}: {
  onClose?: () => void;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
    <img
      src={cloudinaryPatchyFed}
      alt=""
      className="iq-pop size-32 object-contain"
    />
    <div
      className="iq-rise flex flex-col gap-1"
      style={{ '--iq-delay': '120ms' } as React.CSSProperties}
    >
      <h2 className="iq-balance font-bold text-text-primary typo-title2">
        You are all set
      </h2>
      <p className="iq-pretty text-text-tertiary typo-callout">
        daily.dev is set up the way it is meant to be used.
      </p>
    </div>
    <RewardTag
      xp={totalRewards.xp}
      cores={totalRewards.cores}
      tone="bold"
      className="iq-rise rounded-max bg-surface-float px-3 py-1.5"
    />
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="iq-rise mt-2"
      onClick={onClose}
    >
      Back to my feed
    </Button>
  </div>
);

export const HideForever = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <button
    type="button"
    className={classNames(
      'text-text-quaternary typo-caption1 hover:text-text-tertiary hover:underline',
      className,
    )}
  >
    Don&apos;t show this again
  </button>
);

export const NativePermissionPrompt = (): ReactElement | null => {
  const { state, allowPermission, blockPermission } = useSim();

  if (state.permission !== 'prompting') {
    return null;
  }

  return (
    <div className="iq-prompt iq-elevated absolute left-24 top-11 z-3 flex w-80 flex-col gap-3 rounded-12 bg-background-popover p-4">
      <p className="text-text-primary typo-footnote">app.daily.dev wants to</p>
      <p className="flex items-center gap-2 text-text-secondary typo-footnote">
        <BellIcon size={IconSize.Size16} />
        Show notifications
      </p>
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-text-quaternary typo-caption2">
          Simulated
        </span>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={blockPermission}
        >
          Block
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          color={ButtonColor.Water}
          size={ButtonSize.Small}
          onClick={allowPermission}
        >
          Allow
        </Button>
      </div>
    </div>
  );
};

export const Toast = (): ReactElement | null => {
  const { state } = useSim();

  if (!state.toast) {
    return null;
  }

  return (
    <div className="iq-rise absolute bottom-6 left-1/2 z-3 -translate-x-1/2 whitespace-nowrap rounded-12 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-footnote">
      {state.toast}
    </div>
  );
};

const FeedBackdrop = (): ReactElement => (
  <div
    aria-hidden
    className="absolute inset-0 grid grid-cols-3 gap-4 p-6 opacity-60 laptop:grid-cols-4"
  >
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="flex h-64 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
      >
        <span className="h-3 w-3/4 rounded-max bg-surface-float" />
        <span className="h-3 w-1/2 rounded-max bg-surface-float" />
        <span className="mt-auto h-28 rounded-12 bg-surface-float" />
      </div>
    ))}
  </div>
);

export const ProgressRing = ({
  size = 20,
}: {
  size?: number;
}): ReactElement => {
  const { doneCount } = useSim();
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = doneCount / introQuests.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        stroke="currentColor"
        className="text-surface-float"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="text-accent-avocado-default transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
};

const HeaderTrigger = (): ReactElement => {
  const { doneCount } = useSim();

  return (
    <div className="absolute inset-x-0 top-0 z-2 flex h-14 items-center justify-end gap-2 border-b border-border-subtlest-tertiary bg-background-default px-6">
      <span className="h-8 w-56 rounded-12 bg-surface-float" />
      <span className="flex-1" />
      <span className="iq-tabular flex h-10 items-center gap-2 rounded-12 bg-surface-hover px-3 font-bold text-text-primary typo-callout">
        <ProgressRing />
        {doneCount}/{introQuests.length}
      </span>
      <span className="size-8 rounded-max bg-surface-float" />
    </div>
  );
};

export const Stage = ({
  children,
  device = 'desktop',
  height = '52rem',
  placement = 'center',
}: {
  children: ReactNode;
  device?: 'desktop' | 'mobile';
  height?: string;
  placement?: 'center' | 'popover' | 'dock';
}): ReactElement => {
  const isMobile = device === 'mobile';
  const isPopover = placement === 'popover' && !isMobile;
  const isDock = placement === 'dock';

  return (
    <div
      className={classNames(
        'relative flex flex-col overflow-hidden border border-border-subtlest-tertiary bg-background-default',
        isMobile ? 'mx-auto w-[23.4375rem] rounded-32' : 'w-full rounded-16',
      )}
      style={{ height: isMobile ? '50.75rem' : height }}
    >
      <IntroMotion />
      {!isMobile && (
        <div className="z-2 flex h-10 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-3">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-max bg-surface-hover" />
            <span className="size-2.5 rounded-max bg-surface-hover" />
            <span className="size-2.5 rounded-max bg-surface-hover" />
          </span>
          <span className="ml-14 flex h-6 w-72 items-center gap-1.5 rounded-8 bg-surface-float px-2 text-text-tertiary typo-caption1">
            <LockIcon size={IconSize.XXSmall} />
            app.daily.dev
          </span>
        </div>
      )}
      <div className="relative flex-1 overflow-hidden">
        <FeedBackdrop />
        {isPopover && <HeaderTrigger />}
        {!isPopover && !isDock && (
          <div className="absolute inset-0 bg-overlay-quaternary-onion" />
        )}
        <div
          className={classNames(
            'absolute inset-0 flex',
            isDock && 'items-end justify-end p-4 tablet:p-6',
            !isDock && isMobile && 'items-end',
            !isDock &&
              !isMobile &&
              !isPopover &&
              'items-center justify-center p-6',
            isPopover && 'items-start justify-end px-6 pb-6 pt-16',
          )}
        >
          {children}
        </div>
        <Toast />
      </div>
      <NativePermissionPrompt />
    </div>
  );
};

export const PopupShell = ({
  children,
  width = '35rem',
  device = 'desktop',
  className,
  bodyClassName,
}: {
  children: ReactNode;
  width?: string;
  device?: 'desktop' | 'mobile';
  className?: string;
  bodyClassName?: string;
}): ReactElement => {
  const isMobile = device === 'mobile';

  return (
    <section
      role="dialog"
      aria-label="Get started with daily.dev"
      className={classNames(
        'iq-rise iq-elevated relative flex max-h-full flex-col overflow-hidden border border-border-subtlest-tertiary bg-background-default',
        isMobile ? 'max-h-[88%] w-full rounded-t-24' : 'rounded-24',
        className,
      )}
      style={isMobile ? undefined : { width }}
    >
      {isMobile && (
        <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-max bg-surface-hover" />
      )}
      <CloseButton
        size={ButtonSize.Small}
        className="!absolute right-3 top-3 z-1"
      />
      <div
        className={classNames(
          'flex min-h-0 flex-1 flex-col overflow-y-auto',
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
};

export const SectionLabel = ({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}): ReactElement => (
  <div className="flex items-baseline justify-between gap-2">
    <p className="font-bold text-text-tertiary typo-caption1">{children}</p>
    {aside}
  </div>
);

export const clickRowCta = (event: React.MouseEvent<HTMLElement>): void => {
  event.currentTarget.querySelector<HTMLElement>('[data-cta]')?.click();
};

export const OpenArrow = (): ReactElement => (
  <ArrowIcon
    aria-hidden
    className="rotate-90 text-text-quaternary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-primary"
  />
);

export { ButtonIconPosition };
