import { useRouter } from 'next/router';
import React, { ReactElement, useContext } from 'react';
import { useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import useProfileForm from '../../hooks/useProfileForm';
import { useToastNotification } from '../../hooks/useToastNotification';
import useWindowEvents from '../../hooks/useWindowEvents';
import {
  AuthEvent,
  AuthFlow,
  ErrorData,
  ErrorEvent,
  getKratosError,
  getKratosFlow,
  KRATOS_ERROR,
} from '../../lib/kratos';
import { StyledModal } from '../modals/StyledModal';
import IncompleteRegistrationModal from './IncompleteRegistrationModal';
import {
  SocialRegistrationForm,
  SocialRegistrationFormValues,
} from './SocialRegistrationForm';

function AccountCompletionModals(): ReactElement {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user, shouldShowLogin, logout, refetchBoot } =
    useContext(AuthContext);
  const {
    updateUserProfile,
    hint,
    onUpdateHint,
    isLoading: isProfileUpdateLoading,
  } = useProfileForm({
    onSuccess: () => refetchBoot(),
  });
  const onUpdateProfile = ({ name, username }: SocialRegistrationFormValues) =>
    updateUserProfile({ name, username });

  const displayErrorMessage = (text: string) => {
    displayToast(text);
    window.history.replaceState(null, '', '/');
  };

  useQuery(
    [{ type: 'login', flow: router?.query.flow as string }],
    ({ queryKey: [{ flow }] }) => getKratosFlow(AuthFlow.Recovery, flow),
    {
      enabled: !!router?.query.recovery && !!router?.query.flow,
      onSuccess: (data) => {
        if ('error' in data) {
          const errorData = data as unknown as ErrorData;
          displayErrorMessage(errorData.error.message);
          return;
        }

        if (!data?.ui?.messages?.length) {
          return;
        }

        const error =
          data.ui.messages.find(
            (message) => message.id === KRATOS_ERROR.INVALID_TOKEN,
          ) || data.ui.messages[0];
        displayErrorMessage(error.text);
      },
    },
  );

  useWindowEvents<ErrorEvent>('message', AuthEvent.Error, async (e) => {
    if (!e.data?.id) {
      return;
    }

    const res = await getKratosError(e.data.id);

    if (!res?.error) {
      return;
    }

    displayToast(res.error.message);
  });

  return (
    <>
      {!shouldShowLogin && user && user?.timezone && (
        <IncompleteRegistrationModal isOpen />
      )}
      {!shouldShowLogin && user && !user.infoConfirmed && (
        <StyledModal isOpen onRequestClose={() => logout()}>
          <SocialRegistrationForm
            className="mb-6"
            title="Complete your profile information"
            onSignup={onUpdateProfile}
            hints={hint}
            isLoading={isProfileUpdateLoading}
            onUpdateHints={onUpdateHint}
          />
        </StyledModal>
      )}
    </>
  );
}

export default AccountCompletionModals;
