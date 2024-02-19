import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonVariant,
} from '../buttons/ButtonV2';
import { AiIcon } from '../icons';

export const PlaceholderSearchSuggestion = ({
  className,
  ...props
}: ButtonProps<AllowedTags>): ReactElement => {
  return (
    <Button
      icon={<AiIcon />}
      variant={ButtonVariant.Subtle}
      className={classNames(
        'my-2 !h-auto min-h-[2.5rem] w-fit flex-shrink justify-start typo-subhead tablet:line-clamp-1',
        className,
      )}
      {...props}
    />
  );
};
