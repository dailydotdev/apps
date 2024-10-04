import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { AlertDot, AlertColor } from '../AlertDot';
import { Button, ButtonColor } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import { Tag } from '../../graphql/feedSettings';
import { OnSelectTagProps } from './common';

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
}: OnboardingTagProps): ReactElement => {
  return (
    <Button
      className={classNames(
        {
          'btn-tag': !isSelected,
        },
        'relative',
      )}
      variant={isSelected ? ButtonVariant.Primary : ButtonVariant.Float}
      color={isSelected ? ButtonColor.Cabbage : undefined}
      onClick={() => {
        onClick({ tag });
      }}
    >
      {tag.name}
      {isHighlighted && (
        <AlertDot
          className="absolute right-1 top-1"
          color={AlertColor.Cabbage}
        />
      )}
    </Button>
  );
};
