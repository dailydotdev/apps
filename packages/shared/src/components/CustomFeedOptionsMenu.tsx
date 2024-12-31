import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ContextMenuIds } from '../hooks/constants';
import type { MenuItemProps } from './fields/ContextMenu';
import ContextMenu from './fields/ContextMenu';
import { HashtagIcon, MenuIcon as DotsIcon, ShareIcon } from './icons';
import { MenuIcon } from './MenuIcon';
import useContextMenu from '../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import type { UseShareOrCopyLinkProps } from '../hooks/useShareOrCopyLink';
import { useShareOrCopyLink } from '../hooks/useShareOrCopyLink';
import { useFeeds, usePlusSubscription } from '../hooks';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';

type CustomFeedOptionsMenuProps = {
  onCreateNewFeed?: () => void;
  onAdd: (feedId: string) => void;
  onUndo?: (feedId: string) => void;
  className?: string;
  shareProps: UseShareOrCopyLinkProps;
};

const CustomFeedOptionsMenu = ({
  className,
  shareProps,
  onAdd,
  onUndo,
  onCreateNewFeed,
}: CustomFeedOptionsMenuProps): ReactElement => {
  const { showPlusSubscription } = usePlusSubscription();
  const { openModal } = useLazyModal();
  const [, onShareOrCopyLink] = useShareOrCopyLink(shareProps);
  const { isOpen, onMenuClick } = useContextMenu({
    id: ContextMenuIds.CustomFeedContext,
  });
  const { feeds } = useFeeds();

  const handleOpenModal = () => {
    if (feeds?.edges?.length > 0) {
      return openModal({
        type: LazyModal.AddToCustomFeed,
        props: {
          onAdd,
          onUndo,
          onCreateNewFeed,
        },
      });
    }
    return onCreateNewFeed();
  };

  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share',
      action: () => onShareOrCopyLink(),
    },
    {
      icon: <MenuIcon Icon={HashtagIcon} />,
      label: 'Add to custom feed',
      action: handleOpenModal,
    },
  ];

  if (!showPlusSubscription) {
    return (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<ShareIcon />}
        onClick={() => onShareOrCopyLink()}
      />
    );
  }

  return (
    <>
      <Button
        className={classNames('!px-1.5', className)}
        onClick={onMenuClick}
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        icon={<DotsIcon />}
      />
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
