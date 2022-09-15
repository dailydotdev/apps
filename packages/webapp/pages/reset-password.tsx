import React, { FormEvent, ReactElement, useState } from 'react';
import DailyCircle from '@dailydotdev/shared/src/components/DailyCircle';
import Logo from '@dailydotdev/shared/src/components/Logo';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useQuery, useMutation } from 'react-query';
import {
  errorsToJson,
  getNodeValue,
  RegistrationParameters,
  ValidateRegistrationParams,
} from '@dailydotdev/shared/src/lib/auth';
import { disabledRefetch } from '@dailydotdev/shared/src/lib/func';
import { useRouter } from 'next/router';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import {
  AuthFlow,
  getKratosFlow,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';

function ResetPassword(): ReactElement {
  const router = useRouter();
  const [hint, setHint] = useState(null);
  const { data } = useQuery(
    'settings',
    () => getKratosFlow(AuthFlow.Settings, router.query.flow as string),
    {
      ...disabledRefetch,
      retry: false,
      enabled: !!router.query.flow,
    },
  );
  const { mutateAsync: reset } = useMutation(
    (params: ValidateRegistrationParams) => submitKratosFlow(params),
    {
      onSuccess: ({ error, data: success }) => {
        if (success) {
          return window.location.replace(process.env.NEXT_PUBLIC_WEBAPP_URL);
        }

        if (!error?.ui) {
          return setHint('Session could have expired!');
        }

        const json = errorsToJson<keyof RegistrationParameters>(error);
        return setHint(json?.password);
      },
    },
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { password } = formToJson<{ password: string }>(e.currentTarget);
    const params: RegistrationParameters = {
      method: 'password',
      csrf_token: getNodeValue('csrf_token', data.ui.nodes),
      'traits.email': getNodeValue('traits.email', data.ui.nodes),
      'traits.name': getNodeValue('traits.name', data.ui.nodes),
      'traits.username': getNodeValue('traits.username', data.ui.nodes),
      'traits.image': getNodeValue('traits.image', data.ui.nodes),
      password,
    };
    reset({ params, action: data.ui.action });
  };

  return (
    // eslint-disable-next-line @dailydotdev/daily-dev-eslint-rules/no-custom-color
    <div className="flex overflow-hidden relative flex-col items-center w-screen max-w-full h-screen bg-gradient-to-bl from-[#EF43FD32] to-[#6451F332]">
      <DailyCircle className="hidden laptop:block absolute left-20" />
      <Logo className="mt-16 h-fit" logoClassName="h-logo-big" />
      <form
        className="relative z-1 p-7 mt-20 w-full text-left rounded-16 max-w-[23.25rem] bg-theme-bg-primary"
        onSubmit={onSubmit}
      >
        <DailyCircle
          className="hidden laptop:block absolute top-1/4 -right-60"
          size="small"
        />
        <DailyCircle className="hidden laptop:block absolute bottom-0 left-2/4 -translate-x-1/2 translate-y-[calc(100%+10rem)]" />
        <h2 className="font-bold typo-title1">Create new password</h2>
        <p className="my-7 typo-body text-theme-label-secondary">
          Please enter your new password. A password strength meter will guide
          you if your password is strong enough.
        </p>
        <PasswordField
          label="Create new password"
          inputId="password"
          type="password"
          name="password"
          onChange={() => hint && setHint('')}
          hint={hint}
        />
        <Button className="mt-7 w-full bg-theme-color-cabbage" type="submit">
          Change password
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;
