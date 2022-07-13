import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import React, { FormEventHandler, ReactElement } from 'react';
import { AccountTextField, CommonTextField } from './common';

interface EmailFormProps {
  onSubmit?: FormEventHandler;
  className?: string;
}

function EmailForm({ onSubmit, className }: EmailFormProps): ReactElement {
  return (
    <form
      className={classNames('flex flex-col', className)}
      onSubmit={onSubmit}
    >
      <CommonTextField type="email" inputId="new_email" label="New email" />
      <AccountTextField
        label="Confirm current password"
        inputId="confirm_password"
        type="password"
      />
      <Button className="mt-6 ml-auto w-fit bg-theme-color-cabbage btn-quaternary">
        Save changes
      </Button>
    </form>
  );
}

export default EmailForm;
