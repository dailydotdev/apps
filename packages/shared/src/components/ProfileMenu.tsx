import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import { UserIcon } from './icons';
import DevCardIcon from './icons/DevCard';
import SettingsIcon from './icons/Settings';
import { IconSize } from './Icon';
import TimerIcon from './icons/Timer';
import { Image } from './image/Image';
import { cloudinary } from '../lib/image';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import { ReferralCampaignKey } from '../hooks';
import usePersistentContext from '../hooks/usePersistentContext';
import { LEGO_REFERRAL_CAMPAIGN_MAY_2023_HIDDEN_FROM_HEADER_KEY } from '../lib/storage';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function ProfileMenu(): ReactElement {
  const { user, logout } = useContext(AuthContext);
  const [isHiddenFromHeader] = usePersistentContext(
    LEGO_REFERRAL_CAMPAIGN_MAY_2023_HIDDEN_FROM_HEADER_KEY,
    false,
  );
  const { openModal } = useLazyModal();

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
            <UserIcon
              size={IconSize.Small}
              secondary={false}
              className="mr-2"
            />{' '}
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
            <SettingsIcon
              size={IconSize.Small}
              secondary={false}
              className="mr-2"
            />{' '}
            Account details
          </a>
        </Link>
      </Item>
      {isHiddenFromHeader && (
        <Item>
          <button
            type="button"
            className="flex items-center min-w-[12.5rem]"
            onClick={() => {
              openModal({
                type: LazyModal.LegoReferralCampaign,
                props: {
                  campaignKey: ReferralCampaignKey.LegoMay2023,
                },
              });
            }}
          >
            <Image
              className="mr-2"
              width={24}
              height={24}
              src={cloudinary.referralCampaign.lego.piece}
            />
            Referral campagin
            <TimerIcon className="ml-auto" size={IconSize.Small} />
          </button>
        </Item>
      )}
      <Item>
        <Link
          href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}devcard`}
          passHref
          prefetch={false}
        >
          <a className="flex items-center w-full">
            <DevCardIcon size={IconSize.Small} className="mr-2" /> Dev card
          </a>
        </Link>
      </Item>
      <Item onClick={logout}>
        <PowerIcon size={IconSize.Small} className="mr-2" /> Logout
      </Item>
    </PortalMenu>
  );
}
