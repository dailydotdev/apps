import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { graphql, HttpResponse } from 'msw';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext, {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { PushNotificationsContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { AdvancedSettingsGroup } from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import {
  featureOnboardingChrome,
  OnboardingChromeVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import ExtensionProviders from '../../extension/_providers';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';

/**
 * Storybook harness for the signup onboarding funnel (`/onboarding`).
 *
 * The real page can't be opened locally (it redirects to `/` on localhost) and
 * every step is guarded — by auth, by feed-settings data, and by device checks
 * — so the steps are mounted here with those inputs faked. Everything below is
 * story scaffolding only; no step component knows about it.
 */

// The 25 tags the production `onboardingTags` query returns, verbatim.
const TAGS = [
  'ai',
  'architecture',
  'cloud',
  'crypto',
  'database',
  'data-science',
  'devops',
  'elixir',
  'gaming',
  'golang',
  'java',
  'javascript',
  'machine-learning',
  'mobile',
  '.net',
  'open-source',
  'python',
  'react',
  'ruby',
  'rust',
  'security',
  'tech-news',
  'testing',
  'tools',
  'webdev',
].map((name) => ({ name }));

// Verbatim from the production `advancedSettings` query (api.daily.dev), so the
// step filters and renders exactly the set a real user sees. The step shows the
// `content_source` group, then `content_curation` + `source_types`, then the
// four titles in TOGGLEABLE_TYPES — 14 cards in total.
const ADVANCED_SETTINGS = [
  {
    id: 7,
    title: 'Videos',
    description: 'Show video posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 8,
    title: 'Community picks',
    description:
      'Posts submitted by daily.dev community members from across the web.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentSource,
    options: { source: { id: 'community', handle: 'community' } },
  },
  {
    id: 9,
    title: 'News',
    description:
      'Reports on tech industry events and breakthroughs, keeping you updated.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 10,
    title: 'Opinions',
    description:
      'Posts expressing personal views or predictions on various topics.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 11,
    title: 'Listicles',
    description:
      'Posts in list format compiling third-party elements for theme overviews.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 12,
    title: 'Comparisons',
    description:
      'Posts comparing libraries or tools to help you make decisions.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 13,
    title: 'Stories',
    description:
      'Evergreen posts offering detailed insights and viewpoints on various topics.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 14,
    title: 'Tutorials',
    description:
      'Step-by-step guides to learn and teach specific skills or topics.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 15,
    title: 'Releases',
    description:
      'Announcements of new versions or features of products or tools.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 16,
    title: 'Memes',
    description:
      'Funny images, videos, or phrases reflecting cultural trends and entertainment.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentCuration,
  },
  {
    id: 17,
    title: 'Squads',
    description: 'Developer-created posts from various Squads on the platform.',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.SourceTypes,
  },
  {
    id: 18,
    title: 'Article',
    description: 'Show article posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 19,
    title: 'Share',
    description: 'Show share posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 20,
    title: 'Freeform',
    description: 'Show freeform posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 22,
    title: 'Collection',
    description: 'Show collection posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 23,
    title: 'Polls',
    description: 'Show poll posts on my feed',
    defaultEnabledState: true,
    group: AdvancedSettingsGroup.ContentTypes,
  },
  {
    id: 24,
    title: 'Social',
    description:
      'Posts from social platforms, including tweets and threads shared on daily.dev.',
    defaultEnabledState: false,
    group: AdvancedSettingsGroup.ContentTypes,
  },
];

// `useFeedSettings` and the onboarding tag list both hit the API. Seeding them
// has to happen from INSIDE the provider tree — ExtensionProviders mounts its
// own QueryClientProvider, so a client created outside is invisible to them.
const SeedFeedSettings = ({
  children,
}: PropsWithChildren): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    client.setQueryData(getFeedSettingsQueryKey(user), {
      tagsCategories: [],
      advancedSettings: ADVANCED_SETTINGS,
      feedSettings: {
        includeTags: ['javascript', 'react', 'devops', 'ai', 'webdev'],
        blockedTags: [],
        excludeSources: [],
        advancedSettings: [],
      },
    });
    client.setQueryData(
      generateQueryKey(RequestKey.Tags, undefined, 'onboardingTags', undefined),
      { tags: TAGS },
    );
    setIsSeeded(true);
  }, [client, user]);

  return isSeeded ? <>{children}</> : null;
};

/**
 * Steps that force a dark background (the browser extension) do it by adding
 * `.invert`, which flips the theme of the subtree — and they decide whether to
 * add it from `useIsLightTheme()`, i.e. the settings context. Storybook's theme
 * toolbar only sets the class on `<html>`, while the boot mock still reports
 * `Auto` (= the OS preference), so on a light-preferring machine the dark
 * toolbar theme rendered those steps inverted into light. Pinning the context
 * to the class the toolbar actually applied keeps the two in sync, as they are
 * in the real app.
 */
const ThemeModeSync = ({ children }: PropsWithChildren): ReactElement => {
  const settings = useSettingsContext();
  const [themeMode, setThemeMode] = useState(ThemeMode.Dark);

  useEffect(() => {
    const read = () =>
      setThemeMode(
        document.documentElement.classList.contains(ThemeMode.Light)
          ? ThemeMode.Light
          : ThemeMode.Dark,
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const value = useMemo(
    () => ({ ...settings, themeMode }),
    [settings, themeMode],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * The feed-settings writes the funnel makes while you click through it. They
 * only need to resolve — the hooks apply their own optimistic cache update on
 * `onMutate` and roll it back on error, so an unhandled request reads as "the
 * toggle does nothing". Matched by operation name, so the funnel's `undefined`
 * API origin in Storybook is irrelevant.
 */
export const FEED_SETTINGS_HANDLERS = [
  graphql.mutation('UpdateFeedAdvancedSettings', ({ variables }) =>
    HttpResponse.json({ data: { feedSettings: variables.settings ?? [] } }),
  ),
  graphql.mutation('AddFiltersToFeed', () =>
    HttpResponse.json({ data: { feedSettings: { id: 'feed' } } }),
  ),
  graphql.mutation('RemoveFiltersFromFeed', () =>
    HttpResponse.json({ data: { feedSettings: { id: 'feed' } } }),
  ),
  graphql.mutation('UpdateUserAlerts', () =>
    HttpResponse.json({ data: { updateUserAlerts: { filter: false } } }),
  ),
];

const pushNotificationsMock = {
  isPushSupported: true,
  isInitialized: true,
  isSubscribed: false,
  isLoading: false,
  shouldOpenPopup: () => false,
  subscribe: async () => true,
  unsubscribe: async () => undefined,
};

// The real position comes from FunnelStepper, which the stories do not mount.
const FUNNEL_STEP_COUNT = 9;

/**
 * Pins the onboarding-chrome experiment to one arm. Storybook swaps
 * `useConditionalFeature` for a mock that only reads `FeatureOverrides`.
 */
const ChromeArm = ({
  variant,
  children,
}: PropsWithChildren<{ variant: OnboardingChromeVariant }>): ReactElement => (
  <FeatureOverrides values={{ [featureOnboardingChrome.id]: variant }}>
    {children}
  </FeatureOverrides>
);

export interface FunnelStepShellProps extends PropsWithChildren {
  // Zero-based index of this step, used only to light the progress dots.
  stepIndex?: number;
  // Steps in `stepsFullWidth` skip the funnel's centred column; the rest are
  // capped by FunnelStepper, and the shell mirrors that so the CTA rail sits
  // exactly where it does in production.
  fullWidth?: boolean;
  // Which arm of the onboarding-chrome experiment to render.
  chrome?: OnboardingChromeVariant;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the step union is resolved at runtime by `type`
  step: any;
}

export const FunnelStepShell = ({
  children,
  chrome = OnboardingChromeVariant.Control,
  fullWidth,
  step,
  stepIndex = 0,
}: FunnelStepShellProps): ReactElement => (
  <ExtensionProviders>
    <ChromeArm variant={chrome}>
      <FunnelProgressContext.Provider
        value={{
          chapters: [{ steps: FUNNEL_STEP_COUNT }],
          position: { chapter: 0, step: stepIndex },
          // These stories are the onboarding funnel; without this the steps fall
          // back to the paid funnel's per-step gradients.
          isOnboarding: true,
        }}
      >
        <ThemeModeSync>
          <PushNotificationsContext.Provider
            value={pushNotificationsMock as never}
          >
            <SeedFeedSettings>
              <div className="flex min-h-dvh flex-col">
                <FunnelStepBackground step={step} isOnboarding>
                  <div
                    className={
                      fullWidth
                        ? 'mx-auto flex w-full flex-1 flex-col'
                        : 'mx-auto flex w-full flex-1 flex-col tablet:max-w-md laptopXL:max-w-lg'
                    }
                  >
                    {children}
                  </div>
                </FunnelStepBackground>
              </div>
            </SeedFeedSettings>
          </PushNotificationsContext.Provider>
        </ThemeModeSync>
      </FunnelProgressContext.Provider>
    </ChromeArm>
  </ExtensionProviders>
);
