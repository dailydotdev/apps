import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { FeedHeading, MainFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import AlertContext from '../../contexts/AlertContext';
import CreateMyFeedButton from '../CreateMyFeedButton';
import OnboardingContext from '../../contexts/OnboardingContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Dropdown, DropdownProps } from '../fields/Dropdown';
import { ButtonSize } from '../buttons/Button';
import CalendarIcon from '../icons/Calendar';
import SortIcon from '../icons/Sort';
import { IconSize } from '../Icon';
import { RankingAlgorithm } from '../../graphql/feed';
import SettingsContext from '../../contexts/SettingsContext';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';
import { useFeedName } from '../../hooks/feed/useFeedName';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: MainFeedPage;
  navChildren?: ReactNode;
  isSearchOn?: boolean;
  onFeedPageChanged: (value: MainFeedPage) => void;
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
  navChildren,
  isSearchOn,
  onFeedPageChanged,
  algoState: [selectedAlgo, setSelectedAlgo],
  periodState: [selectedPeriod, setSelectedPeriod],
}: SearchControlHeaderProps): ReactElement => {
  const searchVersion = useFeature(feature.search);
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { sidebarRendered } = useSidebarRendered();
  const hasFiltered = feedName === MainFeedPage.MyFeed && !alerts?.filter;
  const hasMyFeedAlert = alerts.myFeed;
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const { openModal } = useLazyModal();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName, isSearchOn });
  const openFeedFilters = () => openModal({ type: LazyModal.FeedFilters });

  /* eslint-disable react/no-children-prop */
  const feedHeading = {
    [MainFeedPage.MyFeed]: (
      <MyFeedHeading
        isAlertDisabled={!hasMyFeedAlert}
        sidebarRendered={sidebarRendered}
        onOpenFeedFilters={openFeedFilters}
        onUpdateAlerts={() => updateAlerts({ myFeed: null })}
      />
    ),
    [MainFeedPage.Popular]: <FeedHeading children="Popular" />,
    [MainFeedPage.Upvoted]: <FeedHeading children="Most upvoted" />,
    [MainFeedPage.Discussed]: <FeedHeading children="Best discussions" />,
  };

  if (searchVersion === SearchExperiment.V1) {
    const dropdownProps: Partial<DropdownProps> = {
      className: { label: 'hidden', chevron: 'hidden', button: '!px-0' },
      dynamicMenuWidth: true,
      shouldIndicateSelected: true,
      buttonSize: ButtonSize.Medium,
      iconOnly: true,
    };
    const actionButtons = [
      feedName === MainFeedPage.MyFeed ? (
        <MyFeedHeading
          key="my-feed"
          isAlertDisabled={!alerts.myFeed}
          sidebarRendered={sidebarRendered}
          onOpenFeedFilters={openFeedFilters}
          onUpdateAlerts={() => updateAlerts({ myFeed: null })}
        />
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
  }

  return (
    <LayoutHeader className="flex-col">
      {alerts?.filter && (
        <CreateMyFeedButton
          action={() =>
            onInitializeOnboarding(() => onFeedPageChanged(MainFeedPage.MyFeed))
          }
        />
      )}
      <div
        className={classNames(
          'flex flex-row flex-wrap gap-4 items-center mr-px w-full',
          alerts.filter || !hasMyFeedAlert ? 'h-14' : 'h-32 laptop:h-16',
          !sidebarRendered && hasMyFeedAlert && 'content-start',
        )}
      >
        {feedHeading[feedName]}
        {navChildren}
        {isUpvoted && (
          <Dropdown
            className={{ container: 'w-44' }}
            buttonSize={ButtonSize.Large}
            icon={<CalendarIcon className="mr-2" />}
            selectedIndex={selectedPeriod}
            options={periodTexts}
            onChange={(_, index) => setSelectedPeriod(index)}
          />
        )}
        {sortingEnabled && isSortableFeed && (
          <Dropdown
            className={{
              container: 'w-12 tablet:w-44',
              indicator: 'flex tablet:hidden',
              chevron: 'hidden tablet:flex',
              label: 'hidden tablet:flex',
              menu: 'w-44',
            }}
            dynamicMenuWidth
            shouldIndicateSelected
            buttonSize={ButtonSize.Large}
            selectedIndex={selectedAlgo}
            options={algorithmsList}
            icon={
              <SortIcon size={IconSize.Small} className="flex tablet:hidden" />
            }
            onChange={(_, index) => setSelectedAlgo(index)}
          />
        )}
      </div>
    </LayoutHeader>
  );
};
