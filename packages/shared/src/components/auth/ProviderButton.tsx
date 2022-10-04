import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { Provider } from './common';

interface ProviderButtonProps extends Provider {
  label?: string;
  buttonSize?: ButtonSize;
}

function ProviderButton({
  label,
  provider,
  style,
  className,
  ...props
}: ProviderButtonProps): ReactElement {
  return (
    <Button
      {...props}
      className={classNames('btn-secondary', className)}
      style={{
        justifyContent: label ? 'flex-start' : 'center',
        color: '#FFFFFF',
        border: 0,
        fontWeight: 'normal',
        ...style,
      }}
    >
      {label ? `${label} ${provider}` : ''}
    </Button>
  );
}

export default ProviderButton;
