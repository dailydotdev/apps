import React, { type ReactElement } from 'react';
import { ContextMenuIds } from '../hooks/constants';
import type { MenuItemProps } from './fields/ContextMenu';
import ContextMenu from './fields/ContextMenu';
import { HashtagIcon, MenuIcon as DotsIcon, ShareIcon } from './icons';
import { MenuIcon } from './MenuIcon';
import useContextMenu from '../hooks/useContextMenu';
import { Button, ButtonSize } from './buttons/Button';
import {
  useShareOrCopyLink,
  type UseShareOrCopyLinkProps,
} from '../hooks/useShareOrCopyLink';

type CustomFeedOptionsMenuProps = {
  shareProps: UseShareOrCopyLinkProps;
};

const CustomFeedOptionsMenu = ({
  shareProps,
}: CustomFeedOptionsMenuProps): ReactElement => {
  const [, onShareOrCopyLink] = useShareOrCopyLink(shareProps);
  const { isOpen, onMenuClick } = useContextMenu({
    id: ContextMenuIds.CustomFeedContext,
  });

  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share',
      action: () => onShareOrCopyLink(),
    },
    {
      icon: <MenuIcon Icon={HashtagIcon} />,
      label: 'Add to custom feed',
      action: () => {
        console.log('TODO: Implement modal || funnel to upgrade to plus');
      },
    },
  ];

  return (
    <>
      <Button onClick={onMenuClick} size={ButtonSize.XSmall}>
        <DotsIcon />
      </Button>
      <ContextMenu
        disableBoundariesCheck
        id={ContextMenuIds.CustomFeedContext}
        className="mt-2"
        options={options}
        isOpen={isOpen}
      />
    </>
  );
};

export default CustomFeedOptionsMenu;
