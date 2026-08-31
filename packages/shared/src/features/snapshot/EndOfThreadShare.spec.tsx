import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { EndOfThreadShare } from './EndOfThreadShare';

const renderBand = (commentsCount: number) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <EndOfThreadShare commentsCount={commentsCount} post={post} />
    </TestBootProvider>,
  );

describe('EndOfThreadShare', () => {
  it('offers the link at the end of a conversation', () => {
    renderBand(24);

    expect(screen.getByText('Enjoyed this discussion?')).toBeInTheDocument();
    expect(screen.getByText('24 comments and counting')).toBeInTheDocument();
  });

  it('counts one comment in the singular', () => {
    renderBand(1);

    expect(screen.getByText('1 comment and counting')).toBeInTheDocument();
  });

  it('stays away when there is no conversation to pass on', () => {
    renderBand(0);

    expect(
      screen.queryByText('Enjoyed this discussion?'),
    ).not.toBeInTheDocument();
  });
});
