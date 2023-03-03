import classNames from 'classnames';
import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { SwipeableProps } from 'react-swipeable/dist/types';
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
          'absolute top-1/2 my-auto mx-0 -translate-y-1/2',
          position === 'left' ? 'left-2.5' : 'right-2.5',
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
  items,
  itemWidth,
  Item,
  canSlideRight = defaultCanSlideRight,
  canSlideLeft = defaultCanSlideLeft,
  swipeEnabled = true,
  swipeableProps,
}: SliderProps<TSliderItem>): ReactElement {
  const [index, setIndex] = useState(0);
  const { spaciness } = useContext(SettingsContext);

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

  const itemGapPx = +(gridGaps[spaciness] ?? 'gap-8').replace('gap-', '') * 4;
  const itemWidthWithGap = itemWidth + 1 * itemGapPx;

  return (
    <div
      {...swipeable}
      className="box-border relative p-4 -mx-4 bg-gradient-to-l from-cabbage-40 to-onion-40 rounded-16"
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
          {items.map((item) => (
            <Item key={item.id} {...item} />
          ))}
        </div>
      </div>
      {canSlideRight(index, items) && (
        <SliderControlButton position="left" onClick={onSwipedRight} />
      )}
      {canSlideLeft(index, items) && (
        <SliderControlButton position="right" onClick={onSwipedLeft} />
      )}
    </div>
  );
}

export default Slider;
