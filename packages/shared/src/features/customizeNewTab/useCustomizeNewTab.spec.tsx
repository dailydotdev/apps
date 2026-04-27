import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ActionType } from '../../graphql/actions';
import { NEW_USER_WINDOW_DAYS, useCustomizeNewTab } from './useCustomizeNewTab';

const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockUseAuthContext = jest.fn();
const mockUseOnboardingActions = jest.fn();
const mockUseCustomizerOpenRequest = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    checkHasCompleted: mockCheckHasCompleted,
    completeAction: mockCompleteAction,
    isActionsFetched: true,
  }),
}));

jest.mock('../../hooks/auth/useOnboardingActions', () => ({
  useOnboardingActions: () => mockUseOnboardingActions(),
}));

jest.mock('./store/customizerOpenRequest.store', () => ({
  useCustomizerOpenRequest: () => mockUseCustomizerOpenRequest(),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const renderUseCustomizeNewTab = () =>
  renderHook(() => useCustomizeNewTab(), { wrapper: Wrapper });

const setOnboardingReady = (overrides = {}) => {
  mockUseOnboardingActions.mockReturnValue({
    isOnboardingActionsReady: true,
    isOnboardingComplete: true,
    ...overrides,
  });
};

describe('useCustomizeNewTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: null });
    setOnboardingReady();
    mockCheckHasCompleted.mockReturnValue(false);
    mockUseCustomizerOpenRequest.mockReturnValue(0);
  });

  it('does not render until onboarding actions are ready', () => {
    setOnboardingReady({ isOnboardingActionsReady: false });
    const { result } = renderUseCustomizeNewTab();
    expect(result.current.shouldRender).toBe(false);
  });

  it('does not render until onboarding is complete', () => {
    setOnboardingReady({ isOnboardingComplete: false });
    const { result } = renderUseCustomizeNewTab();
    expect(result.current.shouldRender).toBe(false);
  });

  it('renders for any user once onboarding is complete', () => {
    const { result } = renderUseCustomizeNewTab();
    expect(result.current.shouldRender).toBe(true);
  });

  it('treats users created within the new-user window as first session', () => {
    const recent = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (NEW_USER_WINDOW_DAYS - 1),
    );
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: recent.toISOString() },
    });

    const { result } = renderUseCustomizeNewTab();
    expect(result.current.isFirstSession).toBe(true);
  });

  it('does not treat users older than the new-user window as first session', () => {
    const old = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (NEW_USER_WINDOW_DAYS + 1),
    );
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: old.toISOString() },
    });

    const { result } = renderUseCustomizeNewTab();
    expect(result.current.isFirstSession).toBe(false);
  });

  it('flips isFirstSession off once the user has dismissed the customizer', () => {
    const recent = new Date(Date.now() - 1000 * 60 * 60 * 24);
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: recent.toISOString() },
    });
    mockCheckHasCompleted.mockImplementation(
      (action) => action === ActionType.DismissedNewTabCustomizer,
    );

    const { result } = renderUseCustomizeNewTab();
    expect(result.current.isFirstSession).toBe(false);
  });

  it('auto-opens on first visit for first-session users', () => {
    const recent = new Date(Date.now() - 1000 * 60);
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: recent.toISOString() },
    });

    const { result } = renderUseCustomizeNewTab();
    expect(result.current.isOpen).toBe(true);
  });

  it('does not auto-open returning users', () => {
    const old = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (NEW_USER_WINDOW_DAYS + 5),
    );
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: old.toISOString() },
    });

    const { result } = renderUseCustomizeNewTab();
    expect(result.current.isOpen).toBe(false);
  });

  it('records DismissedNewTabCustomizer once on close and skips on re-close', () => {
    const recent = new Date(Date.now() - 1000 * 60);
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: recent.toISOString() },
    });

    const { result, rerender } = renderUseCustomizeNewTab();

    act(() => {
      result.current.close();
    });
    expect(mockCompleteAction).toHaveBeenCalledTimes(1);
    expect(mockCompleteAction).toHaveBeenCalledWith(
      ActionType.DismissedNewTabCustomizer,
    );

    mockCheckHasCompleted.mockImplementation(
      (action) => action === ActionType.DismissedNewTabCustomizer,
    );
    rerender();

    act(() => {
      result.current.close();
    });
    // hasDismissed becomes true after the first close, so the second close
    // must not re-record the action.
    expect(mockCompleteAction).toHaveBeenCalledTimes(1);
  });

  it('opens on subsequent open requests but ignores the initial counter value', () => {
    mockUseCustomizerOpenRequest.mockReturnValue(2);

    const { result, rerender } = renderUseCustomizeNewTab();
    expect(result.current.isOpen).toBe(false);

    mockUseCustomizerOpenRequest.mockReturnValue(3);
    rerender();
    expect(result.current.isOpen).toBe(true);
  });

  it('flips hasSettledInitialOpen to true on the next animation frame', async () => {
    // The settle flag drives whether downstream chrome (panel slide,
    // header width, feed padding, scroll-to-top wrapper) animates on
    // first paint. It must start `false` so first-paint snaps into place,
    // then flip `true` so subsequent open/close transitions animate.
    const recent = new Date(Date.now() - 1000 * 60);
    mockUseAuthContext.mockReturnValue({
      user: { createdAt: recent.toISOString() },
    });

    const { result } = renderUseCustomizeNewTab();
    // jsdom polyfills `requestAnimationFrame` via `setTimeout(0)`, so the
    // settle flag flips on the next microtask flush.
    await waitFor(() =>
      expect(result.current.hasSettledInitialOpen).toBe(true),
    );
  });
});
