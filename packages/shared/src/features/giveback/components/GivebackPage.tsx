import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { FlexCol } from '../../../components/utilities';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { GivebackBackground } from './GivebackBackground';
import { GivebackFunnel } from './GivebackFunnel';
import { GivebackHero } from './GivebackHero';
import { GivebackLegalFooter } from './GivebackLegalFooter';
import { GivebackTabNav, givebackTabs } from './GivebackTabNav';
import { GivebackActionCatalog } from './GivebackActionCatalog';
import { GivebackContributionSummary } from './GivebackContributionSummary';
import { GivebackTabHeading } from './GivebackTabHeading';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { GivebackCausesPanel } from './GivebackCausesPanel';
import { GivebackFaq } from './GivebackFaq';
import type { GivebackTabId } from './GivebackTabNav';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';

// Single source of truth for the page gutter, shared by the hero, the tab
// content and the footer so every row lines up at the exact same left/right
// padding. Scales up on wider screens so content isn't edge-tight.
const column = 'mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12';

const scrollIntoView = (node: HTMLElement | null): void => {
  if (!node || typeof node.scrollIntoView !== 'function') {
    return;
  }
  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const GivebackPage = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { status } = useContributionStatus();
  // Eligibility gates the cause picker query (backend-gated), so only eligible
  // visitors load their picks - which also tells us whether to show the tabs.
  const isEligible = status?.eligible === true;
  const selection = useGivebackCauseSelection(isEligible);

  // Causes are confirmed inside the warm-up funnel; once they save (or the
  // visitor arrives already onboarded) the tabbed experience takes over.
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<GivebackTabId>('actions');

  // The warm-up funnel runs full-screen once for everyone, then only on demand
  // via "How it works". Wait for the persisted flag so returning users never see
  // a flash of it.
  const [funnelSeen, setFunnelSeen, funnelLoaded] =
    usePersistentContext<boolean>('giveback:funnel_seen', false, [true, false]);
  const [replayFunnel, setReplayFunnel] = useState(false);

  const showTabs = selection.hasSavedCauses || completedOnboarding;
  const showFunnel = replayFunnel || (funnelLoaded && funnelSeen === false);

  const tabsRef = useRef<HTMLDivElement>(null);

  // The tab section can mount in the same tick we ask to scroll (right after
  // confirming causes), so defer to the next frame to let it commit first.
  const scrollToTabs = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.requestAnimationFrame(() => scrollIntoView(tabsRef.current));
  }, []);

  const goToActions = useCallback(() => {
    setActiveTab('actions');
    scrollToTabs();
  }, [scrollToTabs]);

  const handleSelectTab = useCallback(
    (tab: GivebackTabId) => {
      logEvent({
        event_name: LogEvent.ClickGivebackTab,
        extra: JSON.stringify({ tab }),
      });
      // Just swap the content below - don't scroll the page to the tab strip.
      // The reserved min-height on the content area keeps the scroll position
      // stable even when the newly-selected tab is shorter.
      setActiveTab(tab);
    },
    [logEvent],
  );

  const handleHowItWorks = useCallback(() => {
    logEvent({ event_name: LogEvent.ClickGivebackHowItWorks });
    setReplayFunnel(true);
  }, [logEvent]);

  // Finishing the funnel locks in the seen flag and saves the visitor's causes.
  // A forced first run then drops them into the campaign; a replay just closes.
  const handleFunnelComplete = useCallback(async () => {
    const wasReplay = replayFunnel;
    await setFunnelSeen(true);
    const saved = await selection.save();
    if (saved) {
      logEvent({
        event_name: LogEvent.SaveGivebackCauses,
        extra: JSON.stringify({
          cause_count: selection.selectedIds.size,
          cause_ids: [...selection.selectedIds],
          origin: 'funnel',
        }),
      });
    }
    if (wasReplay) {
      setReplayFunnel(false);
      return;
    }
    setCompletedOnboarding(true);
    goToActions();
  }, [replayFunnel, setFunnelSeen, selection, logEvent, goToActions]);

  const activeLabel = givebackTabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="relative min-h-page w-full">
      <GivebackBackground />

      <FlexCol className="relative gap-6 py-6 tablet:gap-8 tablet:py-8">
        <div className={column}>
          <GivebackHero onHowItWorks={handleHowItWorks} />
        </div>

        {showTabs && (
          <div ref={tabsRef} className="scroll-mt-16">
            <GivebackTabNav activeTab={activeTab} onSelect={handleSelectTab} />

            <div
              key={activeTab}
              role="region"
              aria-label={activeLabel}
              // Only the filterable tabs reserve a viewport-tall area: when their
              // list shrinks on filter, the extra height keeps the sticky tabs
              // from springing back (the page "jump"). Impact/FAQ have no filters,
              // so they fit content naturally - no dead gap before the footer.
              className={`${column} pt-8 ${
                activeTab === 'actions' || activeTab === 'causes'
                  ? 'min-h-[calc(100dvh-3.5rem)]'
                  : ''
              }`}
            >
              {activeTab === 'actions' && (
                <FlexCol className="gap-6">
                  <GivebackTabHeading
                    title="Your contribution"
                    description="Each action unlocks real money for the causes you back, funded by us, chosen by you. Take one and watch your number climb."
                  />
                  <GivebackContributionSummary />
                  <GivebackActionCatalog onFilter={scrollToTabs} />
                </FlexCol>
              )}
              {activeTab === 'impact' && (
                <GivebackImpactPanel onTakeAction={goToActions} />
              )}
              {activeTab === 'causes' && (
                <GivebackCausesPanel onFilter={scrollToTabs} />
              )}
              {activeTab === 'faq' && <GivebackFaq />}
            </div>
          </div>
        )}

        <div className={column}>
          <GivebackLegalFooter />
        </div>
      </FlexCol>

      {showFunnel && (
        <GivebackFunnel
          selection={selection}
          canClose={replayFunnel}
          onClose={() => setReplayFunnel(false)}
          onComplete={handleFunnelComplete}
        />
      )}
    </div>
  );
};
