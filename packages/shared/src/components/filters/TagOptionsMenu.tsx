import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Item } from 'react-contexify';

const PortalMenu = dynamic(() => import('../fields/PortalMenu'), {
  ssr: false,
});

export type TagOptionsMenuProps = {
  onHidden?: () => unknown;
  onBlock?: () => Promise<unknown>;
  onFollow?: () => Promise<unknown>;
};

export default function TagOptionsMenu({
  onHidden,
  onBlock,
  onFollow,
}: TagOptionsMenuProps): ReactElement {
  return (
    <PortalMenu
      id="tag-options-context"
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
      style={{ width: '7rem' }}
    >
      <Item onClick={onFollow}>Follow</Item>
      <Item onClick={onBlock}>Block</Item>
    </PortalMenu>
  );
}
