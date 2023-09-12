import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { AllowedTags, Button, ButtonProps } from '../buttons/Button';
import { SendAirplaneIcon } from '../icons';
import { IconSize } from '../Icon';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TooltipProps } from '../tooltips/BaseTooltip';

interface SearchSubmitButtonProps<TagName extends AllowedTags> {
  tooltipProps: TooltipProps;
  buttonProps?: ButtonProps<TagName>;
}

export function SearchSubmitButton<TagName extends AllowedTags>({
  tooltipProps,
  buttonProps = {},
}: SearchSubmitButtonProps<TagName>): ReactElement {
  const { className } = buttonProps;

  return (
    <SimpleTooltip {...tooltipProps}>
      <div>
        <Button
          className={classNames('btn-primary', className)}
          title="Submit"
          type="submit"
          icon={<SendAirplaneIcon size={IconSize.Medium} />}
          {...buttonProps}
        />
      </div>
    </SimpleTooltip>
  );
}
