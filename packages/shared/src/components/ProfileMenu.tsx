import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from '@dailydotdev/react-contexify';
import Link from 'next/link';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import { KeyReferralOutlineIcon, UserIcon, TimerIcon } from './icons';
import DevCardIcon from './icons/DevCard';
import SettingsIcon from './icons/Settings';
import { IconSize } from './Icon';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { useSettingsContext } from '../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../graphql/settings';
import { ReferralCampaignKey, useReferralCampaign } from '../hooks';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../lib/analytics';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

export default function ProfileMenu(): ReactElement {
  const { openModal } = useLazyModal();
  const { trackEvent } = useAnalyticsContext();
  const { campaignCtaPlacement } = useSettingsContext();
  const { user, logout } = useContext(AuthContext);
  const { referralToken, availableCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });
  const showSearchReferral =
    !!referralToken &&
    campaignCtaPlacement === CampaignCtaPlacement.ProfileMenu;

  if (!user) {
    return <></>;
  }

  const handleReferralClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.SearchInviteButton,
      target_id: TargetId.InviteProfileMenu,
    });
    openModal({ type: LazyModal.SearchReferral });
  };

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
            onClick={handleReferralClick}
          >
            <KeyReferralOutlineIcon
              size={IconSize.Small}
              secondary
              className="mr-2"
            />
            {availableCount} Search invites
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
