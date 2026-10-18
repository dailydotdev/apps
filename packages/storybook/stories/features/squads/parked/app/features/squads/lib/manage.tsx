import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import {
  AnalyticsIcon,
  AppIcon,
  DocsIcon,
  EditIcon,
  EmbedIcon,
  JobIcon,
  LinkIcon,
  LockIcon,
  SparkleIcon,
  TimerIcon,
  TrashIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons/gift';
import { hasSquadFeature } from './features';
import { SquadManageSection } from './routes';
import type { SquadViewer } from '@dailydotdev/shared/src/features/squads/lib/viewer';
import { isStaffViewer } from '@dailydotdev/shared/src/features/squads/lib/viewer';

export interface SquadManageItem {
  id: SquadManageSection;
  label: string;
  icon: ReactElement;
  badge?: number;
}

export interface SquadManageGroup {
  title: string;
  items: SquadManageItem[];
}

export const squadManageTitles: Record<SquadManageSection, string> = {
  [SquadManageSection.Details]: 'Details',
  [SquadManageSection.Products]: 'Products',
  [SquadManageSection.Jobs]: 'Jobs',
  [SquadManageSection.Perks]: 'Member perks',
  [SquadManageSection.Links]: 'Links',
  [SquadManageSection.Branding]: 'Branding',
  [SquadManageSection.Rules]: 'Rules',
  [SquadManageSection.Members]: 'Members',
  [SquadManageSection.Welcome]: 'Welcome pop-up',
  [SquadManageSection.Moderation]: 'Moderation',
  [SquadManageSection.Posting]: 'Posting and invitations',
  [SquadManageSection.Analytics]: 'Analytics',
  [SquadManageSection.Integrations]: 'Integrations',
  [SquadManageSection.DangerZone]: 'Danger zone',
};

const canSeeSection = (squad: Squad, section: SquadManageSection): boolean => {
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);

  switch (section) {
    case SquadManageSection.Details:
    case SquadManageSection.Rules:
    case SquadManageSection.Posting:
      return canEdit;
    case SquadManageSection.Products:
      return canEdit && hasSquadFeature(squad, 'products');
    case SquadManageSection.Links:
      return canEdit && hasSquadFeature(squad, 'links');
    case SquadManageSection.Jobs:
      return canEdit && hasSquadFeature(squad, 'jobs');
    case SquadManageSection.Perks:
      return canEdit && hasSquadFeature(squad, 'perks');
    case SquadManageSection.Branding:
      return canEdit && hasSquadFeature(squad, 'verified');
    case SquadManageSection.Members:
      return true;
    case SquadManageSection.Welcome:
      return canEdit && hasSquadFeature(squad, 'verified');
    case SquadManageSection.Moderation:
      return verifyPermission(squad, SourcePermissions.ModeratePost);
    case SquadManageSection.Analytics:
      return verifyPermission(squad, SourcePermissions.ViewAnalytics);
    case SquadManageSection.Integrations:
      return verifyPermission(squad, SourcePermissions.ConnectSlack);
    case SquadManageSection.DangerZone:
      return verifyPermission(squad, SourcePermissions.Delete);
    default:
      return false;
  }
};

const item = (
  id: SquadManageSection,
  icon: ReactElement,
  badge?: number,
): SquadManageItem => ({ id, label: squadManageTitles[id], icon, badge });

export const getSquadManageGroups = (
  squad: Squad,
  viewer: SquadViewer,
): SquadManageGroup[] => {
  if (!isStaffViewer(viewer)) {
    return [];
  }

  const groups: SquadManageGroup[] = [
    {
      title: 'Page',
      items: [
        item(SquadManageSection.Details, <EditIcon />),
        item(SquadManageSection.Products, <AppIcon />),
        item(SquadManageSection.Jobs, <JobIcon />),
        item(SquadManageSection.Perks, <GiftIcon />),
        item(SquadManageSection.Links, <LinkIcon />),
        item(SquadManageSection.Branding, <SparkleIcon />),
        item(SquadManageSection.Rules, <DocsIcon />),
      ],
    },
    {
      title: 'Community',
      items: [
        item(SquadManageSection.Members, <UserIcon />),
        item(
          SquadManageSection.Moderation,
          <TimerIcon />,
          squad.moderationPostCount,
        ),
        item(SquadManageSection.Welcome, <SparkleIcon />),
        item(SquadManageSection.Posting, <LockIcon />),
      ],
    },
    {
      title: 'Tools',
      items: [
        item(SquadManageSection.Analytics, <AnalyticsIcon />),
        item(SquadManageSection.Integrations, <EmbedIcon />),
        item(SquadManageSection.DangerZone, <TrashIcon />),
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(({ id }) => canSeeSection(squad, id)),
    }))
    .filter((group) => group.items.length > 0);
};
