import classNames from 'classnames';
import { MailIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import React, { ReactElement, useContext, useState } from 'react';
import useTimer from '@dailydotdev/shared/src/hooks/useTimer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  ADD_USER_COMPANY_MUTATION,
  VERIFY_USER_COMPANY_CODE_MUTATION,
} from '@dailydotdev/shared/src/graphql/users';
import { UserCompany } from '@dailydotdev/shared/src/lib/userCompany';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { labels } from '@dailydotdev/shared/src/lib';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { AccountSecurityDisplay as Display, CommonTextField } from '../common';
import { AccountPageContainer } from '../AccountPageContainer';

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
        submittedCode,
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
      className={{ section: 'max-w-sm' }}
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
          className={{ container: 'w-full' }}
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
              disabled={!workEmail || timer > 0}
              onClick={() => onSubmitCode()}
            >
              {timer === 0 ? 'Send code' : `Resend code ${timer}s`}
            </Button>
          }
        />
        <Button
          data-testid="change_email_btn"
          className="mt-3 w-fit"
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
