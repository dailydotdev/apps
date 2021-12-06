import React, { ReactElement } from 'react';
import { useCopyLink } from '../../hooks/useCopyLink';
import { ButtonOrLink, ItemInner, ListIcon, NavItem } from './common';
import UserShareIcon from '../../../icons/user_share.svg';

export default function InvitePeople({
  openSidebar,
}: {
  openSidebar: boolean;
}): ReactElement {
  const [copyingLink, copyLink] = useCopyLink(() => 'https://daily.dev/');
  const item = {
    icon: <ListIcon Icon={UserShareIcon} />,
    title: copyingLink ? 'Link copied to clipboard' : 'Invite people',
    action: () => copyLink(),
  };
  return (
    <NavItem color={copyingLink && 'text-theme-status-success'}>
      <ButtonOrLink item={item}>
        <ItemInner item={item} openSidebar={openSidebar} />
      </ButtonOrLink>
    </NavItem>
  );
}
