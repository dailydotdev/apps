import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { SidebarAside } from './common';
import { LogoPosition } from '../Logo';
import Link from '../utilities/Link';
import {
  isTesting,
  squadCategoriesPaths,
  webappUrl,
} from '../../lib/constants';
import {
  AiIcon,
  BellIcon,
  HomeIcon,
  JobIcon,
  MegaphoneIcon,
  SourceIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { CreatePostButton } from '../post/write';
import { useAuthContext } from '../../contexts/AuthContext';
import useActiveNav from '../../hooks/useActiveNav';
import { getFeedName } from '../../lib/feed';
import { useAlertsContext } from '../../contexts/AlertContext';
import HeaderLogo from '../layout/HeaderLogo';
import { useActions } from '../../hooks';
import { Bubble } from '../tooltips/utils';
import { NewOpportunityPopover } from '../opportunity/NewOpportunityPopover';
import { SimpleTooltip } from '../tooltips';
import ConditionalWrapper from '../ConditionalWrapper';
import { useLogOpportunityNudgeClick } from '../../hooks/log/useLogOpportunityNudgeClick';
import { TargetId } from '../../lib/log';
import { ActionType } from '../../graphql/actions';
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { getUnreadText } from '../notifications/utils';

export const SidebarTablet = ({
  activePage,
  featureTheme,
  onLogoClick,
}: {
  activePage: string;
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  onLogoClick?: (e: React.MouseEvent) => unknown;
}): ReactElement => {
  const { alerts } = useAlertsContext();
  const { user, isLoggedIn, squads } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const buttonProps: ButtonProps<'a' | 'button'> = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
    className:
      'w-full !bg-transparent active:bg-transparent aria-pressed:bg-transparent typo-caption1',
  };
  const feedName = getFeedName(activePage, {
    hasUser: !!user,
    hasFiltered: !alerts?.filter,
  });
  const hasSquads = (squads?.length ?? 0) > 0;
  const squadsUrl = hasSquads
    ? `${webappUrl}${squadCategoriesPaths['My Squads'].substring(1)}`
    : `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`;
  const activeNav = useActiveNav(feedName);
  const hasOpportunityAlert = !!alerts.opportunityId;
  const { checkHasCompleted } = useActions();
  const hasNotClickedOpportunity = !checkHasCompleted(
    ActionType.ClickedOpportunityNavigation,
  );
  const logOpportunityNudgeClick = useLogOpportunityNudgeClick(
    TargetId.Sidebar,
  );

  return (
    <SidebarAside
      data-testid="sidebar-aside"
      className={classNames(
        'w-16 items-center gap-4',
        featureTheme && 'bg-transparent',
      )}
    >
      <HeaderLogo
        compact
        position={LogoPosition.Relative}
        onLogoClick={onLogoClick}
        className={classNames('h-10 pt-4')}
      />
      <Link href={`${webappUrl}`} prefetch={false} passHref>
        <Button
          {...buttonProps}
          tag="a"
          icon={<HomeIcon secondary={activeNav.home} size={IconSize.Medium} />}
          iconPosition={ButtonIconPosition.Top}
          variant={ButtonVariant.Option}
          pressed={activeNav.home}
        >
          Home
        </Button>
      </Link>

      <Link href={`${webappUrl}posts`} prefetch={false} passHref>
        <Button
          {...buttonProps}
          tag="a"
          icon={<AiIcon secondary={activeNav.explore} size={IconSize.Medium} />}
          iconPosition={ButtonIconPosition.Top}
          variant={ButtonVariant.Option}
          pressed={activeNav.explore}
        >
          Explore
        </Button>
      </Link>

      <Link href={`${webappUrl}highlights`} prefetch={false} passHref>
        <Button
          {...buttonProps}
          tag="a"
          icon={
            <MegaphoneIcon
              secondary={activeNav.highlights}
              size={IconSize.Medium}
            />
          }
          iconPosition={ButtonIconPosition.Top}
          variant={ButtonVariant.Option}
          pressed={activeNav.highlights}
        >
          Headlines
        </Button>
      </Link>

      <Link href={`${webappUrl}notifications`} prefetch={false} passHref>
        <Button
          {...buttonProps}
          tag="a"
          icon={
            <span className="relative">
              <BellIcon
                secondary={activeNav.notifications}
                size={IconSize.Medium}
              />
              {!!unreadCount && (
                <Bubble className="-right-1.5 -top-1.5 cursor-pointer px-1">
                  {getUnreadText(unreadCount)}
                </Bubble>
              )}
            </span>
          }
          iconPosition={ButtonIconPosition.Top}
          variant={ButtonVariant.Option}
          pressed={activeNav.notifications}
        >
          Activity
        </Button>
      </Link>

      <Link href={squadsUrl} prefetch={false} passHref>
        <Button
          {...buttonProps}
          tag="a"
          icon={
            <SourceIcon secondary={activeNav.squads} size={IconSize.Medium} />
          }
          iconPosition={ButtonIconPosition.Top}
          variant={ButtonVariant.Option}
          pressed={activeNav.squads}
        >
          Squads
        </Button>
      </Link>

      <ConditionalWrapper
        condition={hasOpportunityAlert && hasNotClickedOpportunity}
        wrapper={(component) => (
          <SimpleTooltip
            interactive
            placement="right-start"
            forceLoad={!isTesting}
            visible
            showArrow={false}
            container={{
              bgClassName: 'bg-background-popover',
              className:
                'border border-accent-onion-default !rounded-12 w-full',
            }}
            content={<NewOpportunityPopover />}
          >
            {component as ReactElement}
          </SimpleTooltip>
        )}
      >
        <div className="relative">
          <Link
            href={
              hasOpportunityAlert
                ? `${webappUrl}jobs/${alerts.opportunityId}`
                : `${webappUrl}jobs`
            }
            prefetch={false}
            passHref
          >
            <Button
              {...buttonProps}
              tag="a"
              icon={
                <JobIcon secondary={activeNav.jobs} size={IconSize.Medium} />
              }
              iconPosition={ButtonIconPosition.Top}
              variant={ButtonVariant.Option}
              pressed={activeNav.jobs}
              onClick={logOpportunityNudgeClick}
            >
              Jobs
              {hasOpportunityAlert && (
                <Bubble className="-right-0.5 -top-1.5 cursor-pointer !rounded-full !bg-accent-bacon-default px-1">
                  1
                </Bubble>
              )}
            </Button>
          </Link>
        </div>
      </ConditionalWrapper>

      {isLoggedIn && user && (
        <Link href={user.permalink} prefetch={false} passHref>
          <Button
            {...buttonProps}
            tag="a"
            icon={
              <UserIcon secondary={activeNav.profile} size={IconSize.Medium} />
            }
            iconPosition={ButtonIconPosition.Top}
            variant={ButtonVariant.Option}
            pressed={activeNav.profile}
          >
            Profile
          </Button>
        </Link>
      )}

      <CreatePostButton compact sidebar />
    </SidebarAside>
  );
};
