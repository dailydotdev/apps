import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import {
  AnalyticsIcon,
  AppIcon,
  CreditCardIcon,
  DocsIcon,
  EditIcon,
  EmbedIcon,
  JobIcon,
  LinkIcon,
  LockIcon,
  PaintRollerIcon,
  TimerIcon,
  TrendingIcon,
  TrashIcon,
  UserIcon,
} from '../../../components/icons';
import { canSetSquadButton, hasSquadFeature } from './features';
import { SquadManageSection } from './routes';
import type { SquadViewer } from './viewer';
import { isStaffViewer } from './viewer';

export interface SquadManageItem {
  id: SquadManageSection;
  label: string;
  icon: ReactElement;
  badge?: number;
  /**
   * A section the squad's plan doesn't include yet, shown locked to promote
   * daily.dev for Startups: it names the plan and links to Subscription.
   */
  lockedPlan?: string;
}

export interface SquadManageGroup {
  title: string;
  items: SquadManageItem[];
}

export const squadManageTitles: Record<SquadManageSection, string> = {
  [SquadManageSection.Details]: 'Details',
  [SquadManageSection.Products]: 'Products',
  [SquadManageSection.Jobs]: 'Jobs',
  [SquadManageSection.Links]: 'Links',
  [SquadManageSection.Branding]: 'Branding',
  [SquadManageSection.Rules]: 'Rules',
  [SquadManageSection.Members]: 'Members',
  [SquadManageSection.Moderation]: 'Moderation',
  [SquadManageSection.Posting]: 'Posting and invitations',
  [SquadManageSection.Analytics]: 'Analytics',
  [SquadManageSection.Plan]: 'Subscription',
  [SquadManageSection.Intel]: 'Weekly intel',
  [SquadManageSection.Integrations]: 'Integrations',
  [SquadManageSection.DangerZone]: 'Danger zone',
};

export interface SquadManageOptions {
  /** daily.dev for Startups checkout, behind `startups_checkout` */
  isPlanEnabled?: boolean;
}

const canSeeSection = (
  squad: Squad,
  section: SquadManageSection,
  { isPlanEnabled = false }: SquadManageOptions,
): boolean => {
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);

  switch (section) {
    case SquadManageSection.Details:
    case SquadManageSection.Rules:
    case SquadManageSection.Posting:
      return canEdit;
    case SquadManageSection.Products:
      return canEdit && hasSquadFeature(squad, 'products');
    case SquadManageSection.Jobs:
      return canEdit && hasSquadFeature(squad, 'jobs');
    case SquadManageSection.Links:
      return canEdit && hasSquadFeature(squad, 'links');
    case SquadManageSection.Branding:
      return canEdit && canSetSquadButton(squad);
    case SquadManageSection.Members:
      return true;
    case SquadManageSection.Moderation:
      return verifyPermission(squad, SourcePermissions.ModeratePost);
    case SquadManageSection.Analytics:
      return verifyPermission(squad, SourcePermissions.ViewAnalytics);
    case SquadManageSection.Plan:
      return isPlanEnabled && canEdit;
    case SquadManageSection.Intel:
      // Only paid seats read it, whatever the role
      return !!squad.currentMember?.seat;
    case SquadManageSection.Integrations:
      return verifyPermission(squad, SourcePermissions.ConnectSlack);
    case SquadManageSection.DangerZone:
      return verifyPermission(squad, SourcePermissions.Delete);
    default:
      return false;
  }
};

// Plan sections a squad with no plan shows locked, while the checkout is on
const lockedSections = [
  SquadManageSection.Products,
  SquadManageSection.Links,
  SquadManageSection.Intel,
];

const isLockedSection = (
  squad: Squad,
  section: SquadManageSection,
  { isPlanEnabled = false }: SquadManageOptions,
): boolean =>
  isPlanEnabled &&
  lockedSections.includes(section) &&
  verifyPermission(squad, SourcePermissions.Edit) &&
  !hasSquadFeature(squad, 'verified') &&
  // Every plan turns links on
  !hasSquadFeature(squad, 'links');

const item = (
  id: SquadManageSection,
  icon: ReactElement,
  badge?: number,
): SquadManageItem => ({ id, label: squadManageTitles[id], icon, badge });

export const getSquadManageGroups = (
  squad: Squad,
  viewer: SquadViewer,
  options: SquadManageOptions = {},
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
        item(SquadManageSection.Links, <LinkIcon />),
        item(SquadManageSection.Branding, <PaintRollerIcon />),
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
        item(SquadManageSection.Posting, <LockIcon />),
      ],
    },
    {
      title: 'Billing',
      items: [item(SquadManageSection.Plan, <CreditCardIcon />)],
    },
    {
      title: 'Tools',
      items: [
        item(SquadManageSection.Intel, <TrendingIcon />),
        item(SquadManageSection.Analytics, <AnalyticsIcon />),
        item(SquadManageSection.Integrations, <EmbedIcon />),
        item(SquadManageSection.DangerZone, <TrashIcon />),
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.flatMap((groupItem) => {
        if (canSeeSection(squad, groupItem.id, options)) {
          return [groupItem];
        }

        return isLockedSection(squad, groupItem.id, options)
          ? [{ ...groupItem, lockedPlan: 'Starter' }]
          : [];
      }),
    }))
    .filter((group) => group.items.length > 0);
};
