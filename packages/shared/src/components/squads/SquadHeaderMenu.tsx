import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import type { Squad } from '../../graphql/sources';
import { SourcePermissions, SourceMemberRole } from '../../graphql/sources';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLeaveSquad, useSquadNavigation } from '../../hooks';
import { verifyPermission } from '../../graphql/squads';
import {
  SettingsIcon,
  TrashIcon,
  FeedbackIcon,
  TourIcon,
  LinkIcon,
  ExitIcon,
  FlagIcon,
  HashtagIcon,
  MenuIcon,
} from '../icons';
import { squadFeedback } from '../../lib/constants';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { MenuItemProps } from '../dropdown/common';

const IconWrapper = ({
  Icon,
}: {
  Icon: (props: IconProps) => ReactElement;
}): ReactElement => <Icon size={IconSize.Small} className="mr-2" />;

interface SquadHeaderMenuProps {
  className?: {
    button?: string;
  };
  squad: Squad;
}

export default function SquadHeaderMenu({
  squad,
  className,
}: SquadHeaderMenuProps): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const { logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { editSquad } = useSquadNavigation();
  const { follow, unfollow } = useContentPreference();

  const { onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });

  const { mutateAsync: onLeaveSquad } = useMutation({
    mutationFn: useLeaveSquad({ squad }),
    onSuccess: (left) => {
      if (!left) {
        return;
      }

      router.replace('/');
    },
  });

  const items = useMemo(() => {
    const canEditSquad = verifyPermission(squad, SourcePermissions.Edit);
    const canDeleteSquad = verifyPermission(squad, SourcePermissions.Delete);

    const list: MenuItemProps[] = [
      {
        icon: <IconWrapper Icon={HashtagIcon} />,
        action: () =>
          openModal({
            type: LazyModal.AddToCustomFeed,
            props: {
              onAdd: (feedId) =>
                follow({
                  id: squad.id,
                  entity: ContentPreferenceType.Source,
                  entityName: squad.handle,
                  feedId,
                }),
              onUndo: (feedId) =>
                unfollow({
                  id: squad.id,
                  entity: ContentPreferenceType.Source,
                  entityName: squad.handle,
                  feedId,
                }),
              onCreateNewFeed: () =>
                router.push(
                  `/feeds/new?entityId=${squad.id}&entityType=${ContentPreferenceType.Source}`,
                ),
            },
          }),
        label: 'Add to custom feed',
      },
    ];

    if (canEditSquad) {
      list.push({
        icon: <IconWrapper Icon={SettingsIcon} />,
        action: () => editSquad({ handle: squad.handle }),
        label: 'Squad settings',
      });
    }

    if (!squad.currentMember && squad.public && isLoggedIn) {
      list.push({
        icon: <IconWrapper Icon={LinkIcon} />,
        action: () => logAndCopyLink(),
        label: 'Invitation link',
      });
    }

    list.push({
      icon: <IconWrapper Icon={TourIcon} />,
      action: () => openModal({ type: LazyModal.SquadTour }),
      label: 'Learn how Squads work',
    });

    if (squad.currentMember) {
      list.push({
        icon: <IconWrapper Icon={FeedbackIcon} />,
        anchorProps: {
          href: `${squadFeedback}#user_id=${squad?.currentMember?.user?.id}&squad_id=${squad.id}`,
          target: '_blank',
        },
        label: 'Feedback',
      });
    }

    list.push({
      icon: <IconWrapper Icon={FlagIcon} />,
      action: () =>
        openModal({ type: LazyModal.ReportSource, props: { squad } }),
      label: 'Report Squad',
    });

    if (canDeleteSquad) {
      list.push({
        icon: <IconWrapper Icon={TrashIcon} />,
        action: onDeleteSquad,
        label: 'Delete Squad',
      });
    }

    if (
      squad.currentMember &&
      squad.currentMember.role !== SourceMemberRole.Admin
    ) {
      list.push({
        icon: <IconWrapper Icon={ExitIcon} />,
        action: () => {
          onLeaveSquad({});
        },
        label: 'Leave Squad',
      });
    }

    return list;
  }, [
    editSquad,
    onDeleteSquad,
    logAndCopyLink,
    onLeaveSquad,
    openModal,
    squad,
    isLoggedIn,
    follow,
    unfollow,
    router,
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: 'Squad options' }} asChild>
        <Button
          className={classNames('order-4 tablet:order-5', className?.button)}
          variant={ButtonVariant.Float}
          icon={<MenuIcon />}
          size={ButtonSize.Small}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={items} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
