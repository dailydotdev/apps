import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
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
import { GivebackSponsors } from './GivebackSponsors';
import { GivebackClosingCta } from './GivebackClosingCta';
import { GivebackLegalFooter } from './GivebackLegalFooter';
import { GivebackBackground } from './GivebackBackground';
import { GivebackCelebration } from './GivebackCelebration';

// The first run is guided: opt in from the hero, pick causes, then continue to
// the Impact view (community money + your contribution). The rest are tabs the
// visitor can jump between freely.
const tabs: { id: GivebackTabId; label: string }[] = [
  { id: 'causes', label: 'Causes' },
  { id: 'impact', label: 'Impact' },
  { id: 'actions', label: 'Take action' },
  { id: 'why', label: 'Why' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'updates', label: 'Updates' },
  { id: 'comments', label: 'Comments' },
  { id: 'faq', label: 'FAQ' },
];

// One big two-part headline per tab: a white line plus a gradient payoff,
// matching the hero. Sections beneath only carry small plain sub-titles.
const tabHeaders: Record<GivebackTabId, { title: string; highlight: string }> =
  {
    causes: {
      title: 'We fund developers, not ads.',
      highlight: 'You pick causes you care about.',
    },
    impact: {
      title: 'You take action.',
      highlight: 'We fund the causes.',
    },
    why: {
      title: 'Big tech burns billions just to get noticed.',
      highlight: 'We send ours where it actually changes lives.',
    },
    sponsors: {
      title: 'Sponsors top up the budget.',
      highlight: 'Together we fund more good.',
    },
    actions: {
      title: 'Take a small action.',
      highlight: 'We turn it into a donation.',
    },
    updates: {
      title: 'Follow the journey.',
      highlight: "See what's moving.",
    },
    comments: {
      title: 'Join the conversation.',
      highlight: 'Tell us what you think.',
    },
    faq: {
      title: 'Got questions?',
      highlight: "We've got answers.",
    },
  };

const GivebackTabHeader = ({ tab }: { tab: GivebackTabId }): ReactElement => {
  const { title, highlight } = tabHeaders[tab];

  return (
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.LargeTitle}
      bold
      className="max-w-3xl"
    >
      {title}
      <span className="block bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
        {highlight}
      </span>
    </Typography>
  );
};

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
    case 'sponsors':
      return <GivebackSponsors />;
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
        <GivebackBackground />

        <FlexCol className="relative mx-auto w-full max-w-6xl gap-14 px-4 py-8 tablet:py-14">
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
                  className="bg-background-default/80 sticky top-0 z-3 -mx-4 scroll-mt-4 border-b border-border-subtlest-tertiary px-4 backdrop-blur-xl"
                >
                  <div
                    aria-hidden
                    className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
                  />
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
                      <GivebackTabHeader tab={activeTab} />
                      {renderActivePanel(activeTab)}
                    </FlexCol>
                  </GivebackReveal>
                </div>
              </FlexCol>

              <GivebackReveal>
                <GivebackClosingCta />
              </GivebackReveal>
            </>
          )}

          <GivebackReveal>
            <GivebackLegalFooter />
          </GivebackReveal>
        </FlexCol>

        {hasStarted && <GivebackFundingBar />}
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
