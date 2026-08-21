import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTestSquad } from '../../__tests__/fixture/squads';
import type { Squad } from '../graphql/sources';
import { BOOT_QUERY_KEY } from '../contexts/common';
import type { Boot } from '../lib/boot';
import { TOAST_NOTIF_KEY } from './useToastNotification';
import { DEFAULT_ERROR } from '../graphql/common';
import { PromptElement } from '../components/modals/Prompt';
import { useDeleteSquad } from './useDeleteSquad';
import { deleteSquad } from '../graphql/squads';
import { PROMPT_KEY } from './usePrompt';

jest.mock('../graphql/squads', () => ({
  deleteSquad: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: () => ({
    logEvent: jest.fn(),
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
  }),
}));

const mockedDeleteSquad = jest.mocked(deleteSquad);

const createDeferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
};

const renderDeleteSquad = (squad: Squad, callback = jest.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData<Boot>(BOOT_QUERY_KEY, {
    squads: [squad, generateTestSquad({ id: 'other-squad' })],
  } as Boot);

  const TestComponent = () => {
    const { isPending, onDeleteSquad } = useDeleteSquad({ callback, squad });

    return (
      <>
        <button
          aria-busy={isPending}
          disabled={isPending}
          onClick={onDeleteSquad}
          type="button"
        >
          Delete Squad
        </button>
        <PromptElement ariaHideApp={false} />
      </>
    );
  };

  render(
    <QueryClientProvider client={queryClient}>
      <TestComponent />
    </QueryClientProvider>,
  );

  return { callback, queryClient };
};

const waitForPromptReady = (queryClient: QueryClient) =>
  waitFor(() =>
    expect(queryClient.getQueryState(PROMPT_KEY)?.fetchStatus).toBe('idle'),
  );

describe('useDeleteSquad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps delete actions pending until delete completes, then prunes boot cache and calls callback once', async () => {
    const squad = generateTestSquad();
    const deferred = createDeferred();
    mockedDeleteSquad.mockReturnValue(deferred.promise);
    const { callback, queryClient } = renderDeleteSquad(squad);
    await waitForPromptReady(queryClient);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Squad' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, delete Squad' }),
    );

    const dangerZoneButton = screen.getByRole('button', {
      name: 'Delete Squad',
    });
    const promptButton = screen.getByRole('button', {
      name: 'Yes, delete Squad',
    });

    await waitFor(() => {
      expect(dangerZoneButton).toHaveAttribute('aria-busy', 'true');
      expect(dangerZoneButton).toBeDisabled();
    });
    expect(promptButton).toHaveAttribute('aria-busy', 'true');
    expect(promptButton).toBeDisabled();

    await userEvent.click(promptButton);
    expect(mockedDeleteSquad).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
    expect(
      queryClient
        .getQueryData<Boot>(BOOT_QUERY_KEY)
        ?.squads.map((item) => item.id),
    ).toEqual(['other-squad']);
  });

  it('shows an error toast and does not prune cache or call callback when delete fails', async () => {
    const squad = generateTestSquad();
    const deferred = createDeferred();
    mockedDeleteSquad.mockReturnValue(deferred.promise);
    const { callback, queryClient } = renderDeleteSquad(squad);
    await waitForPromptReady(queryClient);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Squad' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, delete Squad' }),
    );

    await act(async () => {
      deferred.reject(new Error('failed'));
      await deferred.promise.catch(() => undefined);
    });

    await waitFor(() =>
      expect(queryClient.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
        message: DEFAULT_ERROR,
      }),
    );
    expect(callback).not.toHaveBeenCalled();
    expect(
      queryClient
        .getQueryData<Boot>(BOOT_QUERY_KEY)
        ?.squads.map((item) => item.id),
    ).toEqual([squad.id, 'other-squad']);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Yes, delete Squad' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('does not report a failure when the post-delete callback rejects', async () => {
    const squad = generateTestSquad();
    mockedDeleteSquad.mockResolvedValue(undefined);
    const callback = jest.fn().mockRejectedValue(new Error('Route Cancelled'));
    const { queryClient } = renderDeleteSquad(squad, callback);
    await waitForPromptReady(queryClient);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Squad' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, delete Squad' }),
    );

    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Yes, delete Squad' }),
      ).not.toBeInTheDocument(),
    );
    expect(queryClient.getQueryData(TOAST_NOTIF_KEY)).toBeUndefined();
    expect(
      queryClient
        .getQueryData<Boot>(BOOT_QUERY_KEY)
        ?.squads.map((item) => item.id),
    ).toEqual(['other-squad']);
  });
});
