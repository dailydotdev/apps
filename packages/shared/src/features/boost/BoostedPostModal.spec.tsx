import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BoostPostModal } from './BoostPostModal';
import { useCampaignMutation } from '../../hooks/post/useCampaignMutation';
import { usePostBoostEstimation } from '../../hooks/post/usePostBoostEstimation';
import { usePostById } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import postFixture from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';

// Mock the hooks
jest.mock('../../../../hooks/post/useCampaignMutation');
jest.mock('../../../../hooks/post/usePostBoostEstimation');
jest.mock('../../../../hooks');
jest.mock('../../../../hooks/useLazyModal');
jest.mock('../../../../hooks/post/usePostImage');
jest.mock('../../../../hooks/useDebounceFn');
jest.mock('next/dynamic', () => () => 'div');

const mockUsePostBoostMutation = useCampaignMutation as jest.MockedFunction<
  typeof useCampaignMutation
>;
const mockUsePostBoostEstimation =
  usePostBoostEstimation as jest.MockedFunction<typeof usePostBoostEstimation>;
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
  onBoostPost: jest.fn(),
  onCancelBoost: jest.fn(),
  isLoadingCancel: false,
};

type UsePostBoostEstimation = ReturnType<typeof usePostBoostEstimation>;

const defaultMockBoostEstimation = {
  estimatedReach: { min: 1000, max: 5000 },
  isLoading: false,
  canBoost: true,
} as UsePostBoostEstimation;

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
    mockUsePostBoostMutation.mockReturnValue(defaultMockBoostMutation);
    mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);
  });

  describe('Loading States', () => {
    it('should show loader when isLoading is true', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        isLoading: true,
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show loader when post cannot be boosted (no tags and no yggdrasilId)', () => {
      const post = createMockPost(); // No tags, no yggdrasilId
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        canBoost: false,
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show reach estimation when not loading and post can be boosted with tags', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

      renderBoostPostModal(post);

      expect(screen.getByText('1K - 5K')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should show reach estimation when yggdrasilId is present but no tags', () => {
      const post = createMockPost({ yggdrasilId: 'yggdrasil-123' }); // No tags, but has yggdrasilId
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

      renderBoostPostModal(post);

      expect(screen.getByText('1K - 5K')).toBeInTheDocument();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  describe('Estimation Parameters', () => {
    it('should call usePostBoostEstimation with post and query when tags are present', () => {
      const post = createMockPost({ tags: ['javascript', 'react'] });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });

    it('should call usePostBoostEstimation with post and query when sharedPost has tags', () => {
      const post = createMockPost({
        sharedPost: { tags: ['typescript'] },
      });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });

    it('should call usePostBoostEstimation with post and query when yggdrasilId is present', () => {
      const post = createMockPost({ yggdrasilId: 'yggdrasil-123' });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });

    it('should call usePostBoostEstimation with post and query when both tags and yggdrasilId are present', () => {
      const post = createMockPost({
        tags: ['javascript'],
        yggdrasilId: 'yggdrasil-123',
      });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });

    it('should call usePostBoostEstimation with post and query when neither tags nor yggdrasilId are present', () => {
      const post = createMockPost(); // No tags, no yggdrasilId

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });
  });

  describe('Boost Submission', () => {
    it('should call onBoostPost with correct parameters when boost button is clicked', () => {
      const post = createMockPost({ tags: ['javascript'] });
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost: mockOnBoostPost,
      });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      fireEvent.click(boostButton);

      expect(mockOnBoostPost).toHaveBeenCalledWith({
        duration: 7, // default totalDays
        budget: 5000, // default coresPerDay
        type: 'post',
        value: 'post-1',
      });
    });

    it('should call onBoostPost with same parameters regardless of yggdrasilId vs tags difference', () => {
      const postWithYggdrasil = createMockPost({
        yggdrasilId: 'yggdrasil-123',
      });
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost: mockOnBoostPost,
      });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

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
        type: 'post',
        value: 'post-1',
      });
    });

    it('should not call onBoostPost when user has insufficient balance', () => {
      const post = createMockPost({ tags: ['javascript'] });
      const userWithLowBalance = createMockUser(1000); // Less than 35K needed (5000 * 7)
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost: mockOnBoostPost,
      });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

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
    it('should handle refetching logic within usePostBoostEstimation when post cannot be boosted', () => {
      const post = createMockPost(); // No tags, no yggdrasilId
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        canBoost: false,
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      // The refetching logic is now handled inside usePostBoostEstimation
      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });

    it('should handle refetching logic within usePostBoostEstimation when post can be boosted', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        canBoost: true,
      });

      renderBoostPostModal(post);

      // The refetching logic is now handled inside usePostBoostEstimation
      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000, duration: 7 },
      });
    });
  });

  describe('Boost Button State', () => {
    it('should disable boost button when post cannot be boosted', () => {
      const post = createMockPost(); // No tags, no yggdrasilId
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        canBoost: false,
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      expect(boostButton).toBeDisabled();
    });

    it('should disable boost button when loading estimate', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        isLoading: true,
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      const boostButton = screen.getByRole('button', {
        name: /Boost post for/,
      });
      expect(boostButton).toBeDisabled();
    });

    it('should enable boost button when post can be boosted and not loading', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

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
      mockUsePostBoostEstimation.mockReturnValue({
        ...defaultMockBoostEstimation,
        estimatedReach: { min: 5000, max: 3000 }, // max < min
      } as UsePostBoostEstimation);

      renderBoostPostModal(post);

      // Should use max(min, max) = 5000 as maxReach
      expect(screen.getByText('5K - 5K')).toBeInTheDocument();
    });

    it('should display post title from sharedPost when main post has no title', () => {
      const post = createMockPost({
        title: null,
        sharedPost: { title: 'Shared Post Title', tags: ['javascript'] },
      });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

      renderBoostPostModal(post);

      expect(screen.getByText('Shared Post Title')).toBeInTheDocument();
    });

    it('should show correct total spend calculation', () => {
      const post = createMockPost({ tags: ['javascript'] });
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);

      renderBoostPostModal(post);

      // Default: 5000 cores per day * 7 days = 35K cores
      expect(screen.getByText('35K Cores over 7 days')).toBeInTheDocument();
    });
  });
});
