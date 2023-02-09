import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
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
import FeedbackIcon from '../icons/Feedback';
import { squadFeedback } from '../../lib/constants';
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
  const isSquadOwner = squad?.currentMember?.role === SquadMemberRole.Owner;

  const onEditSquad = () => {
    openModal({
      type: LazyModal.EditSquad,
      props: {
        squad,
      },
    });
  };
  const feedbackLink = `${squadFeedback}#user_id=${user.id}&squad_id=${squad.id}`;
  const removeSquadProps: ContextMenuItemProps = isSquadOwner
    ? { Icon: TrashIcon, onClick: onDeleteSquad, label: 'Delete Squad' }
    : { Icon: ExitIcon, onClick: onLeaveSquad, label: 'Leave Squad' };

  return (
    <PortalMenu
      disableBoundariesCheck
      id="squad-menu-context"
      className="menu-primary"
      animation="fade"
    >
      {isSquadOwner && (
        <ContextMenuItem
          Icon={EditIcon}
          onClick={onEditSquad}
          label="Edit Squad details"
        />
      )}
      {/* <Item className="typo-callout"> */}
      {/*  <span className="flex items-center w-full typo-callout"> */}
      {/*    <TourIcon size="medium" secondary={false} className="mr-2" /> Learn */}
      {/*    how Squads work */}
      {/*  </span> */}
      {/* </Item> */}
      <ContextMenuItem
        Icon={FeedbackIcon}
        label="Feedback"
        href={feedbackLink}
      />
      <ContextMenuItem {...removeSquadProps} />
    </PortalMenu>
  );
}
