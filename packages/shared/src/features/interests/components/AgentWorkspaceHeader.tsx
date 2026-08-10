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
  LinkIcon,
  VIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useViewSize, ViewSize } from '../../../hooks';
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
      // `pressed`, not `aria-pressed`: the button spreads incoming props before
      // writing its own `aria-pressed`, so a raw attribute is overwritten by an
      // undefined one and the toggle stops announcing its state.
      pressed={isOpen}
      onClick={onClick}
    />
  </Tooltip>
);

export const AgentWorkspaceHeader = (): ReactElement => {
  const { interest, openContent, openContentTarget, focusContent } = useAgent();
  const { isCopying, isSharing, onShare } = useShareAgent(interest);
  // The hook opens the system sheet on a phone and copies everywhere else, so
  // the label has to say whichever is about to happen.
  const isMobile = !useViewSize(ViewSize.Tablet);
  const shareLabel = isMobile ? 'Share this agent' : 'Copy link';
  const isOpen = (type: string) =>
    openContent.some((item) => item.type === type);
  const togglePanel = (type: 'activity' | 'debug') =>
    isOpen(type) ? focusContent(type) : openContentTarget({ type });

  return (
    // No rule under it: the transcript fades out as it passes underneath
    // instead, the same softening the composer does at the other end.
    <FlexRow className="h-12 shrink-0 items-center gap-2 px-3 tablet:px-4">
      <Tooltip content="Back to agents">
        {/* The wrapper is what holds Radix's ref. `Link` is a plain function
            component, so handing it one logs a warning and leaves the tooltip
            anchored to nothing — and it cannot take `forwardRef` here, being the
            shared wrapper every link in the app goes through.

            `passHref`: legacyBehavior only injects the href into a plain `<a>`
            child, so without it this renders as an anchor with nowhere to go. */}
        <span className="flex">
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
        </span>
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
        {/* A link, not a share glyph: on a desktop this press copies one, and
            the icon should say which of the two it is. It answers by becoming a
            tick — the same control confirming rather than a second one
            arriving — which is the only feedback there is when the toast is a
            corner of the screen away. */}
        <Tooltip content={isCopying ? 'Link copied' : shareLabel}>
          <Button
            icon={
              isCopying ? (
                // Not through `headerIcon`: that helper's job is the header's
                // default ink, and it appends it *after* whatever the caller
                // asked for. Two text-colour utilities of equal specificity —
                // so the stylesheet's order decided, tertiary won, and the tick
                // came out grey.
                <VIcon
                  size={IconSize.XSmall}
                  className="agent-icon-in text-status-success"
                />
              ) : (
                headerIcon(<LinkIcon />)
              )
            }
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            className="group"
            aria-label={isCopying ? 'Link copied' : shareLabel}
            disabled={!interest?.query}
            loading={isSharing}
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
