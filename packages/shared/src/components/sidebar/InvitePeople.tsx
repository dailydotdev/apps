import React, { ReactElement, useContext, useState } from 'react';
import { useCopyLink } from '../../hooks/useCopyLink';
import {
  ButtonOrLink,
  ItemInner,
  ListIcon,
  NavItem,
  SidebarMenuItem,
} from './common';
import UserShareIcon from '../../../icons/user_share.svg';
import UserShareFilledIcon from '../../../icons/filled/user_share.svg';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';

const DEFAULT_INVITE_LINK = 'https://daily.dev/';
const INVITE_TEXT = `I'm using daily.dev to stay updated on developer news. I think you will find it helpful:`;

interface OnInivitePeopleProps {
  inviteLink: string;
  copyLink: () => Promise<void>;
  trackInvite: () => void;
}

const onInvitePeople = async ({
  copyLink,
  inviteLink,
  trackInvite,
}: OnInivitePeopleProps) => {
  trackInvite();
  if ('share' in navigator) {
    try {
      await navigator.share({
        text: INVITE_TEXT,
        url: inviteLink,
      });
    } catch (err) {
      // Do nothing
    }
  } else {
    copyLink();
  }
};

export default function InvitePeople({
  sidebarExpanded,
}: {
  sidebarExpanded: boolean;
}): ReactElement {
  const [visible, setVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const trackInvite = () => {
    trackEvent({
      event_name: 'invite people',
    });
  };

  const inviteLink = user?.referralLink
    ? user?.referralLink
    : DEFAULT_INVITE_LINK;
  const [copyingLink, copyLink] = useCopyLink(() => inviteLink);
  const tooltipBg = copyingLink ? 'bg-theme-status-success' : undefined;

  const item: SidebarMenuItem = {
    icon: <ListIcon Icon={copyingLink ? UserShareFilledIcon : UserShareIcon} />,
    title: copyingLink ? 'Link copied to clipboard' : 'Invite people',
    action: () => onInvitePeople({ copyLink, inviteLink, trackInvite }),
    tooltip: { visible, container: { bgClassName: tooltipBg } },
  };
  return (
    <NavItem color={copyingLink && 'text-theme-status-success'}>
      <ButtonOrLink
        item={item}
        onMouseEnter={() => !sidebarExpanded && !visible && setVisible(true)}
        onMouseOut={() => !sidebarExpanded && visible && setVisible(false)}
      >
        <ItemInner item={item} sidebarExpanded={sidebarExpanded} />
      </ButtonOrLink>
    </NavItem>
  );
}
