import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthHeader from './AuthHeader';
import { onboardingHeadlineClasses } from '../onboarding/common';

// `onboardingHeadline` exists so the two screens that sit in FRONT of the
// onboarding funnel (account details, verify email) can take the funnel's
// headline scale. It is deliberately separate from `simplified`, which eleven
// other surfaces set — including the paid /helloworld funnel and the recruiter
// sign-in modals — so these assert both directions.
describe('AuthHeader', () => {
  it('takes the funnel headline scale when onboardingHeadline is set', () => {
    render(
      <AuthHeader simplified onboardingHeadline title="Verify your email" />,
    );

    const heading = screen.getByRole('heading', { name: 'Verify your email' });

    onboardingHeadlineClasses.split(' ').forEach((className) => {
      expect(heading).toHaveClass(className);
    });
  });

  it('keeps the original simplified scale for every other surface', () => {
    render(<AuthHeader simplified title="Sign up" />);

    const heading = screen.getByRole('heading', { name: 'Sign up' });

    expect(heading).toHaveClass('typo-title2');
    expect(heading).not.toHaveClass('typo-title1');
  });

  it('offers a back button on the simplified variant when onBack is given', async () => {
    const onBack = jest.fn();
    render(<AuthHeader simplified title="Verify your email" onBack={onBack} />);

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the bare heading DOM when simplified has no onBack', () => {
    render(<AuthHeader simplified title="Sign up" />);

    const heading = screen.getByRole('heading', { name: 'Sign up' });

    expect(heading.parentElement).not.toHaveClass('relative');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
