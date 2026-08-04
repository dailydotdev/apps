import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailCodeVerification from './EmailCodeVerification';
import { funnelGlassBarCta } from '../../features/onboarding/shared/FunnelGlassBar';

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../contexts/AuthDataContext', () => ({
  useAuthData: () => ({ email: 'ada@daily.dev' }),
}));

const onVerifyCode = jest.fn();
const onSubmit = jest.fn();

const renderComponent = async (props = {}) => {
  await act(async () => {
    render(
      <EmailCodeVerification
        onVerifyCode={onVerifyCode}
        onSubmit={onSubmit}
        {...props}
      />,
    );
  });
};

const getInput = () => screen.getByRole('textbox') as HTMLInputElement;

describe('EmailCodeVerification', () => {
  beforeEach(() => {
    onVerifyCode.mockReset().mockResolvedValue(undefined);
    onSubmit.mockReset();
  });

  it('should verify a code carried in by the email link without interaction', async () => {
    await renderComponent({ code: '725432' });

    expect(getInput()).toHaveValue('725432');
    expect(onVerifyCode).toHaveBeenCalledTimes(1);
    expect(onVerifyCode).toHaveBeenCalledWith('725432');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should not verify a partial code carried in by the email link', async () => {
    await renderComponent({ code: '725' });

    expect(getInput()).toHaveValue('725');
    expect(onVerifyCode).not.toHaveBeenCalled();
  });

  it('should wait for the reader when no code was linked', async () => {
    await renderComponent();

    expect(getInput()).toHaveValue('');
    expect(onVerifyCode).not.toHaveBeenCalled();
  });

  it('should keep the Verify button as the fallback when a linked code fails', async () => {
    onVerifyCode.mockRejectedValueOnce(new Error('Invalid code'));
    await renderComponent({ code: '725432' });

    expect(screen.getByText('Invalid code')).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    });

    expect(onVerifyCode).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should verify the code the reader typed', async () => {
    await renderComponent();

    await act(async () => {
      await userEvent.type(getInput(), '725432');
    });

    expect(onVerifyCode).toHaveBeenCalledWith('725432');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should clear a failed attempt hint as soon as the code is edited', async () => {
    onVerifyCode.mockRejectedValueOnce(new Error('Invalid code'));
    await renderComponent({ code: '725432' });

    expect(screen.getByText('Invalid code')).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(getInput(), '{backspace}');
    });

    expect(screen.queryByText('Invalid code')).not.toBeInTheDocument();
  });

  it('should render the funnel glass bar CTA in the onboarding funnel', async () => {
    await renderComponent({ isOnboardingFunnel: true });

    expect(screen.getByRole('button', { name: 'Verify' })).toHaveClass(
      ...funnelGlassBarCta.split(' '),
    );
  });
});
