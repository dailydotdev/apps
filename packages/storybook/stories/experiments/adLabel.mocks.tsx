import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { ActiveFeedContext } from '@dailydotdev/shared/src/contexts';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type { Ad } from '@dailydotdev/shared/src/graphql/posts';
import {
  adImprovementsV3Feature,
  AdLabelVariant,
  featureAdLabel,
  featureAutorotateAds,
  featureFeedCardGlassActions,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

export const noop = (): void => undefined;

// `providers` is what makes AuthContext treat this as a signed-in user.
const user = { id: 'sb-user', name: 'Dev Dana', providers: ['github'] };

// Feed cards read layout settings through SettingsContext, which defaults to
// null outside the app shell.
const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
};

/** Both ad widgets read their ad from the query cache, keyed by post id. */
export const SIDEBAR_POST_ID = 'sb-post-sidebar';
export const COMMENT_POST_ID = 'sb-post-comment';

// ---------------------------------------------------------------------------
// Ad fixtures — one per use case a reviewer needs to see.
// ---------------------------------------------------------------------------

export const baseAd: Ad = {
  company: 'Vercel',
  source: 'Vercel',
  tagLine: 'Deploy without the ops.',
  description:
    'Ship your Next.js app in seconds. Zero-config deploys, preview URLs on every push.',
  image:
    'https://media.daily.dev/image/upload/v1675852969/squads/c0457b66-e89b-4fc0-b06d-48f920c7caa2.jpg',
  link: 'https://vercel.com',
  referralLink: 'https://vercel.com',
  companyLogo: 'https://svgl.app/library/vercel.svg',
  callToAction: 'Start deploying',
  adDomain: 'vercel.com',
  providerId: 'sb-provider',
};

export const noCtaAd: Ad = { ...baseAd, callToAction: undefined };

/** No referral link — control says a bare "Promoted", with no advertiser. */
export const noReferralAd: Ad = { ...baseAd, referralLink: undefined };

/** Carbon and EthicalAds creatives render contained over a blurred backdrop. */
export const carbonAd: Ad = {
  ...baseAd,
  company: 'Carbon',
  source: 'Carbon',
  companyLogo: undefined,
  description:
    'A network-served creative that keeps its original aspect ratio.',
};

export const longCopyAd: Ad = {
  ...baseAd,
  description:
    'Observability for teams that ship daily: distributed tracing, log search, RUM and synthetic checks in one place, with alerts that route to the on-call engineer who owns the service.',
};

export const taggedAd: Ad = {
  ...baseAd,
  matchingTags: ['nextjs', 'react', 'devops', 'webdev'],
};

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

interface AdProvidersProps {
  children: ReactNode;
  /** Plus subscribers never see the "Remove" upsell. */
  isPlus?: boolean;
  /** Ad served to `PostSidebarAdWidget` / `AdAsComment` via the query cache. */
  widgetAd?: Ad;
}

export const AdProviders = ({
  children,
  isPlus = false,
  widgetAd = baseAd,
}: AdProvidersProps): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });

    // Seeded for both the signed-in and anonymous key, so the widgets read
    // their ad from the cache instead of hitting the (unmocked) ad server.
    [user, undefined].forEach((keyUser) => {
      client.setQueryData(
        generateQueryKey(
          RequestKey.Ads,
          keyUser,
          SIDEBAR_POST_ID,
          'post-sidebar',
        ),
        widgetAd,
      );
      client.setQueryData(
        generateQueryKey(RequestKey.Ads, keyUser, COMMENT_POST_ID),
        widgetAd,
      );
    });

    return client;
  }, [widgetAd]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={{ ...user, isPlus } as never}
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{} as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <SettingsContext.Provider value={settings as never}>
            <ActiveFeedContext.Provider value={{ items: [], queryKey: ['sb'] }}>
              {children}
            </ActiveFeedContext.Provider>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

// ---------------------------------------------------------------------------
// Experiment arms
// ---------------------------------------------------------------------------

export interface ArmConfig {
  variant: AdLabelVariant;
  name: string;
  summary: string;
}

export const arms: ArmConfig[] = [
  {
    variant: AdLabelVariant.Control,
    name: 'Control',
    summary: '"Promoted by {advertiser}" + "Advertise here"',
  },
  {
    variant: AdLabelVariant.Ad,
    name: 'Variant A — ad',
    summary: 'Advertiser hidden, disclosed as "Ad". "Advertise here" stays.',
  },
  {
    variant: AdLabelVariant.AdOnly,
    name: 'Variant B — ad_only',
    summary: 'Advertiser hidden, disclosed as "Ad". "Advertise here" removed.',
  },
];

// `control` is the blanket mock value for every flag, which would leave
// autorotation on a NaN timer and force the v3 tag row on. Pin the flags that
// change the ad card to their production defaults, so only `ad_label` differs.
const baseOverrides: Record<string, unknown> = {
  [featureAutorotateAds.id]: 0,
  [adImprovementsV3Feature.id]: false,
  [featureFeedCardGlassActions.id]: false,
};

interface ArmProps {
  arm: ArmConfig;
  className?: string;
  /** Extra flags to pin for this column, e.g. glass actions or v3 tags. */
  overrides?: Record<string, unknown>;
  children: ReactNode;
}

export const Arm = ({
  arm,
  className,
  overrides,
  children,
}: ArmProps): ReactElement => (
  <div className={classNames('flex w-full flex-col gap-3', className)}>
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-callout">{arm.name}</span>
      <code className="text-text-tertiary typo-footnote">
        ad_label = {arm.variant}
      </code>
      <span className="text-text-tertiary typo-footnote">{arm.summary}</span>
    </div>
    <FeatureOverrides
      values={{
        ...baseOverrides,
        ...overrides,
        [featureAdLabel.id]: arm.variant,
      }}
    >
      {children}
    </FeatureOverrides>
  </div>
);

interface SectionProps {
  title: string;
  description?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}

export const Section = ({
  title,
  description,
  note,
  children,
}: SectionProps): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {description && (
        <p className="max-w-[48rem] text-text-tertiary typo-callout">
          {description}
        </p>
      )}
      {note && (
        <p className="max-w-[48rem] rounded-8 border border-border-subtlest-tertiary p-3 text-text-tertiary typo-footnote">
          {note}
        </p>
      )}
    </div>
    {children}
  </section>
);

export const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-10 bg-background-default p-6 text-text-primary">
    {children}
  </div>
);
