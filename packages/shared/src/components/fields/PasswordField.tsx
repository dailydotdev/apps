import React, { ReactElement, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import { TextField, TextFieldProps } from './TextField';
import EyeIcon from '../icons/Eye';
import EyeCancelIcon from '../icons/EyeCancel';

const passwordStrengthStates = {
  0: {
    label: 'Risky',
    className: 'text-theme-status-error',
    progress: 'bg-theme-status-error w-1/6',
  },
  1: {
    label: 'Risky',
    className: 'text-theme-status-error',
    progress: 'bg-theme-status-error w-1/6',
  },
  2: {
    label: `You're almost there`,
    className: 'text-theme-status-warning',
    progress: 'bg-theme-status-warning w-1/4',
  },
  3: {
    label: 'Strong as it gets',
    className: 'text-theme-status-success',
    progress: 'bg-theme-status-success w-1/2',
  },
};

export function PasswordField({
  type,
  ...props
}: TextFieldProps): ReactElement {
  const [useType, setUseType] = useState(type);
  const [passwordStrengthLevel, setPasswordStrengthLevel] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(null);
  const hasUserAction = isValid !== null;
  const hint = () => {
    if (!hasUserAction) return null;

    if (!isValid) {
      return `Password need a minimum length of ${props.minLength}`;
    }

    return passwordStrengthStates[passwordStrengthLevel].label;
  };

  return (
    <TextField
      {...props}
      autoComplete="off"
      type={useType}
      valueChanged={(value) =>
        setPasswordStrengthLevel(passwordStrength(value).id)
      }
      hint={hint()}
      validityChanged={setIsValid}
      valid={isValid}
      hintClassName={
        hasUserAction && passwordStrengthStates[passwordStrengthLevel].className
      }
      progress={
        hasUserAction && passwordStrengthStates[passwordStrengthLevel].progress
      }
      baseFieldClassName={hasUserAction && `password-${passwordStrengthLevel}`}
      actionButton={
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setUseType((_type) => (_type === 'password' ? 'text' : 'password'));
          }}
        >
          {useType === 'password' ? <EyeIcon /> : <EyeCancelIcon />}
        </button>
      }
    />
  );
}
