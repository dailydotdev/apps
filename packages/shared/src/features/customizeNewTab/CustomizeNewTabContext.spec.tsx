import type { ReactNode } from 'react';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  CustomizeNewTabProvider,
  useCustomizeNewTab,
} from './CustomizeNewTabContext';
import { ActionType } from '../../graphql/actions';

// Variables prefixed with `mock` are an exception to jest's out-of-scope rule
// for `jest.mock()` factories.
const mockCompletedActions = new Set<ActionType>();
const mockCompleteAction = jest.fn(async (type: ActionType) => {
  mockCompletedActions.add(type);
});
const mockUpdateFlag = jest.fn().mockResolvedValue(undefined);
let mockIsOnboardingComplete = true;
let mockIsExtension = true;
let mockFeatureFlagOn = true;

jest.mock('../../lib/func', () => {
  const actual = jest.requireActual('../../lib/func');
  return {
    ...actual,
    checkIsExtension: () => mockIsExtension,
    isExtension: true,
  };
});

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ isAuthReady: true, user: { id: 'u1' } }),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    isActionsFetched: true,
    actions: [],
    checkHasCompleted: (type: ActionType) => mockCompletedActions.has(type),
    completeAction: mockCompleteAction,
  }),
}));

jest.mock('../../hooks/auth/useOnboardingActions', () => ({
  useOnboardingActions: () => ({
    isOnboardingComplete: mockIsOnboardingComplete,
    isOnboardingActionsReady: true,
    shouldShowAuthBanner: false,
    completeStep: jest.fn(),
  }),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({ updateFlag: mockUpdateFlag }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({
    value: mockFeatureFlagOn,
    isLoading: false,
  }),
}));

const Probe = (): JSX.Element => {
  const ctx = useCustomizeNewTab();
  return (
    <div>
      <span data-testid="open">{String(ctx.isOpen)}</span>
      <span data-testid="first">{String(ctx.isFirstSession)}</span>
      <span data-testid="enabled">{String(ctx.isEnabled)}</span>
      <button type="button" onClick={() => ctx.open()}>
        open
      </button>
      <button type="button" onClick={() => ctx.close()}>
        done
      </button>
      <button type="button" onClick={() => ctx.reset()}>
        reset
      </button>
    </div>
  );
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <CustomizeNewTabProvider>{children}</CustomizeNewTabProvider>
);

beforeEach(() => {
  mockCompleteAction.mockClear();
  mockUpdateFlag.mockClear();
  mockCompletedActions.clear();
  mockIsOnboardingComplete = true;
  mockIsExtension = true;
  mockFeatureFlagOn = true;
});

describe('CustomizeNewTabContext', () => {
  it('auto-opens on first session', async () => {
    render(<Probe />, { wrapper });
    expect(screen.getByTestId('first')).toHaveTextContent('true');
    await act(async () => {});
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('enabled')).toHaveTextContent('true');
  });

  it('closing via Done completes the dismissal action exactly once', async () => {
    render(<Probe />, { wrapper });
    await act(async () => {});
    fireEvent.click(screen.getByText('done'));
    fireEvent.click(screen.getByText('done'));
    const dismissCalls = mockCompleteAction.mock.calls.filter(
      ([type]) => type === ActionType.DismissedNewTabCustomizer,
    );
    expect(dismissCalls).toHaveLength(1);
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('also marks the welcome seen on close so the hero does not re-show', async () => {
    render(<Probe />, { wrapper });
    await act(async () => {});
    fireEvent.click(screen.getByText('done'));
    expect(mockCompleteAction).toHaveBeenCalledWith(
      ActionType.SeenKeepItOverlay,
    );
  });

  it('does not auto-open when the user has already dismissed but still reports first session until the welcome is seen', async () => {
    mockCompletedActions.add(ActionType.DismissedNewTabCustomizer);
    render(<Probe />, { wrapper });
    await act(async () => {});
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    // Welcome should still show on the next manual open since the user
    // hasn't seen the welcome hero yet.
    expect(screen.getByTestId('first')).toHaveTextContent('true');
  });

  it('drops first session once the welcome has been seen', async () => {
    mockCompletedActions.add(ActionType.SeenKeepItOverlay);
    mockCompletedActions.add(ActionType.DismissedNewTabCustomizer);
    render(<Probe />, { wrapper });
    await act(async () => {});
    expect(screen.getByTestId('first')).toHaveTextContent('false');
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('reset writes Discover mode and clears focus schedule', async () => {
    render(<Probe />, { wrapper });
    await act(async () => {});
    fireEvent.click(screen.getByText('reset'));
    expect(mockUpdateFlag).toHaveBeenCalledWith('newTabMode', 'discover');
    expect(mockUpdateFlag).toHaveBeenCalledWith('focusSchedule', {
      pauseUntil: null,
      windows: {},
    });
  });

  it('escape key closes the panel and dismisses', async () => {
    render(<Probe />, { wrapper });
    await act(async () => {});
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(mockCompleteAction).toHaveBeenCalledWith(
      ActionType.DismissedNewTabCustomizer,
    );
  });

  it('skips the auto-open path on the webapp (non-extension)', async () => {
    mockIsExtension = false;
    render(<Probe />, { wrapper });
    await act(async () => {});
    expect(screen.getByTestId('first')).toHaveTextContent('false');
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('does not auto-open or report first session when the GrowthBook flag is off', async () => {
    mockFeatureFlagOn = false;
    render(<Probe />, { wrapper });
    await act(async () => {});
    expect(screen.getByTestId('first')).toHaveTextContent('false');
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('enabled')).toHaveTextContent('false');
  });
});
