import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { LAYOUT_FRAME_CLASS } from '@dailydotdev/shared/src/lib/layoutVariant';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import * as banner from '@dailydotdev/shared/src/hooks/useBanner';
import { BannerCustomTheme } from '@dailydotdev/shared/src/graphql/banner';
import * as laptopLayout from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import MainLayout from '../components/layouts/MainLayout';

describe('MainLayout', () => {
  const showLogin = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    showLogin.mockReset();
    jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(false);
  });

  const renderLayout = (user: LoggedUser | null = null): RenderResult => {
    const client = new QueryClient();

    return render(
      <TestBootProvider
        client={client}
        auth={{ user: user as LoggedUser, isLoggedIn: !!user, showLogin }}
      >
        <MainLayout />
      </TestBootProvider>,
    );
  };

  const user = {
    id: 'u1',
    username: 'idoshamun',
    name: 'Ido Shamun',
    providers: ['github'],
    email: 'ido@acme.com',
    image: 'https://daily.dev/ido.png',
    createdAt: '',
    reputation: 5,
    permalink: 'https://app.daily.dev/ido',
    infoConfirmed: true,
  } as LoggedUser;

  it('hands the header to the rail on laptop when logged-in', async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    const { container } = renderLayout(user);

    await screen.findByRole('main');
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Sign in to daily.dev' }),
    ).not.toBeInTheDocument();
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).not.toHaveClass('laptop:[--sticky-header-offset:4rem]');
  });

  it('hands the header to the rail on laptop for an anonymous visitor', async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    const { container } = renderLayout();

    await screen.findByRole('main');
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).toBeInTheDocument();

    const strip = screen.getByRole('region', { name: 'Sign in to daily.dev' });
    fireEvent.click(within(strip).getByRole('button', { name: 'Log in' }));
    expect(showLogin).toHaveBeenCalledWith(
      expect.objectContaining({ options: { isLogin: true } }),
    );
    fireEvent.click(within(strip).getByRole('button', { name: 'Sign up' }));
    expect(showLogin).toHaveBeenLastCalledWith(
      expect.objectContaining({ options: { isLogin: false } }),
    );
  });

  it('pins the sign-in strip under the promotional banner', async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    jest.spyOn(banner, 'useBanner').mockReturnValue({
      isAvailable: true,
      dismiss: jest.fn(),
      latestBanner: {
        timestamp: '2026-10-25T00:00:00.000Z',
        cta: 'Read more',
        subtitle: 'subtitle',
        theme: BannerCustomTheme.CabbageOnion,
        title: 'Banner',
        url: 'https://daily.dev',
      },
    });
    const { container } = renderLayout();

    await screen.findByRole('main');
    expect(
      screen.getByRole('region', { name: 'Sign in to daily.dev' }),
    ).toHaveClass('sticky', 'top-[var(--sticky-header-offset,0px)]');
    expect(screen.getByRole('main')).toHaveClass(
      'laptop:[--sticky-header-offset:2rem]',
    );
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).toHaveClass(
      'laptop:[--sticky-header-offset:6rem]',
      'laptop:peer-empty/top-hero:min-h-[calc(100vh-8.25rem)]',
    );
  });

  it("pins the card's sticky content under the sign-in strip", async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    const { container } = renderLayout();

    await screen.findByRole('main');
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).toHaveClass('laptop:[--sticky-header-offset:4rem]');
  });

  it('keeps the frame level with the window under the sign-in strip', async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    const { container } = renderLayout();

    await screen.findByRole('main');
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).toHaveClass(
      'laptop:peer-empty/top-hero:min-h-[calc(100vh-6.25rem)]',
      'laptop:peer-empty/top-hero:has-[.feed-dock]:min-h-[calc(100vh-5.5rem)]',
    );
  });

  it('keeps the global header below laptop for an anonymous visitor', async () => {
    renderLayout();

    await screen.findByRole('main');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Sign in to daily.dev' }),
    ).not.toBeInTheDocument();
  });

  it('should show profile image and reputation when logged-in', async () => {
    renderLayout(user);
    const [el] = await screen.findAllByAltText(`idoshamun's profile`);
    expect(el).toHaveAttribute('src', 'https://daily.dev/ido.png');
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
