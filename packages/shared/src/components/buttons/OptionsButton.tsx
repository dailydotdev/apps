import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { AllowedTags, Button, ButtonProps } from './Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

const OptionsButton = ({
  className,
  ...props
}: ButtonProps<AllowedTags>): ReactElement => (
  <SimpleTooltip placement="left" content="Options">
    <Button
      {...props}
      className={classNames('my-auto btn-tertiary', className)}
      icon={<MenuIcon size="medium" />}
      buttonSize="small"
    />
  </SimpleTooltip>
);

export default OptionsButton;
