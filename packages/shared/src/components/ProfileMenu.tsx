import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { Item } from 'react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from '../../icons/power.svg';
import UserIcon from '../../icons/user.svg';
import TimerIcon from '../../icons/timer.svg';
import SettingsIcon from '../../icons/settings.svg';
import DevCardIcon from '../../icons/dev_card.svg';
import FeedbackIcon from '../../icons/feedback.svg';

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
  const shouldShowDnD = !!process.env.TARGET_BROWSER;

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
            <a className="flex w-full">
              <UserIcon className="mr-2 text-xl" /> Profile
            </a>
          </Link>
        </Item>
        <Item onClick={() => setShowAccountDetails(true)}>
          <SettingsIcon className="mr-2 text-xl" /> Account details
        </Item>
        {shouldShowDnD && (
          <Item onClick={onShowDndClick}>
            <TimerIcon className="mr-2 text-xl" /> Do not disturb
          </Item>
        )}
        <Item>
          <Link
            href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
            passHref
            prefetch={false}
          >
            <a className="flex w-full">
              <DevCardIcon className="mr-2 text-xl" /> Dev card
            </a>
          </Link>
        </Item>
        <Item>
          <a
            href="https://it057218.typeform.com/to/S9p9SVNI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full"
          >
            <FeedbackIcon className="mr-2 text-xl" /> Feedback
          </a>
        </Item>
        <Item onClick={logout}>
          <PowerIcon className="mr-2 text-xl" /> Logout
        </Item>
      </PortalMenu>
    </>
  );
}
