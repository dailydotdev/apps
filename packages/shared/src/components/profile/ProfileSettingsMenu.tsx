import React, { ReactElement, useCallback, useMemo } from 'react';
import {
  AddUserIcon,
  BellIcon,
  CardIcon,
  EditIcon,
  LockIcon,
  DevCardIcon,
  ExitIcon,
  EmbedIcon,
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
import { anchorDefaultRel } from '../../lib/strings';
import type { NavItemProps } from '../drawers/NavDrawerItem';
import { LogoutReason } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrompt } from '../../hooks/usePrompt';
import { ButtonColor } from '../buttons/Button';

const useMenuItems = (): NavItemProps[] => {
  const { logout } = useAuthContext();
  const { openModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const onLogout = useCallback(async () => {
    const shouldLogout = await showPrompt({
      title: 'Are you sure?',
      className: { buttons: 'mt-5 flex-col-reverse' },
      okButton: { title: 'Logout', color: ButtonColor.Ketchup },
    });

    if (shouldLogout) {
      logout(LogoutReason.ManualLogout);
    }
  }, [logout, showPrompt]);

  return useMemo(
    () => [
      {
        label: 'Profile',
        isHeader: true,
      },
      { label: 'Edit profile', icon: <EditIcon />, href: '/account/profile' },
      {
        label: 'Invite friends',
        icon: <AddUserIcon />,
        href: '/account/invite',
      },
      { label: 'Devcard', icon: <DevCardIcon />, href: '/devcard' },
      {
        label: 'Logout',
        icon: <ExitIcon />,
        onClick: onLogout,
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
        label: 'Contribute',
        isHeader: true,
      },
      {
        label: 'Community picks',
        icon: <DocsIcon />,
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
    ],
    [onLogout, openModal],
  );
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export function ProfileSettingsMenu({
  isOpen,
  onClose,
  shouldKeepOpen,
}: ProfileSettingsMenuProps): ReactElement {
  return (
    <NavDrawer
      header="Settings"
      shouldKeepOpen={shouldKeepOpen}
      drawerProps={{
        isOpen,
        onClose,
      }}
      items={useMenuItems()}
    />
  );
}
