import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import type { MenuItemProps } from '../dropdown/common';
import type { Boot } from '../../lib/boot';
import { BOOT_QUERY_KEY } from '../../contexts/common';
import { SourcePermissions } from '../../graphql/sources';
import { deleteSquad } from '../../graphql/squads';
import { PROMPT_KEY } from '../../hooks/usePrompt';
import { PromptElement } from '../modals/Prompt';
import SquadHeaderMenu from './SquadHeaderMenu';

const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

jest.mock('../../graphql/squads', () => ({
  ...(jest.requireActual('../../graphql/squads') as Record<string, unknown>),
  deleteSquad: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    isLoggedIn: true,
  }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({
    logEvent: jest.fn(),
  }),
}));

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: jest.fn(),
  }),
}));

jest.mock('../../hooks/useSquadInvitation', () => ({
  useSquadInvitation: () => ({
    logAndCopyLink: jest.fn(),
  }),
}));

jest.mock('../../hooks/contentPreference/useContentPreference', () => ({
  useContentPreference: () => ({
    follow: jest.fn(),
    unfollow: jest.fn(),
  }),
}));

jest.mock('../../hooks', () => ({
  ...(jest.requireActual('../../hooks') as Record<string, unknown>),
  useLeaveSquad: () => jest.fn(),
  useSquadNavigation: () => ({
    editSquad: jest.fn(),
  }),
}));

jest.mock('../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuOptions: ({ options }: { options: MenuItemProps[] }) => (
    <div>
      {options.map(({ label, action }) => (
        <button key={label} onClick={action} type="button">
          {label}
        </button>
      ))}
    </div>
  ),
}));

const mockedDeleteSquad = jest.mocked(deleteSquad);

describe('SquadHeaderMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the delete prompt visible while the delete request is pending', async () => {
    const squad = generateTestSquad({
      currentMember: {
        ...generateTestSquad().currentMember!,
        permissions: [SourcePermissions.Delete],
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData<Boot>(BOOT_QUERY_KEY, { squads: [squad] } as Boot);
    mockedDeleteSquad.mockReturnValue(new Promise(() => undefined));

    render(
      <QueryClientProvider client={queryClient}>
        <SquadHeaderMenu squad={squad} />
        <PromptElement ariaHideApp={false} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(queryClient.getQueryState(PROMPT_KEY)?.fetchStatus).toBe('idle'),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete Squad' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, delete Squad' }),
    );

    const promptButton = screen.getByRole('button', {
      name: 'Yes, delete Squad',
    });
    expect(promptButton).toHaveAttribute('aria-busy', 'true');
    expect(promptButton).toBeDisabled();
    expect(screen.getByText(`Delete ${squad.name}`)).toBeInTheDocument();
  });
});
