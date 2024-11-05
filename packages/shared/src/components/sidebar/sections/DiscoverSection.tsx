import React, { ReactElement, useMemo } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import {
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  LinkIcon,
  SquadIcon,
} from '../../icons';
import { Section } from '../Section';
import { SidebarSectionProps } from './common';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { webappUrl } from '../../../lib/constants';

export const DiscoverSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { completeAction } = useActions();
  const { user } = useAuthContext();
  const { modal, openModal } = useLazyModal();
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: `${webappUrl}tags`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: `${webappUrl}sources`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: `${webappUrl}users`,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
        ),
        title: 'Discussions',
        path: `${webappUrl}discussed`,
        action: () => {
          if (user) {
            completeAction(ActionType.CommentFeed);
          }
        },
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <LinkIcon secondary={active} />} />
        ),
        title: 'Submit a link',
        action: () => openModal({ type: LazyModal.SubmitArticle }),
        active: modal?.type === LazyModal.SubmitArticle,
      },
    ].filter(Boolean);
  }, [completeAction, modal?.type, openModal, user]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.OtherExpanded}
    />
  );
};
