import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import UserIcon from './icons/User';
import DevCardIcon from './icons/DevCard';
import SettingsIcon from './icons/Settings';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function ProfileMenu(): ReactElement {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <></>;
  }

  return (
    <PortalMenu
      disableBoundariesCheck
      id="profile-context"
      className="menu-primary"
      animation="fade"
    >
      <Item>
        <Link href={user.permalink} passHref prefetch={false}>
          <a className="flex items-center w-full">
            <UserIcon size="medium" secondary={false} className="mr-2" />{' '}
            Profile
          </a>
        </Link>
      </Item>
      <Item>
        <Link
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
          passHref
          prefetch={false}
        >
          <a className="flex items-center w-full">
            <SettingsIcon size="medium" secondary={false} className="mr-2" />{' '}
            Account details
          </a>
        </Link>
      </Item>
      <Item>
        <Link
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          passHref
          prefetch={false}
        >
          <a className="flex items-center w-full">
            <DevCardIcon size="medium" className="mr-2" /> Dev card
          </a>
        </Link>
      </Item>
      <Item onClick={logout}>
        <PowerIcon size="medium" className="mr-2" /> Logout
      </Item>
    </PortalMenu>
  );
}
