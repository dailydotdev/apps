import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { CompassIcon, EarthIcon, HashtagIcon } from '../../icons';
import { MedalIcon } from '../../icons/Medal';
import { AgentIcon } from '../../icons/Agent';
import { AppIcon } from '../../icons/App';
import { Section } from '../Section';
import { AlertColor, AlertDot } from '../../AlertDot';
import type { SidebarSectionProps } from './common';
import { MARKETPLACE_DOT_ACCOUNTS_BEFORE } from './common';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useConditionalFeature } from '../../../hooks';
import { featureInterestAgent } from '../../../lib/featureManagement';
import { ActionType } from '../../../graphql/actions';
import { webappUrl } from '../../../lib/constants';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';
import { OtherFeedPage } from '../../../lib/query';
import { useLayoutV2Fixes } from '../../../hooks/layout/useLayoutV2Fixes';

interface DiscoverSectionProps extends SidebarSectionProps {
  onNavTabClick?: (tab: string) => void;
  // Extra rows injected right after "Explore" (e.g. the v2 Explore panel slots
  // Happening Now between Explore and Tags).
  itemsAfterExplore?: SidebarMenuItem[];
}

export const DiscoverSection = ({
  isItemsButton,
  onNavTabClick,
  itemsAfterExplore,
  ...defaultRenderSectionProps
}: DiscoverSectionProps): ReactElement => {
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const isLayoutV2Fixes = useLayoutV2Fixes();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isLoggedIn,
  });
  const showMarketplaceDot =
    !!user?.createdAt &&
    new Date(user.createdAt) < MARKETPLACE_DOT_ACCOUNTS_BEFORE &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.MarketplaceSidebarClick);
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const marketplace: SidebarMenuItem = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <AppIcon secondary={active} />} />
      ),
      alert: showMarketplaceDot ? (
        <AlertDot className="right-2 top-1" color={AlertColor.Cabbage} />
      ) : undefined,
      action: () => {
        logEvent({
          event_name: LogEvent.OpenMarketplace,
          target_id: TargetId.Sidebar,
        });
        if (showMarketplaceDot) {
          completeAction(ActionType.MarketplaceSidebarClick);
        }
      },
      title: 'Marketplace',
      path: `${webappUrl}marketplace`,
      isForcedLink: true,
    };

    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <CompassIcon secondary={active} />} />
        ),
        title: 'Explore',
        // Bare path (not webappUrl) so it active-matches the in-place Explore
        // feed on the extension new tab; `onNavTabClick` switches the feed
        // client-side, so this must render as a button, not a link.
        path: '/posts',
        action: () => onNavTabClick?.(OtherFeedPage.Explore),
      },
      ...(itemsAfterExplore ?? []),
      // The layout v2 fixes experiment lifts Marketplace into the top group.
      isLayoutV2Fixes && marketplace,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
        ),
        title: 'Tags',
        path: `${webappUrl}tags`,
        isForcedLink: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EarthIcon secondary={active} />} />
        ),
        title: 'Sources',
        path: `${webappUrl}sources`,
        isForcedLink: true,
      },
      !isLayoutV2Fixes && marketplace,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MedalIcon secondary={active} />} />
        ),
        title: 'Leaderboard',
        path: `${webappUrl}users`,
        isForcedLink: true,
      },
      showAgent && {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <AgentIcon secondary={active} />} />
        ),
        title: 'Agents',
        path: `${webappUrl}agent`,
        isForcedLink: true,
        requiresLogin: true,
      },
    ].filter(Boolean) as SidebarMenuItem[];
  }, [
    completeAction,
    logEvent,
    onNavTabClick,
    itemsAfterExplore,
    isLayoutV2Fixes,
    showAgent,
    showMarketplaceDot,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.OtherExpanded}
    />
  );
};
