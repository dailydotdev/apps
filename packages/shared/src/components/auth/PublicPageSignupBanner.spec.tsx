import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { PublicPageSignupBanner } from './PublicPageSignupBanner';
import { useViewSize } from '../../hooks/useViewSize';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('./PostAuthBanner', () => ({
  PostAuthBanner: ({
    targetId,
    layout,
  }: {
    targetId?: string;
    layout?: string;
  }) => (
    <div
      data-testid="post-auth-banner"
      data-target-id={targetId}
      data-layout={layout}
    />
  ),
}));

// The banner loads lazily; the suite-wide dynamic mock resolves a tick late.
jest.mock('next/dynamic', () => () => {
  const { PostAuthBanner } = jest.requireMock('./PostAuthBanner');

  return PostAuthBanner;
});

const mockUseViewSize = useViewSize as jest.Mock;
const mockFeature = jest.mocked(useConditionalFeature);
const logEvent = jest.fn();

const impression = {
  event_name: LogEvent.Impression,
  target_type: TargetType.SignupButton,
  target_id: TargetId.PublicPageSignupBanner,
};

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
      log={{ logEvent }}
    >
      <PublicPageSignupBanner />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
  mockFeature.mockReturnValue({ value: false, isLoading: false });
});

describe('PublicPageSignupBanner', () => {
  it('should render the banner and its clearance for anonymous laptop visitors', async () => {
    const { container } = renderComponent();

    expect(await screen.findByTestId('post-auth-banner')).toHaveAttribute(
      'data-target-id',
      TargetId.PublicPageSignupBanner,
    );
    expect(container.firstElementChild).toHaveClass('h-72');
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(impression);
  });

  it('should keep the split layout while signup_strip_column is off', async () => {
    renderComponent();

    expect(await screen.findByTestId('post-auth-banner')).toHaveAttribute(
      'data-layout',
      'split',
    );
  });

  it('should render the column layout when signup_strip_column is on', async () => {
    mockFeature.mockReturnValue({ value: true, isLoading: false });
    renderComponent();

    expect(await screen.findByTestId('post-auth-banner')).toHaveAttribute(
      'data-layout',
      'column',
    );
  });

  it('should wait for the layout flag instead of flashing the control', () => {
    mockFeature.mockReturnValue({ value: false, isLoading: true });
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should render nothing for logged-in users', () => {
    const { container } = renderComponent({
      isLoggedIn: true,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should render nothing for a member known from the boot cache', () => {
    const { container } = renderComponent({
      isAuthReady: false,
      isAuthReadyOrCached: true,
      isLoggedIn: true,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
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
