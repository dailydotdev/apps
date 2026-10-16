import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedbackThread } from './FeedbackThread';
import type { FeedbackItem } from '../../graphql/feedback';
import { FeedbackCategory, FeedbackStatus } from '../../graphql/feedback';

const item: FeedbackItem = {
  id: 'f1',
  category: FeedbackCategory.BugReport,
  description: 'The feed is empty',
  status: FeedbackStatus.Accepted,
  createdAt: '2026-08-02T10:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z',
  user: { id: 'u1', name: 'Ada', username: 'ada' },
  replies: [
    {
      id: 'r1',
      body: 'Looking into it',
      authorName: 'Chris',
      isTeam: true,
      author: { id: 'u2', name: 'Chris', username: 'chris' },
      createdAt: '2026-08-02T11:00:00.000Z',
    },
  ],
};

const renderThread = (props: Partial<Parameters<typeof FeedbackThread>[0]>) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <FeedbackThread item={item} isTeam={false} viewerId="u1" {...props} />
    </QueryClientProvider>,
  );

describe('FeedbackThread', () => {
  it('should give team members the status actions', () => {
    renderThread({ isTeam: true, viewerId: 'u2' });

    expect(screen.getByText('Resolve')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
    expect(screen.getByText('Mark as spam')).toBeInTheDocument();
    expect(screen.queryByText('Mark as resolved')).not.toBeInTheDocument();
  });

  it('should only let the author resolve and explain reopening', () => {
    renderThread({
      item: { ...item, status: FeedbackStatus.Completed },
    });

    expect(screen.queryByText('Resolve')).not.toBeInTheDocument();
    expect(screen.queryByText('Mark as resolved')).not.toBeInTheDocument();
    expect(
      screen.getByText('Replying reopens this feedback for the team.'),
    ).toBeInTheDocument();
    expect(screen.getByText('daily.dev team')).toBeInTheDocument();
  });

  it('should not let the author reply to spam', () => {
    renderThread({ item: { ...item, status: FeedbackStatus.Spam } });

    expect(screen.queryByLabelText('Reply')).not.toBeInTheDocument();
    expect(screen.getByText('This feedback is closed.')).toBeInTheDocument();
  });
});
