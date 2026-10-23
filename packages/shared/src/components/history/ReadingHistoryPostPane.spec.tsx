import React from 'react';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { ReadingHistoryPostPane } from './ReadingHistoryPostPane';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ApiError } from '../../graphql/common';

beforeEach(() => {
  nock.cleanAll();
});

const replyWithError = (code: string) =>
  nock('http://localhost:3000')
    .post('/graphql')
    .reply(200, { errors: [{ message: 'error', extensions: { code } }] });

const renderPane = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ReadingHistoryPostPane postId="p1" onHide={jest.fn()} />
    </TestBootProvider>,
  );

describe('ReadingHistoryPostPane', () => {
  it('should offer to remove a post that is gone', async () => {
    replyWithError(ApiError.NotFound);
    renderPane();
    await screen.findByText('This post is no longer available');
    expect(screen.getByText('Remove from history')).toBeInTheDocument();
  });

  it('should offer a retry, not removal, when the post fails to load', async () => {
    replyWithError('INTERNAL_SERVER_ERROR');
    renderPane();
    await screen.findByText("We couldn't load this post");
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.queryByText('Remove from history')).not.toBeInTheDocument();
  });
});
