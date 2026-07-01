import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { FlexCol } from '../../../components/utilities';
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
import { GivebackCausesBreakdown } from './GivebackCausesBreakdown';
import type { GivebackCauseAllocation } from './GivebackCausesBreakdown';
import { GivebackFaq } from './GivebackFaq';
import type { GivebackTabId } from './GivebackTabNav';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import type { ContributionCause } from '../types';

// Single source of truth for the page gutter, shared by the hero, the tab
// content and the footer so every row lines up at the exact same left/right
// padding. Scales up on wider screens so content isn't edge-tight.
const column = 'mx-auto w-full max-w-6xl px-4 tablet:px-8 laptop:px-12';

// Placeholder split for the "Where the money lands" breakdown. The contribution
// API has no per-cause amounts yet, so we spread the current cycle pool across
// the campaign causes with a stable descending weight purely to visualize the
// block in context. Swap this for real per-cause figures once the backend
// exposes them.
const BREAKDOWN_WEIGHTS = [42, 26, 18, 11, 7, 4];

const buildCausesBreakdown = (
  causes: ContributionCause[],
  pool: number,
): GivebackCauseAllocation[] => {
  if (pool <= 0 || causes.length === 0) {
    return [];
  }

  const used = causes.slice(0, BREAKDOWN_WEIGHTS.length);
  const weights = used.map((_, index) => BREAKDOWN_WEIGHTS[index] ?? 3);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return used.map((cause, index) => ({
    cause,
    amount: Math.round((pool * weights[index]) / weightSum),
  }));
};

// TEMP PREVIEW — remove after design review. Hardcoded allocations + the
// PREVIEW_BREAKDOWN flag below force the breakdown (and the page body) to render
// locally without a live campaign pool, eligibility, or saved causes.
const PREVIEW_BREAKDOWN = true;
const DEMO_CAUSES_BREAKDOWN: GivebackCauseAllocation[] = [
  { cause: { id: 'demo-oss', title: 'Open-source maintainers', url: null, description: null, category: 'Open source', logoUrl: null }, amount: 4200 },
  { cause: { id: 'demo-scholar', title: 'Dev scholarships', url: null, description: null, category: 'Education', logoUrl: null }, amount: 2600 },
  { cause: { id: 'demo-access', title: 'Access to tech', url: null, description: null, category: 'Accessibility', logoUrl: null }, amount: 1800 },
  { cause: { id: 'demo-climate', title: 'Climate tech', url: null, description: null, category: 'Climate', logoUrl: null }, amount: 1100 },
  { cause: { id: 'demo-mentor', title: 'Mentorship programs', url: null, description: null, category: 'Education', logoUrl: null }, amount: 700 },
  { cause: { id: 'demo-docs', title: 'Better docs', url: null, description: null, category: 'Open source', logoUrl: null }, amount: 400 },
];

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
  const [replayFunnel, setReplayFunnel] = useState(false);

  // Resolved once we know the campaign status and, for eligible visitors,
  // whether they've already saved causes. The whole body waits on this so the
  // hero and tabs never flash on screen before a forced funnel covers them, and
  // the tabs never pop in once the saved picks land.
  const onboardingResolved = !!status && (!isEligible || !selection.isLoading);

  // First-timers (eligible, no saved causes) get the warm-up funnel
  // automatically and it stays up until they save a pick; it's also replayable
  // from the hero's "How it works".
  const needsOnboarding =
    isEligible && !selection.hasSavedCauses && !completedOnboarding;
  const forcedFunnel = onboardingResolved && needsOnboarding;
  // TEMP PREVIEW — remove after design review. Keeps the forced funnel from
  // covering the page so the breakdown is visible.
  const showFunnel = !PREVIEW_BREAKDOWN && (replayFunnel || forcedFunnel);
  const showTabs = selection.hasSavedCauses || completedOnboarding;

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

  // Finishing the funnel saves the visitor's causes. A forced first run then
  // drops them into the campaign; a replay just closes.
  const handleFunnelComplete = useCallback(async () => {
    const wasReplay = replayFunnel;
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
  }, [replayFunnel, selection, logEvent, goToActions]);

  const activeLabel = givebackTabs.find((tab) => tab.id === activeTab)?.label;

  const causesBreakdown = PREVIEW_BREAKDOWN
    ? DEMO_CAUSES_BREAKDOWN
    : buildCausesBreakdown(selection.causes, status?.currentCyclePoints ?? 0);

  // `overflow-x-clip` on the root guards against any descendant (decorative glow,
  // popover, wide row) bleeding past the viewport: such bleed widens the document
  // and makes Android expand the layout viewport, which then mis-sizes fixed
  // overlays like the funnel (X/CTA pushed off-screen). `clip` (not `hidden`) adds
  // no scroll container, so the sticky tab nav keeps working.
  return (
    <div className="relative min-h-page w-full overflow-x-clip">
      <GivebackBackground />

      {/* Hold the body until we know whether to force the funnel. The funnel is a
          full-screen overlay on the same background, so revealing the hero/tabs
          first would flash them on screen before it covers them. While resolving,
          only the shared background shows, so there's no flash and no shift. */}
      {(PREVIEW_BREAKDOWN || (onboardingResolved && !forcedFunnel)) && (
        <FlexCol className="relative gap-6 py-6 tablet:gap-8 tablet:py-8">
          <div className={column}>
            <GivebackHero onHowItWorks={handleHowItWorks} />
          </div>

          {(PREVIEW_BREAKDOWN || (showTabs && causesBreakdown.length > 0)) && (
            <div className={column}>
              <GivebackCausesBreakdown
                variant="donut"
                flat
                allocations={causesBreakdown}
              />
            </div>
          )}

          {showTabs && (
            <div ref={tabsRef} className="scroll-mt-16">
              <GivebackTabNav
                activeTab={activeTab}
                onSelect={handleSelectTab}
              />

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
      )}

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
