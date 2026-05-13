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
import { Typography } from '../typography/Typography';
import { ToggleClickbaitShield } from '../buttons/ToggleClickbaitShield';
import { LogEvent, Origin } from '../../lib/log';
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

  const compactIconButtonClassName =
    '!size-8 !rounded-10 !border-transparent !bg-transparent !p-0 hover:!bg-surface-hover';
  const compactTextButtonClassName =
    '!h-8 !rounded-10 !border-transparent !bg-transparent !px-3 hover:!bg-surface-hover';

  const dropdownProps: Partial<DropdownProps> = {
    className: {
      label: 'hidden',
      chevron: 'hidden',
      button: compactIconButtonClassName,
      container: 'flex',
    },
    shouldIndicateSelected: true,
    buttonSize: ButtonSize.Small,
    iconOnly: true,
    buttonVariant: ButtonVariant.Tertiary,
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
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={
          isEdge ? (
            <EdgeIcon size={IconSize.XSmall} aria-hidden />
          ) : (
            <ChromeIcon size={IconSize.XSmall} aria-hidden />
          )
        }
        rel={anchorDefaultRel}
        target="_blank"
        className={isLaptop ? compactTextButtonClassName : undefined}
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
        icon={<ClearIcon size={IconSize.XSmall} secondary />}
        aria-label="Dismiss install prompt"
        className={isLaptop ? compactIconButtonClassName : undefined}
        onClick={() => completeAction(ActionType.DismissInstallExtension)}
      />
    </React.Fragment>
  );

  const primaryActions = [
    hasFeedActions && (
      <MyFeedHeading
        key="my-feed"
        feedSettingsButtonProps={
          isLaptop
            ? {
                size: ButtonSize.Small,
                variant: ButtonVariant.Tertiary,
                className: compactTextButtonClassName,
                iconSize: IconSize.XSmall,
              }
            : undefined
        }
      />
    ),
    isUpvoted ? (
      <Dropdown
        {...dropdownProps}
        key="algorithm"
        icon={<CalendarIcon size={IconSize.XSmall} />}
        selectedIndex={selectedPeriod}
        options={periodTexts}
        onChange={(_, index) => setSelectedPeriod(index)}
      />
    ) : null,
    sortingEnabled && isSortableFeed && (
      <Dropdown
        {...dropdownProps}
        key="sorting"
        icon={<SortIcon size={IconSize.XSmall} />}
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
          isLaptop
            ? {
                size: ButtonSize.Small,
                variant: ButtonVariant.Tertiary,
                // Non-Plus path renders "X/Y" text alongside the icon, so it
                // needs the same h-8 + px-3 transparent treatment as the Feed
                // settings button — width grows with content.
                className: compactTextButtonClassName,
              }
            : undefined
        }
        iconButtonProps={
          isLaptop
            ? {
                // Plus path is icon-only — match the square 32px sizing used
                // by the Sort / Period dropdown icons in this header.
                className: compactIconButtonClassName,
              }
            : undefined
        }
        iconSize={IconSize.XSmall}
        key="toggle-clickbait-shield"
      />
    ),
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
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 items-center gap-1">{actions}</div>
        {sideActions.length > 0 && (
          <div className="ml-auto flex items-center gap-1">{sideActions}</div>
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
