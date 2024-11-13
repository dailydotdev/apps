import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { SidebarAside } from './common';
import { LogoPosition } from '../Logo';
import Link from '../utilities/Link';
import { squadCategoriesPaths, webappUrl } from '../../lib/constants';
import { AiIcon, HomeIcon, SourceIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import { CreatePostButton } from '../post/write';
import { useAuthContext } from '../../contexts/AuthContext';
import useActiveNav from '../../hooks/useActiveNav';
import { getFeedName } from '../../lib/feed';
import { useAlertsContext } from '../../contexts/AlertContext';
import { UpgradeToPlus } from '../UpgradeToPlus';
import HeaderLogo from '../layout/HeaderLogo';

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
  const hasSquads = squads?.length > 0;
  const squadsUrl = hasSquads
    ? `${webappUrl}${squadCategoriesPaths['My Squads'].substring(1)}`
    : `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`;
  const activeNav = useActiveNav(feedName);

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
      {!user?.isPlus && <UpgradeToPlus iconOnly />}
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

      {isLoggedIn && (
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
