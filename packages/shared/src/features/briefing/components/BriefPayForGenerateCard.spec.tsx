import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';

import { BriefPayForGenerateCard } from './BriefPayForGenerateCard';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../__tests__/helpers/boot';

// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { BriefingType } from '../../../graphql/posts';
import { useGenerateBrief } from '../hooks/useGenerateBrief';
import { useActions } from '../../../hooks/useActions';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useFeature } from '../../../components/GrowthBookProvider';
import type { LoggedUser } from '../../../lib/user';

// Mock the hooks
jest.mock('../hooks/useGenerateBrief');
jest.mock('../../../hooks/useActions');
jest.mock('../../../hooks/useToastNotification');
jest.mock('../../../components/GrowthBookProvider');

const mockUseGenerateBrief = mocked(useGenerateBrief);
const mockUseActions = mocked(useActions);
const mockUseToastNotification = mocked(useToastNotification);
const mockUseFeature = mocked(useFeature);
const mockRouter = mocked(useRouter);

const mockPush = jest.fn();
const mockGenerateBrief = jest.fn();
const mockCheckHasCompleted = jest.fn();
const mockCompleteAction = jest.fn();
const mockDisplayToast = jest.fn();

// Mock BuyCoresModal to enable testing the purchase completion flow
jest.mock('../../../components/modals/award/BuyCoresModal', () => ({
  BuyCoresModal: ({ onCompletion }: { onCompletion: () => void }) => (
    <div data-testid="buy-cores-modal">
      <button
        type="button"
        onClick={() => onCompletion()}
        data-testid="complete-purchase"
      >
        Complete Purchase
      </button>
    </div>
  ),
}));

describe('BriefPayForGenerateCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient(defaultQueryClientTestingConfig);

    mockRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockUseGenerateBrief.mockReturnValue({
      isGenerating: false,
      generateBrief: mockGenerateBrief,
    });

    mockUseActions.mockReturnValue({
      checkHasCompleted: mockCheckHasCompleted,
      isActionsFetched: true,
      completeAction: mockCompleteAction,
      actions: [],
    });

    mockUseToastNotification.mockReturnValue({
      displayToast: mockDisplayToast,
      dismissToast: jest.fn(),
    });

    mockUseFeature.mockReturnValue({
      [BriefingType.Daily]: 10,
      [BriefingType.Weekly]: 20,
    });

    jest.clearAllMocks();
  });

  const plusUser = { ...defaultUser, isPlus: true };
  const freeUser = { ...defaultUser, isPlus: false };
  const renderComponent = ({ user }: { user: LoggedUser }) => {
    render(
      <TestBootProvider client={queryClient} auth={{ user }}>
        <BriefPayForGenerateCard />
      </TestBootProvider>,
    );
  };

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Plus users can generate the brief for free', () => {
    it('should call generateBrief when Plus user clicks generate button', () => {
      // Has already generated briefs
      mockCheckHasCompleted.mockReturnValue(true);

      renderComponent({ user: plusUser });

      fireEvent.click(screen.getByText('Generate for free'));
      expect(mockGenerateBrief).toHaveBeenCalledWith({
        type: BriefingType.Daily,
      });
    });
  });

  describe('Free users with no briefs can send one free request', () => {
    it('should call generateBrief when first-time user clicks generate button', () => {
      // First brief
      mockCheckHasCompleted.mockReturnValue(false);

      renderComponent({ user: freeUser });

      fireEvent.click(screen.getByText('Generate for free'));
      expect(mockGenerateBrief).toHaveBeenCalledWith({
        type: BriefingType.Daily,
      });
    });
  });

  describe('Free users with already generated briefs should pay cores', () => {
    it('should show cores price for users who have already generated briefs', async () => {
      // Has generated briefs before
      mockCheckHasCompleted.mockReturnValue(true);

      renderComponent({
        user: { ...freeUser, balance: { amount: 50 } },
      });

      await screen.findByText('Generate for 10'); // Daily price
      expect(screen.queryByText('Generate for free')).not.toBeInTheDocument();
    });
  });

  describe('Free users with enough cores can send request', () => {
    it('should allow generation when user has enough cores', () => {
      // Has generated briefs before
      mockCheckHasCompleted.mockReturnValue(true);

      renderComponent({
        user: { ...freeUser, balance: { amount: 50 } },
      });

      const generateButton = screen.getByRole('button', {
        name: /generate for/i,
      });
      fireEvent.click(generateButton);

      expect(mockGenerateBrief).toHaveBeenCalledWith({
        type: BriefingType.Daily,
      });
    });

    it('should work for weekly briefings with sufficient cores', () => {
      // Has generated briefs before
      mockCheckHasCompleted.mockReturnValue(true);

      renderComponent({
        user: { ...freeUser, balance: { amount: 50 } },
      });

      // Select weekly option
      const weeklyRadio = screen.getByDisplayValue(BriefingType.Weekly);
      fireEvent.click(weeklyRadio);

      const generateButton = screen.getByRole('button', {
        name: /generate for/i,
      });
      fireEvent.click(generateButton);

      expect(mockGenerateBrief).toHaveBeenCalledWith({
        type: BriefingType.Weekly,
      });
    });
  });

  describe('Free users without enough cores should see buy cores modal', () => {
    it('should not request brief if has not enough cores', () => {
      // Has generated briefs before
      mockCheckHasCompleted.mockReturnValue(true);

      // User has insufficient cores
      renderComponent({
        user: { ...freeUser, balance: { amount: 5 } },
      });

      const generateButton = screen.getByRole('button', {
        name: /generate for/i,
      });
      fireEvent.click(generateButton);

      // Should not call generateBrief immediately
      expect(mockGenerateBrief).not.toHaveBeenCalled();
    });

    it('should open the modal and trigger generation after successful core purchase', async () => {
      // Has generated briefs before
      mockCheckHasCompleted.mockReturnValue(true);

      // User has insufficient cores
      renderComponent({
        user: { ...freeUser, balance: { amount: 5 } },
      });

      // Click generate to open modal
      const generateButton = screen.getByRole('button', {
        name: /generate for/i,
      });
      fireEvent.click(generateButton);

      // Should not call generateBrief immediately
      expect(mockGenerateBrief).not.toHaveBeenCalled();

      // Click on complete button simulate the purchase
      const completePurchaseButton = screen.getByTestId('complete-purchase');
      fireEvent.click(completePurchaseButton);

      // Should trigger generation after purchase
      expect(mockGenerateBrief).toHaveBeenCalledWith({
        type: BriefingType.Daily,
      });
    });
  });

  describe('Component state management', () => {
    it('should disable button when actions are not fetched', () => {
      mockUseActions.mockReturnValue({
        checkHasCompleted: mockCheckHasCompleted,
        isActionsFetched: false, // Not fetched yet
        completeAction: mockCompleteAction,
        actions: [],
      });

      renderComponent({
        user: freeUser,
      });

      const generateButton = screen.getByRole('button', {
        name: /generate for/i,
      });
      expect(generateButton).toBeDisabled();
    });

    it('should switch between daily and weekly pricing', () => {
      mockCheckHasCompleted.mockReturnValue(true);

      renderComponent({ user: freeUser });

      // Should show daily price initially
      expect(screen.getByText('Generate for 10')).toBeInTheDocument();

      // Switch to weekly
      const weeklyRadio = screen.getByDisplayValue(BriefingType.Weekly);
      fireEvent.click(weeklyRadio);

      // Should show weekly price
      expect(screen.getByText('Generate for 20')).toBeInTheDocument();
      expect(screen.queryByText('Generate for 10')).not.toBeInTheDocument();
    });
  });
});
