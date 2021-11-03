import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import { Tag } from '../../graphql/feedSettings';

const PortalMenu = dynamic(() => import('../fields/PortalMenu'), {
  ssr: false,
});

export type TagOptionsMenuProps = {
  onHidden?: () => unknown;
  tag?: Tag;
  onBlock?: () => unknown;
  onUnblock?: () => unknown;
  onFollow?: () => Promise<unknown>;
  onUnfollow?: () => Promise<unknown>;
};

export default function TagOptionsMenu({
  onHidden,
  tag,
  onBlock,
  onUnblock,
  onFollow,
  onUnfollow,
}: TagOptionsMenuProps): ReactElement {
  return (
    <PortalMenu
      disableBoundariesCheck
      id="tag-options-context"
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
      style={{ width: '7rem' }}
    >
      {tag && (
        <Item>
          <Link
            href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${tag}`}
            passHref
            prefetch={false}
          >
            <a className="w-full">View</a>
          </Link>
        </Item>
      )}
      {onFollow && <Item onClick={onFollow}>Follow</Item>}
      {onUnfollow && <Item onClick={onUnfollow}>Unfollow</Item>}
      {onBlock && <Item onClick={onBlock}>Block</Item>}
      {onUnblock && <Item onClick={onUnblock}>Unblock</Item>}
    </PortalMenu>
  );
}
