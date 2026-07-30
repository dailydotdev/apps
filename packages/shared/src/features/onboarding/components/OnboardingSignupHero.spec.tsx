import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingSignupHero } from './OnboardingSignupHero';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import { cloudinaryOnboardingLoginBackground } from '../../../lib/image';
import { useViewSize } from '../../../hooks';

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

jest.mock('../../../hooks', () => ({
  ViewSize: { MobileL: 'mobileL' },
  useViewSize: jest.fn(() => false),
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

// Same hero, wrapped in the post-signup funnel's progress context — which is
// how the component knows it is on `/onboarding` rather than the paid funnel.
const renderHeroInFunnel = (
  props: Partial<React.ComponentProps<typeof OnboardingSignupHero>> = {},
) =>
  render(
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: 1 }],
        position: { chapter: 0, step: 0 },
        isOnboarding: true,
      }}
    >
      <OnboardingSignupHero background="desk" {...props}>
        <div data-testid="auth-form" />
      </OnboardingSignupHero>
    </FunnelProgressContext.Provider>,
  );

describe('OnboardingSignupHero', () => {
  const mockUseViewSize = useViewSize as jest.MockedFunction<
    typeof useViewSize
  >;
  const getMobileImage = (container: HTMLElement): HTMLImageElement => {
    const image = container.querySelector('img[alt="Onboarding background"]');

    if (!(image instanceof HTMLImageElement)) {
      throw new Error('Expected hero mobile image to render');
    }

    return image;
  };

  beforeEach(() => {
    mockUseViewSize.mockReturnValue(false);
  });

  it('passes background and image mode to the background layer', () => {
    renderHero({ background: 'desk', imageMode: 'colors' });
    const layer = screen.getByTestId('bg-layer');
    expect(layer).toHaveAttribute('data-background', 'desk');
    expect(layer).toHaveAttribute('data-image-mode', 'colors');
  });

  it('renders the default mobile image background', () => {
    mockUseViewSize.mockReturnValue(true);
    const { container } = renderHero();
    expect(getMobileImage(container)).toHaveAttribute(
      'src',
      cloudinaryOnboardingLoginBackground,
    );
  });

  it('supports a custom mobile image background', () => {
    mockUseViewSize.mockReturnValue(true);
    const imageMobile = 'https://media.daily.dev/custom-mobile-background';
    const { container } = renderHero({ imageMobile });
    expect(getMobileImage(container)).toHaveAttribute('src', imageMobile);
  });

  it('uses the organic signup mobile headline treatment', () => {
    mockUseViewSize.mockReturnValue(true);
    renderHero({ headline: 'Hello devs' });
    expect(screen.getByText('Hello devs')).toHaveClass('typo-title2');
    expect(screen.getByText('Hello devs')).not.toHaveClass('onb-headline');
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

  it('renders the hero cover and the full element set for the panel background', () => {
    renderHero({ background: 'panel', headline: 'Hello devs' });
    expect(screen.getAllByTestId('landing-hero-cover').length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByTestId('bg-layer')).not.toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Hello devs')).toBeInTheDocument();
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();
  });

  describe('legal row on the panel background', () => {
    // jsdom does not evaluate media queries, so an element hidden by a `hidden`
    // class is still in the DOM and a presence assertion proves nothing. The
    // breakpoint it reappears at has to be read off the class list instead.
    const revealBreakpoint = (element: HTMLElement): string | undefined => {
      let node = element.parentElement;

      while (node) {
        if (/(^|\s)hidden(\s|$)/.test(node.className)) {
          return node.className.match(/(\w+):(?:flex|block)/)?.[1];
        }
        node = node.parentElement;
      }

      return undefined;
    };

    // The cards/desk walls render neither below `tablet` (their `isMobile`
    // branch omits both), so the panel matches rather than becoming the only
    // wall with a phone-width disclosure.
    it('reveals the signup disclosure at the same breakpoint as the other walls', () => {
      renderHero({ background: 'panel' });

      expect(revealBreakpoint(screen.getByTestId('disclaimer'))).toBe('tablet');
    });

    it('holds the footer links back to the two-column layout', () => {
      renderHero({ background: 'panel' });

      expect(revealBreakpoint(screen.getByTestId('footer'))).toBe('laptop');
    });
  });

  it('renders the form and headline', () => {
    renderHero({ headline: 'Hello devs' });
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByText('Hello devs')).toBeInTheDocument();
  });

  describe('when the form is expanded (email step)', () => {
    it('drops the marketing background and headline', () => {
      renderHero({ headline: 'Hello devs', isFormExpanded: true });
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.queryByTestId('bg-layer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero-orbs')).not.toBeInTheDocument();
      expect(screen.queryByText('Hello devs')).not.toBeInTheDocument();
    });

    it('drops the background on mobile too', () => {
      mockUseViewSize.mockReturnValue(true);
      renderHero({ isFormExpanded: true });
      expect(
        screen.queryByAltText('Onboarding background'),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    // The shell carries no footer chrome and no consent line of its own: it
    // also serves sign-back and verify-email, where the account already exists.
    // The Terms/Privacy notice belongs to RegistrationForm, which renders it
    // under the button that creates the account.
    it('renders neither footer links nor a disclaimer in the funnel', () => {
      renderHeroInFunnel({ isFormExpanded: true });
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('disclaimer')).not.toBeInTheDocument();
    });
  });
});
