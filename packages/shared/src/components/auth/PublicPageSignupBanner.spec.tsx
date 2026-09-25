import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { PublicPageSignupBanner } from './PublicPageSignupBanner';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('./PostAuthBanner', () => ({
  PostAuthBanner: () => <div data-testid="post-auth-banner" />,
}));

const mockUseViewSize = useViewSize as jest.Mock;

const renderComponent = (auth = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{
        isAuthReady: true,
        isLoggedIn: false,
        user: undefined,
        ...auth,
      }}
    >
      <PublicPageSignupBanner />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
});

describe('PublicPageSignupBanner', () => {
  it('should render the banner and its clearance for anonymous laptop visitors', () => {
    const { container } = renderComponent();

    expect(screen.getByTestId('post-auth-banner')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('h-72');
  });

  it('should render nothing for logged-in users', () => {
    const { container } = renderComponent({
      isLoggedIn: true,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing until boot answers', () => {
    const { container } = renderComponent({ isAuthReady: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing below the laptop breakpoint', () => {
    mockUseViewSize.mockReturnValue(false);
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });
});
