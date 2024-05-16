import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Feed from '../Feed';
import { OtherFeedPage } from '../../lib/query';
import FeedContext from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface HorizontalFeedProps<T> {
  feedName: OtherFeedPage;
  feedQueryKey: unknown[];
  query: string;
  variables: T;
  title: ReactElement;
  emptyScreen: ReactElement;
}

export default function HorizontalFeed<T>({
  title,
  ...props
}: HorizontalFeedProps<T>): ReactElement {
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [feedScrolledPosition, setFeedScrolledPosition] = useState(0);
  const currentSettings = useContext(FeedContext);
  const { spaciness } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];

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

  const onClickNext = () => {
    if (feedContainerRef.current) {
      const currentPosition = feedContainerRef.current.scrollLeft;
      feedContainerRef.current.scrollLeft = Math.max(
        0,
        currentPosition + numCards * 320,
      );
    }
  };

  const onClickPrevious = () => {
    if (feedContainerRef.current) {
      const currentPosition = feedContainerRef.current.scrollLeft;
      const newPosition = Math.max(0, currentPosition - numCards * 320);
      feedContainerRef.current.scrollLeft = newPosition < 150 ? 0 : newPosition;
    }
  };

  const Header = () => {
    return (
      <div className="mx-4 mb-4 flex w-auto items-center justify-between laptop:mx-0 laptop:w-full">
        <p className="flex items-center font-bold typo-body">{title}</p>
        <div className="hidden flex-row gap-3 tablet:flex">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            disabled={feedScrolledPosition <= 0}
            onClick={onClickPrevious}
            aria-label="Scroll left"
          />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="rotate-90" />}
            disabled={feedScrolledPosition > (10 - numCards) * 320}
            onClick={onClickNext}
            aria-label="Scroll right"
          />
        </div>
      </div>
    );
  };

  return (
    <Feed
      {...props}
      header={<Header />}
      disableAds
      allowFetchMore={false}
      pageSize={10}
      isHorizontal
      className="mx-4 mb-10"
      feedContainerRef={feedContainerRef}
    />
  );
}
