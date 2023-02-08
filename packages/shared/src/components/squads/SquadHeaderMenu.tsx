import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import EditIcon from '../icons/Edit';
// import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';
import { Squad, SquadMemberRole } from '../../graphql/squads';
import TrashIcon from '../icons/Trash';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useDeleteSquad } from '../../hooks/useDeleteSquad';
import { useLeaveSquad } from '../../hooks/useLeaveSquad';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ '../fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function SquadHeaderMenu({
  squad,
}: {
  squad: Squad;
}): ReactElement {
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
  const isSquadOwner = squad?.currentMember?.role === SquadMemberRole.Owner;

  const onEditSquad = () => {
    openModal({
      type: LazyModal.EditSquad,
      props: {
        squad,
      },
    });
  };

  return (
    <PortalMenu
      disableBoundariesCheck
      id="squad-menu-context"
      className="menu-primary"
      animation="fade"
    >
      {isSquadOwner && (
        <Item className="typo-callout" onClick={onEditSquad}>
          <span className="flex items-center w-full typo-callout">
            <EditIcon size="medium" secondary={false} className="mr-2" /> Edit
            Squad details
          </span>
        </Item>
      )}
      {/* <Item className="typo-callout"> */}
      {/*  <span className="flex items-center w-full typo-callout"> */}
      {/*    <TourIcon size="medium" secondary={false} className="mr-2" /> Learn */}
      {/*    how Squads work */}
      {/*  </span> */}
      {/* </Item> */}
      {isSquadOwner ? (
        <Item className="typo-callout" onClick={onDeleteSquad}>
          <span className="flex items-center w-full typo-callout">
            <TrashIcon size="medium" secondary={false} className="mr-2" />{' '}
            Delete Squad
          </span>
        </Item>
      ) : (
        <Item className="typo-callout" onClick={onLeaveSquad}>
          <span className="flex items-center w-full typo-callout">
            <ExitIcon size="medium" secondary={false} className="mr-2" /> Leave
            Squad
          </span>
        </Item>
      )}
    </PortalMenu>
  );
}
