import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../ConditionalWrapper';
import { StarIcon } from '../icons';
import { IconSize } from '../Icon';

interface RatingStarsProps {
  max: number;
  isDisabled?: boolean;
  onStarClick?: (value: number) => void;
}

export function RatingStars({
  max,
  isDisabled,
  onStarClick,
}: RatingStarsProps): ReactElement {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [justClicked, setJustClicked] = useState(false);
  const highlighted = hovered || score;

  const onClick = (value) => {
    setScore(value);
    setJustClicked(true);

    if (onStarClick) {
      onStarClick(value);
    }
  };

  const onOut = () => {
    setHovered(0);
    setJustClicked(false);
  };

  return (
    <span className="flex flex-row">
      {Object.keys([...Array(max)]).map((key, i) => (
        <ConditionalWrapper
          key={key}
          condition={!isDisabled}
          wrapper={(component) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              onMouseOver={() => setHovered(i + 1)}
              onFocus={() => setHovered(i + 1)}
              onMouseOut={onOut}
              onBlur={onOut}
            >
              {component}
            </button>
          )}
        >
          <StarIcon
            size={IconSize.XLarge}
            secondary={i < highlighted}
            className={classNames(
              'mx-0.5',
              i < highlighted
                ? 'text-accent-cheese-default'
                : 'text-text-secondary',
              i < highlighted && hovered && !justClicked && 'opacity-[0.8]',
            )}
          />
        </ConditionalWrapper>
      ))}
    </span>
  );
}
