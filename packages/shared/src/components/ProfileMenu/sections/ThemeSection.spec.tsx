import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSection } from './ThemeSection';
import { ThemeMode } from '../../../contexts/SettingsContext';
import * as settingsContext from '../../../contexts/SettingsContext';
import * as logContext from '../../../contexts/LogContext';

// Mock the necessary context providers
jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: jest.fn(),
  ThemeMode: {
    Dark: 'dark',
    Light: 'light',
    Auto: 'auto',
  },
  themes: [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'auto', label: 'Auto' },
  ],
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

// Mock the icon components
jest.mock('../../icons', () => ({
  MoonIcon: () => <span data-testid="moon-icon" />,
  SunIcon: () => <span data-testid="sun-icon" />,
}));

jest.mock('../../icons/ThemeAuto', () => ({
  ThemeAutoIcon: () => <span data-testid="auto-icon" />,
}));

const mockSetTheme = jest.fn();
const mockLogEvent = jest.fn();

describe('ThemeSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the context mocks
    (settingsContext.useSettingsContext as jest.Mock).mockReturnValue({
      themeMode: ThemeMode.Dark,
      setTheme: mockSetTheme,
    });

    (logContext.useLogContext as jest.Mock).mockReturnValue({
      logEvent: mockLogEvent,
    });
  });

  it('should render correctly with dark theme active', () => {
    render(<ThemeSection />);

    // Check that the section title is rendered
    expect(screen.getByText('Theme')).toBeInTheDocument();

    // Check that all theme icons are rendered
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.getByTestId('auto-icon')).toBeInTheDocument();
  });

  it('should call setTheme when a theme button is clicked', () => {
    render(<ThemeSection />);

    // Find the light theme button and click it
    const buttons = screen.getAllByRole('button');
    const lightButton = buttons[1]; // The second button should be the light theme

    fireEvent.click(lightButton);

    // Check that setTheme was called with the light theme
    expect(mockSetTheme).toHaveBeenCalledWith(ThemeMode.Light);
    expect(mockLogEvent).toHaveBeenCalled();
  });

  it('should highlight the active theme button', () => {
    // Mock active theme as light
    (settingsContext.useSettingsContext as jest.Mock).mockReturnValue({
      themeMode: ThemeMode.Light,
      setTheme: mockSetTheme,
    });

    render(<ThemeSection />);

    // Get all buttons
    const buttons = screen.getAllByRole('button');

    // The second button (light theme) should have the active class
    expect(buttons[1]).toHaveClass('text-text-primary');

    // The other buttons should not have the active class
    expect(buttons[0]).not.toHaveClass('text-text-primary');
    expect(buttons[2]).not.toHaveClass('text-text-primary');
  });
});
