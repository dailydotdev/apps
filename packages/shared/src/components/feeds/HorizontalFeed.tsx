import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classnames from 'classnames';
import Feed from '../Feed';
import { OtherFeedPage } from '../../lib/query';
import FeedContext from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useFeedLayout } from '../../hooks';

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
  const [feedContainerRef, setFeedContainerRef] =
    useState<HTMLDivElement>(null);

  const [feedScrolledPosition, setFeedScrolledPosition] = useState(0);
  const currentSettings = useContext(FeedContext);
  const { spaciness } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const { isListMode } = useFeedLayout();

  useEffect(() => {
    const element = feedContainerRef;
    if (!element) {
      return undefined;
    }

    const onScroll = (e) => {
      setFeedScrolledPosition(e.currentTarget.scrollLeft);
    };

    element.addEventListener('scrollend', onScroll);

    return () => {
      element.removeEventListener('scrollend', onScroll);
    };
  }, [feedContainerRef]);

  const onClickNext = () => {
    if (feedContainerRef) {
      const currentPosition = feedContainerRef.scrollLeft;
      feedContainerRef.scrollLeft = Math.max(
        0,
        currentPosition + numCards * 320,
      );
    }
  };

  const onClickPrevious = () => {
    if (feedContainerRef) {
      const currentPosition = feedContainerRef.scrollLeft;
      const newPosition = Math.max(0, currentPosition - numCards * 320);
      feedContainerRef.scrollLeft = newPosition < 150 ? 0 : newPosition;
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
      className={classnames('mx-4 mb-10', isListMode && 'laptop:mx-auto')}
      feedContainerRef={(ref) => setFeedContainerRef(ref)}
    />
  );
}
