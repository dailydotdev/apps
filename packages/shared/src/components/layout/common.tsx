import type {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  ReactNode,
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
import { Typography } from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { LogEvent, Origin } from '../../lib/log';
import { AchievementTrackerButton } from '../filters/AchievementTrackerButton';
import { IntroQuestButton } from '../filters/IntroQuestButton';
import { LuckyButton } from '../filters/LuckyButton';
import { BriefShortcutButton } from '../cards/brief/BriefShortcutButton';
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
import { useHasIntroQuests } from '../../hooks/useHasIntroQuests';
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
  const isTablet = useViewSize(ViewSize.Tablet);
  const { isV2 } = useLayoutVariant();
  const isV2Strip = isV2;
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
  const hasIntroQuests = useHasIntroQuests({
    shouldEvaluate: shouldEvaluateInstallExtensionPrompt,
  });

  if (isMobile) {
    return null;
  }

  // v2 compact ghost styles for the page-header action strip: 32px
  // square icon buttons + 32px-tall text buttons, no border/bg, with
  // a surface-hover affordance on hover.
  const compactIconButtonClassName =
    '!size-8 !rounded-10 !border-transparent !bg-transparent !p-0 hover:!bg-surface-hover';
  const compactTextButtonClassName =
    '!h-8 !rounded-10 !border-transparent !bg-transparent !px-3 hover:!bg-surface-hover';

  const dropdownProps: Partial<DropdownProps> = {
    className: {
      label: 'hidden',
      chevron: 'hidden',
      button: isV2Strip ? compactIconButtonClassName : '!px-1',
      container: 'flex',
    },
    shouldIndicateSelected: true,
    buttonSize: isMobile || isV2Strip ? ButtonSize.Small : ButtonSize.Medium,
    iconOnly: true,
    buttonVariant:
      isV2Strip || !isLaptop ? ButtonVariant.Tertiary : ButtonVariant.Float,
  };

  const shouldShowInstallExtensionPrompt =
    shouldEvaluateInstallExtensionPrompt && !hasIntroQuests;
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
  const hasV2Chips = isV2Strip && !!chips;
  const shouldUseCompactV2Actions = isV2Strip && (!!chips || !isTablet);
  const primaryActions = [
    hasFeedActions && (
      <MyFeedHeading
        key="my-feed"
        iconOnly={shouldUseCompactV2Actions}
        feedSettingsButtonProps={
          isV2Strip
            ? {
                size: ButtonSize.Small,
                variant: ButtonVariant.Tertiary,
                className: shouldUseCompactV2Actions
                  ? compactIconButtonClassName
                  : compactTextButtonClassName,
                iconSize: IconSize.XSmall,
              }
            : undefined
        }
      />
    ),
    hasFeedActions && isV2Strip && (
      <BriefShortcutButton
        key="brief-shortcut"
        iconOnly={shouldUseCompactV2Actions}
        className={
          shouldUseCompactV2Actions
            ? compactIconButtonClassName
            : compactTextButtonClassName
        }
      />
    ),
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
        buttonProps={
          isV2Strip
            ? {
                size: ButtonSize.Small,
                variant: ButtonVariant.Tertiary,
                // free-trial variant renders icon + "5/5" text, so it must
                // keep text-button sizing (auto width). Squashing it into the
                // 32px icon square clips the hover target off the text.
                className: compactTextButtonClassName,
              }
            : undefined
        }
        iconButtonProps={
          isV2Strip
            ? {
                size: ButtonSize.Small,
                variant: ButtonVariant.Tertiary,
                className: compactIconButtonClassName,
              }
            : undefined
        }
        iconSize={isV2Strip ? IconSize.XSmall : undefined}
        key="toggle-clickbait-shield"
      />
    ),
    hasFeedActions && !isV2Strip && <IntroQuestButton key="intro-quests" />,
    hasFeedActions && !isV2Strip && (
      <AchievementTrackerButton key="achievement-tracker-inline" />
    ),
    hasFeedActions && !isV2Strip && <LuckyButton key="lucky" />,
  ];
  // v2: AchievementTrackerButton is right-aligned so the current
  // achievement / track CTA stays balanced against the primary
  // controls. Non-v2 keeps it inline above.
  const rightActions = [
    hasFeedActions && isV2Strip && (
      <AchievementTrackerButton key="achievement-tracker" />
    ),
  ];
  const secondaryActions = [isLaptop && installExtensionButton];
  const actions = primaryActions.filter(Boolean);
  const trailingActions = [
    ...rightActions.filter(Boolean),
    ...secondaryActions.filter(Boolean),
  ];

  // In v2 the FeedContainer wraps these actions inside its own
  // page-header strip. Layout:
  //   - With chips: chips fill the left (flex-1, scrollable), all
  //     actions sit on the right as icon-only buttons.
  //   - Without chips: primary cluster on the left, trailing cluster
  //     (achievement tracker + install-extension) docked right.
  if (isV2Strip) {
    if (hasV2Chips) {
      return (
        <div className="flex w-full items-center gap-2">
          <div className="min-w-0 flex-1">{chips}</div>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            {trailingActions}
          </div>
        </div>
      );
    }
    return (
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 items-center gap-1">{actions}</div>
        {trailingActions.length > 0 && (
          <div className="ml-auto flex items-center gap-1">
            {trailingActions}
          </div>
        )}
      </div>
    );
  }
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
      <header className="flex w-full items-center gap-2">
        {!!chips && <div className="min-w-0 flex-1">{chips}</div>}
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
        {sideActions.length > 0 && (
          <div className="ml-auto flex items-center gap-2">{sideActions}</div>
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
