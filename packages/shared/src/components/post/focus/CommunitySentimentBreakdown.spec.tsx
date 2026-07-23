import React from 'react';
import { render, screen } from '@testing-library/react';
import type { CommunitySentimentData } from './CommunitySentiment';
import { CommunitySentimentBreakdown } from './CommunitySentimentBreakdown';

const createData = (
  overrides: Partial<CommunitySentimentData> = {},
): CommunitySentimentData => ({
  breakdown: { positive: 20, mixed: 60, critical: 20 },
  tldr: 'The community has thoughts.',
  postCount: 1,
  sources: ['Hacker News'],
  pros: [],
  cons: [],
  bySource: [
    {
      source: 'hackernews',
      lean: 'mixed',
      note: 'No comments were present, so no community signal is available.',
    },
  ],
  highlights: [],
  openQuestions: [],
  discussions: [
    {
      provider: 'hackernews',
      url: 'https://news.ycombinator.com/item?id=1',
      points: 2,
      commentsCount: 0,
    },
  ],
  ...overrides,
});

describe('CommunitySentimentBreakdown', () => {
  it('hides the source lean and shows concise empty copy when a source has no comments', () => {
    render(<CommunitySentimentBreakdown data={createData()} />);

    expect(screen.getByText('Hacker News')).toBeInTheDocument();
    expect(screen.queryByText('Mixed')).not.toBeInTheDocument();
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'No comments were present, so no community signal is available.',
      ),
    ).not.toBeInTheDocument();
  });

  it('keeps the source lean when comments are available', () => {
    render(
      <CommunitySentimentBreakdown
        data={createData({
          bySource: [
            {
              source: 'hackernews',
              lean: 'positive',
              note: 'Developers are into this one.',
            },
          ],
          discussions: [
            {
              provider: 'hackernews',
              url: 'https://news.ycombinator.com/item?id=2',
              points: 42,
              commentsCount: 8,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(
      screen.getByText('Developers are into this one.'),
    ).toBeInTheDocument();
  });
});
