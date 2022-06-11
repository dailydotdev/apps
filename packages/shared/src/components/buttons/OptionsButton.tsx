import React, { ReactElement } from 'react';
import { AllowedTags, Button, ButtonProps } from './Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

const OptionsButton = (props: ButtonProps<AllowedTags>): ReactElement => (
  <SimpleTooltip placement="left" content="Options">
    <Button
      {...props}
      className="my-auto btn-tertiary"
      icon={<MenuIcon size="medium" />}
      buttonSize="small"
    />
  </SimpleTooltip>
);

export default OptionsButton;
