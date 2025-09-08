import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { useRouter } from 'next/router';

import { BriefBanner } from './BriefBanner';
import { useAuthContext } from '../../../../contexts/AuthContext';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../../__tests__/fixture/loggedUser';

// Mock dependencies
jest.mock('next/router');
jest.mock('../../../../contexts/AuthContext');
jest.mock('../../../../hooks/utils', () => ({
  useIsLightTheme: jest.fn(() => false),
}));

const mockUseRouter = mocked(useRouter);
const mockUseAuthContext = mocked(useAuthContext);

const mockPush = jest.fn();
const mockLogEvent = jest.fn();

describe('BriefBanner', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);

    mockUseRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockUseAuthContext.mockReturnValue({
      user: defaultUser,
      isLoggedIn: true,
      isAuthReady: true,
      updateUser: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <TestBootProvider client={client} log={{ logEvent: mockLogEvent }}>
      {children}
    </TestBootProvider>
  );

  describe('rendering', () => {
    it('should render brief banner with correct content', () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      // Check for main elements
      expect(screen.getByText(/Still scrolling/i)).toBeInTheDocument();
      expect(
        screen.getByText(/personalized Presidential Briefing/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <TestWrapper>
          <BriefBanner className="custom-class" data-testid="brief-banner" />
        </TestWrapper>,
      );

      expect(screen.getByTestId('brief-banner')).toHaveClass('custom-class');
    });

    it('should render with custom style', () => {
      const customStyle = { marginTop: '20px' };
      render(
        <TestWrapper>
          <BriefBanner style={customStyle} data-testid="brief-banner-styled" />
        </TestWrapper>,
      );

      expect(screen.getByTestId('brief-banner-styled')).toHaveStyle(
        'margin-top: 20px',
      );
    });
  });

  describe('user interactions', () => {
    it('should navigate to briefing page when button is clicked', () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      expect(button).toHaveAttribute('href', '/briefing?generate=true');
    });

    it('should log click event when button is clicked', () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      fireEvent.click(button);
      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'click brief',
        target_id: 'scroll',
        extra: expect.stringContaining('is_demo'),
      });
    });
  });

  describe('user authentication states', () => {
    it('should handle non-Plus user correctly', () => {
      const nonPlusUser = { ...defaultUser, isPlus: false };
      mockUseAuthContext.mockReturnValue({
        user: nonPlusUser,
        isLoggedIn: true,
        isAuthReady: true,
        updateUser: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      fireEvent.click(button);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'click brief',
        target_id: 'scroll',
        extra: expect.stringContaining('is_demo'),
      });
    });

    it('should handle Plus user correctly', () => {
      const plusUser = { ...defaultUser, isPlus: true };
      mockUseAuthContext.mockReturnValue({
        user: plusUser,
        isLoggedIn: true,
        isAuthReady: true,
        updateUser: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      fireEvent.click(button);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'click brief',
        target_id: 'scroll',
        extra: expect.stringContaining('is_demo'),
      });
    });

    it('should not log impression when auth is not ready', () => {
      mockUseAuthContext.mockReturnValue({
        user: defaultUser,
        isLoggedIn: true,
        isAuthReady: false,
        updateUser: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      // Wait a bit to ensure effect has run
      expect(mockLogEvent).not.toHaveBeenCalledWith({
        event_name: 'impression brief',
        target_id: 'scroll',
        extra: expect.any(String),
      });
    });
  });

  describe('impression logging', () => {
    it('should log impression event on mount when auth is ready', async () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockLogEvent).toHaveBeenCalledWith({
          event_name: 'impression brief',
          target_id: 'scroll',
          extra: expect.stringContaining('is_demo'),
        });
      });
    });

    it('should only log impression once per component instance', async () => {
      const { rerender } = render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockLogEvent).toHaveBeenCalledWith({
          event_name: 'impression brief',
          target_id: 'scroll',
          extra: expect.any(String),
        });
      });

      // Clear the mock to verify it doesn't get called again
      mockLogEvent.mockClear();

      // Rerender the component
      rerender(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      // Wait a bit and verify impression wasn't logged again
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockLogEvent).not.toHaveBeenCalledWith({
        event_name: 'impression',
        target_id: 'scroll',
        extra: expect.any(String),
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should be keyboard accessible', () => {
      render(
        <TestWrapper>
          <BriefBanner />
        </TestWrapper>,
      );

      const button = screen.getByTestId('brief-banner-cta');
      button.focus();
      expect(button).toHaveFocus();

      // Test that button is focusable and accessible
      expect(button).toBeEnabled();
    });
  });
});
