import dynamic from 'next/dynamic';
import React, { ReactElement, useMemo } from 'react';

import { Tag } from '../../graphql/feedSettings';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import useContextMenu from '../../hooks/useContextMenu';
import { getTagPageLink } from '../../lib/links';
import { MenuItemProps } from '../fields/ContextMenu';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ '../fields/ContextMenu'),
  {
    ssr: false,
  },
);

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
  const { isOpen } = useContextMenu({
    id: ContextMenuIds.TagOptionsContext,
  });

  const tagOptions = useMemo(() => {
    const opts: MenuItemProps[] = [];

    if (tag) {
      opts.push({
        label: 'View',
        anchorProps: {
          href: getTagPageLink(tag.name ?? (tag as string)),
        },
      });
    }

    if (onFollow) {
      opts.push({ label: 'Follow', action: onFollow });
    }

    if (onUnfollow) {
      opts.push({ label: 'Unfollow', action: onUnfollow });
    }

    if (onBlock) {
      opts.push({ label: 'Block', action: onBlock });
    }

    if (onUnblock) {
      opts.push({ label: 'Unblock', action: onUnblock });
    }

    return opts;
  }, [tag, onFollow, onUnfollow, onBlock, onUnblock]);

  return (
    <ContextMenu
      disableBoundariesCheck
      id={ContextMenuIds.TagOptionsContext}
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
      style={{ width: '7rem' }}
      isOpen={isOpen}
      options={tagOptions}
    />
  );
}
