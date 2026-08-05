import type { ReactElement } from 'react';
import React from 'react';
import type { IconType } from '../../../components/buttons/Button';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  AiIcon,
  ArrowIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { webappUrl } from '../../../lib/constants';
import { UserInterestStatus } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';
import { AgentStatusChip } from './AgentStatusChip';

const PanelButton = ({
  label,
  icon,
  isOpen,
  onClick,
}: {
  label: string;
  icon: IconType;
  isOpen: boolean;
  onClick: () => void;
}): ReactElement => (
  <Tooltip content={label}>
    <Button
      icon={icon}
      size={ButtonSize.XSmall}
      variant={isOpen ? ButtonVariant.Float : ButtonVariant.Tertiary}
      aria-label={label}
      aria-pressed={isOpen}
      onClick={onClick}
    />
  </Tooltip>
);

export const AgentWorkspaceHeader = (): ReactElement => {
  const {
    interest,
    update,
    setSettingsOpen,
    openContent,
    openContentTarget,
    focusContent,
  } = useAgent();
  const isPaused = interest?.status !== UserInterestStatus.Active;
  const isOpen = (type: string) =>
    openContent.some((item) => item.type === type);
  const togglePanel = (type: 'activity' | 'debug') =>
    isOpen(type) ? focusContent(type) : openContentTarget({ type });

  return (
    <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-2 tablet:px-3">
      <Link href={`${webappUrl}agent`}>
        <Button
          tag="a"
          icon={<ArrowIcon className="-rotate-90" />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          aria-label="Back to agents"
        />
      </Link>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-action-bookmark-float">
        <AiIcon size={IconSize.XSmall} className="text-brand-default" />
      </span>
      <FlexCol className="min-w-0 flex-1">
        <strong className="min-w-0 truncate typo-footnote">
          {interest?.query ?? 'Your agent'}
        </strong>
      </FlexCol>
      <AgentStatusChip compact />
      <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-border-subtlest-tertiary tablet:block" />
      <PanelButton
        label="Activity"
        icon={<TimerIcon />}
        isOpen={isOpen('activity')}
        onClick={() => togglePanel('activity')}
      />
      <span className="hidden tablet:block">
        <PanelButton
          label="Debug"
          icon={<TerminalIcon />}
          isOpen={isOpen('debug')}
          onClick={() => togglePanel('debug')}
        />
      </span>
      <Tooltip content={isPaused ? 'Resume agent' : 'Pause agent'}>
        <Button
          icon={isPaused ? <PlayIcon /> : <PauseIcon />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          aria-label={isPaused ? 'Resume agent' : 'Pause agent'}
          onClick={() =>
            update({
              status: isPaused
                ? UserInterestStatus.Active
                : UserInterestStatus.Paused,
            })
          }
        />
      </Tooltip>
      <Tooltip content="Agent settings">
        <Button
          icon={<SettingsIcon />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          aria-label="Agent settings"
          onClick={() => setSettingsOpen(true)}
        />
      </Tooltip>
    </FlexRow>
  );
};
