import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  AddUserIcon,
  AppIcon,
  BellIcon,
  BlockIcon,
  CreditCardIcon,
  EditIcon,
  EmbedIcon,
  EyeIcon,
  FeatherIcon,
  HashtagIcon,
  HotIcon,
  InviteIcon,
  JobIcon,
  MagicIcon,
  MailIcon,
  NewTabIcon,
  OrganizationIcon,
  TerminalIcon,
  TourIcon,
  TrendingIcon,
  UserIcon,
} from '../../icons';
import { GraduationIcon } from '../../icons/Graduation';
import { MedalIcon } from '../../icons/Medal';
import { VolunteeringIcon } from '../../icons/Volunteering';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { settingsUrl } from '../../../lib/constants';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';

const settingsDefaultPath = `${settingsUrl}/profile`;

type SettingsGroup = {
  key: string;
  title?: string;
  items: SidebarMenuItem[];
};

export const SettingsPanelSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  const groups: SettingsGroup[] = useMemo(
    () => [
      {
        key: 'main',
        items: [
          {
            title: 'Profile details',
            path: settingsDefaultPath,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <UserIcon secondary={active} />} />
            ),
          },
          {
            title: 'Account & Security',
            path: `${settingsUrl}/security`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MailIcon secondary={active} />} />
            ),
          },
          {
            title: 'Notifications',
            path: `${settingsUrl}/notifications`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <BellIcon secondary={active} />} />
            ),
          },
          {
            title: 'Job preferences',
            path: `${settingsUrl}/job-preferences`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <JobIcon secondary={active} />} />
            ),
            action: () =>
              logEvent({
                event_name: LogEvent.ClickCandidatePreferences,
                target_id: TargetId.ProfileSettingsMenu,
              }),
          },
          {
            title: 'Appearance',
            path: `${settingsUrl}/appearance`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <NewTabIcon secondary={active} />} />
            ),
          },
          {
            title: 'Posting',
            path: `${settingsUrl}/composition`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <FeatherIcon secondary={active} />} />
            ),
          },
          {
            title: 'Invite Friends',
            path: `${settingsUrl}/invite`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <InviteIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'feed',
        title: 'Feed settings',
        items: [
          {
            title: 'General',
            path: `${settingsUrl}/feed/general`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EditIcon secondary={active} />} />
            ),
          },
          {
            title: 'Tags',
            path: `${settingsUrl}/feed/tags`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <HashtagIcon secondary={active} />} />
            ),
          },
          {
            title: 'Content sources',
            path: `${settingsUrl}/feed/sources`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <AddUserIcon secondary={active} />} />
            ),
          },
          {
            title: 'Content preferences',
            path: `${settingsUrl}/feed/preferences`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <AppIcon secondary={active} />} />
            ),
          },
          {
            title: 'AI superpowers',
            path: `${settingsUrl}/feed/ai`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MagicIcon secondary={active} />} />
            ),
          },
          {
            title: 'Blocked content',
            path: `${settingsUrl}/feed/blocked`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <BlockIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'career',
        title: 'Career',
        items: [
          {
            title: 'Work Experience',
            path: `${settingsUrl}/profile/experience/work`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <JobIcon secondary={active} />} />
            ),
          },
          {
            title: 'Education',
            path: `${settingsUrl}/profile/experience/education`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <GraduationIcon secondary={active} />} />
            ),
          },
          {
            title: 'Certifications',
            path: `${settingsUrl}/profile/experience/certification`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <MedalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Open Source',
            path: `${settingsUrl}/profile/experience/opensource`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TerminalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Projects & Publications',
            path: `${settingsUrl}/profile/experience/project`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TourIcon secondary={active} />} />
            ),
          },
          {
            title: 'Volunteering',
            path: `${settingsUrl}/profile/experience/volunteering`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <VolunteeringIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'gamification',
        title: 'Gamification',
        items: [
          {
            title: 'Feature visibility',
            path: `${settingsUrl}/customization/gamification`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EyeIcon secondary={active} />} />
            ),
          },
          {
            title: 'Streaks',
            path: `${settingsUrl}/customization/streaks`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <HotIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'developers',
        title: 'Developers',
        items: [
          {
            title: 'API Access',
            path: `${settingsUrl}/api`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TerminalIcon secondary={active} />} />
            ),
          },
          {
            title: 'Integrations',
            path: `${settingsUrl}/customization/integrations`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <EmbedIcon secondary={active} />} />
            ),
          },
        ],
      },
      {
        key: 'billing',
        title: 'Billing and Monetization',
        items: [
          {
            title: 'Subscriptions',
            path: `${settingsUrl}/subscription`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <CreditCardIcon secondary={active} />} />
            ),
          },
          {
            title: 'Organizations',
            path: `${settingsUrl}/organization`,
            icon: (active: boolean) => (
              <ListIcon Icon={() => <OrganizationIcon secondary={active} />} />
            ),
          },
          {
            title: 'Ads dashboard',
            icon: (active: boolean) => (
              <ListIcon Icon={() => <TrendingIcon secondary={active} />} />
            ),
            action: () => openModal({ type: LazyModal.AdsDashboard }),
          },
        ],
      },
    ],
    [logEvent, openModal],
  );

  return (
    <>
      {groups.map((group) => (
        <Section
          {...defaultRenderSectionProps}
          key={group.key}
          title={group.title}
          items={group.items}
          isItemsButton={isItemsButton}
        />
      ))}
    </>
  );
};
