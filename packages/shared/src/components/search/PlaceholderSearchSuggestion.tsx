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
      buttonSize={ButtonSize.XLarge}
      className={classNames(
        'btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary w-fit !h-auto min-h-[2.5rem]',
        className,
      )}
      {...props}
    />
  );
};
