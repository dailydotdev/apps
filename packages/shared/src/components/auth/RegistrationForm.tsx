import React, { ReactElement } from 'react';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import UserIcon from '../icons/User';
import VIcon from '../icons/V';
import { ColumnContainer } from './common';

interface RegistrationFormProps {
  email: string;
}

export const RegistrationForm = ({
  email,
}: RegistrationFormProps): ReactElement => {
  return (
    <ColumnContainer>
      <TextField
        leftIcon={<MailIcon />}
        inputId="email"
        label="Email"
        type="email"
        value={email}
        readOnly
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
      <TextField
        leftIcon={<UserIcon />}
        inputId="fullname"
        label="Full name"
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
      <TextField
        leftIcon={<MailIcon />}
        inputId="password"
        label="Create a password"
        type="password"
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      >
        <VIcon className="text-theme-color-avocado" />
      </TextField>
      <TextField
        leftIcon={<UserIcon />}
        inputId="username"
        label="Enter a username"
        rightIcon={<VIcon className="text-theme-color-avocado" />}
      />
    </ColumnContainer>
  );
};
