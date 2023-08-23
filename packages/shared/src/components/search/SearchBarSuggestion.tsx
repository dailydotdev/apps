import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
} from '../buttons/Button';
import { AiIcon } from '../icons';

export const SearchBarSuggestion = <TagName extends AllowedTags>({
  className,
  ...props
}: ButtonProps<TagName>): ReactElement => {
  return (
    <Button
      icon={<AiIcon />}
      buttonSize={ButtonSize.XLarge}
      className={classNames(
        'btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary w-fit',
        className,
      )}
      {...props}
    />
  );
};
