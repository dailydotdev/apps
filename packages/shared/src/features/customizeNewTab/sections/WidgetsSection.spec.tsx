import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';
import { WidgetsSection } from './WidgetsSection';

jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

jest.mock('../../../hooks/useCoresFeature', () => ({
  useHasAccessToCores: jest.fn(),
}));

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isExtension: true,
}));

const mockUseSettingsContext = useSettingsContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockUseLazyModal = useLazyModal as jest.Mock;
const mockUseHasAccessToCores = useHasAccessToCores as jest.Mock;

const renderWidgets = () => {
  const settings = {
    optOutReadingStreak: false,
    toggleOptOutReadingStreak: jest.fn(),
    optOutLevelSystem: false,
    toggleOptOutLevelSystem: jest.fn(),
    optOutQuestSystem: false,
    toggleOptOutQuestSystem: jest.fn(),
    optOutCompanion: false,
    toggleOptOutCompanion: jest.fn(),
    optOutCores: false,
    toggleOptOutCores: jest.fn(),
    optOutReputation: false,
    toggleOptOutReputation: jest.fn(),
    autoDismissNotifications: true,
    toggleAutoDismissNotifications: jest.fn(),
    showFeedbackButton: true,
    toggleShowFeedbackButton: jest.fn(),
  };
  const logEvent = jest.fn();
  mockUseSettingsContext.mockReturnValue(settings);
  mockUseLogContext.mockReturnValue({ logEvent });
  mockUseConditionalFeature.mockReturnValue({ value: true });
  mockUseLazyModal.mockReturnValue({ openModal: jest.fn() });
  mockUseHasAccessToCores.mockReturnValue(true);

  // The info-icon tooltip on each widget row reads from the React Query
  // client (Tooltip → useRequestProtocol). Wrap renders in a query client so
  // mounting a row no longer throws "No QueryClient set".
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <WidgetsSection />
    </QueryClientProvider>,
  );

  return { settings, logEvent };
};

// The Switch component embeds the aria-label in an `.sr-only` span inside
// the wrapping <label>, which gives the checkbox its accessible name. Read
// it back through `input.labels[0].textContent` so the test follows the
// same path AT does.
const getCheckboxAccessibleName = (input: HTMLElement): string =>
  (input as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? '';

describe('WidgetsSection', () => {
  it('renders widgets in the requested order', () => {
    renderWidgets();

    // Each widget row exposes itself to AT through the underlying checkbox
    // (we deliberately don't double up by giving the row a button role), so
    // the order assertion follows checkbox accessible names.
    expect(
      screen.getAllByRole('checkbox').map(getCheckboxAccessibleName),
    ).toEqual([
      'Reputation badge',
      'Cores wallet',
      'Reading streak',
      'Gamification',
      'Companion widget',
      'Feedback button',
      'Auto-dismiss notifications',
    ]);
  });

  it('flips optOutReadingStreak when the row is clicked', () => {
    const { settings } = renderWidgets();
    const row = screen.getByRole('checkbox', { name: 'Reading streak' });

    fireEvent.click(row);

    expect(settings.toggleOptOutReadingStreak).toHaveBeenCalledTimes(1);
  });
});
