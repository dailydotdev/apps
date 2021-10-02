import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from 'react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type ProfileMenuProps = {};

export default function ProfileMenu({}: ProfileMenuProps): ReactElement {
  const { user, logout } = useContext(AuthContext);

  const shouldShowDnD = process.env.TARGET_BROWSER === 'chrome';

  return (
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
      <Item>
        <Link
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}`}
          passHref
          prefetch={false}
        >
          Account details
        </Link>
      </Item>
      {shouldShowDnD && <Item>Do not disturb</Item>}
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
  );
}
