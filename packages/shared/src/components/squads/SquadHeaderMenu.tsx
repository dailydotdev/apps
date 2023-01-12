import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import { useRouter } from 'next/router';
import AuthContext from '../../contexts/AuthContext';
import EditIcon from '../icons/Edit';
import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { leaveSquad, Squad } from '../../graphql/squads';

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
  const { showPrompt } = usePrompt();

  if (!user) {
    return <></>;
  }

  const onLeaveSquad = async (e) => {
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
      await router.replace('/');
    }
  };

  return (
    <PortalMenu
      disableBoundariesCheck
      id="squad-menu-context"
      className="menu-primary"
      animation="fade"
    >
      <Item className="typo-callout">
        <span className="flex items-center w-full typo-callout">
          <EditIcon size="medium" secondary={false} className="mr-2" /> Edit
          Squad details
        </span>
      </Item>
      <Item className="typo-callout">
        <span className="flex items-center w-full typo-callout">
          <TourIcon size="medium" secondary={false} className="mr-2" /> Restart
          tour
        </span>
      </Item>
      <Item className="typo-callout" onClick={onLeaveSquad}>
        <span className="flex items-center w-full typo-callout">
          <ExitIcon size="medium" secondary={false} className="mr-2" /> Leave
          Squad
        </span>
      </Item>
    </PortalMenu>
  );
}
