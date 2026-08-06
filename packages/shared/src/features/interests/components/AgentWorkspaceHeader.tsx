import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconType } from '../../../components/buttons/Button';
import { FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { MoveToIcon, TerminalIcon, TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { webappUrl } from '../../../lib/constants';
import { useAgent } from '../AgentContext';
import { AgentSettingsMenu } from './AgentSettingsMenu';
import { AgentStatusTile } from './AgentStatusTile';

// Every control in this row is the same button: Small tertiary, a 20px glyph,
// tertiary ink that lifts to primary on hover. Only the open state departs, and
// only by colour.
const headerIcon = (icon: IconType, isOpen = false) =>
  React.cloneElement(icon, {
    size: IconSize.XSmall,
    secondary: isOpen,
    // Keep the incoming className: cloneElement replaces it outright, which
    // silently dropped the back arrow's rotation.
    className: classNames(
      icon.props.className,
      isOpen
        ? 'text-brand-default'
        : 'text-text-tertiary transition-colors group-hover:text-text-primary',
    ),
  });

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
      icon={headerIcon(icon, isOpen)}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      className="group"
      aria-label={label}
      aria-pressed={isOpen}
      onClick={onClick}
    />
  </Tooltip>
);

export const AgentWorkspaceHeader = (): ReactElement => {
  const { interest, openContent, openContentTarget, focusContent } = useAgent();
  const isOpen = (type: string) =>
    openContent.some((item) => item.type === type);
  const togglePanel = (type: 'activity' | 'debug') =>
    isOpen(type) ? focusContent(type) : openContentTarget({ type });

  return (
    <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4">
      <Tooltip content="Back to agents">
        <Link href={`${webappUrl}agent`}>
          <Button
            tag="a"
            icon={headerIcon(<MoveToIcon className="rotate-180" />)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            className="group"
            aria-label="Back to agents"
          />
        </Link>
      </Tooltip>
      <AgentStatusTile />
      <strong className="min-w-0 shrink truncate typo-footnote">
        {interest?.query ?? 'Your agent'}
      </strong>
      <span className="flex-1" />
      <FlexRow className="shrink-0 items-center gap-0.5">
        <PanelButton
          label="Activity"
          icon={<TimerIcon />}
          isOpen={isOpen('activity')}
          onClick={() => togglePanel('activity')}
        />
        {/* `contents` keeps the button a direct flex child, so it centers on
            the row instead of sitting on the wrapper's text baseline. */}
        <span className="hidden tablet:contents">
          <PanelButton
            label="Debug"
            icon={<TerminalIcon />}
            isOpen={isOpen('debug')}
            onClick={() => togglePanel('debug')}
          />
        </span>
        {/* No tooltip: it is a popover trigger, and Tooltip blurs its child on
            mouse-up, which dismisses the menu as it opens. */}
        <AgentSettingsMenu />
      </FlexRow>
    </FlexRow>
  );
};
