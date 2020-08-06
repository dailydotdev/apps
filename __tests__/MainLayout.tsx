import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import MainLayout from '../components/MainLayout';
import UserContext from '../components/UserContext';
import { LoggedUser } from '../lib/user';

const renderLayout = (user: LoggedUser = null): RenderResult => {
  return render(
    <UserContext.Provider value={user}>
      <MainLayout />
    </UserContext.Provider>,
  );
};

it('should show login button when not logged-in', async () => {
  const res = renderLayout();
  await res.findByText('Login');
});

it('should show profile image when logged-in', async () => {
  const res = renderLayout({
    id: 'u1',
    image: 'https://daily.dev/ido.png',
    providers: ['github'],
  });
  const el = await res.findByAltText('Your profile image');
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});
