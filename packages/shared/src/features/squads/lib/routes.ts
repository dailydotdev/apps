import { webappUrl } from '../../../lib/constants';

export enum SquadManageSection {
  Details = 'details',
  Products = 'products',
  Links = 'links',
  Branding = 'branding',
  Rules = 'rules',
  Members = 'members',
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
