import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import FeedContext from '../../contexts/FeedContext';
import styles from '../Feed.module.css';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';
import { FeedReadyMessage } from '../onboarding';
import { useFeedLayout, ToastSubject, useToastNotification } from '../../hooks';
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

export const getFeedGapPx = {
  'gap-2': 8,
  'gap-3': 12,
  'gap-5': 20,
  'gap-8': 32,
  'gap-12': 48,
  'gap-14': 56,
};

export const gapClass = (
  isList: boolean,
  isFeedLayoutV1: boolean,
  space: Spaciness,
): string => {
  if (isFeedLayoutV1) {
    return '';
  }
  return isList ? listGaps[space] ?? 'gap-2' : gridGaps[space] ?? 'gap-8';
};

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
  const { shouldUseFeedLayoutV1 } = useFeedLayout();
  const { feedName } = useActiveFeedNameContext();
  const router = useRouter();
  const searchValue = useFeature(feature.search);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const insaneMode = !forceCardMode && listMode;
  const isList = (insaneMode && numCards > 1) || shouldUseFeedLayoutV1;
  const feedGapPx =
    getFeedGapPx[gapClass(isList, shouldUseFeedLayoutV1, spaciness)];
  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;
  const cardContainerStyle = { ...getStyle(isList, spaciness) };
  const isFinder = router.pathname === '/search/posts';
  const isV1Search =
    searchValue === SearchExperiment.V1 && showSearch && !isFinder;

  if (!loadedSettings) {
    return <></>;
  }

  const showFeedReadyMessage = router.query?.welcome === 'true';

  return (
    <div
      className={classNames(
        'relative flex w-full flex-col laptopL:mx-auto',
        styles.container,
        className,
      )}
    >
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
          {showFeedReadyMessage && (
            <FeedReadyMessage
              className={{
                main: shouldUseFeedLayoutV1
                  ? 'mb-8 mt-8 w-full laptop:gap-4 [@media(width<=680px)]:px-6'
                  : 'mb-10 max-w-xl laptop:gap-6',
                textContainer: shouldUseFeedLayoutV1
                  ? 'laptop:flex-1'
                  : 'flex flex-col',
                header: shouldUseFeedLayoutV1 ? 'mb-0.5' : 'mb-2 laptop:mb-1',
              }}
            />
          )}
          {inlineHeader && header}
          {isV1Search && !shouldUseFeedLayoutV1 && (
            <span className="flex flex-1 flex-row items-center">
              {!!actionButtons && (
                <span className="mr-auto flex flex-row gap-3 border-theme-divider-tertiary pr-3">
                  {actionButtons}
                </span>
              )}
              {shortcuts}
            </span>
          )}
          {shouldUseFeedLayoutV1 && shortcuts}
          <ConditionalWrapper
            condition={shouldUseFeedLayoutV1}
            wrapper={(child) => (
              <div
                className={classNames(
                  'flex flex-col rounded-16 border border-theme-divider-tertiary tablet:mt-6',
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
                gapClass(isList, shouldUseFeedLayoutV1, spaciness),
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
