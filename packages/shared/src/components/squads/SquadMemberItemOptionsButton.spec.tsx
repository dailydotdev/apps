import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mocked } from 'ts-jest/utils';
import SquadMemberItemOptionsButton from './SquadMemberItemOptionsButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrompt } from '../../hooks/usePrompt';
import { useToastNotification } from '../../hooks';
import type { SourceMember, Squad } from '../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../graphql/sources';
import type { MenuItemProps } from '../dropdown/common';

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

jest.mock('../../hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...(jest.requireActual('../../hooks') as Iterable<unknown>),
  useToastNotification: jest.fn(),
}));

jest.mock('../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => children,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuOptions: ({ options }: { options: MenuItemProps[] }) => (
    <div>
      {options.map(({ label, action }) => (
        <button key={label} type="button" onClick={action}>
          {label}
        </button>
      ))}
    </div>
  ),
}));

describe('SquadMemberItemOptionsButton', () => {
  const showPrompt = jest.fn();
  const displayToast = jest.fn();
  const onDemoteSelf = jest.fn();
  const onUnblock = jest.fn();
  const onUpdateRole = jest.fn();

  const squad = {
    id: 'squad-1',
    name: 'Frontend',
    type: SourceType.Squad,
  } as unknown as Squad;

  const createMember = (role: SourceMemberRole) =>
    ({
      role,
      user: {
        id: 'user-1',
        name: 'Taylor',
        image: 'https://daily.dev/avatar.jpg',
        permalink: '/taylor',
      },
    } as unknown as SourceMember);

  beforeEach(() => {
    jest.clearAllMocks();

    mocked(useAuthContext).mockReturnValue({
      user: { id: 'user-1' },
    } as ReturnType<typeof useAuthContext>);
    mocked(usePrompt).mockReturnValue({
      showPrompt,
    } as unknown as ReturnType<typeof usePrompt>);
    mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
  });

  const renderComponent = (role: SourceMemberRole) =>
    render(
      <SquadMemberItemOptionsButton
        squad={squad}
        member={createMember(role)}
        onDemoteSelf={onDemoteSelf}
        onUnblock={onUnblock}
        onUpdateRole={onUpdateRole}
      />,
    );

  it('shows self demotion action for admins and runs the new mutation after confirmation', async () => {
    showPrompt.mockResolvedValue(true);
    onDemoteSelf.mockResolvedValue({ _: true });

    renderComponent(SourceMemberRole.Admin);

    await userEvent.click(
      screen.getByRole('button', { name: 'Become a member' }),
    );

    expect(showPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Become a member?',
        okButton: expect.objectContaining({ title: 'Become a member' }),
      }),
    );
    await waitFor(() => {
      expect(onDemoteSelf).toHaveBeenCalledWith('squad-1');
    });
    expect(displayToast).toHaveBeenCalledWith('You are now a member');
  });

  it('hides the self-action menu for regular members', () => {
    renderComponent(SourceMemberRole.Member);

    expect(
      screen.queryByRole('button', { name: 'Member options' }),
    ).not.toBeInTheDocument();
  });
});
