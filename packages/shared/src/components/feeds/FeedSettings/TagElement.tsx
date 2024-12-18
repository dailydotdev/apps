import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { AlertDot, AlertColor } from '../../AlertDot';
import { Button } from '../../buttons/Button';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/common';
import { Tag } from '../../../graphql/feedSettings';
import { OnSelectTagProps } from '../../tags/common';
import { MiniCloseIcon, PlusIcon } from '../../icons';

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
      iconPosition={ButtonIconPosition.Right}
      icon={isSelected ? <MiniCloseIcon /> : <PlusIcon />}
      size={ButtonSize.Small}
      onClick={() => {
        onClick({ tag });
      }}
    >
      {tag.name}
      {isHighlighted && (
        <AlertDot
          className="absolute right-0 top-0"
          color={AlertColor.Cabbage}
        />
      )}
    </Button>
  );
};
