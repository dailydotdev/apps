import classNames from 'classnames';
import React, {
  FunctionComponent,
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { SwipeableProps } from 'react-swipeable/dist/types';
import FeedContext from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import { gridGaps, gapClass } from '../../lib/feed';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';

export type FeedSliderItem = {
  id: string;
};

export type FeedSliderCanSwipeFn = <TFeedSliderItem extends FeedSliderItem>(
  index: number,
  items: TFeedSliderItem[],
) => boolean;

export interface FeedSliderProps<TFeedSliderItem extends FeedSliderItem>
  extends HTMLAttributes<HTMLDivElement> {
  items: TFeedSliderItem[];
  Item: FunctionComponent<{ item: TFeedSliderItem; index: number }>;
  canSlideRight?: FeedSliderCanSwipeFn;
  canSlideLeft?: FeedSliderCanSwipeFn;
  swipeEnabled?: boolean;
  swipeableProps?: Omit<
    SwipeableProps,
    'onSwipedLeft' | 'onSwipedRight' | 'onSwipedDown' | 'onSwipedUp'
  >;
}

export const defaultCanSlideRight: FeedSliderCanSwipeFn = (index) => index > 0;

export const defaultCanSlideLeft: FeedSliderCanSwipeFn = (index, items) =>
  index < items.length;

type FeedSliderControlPosition = 'left' | 'right';

const defaultItemWidth = 20 * 16; // 320px or 20rem as per Feed.module.css

const FeedSliderControlButton = ({
  onClick,
  position,
}: {
  onClick: () => void;
  position: FeedSliderControlPosition;
}) => {
  return (
    <>
      <div
        className={classNames(
          'absolute my-auto mx-0 top-0 bottom-0 flex items-center w-24 opacity-64',
          position === 'left'
            ? 'bg-gradient-to-l from-transparent to-[black] rounded-l-16 left-0'
            : 'bg-gradient-to-r to-[black] from-transparent rounded-r-16 right-0',
        )}
      />
      <div
        className={classNames(
          'absolute top-1/2 my-auto mx-0 -translate-y-1/2 p-2.5',
          position === 'left' ? 'left-0' : 'right-0',
        )}
      >
        <Button
          className="w-12 h-12 btn-primary"
          onClick={() => {
            onClick();
          }}
        >
          <ArrowIcon
            className={position === 'left' ? '-rotate-90' : 'rotate-90'}
            size="xlarge"
          />
        </Button>
      </div>
    </>
  );
};

function FeedSlider<TFeedSliderItem extends { id: string }>({
  className,
  items,
  Item,
  canSlideRight = defaultCanSlideRight,
  canSlideLeft = defaultCanSlideLeft,
  swipeEnabled = true,
  swipeableProps,
}: FeedSliderProps<TFeedSliderItem>): ReactElement {
  const [index, setIndex] = useState(0);
  const { spaciness } = useContext(SettingsContext);
  const feedSettings = useContext(FeedContext);
  const numCards = feedSettings.numCards[spaciness ?? 'eco'];

  const onSwipedRight = (swipeEvent?: SwipeEventData) => {
    swipeEvent?.event.stopPropagation();

    if (swipeEvent && !swipeEnabled) {
      return;
    }

    setIndex((current) => {
      if (canSlideRight(current, items)) {
        return current - 1;
      }

      return current;
    });
  };

  const onSwipedLeft = (swipeEvent?: SwipeEventData) => {
    swipeEvent?.event.stopPropagation();

    if (swipeEvent && !swipeEnabled) {
      return;
    }

    setIndex((current) => {
      if (canSlideLeft(current, items)) {
        return current + 1;
      }

      return current;
    });
  };

  const swipeable = useSwipeable({
    ...swipeableProps,
    onSwipedRight,
    onSwipedLeft,
    trackMouse: true,
  });

  const [sliderWidth, setFeedSliderWidth] = useState(defaultItemWidth);

  const rootRef = useRef<HTMLElement>();

  useEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    setFeedSliderWidth(rootRef.current.getBoundingClientRect().width);

    const onResize: ResizeObserverCallback = (entries) => {
      const entry = entries[0];

      setFeedSliderWidth(entry.contentRect.width);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(rootRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const itemGapPx = +(gridGaps[spaciness] ?? 'gap-8').replace('gap-', '') * 4;

  const { itemWidth, itemWidthWithGap } = useMemo(() => {
    const gapValue = itemGapPx * (numCards - 1);
    const widthValue = (sliderWidth - gapValue) / numCards;

    return {
      itemWidth: widthValue,
      itemWidthWithGap: widthValue + 1 * itemGapPx,
    };
  }, [sliderWidth, itemGapPx, numCards]);

  useEffect(() => {
    if (!items.length) {
      return;
    }

    setIndex(0);
  }, [items.length, numCards]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      {...swipeable}
      ref={(ref) => {
        rootRef.current = ref;
        swipeable.ref(ref);
      }}
      className={classNames(
        'box-border relative p-4 -mx-4 bg-gradient-to-l from-cabbage-40 to-onion-40 rounded-16',
        className,
      )}
    >
      <div className="overflow-hidden">
        <div
          className={classNames(
            'flex justify-start transform ease-in-out duration-500',
            gapClass(false, spaciness),
          )}
          style={{
            transform: `translateX(-${index * itemWidthWithGap}px)`,
          }}
        >
          {items.map((item, itemIndex) => (
            <div
              key={item.id}
              className="w-full"
              style={{
                maxWidth: `${itemWidth}px`,
              }}
            >
              <Item item={item} index={itemIndex} />
            </div>
          ))}
        </div>
      </div>
      {canSlideRight(index, items) && (
        <FeedSliderControlButton position="left" onClick={onSwipedRight} />
      )}
      {canSlideLeft(index, items) && (
        <FeedSliderControlButton position="right" onClick={onSwipedLeft} />
      )}
    </section>
  );
}

export default FeedSlider;
