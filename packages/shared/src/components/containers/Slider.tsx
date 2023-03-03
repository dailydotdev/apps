import classNames from 'classnames';
import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import SettingsContext from '../../contexts/SettingsContext';
import { gridGaps, gapClass } from '../../lib/feed';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';

type SliderCanSwipeFn = <TSliderItem extends { id: string }>(
  index: number,
  items: TSliderItem[],
) => boolean;

interface SliderProps<TSliderItem extends { id: string }> {
  items: TSliderItem[];
  itemWidth: number;
  Item: FunctionComponent<TSliderItem>;
  canSwipeRight?: SliderCanSwipeFn;
  canSwipeLeft?: SliderCanSwipeFn;
}

const defaultCanSwipeRight: SliderCanSwipeFn = (index) => index > 0;

const defaultCanSwipeLeft: SliderCanSwipeFn = (index, items) =>
  index < items.length;

type SliderControlPosition = 'left' | 'right';

const SliderControlButton = ({
  onClick,
  position,
}: {
  onClick: () => void;
  position: SliderControlPosition;
}) => {
  return (
    <div
      className={classNames(
        'absolute top-1/2 my-auto mx-0 -translate-y-1/2',
        position === 'left' ? 'left-3' : 'right-3',
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
  );
};

function Slider<TSliderItem extends { id: string }>({
  items,
  itemWidth,
  Item,
  canSwipeRight = defaultCanSwipeRight,
  canSwipeLeft = defaultCanSwipeLeft,
}: SliderProps<TSliderItem>): ReactElement {
  const [index, setIndex] = useState(0);
  const { spaciness } = useContext(SettingsContext);

  const onSwipedRight = (swipeEvent?: SwipeEventData) => {
    swipeEvent?.event.stopPropagation();

    setIndex((current) => {
      if (canSwipeRight(current, items)) {
        return current - 1;
      }

      return current;
    });
  };

  const onSwipedLeft = (swipeEvent?: SwipeEventData) => {
    swipeEvent?.event.stopPropagation();

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

  const itemGapPx = +(gridGaps[spaciness] ?? 'gap-8').replace('gap-', '') * 4;
  const itemWidthWithGap = itemWidth + 1 * itemGapPx;

  return (
    <div {...swipeable} className="relative">
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
          {items.map((item) => (
            <Item key={item.id} {...item} />
          ))}
        </div>
      </div>
      <SliderControlButton position="left" onClick={onSwipedRight} />
      <SliderControlButton position="right" onClick={onSwipedLeft} />
    </div>
  );
}

export default Slider;
