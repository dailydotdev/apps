import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import {
  PostModerationReason,
  SourcePostModerationStatus,
  squadApproveMutation,
  squadRejectMutation,
} from '../../graphql/squads';
import type { SourcePostModeration } from '../../graphql/squads';
import { useSourceModerationList } from './useSourceModerationList';
import { useLazyModal } from '../useLazyModal';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { LogEvent } from '../../lib/log';

jest.mock('../../graphql/squads', () => ({
  ...(jest.requireActual('../../graphql/squads') as Iterable<unknown>),
  squadApproveMutation: jest.fn(),
  squadRejectMutation: jest.fn(),
}));

jest.mock('../useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

jest.mock('../usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('../useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  ...(jest.requireActual('../../contexts/LogContext') as Iterable<unknown>),
  useLogContext: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  ...(jest.requireActual('../../contexts/AuthContext') as Iterable<unknown>),
  useAuthContext: jest.fn(),
}));

describe('useSourceModerationList', () => {
  const displayToast = jest.fn();
  const openModal = jest.fn();
  const closeModal = jest.fn();
  const showPrompt = jest.fn();
  const logEvent = jest.fn();
  let client: QueryClient;

  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const createModerationItem = (
    overrides: Partial<SourcePostModeration>,
  ): SourcePostModeration => ({
    id: 'valid-post',
    status: SourcePostModerationStatus.Pending,
    ...overrides,
  });

  beforeEach(() => {
    client = new QueryClient();
    jest.clearAllMocks();

    mocked(useToastNotification).mockReturnValue({
      displayToast,
    } as ReturnType<typeof useToastNotification>);
    mocked(useLazyModal).mockReturnValue({
      openModal,
      closeModal,
    } as ReturnType<typeof useLazyModal>);
    mocked(usePrompt).mockReturnValue({
      showPrompt,
    } as ReturnType<typeof usePrompt>);
    mocked(useLogContext).mockReturnValue({
      logEvent,
    } as ReturnType<typeof useLogContext>);
    mocked(useAuthContext).mockReturnValue({
      user: { id: 'user-1' },
    } as ReturnType<typeof useAuthContext>);
  });

  it('resolves approve flow and logs only valid posts', async () => {
    mocked(squadApproveMutation).mockResolvedValue([
      createModerationItem({
        status: SourcePostModerationStatus.Approved,
        type: 'article',
        image: 'https://daily.dev/post.jpg',
      }),
      createModerationItem({
        id: 'missing-image',
        status: SourcePostModerationStatus.Approved,
        type: 'article',
      }),
    ]);

    const invalidateQueriesSpy = jest.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    await act(async () => {
      await result.current.onApprove(['valid-post'], 'source-1');
    });

    expect(displayToast).toHaveBeenCalledWith('Post(s) approved successfully');
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ApprovePost,
        target_id: 'valid-post',
      }),
    );
  });

  it('resolves reject flow, closes modal, and logs only valid posts', async () => {
    mocked(squadRejectMutation).mockResolvedValue([
      createModerationItem({
        status: SourcePostModerationStatus.Rejected,
        type: 'article',
        image: 'https://daily.dev/post.jpg',
      }),
      createModerationItem({
        id: 'missing-type',
        status: SourcePostModerationStatus.Rejected,
        image: 'https://daily.dev/post-2.jpg',
      }),
    ]);

    const { result } = renderHook(() => useSourceModerationList(), { wrapper });

    act(() => {
      result.current.onReject('valid-post', 'source-1');
    });

    const modalConfig = openModal.mock.calls[0][0];

    await act(async () => {
      await modalConfig.props.onReport(
        undefined,
        PostModerationReason.Other,
        'test note',
      );
    });

    expect(displayToast).toHaveBeenCalledWith('Post(s) declined successfully');
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.RejectPost,
        target_id: 'valid-post',
      }),
    );
  });
});
