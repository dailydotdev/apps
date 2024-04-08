import React, { ReactElement, useContext, useMemo } from 'react';
import AuthContext from '../contexts/AuthContext';
import {
  InviteIcon,
  UserIcon,
  DevCardIcon,
  SettingsIcon,
  ReputationLightningIcon,
  ExitIcon,
} from './icons';
import InteractivePopup, {
  InteractivePopupPosition,
} from './tooltips/InteractivePopup';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { reputation, webappUrl } from '../lib/constants';
import { UserMetadata } from './profile/UserMetadata';
import { HeroImage } from './profile/HeroImage';
import { anchorDefaultRel } from '../lib/strings';
import { LogoutReason } from '../lib/user';

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
  const { user, logout } = useContext(AuthContext);
  const items: ListItem[] = useMemo(() => {
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
        title: 'Reputation',
        buttonProps: {
          tag: 'a',
          icon: <ReputationLightningIcon />,
          href: reputation,
          target: '_blank',
          rel: anchorDefaultRel,
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
          icon: <ExitIcon />,
          onClick: () => logout(LogoutReason.ManualLogout),
        },
      },
    ];

    return list;
  }, [logout, user]);

  if (!user) {
    return <></>;
  }

  return (
    <InteractivePopup
      onClose={onClose}
      closeOutsideClick
      position={InteractivePopupPosition.ProfileMenu}
      className="w-full max-w-64 !rounded-24 border border-border-subtlest-tertiary"
      closeButton={{
        variant: ButtonVariant.Primary,
        size: ButtonSize.XSmall,
        position: 'right-3 top-3',
      }}
    >
      <HeroImage
        cover={user.cover}
        image={user.image}
        username={user.username}
        id={user.id}
        className={{
          cover: '!rounded-24 border-4 border-background-default',
          profile: '!rounded-24',
        }}
      />
      <UserMetadata
        username={user.username}
        name={user.name}
        createdAt={user.createdAt}
        reputation={user.reputation}
        className="gap-3 p-4"
      />
      <div className="flex flex-col border-t border-border-subtlest-tertiary py-2">
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
