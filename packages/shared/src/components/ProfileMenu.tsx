import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import { KeyReferralIcon, UserIcon } from './icons';
import DevCardIcon from './icons/DevCard';
import SettingsIcon from './icons/Settings';
import { IconSize } from './Icon';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import TimerIcon from './icons/Timer';
import { useSettingsContext } from '../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../graphql/settings';
import { ReferralCampaignKey, useFeatureCampaign } from '../hooks';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function ProfileMenu(): ReactElement {
  const { openModal } = useLazyModal();
  const { campaignCtaPlacement } = useSettingsContext();
  const { user, logout } = useContext(AuthContext);
  const { canInvite } = useFeatureCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });
  // TODO: after BE is updated, switch the condition to check equality with enum.ProfileMenu for accuracy
  const showSearchReferral =
    canInvite && campaignCtaPlacement !== CampaignCtaPlacement.Header;

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
      {showSearchReferral && (
        <Item>
          <button
            type="button"
            className="flex items-center min-w-[12.5rem]"
            onClick={() => {
              openModal({ type: LazyModal.SearchReferral });
            }}
          >
            <KeyReferralIcon size={IconSize.Small} className="mr-2" />
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
