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

export interface SliderItem {
  id: string;
}

export type SliderCanSwipeFn = <TSliderItem extends SliderItem>(
  index: number,
  items: TSliderItem[],
) => boolean;

export interface SliderProps<TSliderItem extends SliderItem>
  extends HTMLAttributes<HTMLDivElement> {
  items: TSliderItem[];
  Item: FunctionComponent<{ item: TSliderItem; index: number }>;
  canSlideRight?: SliderCanSwipeFn;
  canSlideLeft?: SliderCanSwipeFn;
  swipeEnabled?: boolean;
  swipeableProps?: Omit<
    SwipeableProps,
    'onSwipedLeft' | 'onSwipedRight' | 'onSwipedDown' | 'onSwipedUp'
  >;
}

const defaultCanSlideRight: SliderCanSwipeFn = (index) => index > 0;

const defaultCanSlideLeft: SliderCanSwipeFn = (index, items) =>
  index < items.length;

type SliderControlPosition = 'left' | 'right';

const defaultItemWidth = 20 * 16; // 320px or 20rem as per Feed.module.css

const SliderControlButton = ({
  onClick,
  position,
}: {
  onClick: () => void;
  position: SliderControlPosition;
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

function Slider<TSliderItem extends { id: string }>({
  className,
  items,
  Item,
  canSlideRight = defaultCanSlideRight,
  canSlideLeft = defaultCanSlideLeft,
  swipeEnabled = true,
  swipeableProps,
}: SliderProps<TSliderItem>): ReactElement {
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

  const [sliderWidth, setSliderWidth] = useState(defaultItemWidth);

  const rootRef = useRef<HTMLElement>();

  useEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    setSliderWidth(rootRef.current.getBoundingClientRect().width);

    const onResize: ResizeObserverCallback = (entries) => {
      const entry = entries[0];

      setSliderWidth(entry.contentRect.width);
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

    // TODO WT-1109-personal-digest restore active item position after cards number change
    setIndex(0);
  }, [items.length, numCards]);

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
        <SliderControlButton position="left" onClick={onSwipedRight} />
      )}
      {canSlideLeft(index, items) && (
        <SliderControlButton position="right" onClick={onSwipedLeft} />
      )}
    </section>
  );
}

export default Slider;
