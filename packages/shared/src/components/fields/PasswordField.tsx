import React, { ReactElement, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import { TextField, TextFieldProps } from './TextField';
import EyeIcon from '../icons/Eye';
import EyeCancelIcon from '../icons/EyeCancel';
import LockIcon from '../icons/Lock';

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

export interface PasswordFieldProps extends TextFieldProps {
  showStrength?: boolean;
}

export function PasswordField({
  type = 'password',
  showStrength = true,
  className,
  ...props
}: PasswordFieldProps): ReactElement {
  const [value, setValue] = useState<string>(null);
  const [useType, setUseType] = useState(type);
  const [passwordStrengthLevel, setPasswordStrengthLevel] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(null);
  const hasUserAction = isValid !== null;
  const userActionHint = !isValid
    ? `Password needs a minimum length of ${props.minLength}`
    : passwordStrengthStates[passwordStrengthLevel].label;
  const hint = !hasUserAction ? null : userActionHint;
  const shouldShowStrength = !!value && showStrength && hasUserAction;
  const Icon = useType === 'password' ? EyeIcon : EyeCancelIcon;

  const onChange = (input: string) => {
    setPasswordStrengthLevel(passwordStrength(input).id);
    setValue(input);
  };

  return (
    <TextField
      {...props}
      autoComplete="off"
      type={useType}
      valueChanged={onChange}
      leftIcon={<LockIcon />}
      hint={!!value && showStrength ? hint : props.hint}
      validityChanged={setIsValid}
      valid={isValid || !props.hint}
      className={{
        ...className,
        hint: shouldShowStrength
          ? passwordStrengthStates[passwordStrengthLevel].className
          : 'text-theme-status-error',
        baseField: shouldShowStrength && `password-${passwordStrengthLevel}`,
      }}
      progress={
        shouldShowStrength &&
        passwordStrengthStates[passwordStrengthLevel].progress
      }
      actionButton={
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setUseType((_type) => (_type === 'password' ? 'text' : 'password'));
          }}
        >
          <Icon className="text-theme-label-secondary" />
        </button>
      }
    />
  );
}
