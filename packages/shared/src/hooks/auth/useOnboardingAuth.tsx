import { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import type { AuthOptionsProps, AuthProps } from '../../components/auth/common';
import {
  getDefaultDisplay,
  isValidAction,
  OnboardingActions,
} from '../../components/auth/common';
import { AuthTriggers } from '../../lib/auth';
import { ExperimentWinner } from '../../lib/featureValues';
import { SIGNIN_METHOD_KEY } from './useSignBack';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingBoot } from '../../features/onboarding/hooks/useOnboardingBoot';
import { authAtom } from '../../features/onboarding/store/onboarding.store';
import { useViewSize, ViewSize } from '../useViewSize';
import { ButtonVariant, ButtonSize } from '../../components/buttons/common';

const useOnboardingAuth = () => {
  const formRef = useRef<HTMLFormElement>();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { isAuthReady, anonymous, loginState, isLoggedIn, user } =
    useAuthContext();
  const router = useRouter();
  const action = isValidAction(router.query.action) && router.query.action;
  const { data } = useOnboardingBoot();
  const [auth, setAuth] = useAtom(authAtom);
  const { isLoginFlow, defaultDisplay } = auth;
  const updateAuth = useCallback(
    (props: Partial<AuthProps>) => {
      setAuth((prev) => ({ ...prev, ...props }));
    },
    [setAuth],
  );

  // Update the Jotai auth state based on the login state and anonymous user
  useEffect(() => {
    const email = loginState?.formValues?.email || anonymous?.email;
    const shouldVerify = anonymous?.shouldVerify;
    const isLogin = loginState?.isLogin;
    const isRequiredAuth = !(isLoggedIn && !shouldVerify);
    const hasLoginState =
      !!loginState?.formValues?.email || loginState?.isLogin;
    const wasLoggedInBefore = !!storage.getItem(SIGNIN_METHOD_KEY);

    if (!isAuthReady) {
      return;
    }

    updateAuth({
      defaultDisplay: getDefaultDisplay({ isLogin, shouldVerify, action }),
      email,
      isAuthenticating:
        isRequiredAuth &&
        (!!action || shouldVerify || wasLoggedInBefore || hasLoginState),
      isLoading: !isAuthReady,
      isLoginFlow: loginState?.isLogin || action === OnboardingActions.Login,
    });
  }, [
    action,
    anonymous?.email,
    anonymous?.shouldVerify,
    isAuthReady,
    isLoggedIn,
    loginState?.formValues?.email,
    loginState?.isLogin,
    updateAuth,
  ]);

  const authOptionProps: AuthOptionsProps = useMemo(
    () => ({
      simplified: true,
      className: {
        container: classNames(
          'w-full rounded-none tablet:max-w-[30rem]',
          auth.isAuthenticating ? 'h-full' : 'max-w-full',
        ),
        onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
      },
      trigger: loginState?.trigger || AuthTriggers.Onboarding,
      formRef,
      defaultDisplay,
      initialEmail: auth.email,
      isLoginFlow,
      targetId: ExperimentWinner.OnboardingV4,
      onSuccessfulRegistration: () => updateAuth({ isAuthenticating: false }),
      onAuthStateUpdate: (props: AuthProps) =>
        updateAuth({ isAuthenticating: true, ...props }),
      onboardingSignupButton: {
        size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
        variant: ButtonVariant.Primary,
      },
    }),
    [
      auth.email,
      defaultDisplay,
      auth.isAuthenticating,
      isLoginFlow,
      isMobile,
      loginState?.trigger,
      updateAuth,
    ],
  );

  return {
    auth,
    authOptionProps,
    funnelState: data?.funnelState,
    isAuthReady,
    isAuthenticating: auth.isAuthenticating,
    updateAuth,
    onboardingCompleted: user?.flags?.onboardingCompleted,
  };
};

export default useOnboardingAuth;
