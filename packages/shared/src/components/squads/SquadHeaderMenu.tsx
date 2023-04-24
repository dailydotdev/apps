import React, { ReactElement, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';
import { Squad, SourcePermissions } from '../../graphql/sources';
import TrashIcon from '../icons/Trash';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLeaveSquad } from '../../hooks/useLeaveSquad';
import ContextMenuItem, {
  ContextMenuItemProps,
} from '../tooltips/ContextMenuItem';
import { verifyPermission } from '../../graphql/squads';
import SettingsIcon from '../icons/Settings';

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
  const canEditSquad = verifyPermission(squad, SourcePermissions.Edit);
  const canDeleteSquad = verifyPermission(squad, SourcePermissions.Delete);

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
      canDeleteSquad
        ? { Icon: TrashIcon, onClick: onDeleteSquad, label: 'Delete Squad' }
        : { Icon: ExitIcon, onClick: onLeaveSquad, label: 'Leave Squad' },
    ];

    if (canEditSquad) {
      list.unshift({
        Icon: SettingsIcon,
        onClick: onEditSquad,
        label: 'Squad settings',
      });
    }

    return list;
  }, [canEditSquad, canDeleteSquad, squad, user, onDeleteSquad, onLeaveSquad]);

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
