import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import post from '../../../__tests__/fixture/post';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { PostAppPrompt } from './PostAppPrompt';

const logEvent = jest.fn();

const renderComponent = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn: false }}
      log={{ logEvent }}
    >
      <PostAppPrompt post={post} />
    </TestBootProvider>,
  );

const userAgent = jest.spyOn(window.navigator, 'userAgent', 'get');

beforeEach(() => {
  jest.clearAllMocks();
  userAgent.mockReturnValue('Mozilla/5.0 (iPhone) Mobile Safari');
});

describe('PostAppPrompt', () => {
  it('should log an impression when it opens', () => {
    renderComponent();

    expect(screen.getByText('See this post in the app')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.PostAppPrompt,
    });
  });

  it('should log the open app click', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Open daily.dev'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.DownloadApp,
      target_type: TargetType.GetAppButton,
      target_id: TargetId.PostAppPrompt,
    });
  });

  it('should close on the close button', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(
      screen.queryByText('See this post in the app'),
    ).not.toBeInTheDocument();
  });

  it('should not cover the page for crawlers', () => {
    userAgent.mockReturnValue(
      'Mozilla/5.0 (Linux; Android 6.0.1) Mobile Safari (compatible; Googlebot/2.1)',
    );
    renderComponent();

    expect(
      screen.queryByText('See this post in the app'),
    ).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalled();
  });
});
