import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelBrowserExtension } from './FunnelBrowserExtension';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import { FunnelStepType } from '../types/funnel';

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

const explainer = 'Unlock the power of every new tab';
const video = 'https://media.daily.dev/video/upload/custom.webm';

// A fresh element each time: React skips a subtree whose element is reused.
const step = () => (
  <FunnelProgressContext.Provider
    value={{
      chapters: [{ steps: 3 }],
      position: { chapter: 0, step: 0 },
      isOnboarding: true,
    }}
  >
    <FunnelBrowserExtension
      id="extension"
      type={FunnelStepType.BrowserExtension}
      transitions={[]}
      isActive
      onTransition={jest.fn()}
      parameters={{ explainer, video }}
    />
  </FunnelProgressContext.Provider>
);

const renderStep = () => render(step());

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('FunnelBrowserExtension', () => {
  it('shows the feature showcase instead of the explainer and video', () => {
    renderStep();

    expect(
      screen.getByRole('heading', {
        name: 'Transform every new tab into a learning powerhouse',
      }),
    ).toBeVisible();
    expect(screen.queryByText(explainer)).not.toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Extension features' }),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'New tab feed' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByLabelText('A blank new tab turning into the daily.dev feed'),
    ).toHaveAttribute('src', video);
    expect(screen.getByRole('link', { name: 'Add to Chrome' })).toBeVisible();
  });
});
