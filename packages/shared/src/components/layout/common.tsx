import React, {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import classed from '../../lib/classed';
import { SharedFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import { Dropdown, DropdownProps } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { CalendarIcon, SortIcon } from '../icons';
import { IconSize } from '../Icon';
import { RankingAlgorithm } from '../../graphql/feed';
import SettingsContext from '../../contexts/SettingsContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { usePlusSubscription, useViewSize, ViewSize } from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import { AllFeedPages } from '../../lib/query';
import { webappUrl } from '../../lib/constants';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import {
  AllowedTags,
  Typography,
  TypographyProps,
} from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: AllFeedPages;
  algoState: State<number>;
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
export const periodTexts = periods.map((period) => period.text);

export const DEFAULT_ALGORITHM_KEY = 'feed:algorithm';
export const DEFAULT_ALGORITHM_INDEX = 0;

export const SearchControlHeader = ({
  feedName,
  algoState: [selectedAlgo, setSelectedAlgo],
}: SearchControlHeaderProps): ReactElement => {
  const [selectedPeriod, setSelectedPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });
  const router = useRouter();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const { showPlusSubscription } = usePlusSubscription();
  const { user } = useAuthContext();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();

  if (isMobile) {
    return null;
  }

  const dropdownProps: Partial<DropdownProps> = {
    className: { label: 'hidden', chevron: 'hidden', button: '!px-1' },
    dynamicMenuWidth: true,
    shouldIndicateSelected: true,
    buttonSize: isMobile ? ButtonSize.Small : ButtonSize.Medium,
    iconOnly: true,
    buttonVariant: isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary,
  };

  const feedsWithActions = [SharedFeedPage.MyFeed, SharedFeedPage.Custom];

  const actionButtons = [
    feedsWithActions.includes(feedName as SharedFeedPage) ? (
      <MyFeedHeading
        key="my-feed"
        onOpenFeedFilters={() => {
          if (isCustomDefaultFeed && router.pathname === '/') {
            router.push(`${webappUrl}feeds/${defaultFeedId}/edit`);
          } else {
            router.push(
              `${webappUrl}feeds/${
                feedName === SharedFeedPage.Custom
                  ? router.query.slugOrId
                  : user.id
              }/edit`,
            );
          }
        }}
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
        drawerProps={{ displayCloseButton: true }}
      />
    ) : null,
    showPlusSubscription &&
    feedsWithActions.includes(feedName as SharedFeedPage) ? (
      <ToggleClickbaitShield
        origin={
          feedName === SharedFeedPage.Custom ? Origin.CustomFeed : Origin.Feed
        }
        key="toggle-clickbait-shield"
      />
    ) : null,
  ];
  const actions = actionButtons.filter((button) => !!button);

  return (
    <ConditionalWrapper
      condition={!isLaptop}
      wrapper={(children) => {
        const wrapperChildren = (
          <div className="flex items-center gap-2">{children}</div>
        );

        return (
          <div className="flex w-full items-center justify-between tablet:mb-2 tablet:p-2">
            {wrapperChildren}

            <div className="flex-0">
              {isStreaksEnabled && (
                <ReadingStreakButton streak={streak} isLoading={isLoading} />
              )}
            </div>
          </div>
        );
      }}
    >
      {actions}
    </ConditionalWrapper>
  );
};

export const PageHeader = classed(
  'div',
  'flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 gap-1',
);

export const PageHeaderTitle = ({
  children,
  ...props
}: PropsWithChildren<TypographyProps<AllowedTags>>): ReactElement => (
  <Typography {...props}>{children}</Typography>
);
