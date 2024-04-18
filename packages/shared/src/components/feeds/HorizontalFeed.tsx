import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Feed from '../Feed';
import { OtherFeedPage } from '../../lib/query';
import { MOST_UPVOTED_FEED_QUERY } from '../../graphql/feed';
import FeedContext from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import AuthContext from '../../contexts/AuthContext';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { PostType } from '../../graphql/posts';

interface HorizontalFeedProps {
  variables: { source: string; ranking: string; supportedTypes: PostType[] };
  title: ReactElement;
}
export const HorizontalFeed = ({
  variables,
  title,
}: HorizontalFeedProps): ReactElement => {
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [feedScrolledPosition, setFeedScrolledPosition] = useState(0);
  const currentSettings = useContext(FeedContext);
  const { spaciness } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const element = feedContainerRef.current;
    if (!element) {
      return null;
    }

    const onScroll = (e) => {
      setFeedScrolledPosition(e.currentTarget.scrollLeft);
    };

    element.addEventListener('scrollend', onScroll);

    return () => {
      element.removeEventListener('scrollend', onScroll);
    };
  }, []);

  return (
    <>
      <div className="mx-4 mb-4 flex w-auto items-center justify-between laptop:mx-0 laptop:w-full">
        <p className="flex items-center font-bold typo-body">{title}</p>
        <div className="hidden flex-row gap-3 tablet:flex">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            disabled={feedScrolledPosition <= 0}
            onClick={() => {
              if (feedContainerRef.current) {
                const currentPosition = feedContainerRef.current.scrollLeft;
                const newPosition = Math.max(
                  0,
                  currentPosition - numCards * 320,
                );
                feedContainerRef.current.scrollLeft =
                  newPosition < 150 ? 0 : newPosition;
              }
            }}
            aria-label="Scroll left"
          />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="rotate-90" />}
            disabled={feedScrolledPosition > (10 - numCards) * 320}
            onClick={() => {
              if (feedContainerRef.current) {
                const currentPosition = feedContainerRef.current.scrollLeft;
                feedContainerRef.current.scrollLeft = Math.max(
                  0,
                  currentPosition + numCards * 320,
                );
              }
            }}
            aria-label="Scroll right"
          />
        </div>
      </div>
      <Feed
        feedName={OtherFeedPage.SourceMostUpvoted}
        feedQueryKey={[
          'sourceFeedUpvoted',
          user?.id ?? 'anonymous',
          Object.values(variables),
        ]}
        query={MOST_UPVOTED_FEED_QUERY}
        variables={variables}
        disableAds
        allowFetchMore={false}
        forcedLimit={10}
        isHorizontal
        className="mb-10 ml-4 !w-auto laptop:w-full"
        feedContainerRef={feedContainerRef}
      />
    </>
  );
};
