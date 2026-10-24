import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useInAppLinks } from './useInAppLinks';
import { openReadingFromFeed } from '../components/shell/readingStore';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('./useViewSize', () => ({
  useIsPhone: () => true,
}));

let mockOptedOut = false;

jest.mock('./useSettingsBooleanFlag', () => ({
  useSettingsBooleanFlag: () => ({ value: mockOptedOut }),
}));

type BridgeGlobal = typeof globalThis & { webkit?: unknown };

const postMessage = jest.fn();

const Page = () => {
  useInAppLinks();
  return (
    <>
      <a href="https://blog.example.com/post">Outside</a>
      <a href="/posts/p1">Inside</a>
    </>
  );
};

beforeEach(() => {
  postMessage.mockClear();
  mockPush.mockClear();
  (globalThis as BridgeGlobal).webkit = {
    messageHandlers: { reading: { postMessage } },
  };
  document.documentElement.classList.add('ios');
});

afterEach(() => {
  delete (globalThis as BridgeGlobal).webkit;
  document.documentElement.classList.remove('ios');
});

describe('useInAppLinks', () => {
  it('sends a feed card Read to the post page with the article queued', () => {
    mockOptedOut = false;
    render(<Page />);

    const taken = openReadingFromFeed({
      id: 'p1',
      slug: 'a-post-p1',
      url: 'https://api.daily.dev/r/p1',
    });

    expect(taken).toBe(true);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('posts/a-post-p1'),
    );
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('hands every link out of the app to the system browser when turned off', () => {
    mockOptedOut = true;
    render(<Page />);

    fireEvent.click(screen.getByText('Inside'));
    expect(postMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Outside'));
    expect(postMessage).toHaveBeenCalledWith({
      action: 'external',
      url: 'https://blog.example.com/post',
    });
    expect(
      openReadingFromFeed({ id: 'p1', url: 'https://api.daily.dev/r/p1' }),
    ).toBe(false);
  });
});
