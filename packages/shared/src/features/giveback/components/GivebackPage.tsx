import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { isDevelopment } from '../../../lib/constants';
import { GivebackProvider, useGivebackContext } from '../GivebackContext';
import { GivebackNavProvider } from '../GivebackNavContext';
import type { GivebackTabId } from '../GivebackNavContext';
import { GivebackHero } from './GivebackHero';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { PersonalRoadmap } from './PersonalRoadmap';
import { GivebackReviewToggle } from './GivebackReviewToggle';
import { ActionCatalog } from './ActionCatalog';
import { GivebackLeaderboard } from './GivebackLeaderboard';
import { CauseSelection } from './CauseSelection';
import { GeoGateFallback } from './GeoGateFallback';
import { BudgetRedirectStory } from './BudgetRedirectStory';
import { GivebackHeadline } from './GivebackHeadline';
import { GivebackFundingBar } from './GivebackFundingBar';
import { GivebackOnboardingBar } from './GivebackOnboardingBar';
import { GivebackFaq } from './GivebackFaq';
import { GivebackCommunityActivity } from './GivebackCommunityActivity';
import { GivebackReveal } from './GivebackReveal';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { GivebackSelectedCauses } from './GivebackSelectedCauses';
import { GivebackLegalFooter } from './GivebackLegalFooter';
import { GivebackBackground } from './GivebackBackground';
import { GivebackCelebration } from './GivebackCelebration';

// The first run is guided: opt in from the hero, pick causes (onboarding, no
// tabs yet), then the tabs appear. After onboarding, the picked causes are
// recapped on the Why tab, where they can be suggested or edited (portal).
const tabs: { id: GivebackTabId; label: string }[] = [
  { id: 'actions', label: 'Take action' },
  { id: 'impact', label: 'Impact' },
  { id: 'why', label: 'Campaign' },
];

const ONBOARDING_HEADER = {
  title: 'We fund developers, not ads.',
  highlight: 'You pick causes you care about.',
};

// One big two-part headline per tab: a white line plus a gradient payoff,
// matching the hero. Sections beneath only carry small plain sub-titles.
const tabHeaders: Record<GivebackTabId, { title: string; highlight: string }> =
  {
    impact: {
      title: 'See the impact we build together.',
      highlight: 'And where you rank.',
    },
    why: {
      title: 'Big tech buys ads.',
      highlight: 'We fund developers.',
    },
    actions: {
      title: 'Take a small action.',
      highlight: 'We turn it into a donation.',
    },
  };

const GivebackTabHeader = ({ tab }: { tab: GivebackTabId }): ReactElement => (
  <GivebackHeadline {...tabHeaders[tab]} />
);

const renderActivePanel = (tab: GivebackTabId): ReactElement => {
  switch (tab) {
    case 'actions':
      return <ActionCatalog />;
    case 'why':
      // The headline rides inside the story so the charm sits beside both the
      // title and the subtitle (the generic tab header is skipped for this tab).
      return (
        <FlexCol className="gap-8">
          <BudgetRedirectStory headline={tabHeaders.why} />
          <GivebackSelectedCauses />
          <GivebackFaq />
        </FlexCol>
      );
    case 'impact':
    default:
      return (
        <FlexCol className="gap-12">
          <CommunityGoalProgress />
          <div className="grid items-start gap-10 border-t border-border-subtlest-tertiary pt-12 laptop:grid-cols-2 laptop:gap-14">
            <GivebackLeaderboard />
            <GivebackCommunityActivity />
          </div>
          <PersonalRoadmap />
        </FlexCol>
      );
  }
};

const GivebackPageContent = (): ReactElement => {
  const { geoAvailability } = useGivebackContext();
  const [hasStarted, setHasStarted] = useState(false);
  // Picking causes is onboarding: until it's confirmed the tabs stay hidden.
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTabState] = useState<GivebackTabId>('actions');
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      return;
    }
    window.requestAnimationFrame(() => {
      const node = tabsRef.current;
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const setActiveTab = useCallback(
    (tab: GivebackTabId) => {
      setActiveTabState(tab);
      scrollToTabs();
    },
    [scrollToTabs],
  );

  // Opting in drops the visitor on the cause picker first (onboarding, no tabs).
  const start = useCallback(() => {
    setHasStarted(true);
  }, []);

  // Confirming causes finishes onboarding and reveals the tabs on "Take action".
  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
    setActiveTabState('actions');
    scrollToTabs();
  }, [scrollToTabs]);

  // Scroll to the freshly revealed content (onboarding, then tabs) as it mounts.
  useEffect(() => {
    if (hasStarted) {
      scrollToTabs();
    }
  }, [hasStarted, hasOnboarded, scrollToTabs]);

  // Geo-blocked: replace the whole experience with a single explicit gate.
  if (geoAvailability !== 'available') {
    return <GeoGateFallback />;
  }

  return (
    <GivebackNavProvider
      hasStarted={hasStarted}
      start={start}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="relative min-h-page w-full">
        <GivebackBackground />

        <FlexCol className="relative mx-auto w-full max-w-6xl gap-14 px-4 py-8 tablet:py-14">
          <GivebackReveal>
            <GivebackHero />
          </GivebackReveal>

          <GivebackReveal>
            <GivebackSponsorTiers />
          </GivebackReveal>

          {hasStarted && !hasOnboarded && (
            <div ref={tabsRef} className="scroll-mt-16">
              <GivebackReveal>
                <FlexCol className="gap-8">
                  <GivebackHeadline {...ONBOARDING_HEADER} />
                  <CauseSelection
                    onContinue={completeOnboarding}
                    stickyContinue
                  />
                </FlexCol>
              </GivebackReveal>
            </div>
          )}

          {hasOnboarded && (
            <FlexCol className="gap-10">
              <div
                ref={tabsRef}
                className="bg-background-default/80 sticky top-0 z-3 mx-[calc(50%-50vw)] w-screen scroll-mt-16 border-b border-border-subtlest-tertiary backdrop-blur-xl"
              >
                <div
                  aria-hidden
                  className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
                />
                {/* Inner wrapper re-centers the tabs to the page content width so
                    they line up with the panels below, while the strip's blur and
                    bottom border above bleed the full viewport width. */}
                <div className="mx-auto w-full max-w-6xl px-4">
                  <FlexRow className="items-center justify-between gap-2">
                    <div
                      role="tablist"
                      aria-label="Giveback sections"
                      className="flex overflow-x-auto"
                    >
                      {tabs.map((tab) => {
                        const selected = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`giveback-tab-${tab.id}`}
                            aria-selected={selected}
                            aria-controls={`giveback-panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={classNames(
                              'relative shrink-0 whitespace-nowrap p-2 py-4 text-center font-normal transition-colors duration-200 typo-callout active:scale-95',
                              selected
                                ? 'text-text-primary'
                                : 'text-text-tertiary hover:text-text-primary',
                            )}
                          >
                            <span
                              className={classNames(
                                'flex flex-row items-center gap-1 rounded-10 border px-3 py-1.5 transition-colors duration-200',
                                selected
                                  ? 'border-border-subtlest-secondary'
                                  : 'border-transparent hover:border-border-subtlest-tertiary',
                              )}
                            >
                              {tab.label}
                            </span>
                            {selected && (
                              <span
                                aria-hidden
                                className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-4 bg-text-primary"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </FlexRow>
                </div>
              </div>

              <div
                key={activeTab}
                role="tabpanel"
                id={`giveback-panel-${activeTab}`}
                aria-labelledby={`giveback-tab-${activeTab}`}
                className="relative"
              >
                <GivebackReveal>
                  <FlexCol className="gap-8">
                    {activeTab !== 'why' && (
                      <GivebackTabHeader tab={activeTab} />
                    )}
                    {renderActivePanel(activeTab)}
                  </FlexCol>
                </GivebackReveal>
              </div>
            </FlexCol>
          )}

          <GivebackReveal>
            <GivebackLegalFooter />
          </GivebackReveal>
        </FlexCol>

        {hasStarted && !hasOnboarded && (
          <GivebackOnboardingBar onContinue={completeOnboarding} />
        )}

        {hasOnboarded && <GivebackFundingBar />}
      </div>

      <GivebackCelebration />
    </GivebackNavProvider>
  );
};

export const GivebackPage = (): ReactElement => {
  return (
    <GivebackProvider>
      <GivebackPageContent />
      {isDevelopment && <GivebackReviewToggle />}
    </GivebackProvider>
  );
};
