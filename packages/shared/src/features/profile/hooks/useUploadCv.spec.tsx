import React from 'react';
import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { LazyModal } from '../../../components/modals/common/types';
import { uploadCv } from '../../../graphql/users';
import {
  uploadCvOpportunitySuccessContent,
  uploadCvProfileSuccessContent,
  useUploadCv,
} from './useUploadCv';

const mockOpenModal = jest.fn();
const mockDisplayToast = jest.fn();
const mockCheckHasCompleted = jest.fn();
const mockCompleteAction = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: mockOpenModal,
  }),
}));

jest.mock('../../../graphql/users', () => ({
  uploadCv: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  useActions: () => ({
    checkHasCompleted: mockCheckHasCompleted,
    completeAction: mockCompleteAction,
    isActionsFetched: true,
  }),
  useToastNotification: () => ({
    displayToast: mockDisplayToast,
  }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({
    logEvent: mockLogEvent,
  }),
}));

const mockUploadCv = uploadCv as jest.MockedFunction<typeof uploadCv>;

const renderUseUploadCv = (props?: Parameters<typeof useUploadCv>[0]) => {
  const client = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return renderHook(() => useUploadCv(props), { wrapper });
};

describe('useUploadCv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckHasCompleted.mockReturnValue(false);
    mockCompleteAction.mockResolvedValue(undefined);
    mockUploadCv.mockResolvedValue({} as Awaited<ReturnType<typeof uploadCv>>);
  });

  it('opens the profile success copy by default', async () => {
    const { result } = renderUseUploadCv();
    const file = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.onUpload(file);
    });

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LazyModal.ActionSuccess,
          props: expect.objectContaining({
            content: expect.objectContaining(uploadCvProfileSuccessContent),
          }),
        }),
      );
    });
  });

  it('can open opportunity success copy for jobs upload flows', async () => {
    const { result } = renderUseUploadCv({
      modalContent: uploadCvOpportunitySuccessContent,
    });
    const file = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.onUpload(file);
    });

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LazyModal.ActionSuccess,
          props: expect.objectContaining({
            content: expect.objectContaining(uploadCvOpportunitySuccessContent),
          }),
        }),
      );
    });
  });
});
