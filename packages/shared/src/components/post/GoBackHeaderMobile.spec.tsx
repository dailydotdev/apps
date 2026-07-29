import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { GoBackButton } from './GoBackHeaderMobile';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/utils/useFeatureTheme', () => ({
  useFeatureTheme: jest.fn(),
}));

describe('GoBackButton', () => {
  it('uses the fallback path when there is no browser history', () => {
    const push = jest.fn();
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push, back } as never);

    render(<GoBackButton showLogo={false} fallbackPath="/" />);

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });

  it('goes back when the referrer is another page on the same site', () => {
    const push = jest.fn();
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push, back } as never);
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: `${window.location.origin}/posts/internal-post`,
    });
    window.history.pushState({}, '', '/profile');

    render(<GoBackButton showLogo={false} fallbackPath="/" />);

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });
});
