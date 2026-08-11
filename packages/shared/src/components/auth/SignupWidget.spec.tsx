import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SignupWidget } from './SignupWidget';
import { AuthDisplay } from './common';
import { AuthTriggers } from '../../lib/auth';
import { useAuthContext } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

/* The real form is the whole auth stack. What this file is about is the handoff
   it makes to the modal, so the mock stands in for the two ways out of it. */
jest.mock('./AuthOptions', () => ({
  __esModule: true,
  default: ({
    trigger,
    onAuthStateUpdate,
  }: {
    trigger: string;
    onAuthStateUpdate?: (props: Record<string, unknown>) => void;
  }) => {
    const { AuthDisplay: Display } = jest.requireActual('./common');

    return (
      <div>
        <span data-testid="trigger">{trigger}</span>
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
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({
              isAuthenticating: true,
              isLoginFlow: true,
              email: 'ido@daily.dev',
            })
          }
        >
          Existing email
        </button>
      </div>
    );
  },
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const showLogin = jest.fn();

beforeEach(() => {
  showLogin.mockReset();
  mockUseAuthContext.mockReturnValue({ showLogin } as never);
});

const renderWidget = () =>
  render(
    <SignupWidget
      title="Build your world"
      description="Every article you read grows the world."
      trigger={AuthTriggers.World}
    />,
  );

it('hands the inline form the surface that asked for it', () => {
  renderWidget();

  expect(screen.getByTestId('trigger')).toHaveTextContent(AuthTriggers.World);
});

it('keeps the surface trigger and the signup screen on the way to the modal', () => {
  renderWidget();

  fireEvent.click(screen.getByText('Continue with email'));

  expect(showLogin).toHaveBeenCalledWith({
    trigger: AuthTriggers.World,
    options: {
      isLogin: false,
      defaultDisplay: AuthDisplay.Registration,
      formValues: undefined,
    },
  });
});

it('carries an existing reader over to the login screen with their email', () => {
  renderWidget();

  fireEvent.click(screen.getByText('Existing email'));

  expect(showLogin).toHaveBeenCalledWith({
    trigger: AuthTriggers.World,
    options: {
      isLogin: true,
      defaultDisplay: undefined,
      formValues: { email: 'ido@daily.dev' },
    },
  });
});
