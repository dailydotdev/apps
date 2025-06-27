import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { MenuItemProps } from './fields/ContextMenu';
import { HashtagIcon, MenuIcon as DotsIcon, ShareIcon } from './icons';
import { MenuIcon } from './MenuIcon';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import type { UseShareOrCopyLinkProps } from '../hooks/useShareOrCopyLink';
import { useShareOrCopyLink } from '../hooks/useShareOrCopyLink';
import { useFeeds } from '../hooks';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown/DropdownMenu';
import { Tooltip } from './tooltip/Tooltip';

type CustomFeedOptionsMenuProps = {
  onCreateNewFeed?: () => void;
  onAdd: (feedId: string) => void;
  onUndo?: (feedId: string) => void;
  className?: {
    menu?: string;
    button?: string;
  };
  buttonVariant?: ButtonVariant;
  shareProps: UseShareOrCopyLinkProps;
  additionalOptions?: MenuItemProps[];
};

const CustomFeedOptionsMenu = ({
  className,
  shareProps,
  onAdd,
  onUndo,
  onCreateNewFeed,
  additionalOptions = [],
  buttonVariant = ButtonVariant.Float,
}: CustomFeedOptionsMenuProps): ReactElement => {
  const { openModal } = useLazyModal();
  const [, onShareOrCopyLink] = useShareOrCopyLink(shareProps);
  const { feeds } = useFeeds();
  const [tooltipVisible, setTooltipVisible] = useState(false);

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

  options.push(...additionalOptions);

  return (
    <DropdownMenu>
      <Tooltip content="Options" visible={tooltipVisible}>
        <DropdownMenuTrigger asChild>
          <Button
            className={classNames('justify-center', className?.button)}
            size={ButtonSize.Small}
            variant={buttonVariant}
            icon={<DotsIcon />}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          />
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent>
        {options.map(({ label, icon, action }: MenuItemProps) => (
          <DropdownMenuItem key={label} onClick={action}>
            {icon} {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomFeedOptionsMenu;
