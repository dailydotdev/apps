import { webappUrl } from '../../../lib/constants';

export enum SquadManageSection {
  Details = 'details',
  Products = 'products',
  Jobs = 'jobs',
  Links = 'links',
  Branding = 'branding',
  Rules = 'rules',
  Members = 'members',
  Moderation = 'moderation',
  Posting = 'posting',
  Analytics = 'analytics',
  Plan = 'plan',
  Intel = 'intel',
  Integrations = 'integrations',
  Agent = 'agent',
  AutoPosting = 'auto-posting',
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

export const getSquadJobsUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/jobs`;

export const getSquadJobUrl = (handle: string, jobId: string): string =>
  `${getSquadJobsUrl(handle)}/${jobId}`;

export const getSquadRulesUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/rules`;

export const getSquadIntelUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/intel`;

export const getSquadPendingPostsUrl = (handle: string): string =>
  `${getSquadUrl(handle)}/pending`;

export const getSquadManageUrl = (
  handle: string,
  section?: SquadManageSection,
): string =>
  section
    ? `${getSquadUrl(handle)}/manage/${section}`
    : `${getSquadUrl(handle)}/manage`;

// The free company page form. `plan` and `cta` from the /startups landing
// pass through for attribution. With `checkout`, the new page goes on to the
// plan's checkout, for founders who came to pay.
export const getCompanyPageCreateUrl = ({
  plan,
  cta,
  checkout,
}: { plan?: string; cta?: string; checkout?: boolean } = {}): string => {
  const params = new URLSearchParams({ company: '1' });

  if (plan) {
    params.set('plan', plan);
  }

  if (checkout) {
    params.set('checkout', '1');
  }

  if (cta) {
    params.set('cta', cta);
  }

  return `${webappUrl}squads/new?${params}`;
};

// Hyphens are not allowed in squad handles, so this can never shadow a squad
export const startupsCheckoutPath = '/squads/for-startups';

export const getStartupsCheckoutUrl = ({
  plan,
  sourceId,
}: {
  plan?: string;
  sourceId?: string;
} = {}): string => {
  const params = new URLSearchParams();

  if (plan) {
    params.set('plan', plan);
  }

  if (sourceId) {
    params.set('squad', sourceId);
  }

  const query = params.toString();

  return `${webappUrl}${startupsCheckoutPath.slice(1)}${
    query ? `?${query}` : ''
  }`;
};

export const getSquadProductFormUrl = (
  handle: string,
  productId?: string,
): string =>
  `${getSquadManageUrl(handle, SquadManageSection.Products)}/${
    productId ?? 'new'
  }`;

export const getSquadJobFormUrl = (handle: string, jobId?: string): string =>
  `${getSquadManageUrl(handle, SquadManageSection.Jobs)}/${jobId ?? 'new'}`;
