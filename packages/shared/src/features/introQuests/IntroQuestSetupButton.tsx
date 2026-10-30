import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserQuest } from '../../graphql/quests';
import { ButtonSize } from '../../components/buttons/common';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useViewSize, ViewSize } from '../../hooks';
import { LazyModal } from '../../components/modals/common/types';
import { ShellSquare } from '../../components/shell/ShellSquare';
import { isIntroQuestDone } from './introQuestSteps';
import { useIntroQuestEntry } from './useIntroQuestEntry';

const ProgressRing = ({
  done,
  total,
  size,
}: {
  done: number;
  total: number;
  size: number;
}): ReactElement => {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        stroke="currentColor"
        className="text-text-disabled"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - done / total)}
        transform={`rotate(-90 ${center} ${center})`}
        className="text-accent-avocado-default transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
};

const useSetupButton = (quests: UserQuest[]) => {
  const { openModal } = useLazyModal();
  const done = quests.filter(isIntroQuestDone).length;
  const hasReward = quests.some(({ claimable }) => claimable);

  return {
    done,
    label: `Set up daily.dev, ${done} of ${quests.length} done${
      hasReward ? ', reward waiting' : ''
    }`,
    rewardDot: hasReward && (
      <span
        aria-hidden
        className="absolute -right-0.5 -top-0.5 size-2.5 rounded-max border-2 border-background-default bg-accent-avocado-default"
      />
    ),
    open: () => openModal({ type: LazyModal.IntroQuestChecklist }),
  };
};

const RingWithCount = ({
  done,
  total,
}: {
  done: number;
  total: number;
}): ReactElement => (
  <>
    <ProgressRing done={done} total={total} size={28} />
    <span className="absolute font-bold tabular-nums text-text-primary typo-caption2">
      {total - done}
    </span>
  </>
);

export const IntroQuestSetupButton = ({
  quests,
  size = ButtonSize.Medium,
}: {
  quests: UserQuest[];
  size?: ButtonSize;
}): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isSmall = size === ButtonSize.Small;
  const { done, label, rewardDot, open } = useSetupButton(quests);

  if (!isLaptop) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={open}
        className={classNames(
          'relative flex items-center justify-center hover:bg-surface-hover',
          isSmall ? 'size-8 rounded-10' : 'size-10 rounded-12',
        )}
      >
        <RingWithCount done={done} total={quests.length} />
        {rewardDot}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={open}
      className={classNames(
        'relative flex items-center gap-2 bg-surface-float pl-2 pr-3 font-bold text-text-primary hover:bg-surface-hover',
        isSmall
          ? 'h-8 rounded-10 typo-footnote'
          : 'h-10 rounded-12 typo-callout',
      )}
    >
      <ProgressRing
        done={done}
        total={quests.length}
        size={isSmall ? 20 : 24}
      />
      Setup
      <span className="tabular-nums text-text-tertiary">
        {done}/{quests.length}
      </span>
      {rewardDot}
    </button>
  );
};

export const IntroQuestShellButton = (): ReactElement | null => {
  const { introQuests, isChecklist } = useIntroQuestEntry();
  const { done, label, rewardDot, open } = useSetupButton(introQuests);

  if (!isChecklist) {
    return null;
  }

  return (
    <ShellSquare aria-label={label} onClick={open}>
      <RingWithCount done={done} total={introQuests.length} />
      {rewardDot}
    </ShellSquare>
  );
};
