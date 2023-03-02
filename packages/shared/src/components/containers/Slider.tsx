import classNames from 'classnames';
import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { SwipeCallback, useSwipeable } from 'react-swipeable';
import SettingsContext from '../../contexts/SettingsContext';
import { gridGaps, gapClass } from '../../lib/feed';

type CanSwipeFn = <TSliderItem extends { id: string }>(
  index: number,
  items: TSliderItem[],
) => boolean;

interface SliderProps<TSliderItem extends { id: string }> {
  items: TSliderItem[];
  itemWidth: number;
  Item: FunctionComponent<TSliderItem>;
  canSwipeRight?: CanSwipeFn;
  canSwipeLeft?: CanSwipeFn;
}

const defaultCanSwipeRight: CanSwipeFn = (index) => index > 0;

const defaultCanSwipeLeft: CanSwipeFn = (index, items) => index < items.length;

function Slider<TSliderItem extends { id: string }>({
  items,
  itemWidth,
  Item,
  canSwipeRight = defaultCanSwipeRight,
  canSwipeLeft = defaultCanSwipeLeft,
}: SliderProps<TSliderItem>): ReactElement {
  const [index, setIndex] = useState(0);
  const { spaciness } = useContext(SettingsContext);

  const onSwipedRight: SwipeCallback = (swipeEvent) => {
    swipeEvent.event.stopPropagation();

    setIndex((current) => {
      if (canSwipeRight(current, items)) {
        return current - 1;
      }

      return current;
    });
  };

  const onSwipedLeft: SwipeCallback = (swipeEvent) => {
    swipeEvent.event.stopPropagation();

    setIndex((current) => {
      if (canSwipeLeft(current, items)) {
        return current + 1;
      }

      return current;
    });
  };

  const swipeable = useSwipeable({
    onSwipedRight,
    onSwipedLeft,
    trackMouse: true,
  });

  // TODO WT-1109-personal-digest remove
  if (typeof window !== 'undefined') {
    const swipeEvent = {
      event: {
        stopPropagation: () => undefined,
      },
    };
    // @ts-expect-error globalThis
    window.swipeRight = () => onSwipedRight(swipeEvent);
    // @ts-expect-error globalThis
    window.swipeLeft = () => onSwipedLeft(swipeEvent);
  }

  const itemGapPx = +(gridGaps[spaciness] ?? 'gap-8').replace('gap-', '') * 4;
  const itemWidthWithGap = itemWidth + 1 * itemGapPx;

  return (
    <div {...swipeable} className="overflow-hidden">
      <div
        className={classNames(
          'flex justify-start transform ease-in-out duration-500',
          gapClass(false, spaciness),
        )}
        style={{
          transform: `translateX(-${index * itemWidthWithGap}px)`,
        }}
      >
        {items.map((item) => (
          <Item key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

export default Slider;
