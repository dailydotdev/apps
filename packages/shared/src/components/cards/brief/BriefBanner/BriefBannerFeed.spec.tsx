import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { mocked } from 'ts-jest/utils';
import { subDays } from 'date-fns';

import { BriefBannerFeed } from './BriefBannerFeed';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { usePersistentState } from '../../../../hooks';
import AlertContext from '../../../../contexts/AlertContext';
// eslint-disable-next-line import/extensions
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
// eslint-disable-next-line import/extensions
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
// eslint-disable-next-line import/extensions
import defaultUser from '../../../../../__tests__/fixture/loggedUser';

// Mock dependencies
jest.mock('../../../../contexts/AuthContext');
jest.mock('../../../../contexts/LogContext');
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

const mockUseAuthContext = mocked(useAuthContext);
const mockUseLogContext = mocked(useLogContext);
const mockUsePersistentState = mocked(usePersistentState);

const mockSetBrief = jest.fn();
const mockUpdateAlerts = jest.fn();
const mockLogEvent = jest.fn();

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

mockIntersectionObserver.mockImplementation((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  callback,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).IntersectionObserver = mockIntersectionObserver;

describe('BriefBannerFeed', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient(defaultQueryClientTestingConfig);

    mockUseAuthContext.mockReturnValue({
      user: defaultUser,
      isLoggedIn: true,
      isAuthReady: true,
      updateUser: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockUseLogContext.mockReturnValue({
      logEvent: mockLogEvent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

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
      updateAlerts: mockUpdateAlerts,
      ...alertsOverride,
    };

    return (
      <TestBootProvider client={client}>
        <AlertContext.Provider value={defaultAlerts}>
          {children}
        </AlertContext.Provider>
      </TestBootProvider>
    );
  };

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

  describe('intersection observer functionality', () => {
    it('should set up intersection observer when banner is visible', () => {
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

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 1 },
      );
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should not set up intersection observer when banner is hidden', () => {
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

      expect(mockIntersectionObserver).not.toHaveBeenCalled();
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should set bannerLastSeen when element intersects', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let intersectionCallback: (entries: any[]) => void;

      mockIntersectionObserver.mockImplementation((callback) => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
      });

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

      // Simulate intersection
      const mockEntry = { isIntersecting: true };
      if (intersectionCallback) {
        intersectionCallback([mockEntry]);
      }

      // The intersection observer should set local state, not call updateAlerts immediately
      // updateAlerts is only called on beforeunload
      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });

    it('should not set bannerLastSeen when element does not intersect', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let intersectionCallback: (entries: any[]) => void;

      mockIntersectionObserver.mockImplementation((callback) => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
      });

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

      // Simulate no intersection
      const mockEntry = { isIntersecting: false };
      if (intersectionCallback) {
        intersectionCallback([mockEntry]);
      }

      // updateAlerts should not be called since intersection didn't occur
      expect(mockUpdateAlerts).not.toHaveBeenCalled();
    });

    it('should disconnect observer on unmount', () => {
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

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should call updateAlerts on beforeunload when banner was seen', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let intersectionCallback: (entries: any[]) => void;

      mockIntersectionObserver.mockImplementation((callback) => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
      });

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

      // Wait for effects to be set up
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Simulate intersection (banner seen)
      const mockEntry = { isIntersecting: true };
      if (intersectionCallback) {
        intersectionCallback([mockEntry]);
      }

      // Wait for state update and useEffect to re-run
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Clear previous updateAlerts calls
      mockUpdateAlerts.mockClear();

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      expect(mockUpdateAlerts).toHaveBeenCalledWith({
        briefBannerLastSeen: expect.any(Date),
      });
    });

    it('should not call updateAlerts on beforeunload when banner was not seen', async () => {
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

      // Wait for effects to be set up
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Clear any previous updateAlerts calls
      mockUpdateAlerts.mockClear();

      // Simulate beforeunload event without banner being seen
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

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
              briefBannerLastSeen: null,
              loadedAlerts: true,
            }}
          >
            <BriefBannerFeed />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it('should handle missing ref gracefully', () => {
      // Mock ref to be null
      const originalCreateElement = React.createElement;
      React.createElement = jest
        .fn()
        .mockImplementation((type, props, ...children) => {
          if (type === 'div' && props?.ref) {
            return originalCreateElement(
              type,
              { ...props, ref: null },
              ...children,
            );
          }
          return originalCreateElement(type, props, ...children);
        });

      mockUsePersistentState.mockReturnValueOnce([
        undefined,
        mockSetBrief,
        true,
      ]);

      expect(() => {
        render(
          <TestWrapper
            alertsOverride={{
              briefBannerLastSeen: null,
              loadedAlerts: true,
            }}
          >
            <BriefBannerFeed />
          </TestWrapper>,
        );
      }).not.toThrow();

      // Restore original createElement
      React.createElement = originalCreateElement;
    });
  });
});
