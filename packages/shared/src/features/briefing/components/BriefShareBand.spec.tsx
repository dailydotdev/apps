import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { BriefShareBand } from './BriefShareBand';
import type { Post } from '../../../graphql/posts';
import { LogEvent, Origin } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';

const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

const post = {
  id: 'brief-1',
  slug: 'brief-1',
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, {
    clipboard: { writeText },
  });
});

describe('BriefShareBand', () => {
  it('logs a copy from the end of the briefing under its own origin', async () => {
    render(
      <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
        <BriefShareBand post={post} />
      </TestBootProvider>,
    );

    expect(screen.getByText('Share this briefing')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());

    const shares = logEvent.mock.calls
      .map(([event]) => event)
      .filter((event) => event.event_name === LogEvent.SharePost)
      .map((event) => JSON.parse(event.extra));

    expect(shares).toEqual([
      expect.objectContaining({
        provider: ShareProvider.CopyLink,
        origin: Origin.EndOfBriefing,
      }),
    ]);
  });
});
