import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSectionItem';
import { ProfileMenuHeader } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuHeader';
import { PlusMenuEntry } from '@dailydotdev/shared/src/components/plus/PlusMenuEntry';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { NavDrawer } from '@dailydotdev/shared/src/components/drawers/NavDrawer';
import {
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';
import { AddUserIcon } from '@dailydotdev/shared/src/components/icons/AddUser';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { CreditCardIcon } from '@dailydotdev/shared/src/components/icons/CreditCard';
import { DevCardIcon } from '@dailydotdev/shared/src/components/icons/DevCard';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { EmbedIcon } from '@dailydotdev/shared/src/components/icons/Embed';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { FeatherIcon } from '@dailydotdev/shared/src/components/icons/Feather';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { GraduationIcon } from '@dailydotdev/shared/src/components/icons/Graduation';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { InviteIcon } from '@dailydotdev/shared/src/components/icons/Invite';
import { JobIcon } from '@dailydotdev/shared/src/components/icons/Job';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { MailIcon } from '@dailydotdev/shared/src/components/icons/Mail';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { NewTabIcon } from '@dailydotdev/shared/src/components/icons/NewTab';
import { OrganizationIcon } from '@dailydotdev/shared/src/components/icons/Organization';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { TourIcon } from '@dailydotdev/shared/src/components/icons/Tour';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { FeedSettingsPage, feedSettingsPages } from './pages';

type MenuGroup = { title?: string; items: ProfileSectionItemProps[] };

// The groups around Feed settings, as the production menu has them today.
const accountGroup: MenuGroup = {
  items: [
    { title: 'Profile', icon: UserIcon, href: `${settingsUrl}/profile` },
    {
      title: 'Account & Security',
      icon: MailIcon,
      href: `${settingsUrl}/security`,
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      href: `${settingsUrl}/notifications`,
    },
    {
      title: 'Appearance',
      icon: NewTabIcon,
      href: `${settingsUrl}/appearance`,
    },
    { title: 'Posting', icon: FeatherIcon, href: `${settingsUrl}/composition` },
    {
      title: 'Invite friends',
      icon: InviteIcon,
      href: `${settingsUrl}/invite`,
    },
  ],
};

const laterGroups: MenuGroup[] = [
  {
    title: 'Career',
    items: [
      {
        title: 'Work Experience',
        icon: JobIcon,
        href: `${settingsUrl}/profile/experience/work`,
      },
      {
        title: 'Education',
        icon: GraduationIcon,
        href: `${settingsUrl}/profile/experience/education`,
      },
      {
        title: 'Certifications',
        icon: MedalIcon,
        href: `${settingsUrl}/profile/experience/certification`,
      },
      {
        title: 'Open source',
        icon: TerminalIcon,
        href: `${settingsUrl}/profile/experience/opensource`,
      },
      {
        title: 'Projects & Publications',
        icon: TourIcon,
        href: `${settingsUrl}/profile/experience/project`,
      },
      {
        title: 'Volunteering',
        icon: VolunteeringIcon,
        href: `${settingsUrl}/profile/experience/volunteering`,
      },
    ],
  },
  {
    title: 'Gamification',
    items: [
      {
        title: 'Streaks & gamification',
        icon: EyeIcon,
        href: `${settingsUrl}/customization/gamification`,
      },
      {
        title: 'DevCard',
        icon: DevCardIcon,
        href: `${settingsUrl}/customization/devcard`,
      },
    ],
  },
  {
    title: 'Developers',
    items: [
      { title: 'API Access', icon: TerminalIcon, href: `${settingsUrl}/api` },
      {
        title: 'Integrations',
        icon: EmbedIcon,
        href: `${settingsUrl}/customization/integrations`,
      },
    ],
  },
  {
    title: 'Billing and Monetization',
    items: [
      {
        title: 'Payment & Subscription',
        icon: CreditCardIcon,
        href: `${settingsUrl}/subscription`,
      },
      {
        title: 'Organizations',
        icon: OrganizationIcon,
        href: `${settingsUrl}/organization`,
      },
    ],
  },
];

const pageIcons: Record<FeedSettingsPage, ProfileSectionItemProps['icon']> = {
  [FeedSettingsPage.Overview]: HomeIcon,
  [FeedSettingsPage.Topics]: HashtagIcon,
  [FeedSettingsPage.Sources]: AddUserIcon,
  [FeedSettingsPage.Ranking]: SortIcon,
  [FeedSettingsPage.Filters]: FilterIcon,
  [FeedSettingsPage.AI]: MagicIcon,
  [FeedSettingsPage.General]: EditIcon,
};

interface SettingsMenuProps {
  page?: FeedSettingsPage;
  onNavigate: (page: FeedSettingsPage) => void;
}

const MenuGroups = ({ page, onNavigate }: SettingsMenuProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const feedGroup: MenuGroup = {
    title: 'Feed settings',
    items: feedSettingsPages.map(({ id, title }) => ({
      title,
      icon: pageIcons[id],
      onClick: () => onNavigate(id),
      // On a phone the menu is the page above the sections, so no row is the
      // current one.
      isActive: !isMobile && page === id,
    })),
  };
  const groups = [accountGroup, feedGroup, ...laterGroups];

  return (
    <nav className={classNames('flex flex-col gap-2', isMobile && 'p-4')}>
      {isMobile && (
        <>
          <PlusMenuEntry
            target={TargetId.ProfileSettingsMenu}
            className="-mx-4 -my-1 px-4 py-1 hover:bg-surface-float"
          />
          <HorizontalSeparator className="-mx-4" />
        </>
      )}
      {groups.map((group, index) => (
        <ProfileSection
          key={group.title ?? 'account'}
          withSeparator={index < groups.length - 1}
          title={group.title}
          items={group.items.map((item) =>
            isMobile
              ? {
                  ...item,
                  typography: {
                    type: TypographyType.Body,
                    color: TypographyColor.Secondary,
                  },
                }
              : item,
          )}
        />
      ))}
    </nav>
  );
};

/** `ProfileSettingsMenuDesktop` with the new Feed settings group. */
export const SettingsMenuDesktop = (props: SettingsMenuProps): ReactElement => (
  <aside className="ml-auto flex min-h-full flex-col gap-2 self-start overflow-clip rounded-16 border border-border-subtlest-tertiary p-2 tablet:w-64">
    <ProfileMenuHeader
      className="-mx-2 -mb-1 -mt-2 px-2 pb-1 pt-2 hover:bg-surface-float"
      shouldOpenProfile
      profileImageSize={ProfileImageSize.Medium}
      compact
    />
    <PlusMenuEntry
      target={TargetId.ProfileSettingsMenu}
      className="-mx-2 -my-1 px-2 py-1 hover:bg-surface-float"
    />
    <HorizontalSeparator className="-mx-2" />
    <MenuGroups {...props} />
  </aside>
);

/** `ProfileSettingsMenuMobile`: the page behind every section on a phone. */
export const SettingsMenuMobile = ({
  isOpen,
  onClose,
  ...props
}: SettingsMenuProps & {
  isOpen: boolean;
  onClose: () => void;
}): ReactElement => (
  <NavDrawer header="Settings" shouldKeepOpen drawerProps={{ isOpen, onClose }}>
    <MenuGroups {...props} />
  </NavDrawer>
);
