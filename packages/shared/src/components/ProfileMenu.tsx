import React, { ReactElement, useContext, useMemo } from 'react';
import AuthContext from '../contexts/AuthContext';
import PowerIcon from './icons/Power';
import { KeyReferralOutlineIcon, UserIcon } from './icons';
import DevCardIcon from './icons/DevCard';
import SettingsIcon from './icons/Settings';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { useSettingsContext } from '../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../graphql/settings';
import { ReferralCampaignKey, useReferralCampaign } from '../hooks';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../lib/analytics';
import InteractivePopup, {
  InteractivePopupPosition,
} from './tooltips/InteractivePopup';
import { AllowedTags, Button, ButtonProps } from './buttons/Button';
import { LabeledImage } from './image';
import { webappUrl } from '../lib/constants';

interface ListItem {
  title: string;
  buttonProps?: ButtonProps<AllowedTags>;
}

interface ProfileMenuProps {
  onClose: () => void;
}

export default function ProfileMenu({
  onClose,
}: ProfileMenuProps): ReactElement {
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

  const items: ListItem[] = useMemo(() => {
    const handleReferralClick = () => {
      trackEvent({
        event_name: AnalyticsEvent.Click,
        target_type: TargetType.SearchInviteButton,
        target_id: TargetId.InviteProfileMenu,
      });
      openModal({ type: LazyModal.SearchReferral });
    };

    const list: ListItem[] = [
      {
        title: 'Profile',
        buttonProps: {
          tag: 'a',
          href: user.permalink,
          icon: <UserIcon />,
        },
      },
      {
        title: 'Account details',
        buttonProps: {
          tag: 'a',
          icon: <SettingsIcon />,
          href: `${webappUrl}account/profile`,
        },
      },
      {
        title: 'Devcard',
        buttonProps: {
          tag: 'a',
          icon: <DevCardIcon />,
          href: `${webappUrl}devcard`,
        },
      },
    ];

    if (showSearchReferral) {
      list.push({
        title: `${availableCount} Search invites`,
        buttonProps: {
          icon: <KeyReferralOutlineIcon secondary />,
          onClick: handleReferralClick,
        },
      });
    }

    list.push({
      title: 'Logout',
      buttonProps: {
        icon: <PowerIcon />,
        onClick: logout,
      },
    });

    return list;
  }, [trackEvent, logout, availableCount, openModal, showSearchReferral, user]);

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.RightStart}
      className="w-full border !right-4 laptop:max-w-[13.75rem] max-w-[21.25rem] roundeed-14 border-theme-divider-tertiary"
    >
      <LabeledImage src={user.image} alt="Logged-in user">
        <span className="font-bold typo-title3">{user.name}</span>
        <span className="mt-1 typo-callout">@{user.username}</span>
      </LabeledImage>
      <div className="flex flex-col -mt-16">
        {items.map(({ title, buttonProps }) => (
          <Button
            key={title}
            {...buttonProps}
            textPosition="justify-start"
            className="w-full font-normal btn-tertiary !px-5"
          >
            {title}
          </Button>
        ))}
      </div>
    </InteractivePopup>
  );
}
