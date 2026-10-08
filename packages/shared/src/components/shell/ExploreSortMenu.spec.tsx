import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { ExploreSortMenu } from './ExploreSortMenu';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const renderAt = (pathname: string) => {
  jest.mocked(useRouter).mockReturnValue({
    pathname,
    events: { on: jest.fn(), off: jest.fn() },
    replace: jest.fn(),
  } as unknown as NextRouter);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ExploreSortMenu />
    </QueryClientProvider>,
  );
};

describe('ExploreSortMenu', () => {
  it.each([
    ['/posts', 'Popular'],
    ['/popular', 'Popular'],
    ['/posts/latest', 'By date'],
  ])('names the sort of %s and offers no period', (pathname, label) => {
    renderAt(pathname);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(screen.queryByText('Period')).not.toBeInTheDocument();
  });

  it.each([
    ['/posts/upvoted', 'By upvotes'],
    ['/upvoted', 'By upvotes'],
    ['/posts/discussed', 'By comments'],
    ['/discussed', 'By comments'],
  ])('offers the period inside the sheet on %s', (pathname, label) => {
    renderAt(pathname);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));

    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('keeps every sort on its own address', () => {
    renderAt('/posts');

    fireEvent.click(screen.getByRole('button', { name: 'Popular' }));

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ).toEqual([
      '/posts',
      '/posts/upvoted',
      '/posts/discussed',
      '/posts/latest',
      '/posts/best-of',
    ]);
  });
});
