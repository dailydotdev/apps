import React, { ReactElement } from 'react';
import DailyCircle from '@dailydotdev/shared/src/components/DailyCircle';
import Logo from '@dailydotdev/shared/src/components/Logo';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

function ResetPassword(): ReactElement {
  return (
    <div
      className="flex overflow-hidden relative flex-col items-center w-screen max-w-full h-screen"
      style={{
        background: 'linear-gradient(to bottom left, #EF43FD32, #6451F332)',
      }}
    >
      <DailyCircle className="absolute left-20" />
      <Logo className="mt-16 h-fit" />
      <div className="relative z-1 p-7 mt-20 w-full text-center rounded-16 max-w-[23.25rem] bg-theme-bg-primary">
        <DailyCircle className="absolute top-1/4 -right-60" size="small" />
        <DailyCircle className="absolute bottom-0 left-2/4 -translate-x-1/2 translate-y-[calc(100%+10rem)]" />
        <h2 className="font-bold typo-title1">Create new password</h2>
        <p className="my-7 typo-body text-theme-label-secondary">
          Please enter your new password. A password strength meter will guide
          you if your password is strong enough.
        </p>
        <TextField label="Create new password" inputId="password" />
        <Button className="mt-7 w-full bg-theme-color-cabbage">
          Change password
        </Button>
      </div>
    </div>
  );
}

export default ResetPassword;
