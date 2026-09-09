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
  BulletListIcon,
  FeatherIcon,
  MoveToIcon,
  LinkIcon,
  VIcon,
  TerminalIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useViewSize, ViewSize } from '../../../hooks';
import { isDevelopment, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { contentTargetId, useAgent } from '../AgentContext';
import { interestDisplayName } from '../../../graphql/interests';
import { useShareAgent } from '../hooks/useShareAgent';
import { AgentSettingsMenu } from './AgentSettingsMenu';
import { AgentStatusTile } from './AgentStatusTile';

const headerIcon = (icon: IconType, isOpen = false) =>
  React.cloneElement(icon, {
    size: IconSize.XSmall,
    secondary: isOpen,
    // Keep the incoming className: cloneElement replaces it outright, which
    // silently drops the back arrow's rotation.
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
      // `pressed`, not `aria-pressed`: Button writes its own `aria-pressed`
      // after spreading props, overwriting a raw attribute with undefined.
      pressed={isOpen}
      onClick={onClick}
    />
  </Tooltip>
);

const findingsLabel = 'Findings';

export const AgentWorkspaceHeader = (): ReactElement => {
  const {
    interest,
    openContent,
    openContentTarget,
    focusContent,
    findingsPosts,
  } = useAgent();
  const { user } = useAuthContext();
  const canDebug = isDevelopment || !!user?.isTeamMember;
  const { isCopying, isSharing, onShare } = useShareAgent(interest);
  // `onShare` opens the system sheet on a phone and copies everywhere else.
  const isMobile = !useViewSize(ViewSize.Tablet);
  const shareLabel = isMobile ? 'Share this agent' : 'Copy link';
  const isOpen = (type: string) =>
    openContent.some((item) => item.type === type);
  const togglePanel = (type: 'posts' | 'activity' | 'debug') =>
    isOpen(type) ? focusContent(type) : openContentTarget({ type });
  const findingsTargetId = `feed:${findingsLabel}`;
  const isFindingsOpen = openContent.some(
    (item) => contentTargetId(item) === findingsTargetId,
  );
  const toggleFindings = () =>
    isFindingsOpen
      ? focusContent(findingsTargetId)
      : openContentTarget({
          type: 'feed',
          label: findingsLabel,
          posts: findingsPosts,
        });

  return (
    <FlexRow className="h-12 shrink-0 items-center gap-2 px-3 tablet:px-4">
      <Tooltip content="Back to agents">
        {/* The wrapper holds Radix's ref: `Link` is a plain function component
            and cannot take one. `passHref` because legacyBehavior only injects
            the href into a plain `<a>` child. */}
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
      <h1 className="min-w-0 shrink truncate font-bold typo-footnote">
        {interestDisplayName(interest)}
      </h1>
      <span className="flex-1" />
      <FlexRow className="shrink-0 items-center gap-0.5">
        <Tooltip content={isCopying ? 'Link copied' : shareLabel}>
          <Button
            icon={
              isCopying ? (
                // Not through `headerIcon`: it appends its tertiary ink after
                // the caller's class, and equal specificity lets stylesheet
                // order win, which turned the tick grey.
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
          label="Findings"
          icon={<BulletListIcon />}
          isOpen={isFindingsOpen}
          onClick={toggleFindings}
        />
        <PanelButton
          label="Posts"
          icon={<FeatherIcon />}
          isOpen={isOpen('posts')}
          onClick={() => togglePanel('posts')}
        />
        <PanelButton
          label="Activity"
          icon={<TimerIcon />}
          isOpen={isOpen('activity')}
          onClick={() => togglePanel('activity')}
        />
        {canDebug && (
          // `contents` keeps the button a direct flex child, so it centers on
          // the row instead of sitting on the wrapper's text baseline.
          <span className="hidden tablet:contents">
            <PanelButton
              label="Debug"
              icon={<TerminalIcon />}
              isOpen={isOpen('debug')}
              onClick={() => togglePanel('debug')}
            />
          </span>
        )}
        {/* No Tooltip wrapper: it blurs its child on mouse-up, which dismisses
            this popover as it opens. */}
        <AgentSettingsMenu />
      </FlexRow>
    </FlexRow>
  );
};
