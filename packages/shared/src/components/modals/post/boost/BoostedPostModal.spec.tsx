import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BoostPostModal } from './BoostPostModal';
import { usePostBoostMutation } from '../../../../hooks/post/usePostBoostMutations';
import { usePostById } from '../../../../hooks';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import postFixture from '../../../../../__tests__/fixture/post';
import type { Post } from '../../../../graphql/posts';

// Mock the hooks
jest.mock('../../../../hooks/post/usePostBoostMutations');
jest.mock('../../../../hooks');
jest.mock('../../../../hooks/useLazyModal');
jest.mock('../../../../hooks/post/usePostImage');
jest.mock('../../../../hooks/useDebounceFn');
jest.mock('next/dynamic', () => () => 'div');

const mockUsePostBoostMutation = usePostBoostMutation as jest.MockedFunction<
  typeof usePostBoostMutation
>;
const mockUsePostById = usePostById as jest.MockedFunction<typeof usePostById>;
const mockUseLazyModal = useLazyModal as jest.MockedFunction<
  typeof useLazyModal
>;

// Mock other hooks
jest.mock('../../../../hooks/post/usePostImage', () => ({
  usePostImage: () => 'https://example.com/image.jpg',
}));

jest.mock('../../../../hooks/useDebounceFn', () => ({
  __esModule: true,
  default: (fn: unknown) => [fn],
}));

const createMockPost = (overrides = {}) => ({
  ...postFixture,
  id: 'post-1',
  title: 'Test Post Title',
  tags: [],
  yggdrasilId: null,
  sharedPost: null,
  ...overrides,
});

const createMockUser = (balance = 50000) => ({
  ...loggedUser,
  id: 'user-1',
  balance: { amount: balance },
});

const defaultMockBoostMutation = {
  estimatedReach: { min: 1000, max: 5000 },
  onBoostPost: jest.fn(),
  onCancelBoost: jest.fn(),
  isLoadingEstimate: false,
  isLoadingCancel: false,
};

const renderBoostPostModal = (post: Post, user = createMockUser()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestBootProvider client={queryClient} auth={{ user }}>
      <BoostPostModal
        isOpen
        onRequestClose={jest.fn()}
        post={post}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

describe('BoostPostModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLazyModal.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
      modal: null,
    });
    mockUsePostById.mockReturnValue({
      post: null,
      isLoading: false,
      isError: false,
    });
  });

  describe('Loading States', () => {
    it('should show loader when isLoadingEstimate is true', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        isLoadingEstimate: true,
      });

      renderBoostPostModal(post);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show loader when post cannot be boosted (no tags and no yggdrasilId)', () => {
      const post = createMockPost(); // No tags, no yggdrasilId
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show reach estimation when not loading and post can be boosted with tags', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      expect(screen.getByText('1K - 5K')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should show reach estimation when yggdrasilId is present but no tags', () => {
      const post = createMockPost({ yggdrasilId: 'yggdrasil-123' }); // No tags, but has yggdrasilId
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      expect(screen.getByText('1K - 5K')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('Estimation Parameters', () => {
    it('should send budget and duration parameters when tags are present', () => {
      const post = createMockPost({ tags: ['javascript', 'react'] });

      renderBoostPostModal(post);

      expect(mockUsePostBoostMutation).toHaveBeenCalledWith({
        toEstimate: {
          id: 'post-1',
          budget: 5000, // default coresPerDay
          duration: 7, // default totalDays
        },
        onBoostSuccess: expect.any(Function),
      });
    });

    it('should send budget and duration parameters when sharedPost has tags', () => {
      const post = createMockPost({
        sharedPost: { tags: ['typescript'] },
      });

      renderBoostPostModal(post);

      expect(mockUsePostBoostMutation).toHaveBeenCalledWith({
        toEstimate: {
          id: 'post-1',
          budget: 5000,
          duration: 7,
        },
        onBoostSuccess: expect.any(Function),
      });
    });

    it('should send only id parameter when yggdrasilId is present but no tags', () => {
      const post = createMockPost({ yggdrasilId: 'yggdrasil-123' });

      renderBoostPostModal(post);

      expect(mockUsePostBoostMutation).toHaveBeenCalledWith({
        toEstimate: { id: 'post-1' },
        onBoostSuccess: expect.any(Function),
      });
    });

    it('should prioritize tags over yggdrasilId - send budget and duration when both are present', () => {
      const post = createMockPost({
        tags: ['javascript'],
        yggdrasilId: 'yggdrasil-123',
      });

      renderBoostPostModal(post);

      expect(mockUsePostBoostMutation).toHaveBeenCalledWith({
        toEstimate: {
          id: 'post-1',
          budget: 5000,
          duration: 7,
        },
        onBoostSuccess: expect.any(Function),
      });
    });

    it('should send undefined parameters when neither tags nor yggdrasilId are present', () => {
      const post = createMockPost(); // No tags, no yggdrasilId

      renderBoostPostModal(post);

      expect(mockUsePostBoostMutation).toHaveBeenCalledWith({
        toEstimate: undefined,
        onBoostSuccess: expect.any(Function),
      });
    });
  });

  describe('Boost Submission', () => {
    it('should call onBoostPost with correct parameters when boost button is clicked', () => {
      const post = createMockPost({ tags: ['javascript'] });
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onBoostPost: mockOnBoostPost,
      });

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      fireEvent.click(boostButton);

      expect(mockOnBoostPost).toHaveBeenCalledWith({
        duration: 7, // default totalDays
        budget: 5000, // default coresPerDay
        id: 'post-1',
      });
    });

    it('should call onBoostPost with same parameters regardless of yggdrasilId vs tags difference', () => {
      const postWithYggdrasil = createMockPost({
        yggdrasilId: 'yggdrasil-123',
      });
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onBoostPost: mockOnBoostPost,
      });

      renderBoostPostModal(postWithYggdrasil);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      fireEvent.click(boostButton);

      // Even though estimation params are different for yggdrasilId vs tags,
      // the boost submission always sends duration, budget, and id
      expect(mockOnBoostPost).toHaveBeenCalledWith({
        duration: 7,
        budget: 5000,
        id: 'post-1',
      });
    });

    it('should not call onBoostPost when user has insufficient balance', () => {
      const post = createMockPost({ tags: ['javascript'] });
      const userWithLowBalance = createMockUser(1000); // Less than 35K needed (5000 * 7)
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onBoostPost: mockOnBoostPost,
      });

      renderBoostPostModal(post, userWithLowBalance);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      fireEvent.click(boostButton);

      // Should not call onBoostPost, should trigger BUY_CORES screen instead
      expect(mockOnBoostPost).not.toHaveBeenCalled();
    });
  });

  describe('Post Refetching', () => {
    it('should enable refetching when post cannot be boosted', () => {
      const post = createMockPost(); // No tags, no yggdrasilId

      renderBoostPostModal(post);

      expect(mockUsePostById).toHaveBeenCalledWith({
        id: 'post-1',
        options: {
          enabled: true, // !canBoost = true
          refetchInterval: expect.any(Function),
        },
      });
    });

    it('should disable refetching when post can be boosted', () => {
      const post = createMockPost({ tags: ['javascript'] });

      renderBoostPostModal(post);

      expect(mockUsePostById).toHaveBeenCalledWith({
        id: 'post-1',
        options: {
          enabled: false, // !canBoost = false
          refetchInterval: expect.any(Function),
        },
      });
    });
  });

  describe('Boost Button State', () => {
    it('should disable boost button when post cannot be boosted', () => {
      const post = createMockPost(); // No tags, no yggdrasilId
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      expect(boostButton).toBeDisabled();
    });

    it('should disable boost button when loading estimate', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        isLoadingEstimate: true,
      });

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      expect(boostButton).toBeDisabled();
    });

    it('should enable boost button when post can be boosted and not loading', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      expect(boostButton).toBeEnabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle max reach being smaller than min reach', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        estimatedReach: { min: 5000, max: 3000 }, // max < min
      });

      renderBoostPostModal(post);

      // Should use max(min, max) = 5000 as maxReach
      expect(screen.getByText('5K - 5K')).toBeInTheDocument();
    });

    it('should display post title from sharedPost when main post has no title', () => {
      const post = createMockPost({
        title: null,
        sharedPost: { title: 'Shared Post Title', tags: ['javascript'] },
      });
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      expect(screen.getByText('Shared Post Title')).toBeInTheDocument();
    });

    it('should show correct total spend calculation', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);

      renderBoostPostModal(post);

      // Default: 5000 cores per day * 7 days = 35K cores
      expect(screen.getByText('35K Cores over 7 days')).toBeInTheDocument();
    });
  });
});
