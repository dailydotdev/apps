import React from 'react';
import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  TopHeroSlotProvider,
  useTopHeroSlot,
} from '@dailydotdev/shared/src/contexts/TopHeroSlotContext';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import {
  useActions,
  useContentScriptStatus,
} from '@dailydotdev/shared/src/hooks';
import { useShortcutLinks } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import { ExtensionTopBanners } from './ExtensionTopBanners';

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useActions: jest.fn(),
  useContentScriptStatus: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/contexts/ExtensionContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/ExtensionContext'),
  useExtensionContext: jest.fn(),
}));

jest.mock(
  '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks',
  () => ({
    useShortcutLinks: jest.fn(),
  }),
);

const mockedUseActions = jest.mocked(useActions);
const mockedUseContentScriptStatus = jest.mocked(useContentScriptStatus);
const mockedUseExtensionContext = jest.mocked(useExtensionContext);
const mockedUseShortcutLinks = jest.mocked(useShortcutLinks);

const completeAction = jest.fn();
const checkHasCompleted = jest.fn();
const requestContentScripts = jest.fn();
const logEvent = jest.fn();

// The cards portal into the layout's top-hero strip; this stands in for it.
const Slot = (): ReactElement => {
  const { setSlot } = useTopHeroSlot();

  return <div ref={setSlot} data-testid="top-hero-slot" />;
};

const renderBanners = (settings: Partial<SettingsContextData> = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={settings}
      log={{ logEvent }}
    >
      <TopHeroSlotProvider>
        <Slot />
        <ExtensionTopBanners />
      </TopHeroSlotProvider>
    </TestBootProvider>,
  );

const companionCard = () =>
  screen.queryByText('Try the new companion feature!');

beforeEach(() => {
  jest.clearAllMocks();
  checkHasCompleted.mockReturnValue(false);
  mockedUseActions.mockReturnValue({
    completeAction,
    checkHasCompleted,
    isActionsFetched: true,
    actions: [],
  } as unknown as ReturnType<typeof useActions>);
  mockedUseContentScriptStatus.mockReturnValue({
    contentScriptGranted: false,
    isFetched: true,
  });
  mockedUseExtensionContext.mockReturnValue({ requestContentScripts });
  // Shortcuts have not reported their permission yet, so their card is out
  // of the way unless a test opts it in.
  mockedUseShortcutLinks.mockReturnValue({
    shortcutLinks: [],
    hasCheckedPermission: false,
  } as unknown as ReturnType<typeof useShortcutLinks>);
});

describe('ExtensionTopBanners companion card', () => {
  it('asks for the companion permission while it is not granted', () => {
    renderBanners();

    expect(companionCard()).toBeInTheDocument();
    expect(screen.getByText(/show the companion directly/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Overview video' }),
    ).toHaveAttribute('href', companionExplainerVideo);
    expect(
      screen.getByRole('link', { name: 'Watch the companion overview video' }),
    ).toHaveAttribute('href', companionExplainerVideo);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'impression',
        target_type: 'companion permission',
      }),
    );
  });

  it('requests the content scripts from the card', () => {
    renderBanners();

    fireEvent.click(screen.getByRole('button', { name: 'Activate companion' }));

    expect(requestContentScripts).toHaveBeenCalledWith({
      origin: 'companion permission card',
    });
  });

  it('closes for good by completing the action', () => {
    renderBanners();

    fireEvent.click(screen.getByRole('button', { name: 'Close banner' }));

    expect(completeAction).toHaveBeenCalledWith(
      ActionType.ClosedCompanionBanner,
    );
  });

  it('stays closed once the action is completed', () => {
    checkHasCompleted.mockImplementation(
      (type: ActionType) => type === ActionType.ClosedCompanionBanner,
    );

    renderBanners();

    expect(companionCard()).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('is not shown once the permission is granted', () => {
    mockedUseContentScriptStatus.mockReturnValue({
      contentScriptGranted: true,
      isFetched: true,
    });

    renderBanners();

    expect(companionCard()).not.toBeInTheDocument();
  });

  it('waits for the permission status', () => {
    mockedUseContentScriptStatus.mockReturnValue({
      contentScriptGranted: false,
      isFetched: false,
    });

    renderBanners();

    expect(companionCard()).not.toBeInTheDocument();
  });

  it('respects opting out of the companion', () => {
    renderBanners({ optOutCompanion: true });

    expect(companionCard()).not.toBeInTheDocument();
  });

  it('shares the strip with the shortcuts card', () => {
    mockedUseShortcutLinks.mockReturnValue({
      shortcutLinks: [],
      hasCheckedPermission: true,
    } as unknown as ReturnType<typeof useShortcutLinks>);

    renderBanners();

    expect(companionCard()).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add shortcuts' }),
    ).toBeInTheDocument();
  });
});
