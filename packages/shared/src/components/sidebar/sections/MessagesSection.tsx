import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { createSidebarSeparatorItem, ListIcon } from '../common';
import { Section } from '../Section';
import { SidebarCountBadge } from '../SidebarCountBadge';
import type { SidebarSectionProps } from './common';
import { LfgSection } from './LfgSection';
import { MailIcon } from '../../icons/Mail';
import { SettingsIcon } from '../../icons/Settings';
import { VolunteeringIcon } from '../../icons/Volunteering';
import { useLfgEnabled } from '../../../features/lfg/hooks/useLfgEnabled';
import { useUnreadMessagesCount } from '../../../features/messages/hooks/useUnreadMessagesCount';
import { useMessagesEnabled } from '../../../features/messages/hooks/useMessagesEnabled';
import {
  getMessagesUrl,
  messageSettingsUrl,
} from '../../../features/messages/urls';

// The Messages tab's panel: the inbox and its requests, then Looking for
// group, whose every reach-out turns into a chat.
export const MessagesSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { activePage } = defaultRenderSectionProps;
  const { isEnabled: showLfg } = useLfgEnabled();
  const { isEnabled: isMessagesEnabled } = useMessagesEnabled();
  const { unread, requests } = useUnreadMessagesCount(isMessagesEnabled);
  // Chats and Requests are the same route, told apart by the tab query, so
  // neither can use the path match.
  const path = activePage.replace(/^https?:\/\/[^/]+/, '');
  const isMessagesPage = /^\/messages(?:[/?#]|$)/.test(path);
  const isRequestsTab = /[?&]tab=requests(?:&|#|$)/.test(path);

  const inboxItems: SidebarMenuItem[] = useMemo(
    () => [
      {
        title: 'Chats',
        path: getMessagesUrl(),
        isForcedLink: true,
        active: isMessagesPage && !isRequestsTab,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <MailIcon secondary={active} />} />
        ),
        rightIcon: unread
          ? () => <SidebarCountBadge count={unread} />
          : undefined,
      },
      {
        title: 'Requests',
        path: getMessagesUrl(undefined, { requests: true }),
        isForcedLink: true,
        active: isMessagesPage && isRequestsTab,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <VolunteeringIcon secondary={active} />} />
        ),
        rightIcon: requests
          ? () => <SidebarCountBadge count={requests} />
          : undefined,
      },
    ],
    [isMessagesPage, isRequestsTab, requests, unread],
  );

  const settingsItems: SidebarMenuItem[] = useMemo(
    () => [
      createSidebarSeparatorItem('messages-settings-divider'),
      {
        title: 'Message settings',
        path: messageSettingsUrl,
        isForcedLink: true,
        showOpenLinkIcon: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Section
        {...defaultRenderSectionProps}
        items={inboxItems}
        isItemsButton={false}
      />
      {showLfg && (
        <LfgSection
          {...defaultRenderSectionProps}
          isItemsButton={isItemsButton}
        />
      )}
      <Section
        {...defaultRenderSectionProps}
        items={settingsItems}
        isItemsButton={false}
      />
    </>
  );
};
