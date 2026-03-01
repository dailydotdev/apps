import type {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
} from 'react';
import React, { useContext } from 'react';
import classed from '../../lib/classed';
import { SharedFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import type { DropdownProps } from '../fields/Dropdown';
import { Dropdown } from '../fields/Dropdown';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import {
  CalendarIcon,
  ChromeIcon,
  ClearIcon,
  EdgeIcon,
  SortIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { RankingAlgorithm } from '../../graphql/feed';
import SettingsContext from '../../contexts/SettingsContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useFeedName } from '../../hooks/feed/useFeedName';
import {
  useActions,
  useConditionalFeature,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import type { AllFeedPages } from '../../lib/query';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import type { AllowedTags, TypographyProps } from '../typography/Typography';
import { Typography } from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { LogEvent, Origin } from '../../lib/log';
import { AchievementTrackerButton } from '../filters/AchievementTrackerButton';
import { AgentsLeaderboardEntrypointButton } from '../filters/AgentsLeaderboardEntrypointButton';
import { ActionType } from '../../graphql/actions';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
} from '../../lib/func';
import {
  agentsLeaderboardEntrypointFeature,
  installExtensionFeedMenuFeature,
} from '../../lib/featureManagement';
import type { AgentsLeaderboardEntrypointFeature } from '../../lib/featureManagement';
import { downloadBrowserExtension } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import ConditionalWrapper from '../ConditionalWrapper';

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
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isUpvoted, isSortableFeed } = useFeedName({ feedName });
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const { checkHasCompleted, completeAction } = useActions();
  const browserName = getCurrentBrowserName();
  const isEdge = browserName === BrowserName.Edge;
  const shouldEvaluateInstallExtensionExperiment =
    !checkIsExtension() && user?.flags?.lastExtensionUse === null;
  const { value: isInstallExtensionFeedMenuEnabled } = useConditionalFeature({
    feature: installExtensionFeedMenuFeature,
    shouldEvaluate: shouldEvaluateInstallExtensionExperiment,
  });
  const feedsWithActions = [
    SharedFeedPage.MyFeed,
    SharedFeedPage.Custom,
    SharedFeedPage.CustomForm,
  ];
  const hasFeedActions = feedsWithActions.includes(feedName as SharedFeedPage);
  const { value: leaderboardEntrypointConfig } =
    useConditionalFeature<AgentsLeaderboardEntrypointFeature>({
      feature: agentsLeaderboardEntrypointFeature,
      shouldEvaluate: hasFeedActions,
    });

  if (isMobile) {
    return null;
  }

  const dropdownProps: Partial<DropdownProps> = {
    className: {
      label: 'hidden',
      chevron: 'hidden',
      button: '!px-1',
      container: 'flex',
    },
    shouldIndicateSelected: true,
    buttonSize: isMobile ? ButtonSize.Small : ButtonSize.Medium,
    iconOnly: true,
    buttonVariant: isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary,
  };

  const hasDismissedInstallExtension = checkHasCompleted(
    ActionType.DismissInstallExtension,
  );
  const installExtensionButton = hasFeedActions &&
    isInstallExtensionFeedMenuEnabled &&
    !hasDismissedInstallExtension && (
      <>
        <div className="flex flex-1" />
        <Button
          key="install-extension"
          tag="a"
          href={downloadBrowserExtension}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          rel={anchorDefaultRel}
          target="_blank"
          className="ml-auto"
          onClick={() =>
            logEvent({
              event_name: LogEvent.DownloadExtension,
              origin: Origin.Feed,
            })
          }
        >
          Get it for {isEdge ? 'Edge' : 'Chrome'}
        </Button>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ClearIcon secondary />}
          onClick={() => completeAction(ActionType.DismissInstallExtension)}
        />
      </>
    );

  const actionButtons = [
    hasFeedActions && <MyFeedHeading key="my-feed" />,
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
    sortingEnabled && isSortableFeed && (
      <Dropdown
        {...dropdownProps}
        key="sorting"
        icon={<SortIcon size={IconSize.Medium} />}
        selectedIndex={selectedAlgo}
        options={algorithmsList}
        onChange={(_, index) => setSelectedAlgo(index)}
        drawerProps={{ displayCloseButton: true }}
      />
    ),
    hasFeedActions && (
      <ToggleClickbaitShield
        origin={
          feedName === SharedFeedPage.Custom ? Origin.CustomFeed : Origin.Feed
        }
        key="toggle-clickbait-shield"
      />
    ),
    hasFeedActions && <AchievementTrackerButton key="achievement-tracker" />,
    hasFeedActions && leaderboardEntrypointConfig?.groupId && (
      <AgentsLeaderboardEntrypointButton
        key="agents-arena-entrypoint"
        groupId={leaderboardEntrypointConfig.groupId}
        showLabel={!!leaderboardEntrypointConfig.showLabel}
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
      />
    ),
    isLaptop && installExtensionButton,
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

            {isStreaksEnabled && (
              <div className="flex-0">
                <ReadingStreakButton streak={streak} isLoading={isLoading} />
              </div>
            )}
          </div>
        );
      }}
    >
      <div className="flex w-full items-center gap-2">{actions}</div>
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
