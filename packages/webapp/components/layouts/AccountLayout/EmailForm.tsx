import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  PasswordField,
  PasswordFieldProps,
} from '@dailydotdev/shared/src/components/fields/PasswordField';
import { TextFieldProps } from '@dailydotdev/shared/src/components/fields/TextField';
import classNames from 'classnames';
import React, {
  Dispatch,
  FormEvent,
  ReactElement,
  SetStateAction,
} from 'react';
import { CommonTextField } from './common';

export interface EmailFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  emailProps?: Partial<TextFieldProps>;
  passwordProps?: Partial<PasswordFieldProps>;
  hint?: string;
  setHint?: Dispatch<SetStateAction<string>>;
}

function EmailForm({
  onSubmit,
  className,
  hint,
  setHint,
  emailProps = {},
  passwordProps,
}: EmailFormProps): ReactElement {
  return (
    <form
      className={classNames('flex flex-col', className)}
      onSubmit={onSubmit}
    >
      <CommonTextField
        type="email"
        inputId="new_email"
        name="traits.email"
        value={emailProps?.value}
        hint={hint}
        valid={!hint}
        label={emailProps?.label || 'Email'}
        onChange={() => setHint(null)}
      />
      {passwordProps && (
        <PasswordField
          className={{ container: 'mt-6' }}
          inputId="password"
          name="password"
          type="password"
          {...passwordProps}
          label={passwordProps?.label || 'Password'}
        />
      )}
      <Button className="mt-6 ml-auto w-fit bg-theme-color-cabbage btn-quaternary">
        Save changes
      </Button>
    </form>
  );
}

export default EmailForm;
