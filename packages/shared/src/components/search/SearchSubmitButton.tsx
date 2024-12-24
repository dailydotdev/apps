import type { ReactElement } from 'react';
import React from 'react';
import type { AllowedTags, ButtonProps } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { SendAirplaneIcon } from '../icons';
import { IconSize } from '../Icon';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import type { TooltipProps } from '../tooltips/BaseTooltip';

interface SearchSubmitButtonProps<TagName extends AllowedTags> {
  tooltipProps: TooltipProps;
  buttonProps?: ButtonProps<TagName>;
}

export function SearchSubmitButton<TagName extends AllowedTags>({
  tooltipProps,
  buttonProps = {},
}: SearchSubmitButtonProps<TagName>): ReactElement {
  const { variant = ButtonVariant.Primary, ...otherButtonProps } = buttonProps;

  return (
    <SimpleTooltip {...tooltipProps}>
      <div>
        <Button
          variant={variant}
          title="Submit"
          type="submit"
          icon={<SendAirplaneIcon size={IconSize.Medium} />}
          {...otherButtonProps}
        />
      </div>
    </SimpleTooltip>
  );
}
