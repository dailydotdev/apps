import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import type { LoggedUser } from '../../lib/user';
import { ShellBlock } from './ShellBlock';
import { ShellPage, ShellPageProvider } from './ShellPageContext';
import { ShellRoot } from './shellNav';
import { revealShell } from './useShellScroll';
import { scroll } from './constants';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/streaks', () => ({
  useReadingStreak: () => ({
    streak: undefined,
    isLoading: false,
    isStreaksEnabled: false,
  }),
}));

jest.mock('../../features/getApp/hooks/useMobileAppHeader', () => ({
  useMobileAppHeader: () => false,
}));

jest.mock('../header/QuestHeaderButton', () => ({
  QuestHeaderButton: () => <button type="button" aria-label="Quests" />,
}));

jest.mock('./YouPage', () => ({
  YouDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" aria-label="You" /> : null,
}));

const user = {
  id: 'u1',
  username: 'ido',
  image: 'https://daily.dev/ido.png',
} as LoggedUser;

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

const renderBlock = (ui: React.ReactElement, pathname = '/') => {
  jest.mocked(useRouter).mockReturnValue({
    pathname,
    asPath: pathname,
    query: {},
    push: jest.fn(),
    back: jest.fn(),
  } as unknown as NextRouter);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={{ user, isLoggedIn: true } as unknown as AuthContextData}
      >
        <ShellPageProvider>{ui}</ShellPageProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.useFakeTimers();
  scrollTo(0);
  revealShell();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ShellBlock', () => {
  it('shows the brand row on Home with the avatar opening You', () => {
    renderBlock(<ShellBlock root={ShellRoot.Home} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => {
      screen.getByRole('button', { name: 'You' }).click();
    });

    expect(screen.getByRole('dialog', { name: 'You' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('names the other roots and gives Activity its settings door', () => {
    renderBlock(<ShellBlock root={ShellRoot.Activity} />, '/notifications');

    expect(
      screen.getByRole('heading', { name: 'Activity' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Notification settings')).toHaveAttribute(
      'href',
      expect.stringContaining('notifications/settings'),
    );
  });

  it('takes a leaf title and actions from the page', () => {
    renderBlock(
      <>
        <ShellBlock />
        <ShellPage
          title="Posts"
          actions={<button type="button">Share</button>}
        />
      </>,
      '/[userId]/posts',
    );

    expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Posts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });

  it('renders nothing for a page that draws its own chrome', () => {
    renderBlock(
      <>
        <ShellBlock />
        <ShellPage hidden />
      </>,
      '/plus',
    );

    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('slides out of view while reading down and marks itself hidden', () => {
    renderBlock(<ShellBlock root={ShellRoot.Home} />);
    const header = screen
      .getByLabelText('You')
      .closest('header') as HTMLElement;

    act(() => {
      scrollTo(200);
      scrollTo(400);
      jest.advanceTimersByTime(scroll.stop);
    });

    expect(header.style.transform).toContain('* 1)');
    expect(header).toHaveAttribute('aria-hidden', 'true');
    expect(document.documentElement).toHaveClass('shell-edge');

    act(() => {
      scrollTo(300);
      jest.advanceTimersByTime(scroll.stop);
    });

    expect(document.documentElement).not.toHaveClass('shell-edge');
  });

  it('carries the offline strip while the network is down', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    renderBlock(<ShellBlock root={ShellRoot.Home} />);

    expect(screen.getByRole('status')).toHaveTextContent("You're offline");

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
