import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { GetAppButton } from './GetAppButton';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks';
import { appStoreUrl, playStoreUrl } from '../../../lib/constants';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: jest.fn(),
}));

const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseViewSize = useViewSize as jest.Mock;

const renderComponent = (props = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <GetAppButton {...props} />
    </TestBootProvider>,
  );

const triggerName = /get the daily\.dev mobile app/i;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
  mockUseConditionalFeature.mockReturnValue({ value: true, isLoading: false });
});

describe('GetAppButton', () => {
  it('should render the trigger when the feature is enabled on desktop', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: triggerName }),
    ).toBeInTheDocument();
  });

  it('should render nothing when the feature is off', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });
    renderComponent();

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  it('should render nothing below laptop, where the app is already at hand', () => {
    mockUseViewSize.mockReturnValue(false);
    renderComponent();

    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  it('should not evaluate the flag when the caller already resolved it', () => {
    renderComponent({ isFeatureEnabled: false });

    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
    expect(
      screen.queryByRole('button', { name: triggerName }),
    ).not.toBeInTheDocument();
  });

  it('should show the QR code and both store links once opened', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: triggerName }));

    expect(
      await screen.findByRole('img', { name: /qr code/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'App Store' })).toHaveAttribute(
      'href',
      appStoreUrl,
    );
    expect(screen.getByRole('link', { name: 'Google Play' })).toHaveAttribute(
      'href',
      playStoreUrl,
    );
  });

  it('should render the label instead of the tooltip when asked', () => {
    renderComponent({ showLabel: true });

    expect(screen.getByText('Get the app')).toBeInTheDocument();
  });
});
