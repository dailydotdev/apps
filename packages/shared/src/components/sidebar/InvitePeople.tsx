import React, { ReactElement, useContext, useState } from 'react';
import { ItemInner, ListIcon, NavItem, SidebarMenuItem } from './common';
import UserShareIcon from '../icons/UserShare';
import AuthContext from '../../contexts/AuthContext';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ClickableNavItem } from './ClickableNavItem';
import { SectionCommonProps } from './Section';

const DEFAULT_INVITE_LINK = 'https://daily.dev/';
const INVITE_TEXT = `I'm using daily.dev to stay updated on developer news. I think you will find it helpful:`;

export default function InvitePeople({
  sidebarExpanded,
  shouldShowLabel,
}: Pick<
  SectionCommonProps,
  'sidebarExpanded' | 'shouldShowLabel'
>): ReactElement {
  const [visible, setVisible] = useState(false);
  const { user } = useContext(AuthContext);

  const inviteLink = user?.referralLink
    ? user?.referralLink
    : DEFAULT_INVITE_LINK;
  const [copyingLink, onShareOrCopyLink] = useShareOrCopyLink({
    text: INVITE_TEXT,
    link: inviteLink,
    trackObject: () => ({ event_name: 'invite people' }),
  });
  const tooltipBg = copyingLink ? 'bg-theme-status-success' : undefined;
  const item: SidebarMenuItem = {
    icon: () => (
      <ListIcon Icon={() => <UserShareIcon secondary={copyingLink} />} />
    ),
    title: copyingLink ? 'Link copied to clipboard' : 'Invite people',
    action: onShareOrCopyLink,
    tooltip: { visible, container: { bgClassName: tooltipBg } },
  };
  return (
    <NavItem color={copyingLink && 'text-theme-status-success'}>
      <ClickableNavItem
        item={item}
        onMouseEnter={() => !sidebarExpanded && !visible && setVisible(true)}
        onMouseOut={() => !sidebarExpanded && visible && setVisible(false)}
      >
        <ItemInner item={item} shouldShowLabel={shouldShowLabel} />
      </ClickableNavItem>
    </NavItem>
  );
}
