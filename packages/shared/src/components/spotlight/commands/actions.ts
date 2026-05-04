import type { NextRouter } from 'next/router';
import {
  BookmarkIcon,
  EyeIcon,
  KeyReferralIcon,
  MegaphoneIcon,
  PowerIcon,
} from '../../icons';
import { LazyModal } from '../../modals/common/types';
import type { LazyModalType, ModalsType } from '../../modals/common';
import type { LoggedUser } from '../../../lib/user';
import { LogoutReason } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface ActionsContext {
  router: Pick<NextRouter, 'push'>;
  openModal: <K extends keyof ModalsType>(data: LazyModalType<K>) => void;
  logout: (reason: string) => Promise<void>;
  user?: Pick<LoggedUser, 'username' | 'id'> | null;
  copyToClipboard?: (text: string) => Promise<void> | void;
}

export const getActionsCommands = ({
  router,
  openModal,
  logout,
  user,
  copyToClipboard,
}: ActionsContext): SpotlightCommand[] => {
  const commands: SpotlightCommand[] = [
    {
      id: 'actions.reading-history',
      title: 'Open reading history',
      icon: EyeIcon,
      keywords: ['history', 'recently read'],
      group: SpotlightGroup.Actions,
      requiresAuth: true,
      perform: () => {
        router.push(`${webappUrl}history`);
      },
    },
    {
      id: 'actions.ads-dashboard',
      title: 'Open ads dashboard',
      subtitle: 'Manage post boosts and campaigns',
      icon: MegaphoneIcon,
      keywords: ['ads', 'boost', 'campaigns'],
      group: SpotlightGroup.Actions,
      requiresAuth: true,
      perform: () => {
        openModal({ type: LazyModal.AdsDashboard });
      },
    },
    {
      id: 'actions.move-bookmark',
      title: 'Manage bookmarks',
      icon: BookmarkIcon,
      keywords: ['bookmarks', 'folders'],
      group: SpotlightGroup.Actions,
      requiresAuth: true,
      perform: () => {
        router.push(`${webappUrl}bookmarks`);
      },
    },
  ];

  if (user?.username && copyToClipboard) {
    commands.push({
      id: 'actions.copy-referral',
      title: 'Copy referral link',
      subtitle: 'Invite friends and earn referrals',
      icon: KeyReferralIcon,
      keywords: ['invite', 'referral', 'share'],
      group: SpotlightGroup.Actions,
      requiresAuth: true,
      perform: async () => {
        await copyToClipboard(
          `${webappUrl}join?cid=referral&userid=${user.id}`,
        );
      },
    });
  }

  commands.push({
    id: 'actions.logout',
    title: 'Log out',
    icon: PowerIcon,
    keywords: ['sign out', 'logout'],
    group: SpotlightGroup.Actions,
    destructive: true,
    requiresAuth: true,
    perform: async () => {
      await logout(LogoutReason.ManualLogout);
    },
  });

  return commands;
};
