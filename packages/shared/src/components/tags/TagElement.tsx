import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { AlertDot, AlertColor } from '../AlertDot';
import { Button, ButtonColor } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import type { Tag } from '../../graphql/feedSettings';
import type { OnSelectTagProps } from './common';

export type OnboardingTagProps = {
  tag: Tag;
  onClick: (props: Pick<OnSelectTagProps, 'tag'>) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
};

export const TagElement = ({
  tag,
  onClick,
  isSelected = false,
  isHighlighted = false,
  ...attrs
}: OnboardingTagProps): ReactElement => {
  const className = classNames({ 'btn-tag': !isSelected }, 'relative');
  const handleClick = () => onClick({ tag });
  const content = (
    <>
      {tag.name}
      {isHighlighted && (
        <AlertDot
          className="absolute right-1 top-1"
          color={AlertColor.Cabbage}
        />
      )}
    </>
  );

  if (isSelected) {
    return (
      <Button
        className={className}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        onClick={handleClick}
        {...attrs}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      variant={ButtonVariant.Float}
      onClick={handleClick}
      {...attrs}
    >
      {content}
    </Button>
  );
};
