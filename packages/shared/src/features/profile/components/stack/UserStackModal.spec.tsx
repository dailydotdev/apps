import type { RenderResult } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserStackModal } from './UserStackModal';

// Mock the useStackSearch hook
jest.mock('../../hooks/useStackSearch', () => ({
  useStackSearch: jest.fn(),
}));

// Mock the useViewSize hook
jest.mock('../../../../hooks', () => ({
  ...jest.requireActual('../../../../hooks'),
  useViewSize: jest.fn(() => false),
  ViewSize: { MobileL: 'mobileL' },
}));

import { useStackSearch } from '../../hooks/useStackSearch';

const mockUseStackSearch = useStackSearch as jest.MockedFunction<
  typeof useStackSearch
>;

const mockOnSubmit = jest.fn();
const mockOnRequestClose = jest.fn();

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = (): RenderResult => {
  const client = createQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <UserStackModal
        isOpen={true}
        onSubmit={mockOnSubmit}
        onRequestClose={mockOnRequestClose}
      />
    </QueryClientProvider>,
  );
};

describe('UserStackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStackSearch.mockReturnValue({
      results: [],
      isSearching: false,
      data: [],
      isFetching: false,
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      isSuccess: true,
      isPending: false,
      isStale: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      refetch: jest.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([]),
    });
  });

  describe('autocomplete suggestions with icons', () => {
    it('should display favicon image when suggestion has faviconUrl', async () => {
      mockUseStackSearch.mockReturnValue({
        results: [
          {
            id: 'tool-1',
            title: 'React',
            faviconUrl: 'https://example.com/react.png',
          },
        ],
        isSearching: false,
        data: [
          {
            id: 'tool-1',
            title: 'React',
            faviconUrl: 'https://example.com/react.png',
          },
        ],
        isFetching: false,
        isLoading: false,
        isError: false,
        error: null,
        status: 'success',
        isSuccess: true,
        isPending: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: jest.fn(),
        fetchStatus: 'idle',
        promise: Promise.resolve([]),
      });

      renderComponent();

      const input = screen.getByLabelText('Technology or skill');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'React' } });

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/react.png');
      });
    });

    it('should display PlusIcon when suggestion has no faviconUrl', async () => {
      mockUseStackSearch.mockReturnValue({
        results: [
          {
            id: 'tool-1',
            title: 'Custom Tool',
            faviconUrl: null,
          },
        ],
        isSearching: false,
        data: [
          {
            id: 'tool-1',
            title: 'Custom Tool',
            faviconUrl: null,
          },
        ],
        isFetching: false,
        isLoading: false,
        isError: false,
        error: null,
        status: 'success',
        isSuccess: true,
        isPending: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: jest.fn(),
        fetchStatus: 'idle',
        promise: Promise.resolve([]),
      });

      renderComponent();

      const input = screen.getByLabelText('Technology or skill');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Custom' } });

      await waitFor(() => {
        expect(screen.getByText('Custom Tool')).toBeInTheDocument();
        // PlusIcon is rendered as an SVG with size-4 class
        const svg = document.querySelector('svg.size-4');
        expect(svg).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
      });
    });
  });

  describe('no autocomplete results behavior', () => {
    it('should show user typed text with PlusIcon when no suggestions match', async () => {
      mockUseStackSearch.mockReturnValue({
        results: [],
        isSearching: false,
        data: [],
        isFetching: false,
        isLoading: false,
        isError: false,
        error: null,
        status: 'success',
        isSuccess: true,
        isPending: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: jest.fn(),
        fetchStatus: 'idle',
        promise: Promise.resolve([]),
      });

      renderComponent();

      const input = screen.getByLabelText('Technology or skill');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'MyCustomTool' } });

      await waitFor(() => {
        // Should show the typed text in the dropdown
        expect(screen.getByText('MyCustomTool')).toBeInTheDocument();
        // Should show PlusIcon next to it
        const svg = document.querySelector('svg.size-4');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should not show dropdown when input is empty', async () => {
      mockUseStackSearch.mockReturnValue({
        results: [],
        isSearching: false,
        data: [],
        isFetching: false,
        isLoading: false,
        isError: false,
        error: null,
        status: 'success',
        isSuccess: true,
        isPending: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: jest.fn(),
        fetchStatus: 'idle',
        promise: Promise.resolve([]),
      });

      renderComponent();

      const input = screen.getByLabelText('Technology or skill');
      fireEvent.focus(input);

      // The dropdown should not appear because input is empty
      await waitFor(() => {
        const dropdown = document.querySelector('.rounded-12.border');
        expect(dropdown).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking on custom entry', async () => {
      mockUseStackSearch.mockReturnValue({
        results: [],
        isSearching: false,
        data: [],
        isFetching: false,
        isLoading: false,
        isError: false,
        error: null,
        status: 'success',
        isSuccess: true,
        isPending: false,
        isStale: false,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: jest.fn(),
        fetchStatus: 'idle',
        promise: Promise.resolve([]),
      });

      renderComponent();

      const input = screen.getByLabelText('Technology or skill');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'MyCustomTool' } });

      await waitFor(() => {
        expect(screen.getByText('MyCustomTool')).toBeInTheDocument();
      });

      // Click the custom entry button
      const customEntryButton = screen.getByText('MyCustomTool').closest('button');
      expect(customEntryButton).toBeInTheDocument();
      fireEvent.click(customEntryButton!);

      // Dropdown should close
      await waitFor(() => {
        const dropdown = document.querySelector('.absolute.left-0.right-0');
        expect(dropdown).not.toBeInTheDocument();
      });
    });
  });
});
