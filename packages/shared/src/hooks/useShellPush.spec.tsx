import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useShellPush } from './useShellPush';
import { claimShellClick } from '../components/shell/shellMove';

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
      <div data-shell-row>
        <a href="/feeds/f1">A custom feed tab</a>
      </div>
      <a
        href="/posts/p3"
        onClick={(event) => claimShellClick(event.nativeEvent)}
      >
        A post that opens a modal
      </a>
    </>
  );
};

beforeEach(() => {
  jest.useFakeTimers();
  mockPush.mockClear();
  mockIsPhone = true;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useShellPush', () => {
  it('moves to a page opened from content', () => {
    render(<Page />);

    fireEvent.click(screen.getByText('A post'));
    jest.runAllTimers();

    expect(mockPush).toHaveBeenCalledWith('/posts/p1');
  });

  it('leaves root, outside and new-tab links to their own handlers', () => {
    render(<Page />);

    fireEvent.click(screen.getByText('Home'));
    fireEvent.click(screen.getByText('Outside'));
    fireEvent.click(screen.getByText('A post in a new tab'));
    jest.runAllTimers();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('leaves tabs and claimed clicks to their own handlers', () => {
    render(<Page />);

    fireEvent.click(screen.getByText('A custom feed tab'));
    fireEvent.click(screen.getByText('A post that opens a modal'));
    jest.runAllTimers();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does nothing beyond phones', () => {
    mockIsPhone = false;
    render(<Page />);

    fireEvent.click(screen.getByText('A post'));
    jest.runAllTimers();

    expect(mockPush).not.toHaveBeenCalled();
  });
});
