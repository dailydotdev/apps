import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useShellPush } from './useShellPush';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    events: { on: () => undefined, off: () => undefined },
  }),
}));

let mockIsPhone = true;

jest.mock('./useViewSize', () => ({
  useIsPhone: () => mockIsPhone,
}));

const Page = () => {
  useShellPush();
  return (
    <>
      <a href="/posts/p1">A post</a>
      <a href="/">Home</a>
      <a href="https://blog.example.com/post">Outside</a>
      <a href="/posts/p2" target="_blank">
        A post in a new tab
      </a>
    </>
  );
};

beforeEach(() => {
  mockPush.mockClear();
  mockIsPhone = true;
});

describe('useShellPush', () => {
  it('moves to a page opened from content', () => {
    render(<Page />);

    fireEvent.click(screen.getByText('A post'));

    expect(mockPush).toHaveBeenCalledWith('/posts/p1');
  });

  it('leaves root, outside and new-tab links to their own handlers', () => {
    render(<Page />);

    fireEvent.click(screen.getByText('Home'));
    fireEvent.click(screen.getByText('Outside'));
    fireEvent.click(screen.getByText('A post in a new tab'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does nothing beyond phones', () => {
    mockIsPhone = false;
    render(<Page />);

    fireEvent.click(screen.getByText('A post'));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
