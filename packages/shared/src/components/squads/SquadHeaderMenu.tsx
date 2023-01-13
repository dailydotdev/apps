import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import AuthContext from '../../contexts/AuthContext';
import EditIcon from '../icons/Edit';
import TourIcon from '../icons/Tour';
import ExitIcon from '../icons/Exit';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ '../fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function SquadHeaderMenu(): ReactElement {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <></>;
  }

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
      <Item className="typo-callout">
        <span className="flex items-center w-full typo-callout">
          <ExitIcon size="medium" secondary={false} className="mr-2" /> Leave
          Squad
        </span>
      </Item>
    </PortalMenu>
  );
}
