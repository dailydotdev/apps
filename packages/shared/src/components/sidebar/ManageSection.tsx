import React, { ReactElement, useMemo } from 'react';
import {
  BookmarkIcon,
  EyeIcon,
  LinkIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SeoSidebarExperiment } from '../../lib/featureValues';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';

interface ManageSectionProps extends SectionCommonProps {
  isDndActive?: boolean;
  showDnd?: boolean;
  onShowDndClick?: () => void;
  showSettings: boolean;
  onShowSettings: (value: boolean) => void;
}

export function ManageSection({
  isDndActive,
  showDnd,
  onShowDndClick,
  showSettings,
  onShowSettings,
  ...props
}: ManageSectionProps): ReactElement {
  const seoSidebar = useFeature(feature.seoSidebar);
  const isV1Sidebar = seoSidebar === SeoSidebarExperiment.V1;
  const { modal, openModal } = useLazyModal();
  const shouldShowDnD = !!process.env.TARGET_BROWSER;

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

    if (isV1Sidebar) {
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
    }

    if (shouldShowDnD) {
      const DndIcon = isDndActive ? PlayIcon : PauseIcon;
      items.push({
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DndIcon secondary={active} />} />
        ),
        title: 'Pause new tab',
        action: onShowDndClick,
        active: showDnd,
      });
    }

    return [
      ...items,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
        ),
        title: 'Customize',
        action: () => onShowSettings(true),
        active: showSettings,
      },
    ];
  }, [
    isDndActive,
    isV1Sidebar,
    modal?.type,
    onShowDndClick,
    onShowSettings,
    openModal,
    shouldShowDnD,
    showDnd,
    showSettings,
  ]);

  return (
    <Section
      {...props}
      title={isV1Sidebar ? 'Activity' : 'Manage'}
      items={manageMenuItems}
      isItemsButton={false}
    />
  );
}
