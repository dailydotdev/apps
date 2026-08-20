import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useMutateComment } from './useMutateComment';
import { useRequestProtocol } from '../useRequestProtocol';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { DEFAULT_ERROR } from '../../graphql/common';
import post from '../../../__tests__/fixture/post';

jest.mock('../useRequestProtocol', () => ({
  useRequestProtocol: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

describe('useMutateComment', () => {
  const displayToast = jest.fn();
  const requestMethod = jest.fn();
  let client: QueryClient;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    client = new QueryClient();
    jest.clearAllMocks();

    jest.mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as unknown as ReturnType<typeof useToastNotification>);
    jest.mocked(useAuthContext).mockReturnValue({
      user: { id: 'u1' },
    } as ReturnType<typeof useAuthContext>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent: jest.fn(),
    } as unknown as ReturnType<typeof useLogContext>);
    jest.mocked(useRequestProtocol).mockReturnValue({
      requestMethod,
      fetchMethod: jest.fn(),
      isCompanion: false,
    });
  });

  it('should toast the server error message when the mutation is rejected', async () => {
    requestMethod.mockRejectedValueOnce({
      response: {
        errors: [
          { message: 'Verify your work email to join tool discussions' },
        ],
      },
    });

    const { result } = renderHook(() => useMutateComment({ post }), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateComment('hello').catch(() => undefined);
    });

    expect(displayToast).toHaveBeenCalledWith(
      'Verify your work email to join tool discussions',
    );
  });

  it('should toast a generic error message when the server sends none', async () => {
    requestMethod.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useMutateComment({ post }), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateComment('hello').catch(() => undefined);
    });

    expect(displayToast).toHaveBeenCalledWith(DEFAULT_ERROR);
  });
});
