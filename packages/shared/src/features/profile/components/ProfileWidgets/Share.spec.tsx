import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Share } from './Share';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { ShareProvider } from '../../../../lib/share';

jest.mock('../../../../hooks/useShareOrCopyLink');

const mockUseShareOrCopyLink = useShareOrCopyLink as jest.MockedFunction<
  typeof useShareOrCopyLink
>;

describe('Share', () => {
  let queryClient: QueryClient;
  let mockLogEvent: jest.Mock;
  let mockOnShareOrCopy: jest.Mock;

  const renderComponent = (permalink = 'https://dly.to/thecoverliker') => {
    const LogContext = getLogContextStatic();

    return render(
      <QueryClientProvider client={queryClient}>
        <LogContext.Provider
          value={{
            logEvent: mockLogEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <Share permalink={permalink} />
        </LogContext.Provider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockLogEvent = jest.fn();
    mockOnShareOrCopy = jest.fn();

    mockUseShareOrCopyLink.mockReturnValue([false, mockOnShareOrCopy]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      renderComponent();

      expect(screen.getByText('Public profile & URL')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should display the permalink', () => {
      renderComponent('https://dly.to/testuser');

      expect(screen.getByText('https://dly.to/testuser')).toBeInTheDocument();
    });

    it('should render all social share buttons', () => {
      renderComponent();

      expect(screen.getByLabelText('Share on X')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on WhatsApp')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Reddit')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Telegram')).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('should call onShareOrCopy when copy button is clicked', () => {
      renderComponent();

      const copyButton = screen.getByLabelText('Copy link');
      fireEvent.click(copyButton);

      expect(mockOnShareOrCopy).toHaveBeenCalledTimes(1);
    });

    it('should show "Copied!" when copying is true', () => {
      mockUseShareOrCopyLink.mockReturnValue([true, mockOnShareOrCopy]);

      renderComponent();

      const copyButton = screen.getByLabelText('Copied!');
      expect(copyButton).toBeInTheDocument();
    });

    it('should pass correct props to useShareOrCopyLink', () => {
      const permalink = 'https://dly.to/testuser';
      renderComponent(permalink);

      expect(mockUseShareOrCopyLink).toHaveBeenCalledWith({
        link: permalink,
        text: 'Check out my profile on daily.dev!',
        logObject: expect.any(Function),
      });
    });
  });

  describe('Social share buttons', () => {
    it('should have correct href attributes', () => {
      const permalink = 'https://dly.to/testuser';
      renderComponent(permalink);

      const twitterButton = screen.getByLabelText('Share on X');
      expect(twitterButton).toHaveAttribute('href');
      expect(twitterButton).toHaveAttribute(
        'href',
        expect.stringContaining('twitter.com'),
      );
      expect(twitterButton).toHaveAttribute(
        'href',
        expect.stringContaining(encodeURIComponent(permalink)),
      );
    });

    it('should log event when social share button is clicked', () => {
      renderComponent();

      const twitterButton = screen.getByLabelText('Share on X');
      fireEvent.click(twitterButton);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'share profile',
        target_type: 'profile page',
        extra: JSON.stringify({ provider: ShareProvider.Twitter }),
      });
    });

    it('should open links in new tab with correct rel attribute', () => {
      renderComponent();

      const twitterButton = screen.getByLabelText('Share on X');
      expect(twitterButton).toHaveAttribute('target', '_blank');
      expect(twitterButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Native share', () => {
    let mockNavigatorShare: jest.Mock;

    beforeEach(() => {
      mockNavigatorShare = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockNavigatorShare,
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).navigator;
    });

    it('should render native share button when navigator.share is available', () => {
      renderComponent();

      expect(screen.getByLabelText('Share via...')).toBeInTheDocument();
    });

    it('should not render native share button when navigator.share is not available', () => {
      delete (globalThis as Record<string, unknown>).navigator;

      renderComponent();

      expect(screen.queryByLabelText('Share via...')).not.toBeInTheDocument();
    });

    it('should call navigator.share with correct data when native share button is clicked', async () => {
      const permalink = 'https://dly.to/testuser';
      renderComponent(permalink);

      const nativeShareButton = screen.getByLabelText('Share via...');
      fireEvent.click(nativeShareButton);

      await waitFor(() => {
        expect(mockNavigatorShare).toHaveBeenCalledWith({
          title: 'My daily.dev profile',
          text: 'Check out my profile on daily.dev!',
          url: permalink,
        });
      });
    });

    it('should log event when native share is successful', async () => {
      renderComponent();

      const nativeShareButton = screen.getByLabelText('Share via...');
      fireEvent.click(nativeShareButton);

      await waitFor(() => {
        expect(mockLogEvent).toHaveBeenCalledWith({
          event_name: 'share profile',
          target_type: 'profile page',
          extra: JSON.stringify({ provider: ShareProvider.Native }),
        });
      });
    });
  });
});
