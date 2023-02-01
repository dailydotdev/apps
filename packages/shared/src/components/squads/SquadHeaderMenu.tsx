import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import EditIcon from '../icons/Edit';
// import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import {
  deleteSquad,
  leaveSquad,
  Squad,
  SquadMemberRole,
} from '../../graphql/squads';
import TrashIcon from '../icons/Trash';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBoot } from '../../hooks/useBoot';

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
  const { deleteSquad: deleteSquadFromList } = useBoot();
  const { user } = useContext(AuthContext);
  const { showPrompt } = usePrompt();
  const { openModal } = useLazyModal();

  if (!user) {
    return <></>;
  }

  const isSquadOwner = squad?.currentMember?.role === SquadMemberRole.Owner;

  const onLeaveSquad = async () => {
    const options: PromptOptions = {
      title: `Leave ${squad.name}`,
      description: `Leaving ${squad.name} means that you will lose your access to all posts that were shared in the Squad`,
      okButton: {
        title: 'Leave',
        className: 'btn-secondary',
      },
      cancelButton: {
        title: 'Stay',
        className: 'btn-primary-cabbage',
      },
      className: {
        buttons: 'flex-row-reverse',
      },
    };
    if (await showPrompt(options)) {
      await leaveSquad(squad.id);
      deleteSquadFromList(squad.id);
      await router.replace('/');
    }
  };

  const onDeleteSquad = async () => {
    const options: PromptOptions = {
      title: `Delete ${squad.name}`,
      description: `Deleting ${squad.name} means you and all squad members will lose access to all posts that were shared in the Squad. Are you sure?`,
      okButton: {
        title: 'Delete',
        className: 'btn-secondary',
      },
      cancelButton: {
        title: 'No, keep it',
        className: 'btn-primary-cabbage',
      },
      className: {
        buttons: 'flex-row-reverse',
      },
    };
    if (await showPrompt(options)) {
      await deleteSquad(squad.id);
      deleteSquadFromList(squad.id);
      await router.replace('/');
    }
  };

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
