import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import UserIcon from './icons/User';
import SettingsIcon from './icons/Settings';
import DevCardIcon from './icons/DevCard';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ './modals/AccountDetailsModal'
    ),
);

export default function ProfileMenu(): ReactElement {
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <></>;
  }

  return (
    <>
      {showAccountDetails && (
        <AccountDetailsModal
          isOpen={showAccountDetails}
          onRequestClose={() => setShowAccountDetails(false)}
        />
      )}
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
        <Item onClick={() => setShowAccountDetails(true)}>
          <SettingsIcon size="medium" secondary={false} className="mr-2" />{' '}
          Account details
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
    </>
  );
}
