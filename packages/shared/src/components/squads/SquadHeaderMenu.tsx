import React, { ReactElement, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import ExitIcon from '../icons/Exit';
import {
  Squad,
  SourcePermissions,
  SourceMemberRole,
} from '../../graphql/sources';
import TrashIcon from '../icons/Trash';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLeaveSquad } from '../../hooks/useLeaveSquad';
import ContextMenuItem, { ContextMenuIcon } from '../tooltips/ContextMenuItem';
import { verifyPermission } from '../../graphql/squads';
import SettingsIcon from '../icons/Settings';
import { squadFeedback } from '../../lib/constants';
import FeedbackIcon from '../icons/Feedback';
import TourIcon from '../icons/Tour';
import { useSquadNavigation } from '../../hooks';
import { MenuItemProps } from '../fields/PortalMenu';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ '../fields/PortalMenu'),
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
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { editSquad } = useSquadNavigation();

  const { onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });

  const { mutateAsync: onLeaveSquad } = useMutation(useLeaveSquad({ squad }), {
    onSuccess: () => {
      router.replace('/');
    },
  });

  const items = useMemo(() => {
    const canEditSquad = verifyPermission(squad, SourcePermissions.Edit);
    const canDeleteSquad = verifyPermission(squad, SourcePermissions.Delete);

    const list: MenuItemProps[] = [
      {
        icon: <ContextMenuIcon Icon={TourIcon} />,
        action: () =>
          openModal({
            type: LazyModal.SquadTour,
          }),
        label: 'Learn how Squads work',
      },
    ];

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
          onLeaveSquad();
        },
        label: 'Leave Squad',
      });
    }

    if (canEditSquad) {
      list.unshift({
        icon: <ContextMenuIcon Icon={SettingsIcon} />,
        action: () => editSquad({ handle: squad.handle }),
        label: 'Squad settings',
      });
    }

    return list;
  }, [editSquad, onDeleteSquad, onLeaveSquad, openModal, squad]);

  return (
    <PortalMenu
      disableBoundariesCheck
      id="squad-menu-context"
      className="menu-primary"
      animation="fade"
    >
      {items.map((props) => (
        <ContextMenuItem key={props.label} {...props} />
      ))}
    </PortalMenu>
  );
}
