import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackStartPanel } from './GivebackStartPanel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent } from '../../../lib/log';
import type { LoggedUser } from '../../../lib/user';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseLogContext = useLogContext as jest.MockedFunction<
  typeof useLogContext
>;

const showLogin = jest.fn();
const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

const renderPanel = (user: LoggedUser | null) => {
  mockUseAuthContext.mockReturnValue({
    user,
    showLogin,
  } as unknown as ReturnType<typeof useAuthContext>);

  return render(<GivebackStartPanel />);
};

it('prompts login for logged-out visitors without logging the join event', () => {
  renderPanel(null);

  fireEvent.click(screen.getByRole('button', { name: 'Join the campaign' }));

  expect(showLogin).toHaveBeenCalledWith({ trigger: AuthTriggers.Giveback });
  // The join event must not fire when the click only opens login.
  expect(logEvent).not.toHaveBeenCalled();
});

it('logs the join event for authenticated visitors', () => {
  renderPanel({ id: 'u1' } as LoggedUser);

  fireEvent.click(screen.getByRole('button', { name: 'Join the campaign' }));

  expect(showLogin).not.toHaveBeenCalled();
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickJoinGiveback,
  });
});
