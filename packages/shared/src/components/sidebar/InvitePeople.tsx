import React, { ReactElement, useContext } from 'react';
import { useCopyLink } from '../../hooks/useCopyLink';
import { ButtonOrLink, ItemInner, ListIcon, NavItem } from './common';
import UserShareIcon from '../../../icons/user_share.svg';
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
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const trackInvite = () => {
    trackEvent({
      event_name: 'Invite people',
      target_type: 'share',
      extra: JSON.stringify({ origin: 'main layout' }),
    });
  };

  const inviteLink = user?.referralLink
    ? user?.referralLink
    : DEFAULT_INVITE_LINK;
  const [copyingLink, copyLink] = useCopyLink(() => inviteLink);

  const item = {
    icon: <ListIcon Icon={UserShareIcon} />,
    title: copyingLink ? 'Link copied to clipboard' : 'Invite people',
    action: () => onInvitePeople({ copyLink, inviteLink, trackInvite }),
  };
  return (
    <NavItem color={copyingLink && 'text-theme-status-success'}>
      <ButtonOrLink item={item}>
        <ItemInner item={item} sidebarExpanded={sidebarExpanded} />
      </ButtonOrLink>
    </NavItem>
  );
}
