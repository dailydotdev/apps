import { webappUrl } from '../../../lib/constants';

export enum SquadManageSection {
  Details = 'details',
  Products = 'products',
  Jobs = 'jobs',
  Perks = 'perks',
  Links = 'links',
  Branding = 'branding',
  Rules = 'rules',
  Members = 'members',
  Welcome = 'welcome',
  Moderation = 'moderation',
  Posting = 'posting',
  Analytics = 'analytics',
  Integrations = 'integrations',
  DangerZone = 'danger-zone',
}

export const squadManageSections = Object.values(SquadManageSection);

export const isSquadManageSection = (
  value: unknown,
): value is SquadManageSection =>
  squadManageSections.includes(value as SquadManageSection);

export const getSquadUrl = (handle: string): string =>
  `${webappUrl}squads/${handle}`;

export const getSquadMembersUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/members`;

export const getSquadProductsUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/products`;

export const getSquadRulesUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/rules`;

export const getSquadPendingPostsUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/pending`;

export const getSquadManageUrl = (
  handle: string,
  section?: SquadManageSection,
): string =>
  section
    ? `${getSquadUrl(handle)}/manage/${section}`
    : `${getSquadUrl(handle)}/manage`;

export const getSquadProductFormUrl = (
  handle: string,
  productId?: string,
): string =>
  `${getSquadManageUrl(handle, SquadManageSection.Products)}/${
    productId ?? 'new'
  }`;

export enum SquadPageTab {
  Posts = 'posts',
  Jobs = 'jobs',
  Perks = 'perks',
}

export const isSquadPageTab = (value: unknown): value is SquadPageTab =>
  Object.values(SquadPageTab).includes(value as SquadPageTab);

/** The squad page opened on a tab, where a role or perk page leads back. */
export const getSquadTabUrl = (handle: string, tab: SquadPageTab): string =>
  tab === SquadPageTab.Posts
    ? getSquadUrl(handle)
    : `${getSquadUrl(handle)}?tab=${tab}`;

export const getSquadJobUrl = (handle: string, jobId: string): string =>
  `${getSquadUrl(handle)}/jobs/${jobId}`;

export const getSquadPerkUrl = (handle: string, perkId: string): string =>
  `${getSquadUrl(handle)}/perks/${perkId}`;

export const getSquadJobFormUrl = (handle: string, jobId?: string): string =>
  `${getSquadManageUrl(handle, SquadManageSection.Jobs)}/${jobId ?? 'new'}`;

export const getSquadPerkFormUrl = (handle: string, perkId?: string): string =>
  `${getSquadManageUrl(handle, SquadManageSection.Perks)}/${perkId ?? 'new'}`;
