import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelEditTags } from './FunnelEditTags';
import { FunnelBrowserExtension } from './FunnelBrowserExtension';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import { FunnelStepType } from '../types/funnel';

jest.mock('../../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: () => ({ feedSettings: { includeTags: [] } }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  __esModule: true,
  default: { Consumer: null },
  useAuthContext: () => ({ user: { id: 'u1' }, trackingId: 't1' }),
}));

jest.mock('../../../components/onboarding', () => ({
  EditTag: () => <div data-testid="edit-tag" />,
}));

jest.mock(
  '../../../components/onboarding/Extension/useOnboardingExtension',
  () => ({
    useOnboardingExtension: () => ({
      browserName: 'chrome',
      shouldShowExtensionOnboarding: true,
      isReady: true,
    }),
  }),
);

jest.mock('../../../contexts/SettingsContext', () => ({
  ThemeMode: { Dark: 'dark' },
  useSettingsContext: () => ({ applyThemeMode: jest.fn() }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('next/router', () => ({ useRouter: () => ({ query: {} }) }));

const renderInFunnel = (ui: React.ReactElement, isOnboarding: boolean) =>
  render(
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: 3 }],
        position: { chapter: 0, step: 0 },
        isOnboarding,
      }}
    >
      {ui}
    </FunnelProgressContext.Provider>,
  );

const editTags = (
  <FunnelEditTags
    id="edit-tags"
    type={FunnelStepType.EditTags}
    transitions={[]}
    isActive
    onTransition={jest.fn()}
    parameters={{ headline: 'Pick tags', minimumRequirement: 5 }}
  />
);

const browserExtension = (
  <FunnelBrowserExtension
    id="extension"
    type={FunnelStepType.BrowserExtension}
    transitions={[]}
    isActive
    onTransition={jest.fn()}
    parameters={{}}
  />
);

// Every one of these is a leak that reached `/helloworld` in an earlier
// revision. The paid funnel's steps must keep main's chrome: no docked glass
// CTA, and no second Skip on a step whose skip comes from the stepper header.
describe('paid funnel parity', () => {
  describe('edit tags', () => {
    // Main takes the CTA out of the accessibility tree with `aria-hidden` while
    // it is unusable, rather than showing a disabled button the way the funnel
    // does — which is also why it has no accessible name to query by.
    it('hides the CTA below the minimum instead of disabling it', () => {
      renderInFunnel(editTags, false);
      const cta = screen.getByRole('button', { hidden: true });

      expect(cta).toHaveAttribute('aria-hidden', 'true');
      expect(cta).not.toBeDisabled();
      expect(cta).toHaveClass('opacity-0', 'pointer-events-none');
    });

    it('disables the CTA in the onboarding funnel', () => {
      renderInFunnel(editTags, true);

      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });
  });

  describe('browser extension', () => {
    it('renders no skip button of its own outside the funnel', () => {
      renderInFunnel(browserExtension, false);

      expect(
        screen.queryByRole('button', { name: 'Skip' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /Get it for Chrome/ }),
      ).toBeInTheDocument();
    });

    it('docks the CTA and its own skip inside the funnel', () => {
      renderInFunnel(browserExtension, true);

      expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Add to Chrome/ }),
      ).toBeInTheDocument();
    });
  });
});
