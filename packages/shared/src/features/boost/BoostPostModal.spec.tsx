import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BoostPostModal } from './BoostPostModal';
import { useCampaignMutation } from './useCampaignMutation';
import { usePostBoostEstimation } from './usePostBoostEstimation';
import { usePostById } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import postFixture from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError } from '../../graphql/common';
import { CampaignType, CampaignWallet } from '../../graphql/campaigns';
import { SQUAD_WALLET_QUERY } from '../../graphql/squadWallet';
import { SourceType } from '../../graphql/sources';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { boostAudienceFeature } from '../../lib/featureManagement';
import type { Feature } from '../../lib/featureManagement';

// Mock the hooks
jest.mock('./useCampaignMutation');
jest.mock('./usePostBoostEstimation');
jest.mock('../../hooks');
jest.mock('../../hooks/useLazyModal');
jest.mock('../../hooks/post/usePostImage');
jest.mock('../../hooks/useDebounceFn');
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
jest.mock('../../hooks/post/usePostImage', () => ({
  usePostImage: () => 'https://example.com/image.jpg',
}));

jest.mock('../../hooks/useDebounceFn', () => ({
  __esModule: true,
  default: (fn: unknown) => [fn],
}));

const createMockPost = (overrides: Record<string, unknown> = {}): Post =>
  ({
    ...(postFixture as Post),
    id: 'post-1',
    title: 'Test Post Title',
    tags: [],
    yggdrasilId: undefined,
    sharedPost: undefined,
    ...overrides,
  }) as Post;

const createMockUser = (balance = 50000) => ({
  ...loggedUser,
  id: 'user-1',
  balance: { amount: balance },
});

const defaultMockBoostMutation: ReturnType<typeof useCampaignMutation> = {
  onStartBoost: jest.fn(),
  onCancelBoost: jest.fn(),
  isLoadingCancel: false,
};

type UsePostBoostEstimation = ReturnType<typeof usePostBoostEstimation>;

const defaultMockBoostEstimation = {
  estimatedReach: { min: 1000, max: 5000 },
  isLoading: false,
  canBoost: true,
} as UsePostBoostEstimation;

const logEvent = jest.fn();

const renderBoostPostModal = (
  post: Post,
  user = createMockUser(),
  origin?: Origin,
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestBootProvider client={queryClient} auth={{ user }} log={{ logEvent }}>
      <BoostPostModal
        isOpen
        onRequestClose={jest.fn()}
        post={post}
        origin={origin}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

const getLoggedEvents = (eventName: LogEvent) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === eventName)
    .map((event) => ({ ...event, extra: JSON.parse(event.extra) }));

describe('BoostPostModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLazyModal.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
      modal: undefined as unknown as ReturnType<typeof useLazyModal>['modal'],
    });
    mockUsePostById.mockReturnValue({
      post: createMockPost(),
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
        query: { budget: 5000 },
      });
    });

    it('should call usePostBoostEstimation with post and query when sharedPost has tags', () => {
      const post = createMockPost({
        sharedPost: { tags: ['typescript'] },
      });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000 },
      });
    });

    it('should call usePostBoostEstimation with post and query when yggdrasilId is present', () => {
      const post = createMockPost({ yggdrasilId: 'yggdrasil-123' });

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000 },
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
        query: { budget: 5000 },
      });
    });

    it('should call usePostBoostEstimation with post and query when neither tags nor yggdrasilId are present', () => {
      const post = createMockPost(); // No tags, no yggdrasilId

      renderBoostPostModal(post);

      expect(mockUsePostBoostEstimation).toHaveBeenCalledWith({
        post,
        query: { budget: 5000 },
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
        type: 'POST',
        value: 'post-1',
        wallet: CampaignWallet.User,
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
        type: 'POST',
        value: 'post-1',
        wallet: CampaignWallet.User,
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

  describe('Target audience', () => {
    beforeEach(() => {
      // Tests read flags at their default, so the default turns it on
      jest.replaceProperty(
        boostAudienceFeature as Feature<boolean>,
        'defaultValue',
        true,
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const startBoost = () =>
      fireEvent.click(screen.getByRole('button', { name: /Boost post for/ }));

    it("should keep the post's own tags worldwide until the audience is edited", () => {
      const onStartBoost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost,
      });

      renderBoostPostModal(createMockPost({ tags: ['javascript'] }));

      expect(screen.getByText('#javascript')).toBeInTheDocument();
      expect(screen.getByText('Worldwide')).toBeInTheDocument();
      startBoost();
      expect(onStartBoost).toHaveBeenCalledWith(
        expect.objectContaining({ audience: undefined }),
      );
    });

    it('should boost and estimate the picked countries with the post tags', () => {
      const onStartBoost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost,
      });

      renderBoostPostModal(createMockPost({ tags: ['javascript'] }));

      fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
      fireEvent.click(screen.getByText('Choose countries'));
      fireEvent.click(screen.getByLabelText('Add United States'));

      const audience = { tags: ['javascript'], countries: ['US'] };
      expect(mockUsePostBoostEstimation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ audience }),
        }),
      );
      startBoost();
      expect(onStartBoost).toHaveBeenCalledWith(
        expect.objectContaining({ audience }),
      );
    });
  });

  describe('Squad wallet', () => {
    const squadPost = () =>
      createMockPost({
        tags: ['javascript'],
        source: {
          ...postFixture.source,
          id: 'squad-1',
          name: 'Acme',
          type: SourceType.Squad,
        },
      });

    const mockSquadWallet = ({
      seat = true,
      plan = 'starter',
      coresBalance = 40000,
    }: {
      seat?: boolean;
      plan?: string | null;
      coresBalance?: number;
    } = {}) =>
      mockGraphQL({
        request: {
          query: SQUAD_WALLET_QUERY,
          variables: { sourceId: 'squad-1' },
        },
        result: {
          data: {
            source: {
              id: 'squad-1',
              name: 'Acme',
              handle: 'acme',
              currentMember: { seat },
            },
            squadSubscription: { plan, coresBalance },
          },
        },
      });

    beforeEach(() => {
      mockUsePostBoostEstimation.mockReturnValue(defaultMockBoostEstimation);
    });

    it('should pay with the squad wallet by default for a paid seat', async () => {
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost: mockOnBoostPost,
      });
      mockSquadWallet();

      renderBoostPostModal(squadPost(), createMockUser(0));

      const squadOption = await screen.findByLabelText(/Acme wallet/);
      expect(squadOption).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: /Boost post for/ }));

      expect(mockOnBoostPost).toHaveBeenCalledWith({
        duration: 7,
        budget: 5000,
        type: 'POST',
        value: 'post-1',
        wallet: CampaignWallet.Squad,
      });
    });

    it('should pay with the user wallet when picked', async () => {
      const mockOnBoostPost = jest.fn();
      mockUsePostBoostMutation.mockReturnValue({
        ...defaultMockBoostMutation,
        onStartBoost: mockOnBoostPost,
      });
      mockSquadWallet();

      renderBoostPostModal(squadPost());

      await screen.findByLabelText(/Acme wallet/);
      fireEvent.click(screen.getByLabelText(/My Cores/));
      fireEvent.click(screen.getByRole('button', { name: /Boost post for/ }));

      expect(mockOnBoostPost).toHaveBeenCalledWith(
        expect.objectContaining({ wallet: CampaignWallet.User }),
      );
    });

    it('should show the squad wallet balance in the header', async () => {
      mockSquadWallet({ coresBalance: 20765 });

      renderBoostPostModal(squadPost(), createMockUser(0));

      await screen.findByLabelText(/Acme wallet/);
      expect(screen.getByTitle('Acme wallet')).toHaveTextContent('20K');
      expect(screen.getByTitle('Acme wallet')).toHaveAttribute(
        'href',
        expect.stringContaining('/squads/acme/manage/plan'),
      );

      fireEvent.click(screen.getByLabelText(/My Cores/));
      expect(screen.getByTitle('My Cores')).toHaveTextContent('0');
    });

    it('should buy Cores into the squad wallet from the header', async () => {
      mockSquadWallet({ coresBalance: 20765 });

      renderBoostPostModal(squadPost(), createMockUser(0));

      await screen.findByLabelText(/Acme wallet/);
      fireEvent.click(screen.getByLabelText('Buy Cores for Acme'));

      expect(
        await screen.findByText('Get More Cores for Acme'),
      ).toBeInTheDocument();
      expect(screen.getByText(/14,235 more Cores/)).toBeInTheDocument();
    });

    it('should buy the missing Cores into a short squad wallet', async () => {
      mockSquadWallet({ coresBalance: 1000 });

      renderBoostPostModal(squadPost());

      expect(
        await screen.findByText(/doesn't have enough Cores/),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Boost post for/ }));

      expect(
        await screen.findByText('Get More Cores for Acme'),
      ).toBeInTheDocument();
      expect(screen.getByText(/34,000 more Cores/)).toBeInTheDocument();
    });

    it('should not offer the squad wallet without a seat', async () => {
      mockSquadWallet({ seat: false });

      renderBoostPostModal(squadPost());

      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
      expect(screen.queryByText('Pay with')).not.toBeInTheDocument();
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

  describe('Funnel logging', () => {
    const boostVars = {
      value: 'post-1',
      budget: 5000,
      duration: 7,
      type: CampaignType.Post,
    };
    const boostExtra = { budget: 5000, duration: 7, total_cores: 35000 };
    let mutationProps: Parameters<typeof useCampaignMutation>[0];

    beforeEach(() => {
      mockUsePostBoostMutation.mockImplementation((props) => {
        mutationProps = props;
        return defaultMockBoostMutation;
      });
    });

    const clickBoost = () =>
      fireEvent.click(screen.getByRole('button', { name: /Boost post for/ }));

    it('should log the modal opening once with where it was opened from', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(),
        Origin.PostContextMenu,
      );
      clickBoost();

      expect(getLoggedEvents(LogEvent.OpenBoost)).toEqual([
        {
          event_name: LogEvent.OpenBoost,
          target_type: TargetType.Post,
          target_id: 'post-1',
          extra: { origin: Origin.PostContextMenu },
        },
      ]);
    });

    it('should log the boost start and success with the chosen budget and duration', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(),
        Origin.PostBoostButton,
      );
      clickBoost();

      expect(getLoggedEvents(LogEvent.StartBoost)).toEqual([
        {
          event_name: LogEvent.StartBoost,
          target_type: TargetType.Post,
          target_id: 'post-1',
          extra: {
            origin: Origin.PostBoostButton,
            ...boostExtra,
            has_enough_balance: true,
          },
        },
      ]);

      act(() =>
        mutationProps?.onBoostSuccess?.(
          {
            transactionId: 'transaction-1',
            referenceId: 'campaign-1',
            balance: { amount: 15000 },
          },
          boostVars,
        ),
      );

      expect(getLoggedEvents(LogEvent.CompleteBoost)).toEqual([
        {
          event_name: LogEvent.CompleteBoost,
          target_type: TargetType.Post,
          target_id: 'post-1',
          extra: {
            origin: Origin.PostBoostButton,
            ...boostExtra,
            campaign_id: 'campaign-1',
          },
        },
      ]);
    });

    it('should log a failed boost with the API error', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(),
        Origin.PostBoostButton,
      );
      clickBoost();

      act(() =>
        mutationProps?.onBoostError?.(
          {
            response: {
              errors: [
                {
                  message: 'Not enough Cores',
                  extensions: { code: ApiError.BalanceTransactionError },
                },
              ],
            },
          } as ApiErrorResult,
          boostVars,
        ),
      );

      expect(getLoggedEvents(LogEvent.ErrorBoost)[0].extra).toEqual({
        origin: Origin.PostBoostButton,
        ...boostExtra,
        error_code: ApiError.BalanceTransactionError,
        error: 'Not enough Cores',
      });
      expect(getLoggedEvents(LogEvent.CompleteBoost)).toHaveLength(0);
    });

    it('should send a short balance to buy Cores with the boost origin', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(1000),
        Origin.BoostAgain,
      );
      clickBoost();

      expect(getLoggedEvents(LogEvent.StartBoost)[0].extra).toEqual({
        origin: Origin.BoostAgain,
        ...boostExtra,
        has_enough_balance: false,
      });
      expect(getLoggedEvents(LogEvent.StartBuyingCredits)).toEqual([
        {
          event_name: LogEvent.StartBuyingCredits,
          target_type: TargetType.Post,
          target_id: 'post-1',
          extra: { origin: Origin.BoostPost, boost_origin: Origin.BoostAgain },
        },
      ]);
    });

    it('should tell a short balance how many Cores the boost is missing', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(1000),
      );
      clickBoost();

      expect(
        screen.getByText(
          (_, element) =>
            element?.tagName === 'P' &&
            element.textContent ===
              'You need 34,000 more Cores to boost the post.',
        ),
      ).toBeInTheDocument();
    });

    it('should not claim Cores are missing when buying more with enough balance', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(50000),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Buy Cores' }));

      expect(screen.queryByText(/more Cores/)).not.toBeInTheDocument();
      expect(
        screen.getByText('Choose how many Cores to buy.'),
      ).toBeInTheDocument();
    });

    it('should log the final budget and duration when closed without boosting', () => {
      renderBoostPostModal(
        createMockPost({ tags: ['javascript'] }),
        createMockUser(),
        Origin.AdsDashboard,
      );
      fireEvent.click(screen.getByTitle('Close'));

      expect(getLoggedEvents(LogEvent.CloseBoost)).toEqual([
        {
          event_name: LogEvent.CloseBoost,
          target_type: TargetType.Post,
          target_id: 'post-1',
          extra: { origin: Origin.AdsDashboard, ...boostExtra },
        },
      ]);
      expect(getLoggedEvents(LogEvent.StartBoost)).toHaveLength(0);
    });
  });
});
