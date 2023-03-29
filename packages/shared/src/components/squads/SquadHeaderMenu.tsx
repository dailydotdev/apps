import React, { ReactElement, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import EditIcon from '../icons/Edit';
import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';
import { Squad } from '../../graphql/squads';
import { SourceMemberRole } from '../../graphql/sources';
import TrashIcon from '../icons/Trash';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLeaveSquad } from '../../hooks/useLeaveSquad';
import ContextMenuItem, {
  ContextMenuItemProps,
} from '../tooltips/ContextMenuItem';

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
  const { user } = useContext(AuthContext);
  const { openModal } = useLazyModal();

  if (!user) {
    return <></>;
  }
  const { onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });
  const { onLeaveSquad } = useLeaveSquad({
    squad,
    callback: () => router.replace('/'),
  });
  const isSquadOwner = squad?.currentMember?.role === SourceMemberRole.Owner;

  const onEditSquad = () => {
    openModal({
      type: LazyModal.EditSquad,
      props: {
        squad,
      },
    });
  };
  const items = useMemo(() => {
    const list: ContextMenuItemProps[] = [
      {
        Icon: TourIcon,
        onClick: () =>
          openModal({
            type: LazyModal.SquadTour,
          }),
        label: 'Learn how Squads work',
      },
      isSquadOwner
        ? { Icon: TrashIcon, onClick: onDeleteSquad, label: 'Delete Squad' }
        : { Icon: ExitIcon, onClick: onLeaveSquad, label: 'Leave Squad' },
    ];

    if (isSquadOwner) {
      list.unshift({
        Icon: EditIcon,
        onClick: onEditSquad,
        label: 'Edit Squad details',
      });
    }

    return list;
  }, [isSquadOwner, squad, user, onDeleteSquad, onLeaveSquad]);

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
