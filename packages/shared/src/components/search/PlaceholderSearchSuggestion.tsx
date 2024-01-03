import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
} from '../buttons/Button';
import { AiIcon } from '../icons';

export const PlaceholderSearchSuggestion = ({
  className,
  ...props
}: ButtonProps<AllowedTags>): ReactElement => {
  return (
    <Button
      spanClassName="w-fit my-2 flex-shrink tablet:line-clamp-1"
      textPosition="justify-start"
      icon={<AiIcon />}
      buttonSize={ButtonSize.Medium}
      className={classNames(
        'btn-secondary !h-auto min-h-[2.5rem] w-fit border-theme-divider-tertiary text-theme-label-tertiary typo-subhead',
        className,
      )}
      {...props}
    />
  );
};
