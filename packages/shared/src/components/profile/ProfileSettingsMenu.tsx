import React, { ReactElement, useMemo } from 'react';
import {
  AddUserIcon,
  BellIcon,
  CardIcon,
  EditIcon,
  LockIcon,
  MenuIcon,
  DevCardIcon,
  ExitIcon,
  EmbedIcon,
  LinkIcon,
  DocsIcon,
  TerminalIcon,
  FeedbackIcon,
  HammerIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import {
  docs,
  feedback,
  privacyPolicy,
  termsOfService,
} from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import type { LazyModalType } from '../modals/common';
import { anchorDefaultRel } from '../../lib/strings';
import type { NavItemProps } from '../drawers/NavDrawerItem';
import { LogoutReason } from '../../lib/user';

const createMenuItems = (
  logout: (reason: string) => Promise<void>,
  openModal: (data: LazyModalType<LazyModal>) => void,
): NavItemProps[] => {
  return [
    {
      label: 'Profile',
      isHeader: true,
    },
    { label: 'Edit profile', icon: <EditIcon />, href: '/account/profile' },
    { label: 'Invite friends', icon: <AddUserIcon />, href: '/account/invite' },
    { label: 'Devcard', icon: <DevCardIcon />, href: '/devcard' },
    {
      label: 'Logout',
      icon: <ExitIcon />,
      onClick: () => logout(LogoutReason.ManualLogout),
    },
    {
      label: 'Manage',
      isHeader: true,
    },
    {
      label: 'Customize',
      icon: <CardIcon />,
      onClick: () => openModal({ type: LazyModal.UserSettings }),
    },
    { label: 'Security', icon: <LockIcon />, href: '/account/security' },
    {
      label: 'Notifications',
      icon: <BellIcon />,
      href: '/account/notifications',
    },
    {
      label: 'Other settings',
      icon: <MenuIcon className="rotate-90" />,
      href: '/account/others',
    },
    {
      label: 'Contribute',
      isHeader: true,
    },
    {
      label: 'Submit article',
      icon: <LinkIcon />,
      onClick: () => openModal({ type: LazyModal.SubmitArticle }),
    },
    {
      label: 'Suggest new source',
      icon: <EmbedIcon />,
      onClick: () => openModal({ type: LazyModal.NewSource }),
    },
    {
      label: 'Support',
      isHeader: true,
    },
    {
      label: 'Docs',
      icon: <DocsIcon />,
      href: docs,
      target: '_blank',
      rel: anchorDefaultRel,
    },
    {
      label: 'Changelog',
      icon: <TerminalIcon />,
      href: '/sources/daily_updates',
    },
    {
      label: 'Feedback',
      icon: <FeedbackIcon />,
      href: feedback,
      target: '_blank',
      rel: anchorDefaultRel,
    },
    {
      label: 'Privacy policy',
      icon: <DocsIcon />,
      href: privacyPolicy,
      target: '_blank',
      rel: anchorDefaultRel,
    },
    {
      label: 'Terms of service',
      icon: <HammerIcon />,
      href: termsOfService,
      target: '_blank',
      rel: anchorDefaultRel,
    },
  ];
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  logout?: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function ProfileSettingsMenu({
  isOpen,
  logout,
  onClose,
}: ProfileSettingsMenuProps): ReactElement {
  const { openModal } = useLazyModal();

  const profileSettingsMenuItems = useMemo(
    () => createMenuItems(logout, openModal),
    [logout, openModal],
  );

  return (
    <NavDrawer
      header="Settings"
      drawerProps={{
        isOpen,
        onClose,
      }}
      items={profileSettingsMenuItems}
    />
  );
}
