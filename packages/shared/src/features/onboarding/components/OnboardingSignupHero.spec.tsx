import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingSignupHero } from './OnboardingSignupHero';

jest.mock('../../../contexts/SettingsContext', () => ({
  ThemeMode: { Dark: 'dark' },
  useSettingsContext: () => ({ applyThemeMode: jest.fn() }),
}));

jest.mock('../../../components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo" />,
  LogoPosition: { Relative: 'relative' },
}));

jest.mock('../../../components/footer/FooterLinks', () => ({
  FooterLinks: () => <div data-testid="footer" />,
}));

jest.mock('../../../components/auth/SignupDisclaimer', () => ({
  __esModule: true,
  default: () => <div data-testid="disclaimer" />,
}));

// Isolate the shell from the (gql/context-heavy) background blocks.
jest.mock('./signupHero/HeroBackgroundLayer', () => ({
  HeroBackgroundLayer: ({
    background,
    imageMode,
  }: {
    background: string;
    imageMode: string;
  }) => (
    <div
      data-testid="bg-layer"
      data-background={background}
      data-image-mode={imageMode}
    />
  ),
}));

const renderHero = (
  props: Partial<React.ComponentProps<typeof OnboardingSignupHero>> = {},
) =>
  render(
    <OnboardingSignupHero background="desk" {...props}>
      <div data-testid="auth-form" />
    </OnboardingSignupHero>,
  );

describe('OnboardingSignupHero', () => {
  it('passes background and image mode to the background layer', () => {
    renderHero({ background: 'desk', imageMode: 'colors' });
    const layer = screen.getByTestId('bg-layer');
    expect(layer).toHaveAttribute('data-background', 'desk');
    expect(layer).toHaveAttribute('data-image-mode', 'colors');
  });

  it('renders aurora orbs by default', () => {
    renderHero();
    expect(screen.getByTestId('hero-orbs')).toBeInTheDocument();
  });

  it('omits aurora orbs when showOrbs is false', () => {
    renderHero({ showOrbs: false });
    expect(screen.queryByTestId('hero-orbs')).not.toBeInTheDocument();
  });

  it('renders the halo and vignette as part of the desk background', () => {
    renderHero({ background: 'desk' });
    expect(screen.getByTestId('hero-halo')).toBeInTheDocument();
  });

  it('omits the halo for the cards background', () => {
    renderHero({ background: 'cards' });
    expect(screen.queryByTestId('hero-halo')).not.toBeInTheDocument();
  });

  it('renders the form and headline', () => {
    renderHero({ headline: 'Hello devs' });
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByText('Hello devs')).toBeInTheDocument();
  });
});
