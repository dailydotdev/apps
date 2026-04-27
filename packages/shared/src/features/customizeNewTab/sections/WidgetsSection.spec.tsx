import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  render(<WidgetsSection />);

  return { settings, logEvent };
};

describe('WidgetsSection', () => {
  it('renders widgets in the requested order', () => {
    renderWidgets();

    expect(
      screen
        .getAllByRole('button')
        .map((row) => row.getAttribute('aria-label')),
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
    const row = screen.getByRole('button', { name: 'Reading streak' });

    fireEvent.click(row);

    expect(settings.toggleOptOutReadingStreak).toHaveBeenCalledTimes(1);
  });
});
