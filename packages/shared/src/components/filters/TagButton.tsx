import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonVariant } from '../buttons/Button';
import { Button, ButtonIconPosition, ButtonSize } from '../buttons/Button';

interface GenericTagButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  tagItem: string;
  className?: string;
  icon?: ReactElement;
  action: () => unknown;
  variant?: ButtonVariant;
  showHashtag?: boolean;
}

export const GenericTagButton = ({
  tagItem,
  className,
  icon,
  action,
  showHashtag = true,
  ...props
}: GenericTagButtonProps): ReactElement => (
  <Button
    {...props}
    size={ButtonSize.Small}
    className={classNames('font-bold typo-callout', className)}
    onClick={action}
    icon={action ? icon : undefined}
    iconPosition={action ? ButtonIconPosition.Right : undefined}
  >
    {showHashtag ? `#${tagItem}` : tagItem}
  </Button>
);
