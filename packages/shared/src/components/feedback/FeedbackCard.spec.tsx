import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedbackCard } from './FeedbackCard';
import type { FeedbackItem } from '../../graphql/feedback';
import { FeedbackCategory, FeedbackStatus } from '../../graphql/feedback';

const longUrl =
  'https://app.daily.dev/posts/a-very-long-post-slug?utm_source=feedback&utm_campaign=bug';

const item: FeedbackItem = {
  id: 'f1',
  category: FeedbackCategory.BugReport,
  description: `The app is broken on ${longUrl}`,
  status: FeedbackStatus.Pending,
  createdAt: '2026-08-02T10:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z',
  replies: [
    {
      id: 'r1',
      body: `Tracked here: ${longUrl}`,
      authorName: 'Chris',
      createdAt: '2026-08-02T11:00:00.000Z',
    },
  ],
};

describe('FeedbackCard', () => {
  // An unbreakable URL widens the card's min-content, which grows the column
  // rendering it and scrolls the whole page sideways on mobile.
  it('should let long URLs wrap mid-token', () => {
    render(<FeedbackCard item={item} isExpanded onToggleExpand={jest.fn()} />);

    expect(screen.getByText(item.description)).toHaveClass('break-words');
    expect(screen.getByText(item.replies[0].body)).toHaveClass('break-words');
  });
});
