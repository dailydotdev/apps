import type {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  SetStateAction,
} from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
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
import { Typography } from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { LogEvent, Origin } from '../../lib/log';
import { AchievementTrackerButton } from '../filters/AchievementTrackerButton';
import { IntroQuestButton } from '../filters/IntroQuestButton';
import { LuckyButton } from '../filters/LuckyButton';
import { ActionType } from '../../graphql/actions';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
  isExtensionCapableBrowser,
  isNullOrUndefined,
} from '../../lib/func';
import { downloadBrowserExtension } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import ConditionalWrapper from '../ConditionalWrapper';
import { useNewD1ExperienceFeature } from '../../hooks/useNewD1ExperienceFeature';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

type State<T> = [T, Dispatch<SetStateAction<T>>];

export interface SearchControlHeaderProps {
  feedName: AllFeedPages;
  algoState: State<number>;
  chips?: ReactNode;
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
  chips,
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
  const { isV2 } = useLayoutVariant();
  const isV2Strip = isV2 && isLaptop;
  // Compact ghost styling for any `.btn` inside the v2 page-header strip,
  // applied via descendant selectors so we don't have to thread variant
  // props through every action child (MyFeedHeading, ToggleClickbaitShield,
  // Dropdown, ...). All buttons in the strip become 32px tall, rounded-10,
  // transparent border + bg with a subtle surface-hover wash on hover.
  // Icon-only buttons shrink to a 32px square (overrides the height-only
  // rule for text buttons).
  const v2CompactButtons =
    '[&_.btn]:!h-8 [&_.btn]:!rounded-10 [&_.btn]:!border-transparent ' +
    '[&_.btn]:!bg-transparent hover:[&_.btn]:!bg-surface-hover ' +
    '[&_.btn.iconOnly]:!size-8 [&_.btn.iconOnly]:!p-0';
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
  const hasDismissedInstallExtension = checkHasCompleted(
    ActionType.DismissInstallExtension,
  );
  const canInstallExtension =
    !checkIsExtension() &&
    isExtensionCapableBrowser() &&
    isNullOrUndefined(user?.flags?.lastExtensionUse);
  const shouldEvaluateInstallExtensionPrompt =
    hasFeedActions &&
    isActionsFetched &&
    canInstallExtension &&
    !hasDismissedInstallExtension;
  const { value: isNewD1Experience } = useNewD1ExperienceFeature({
    shouldEvaluate: shouldEvaluateInstallExtensionPrompt,
  });

  if (isMobile) {
    return null;
  }

  const dropdownProps: Partial<DropdownProps> = {
    className: {
      label: 'hidden',
      chevron: 'hidden',
      // V2 ghost styling is applied via descendant selectors on the
      // wrapping strip (see `v2CompactButtons`); the dropdown's own
      // button only needs the legacy tight horizontal padding for the
      // non-v2 layout.
      button: isV2Strip ? undefined : '!px-1',
      container: 'flex',
    },
    shouldIndicateSelected: true,
    buttonSize:
      isMobile || isV2Strip ? ButtonSize.Small : ButtonSize.Medium,
    iconOnly: true,
    buttonVariant:
      isV2Strip || !isLaptop ? ButtonVariant.Tertiary : ButtonVariant.Float,
  };

  const shouldShowInstallExtensionPrompt =
    shouldEvaluateInstallExtensionPrompt && !isNewD1Experience;
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

  const dropdownIconSize = isV2Strip ? IconSize.XSmall : IconSize.Medium;
  const primaryActions = [
    hasFeedActions && <MyFeedHeading key="my-feed" />,
    isUpvoted ? (
      <Dropdown
        {...dropdownProps}
        key="algorithm"
        icon={<CalendarIcon size={dropdownIconSize} />}
        selectedIndex={selectedPeriod}
        options={periodTexts}
        onChange={(_, index) => setSelectedPeriod(index)}
      />
    ) : null,
    sortingEnabled && isSortableFeed && (
      <Dropdown
        {...dropdownProps}
        key="sorting"
        icon={<SortIcon size={dropdownIconSize} />}
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
    hasFeedActions && <IntroQuestButton key="intro-quests" />,
    hasFeedActions && <AchievementTrackerButton key="achievement-tracker" />,
    hasFeedActions && <LuckyButton key="lucky" />,
  ];
  const secondaryActions = [isLaptop && installExtensionButton];
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

            {isStreaksEnabled && streak && (
              <div className="flex-0">
                <ReadingStreakButton streak={streak} isLoading={isLoading} />
              </div>
            )}
          </div>
        );
      }}
    >
      <header
        className={
          isV2Strip
            ? classNames(
                // Same shape as the shared `pageHeaderClassName` but with
                // a tighter horizontal inset (px-3 = 12px) so the strip
                // controls don't sit too far from the floating-card edge.
                'flex min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-3 py-3',
                v2CompactButtons,
              )
            : 'flex w-full items-center gap-2'
        }
      >
        {!!chips && <div className="min-w-0 flex-1">{chips}</div>}
        <div
          className={
            isV2Strip
              ? 'flex shrink-0 items-center gap-1'
              : 'flex shrink-0 items-center gap-2'
          }
        >
          {actions}
        </div>
        {sideActions.length > 0 && (
          <div
            className={
              isV2Strip
                ? 'ml-auto flex items-center gap-1'
                : 'ml-auto flex items-center gap-2'
            }
          >
            {sideActions}
          </div>
        )}
      </header>
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
