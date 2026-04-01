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
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { useReadingStreak } from '../../hooks/streaks';
import type { AllFeedPages } from '../../lib/query';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import type { AllowedTags, TypographyProps } from '../typography/Typography';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { AchievementTrackerButton } from '../filters/AchievementTrackerButton';
import { ActionType } from '../../graphql/actions';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
  isNullOrUndefined,
} from '../../lib/func';
import { downloadBrowserExtension } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import ConditionalWrapper from '../ConditionalWrapper';
import { LazyImage } from '../LazyImage';
import { Switch } from '../fields/Switch';
import { Tooltip } from '../tooltip/Tooltip';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: AllFeedPages;
  algoState: State<number>;
  noAiState?: {
    isAvailable: boolean;
    isEnabled: boolean;
    onToggle: () => void | Promise<void>;
  };
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
const noAiToggleTooltip =
  'Filters out posts about AI tools, model launches, and AI discourse from My Feed. It is intentionally aggressive, so it may hide some adjacent posts too.';

export const SearchControlHeader = ({
  feedName,
  algoState: [selectedAlgo, setSelectedAlgo],
  noAiState,
}: SearchControlHeaderProps): ReactElement | null => {
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
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const browserName = getCurrentBrowserName();
  const isEdge = browserName === BrowserName.Edge;
  const feedsWithActions = [
    SharedFeedPage.MyFeed,
    SharedFeedPage.Custom,
    SharedFeedPage.CustomForm,
  ];
  const hasFeedActions = feedsWithActions.includes(feedName as SharedFeedPage);

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
  const canInstallExtension =
    !checkIsExtension() && isNullOrUndefined(user?.flags?.lastExtensionUse);
  const shouldShowInstallExtensionPrompt =
    hasFeedActions &&
    isActionsFetched &&
    canInstallExtension &&
    !hasDismissedInstallExtension;
  const installExtensionButton = shouldShowInstallExtensionPrompt && (
    <React.Fragment key="install-extension">
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
    </React.Fragment>
  );

  const handleNoAiToggle = async () => {
    if (!noAiState) {
      return;
    }

    const isEnabled = !noAiState.isEnabled;
    await noAiState.onToggle();
    logEvent({
      event_name: LogEvent.ToggleNoAiFeed,
      target_id: isEnabled ? TargetId.On : TargetId.Off,
      extra: JSON.stringify({
        origin:
          feedName === SharedFeedPage.Custom ? Origin.CustomFeed : Origin.Feed,
      }),
    });
  };

  const primaryActions = [
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
  ];
  const secondaryActions = [
    isLaptop && installExtensionButton,
    noAiState?.isAvailable && (
      <Tooltip
        key="no-ai"
        content={noAiToggleTooltip}
        side="bottom"
        className="max-w-80 text-center"
      >
        <div
          className={`shadow-1 ml-auto flex shrink-0 items-center gap-3 rounded-16 border px-3 py-2 transition-colors ${
            noAiState.isEnabled
              ? 'border-accent-ketchup-default bg-action-downvote-float'
              : 'border-border-subtlest-tertiary bg-surface-float'
          }`}
        >
          <LazyImage
            imgSrc="/assets/no-ai-feed-toggle.png"
            imgAlt="No AI mode"
            className="size-10 shrink-0 rounded-12 border border-border-subtlest-tertiary bg-background-default"
          />
          <div className="min-w-0">
            <Typography
              type={TypographyType.Callout}
              className={
                noAiState.isEnabled ? 'text-accent-ketchup-default' : undefined
              }
            >
              No AI mode
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="hidden max-w-52 laptop:block"
            >
              Hide AI tools, launches, and hot takes.
            </Typography>
          </div>
          <Switch
            checked={noAiState.isEnabled}
            inputId="no-ai-feed-switch"
            name="no-ai-feed-switch"
            aria-label="Toggle No AI mode"
            className="ml-auto shrink-0"
            onToggle={handleNoAiToggle}
          />
        </div>
      </Tooltip>
    ),
  ];
  const actions = primaryActions.filter(Boolean);
  const sideActions = secondaryActions.filter(Boolean);

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
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">{actions}</div>
        {sideActions.length > 0 && (
          <div className="ml-auto flex items-center gap-2">{sideActions}</div>
        )}
      </div>
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
