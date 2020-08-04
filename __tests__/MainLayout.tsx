import React from 'react';
import { render, RenderResult, waitFor } from '@testing-library/react';
import MainLayout, { Props } from '../components/MainLayout';

const renderLayout = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    isLoggedIn: false,
    user: { id: 'u1' },
  };

  return render(<MainLayout {...defaultProps} {...props} />);
};

it('should show login button when not logged-in', async () => {
  const res = renderLayout();
  await waitFor(() => res.getByText('Login'));
});

it('should show profile image when logged-in', async () => {
  const res = renderLayout({
    isLoggedIn: true,
    user: {
      id: 'u1',
      image: 'https://daily.dev/ido.png',
    },
  });
  const el = await waitFor(() => res.getByAltText('Your profile image'));
  expect(el).toHaveAttribute('data-src', 'https://daily.dev/ido.png');
});
