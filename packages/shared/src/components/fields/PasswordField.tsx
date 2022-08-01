import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import EyeIcon from '../icons/Eye';
import EyeCancelIcon from '../icons/EyeCancel';
import LockIcon from '../icons/Lock';
import { TextField, TextFieldProps } from './TextField';

function PasswordField(props: TextFieldProps): ReactElement {
  const [shown, setShown] = useState(false);
  return (
    <TextField
      type={shown ? 'text' : 'password'}
      leftIcon={<LockIcon />}
      actionButton={
        <Button
          buttonSize="xsmall"
          icon={shown ? <EyeCancelIcon /> : <EyeIcon />}
          onClick={() => setShown(!shown)}
        />
      }
      {...props}
    />
  );
}

export default PasswordField;
