import classNames from 'classnames';
import React, { CSSProperties, ReactElement } from 'react';
import { Button, ButtonSize, IconType } from '../buttons/Button';

interface ProviderButtonProps {
  icon: IconType;
  provider: string;
  label?: string;
  onClick?: () => unknown;
  className?: string;
  style?: CSSProperties;
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
      key={provider}
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
