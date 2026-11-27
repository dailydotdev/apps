import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
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
  SendAirplaneIcon,
  TerminalIcon,
  TimerIcon,
  TrendingIcon,
  TrashIcon,
  UserIcon,
} from '../../../components/icons';
import {
  canSetSquadButton,
  canSetSquadWebsite,
  hasSquadFeature,
  isCompanySquad,
} from './features';
import { SquadManageSection } from './routes';
import type { SquadViewer } from './viewer';
import { isStaffViewer } from './viewer';
import type { IconProps } from '../../../components/Icon';

export interface SquadManageItem {
  id: SquadManageSection;
  label: string;
  icon: ReactElement<IconProps>;
  badge?: number;
  /**
   * A section the squad's plan doesn't include yet, shown locked with an
   * Upgrade chip that links to Subscription. Holds the plan that unlocks it
   * (daily.dev for Startups or Enterprise).
   */
  lockedPlan?: SquadManageLockedPlan;
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
  [SquadManageSection.Agent]: 'Agent and API',
  [SquadManageSection.AutoPosting]: 'Auto-posting',
  [SquadManageSection.DangerZone]: 'Danger zone',
};

export enum SquadManageLockedPlan {
  Startups = 'Startups',
  Enterprise = 'Enterprise',
}

interface SquadManagePlanGate {
  /** The plan that unlocks the section, named on its lock */
  plan: SquadManageLockedPlan;
  isIncluded: (squad: Squad) => boolean;
}

// Sections a plan unlocks. Every squad lists them, so nobody misses a feature:
// a squad whose plan doesn't include one shows it locked to the plan that does.
const planGates: Partial<Record<SquadManageSection, SquadManagePlanGate>> = {
  [SquadManageSection.Products]: {
    plan: SquadManageLockedPlan.Startups,
    isIncluded: (squad) => hasSquadFeature(squad, 'products'),
  },
  [SquadManageSection.Jobs]: {
    plan: SquadManageLockedPlan.Enterprise,
    isIncluded: (squad) => hasSquadFeature(squad, 'jobs'),
  },
  [SquadManageSection.Links]: {
    plan: SquadManageLockedPlan.Startups,
    isIncluded: canSetSquadWebsite,
  },
  // The brand color is Enterprise only, so the section locks to Enterprise.
  // The Startups Team plan still opens it for the header button alone.
  [SquadManageSection.Branding]: {
    plan: SquadManageLockedPlan.Enterprise,
    isIncluded: canSetSquadButton,
  },
  [SquadManageSection.Intel]: {
    plan: SquadManageLockedPlan.Startups,
    isIncluded: isCompanySquad,
  },
  [SquadManageSection.Agent]: {
    plan: SquadManageLockedPlan.Startups,
    isIncluded: isCompanySquad,
  },
};

// Whether the viewer's role opens the section, whatever the squad's plan
const canSeeSection = (squad: Squad, section: SquadManageSection): boolean => {
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);

  switch (section) {
    case SquadManageSection.Details:
    case SquadManageSection.Rules:
    case SquadManageSection.Posting:
    case SquadManageSection.Products:
    case SquadManageSection.Jobs:
    case SquadManageSection.Links:
    case SquadManageSection.Branding:
      return canEdit;
    // Open on every plan, free included, so admins see what is possible: each
    // method inside shows Upgrade when the plan doesn't include it
    case SquadManageSection.AutoPosting:
      return canEdit;
    case SquadManageSection.Members:
      return true;
    case SquadManageSection.Moderation:
      return verifyPermission(squad, SourcePermissions.ModeratePost);
    case SquadManageSection.Analytics:
      return verifyPermission(squad, SourcePermissions.ViewAnalytics);
    case SquadManageSection.Plan:
      return canEdit;
    case SquadManageSection.Intel:
      // Only paid seats read it, whatever the role
      return !!squad.currentMember?.seat;
    case SquadManageSection.Integrations:
      return verifyPermission(squad, SourcePermissions.ConnectSlack);
    case SquadManageSection.Agent: {
      // Every plan includes the MCP server and API: admins, and moderators
      // holding a paid seat
      const role = squad.currentMember?.role;

      return (
        role === SourceMemberRole.Admin ||
        (role === SourceMemberRole.Moderator && !!squad.currentMember?.seat)
      );
    }
    case SquadManageSection.DangerZone:
      return verifyPermission(squad, SourcePermissions.Delete);
    default:
      return false;
  }
};

/**
 * The plan a section is locked to, or undefined when it isn't locked. Locks
 * show to those who can edit the squad, who reach Subscription from them.
 */
const getLockedPlan = (
  squad: Squad,
  section: SquadManageSection,
): SquadManageLockedPlan | undefined => {
  const gate = planGates[section];

  if (
    !gate ||
    gate.isIncluded(squad) ||
    !verifyPermission(squad, SourcePermissions.Edit) ||
    // Community squads get no Startups promotion
    (!squad.flags?.company && !isCompanySquad(squad))
  ) {
    return undefined;
  }

  return gate.plan;
};

const isOpenSection = (squad: Squad, section: SquadManageSection): boolean =>
  canSeeSection(squad, section) &&
  (planGates[section]?.isIncluded(squad) ?? true);

const item = (
  id: SquadManageSection,
  icon: ReactElement<IconProps>,
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
        item(SquadManageSection.AutoPosting, <SendAirplaneIcon />),
        item(SquadManageSection.Agent, <TerminalIcon />),
        item(SquadManageSection.DangerZone, <TrashIcon />),
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.flatMap((groupItem) => {
        if (isOpenSection(squad, groupItem.id)) {
          return [groupItem];
        }

        const lockedPlan = getLockedPlan(squad, groupItem.id);

        return lockedPlan ? [{ ...groupItem, lockedPlan }] : [];
      }),
    }))
    .filter((group) => group.items.length > 0);
};
