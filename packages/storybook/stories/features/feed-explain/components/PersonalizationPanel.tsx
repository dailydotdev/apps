import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { usePersonalization } from './PersonalizationContext';
import { ControlSection } from './FeedScreenContext';
import { ChangesDock } from './ChangesDock';
import { PanelCard, PanelSection, sectionId } from './panel/Section';
import { InterestsSection } from './panel/InterestsSection';
import { SourcesSection } from './panel/SourcesSection';
import { RankingSection } from './panel/RankingSection';
import { ResetSection, SettingsSection } from './panel/SettingsSection';
import { LeftOutList, NextPageList } from './panel/Preview';
import { AgentSetupButton } from './panel/AgentSetup';

const navItems: Array<{ section: ControlSection; label: string }> = [
  { section: ControlSection.Interests, label: 'Topics' },
  { section: ControlSection.Sources, label: 'Sources and people' },
  { section: ControlSection.Ranking, label: 'Ranking' },
  { section: ControlSection.LeftOut, label: 'Your next page' },
  { section: ControlSection.Settings, label: 'Other settings' },
  { section: ControlSection.Reset, label: 'Start over' },
];

enum RailTab {
  Next = 'next',
  LeftOut = 'left-out',
}

const railQuery = '(min-width: 1020px)';

const scrollTo = (section: ControlSection) =>
  document
    .getElementById(sectionId(section))
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Rail = ({
  tab,
  onTabChange,
}: {
  tab: RailTab;
  onTabChange: (tab: RailTab) => void;
}): ReactElement => {
  const { next } = usePersonalization();

  return (
    <PanelCard className="flex flex-col gap-3 p-4">
      <div role="tablist" className="flex gap-1">
        {[
          { id: RailTab.Next, label: 'Your next page' },
          { id: RailTab.LeftOut, label: `Left out (${next.leftOut.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => onTabChange(id)}
            className={classNames(
              'h-8 rounded-10 px-3 font-bold typo-footnote',
              tab === id
                ? 'bg-surface-float text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === RailTab.Next ? <NextPageList /> : <LeftOutList />}
    </PanelCard>
  );
};

export const PersonalizationPanel = ({
  section,
  isCompact,
  onBack,
}: {
  section?: ControlSection;
  isCompact?: boolean;
  onBack: () => void;
}): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const [railTab, setRailTab] = useState(
    section === ControlSection.LeftOut ? RailTab.LeftOut : RailTab.Next,
  );
  const hasRail = () => !isCompact && window.matchMedia(railQuery).matches;
  const goTo = (target: ControlSection) => {
    if (target === ControlSection.LeftOut && hasRail()) {
      setRailTab(RailTab.Next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollTo(target);
  };

  useEffect(() => {
    if (section && section !== ControlSection.Overview) {
      if (section === ControlSection.LeftOut && hasRail()) {
        return;
      }
      document.getElementById(sectionId(section))?.scrollIntoView();
    }
    // Only where the panel opened, not on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classNames(
        'flex min-h-screen flex-col bg-background-default',
        isCompact ? 'gap-4 px-4 py-4' : 'gap-6 px-6 py-6 laptop:px-10',
      )}
    >
      <header className="flex flex-col gap-3">
        <Button
          type="button"
          className="-ml-2 self-start"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBack}
        >
          For You
        </Button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-1">
            <h1 className="font-bold text-text-primary typo-title1">
              Personalization
            </h1>
            <p className="text-text-secondary typo-callout">
              Everything that shapes your For You feed, and how much each thing
              counts. Change anything here and your feed follows.
            </p>
          </div>
          <div className="flex min-w-0 shrink flex-wrap items-center gap-x-6 gap-y-3">
            <Switch
              inputId="panel-learning"
              name="panel-learning"
              checked={state.isLearning}
              onToggle={() => store.setLearning(!state.isLearning)}
              compact={false}
            >
              Learn from my reading
            </Switch>
            <AgentSetupButton />
          </div>
        </div>
      </header>
      <nav
        aria-label="Personalization sections"
        className="sticky top-0 z-3 -mx-4 flex gap-1 overflow-x-auto bg-background-default px-4 py-2 no-scrollbar tablet:-mx-6 tablet:px-6 laptop:-mx-10 laptop:px-10"
      >
        {navItems.map((item) => (
          <button
            key={item.section}
            type="button"
            onClick={() => goTo(item.section)}
            className="flex h-8 shrink-0 items-center rounded-10 px-3 font-bold text-text-tertiary typo-footnote hover:bg-surface-float hover:text-text-primary"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div
        className={classNames(
          'grid grid-cols-1 gap-10',
          !isCompact && 'laptop:grid-cols-[minmax(0,1fr)_22rem]',
        )}
      >
        <main className="flex min-w-0 flex-col gap-12">
          <InterestsSection />
          <SourcesSection />
          <RankingSection />
          <PanelSection
            section={ControlSection.LeftOut}
            title="Your next page"
            description="What For You would show if you refreshed now, and what didn't make it."
            className={classNames(!isCompact && 'laptop:hidden')}
          >
            <NextPageList limit={8} />
            <LeftOutList />
          </PanelSection>
          <SettingsSection />
          <ResetSection />
        </main>
        {!isCompact && (
          <aside className="hidden laptop:block">
            <div className="sticky top-16 flex max-h-[calc(100vh-5rem)] flex-col overflow-y-auto">
              <Rail tab={railTab} onTabChange={setRailTab} />
            </div>
          </aside>
        )}
      </div>
      <ChangesDock
        defaultMessage="Changes save as you go. Your feed refreshes when you go back."
        primaryLabel="See my feed"
        onPrimary={onBack}
      />
    </div>
  );
};
