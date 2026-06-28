import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { GivebackBackground } from './GivebackBackground';
import { GivebackHero } from './GivebackHero';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import { GivebackOnboardingBar } from './GivebackOnboardingBar';
import { GivebackLegalFooter } from './GivebackLegalFooter';
import { GivebackTabNav, givebackTabs } from './GivebackTabNav';
import { GivebackActionCatalog } from './GivebackActionCatalog';
import { GivebackContributionSummary } from './GivebackContributionSummary';
import { GivebackImpactPanel } from './GivebackImpactPanel';
import { GivebackCausesPanel } from './GivebackCausesPanel';
import { GivebackFaq } from './GivebackFaq';
import { GivebackFundingBar } from './GivebackFundingBar';
import type { GivebackTabId } from './GivebackTabNav';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGivebackSponsors } from '../../../lib/featureManagement';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';

// Centers a section to the page column. The tab nav lives outside this so its
// glass background can span the full content width.
const column = 'mx-auto w-full max-w-6xl px-4';

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
  // visitors load their picks — which also tells us whether to show the tabs.
  const isEligible = status?.eligible === true;
  const selection = useGivebackCauseSelection(isEligible);

  // Sponsors are gated off for launch (no sponsors yet); flip the flag on later.
  const { value: showSponsors } = useConditionalFeature({
    feature: featureGivebackSponsors,
    shouldEvaluate: true,
  });

  // First-timers open the picker from the hero; once they confirm (or arrive
  // already onboarded) the tabbed experience takes over.
  const [startedPicker, setStartedPicker] = useState(false);
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<GivebackTabId>('actions');

  const showTabs = selection.hasSavedCauses || completedOnboarding;
  const showPicker = startedPicker && !showTabs;

  // Hold the hero CTA until we know the onboarding state, so its copy doesn't
  // flip from "Join the campaign" to "Take action" after the data lands. Settled
  // once the campaign status loads and (for eligible visitors) the picks do too.
  const isCtaResolving =
    !status || (isEligible && selection.isLoading && !completedOnboarding);

  const causesRef = useRef<HTMLDivElement>(null);
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
    },
    [logEvent],
  );

  const handleContinue = useCallback(async () => {
    const saved = await selection.save();
    if (saved) {
      logEvent({
        event_name: LogEvent.SaveGivebackCauses,
        extra: JSON.stringify({
          cause_count: selection.selectedIds.size,
          cause_ids: [...selection.selectedIds],
        }),
      });
      setCompletedOnboarding(true);
      goToActions();
    }
  }, [selection, goToActions, logEvent]);

  // Reveal the picker, then bring it into view as it mounts.
  useEffect(() => {
    if (showPicker) {
      scrollIntoView(causesRef.current);
    }
  }, [showPicker]);

  const activeLabel = givebackTabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="relative min-h-page w-full">
      <GivebackBackground />

      <FlexCol className="relative gap-14 py-8 tablet:py-14">
        <div className={column}>
          <GivebackHero
            isResolving={isCtaResolving}
            hasSelectedCauses={showTabs}
            onJoin={() => setStartedPicker(true)}
            onTakeAction={goToActions}
          />
        </div>

        {showSponsors && (
          <div className={column}>
            <GivebackSponsorTiers />
          </div>
        )}

        {showPicker && (
          <div ref={causesRef} className={`${column} scroll-mt-16`}>
            <FlexCol className="gap-6">
              <FlexCol className="gap-2">
                <Typography
                  tag={TypographyTag.H2}
                  type={TypographyType.Title2}
                  bold
                >
                  Pick the causes you care about
                </Typography>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Your actions fund the causes you choose. We fund developers,
                  not ads.
                </Typography>
              </FlexCol>
              <GivebackCauseSelection
                causes={selection.causes}
                isLoading={selection.isLoading}
                selectedIds={selection.selectedIds}
                onToggle={selection.toggleCause}
              />
            </FlexCol>
          </div>
        )}

        {showTabs && (
          <div ref={tabsRef} className="scroll-mt-16">
            <GivebackTabNav activeTab={activeTab} onSelect={handleSelectTab} />

            <div
              key={activeTab}
              role="region"
              aria-label={activeLabel}
              className={`${column} pt-8`}
            >
              {activeTab === 'actions' && (
                <FlexCol className="gap-6">
                  <GivebackContributionSummary />
                  <GivebackActionCatalog />
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

      {showPicker && (
        <GivebackOnboardingBar
          selectedCount={selection.selectedCount}
          isSaving={selection.isSaving}
          onContinue={handleContinue}
        />
      )}

      {showTabs && <GivebackFundingBar onTakeAction={goToActions} />}
    </div>
  );
};
