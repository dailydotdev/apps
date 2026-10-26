import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { usePostPrefetch } from './usePostPrefetch';

const mockPrefetch = jest.fn(() => Promise.resolve());

jest.mock('next/router', () => ({
  useRouter: () => ({ prefetch: mockPrefetch }),
}));

let mockIsPhone = true;

jest.mock('./useViewSize', () => ({
  useIsPhone: () => mockIsPhone,
}));

const Page = () => {
  usePostPrefetch();
  return (
    <>
      <a href="/posts/p1">A post</a>
      <a href="/">Home</a>
      <a href="https://blog.example.com/post">Outside</a>
    </>
  );
};

beforeEach(() => {
  mockPrefetch.mockClear();
  mockIsPhone = true;
});

describe('usePostPrefetch', () => {
  it('fetches the page a finger lands on, once', () => {
    render(<Page />);

    fireEvent.pointerDown(screen.getByText('A post'));
    fireEvent.pointerDown(screen.getByText('A post'));
    fireEvent.pointerDown(screen.getByText('Home'));
    fireEvent.pointerDown(screen.getByText('Outside'));

    expect(mockPrefetch).toHaveBeenCalledTimes(1);
    expect(mockPrefetch).toHaveBeenCalledWith('/posts/p1');
  });

  it('does nothing beyond phones', () => {
    mockIsPhone = false;
    render(<Page />);

    fireEvent.pointerDown(screen.getByText('A post'));

    expect(mockPrefetch).not.toHaveBeenCalled();
  });
});
