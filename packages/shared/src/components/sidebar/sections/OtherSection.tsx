import React, { ReactElement, useMemo } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import {
  EarthIcon,
  EyeIcon,
  HashtagIcon,
  LinkIcon,
  SquadIcon,
} from '../../icons';
import { Section } from '../Section';
import { isExtension } from '../../../lib/func';
import { locationPush, SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { SidebarSettingsFlags } from '../../../graphql/settings';

export const OtherSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { modal, openModal } = useLazyModal();
  const discoverMenuItems: SidebarMenuItem[] = useMemo(() => {
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: '/tags',
        action: isExtension ? locationPush('/tags') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: '/sources',
        action: isExtension ? locationPush('/sources') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SquadIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: '/users',
        action: isExtension ? locationPush('/users') : undefined,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EyeIcon secondary={active} />} />
        ),
        title: 'History',
        path: `${webappUrl}history`,
        requiresLogin: true,
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
  }, [modal?.type, openModal]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.OtherExpanded}
    />
  );
};
