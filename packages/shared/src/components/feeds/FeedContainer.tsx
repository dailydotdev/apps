import React, {
  CSSProperties,
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import FeedContext from '../../contexts/FeedContext';
import ScrollToTopButton from '../ScrollToTopButton';
import styles from '../Feed.module.css';
import { SearchBarInput, SearchBarSuggestionList } from '../search';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';
import { webappUrl } from '../../lib/constants';
import { useSearchSuggestions } from '../../hooks/search';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import { ActionType } from '../../graphql/actions';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { FeedReadyMessage } from '../onboarding';
import {
  useFeedLayout,
  useActions,
  ToastSubject,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../hooks';
import ConditionalWrapper from '../ConditionalWrapper';
import { SharedFeedPage } from '../utilities';
import { useActiveFeedNameContext } from '../../contexts';

export interface FeedContainerProps {
  children: ReactNode;
  forceCardMode?: boolean;
  header?: ReactNode;
  className?: string;
  inlineHeader?: boolean;
  showSearch?: boolean;
  shortcuts?: ReactNode;
  actionButtons?: ReactNode;
}

const listGaps = {
  cozy: 'gap-5',
  roomy: 'gap-3',
};

const gridGaps = {
  cozy: 'gap-14',
  roomy: 'gap-12',
};

const cardListClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
};

const getFeedGapPx = {
  'gap-2': 8,
  'gap-3': 12,
  'gap-5': 20,
  'gap-8': 32,
  'gap-12': 48,
  'gap-14': 56,
};

const gapClass = (isList: boolean, space: Spaciness) =>
  isList ? listGaps[space] ?? 'gap-2' : gridGaps[space] ?? 'gap-8';

const cardClass = (isList: boolean, numberOfCards: number): string =>
  isList ? 'grid-cols-1' : cardListClass[numberOfCards];

const getStyle = (isList: boolean, space: Spaciness): CSSProperties => {
  if (isList && space !== 'eco') {
    return space === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

const feedNameToHeading: Record<SharedFeedPage, string> = {
  search: 'Search',
  'my-feed': 'For you',
  popular: 'Popular',
  upvoted: 'Most upvoted',
  discussed: 'Best discussions',
};

export const FeedContainer = ({
  children,
  forceCardMode,
  header,
  className,
  inlineHeader = false,
  showSearch,
  shortcuts,
  actionButtons,
}: FeedContainerProps): ReactElement => {
  const currentSettings = useContext(FeedContext);
  const { subject } = useToastNotification();
  const {
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const { trackEvent } = useAnalyticsContext();
  const { completeAction, checkHasCompleted } = useActions();
  const { shouldUseFeedLayoutV1 } = useFeedLayout();
  const { feedName } = useActiveFeedNameContext();
  const router = useRouter();
  const searchValue = useFeature(feature.search);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const insaneMode = !forceCardMode && listMode;
  const isList = (insaneMode && numCards > 1) || shouldUseFeedLayoutV1;
  const feedGapPx = getFeedGapPx[gapClass(isList, spaciness)];
  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;
  const cardContainerStyle = { ...getStyle(isList, spaciness) };
  const isFinder = router.pathname === '/posts/finder';
  const isV1Search =
    searchValue === SearchExperiment.V1 && showSearch && !isFinder;

  const suggestionsProps = useSearchSuggestions({
    origin: Origin.HomePage,
    disabled: !isV1Search,
  });
  const isTracked = useRef(false);
  const shouldShowPulse =
    checkHasCompleted(ActionType.AcceptedSearch) &&
    !checkHasCompleted(ActionType.UsedSearch);

  useEffect(() => {
    if (!shouldShowPulse || isTracked.current) {
      return;
    }

    isTracked.current = true;
    trackEvent({ event_name: AnalyticsEvent.SearchHighlightAnimation });
  }, [trackEvent, shouldShowPulse]);

  const isMobile = useViewSize(ViewSize.MobileL);

  if (!loadedSettings) {
    return <></>;
  }

  const onSearch = (event: FormEvent, input: string) => {
    event.preventDefault();
    router.push(`${webappUrl}search?q=${encodeURIComponent(input)}`);
  };
  const handleSearchFocus = () => {
    if (!shouldShowPulse) {
      return;
    }

    completeAction(ActionType.UsedSearch);
  };

  return (
    <div
      className={classNames(
        'relative flex w-full flex-col laptopL:mx-auto',
        styles.container,
        className,
      )}
    >
      {isV1Search && shouldUseFeedLayoutV1 && (
        <span
          className="absolute left-1/2 top-0 -mt-4 h-24 w-3/5 -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(ellipse farthest-side, #4E2BD7, #AC1CE4)',
            filter: 'blur(3rem)',
          }}
        />
      )}
      <ScrollToTopButton />
      <div className="flex w-full flex-col laptopL:mx-auto" style={style}>
        {!inlineHeader && header}
        <div
          className={classNames(
            'relative mx-auto w-full',
            styles.feed,
            !isList && styles.cards,
          )}
          style={cardContainerStyle}
          aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
          data-testid="posts-feed"
        >
          {router.query?.welcome === 'true' && (
            <FeedReadyMessage className="mb-10" />
          )}
          {inlineHeader && header}
          {isV1Search && (
            <ConditionalWrapper
              condition={!shouldUseFeedLayoutV1}
              wrapper={(child) => (
                <span className="mt-6 flex flex-row gap-3">
                  {child}
                  {shortcuts}
                </span>
              )}
            >
              <SearchBarInput
                className={{
                  container: classNames(
                    'flex w-full max-w-2xl flex-1',
                    shouldUseFeedLayoutV1 && 'mt-6 px-6 laptop:px-0',
                    shouldShowPulse && 'highlight-pulse',
                  ),
                  field: classNames(
                    'w-full',
                    shouldUseFeedLayoutV1 && '!bg-transparent',
                  ),
                  form: 'w-full',
                }}
                showProgress={false}
                onSubmit={onSearch}
                shouldShowPopup
                inputProps={{ onFocus: handleSearchFocus }}
                suggestionsProps={suggestionsProps}
              />
            </ConditionalWrapper>
          )}
          {isV1Search && !isMobile && (
            <span className="mt-4 flex flex-1 flex-row">
              <SearchBarSuggestionList
                {...suggestionsProps}
                className={classNames(
                  'hidden tablet:flex',
                  shouldUseFeedLayoutV1 ? 'mx-6 laptop:mx-0' : 'mr-3',
                )}
              />
              {actionButtons && !shouldUseFeedLayoutV1 && (
                <span className="ml-auto flex flex-row gap-3 border-l border-theme-divider-tertiary pl-3">
                  {actionButtons}
                </span>
              )}
            </span>
          )}
          {shouldUseFeedLayoutV1 && shortcuts}
          <ConditionalWrapper
            condition={shouldUseFeedLayoutV1}
            wrapper={(child) => (
              <div
                className={classNames(
                  'flex flex-col rounded-16 border border-theme-divider-tertiary laptop:mx-0 laptop:mt-6',
                  isV1Search && 'mt-6',
                )}
              >
                <span className="flex w-full flex-row items-center justify-between px-6 py-4">
                  <strong className="typo-title3">
                    {feedNameToHeading[feedName] ?? ''}
                  </strong>
                  <span className="flex flex-row gap-3">{actionButtons}</span>
                </span>
                {child}
              </div>
            )}
          >
            <div
              className={classNames(
                'grid',
                isV1Search && !shouldUseFeedLayoutV1 && 'mt-8',
                gapClass(isList, spaciness),
                cardClass(isList, numCards),
              )}
            >
              {children}
            </div>
          </ConditionalWrapper>
        </div>
      </div>
    </div>
  );
};
