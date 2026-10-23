import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
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

  // it('should show login button when not logged-in', async () => {
  //   renderLayout();
  //   // Experiment doesn't support mobile resolution which both yields two elements.
  //   expect(await screen.findAllByText('Access all features')).toHaveLength(2);
  //   expect(await screen.findAllByText('Sign up')).toHaveLength(2);
  // });

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
  });

  it('hands the header to the rail on laptop when logged-out, keeping sign up reachable', async () => {
    jest.spyOn(laptopLayout, 'useLaptopLayout').mockReturnValue(true);
    renderLayout();

    expect(await screen.findByText('Sign up')).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('should show profile image and reputation when logged-in', async () => {
    renderLayout({
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
    } as LoggedUser);
    const [el] = await screen.findAllByAltText(`idoshamun's profile`);
    expect(el).toHaveAttribute('src', 'https://daily.dev/ido.png');
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
