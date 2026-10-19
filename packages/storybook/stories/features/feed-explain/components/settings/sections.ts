import type { ComponentType } from 'react';
import { useMemo } from 'react';
import type { PersonalizationState } from '../../policy/rank';
import { hasTimedChanges, TimedSection } from '../panel/TimedSection';
import { LearningSection } from '../panel/LearningSection';
import { FillingSection } from '../panel/FillingSection';
import { InterestsSection } from '../panel/InterestsSection';
import { SourcesSection } from '../panel/SourcesSection';
import { CategoriesSection } from '../panel/CategoriesSection';
import { RankingSection } from '../panel/RankingSection';
import { ControlSection } from '../FeedScreenContext';
import { FeedSettingsPage } from './pages';

export interface RankingControl {
  section: ControlSection;
  /** The Feed settings page that holds it. */
  page: FeedSettingsPage;
  /** The Tune tab that holds it. */
  tab: string;
  Controls: ComponentType;
  /**
   * The existing settings section that already shows this control on its
   * page, through the same data, so the page doesn't render `Controls` too.
   */
  existingSettingsSection?: string;
  /** Left out, with its divider, while it has nothing to show. */
  isShown?: (state: PersonalizationState) => boolean;
}

/**
 * Every control that changes how For You ranks. Feed settings and Tune both
 * render from this list, so a control added to one of these sections, or a
 * new entry here, shows up in both.
 */
export const rankingControls: RankingControl[] = [
  {
    section: ControlSection.Timed,
    page: FeedSettingsPage.Overview,
    tab: 'Topics',
    Controls: TimedSection,
    isShown: hasTimedChanges,
  },
  {
    section: ControlSection.Learning,
    page: FeedSettingsPage.Overview,
    tab: 'Topics',
    Controls: LearningSection,
  },
  {
    section: ControlSection.Interests,
    page: FeedSettingsPage.Topics,
    tab: 'Topics',
    Controls: InterestsSection,
  },
  {
    section: ControlSection.Sources,
    page: FeedSettingsPage.Sources,
    tab: 'Sources',
    Controls: SourcesSection,
  },
  {
    section: ControlSection.Categories,
    page: FeedSettingsPage.Filters,
    tab: 'Categories',
    Controls: CategoriesSection,
    existingSettingsSection: 'Content preferences',
  },
  {
    section: ControlSection.Filling,
    page: FeedSettingsPage.Overview,
    tab: 'Ranking',
    Controls: FillingSection,
  },
  {
    section: ControlSection.Ranking,
    page: FeedSettingsPage.Ranking,
    tab: 'Ranking',
    Controls: RankingSection,
  },
];

export const tuneTabs = [...new Set(rankingControls.map(({ tab }) => tab))];

/**
 * The entries that show, decided when their page or tab opens, so one that
 * starts to qualify mid-session doesn't appear and push the rest down.
 */
export const useShownControls = (
  controls: RankingControl[],
  state: PersonalizationState,
  openKey: string,
): RankingControl[] => {
  const shown = useMemo(
    () =>
      new Set(
        controls
          .filter((control) => control.isShown?.(state) ?? true)
          .map(({ section }) => section),
      ),
    // Only when the page or tab opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openKey],
  );
  return controls.filter(({ section }) => shown.has(section));
};
