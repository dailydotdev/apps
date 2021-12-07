import React, { ReactElement, useContext } from 'react';
import { useCopyLink } from '../../hooks/useCopyLink';
import { ButtonOrLink, ItemInner, ListIcon, NavItem } from './common';
import UserShareIcon from '../../../icons/user_share.svg';
import AuthContext from '../../contexts/AuthContext';

const DEFAULT_INVITE_LINK = 'https://daily.dev/';
const INVITE_TEXT = `I'm using daily.dev to stay updated on developer news. I think you will find it helpful:`;

interface OnInivitePeopleProps {
  copyLink: () => Promise<void>;
  inviteLink: string;
}

const onInvitePeople = async ({
  copyLink,
  inviteLink,
}: OnInivitePeopleProps) => {
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
  openSidebar,
}: {
  openSidebar: boolean;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const inviteLink = user?.referralLink
    ? user?.referralLink
    : DEFAULT_INVITE_LINK;
  const [copyingLink, copyLink] = useCopyLink(() => inviteLink);

  const item = {
    icon: <ListIcon Icon={UserShareIcon} />,
    title: copyingLink ? 'Link copied to clipboard' : 'Invite people',
    action: () => onInvitePeople({ copyLink, inviteLink }),
  };
  return (
    <NavItem color={copyingLink && 'text-theme-status-success'}>
      <ButtonOrLink item={item}>
        <ItemInner item={item} openSidebar={openSidebar} />
      </ButtonOrLink>
    </NavItem>
  );
}
