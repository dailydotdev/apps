import type { ReactElement } from 'react';
import React from 'react';
import type { SourcePostModeration } from '../../../graphql/squads';
import { verifyPermission } from '../../../graphql/squads';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import type { UseSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import type { MenuItemProps } from '../../dropdown/common';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  BlockIcon,
  MenuIcon,
  RemoveUserIcon,
  UserIcon,
  VolumeOffIcon,
} from '../../icons';

interface SquadModerationAuthorMenuProps
  extends Pick<UseSourceModerationList, 'onReject' | 'onMute' | 'onBlock'> {
  data: SourcePostModeration;
}

// The moderator's tools for the person behind a post, for when the post is
// not the only problem.
export const SquadModerationAuthorMenu = ({
  data,
  onReject,
  onMute,
  onBlock,
}: SquadModerationAuthorMenuProps): ReactElement | null => {
  const { createdBy, source, authorContext } = data;

  if (!createdBy) {
    return null;
  }

  const handle = `@${createdBy.username}`;
  const pendingCount = authorContext?.pendingCount ?? 0;
  const options: MenuItemProps[] = [
    {
      label: 'View profile',
      icon: <UserIcon aria-hidden />,
      anchorProps: {
        href: createdBy.permalink,
        target: '_blank',
        rel: 'noopener',
      },
    },
  ];

  if (pendingCount > 1) {
    options.push({
      label: `Decline all ${pendingCount} from ${handle}`,
      icon: <BlockIcon aria-hidden />,
      action: () => onReject([data], { allFromAuthor: true }),
    });
  }

  options.push({
    label: `Mute ${handle} here`,
    icon: <VolumeOffIcon aria-hidden />,
    action: () => onMute(data),
  });

  if (verifyPermission(source as Squad, SourcePermissions.MemberRemove)) {
    options.push({
      label: `Block ${handle}`,
      icon: <RemoveUserIcon aria-hidden />,
      action: () => onBlock(data),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild tooltip={{ content: 'Author options' }}>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          aria-label={`Options for ${handle}`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
