import React, { ReactElement, useMemo } from 'react';
import { BookmarkIcon, EyeIcon, LinkIcon } from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';

interface ActivitySectionProps extends SectionCommonProps {
  isDndActive?: boolean;
  showDnd?: boolean;
  onShowDndClick?: () => void;
  showSettings: boolean;
  onShowSettings: (value: boolean) => void;
}

export function ActivitySection({
  isDndActive,
  showDnd,
  onShowDndClick,
  showSettings,
  onShowSettings,
  ...props
}: ActivitySectionProps): ReactElement {
  const { modal, openModal } = useLazyModal();

  const manageMenuItems: SidebarMenuItem[] = useMemo(() => {
    const items: SidebarMenuItem[] = [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
        ),
        title: 'Bookmarks',
        path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}bookmarks`,
        hideOnMobile: true,
        requiresLogin: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EyeIcon secondary={active} />} />
        ),
        title: 'History',
        path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}history`,
        requiresLogin: true,
      },
    ];

    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <LinkIcon secondary={active} />} />
        ),
        title: 'Submit a link',
        action: () => openModal({ type: LazyModal.SubmitArticle }),
        active: modal?.type === LazyModal.SubmitArticle,
      },
      ...items,
    ];
  }, [modal?.type, openModal]);

  return (
    <Section
      {...props}
      title="Activity"
      items={manageMenuItems}
      isItemsButton={false}
    />
  );
}
