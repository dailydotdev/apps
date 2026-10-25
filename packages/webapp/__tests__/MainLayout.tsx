import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { LAYOUT_FRAME_CLASS } from '@dailydotdev/shared/src/lib/layoutVariant';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import * as laptopLayout from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import MainLayout from '../components/layouts/MainLayout';

describe('MainLayout', () => {
  const showLogin = jest.fn();

  beforeEach(() => {
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
    renderLayout(user);

    await screen.findByRole('main');
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Sign in to daily.dev' }),
    ).not.toBeInTheDocument();
  });

  // The visitor gets the member's shell — rail, floating card, no global
  // header — with the sign-in strip as the card's top banner in place of the
  // header's Log in / Sign up pair.
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
