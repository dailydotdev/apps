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
      spanClassName="w-fit py-2 flex-shrink"
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
