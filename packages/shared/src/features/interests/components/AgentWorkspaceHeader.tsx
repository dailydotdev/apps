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
import {
  MoveToIcon,
  ShareIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { webappUrl } from '../../../lib/constants';
import { useAgent } from '../AgentContext';
import { useShareAgent } from '../hooks/useShareAgent';
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
  const { isCopying, onShare } = useShareAgent(interest);
  const isOpen = (type: string) =>
    openContent.some((item) => item.type === type);
  const togglePanel = (type: 'activity' | 'debug') =>
    isOpen(type) ? focusContent(type) : openContentTarget({ type });

  return (
    // No rule under it: the transcript fades out as it passes underneath
    // instead, the same softening the composer does at the other end.
    <FlexRow className="h-12 shrink-0 items-center gap-2 px-3 tablet:px-4">
      <Tooltip content="Back to agents">
        {/* `passHref`: legacyBehavior only injects the href into a plain `<a>`
            child, so without it this renders as an anchor with nowhere to go. */}
        <Link href={`${webappUrl}agent`} passHref>
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
      {/* The page's heading now that the transcript no longer opens with one:
          the name is only written once, and this is where it is written. */}
      <h1 className="min-w-0 shrink truncate font-bold typo-footnote">
        {interest?.query ?? 'Your agent'}
      </h1>
      <span className="flex-1" />
      <FlexRow className="shrink-0 items-center gap-0.5">
        {/* What travels is the standing prompt, not this transcript — see
            `useShareAgent`. Sits with the panel buttons rather than shouting
            from the middle of the row: it is there when it is wanted. */}
        <Tooltip content={isCopying ? 'Link copied' : 'Share this agent'}>
          <Button
            icon={headerIcon(<ShareIcon />)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            className="group"
            aria-label="Share this agent"
            disabled={!interest?.query}
            onClick={onShare}
          />
        </Tooltip>
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
