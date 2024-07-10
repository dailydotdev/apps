import React, { ReactElement, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import { TextField, TextFieldProps } from './TextField';
import { EyeIcon, EyeCancelIcon, LockIcon } from '../icons';
import { IconSize } from '../Icon';

const passwordStrengthStates = {
  0: {
    label: 'Risky',
    className: 'text-status-error',
    progress: 'bg-status-error w-1/6',
  },
  1: {
    label: 'Risky',
    className: 'text-status-error',
    progress: 'bg-status-error w-1/6',
  },
  2: {
    label: `You're almost there`,
    className: 'text-status-warning',
    progress: 'bg-status-warning w-1/4',
  },
  3: {
    label: 'Strong as it gets',
    className: 'text-status-success',
    progress: 'bg-status-success w-1/2',
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
  const [isValid, setIsValid] = useState<boolean>(!props.hint);
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
      leftIcon={<LockIcon size={IconSize.Small} />}
      hint={!!value && showStrength ? hint : props.hint}
      validityChanged={(validityCheck) =>
        !props.hint && setIsValid(validityCheck)
      }
      valid={!props.hint || isValid}
      className={{
        ...className,
        hint: shouldShowStrength
          ? passwordStrengthStates[passwordStrengthLevel].className
          : 'text-status-error',
        baseField: shouldShowStrength && `password-${passwordStrengthLevel}`,
        input: 'hide-ms-reveal',
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
          aria-label="Set password"
        >
          <Icon className="text-text-secondary" />
        </button>
      }
    />
  );
}
