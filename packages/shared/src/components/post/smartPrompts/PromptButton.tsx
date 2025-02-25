import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import { promptColorMap, PromptIconMap } from './common';
import { CustomPromptIcon } from '../../icons';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import type { ButtonProps } from '../../buttons/Button';
import { Button } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import type { PromptFlags } from '../../../graphql/prompt';

type PromptButtonProps = ButtonProps<'button'> & {
  active: boolean;
  flags: PromptFlags;
};

const PromptButton = forwardRef(
  (
    { children, flags, active, ...props }: PromptButtonProps,
    ref?: Ref<HTMLButtonElement>,
  ): ReactElement => {
    const PromptIcon = PromptIconMap[flags.icon] || CustomPromptIcon;
    const variant = active ? ButtonVariant.Primary : ButtonVariant.Subtle;
    const color = active ? flags.color : undefined;
    return (
      <Button
        variant={props?.variant || variant}
        color={color}
        size={props?.size || ButtonSize.XSmall}
        icon={
          <PromptIcon
            size={IconSize.XSmall}
            className={!active && promptColorMap[flags.color]}
          />
        }
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    );
  },
);
PromptButton.displayName = 'PromptButton';
export default PromptButton;
