import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { subDays } from 'date-fns';
import { useInView } from 'react-intersection-observer';

import { BriefBannerFeed } from './BriefBannerFeed';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useActions, usePersistentState } from '../../../../hooks';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../../__tests__/fixture/loggedUser';

// Mock dependencies
jest.mock('../../../../contexts/AuthContext');
jest.mock('../../../../hooks');
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));
jest.mock('../../../../hooks/utils', () => ({
  useIsLightTheme: jest.fn(() => false),
}));

const completeAction = jest.fn();
const checkHasCompleted = jest.fn();

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(() => ({
    ref: jest.fn(),
    inView: false,
    entry: undefined,
  })),
}));

const mockUseAuthContext = mocked(useAuthContext);
const mockUsePersistentState = mocked(usePersistentState);
const mockUseInView = useInView as jest.MockedFunction<typeof useInView>;
const mockUseActions = mocked(useActions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockUseInViewReturn = any;

const mockSetBrief = jest.fn();
const mockUpdateAlerts = jest.fn();

let client: QueryClient;

const TestWrapper: React.FC<{
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alertsOverride?: any;
}> = ({ children, alertsOverride = {} }) => {
  const defaultAlerts = {
    alerts: {
      briefBannerLastSeen: null,
      ...alertsOverride.alerts,
    },
    loadedAlerts: true,
    updateAlerts: (props) => {
      console.log('updateAlerts called with props:', props);
      mockUpdateAlerts(props);
      return Promise.resolve();
    },
    ...alertsOverride,
  };

  return (
    <TestBootProvider client={client} alerts={defaultAlerts}>
      {children}
    </TestBootProvider>
  );
};

describe('BriefBannerFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);

    // Default useInView mock - not in view, with ref
    mockUseInView.mockReturnValue({
      ref: jest.fn(),
      inView: false,
      entry: undefined,
    } as MockUseInViewReturn);

    mockUseAuthContext.mockReturnValue({
      user: { ...defaultUser, isPlus: false },
      isLoggedIn: true,
      isAuthReady: true,
      updateUser: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockUseActions.mockReturnValue({
      completeAction,
      checkHasCompleted,
      isActionsFetched: true,
      actions: [],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('banner visibility logic', () => {
    it('should show banner when no brief exists and banner not seen today', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.getByText(/Still scrolling/i)).toBeInTheDocument();
    });

    it('should hide banner when banner was seen today', () => {
      const today = new Date();

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: today,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Still scrolling/i)).not.toBeInTheDocument();
    });

    it('should hide banner when brief was created today', () => {
      const todaysBrief = {
        id: 'brief-today',
        createdAt: new Date(),
      };

      mockUsePersistentState.mockReturnValueOnce([
        todaysBrief,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Still scrolling/i)).not.toBeInTheDocument();
    });

    it('should show banner when brief is from yesterday', () => {
      const yesterdaysBrief = {
        id: 'brief-yesterday',
        createdAt: subDays(new Date(), 1),
      };

      mockUsePersistentState.mockReturnValueOnce([
        yesterdaysBrief,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.getByText(/Still scrolling/i)).toBeInTheDocument();
    });

    it('should hide banner when both conditions are met (brief today AND banner seen today)', () => {
      const todaysBrief = {
        id: 'brief-today',
        createdAt: new Date(),
      };
      const today = new Date();

      mockUsePersistentState.mockReturnValueOnce([
        todaysBrief,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: today,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Still scrolling/i)).not.toBeInTheDocument();
    });

    it('should show banner when banner was seen yesterday but no brief today', () => {
      const yesterday = subDays(new Date(), 1);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: yesterday,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.getByText(/Still scrolling/i)).toBeInTheDocument();
    });
  });

  describe('Plus user behavior', () => {
    it('should never show banner for Plus users regardless of other conditions', () => {
      // Override the default user to be a Plus user
      mockUseAuthContext.mockReturnValue({
        user: { ...defaultUser, isPlus: true },
        isLoggedIn: true,
        isAuthReady: true,
        updateUser: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      mockUsePersistentState.mockReturnValueOnce([
        undefined, // no brief exists
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null, // never seen banner
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Still scrolling/i)).not.toBeInTheDocument();
    });

    it('should never show banner for Plus users even when brief is from yesterday', () => {
      const yesterdaysBrief = {
        id: 'brief-yesterday',
        createdAt: subDays(new Date(), 1),
      };

      // Override the default user to be a Plus user
      mockUseAuthContext.mockReturnValue({
        user: { ...defaultUser, isPlus: true },
        isLoggedIn: true,
        isAuthReady: true,
        updateUser: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      mockUsePersistentState.mockReturnValueOnce([
        yesterdaysBrief,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Still scrolling/i)).not.toBeInTheDocument();
    });
  });

  describe('useInView integration', () => {
    it('should call useInView with correct options when banner should show', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(mockUseInView).toHaveBeenCalledWith({
        threshold: 1,
        skip: false,
      });
    });

    it('should call useInView with skip=true when banner should not show', () => {
      const today = new Date();

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: today,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(mockUseInView).toHaveBeenCalledWith({
        threshold: 1,
        skip: true,
      });
    });

    it('should not call updateAlerts immediately when banner comes into view', () => {
      // Mock banner coming into view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: true,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // updateAlerts should not be called immediately - only on unmount/beforeunload
      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });

    it('should not set banner timestamp when banner is not in view', () => {
      // Mock banner not in view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: false,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });
  });

  describe('hybrid save approach', () => {
    it('should call updateAlerts on beforeunload when banner was seen', async () => {
      // Mock banner coming into view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: true,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Wait for useEffect to set the timestamp in ref
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Clear any setup calls
      mockUpdateAlerts.mockClear();

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockUpdateAlerts).toHaveBeenCalledWith({
        briefBannerLastSeen: expect.any(Date),
      });
    });

    it('should call updateAlerts on component unmount when banner was seen', () => {
      // Mock banner coming into view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: true,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const { unmount } = render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Clear any setup calls
      mockUpdateAlerts.mockClear();

      // Unmount component
      unmount();

      expect(mockUpdateAlerts).toHaveBeenCalledWith({
        briefBannerLastSeen: expect.any(Date),
      });
    });

    it('should not call updateAlerts on beforeunload when banner was not seen', () => {
      // Mock banner not in view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: false,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Clear any setup calls
      mockUpdateAlerts.mockClear();

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });

    it('should not call updateAlerts on unmount when banner was not seen', () => {
      // Mock banner not in view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: false,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const { unmount } = render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Clear any setup calls
      mockUpdateAlerts.mockClear();

      // Unmount component
      unmount();

      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });

    it('should only save once when both beforeunload and unmount would trigger', async () => {
      // Mock banner coming into view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: true,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const { unmount } = render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Wait for useEffect to set the timestamp in ref
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Clear any setup calls
      mockUpdateAlerts.mockClear();

      // Simulate beforeunload event first (this should save and clear the ref)
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockUpdateAlerts).toHaveBeenCalledTimes(1);
      expect(mockUpdateAlerts).toHaveBeenCalledWith({
        briefBannerLastSeen: expect.any(Date),
      });

      // Clear the mock to test unmount
      mockUpdateAlerts.mockClear();

      // Unmount component (this should not save again since ref was cleared)
      unmount();

      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });
  });

  describe('component props', () => {
    it('should render with default test id', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.getByTestId('brief-banner-feed')).toBeInTheDocument();
    });

    it('should pass through style to wrapper div', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      const customStyle = { marginTop: '20px' };
      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed style={customStyle} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('brief-banner-feed')).toHaveStyle(
        'margin-top: 20px',
      );
    });

    it('should pass through other props to wrapper div', () => {
      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      expect(screen.getByTestId('brief-banner-feed')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle brief with invalid date', () => {
      const briefWithInvalidDate = {
        id: 'brief-invalid',
        createdAt: new Date('invalid-date'),
      };

      mockUsePersistentState.mockReturnValueOnce([
        briefWithInvalidDate,
        mockSetBrief,
        true,
      ]);

      // Should not crash and should default to showing the banner
      expect(() => {
        render(
          <TestWrapper
            alertsOverride={{
              alerts: {
                briefBannerLastSeen: null,
              },
              loadedAlerts: true,
            }}
          >
            <BriefBannerFeed />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it('should handle when useInView returns null ref', () => {
      // Mock useInView to return null ref
      mockUseInView.mockReturnValue({
        ref: null,
        inView: false,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      expect(() => {
        render(
          <TestWrapper
            alertsOverride={{
              alerts: {
                briefBannerLastSeen: null,
              },
              loadedAlerts: true,
            }}
          >
            <BriefBannerFeed />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it('should only set banner timestamp once per component mount', () => {
      // Mock banner coming into view
      mockUseInView.mockReturnValue({
        ref: jest.fn(),
        inView: true,
        entry: undefined,
      } as MockUseInViewReturn);

      mockUsePersistentState.mockReturnValue([undefined, mockSetBrief, true]);

      const { rerender } = render(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Clear setup calls
      mockUpdateAlerts.mockClear();

      // Rerender the component (simulating multiple effect runs)
      rerender(
        <TestWrapper
          alertsOverride={{
            alerts: {
              briefBannerLastSeen: null,
            },
            loadedAlerts: true,
          }}
        >
          <BriefBannerFeed />
        </TestWrapper>,
      );

      // Still should not call updateAlerts during renders
      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });
  });
});
