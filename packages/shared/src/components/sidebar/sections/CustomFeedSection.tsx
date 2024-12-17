import React, { ReactElement, useMemo } from 'react';
import { SidebarMenuItem } from '../common';
import { HashtagIcon, PlusIcon } from '../../icons';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import { useFeeds, usePlusSubscription } from '../../../hooks';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { SidebarSectionProps } from './common';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';

export const CustomFeedSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { feeds } = useFeeds();
  const { openModal } = useLazyModal();
  const { showPlusSubscription, isPlus } = usePlusSubscription();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const customFeeds =
      feeds?.edges?.map((feed) => {
        const feedPath = `${webappUrl}feeds/${feed.node.id}`;
        return {
          title: feed.node.flags.name || `Feed ${feed.node.id}`,
          path: feedPath,
          icon: (
            <HashtagIcon
              secondary={defaultRenderSectionProps.activePage === feedPath}
            />
          ),
        };
      }) ?? [];

    return [
      ...customFeeds,
      {
        icon: () => (
          <div className="rounded-6 bg-background-subtle">
            <PlusIcon />
          </div>
        ),
        title: 'Custom feed',
        path: `${webappUrl}feeds/new`,
        requiresLogin: true,
        isForcedClickable: true,
        action: (
          event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
        ) => {
          if (showPlusSubscription && !isPlus) {
            event.preventDefault();

            openModal({ type: LazyModal.AdvancedCustomFeedSoon, props: {} });
          }
        },
      },
    ].filter(Boolean);
  }, [
    defaultRenderSectionProps.activePage,
    feeds?.edges,
    showPlusSubscription,
    openModal,
    isPlus,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.CustomFeedsExpanded}
    />
  );
};
