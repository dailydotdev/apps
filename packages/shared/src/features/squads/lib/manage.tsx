import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import {
  AnalyticsIcon,
  AppIcon,
  DocsIcon,
  EditIcon,
  EmbedIcon,
  LinkIcon,
  LockIcon,
  SparkleIcon,
  TimerIcon,
  TrashIcon,
  UserIcon,
} from '../../../components/icons';
import { hasSquadFeature } from './features';
import { SquadManageSection } from './routes';
import type { SquadViewer } from './viewer';
import { isStaffViewer } from './viewer';

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
  [SquadManageSection.Links]: 'Links',
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
        item(SquadManageSection.Links, <LinkIcon />),
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
