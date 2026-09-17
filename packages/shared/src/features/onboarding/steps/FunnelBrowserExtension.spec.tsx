import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelBrowserExtension } from './FunnelBrowserExtension';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import { FunnelStepType } from '../types/funnel';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureOnboardingExtensionShowcase } from '../../../lib/featureManagement';

jest.mock('../../../hooks/useConditionalFeature');

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

const mockUseConditionalFeature = jest.mocked(useConditionalFeature);

const explainer = 'Unlock the power of every new tab';

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
      parameters={{ explainer }}
    />
  </FunnelProgressContext.Provider>
);

const renderStep = ({
  showcase,
  isLoading = false,
}: {
  showcase: boolean;
  isLoading?: boolean;
}) => {
  mockUseConditionalFeature.mockImplementation(
    ({ feature }) =>
      ({
        value:
          feature === featureOnboardingExtensionShowcase
            ? showcase
            : feature.defaultValue,
        isLoading:
          feature === featureOnboardingExtensionShowcase ? isLoading : false,
      } as never),
  );

  return render(step());
};

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('FunnelBrowserExtension', () => {
  it('plays the demo video with the flag off', () => {
    renderStep({ showcase: false });

    expect(screen.getByText(explainer)).toBeVisible();
    expect(
      screen.getByLabelText('daily.dev feed running in a new tab on a laptop'),
    ).toBeVisible();
    expect(
      screen.queryByRole('tablist', { name: 'Extension features' }),
    ).not.toBeInTheDocument();
  });

  it('swaps the explainer and video for the showcase with the flag on', () => {
    renderStep({ showcase: true });

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
    expect(screen.getByRole('link', { name: 'Add to Chrome' })).toBeVisible();
  });

  it('shows control while the flag loads and the showcase once it resolves', () => {
    const { rerender } = renderStep({ showcase: false, isLoading: true });

    expect(screen.getByText(explainer)).toBeVisible();
    expect(
      screen.queryByRole('tablist', { name: 'Extension features' }),
    ).not.toBeInTheDocument();

    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    } as never);
    rerender(step());

    expect(screen.queryByText(explainer)).not.toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Extension features' }),
    ).toBeVisible();
  });
});
