import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
} from 'react';
import classed from '../../lib/classed';
import { SharedFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Dropdown, DropdownProps } from '../fields/Dropdown';
import { ButtonSize } from '../buttons/common';
import { CalendarIcon, SortIcon } from '../icons';
import { IconSize } from '../Icon';
import { RankingAlgorithm } from '../../graphql/feed';
import SettingsContext from '../../contexts/SettingsContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useFeedLayout } from '../../hooks';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: SharedFeedPage;
  algoState: State<number>;
  periodState: State<number>;
}

export const LayoutHeader = classed(
  'header',
  'flex justify-between items-center overflow-x-auto relative mb-6 min-h-14 w-full no-scrollbar',
);

export const algorithms = [
  { value: RankingAlgorithm.Popularity, text: 'Recommended' },
  { value: RankingAlgorithm.Time, text: 'By date' },
];
const algorithmsList = algorithms.map((algo) => algo.text);
export const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

export const SearchControlHeader = ({
  feedName,
  algoState: [selectedAlgo, setSelectedAlgo],
  periodState: [selectedPeriod, setSelectedPeriod],
}: SearchControlHeaderProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName });
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const openFeedFilters = () =>
    openModal({ type: LazyModal.FeedFilters, persistOnRouteChange: true });

  const dropdownProps: Partial<DropdownProps> = {
    className: { label: 'hidden', chevron: 'hidden', button: '!px-1' },
    dynamicMenuWidth: true,
    shouldIndicateSelected: true,
    buttonSize: shouldUseMobileFeedLayout
      ? ButtonSize.Small
      : ButtonSize.Medium,
    iconOnly: true,
  };
  const actionButtons = [
    feedName === SharedFeedPage.MyFeed ? (
      <MyFeedHeading key="my-feed" onOpenFeedFilters={openFeedFilters} />
    ) : null,
    isUpvoted ? (
      <Dropdown
        {...dropdownProps}
        key="algorithm"
        icon={<CalendarIcon size={IconSize.Medium} />}
        selectedIndex={selectedPeriod}
        options={periodTexts}
        onChange={(_, index) => setSelectedPeriod(index)}
      />
    ) : null,
    sortingEnabled && isSortableFeed ? (
      <Dropdown
        {...dropdownProps}
        key="sorting"
        icon={<SortIcon size={IconSize.Medium} />}
        selectedIndex={selectedAlgo}
        options={algorithmsList}
        onChange={(_, index) => setSelectedAlgo(index)}
      />
    ) : null,
  ];
  const actions = actionButtons.filter((button) => !!button);

  return actions?.length ? <>{actions}</> : null;
};
