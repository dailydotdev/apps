import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { Item } from 'react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ './modals/AccountDetailsModal'
    ),
);

export type ProfileMenuProps = {
  onShowDndClick?: () => void;
};

export default function ProfileMenu({
  onShowDndClick,
}: ProfileMenuProps): ReactElement {
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const shouldShowDnD = process.env.TARGET_BROWSER === 'chrome';

  return (
    <>
      <AccountDetailsModal
        isOpen={showAccountDetails}
        onRequestClose={() => setShowAccountDetails(false)}
      />
      <PortalMenu
        id="profile-context"
        className="menu-primary"
        animation="fade"
        style={{ width: '9rem' }}
      >
        <Item>
          <Link
            href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}${
              user.username || user.id
            }`}
            passHref
            prefetch={false}
          >
            <a className="w-full">Profile</a>
          </Link>
        </Item>
        <Item onClick={() => setShowAccountDetails(true)}>Account details</Item>
        {shouldShowDnD && <Item onClick={onShowDndClick}>Do not disturb</Item>}
        <Item>
          <Link
            href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
            passHref
            prefetch={false}
          >
            <a className="w-full">Dev card</a>
          </Link>
        </Item>
        <Item>
          <a
            href="https://it057218.typeform.com/to/S9p9SVNI"
            target="_blank"
            className="w-full"
          >
            Feedback
          </a>
        </Item>
        <Item onClick={logout}>Logout</Item>
      </PortalMenu>
    </>
  );
}
