import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGivebackSponsors } from '../../../lib/featureManagement';
import { GivebackBackground } from './GivebackBackground';
import { GivebackFunnel } from './GivebackFunnel';
import { GivebackHero } from './GivebackHero';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { GivebackLegalFooter } from './GivebackLegalFooter';
import { GivebackTabNav, givebackTabs } from './GivebackTabNav';
import { GivebackActionCatalog } from './GivebackActionCatalog';
import { GivebackContributionSummary } from './GivebackContributionSummary';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { GivebackCausesPanel } from './GivebackCausesPanel';
import { GivebackFaqPanel } from './GivebackFaqPanel';
import type { GivebackTabId } from './GivebackTabNav';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';

// Centers a section to the page column. The tab nav lives outside this so its
// glass background can span the full content width.
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

  // Sponsors are gated off for launch (no sponsors yet); flip the flag on later.
  const { value: showSponsors } = useConditionalFeature({
    feature: featureGivebackSponsors,
    shouldEvaluate: true,
  });

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
      setActiveTab(tab);
      // Snap the tab strip to the top so the freshly-switched content starts in
      // view instead of mid-scroll from the previous tab.
      scrollToTabs();
    },
    [logEvent, scrollToTabs],
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

        {showSponsors && (
          <div className={column}>
            <GivebackSponsorTiers />
          </div>
        )}

        {showTabs && (
          <div ref={tabsRef} className="scroll-mt-16">
            <GivebackTabNav activeTab={activeTab} onSelect={handleSelectTab} />

            <div
              key={activeTab}
              role="region"
              aria-label={activeLabel}
              // Reserve a viewport-tall content area so a short (e.g. filtered)
              // list still leaves enough room to scroll the tab strip to the top
              // — otherwise the sticky tabs spring back and the page "jumps".
              className={`${column} min-h-[calc(100dvh-3.5rem)] pt-8`}
            >
              {activeTab === 'actions' && (
                <FlexCol className="gap-6">
                  <FlexCol className="gap-2">
                    <Typography
                      tag={TypographyTag.H2}
                      type={TypographyType.Title2}
                      bold
                      className="[text-wrap:balance]"
                    >
                      Your contribution
                    </Typography>
                    <Typography
                      tag={TypographyTag.P}
                      type={TypographyType.Callout}
                      color={TypographyColor.Secondary}
                      className="max-w-2xl [text-wrap:pretty]"
                    >
                      Every action you take unlocks real money for the causes
                      you back. Pick one below and your contribution grows.
                    </Typography>
                  </FlexCol>
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
              {activeTab === 'faq' && <GivebackFaqPanel />}
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
