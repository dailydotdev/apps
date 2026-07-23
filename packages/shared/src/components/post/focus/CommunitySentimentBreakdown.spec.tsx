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
  it('does not render a source row when that source has no comments', () => {
    render(<CommunitySentimentBreakdown data={createData()} />);

    expect(screen.queryByText('Hacker News')).not.toBeInTheDocument();
    expect(screen.queryByText('Mixed')).not.toBeInTheDocument();
    expect(screen.queryByText('No comments yet')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'No comments were present, so no community signal is available.',
      ),
    ).not.toBeInTheDocument();
  });

  it('keeps the rest of the breakdown when one source has no comments', () => {
    render(
      <CommunitySentimentBreakdown
        data={createData({
          pros: ['Developers like the practical examples.'],
          bySource: [
            {
              source: 'hackernews',
              lean: 'mixed',
              note: 'No comments were present, so no community signal is available.',
            },
            {
              source: 'lobsters',
              lean: 'skeptical',
              note: 'Developers want stronger benchmarks.',
            },
          ],
          discussions: [
            {
              provider: 'hackernews',
              url: 'https://news.ycombinator.com/item?id=1',
              points: 2,
              commentsCount: 0,
            },
            {
              provider: 'lobsters',
              url: 'https://lobste.rs/s/example',
              points: 12,
              commentsCount: 5,
            },
          ],
        })}
      />,
    );

    expect(
      screen.getByText('Developers like the practical examples.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Hacker News')).not.toBeInTheDocument();
    expect(screen.getByText('Lobsters')).toBeInTheDocument();
    expect(screen.getByText('Skeptical')).toBeInTheDocument();
    expect(
      screen.getByText('Developers want stronger benchmarks.'),
    ).toBeInTheDocument();
  });

  it('keeps a source row when another thread from the same provider has no comments', () => {
    render(
      <CommunitySentimentBreakdown
        data={createData({
          bySource: [
            {
              source: 'hackernews',
              lean: 'mixed',
              note: 'No comments were present, so no community signal is available.',
              url: 'https://news.ycombinator.com/item?id=1',
            },
            {
              source: 'lobsters',
              lean: 'skeptical',
              note: 'Developers want stronger benchmarks.',
              url: 'https://lobste.rs/s/with_comments',
            },
          ],
          discussions: [
            {
              provider: 'hackernews',
              url: 'https://news.ycombinator.com/item?id=1',
              points: 2,
              commentsCount: 0,
            },
            {
              provider: 'lobsters',
              url: 'https://lobste.rs/s/with_comments',
              points: 12,
              commentsCount: 5,
            },
            {
              provider: 'lobsters',
              url: 'https://lobste.rs/s/no_comments',
              points: 1,
              commentsCount: 0,
            },
          ],
        })}
      />,
    );

    expect(screen.queryByText('Hacker News')).not.toBeInTheDocument();
    expect(screen.getByText('Lobsters')).toBeInTheDocument();
    expect(screen.getByText('Skeptical')).toBeInTheDocument();
    expect(screen.getByText('12 points · 5 comments')).toBeInTheDocument();
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
