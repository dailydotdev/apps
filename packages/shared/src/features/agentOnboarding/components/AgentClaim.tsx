import type { MutableRefObject, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import AuthOptions from '../../../components/auth/AuthOptions';
import { providerMap } from '../../../components/auth/common';
import Logo, { LogoPosition } from '../../../components/Logo';
import { Loader } from '../../../components/Loader';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent } from '../../../lib/log';
import { settingsUrl } from '../../../lib/constants';
import { AUTH_RETURN_PATH_KEY } from '../../onboarding/lib/utils';
import type { AgentClaimInfo } from '../claim';
import {
  AgentClaimError,
  AgentClaimErrorCode,
  agentClaimQueryOptions,
  AgentClaimStatus,
  claimAgent,
} from '../claim';

const signupProviders = [providerMap.github, providerMap.google];

const setAuthReturnPath = (path?: string): void => {
  try {
    if (path) {
      window.sessionStorage.setItem(AUTH_RETURN_PATH_KEY, path);
    } else {
      window.sessionStorage.removeItem(AUTH_RETURN_PATH_KEY);
    }
  } catch {
    // The page works without it; only redirect-mode sign in loses its way back.
  }
};

const Card = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex w-full max-w-[30rem] flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
    <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
      {title}
    </Typography>
    {children}
  </div>
);

const UserCode = ({ code }: { code: string }): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-4">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      Check that this code matches the one your agent shows
    </Typography>
    <Typography bold type={TypographyType.Title1} className="tracking-widest">
      {code}
    </Typography>
  </div>
);

type AgentClaimProps = {
  code?: string;
};

export const AgentClaim = ({ code }: AgentClaimProps): ReactElement => {
  const { user, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const queryClient = useQueryClient();
  const [hasSignedUpHere, setHasSignedUpHere] = useState(false);
  const { data: claim, isPending: isClaimPending } = useQuery({
    ...agentClaimQueryOptions(code as string),
    enabled: !!code,
  });
  const {
    mutate: confirmClaim,
    isPending: isConfirming,
    isIdle,
    error,
  } = useMutation({
    mutationFn: () => claimAgent(code as string),
    onSuccess: (data) => {
      setAuthReturnPath();
      queryClient.setQueryData<AgentClaimInfo>(
        agentClaimQueryOptions(code as string).queryKey,
        (current) => ({ ...current, ...data }),
      );
      logEvent({
        event_name: LogEvent.ConfirmAgentClaim,
        target_id: claim?.client,
      });
    },
    onError: (err) => {
      logEvent({
        event_name: LogEvent.ErrorAgentClaim,
        target_id: err instanceof AgentClaimError ? err.code : undefined,
      });
    },
  });

  const isPendingClaim = claim?.status === AgentClaimStatus.Pending;
  const isProfileReady = !!user?.infoConfirmed;

  useLogEventOnce(
    () => ({ event_name: LogEvent.ViewAgentClaim, target_id: claim?.client }),
    { condition: !!claim },
  );

  useEffect(() => {
    if (!isPendingClaim || user) {
      return undefined;
    }

    setAuthReturnPath(`${window.location.pathname}${window.location.search}`);

    return () => setAuthReturnPath();
  }, [isPendingClaim, user]);

  // An account created on this page was created for this agent, so there is
  // nothing left to confirm once its profile is in place.
  useEffect(() => {
    if (hasSignedUpHere && isProfileReady && isPendingClaim && isIdle) {
      confirmClaim();
    }
  }, [hasSignedUpHere, isProfileReady, isPendingClaim, isIdle, confirmClaim]);

  const renderContent = (): ReactElement => {
    if (!code || claim?.status === AgentClaimStatus.Expired) {
      return (
        <Card title="This link has expired">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Ask your agent for a new one.
          </Typography>
        </Card>
      );
    }

    if (!isAuthReady || isClaimPending || !claim) {
      return <Loader />;
    }

    if (claim.status === AgentClaimStatus.Claimed) {
      return (
        <Card title="You're all set">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Head back to your agent, it will take it from here.
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            className="self-start"
            onClick={() => window.close()}
          >
            Back to agent
          </Button>
        </Card>
      );
    }

    if (error) {
      const isTokenLimit =
        error instanceof AgentClaimError &&
        error.code === AgentClaimErrorCode.TokenLimit;

      return (
        <Card title="We couldn't connect your agent">
          <Typography
            type={TypographyType.Callout}
            className="text-accent-ketchup-default"
          >
            {error.message}
          </Typography>
          {isTokenLimit && (
            <Button
              tag="a"
              href={`${settingsUrl}/api`}
              variant={ButtonVariant.Primary}
              className="self-start"
            >
              Manage API tokens
            </Button>
          )}
        </Card>
      );
    }

    if (!user) {
      return (
        <div className="flex w-full max-w-[30rem] flex-col gap-6">
          {claim.userCode && <UserCode code={claim.userCode} />}
          <AuthOptions
            formRef={null as unknown as MutableRefObject<HTMLFormElement>}
            trigger={AuthTriggers.AgentOnboarding}
            simplified
            preferGithub
            isLoginFlow={false}
            hideRegistrationHeadline
            signUpTitle="Create your account"
            logInTitle="Welcome back"
            signUpDescription="One click and you're done. Your agent sets up the rest."
            logInDescription="Log in to connect your agent to your account."
            signupProviders={signupProviders}
            socialSignupOnly
            onSuccessfulRegistration={() => setHasSignedUpHere(true)}
          />
        </div>
      );
    }

    if (hasSignedUpHere || isConfirming) {
      return <Loader />;
    }

    return (
      <Card title={`Connect this agent to @${user.username}?`}>
        {claim.userCode && <UserCode code={claim.userCode} />}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Your agent will be able to read and change your daily.dev account:
          feed, profile, settings, squads and follows. You can revoke its access
          anytime in your API settings.
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          className="self-start"
          onClick={() => confirmClaim()}
        >
          Connect
        </Button>
      </Card>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Logo
        position={LogoPosition.Relative}
        className="mb-10"
        logoClassName={{ container: 'h-8' }}
      />
      {renderContent()}
    </main>
  );
};
