import type { ComponentType } from 'react';
import { LearningSection } from '../panel/LearningSection';
import { FillingSection } from '../panel/FillingSection';
import { InterestsSection } from '../panel/InterestsSection';
import { SourcesSection } from '../panel/SourcesSection';
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
}

/**
 * Every control that changes how For You ranks. Feed settings and Tune both
 * render from this list, so a control added to one of these sections, or a
 * new entry here, shows up in both.
 */
export const rankingControls: RankingControl[] = [
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
