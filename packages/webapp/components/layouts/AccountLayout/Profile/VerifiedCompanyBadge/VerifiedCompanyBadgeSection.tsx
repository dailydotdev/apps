import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  MailIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';
import Alert, {
  AlertParagraph,
  AlertType,
} from '@dailydotdev/shared/src/components/widgets/Alert';
import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  ADD_USER_COMPANY_MUTATION,
  REMOVE_USER_COMPANY_MUTATION,
} from '@dailydotdev/shared/src/graphql/users';
import { ClientError } from 'graphql-request';
import { labels } from '@dailydotdev/shared/src/lib';
import { UserCompany } from '@dailydotdev/shared/src/lib/userCompany';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useUserCompaniesQuery } from '@dailydotdev/shared/src/hooks/userCompany';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import AccountContentSection from '../../AccountContentSection';
import {
  AccountSecurityDisplay as Display,
  AccountTextField,
} from '../../common';

export interface VerifiedCompanyBadgeSectionProps {
  onSwitchDisplay: (display: Display) => void;
  workEmail: string;
  setWorkEmail: (email: string) => void;
}

export const VerifiedCompanyBadgeSection = ({
  onSwitchDisplay,
  workEmail,
  setWorkEmail,
}: VerifiedCompanyBadgeSectionProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { userCompanies } = useUserCompaniesQuery();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const userCompanyVerified = !!userCompanies?.[0]?.company;
  const userCompanyInReview = !userCompanyVerified && userCompanies?.length > 0;
  const [submitWorkEmailHint, setSubmitWorkEmailHint] = useState<string>();

  const { mutate: onSubmitWorkEmail, isLoading } = useMutation(
    (email: string) => gqlClient.request(ADD_USER_COMPANY_MUTATION, { email }),
    {
      onSuccess: () => {
        onSwitchDisplay(Display.ChangeEmail);
      },
      onError: (err) => {
        const clientError = err as ClientError;
        const message = clientError?.response?.errors?.[0]?.message;
        if (message) {
          setSubmitWorkEmailHint(message);
        } else {
          displayToast(labels.error.generic);
        }
      },
    },
  );

  const { mutate: removeUserCompany } = useMutation(
    (email: string) =>
      gqlClient.request(REMOVE_USER_COMPANY_MUTATION, { email }),
    {
      onSuccess: (_, email) => {
        queryClient.setQueryData<UserCompany[]>(
          generateQueryKey(RequestKey.UserCompanies, user),
          (currentUserCompanies) => {
            return currentUserCompanies?.filter(
              (userCompany) => userCompany.email !== email,
            );
          },
        );
      },
      onError: () => displayToast(labels.error.generic),
    },
  );

  const onDeleteUserCompany = async (email) => {
    if (
      await showPrompt({
        title: 'Delete company verification',
        description: 'Are you sure you want to delete this verified company?',
        okButton: {
          title: 'Yes, delete',
        },
      })
    ) {
      removeUserCompany(email);
    }
  };

  return (
    <AccountContentSection
      title="Verified company badge"
      description={
        !userCompanyVerified &&
        'Verify your work email and get a verified company badge on your profile. We won’t require any ID or personal information, just a verification code to complete the process.'
      }
    >
      {userCompanyVerified && (
        <div className="mt-6 max-w-sm">
          <ul>
            {userCompanies.map((userCompany) => (
              <li className="flex items-center gap-3" key={userCompany.email}>
                <ProfilePicture
                  user={{
                    image: userCompany.company.image,
                    id: userCompany.company.name,
                  }}
                  rounded="full"
                />
                <div className="flex-1">
                  <Typography type={TypographyType.Callout}>
                    {userCompany.company.name}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {userCompany.email}
                    <Typography
                      className="ml-1"
                      color={TypographyColor.StatusSuccess}
                      tag={TypographyTag.Span}
                    >
                      Verified
                    </Typography>
                  </Typography>
                </div>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  onClick={() => onDeleteUserCompany(userCompany.email)}
                  icon={<TrashIcon />}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {userCompanyInReview && (
        <div className="mt-6 max-w-sm">
          <p className="text-text-tertiary typo-footnote">
            {userCompanies[0].email}{' '}
            <span className="ml-1 text-accent-bun-default">In review</span>
          </p>
          <Alert
            className="mt-6"
            type={AlertType.Success}
            flexDirection="flex-row"
          >
            <AlertParagraph className="!mt-0 flex-1">
              Your work email has been verified. We’re currently reviewing your
              company details. Your badge will be added once the review is
              complete, and you’ll be notified when it’s live.
            </AlertParagraph>
          </Alert>
        </div>
      )}
      {!userCompanyVerified && !userCompanyInReview && (
        <>
          <AccountTextField
            leftIcon={<MailIcon />}
            label="Work email"
            inputId="workmail"
            name="workmail"
            placeholder="Work email"
            value={workEmail}
            valueChanged={setWorkEmail}
            type="email"
            valid={!submitWorkEmailHint}
            onChange={() => submitWorkEmailHint && setSubmitWorkEmailHint('')}
            actionButton={
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                icon={<ArrowIcon className="rotate-90" />}
                type="button"
                loading={isLoading}
                disabled={!workEmail && !!submitWorkEmailHint}
                onClick={() => onSubmitWorkEmail(workEmail)}
              />
            }
          />
          {submitWorkEmailHint && (
            <Alert
              className="mt-6 max-w-sm"
              type={AlertType.Error}
              flexDirection="flex-row"
            >
              <AlertParagraph className="!mt-0 flex-1">
                {submitWorkEmailHint}
              </AlertParagraph>
            </Alert>
          )}
        </>
      )}
    </AccountContentSection>
  );
};
