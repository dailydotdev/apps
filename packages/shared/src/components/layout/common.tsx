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
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { CalendarIcon, SortIcon } from '../icons';
import { IconSize } from '../Icon';
import { RankingAlgorithm } from '../../graphql/feed';
import SettingsContext from '../../contexts/SettingsContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { AllFeedPages } from '../../lib/query';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: AllFeedPages;
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
export const algorithmsList = algorithms.map((algo) => algo.text);
export const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

export const DEFAULT_ALGORITHM_KEY = 'feed:algorithm';
export const DEFAULT_ALGORITHM_INDEX = 0;

export const SearchControlHeader = ({
  feedName,
  algoState: [selectedAlgo, setSelectedAlgo],
  periodState: [selectedPeriod, setSelectedPeriod],
}: SearchControlHeaderProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName });
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const { streak, isLoading } = useReadingStreak();

  if (isMobile) {
    return null;
  }

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
    buttonVariant: isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary,
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
        drawerProps={{ displayCloseButton: true }}
      />
    ) : null,
  ];
  const actions = actionButtons.filter((button) => !!button);

  return (
    <ConditionalWrapper
      condition={!isLaptop}
      wrapper={(children) => (
        <div className="flex w-full items-center justify-between tablet:mb-2 tablet:p-4">
          <div className="flex-0">
            <ReadingStreakButton streak={streak} isLoading={isLoading} />
          </div>

          <div className="flex items-center gap-2">{children}</div>
        </div>
      )}
    >
      {actions}
    </ConditionalWrapper>
  );
};
