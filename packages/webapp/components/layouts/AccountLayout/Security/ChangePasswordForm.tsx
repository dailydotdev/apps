import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import React, { FormEvent, MutableRefObject, ReactElement } from 'react';
import { AccountPageContainer } from '../AccountPageContainer';
import { AccountSecurityDisplay, CommonTextField } from '../common';

export interface ChangePasswordParams {
  password: string;
}

interface ChangePasswordFormProps {
  onActiveDisplay: (display: AccountSecurityDisplay) => void;
  onUpdatePassword: (form: ChangePasswordParams) => void;
  formRef?: MutableRefObject<HTMLFormElement>;
}

function ChangePasswordForm({
  onActiveDisplay,
  onUpdatePassword,
  formRef,
}: ChangePasswordFormProps): ReactElement {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<{ password: string }>(e.currentTarget);
    onUpdatePassword(form);
  };

  return (
    <AccountPageContainer
      title="Change password"
      onBack={() => onActiveDisplay(AccountSecurityDisplay.Default)}
      className={{ section: 'max-w-sm' }}
    >
      <form className="flex flex-col" onSubmit={onSubmit} ref={formRef}>
        <CommonTextField
          type="text"
          name="password"
          inputId="password"
          label="Password"
        />
        <Button
          type="submit"
          className="mt-6 ml-auto w-fit bg-theme-color-cabbage btn-quaternary"
        >
          Save changes
        </Button>
      </form>
    </AccountPageContainer>
  );
}

export default ChangePasswordForm;
