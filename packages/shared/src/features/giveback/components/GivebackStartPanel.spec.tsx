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
const onJoin = jest.fn();
const onTakeAction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

const renderPanel = (
  user: LoggedUser | null,
  { hasSelectedCauses = false, isResolving = false } = {},
) => {
  mockUseAuthContext.mockReturnValue({
    user,
    showLogin,
  } as unknown as ReturnType<typeof useAuthContext>);

  return render(
    <GivebackStartPanel
      isResolving={isResolving}
      hasSelectedCauses={hasSelectedCauses}
      onJoin={onJoin}
      onTakeAction={onTakeAction}
    />,
  );
};

it('prompts login for logged-out visitors without joining or logging', () => {
  renderPanel(null);

  fireEvent.click(screen.getByRole('button', { name: 'Join the campaign' }));

  expect(showLogin).toHaveBeenCalledWith({ trigger: AuthTriggers.Giveback });
  // Neither the join event nor the reveal should fire when login opens instead.
  expect(logEvent).not.toHaveBeenCalled();
  expect(onJoin).not.toHaveBeenCalled();
});

it('logs the join event and reveals causes for authenticated visitors', () => {
  renderPanel({ id: 'u1' } as LoggedUser);

  fireEvent.click(screen.getByRole('button', { name: 'Join the campaign' }));

  expect(showLogin).not.toHaveBeenCalled();
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickJoinGiveback,
  });
  expect(onJoin).toHaveBeenCalled();
});

it('jumps onboarded visitors to the action tab without re-joining', () => {
  renderPanel({ id: 'u1' } as LoggedUser, { hasSelectedCauses: true });

  fireEvent.click(screen.getByRole('button', { name: 'Take action' }));

  expect(onTakeAction).toHaveBeenCalled();
  expect(onJoin).not.toHaveBeenCalled();
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickGivebackTakeAction,
    extra: JSON.stringify({ origin: 'hero' }),
  });
});

it('renders an empty CTA while resolving so its copy cannot flip mid-click', () => {
  renderPanel({ id: 'u1' } as LoggedUser, {
    hasSelectedCauses: true,
    isResolving: true,
  });

  // No copy is shown until the onboarding state resolves, and acting on the
  // empty button does nothing yet.
  expect(screen.queryByText('Take action')).not.toBeInTheDocument();
  expect(screen.queryByText('Join the campaign')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button'));
  expect(onTakeAction).not.toHaveBeenCalled();
});
