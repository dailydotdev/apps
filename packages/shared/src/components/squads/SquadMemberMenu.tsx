import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import AuthContext from '../../contexts/AuthContext';
import FlagIcon from '../icons/Flag';
import { reportSquadMember } from '../../lib/constants';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ '../fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function SquadMemberMenu({
  squadId,
  memberId,
}: {
  squadId: string;
  memberId: string;
}) {
  const { user } = useContext(AuthContext);

  return (
    <PortalMenu
      disableBoundariesCheck
      id="squad-member-menu-context"
      className="menu-primary"
      animation="fade"
    >
      <Item className="typo-callout">
        <a
          className="flex items-center w-full"
          href={`${reportSquadMember}#user_id=${user.id}&reportee_id=${memberId}&squad_id=${squadId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="flex items-center w-full typo-callout">
            <FlagIcon size="medium" secondary={false} className="mr-2" /> Report
            member
          </span>
        </a>
      </Item>
    </PortalMenu>
  );
}
