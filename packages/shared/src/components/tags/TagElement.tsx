import type { ReactElement } from 'react';
import React from 'react';
import { AlertDot, AlertColor } from '../AlertDot';
import { ButtonV2, ButtonColor } from '../buttons/ButtonV2';
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
  const className = 'relative';
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
      <ButtonV2
        className={className}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        onClick={handleClick}
        {...attrs}
      >
        {content}
      </ButtonV2>
    );
  }

  return (
    <ButtonV2
      className={className}
      variant={ButtonVariant.Float}
      onClick={handleClick}
      {...attrs}
    >
      {content}
    </ButtonV2>
  );
};
