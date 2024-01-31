import React, { ReactElement, useContext, useMemo } from 'react';
import AuthContext from '../contexts/AuthContext';
import {
  PowerIcon,
  InviteIcon,
  KeyReferralOutlineIcon,
  UserIcon,
  DevCardIcon,
  SettingsIcon,
} from './icons';
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
import { AllowedTags, Button, ButtonProps } from './buttons/ButtonV2';
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

    list.push(
      {
        title: 'Invite friends',
        buttonProps: {
          tag: 'a',
          icon: <InviteIcon />,
          href: `${webappUrl}account/invite`,
        },
      },
      {
        title: 'Logout',
        buttonProps: {
          icon: <PowerIcon />,
          onClick: logout,
        },
      },
    );

    return list;
  }, [trackEvent, logout, availableCount, openModal, showSearchReferral, user]);

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.ProfileMenu}
      className="w-full max-w-[21.25rem] !rounded-14 border border-theme-divider-tertiary laptop:max-w-[13.75rem]"
    >
      <LabeledImage
        src={user.image}
        alt={`${user.username}'s avatar`}
        className={{ content: '-mt-10' }}
      >
        <span className="font-bold typo-title3">{user.name}</span>
        <span className="mt-1 typo-callout">@{user.username}</span>
      </LabeledImage>
      <div className="relative -mt-16 flex flex-col">
        {items.map(({ title, buttonProps }) => (
          <Button
            key={title}
            {...buttonProps}
            className="btn-tertiary w-full !justify-start !px-5 font-normal"
          >
            {title}
          </Button>
        ))}
      </div>
    </InteractivePopup>
  );
}
