import React, { type ReactElement } from 'react';
import classNames from 'classnames';
import { ContextMenuIds } from '../hooks/constants';
import type { MenuItemProps } from './fields/ContextMenu';
import ContextMenu from './fields/ContextMenu';
import { HashtagIcon, MenuIcon as DotsIcon, ShareIcon } from './icons';
import { MenuIcon } from './MenuIcon';
import useContextMenu from '../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import {
  useShareOrCopyLink,
  type UseShareOrCopyLinkProps,
} from '../hooks/useShareOrCopyLink';

type CustomFeedOptionsMenuProps = {
  className?: string;
  shareProps: UseShareOrCopyLinkProps;
};

const CustomFeedOptionsMenu = ({
  className,
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
        // TODO: Implement modal || funnel to upgrade to plus
      },
    },
  ];

  return (
    <>
      <Button
        className={classNames('!border-none !px-1.5', className)}
        onClick={onMenuClick}
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
      >
        <DotsIcon />
      </Button>
      <ContextMenu
        disableBoundariesCheck
        id={ContextMenuIds.CustomFeedContext}
        options={options}
        isOpen={isOpen}
      />
    </>
  );
};

export default CustomFeedOptionsMenu;
