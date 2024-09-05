import { useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { ReactElement, useMemo } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import {
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';
import { useLeaveSquad, useSquadNavigation } from '../../hooks';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import useContextMenu from '../../hooks/useContextMenu';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { squadFeedback } from '../../lib/constants';
import { Origin } from '../../lib/log';
import { MenuItemProps } from '../fields/ContextMenu';
import {
  ExitIcon,
  FeedbackIcon,
  FlagIcon,
  LinkIcon,
  SettingsIcon,
  TourIcon,
  TrashIcon,
} from '../icons';
import { LazyModal } from '../modals/common/types';
import { ContextMenuIcon } from '../tooltips/ContextMenuItem';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ '../fields/ContextMenu'),
  {
    ssr: false,
  },
);

interface SquadHeaderMenuProps {
  squad: Squad;
}

export default function SquadHeaderMenu({
  squad,
}: SquadHeaderMenuProps): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const { logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { editSquad } = useSquadNavigation();
  const { isOpen } = useContextMenu({ id: ContextMenuIds.SquadMenuContext });

  const { onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });

  const { mutateAsync: onLeaveSquad } = useMutation(useLeaveSquad({ squad }), {
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

    const list: MenuItemProps[] = [];

    if (canEditSquad) {
      list.push({
        icon: <ContextMenuIcon Icon={SettingsIcon} />,
        action: () => editSquad({ handle: squad.handle }),
        label: 'Squad settings',
      });
    }

    if (!squad.currentMember && squad.public && isLoggedIn) {
      list.push({
        icon: <ContextMenuIcon Icon={LinkIcon} />,
        action: () => logAndCopyLink(),
        label: 'Invitation link',
      });
    }

    list.push({
      icon: <ContextMenuIcon Icon={TourIcon} />,
      action: () => openModal({ type: LazyModal.SquadTour }),
      label: 'Learn how Squads work',
    });

    if (squad.currentMember) {
      list.push({
        icon: <ContextMenuIcon Icon={FeedbackIcon} />,
        anchorProps: {
          href: `${squadFeedback}#user_id=${squad?.currentMember?.user?.id}&squad_id=${squad.id}`,
          target: '_blank',
        },
        label: 'Feedback',
      });
    }

    list.push({
      icon: <ContextMenuIcon Icon={FlagIcon} />,
      action: () =>
        openModal({ type: LazyModal.ReportSource, props: { squad } }),
      label: 'Report Squad',
    });

    if (canDeleteSquad) {
      list.push({
        icon: <ContextMenuIcon Icon={TrashIcon} />,
        action: onDeleteSquad,
        label: 'Delete Squad',
      });
    }

    if (
      squad.currentMember &&
      squad.currentMember.role !== SourceMemberRole.Admin
    ) {
      list.push({
        icon: <ContextMenuIcon Icon={ExitIcon} />,
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
  ]);

  return (
    <ContextMenu
      disableBoundariesCheck
      id={ContextMenuIds.SquadMenuContext}
      className="menu-primary"
      animation="fade"
      options={items}
      isOpen={isOpen}
    />
  );
}
