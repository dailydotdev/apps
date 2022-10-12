import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
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
  InitializationData,
  KratosError,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';

function ResetPassword(): ReactElement {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [hint, setHint] = useState(null);
  const [disabledWhileRedirecting, setDisabledWhileRedirecting] =
    useState(false);
  const { data: settings } = useQuery<InitializationData | KratosError>(
    'settings',
    () => getKratosFlow(AuthFlow.Settings, router.query.flow as string),
    {
      ...disabledRefetch,
      retry: false,
      enabled: !!router.query.flow,
      onSuccess: (data) => {
        if ('code' in data && data.code === 401) {
          setHint(
            `An error occurred. Kindly send us a report and include the following id: ${router.query.flow}`,
          );
        }
      },
    },
  );
  const { mutateAsync: reset, isLoading } = useMutation(
    (params: ValidateRegistrationParams) => submitKratosFlow(params),
    {
      onSuccess: ({ error, data: success }) => {
        if (success) {
          setDisabledWhileRedirecting(true);
          displayToast('Password changed successfully');
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
    if ('code' in settings) {
      return;
    }

    const { password } = formToJson<{ password: string }>(e.currentTarget);
    const params: RegistrationParameters = {
      method: 'password',
      csrf_token: getNodeValue('csrf_token', settings.ui.nodes),
      'traits.email': getNodeValue('traits.email', settings.ui.nodes),
      'traits.name': getNodeValue('traits.name', settings.ui.nodes),
      'traits.username': getNodeValue('traits.username', settings.ui.nodes),
      'traits.image': getNodeValue('traits.image', settings.ui.nodes),
      password,
    };
    reset({ params, action: settings.ui.action });
  };

  return (
    <div className="flex overflow-hidden relative flex-col items-center w-screen max-w-full h-screen bg-gradient-to-r to-theme-overlay-to from-theme-overlay-from">
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
          required
          minLength={6}
          hint={hint}
          showStrength={!hint}
          onChange={() => hint && setHint('')}
          label="Create new password"
          inputId="password"
          type="password"
          name="password"
        />
        <Button
          className={classNames(
            'mt-7 w-full btn-primary',
            !isLoading && 'bg-theme-color-cabbage',
          )}
          type="submit"
          disabled={isLoading || disabledWhileRedirecting}
        >
          Change password
        </Button>
      </form>
    </div>
  );
}

export default ResetPassword;
