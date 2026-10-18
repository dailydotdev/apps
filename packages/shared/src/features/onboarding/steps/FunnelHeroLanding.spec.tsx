import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { FunnelHeroLanding } from './FunnelHeroLanding';
import type { FunnelStepHeroLanding } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useOnboardingActions } from '../../../hooks/auth';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { AuthDisplay } from '../../../components/auth/common';

// Evaluating the flag is what fires the allocation POST, so `shouldEvaluate`
// is the assertion target throughout.

jest.mock('../../../hooks/useConditionalFeature');
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../hooks/auth');
jest.mock('../shared/FunnelStepDots');
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: jest.fn().mockReturnValue(false),
}));

jest.mock('../components/OnboardingSignupHero', () => ({
  OnboardingSignupHero: ({
    background,
    children,
    onBack,
  }: {
    background?: string;
    children?: React.ReactNode;
    onBack?: () => void;
  }) => (
    <div data-background={background} data-testid="signup-hero">
      {onBack && (
        <button type="button" onClick={onBack}>
          Go back
        </button>
      )}
      {children}
    </div>
  ),
}));

jest.mock('../../../components/auth/AuthOptions', () => {
  const { AuthDisplay: Display } = jest.requireActual(
    '../../../components/auth/common',
  );

  const MockAuthOptions = ({
    signupStyle,
    defaultDisplay,
    forceDefaultDisplay,
    onAuthStateUpdate,
  }: {
    signupStyle?: string;
    defaultDisplay?: string;
    forceDefaultDisplay?: boolean;
    onAuthStateUpdate?: (props: Record<string, unknown>) => void;
  }) => {
    return (
      <div
        data-default-display={defaultDisplay}
        data-force-default-display={String(!!forceDefaultDisplay)}
        data-signup-style={signupStyle ?? 'none'}
        data-testid="auth-options"
      >
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({
              isAuthenticating: true,
              defaultDisplay: Display.Registration,
            })
          }
        >
          Continue with email
        </button>
      </div>
    );
  };

  return { __esModule: true, default: MockAuthOptions };
});

const mockUseConditionalFeature = jest.mocked(useConditionalFeature);
const mockUseAuthContext = jest.mocked(useAuthContext);
const mockUseOnboardingActions = jest.mocked(useOnboardingActions);
const mockUseIsOnboardingFunnel = jest.mocked(useIsOnboardingFunnel);

const anonymousUser = { firstVisit: '2026-01-01' };
const confirmedUser = { id: 'u1', infoConfirmed: true, providers: ['google'] };

type AuthState = {
  isAuthReady?: boolean;
  isLoggedIn?: boolean;
  user?: unknown;
};

const setAuth = ({
  isAuthReady = true,
  isLoggedIn = false,
  user = anonymousUser,
}: AuthState = {}) => {
  mockUseAuthContext.mockReturnValue({
    isAuthReady,
    isLoggedIn,
    user,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const setOnboardingActions = ({
  isOnboardingActionsReady = true,
  isOnboardingComplete = false,
} = {}) => {
  mockUseOnboardingActions.mockReturnValue({
    isOnboardingActionsReady,
    isOnboardingComplete,
    shouldShowAuthBanner: false,
    completeStep: jest.fn(),
  });
};

const setFlag = ({ value = false, isLoading = false } = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockUseConditionalFeature.mockReturnValue({ value, isLoading } as any);
};

const shouldEvaluate = (): boolean =>
  mockUseConditionalFeature.mock.calls.at(-1)?.[0]?.shouldEvaluate ?? false;

const renderStep = (background = 'cards') =>
  render(
    <FunnelHeroLanding
      {...({
        id: 'hero',
        type: FunnelStepType.HeroLanding,
        isActive: true,
        parameters: { background },
        onTransition: jest.fn(),
      } as unknown as FunnelStepHeroLanding)}
    />,
  );

describe('FunnelHeroLanding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuth();
    setOnboardingActions();
    setFlag();
    mockUseIsOnboardingFunnel.mockReturnValue(true);
  });

  describe('experiment enrollment', () => {
    it('evaluates the flag for an anonymous visitor who sees the wall', () => {
      renderStep();

      expect(shouldEvaluate()).toBe(true);
      expect(screen.getByTestId('signup-hero')).toBeInTheDocument();
    });

    it('evaluates for signed-in visitors too — no special-casing', () => {
      setAuth({
        isLoggedIn: true,
        user: { id: 'u2', infoConfirmed: false, providers: ['github'] },
      });

      renderStep();

      expect(shouldEvaluate()).toBe(true);
      expect(screen.getByTestId('signup-hero')).toBeInTheDocument();
    });

    it('still transitions a confirmed user past the step without a wall', () => {
      setAuth({ isLoggedIn: true, user: confirmedUser });

      renderStep();

      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();
    });

    it('does not evaluate before auth is ready', () => {
      setAuth({ isAuthReady: false });

      renderStep();

      expect(shouldEvaluate()).toBe(false);
    });

    it('does not evaluate on the paid funnel', () => {
      mockUseIsOnboardingFunnel.mockReturnValue(false);

      renderStep();

      expect(shouldEvaluate()).toBe(false);
    });
  });

  describe('flag hold', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('holds the wall while the flag is resolving, then falls back to the served one', () => {
      setFlag({ isLoading: true });

      renderStep('cards');

      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(screen.getByTestId('signup-hero')).toHaveAttribute(
        'data-background',
        'cards',
      );
    });

    it('holds signed-in visits the same way, then falls back', () => {
      setAuth({
        isLoggedIn: true,
        user: { id: 'u3', infoConfirmed: false, providers: ['github'] },
      });
      setFlag({ isLoading: true });

      renderStep('cards');

      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(screen.getByTestId('signup-hero')).toHaveAttribute(
        'data-background',
        'cards',
      );
    });

    it('never holds a visit that is not being enrolled', () => {
      mockUseIsOnboardingFunnel.mockReturnValue(false);
      setFlag({ isLoading: true });

      renderStep('cards');

      expect(screen.getByTestId('signup-hero')).toBeInTheDocument();
    });
  });

  describe('wall selection', () => {
    it('overrides the served background when the flag is on', () => {
      setFlag({ value: true });

      renderStep('cards');

      expect(screen.getByTestId('signup-hero')).toHaveAttribute(
        'data-background',
        'horizon',
      );
      expect(screen.getByTestId('auth-options')).toHaveAttribute(
        'data-signup-style',
        'singlePrimary',
      );
    });

    it('leaves the served wall alone when the flag is off', () => {
      renderStep('panel');

      expect(screen.getByTestId('signup-hero')).toHaveAttribute(
        'data-background',
        'panel',
      );
      expect(screen.getByTestId('auth-options')).toHaveAttribute(
        'data-signup-style',
        'splitCreateAccount',
      );
    });
  });

  describe('way back to the providers', () => {
    it('offers it only on the email form and returns to the provider list', () => {
      renderStep();

      expect(screen.getByTestId('auth-options')).toHaveAttribute(
        'data-force-default-display',
        'true',
      );
      expect(
        screen.queryByRole('button', { name: 'Go back' }),
      ).not.toBeInTheDocument();

      act(() => {
        screen.getByRole('button', { name: 'Continue with email' }).click();
      });

      expect(screen.getByTestId('auth-options')).toHaveAttribute(
        'data-default-display',
        AuthDisplay.Registration,
      );

      act(() => {
        screen.getByRole('button', { name: 'Go back' }).click();
      });

      expect(screen.getByTestId('auth-options')).toHaveAttribute(
        'data-default-display',
        AuthDisplay.OnboardingSignup,
      );
      expect(
        screen.queryByRole('button', { name: 'Go back' }),
      ).not.toBeInTheDocument();
    });

    it('stays off outside the onboarding funnel', () => {
      mockUseIsOnboardingFunnel.mockReturnValue(false);
      renderStep();

      act(() => {
        screen.getByRole('button', { name: 'Continue with email' }).click();
      });

      expect(
        screen.queryByRole('button', { name: 'Go back' }),
      ).not.toBeInTheDocument();
    });
  });
});
