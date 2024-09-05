import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { MailIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  ADD_USER_COMPANY_MUTATION,
  VERIFY_USER_COMPANY_CODE_MUTATION,
} from '@dailydotdev/shared/src/graphql/users';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import useTimer from '@dailydotdev/shared/src/hooks/useTimer';
import { labels } from '@dailydotdev/shared/src/lib';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { UserCompany } from '@dailydotdev/shared/src/lib/userCompany';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import React, { ReactElement, useContext, useEffect, useState } from 'react';

import { AccountPageContainer } from '../AccountPageContainer';
import { AccountSecurityDisplay as Display, CommonTextField } from '../common';

const VerifyWorkEmail = ({
  onSwitchDisplay,
  workEmail,
}: {
  onSwitchDisplay: (display: Display) => void;
  workEmail?: string;
}): ReactElement => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [hint, setHint] = useState<string>();
  const [code, setCode] = useState<string>();
  const { timer, setTimer, runTimer } = useTimer(null, 0);

  useEffect(() => {
    if (workEmail) {
      setTimer(60);
      runTimer();
    }
  }, [runTimer, setTimer, workEmail]);

  const { mutate: onSubmitCode } = useMutation(
    () => gqlClient.request(ADD_USER_COMPANY_MUTATION, { email: workEmail }),
    {
      onSuccess: () => {
        setTimer(60);
        runTimer();
      },
      onError: () => displayToast(labels.error.generic),
    },
  );

  const { mutate: verifyUserCompanyCode } = useMutation(
    ({ email, code: submittedCode }: { email: string; code: string }) =>
      gqlClient.request(VERIFY_USER_COMPANY_CODE_MUTATION, {
        email,
        code: submittedCode,
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<UserCompany[]>(
          generateQueryKey(RequestKey.UserCompanies, user),
          (currentUserCompanies) => {
            currentUserCompanies.push(data.verifyUserCompanyCode);
            return currentUserCompanies;
          },
        );
        onSwitchDisplay(Display.Default);
      },
      onError: () => displayToast(labels.error.generic),
    },
  );

  return (
    <AccountPageContainer
      title="Verify your work email"
      onBack={() => onSwitchDisplay(Display.Default)}
    >
      <form className={classNames('flex flex-col gap-3')}>
        <CommonTextField
          leftIcon={<MailIcon />}
          type="email"
          inputId="new_email"
          name="traits.email"
          label="Email"
          value={workEmail}
          readOnly
          rightIcon={<VIcon />}
        />
        <TextField
          className={{ container: 'w-full max-w-sm', baseField: '!pr-1' }}
          name="code"
          type="code"
          inputId="code"
          label="Enter 6-digit code"
          placeholder="Enter 6-digit code"
          hint={hint}
          defaultValue={code}
          valid={!hint}
          valueChanged={setCode}
          onChange={() => hint && setHint('')}
          actionButton={
            <Button
              variant={ButtonVariant.Primary}
              type="button"
              className="w-[10.875rem]"
              disabled={!workEmail || timer > 0}
              onClick={() => onSubmitCode()}
            >
              {timer === 0 ? 'Send code' : `Resend code: ${timer}s`}
            </Button>
          }
        />
        <Button
          data-testid="change_email_btn"
          className="mt-3 w-full max-w-sm"
          type="button"
          disabled={!code || !workEmail}
          variant={ButtonVariant.Primary}
          onClick={() => verifyUserCompanyCode({ email: workEmail, code })}
        >
          Verify email
        </Button>
      </form>
    </AccountPageContainer>
  );
};

export default VerifyWorkEmail;
