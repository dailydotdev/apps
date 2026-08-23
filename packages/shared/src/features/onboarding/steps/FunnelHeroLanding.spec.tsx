import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { FunnelHeroLanding } from './FunnelHeroLanding';
import type { FunnelStepHeroLanding } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useOnboardingActions } from '../../../hooks/auth';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';

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
  }: {
    background?: string;
    children?: React.ReactNode;
  }) => (
    <div data-background={background} data-testid="signup-hero">
      {children}
    </div>
  ),
}));

jest.mock('../../../components/auth/AuthOptions', () => ({
  __esModule: true,
  default: ({ signupStyle }: { signupStyle?: string }) => (
    <div data-signup-style={signupStyle ?? 'none'} data-testid="auth-options" />
  ),
}));

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

    it('does not evaluate for an authenticated, confirmed user', () => {
      setAuth({ isLoggedIn: true, user: confirmedUser });

      renderStep();

      expect(shouldEvaluate()).toBe(false);
      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();
    });

    it('does not evaluate when onboarding is already complete', () => {
      setOnboardingActions({ isOnboardingComplete: true });

      renderStep();

      expect(shouldEvaluate()).toBe(false);
      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();
    });

    it('does not evaluate for a signed-in user until their actions land', () => {
      setAuth({
        isLoggedIn: true,
        user: { id: 'u2', infoConfirmed: false, providers: ['github'] },
      });
      setOnboardingActions({ isOnboardingActionsReady: false });

      renderStep();

      expect(shouldEvaluate()).toBe(false);
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

    it('holds a signed-in visit until its actions land, then skips the control', () => {
      setAuth({
        isLoggedIn: true,
        user: { id: 'u2', infoConfirmed: false, providers: ['github'] },
      });
      setOnboardingActions({ isOnboardingActionsReady: false });
      setFlag({ value: true });

      const { rerender } = renderStep('cards');

      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();

      setOnboardingActions({ isOnboardingActionsReady: true });
      rerender(
        <FunnelHeroLanding
          {...({
            id: 'hero',
            type: FunnelStepType.HeroLanding,
            isActive: true,
            parameters: { background: 'cards' },
            onTransition: jest.fn(),
          } as unknown as FunnelStepHeroLanding)}
        />,
      );

      expect(screen.getByTestId('signup-hero')).toHaveAttribute(
        'data-background',
        'horizon',
      );
    });

    it('gives up the hold when the actions request never resolves', () => {
      setAuth({
        isLoggedIn: true,
        user: { id: 'u3', infoConfirmed: false, providers: ['github'] },
      });
      setOnboardingActions({ isOnboardingActionsReady: false });

      renderStep('cards');

      expect(screen.queryByTestId('signup-hero')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Nothing may hold the funnel's entry screen indefinitely.
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
});
