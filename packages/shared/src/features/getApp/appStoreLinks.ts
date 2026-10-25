import { appDownloadUrl, appStoreUrl } from '../../lib/constants';

// App Store Connect provider ID. App Analytics reports a campaign only for
// links that carry both `pt` and `ct`.
export const appleProviderToken = '125432506';

const campaignTokenMaxLength = 40;

export const getAppStoreCampaignToken = (campaign: string): string =>
  `webapp_${campaign}`.slice(0, campaignTokenMaxLength);

const withQuery = (base: string, params: Record<string, string>): string => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  return url.toString();
};

const appStoreCampaign = (campaign: string): Record<string, string> => ({
  pt: appleProviderToken,
  ct: getAppStoreCampaignToken(campaign),
});

export const getAppStoreUrl = (campaign: string): string =>
  withQuery(appStoreUrl, appStoreCampaign(campaign));

// The smart link redirects by OS and forwards its whole query string, so the
// Apple tokens reach the App Store and the other stores ignore them.
export const getAppDownloadUrl = (source: string): string =>
  withQuery(appDownloadUrl, {
    utm_source: source,
    ...appStoreCampaign(source),
  });
