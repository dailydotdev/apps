import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import { isDevelopment } from '../../../lib/constants';
import { GivebackProvider, useGivebackContext } from '../GivebackContext';
import { GivebackNavProvider } from '../GivebackNavContext';
import type { GivebackTabId } from '../GivebackNavContext';
import { GivebackHero } from './GivebackHero';
import { CommunityGoalProgress } from './CommunityGoalProgress';
import { PersonalRoadmap } from './PersonalRoadmap';
import { GivebackReviewToggle } from './GivebackReviewToggle';
import { ActionCatalog } from './ActionCatalog';
import { CauseSelection } from './CauseSelection';
import { CommunityImpactSection } from './CommunityImpactSection';
import { GeoGateFallback } from './GeoGateFallback';
import { BudgetRedirectStory } from './BudgetRedirectStory';
import { GivebackParticipateStrip } from './GivebackParticipateStrip';
import { GivebackStretchGoals } from './GivebackStretchGoals';
import { GivebackFundingBar } from './GivebackFundingBar';
import { GivebackFaq } from './GivebackFaq';
import { GivebackUpdates } from './GivebackUpdates';
import { GivebackComments } from './GivebackComments';
import { GivebackReveal } from './GivebackReveal';
import { GivebackSocialProof } from './GivebackSocialProof';
import { GivebackClosingCta } from './GivebackClosingCta';

// The first run is guided: opt in from the hero, pick causes, then continue to
// the Impact view (community money + your contribution). The rest are tabs the
// visitor can jump between freely.
const tabs: { id: GivebackTabId; label: string }[] = [
  { id: 'causes', label: 'Causes' },
  { id: 'impact', label: 'Impact' },
  { id: 'why', label: 'Why' },
  { id: 'actions', label: 'Take action' },
  { id: 'updates', label: 'Updates' },
  { id: 'comments', label: 'Comments' },
  { id: 'faq', label: 'FAQ' },
];

const renderActivePanel = (tab: GivebackTabId): ReactElement => {
  switch (tab) {
    case 'actions':
      return <ActionCatalog />;
    case 'causes':
      return <CauseSelection />;
    case 'why':
      return (
        <FlexCol className="gap-12">
          <BudgetRedirectStory />
          <GivebackStretchGoals />
          <CommunityImpactSection />
        </FlexCol>
      );
    case 'updates':
      return <GivebackUpdates />;
    case 'comments':
      return <GivebackComments />;
    case 'faq':
      return <GivebackFaq />;
    case 'impact':
    default:
      return (
        <FlexCol className="gap-12">
          <CommunityGoalProgress />
          <GivebackParticipateStrip />
          <PersonalRoadmap />
        </FlexCol>
      );
  }
};

const GivebackPageContent = (): ReactElement => {
  const { geoAvailability } = useGivebackContext();
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTabState] = useState<GivebackTabId>('causes');
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

  // Opting in drops the visitor on the cause picker first — pick what you care
  // about, then continue to the community Impact view.
  const start = useCallback(() => {
    setHasStarted(true);
    setActiveTabState('causes');
  }, []);

  // Scroll to the freshly revealed tabs once they mount.
  useEffect(() => {
    if (hasStarted) {
      scrollToTabs();
    }
  }, [hasStarted, scrollToTabs]);

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="bg-accent-cabbage-default/10 absolute left-1/2 top-0 size-[38rem] -translate-x-1/2 rounded-full blur-3xl" />
          <div className="bg-accent-onion-default/10 absolute -right-40 top-[34rem] size-[30rem] rounded-full blur-3xl" />
          <div className="bg-accent-cheese-default/10 absolute -left-32 top-[58rem] size-[26rem] rounded-full blur-3xl" />
        </div>

        <FlexCol
          className={classNames(
            'relative mx-auto w-full max-w-6xl gap-14 px-4 py-8 tablet:py-14',
            hasStarted && 'pb-28',
          )}
        >
          <GivebackReveal>
            <GivebackHero />
          </GivebackReveal>

          <GivebackReveal>
            <GivebackSocialProof />
          </GivebackReveal>

          {hasStarted && (
            <>
              <FlexCol className="gap-10">
                <div
                  ref={tabsRef}
                  className="sticky top-0 z-3 -mx-4 scroll-mt-4 border-b border-border-subtlest-tertiary bg-background-default px-4"
                >
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
                            'relative shrink-0 whitespace-nowrap p-2 py-4 text-center font-bold transition-colors typo-callout',
                            selected
                              ? 'text-text-primary'
                              : 'text-text-tertiary hover:text-text-primary',
                          )}
                        >
                          <span
                            className={classNames(
                              'flex flex-row items-center gap-1 rounded-10 px-3 py-1.5',
                              selected && 'bg-theme-active',
                            )}
                          >
                            {tab.label}
                          </span>
                          {selected && (
                            <span
                              aria-hidden
                              className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-4 bg-text-primary"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  key={activeTab}
                  role="tabpanel"
                  id={`giveback-panel-${activeTab}`}
                  aria-labelledby={`giveback-tab-${activeTab}`}
                >
                  <GivebackReveal>
                    {renderActivePanel(activeTab)}
                  </GivebackReveal>
                </div>
              </FlexCol>

              <GivebackReveal>
                <GivebackClosingCta />
              </GivebackReveal>
            </>
          )}
        </FlexCol>

        {hasStarted && <GivebackFundingBar />}
      </div>
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
