import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MailIcon } from '../icons';
import { TextField } from '../fields/TextField';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import useTimer from '../../hooks/useTimer';
import { gqlClient } from '../../graphql/common';
import {
  ADD_USER_COMPANY_MUTATION,
  VERIFY_USER_COMPANY_CODE_MUTATION,
} from '../../graphql/users';
import type { UserCompany } from '../../lib/userCompany';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { labels } from '../../lib';
import { useToastNotification } from '../../hooks';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalHeader } from './common/ModalHeader';
import { ModalBody } from './common/ModalBody';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface VerifyExperienceModalProps extends ModalProps {
  workEmail?: string;
}

function VerifyExperienceModal({
  onRequestClose,
  workEmail: initialWorkEmail,
  ...props
}: VerifyExperienceModalProps): ReactElement {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [hint, setHint] = useState<string>();
  const [code, setCode] = useState<string>();
  const [workEmail, setWorkEmail] = useState<string>(initialWorkEmail || '');
  const [codeSent, setCodeSent] = useState(false);
  const { timer, setTimer, runTimer } = useTimer(null, 0);

  const { mutate: onSubmitCode } = useMutation({
    mutationFn: () =>
      gqlClient.request(ADD_USER_COMPANY_MUTATION, { email: workEmail }),

    onSuccess: () => {
      setTimer(60);
      runTimer();
      setCodeSent(true);
    },
    onError: () => displayToast(labels.error.generic),
  });

  const { mutate: verifyUserCompanyCode } = useMutation({
    mutationFn: ({
      email,
      code: submittedCode,
    }: {
      email: string;
      code: string;
    }) =>
      gqlClient.request(VERIFY_USER_COMPANY_CODE_MUTATION, {
        email,
        code: submittedCode,
      }),

    onSuccess: (data) => {
      const verifiedCompany = data.verifyUserCompanyCode;
      const isCompanyVerified = !!verifiedCompany.company;

      queryClient.setQueryData<UserCompany[]>(
        generateQueryKey(RequestKey.UserCompanies, user),
        (currentUserCompanies) => {
          const companies = currentUserCompanies || [];
          return [...companies, verifiedCompany];
        },
      );

      displayToast(
        isCompanyVerified
          ? 'Verification successful'
          : 'Verification initiated',
      );
      onRequestClose(null);
    },
    onError: () => displayToast(labels.error.generic),
  });

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <ModalHeader title="Verify your work email" />
      <ModalBody>
        <form className={classNames('flex flex-col gap-3')}>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Already registered companies are approved instantly. New requests
            will be reviewed shortly.
          </Typography>
          <TextField
            leftIcon={<MailIcon />}
            type="email"
            inputId="new_email"
            name="traits.email"
            label="Email"
            value={workEmail}
            valueChanged={setWorkEmail}
            actionButton={
              <Button
                variant={ButtonVariant.Primary}
                type="button"
                disabled={!workEmail || timer > 0}
                onClick={() => onSubmitCode()}
                size={ButtonSize.Small}
              >
                {timer === 0 ? 'Send code' : `Resend code: ${timer}s`}
              </Button>
            }
          />
          {codeSent && (
            <TextField
              className={{ container: 'w-full', baseField: '!pr-1' }}
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
            />
          )}
          <Button
            data-testid="change_email_btn"
            className="mt-3 w-full"
            type="button"
            disabled={!code || !workEmail || !codeSent}
            variant={ButtonVariant.Primary}
            onClick={() => verifyUserCompanyCode({ email: workEmail, code })}
          >
            Verify email
          </Button>
        </form>
      </ModalBody>
    </Modal>
  );
}

export default VerifyExperienceModal;
