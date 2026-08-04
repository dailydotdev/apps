import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReactModal from 'react-modal';
import ReaderInstallPromptModal from './ReaderInstallPromptModal';
import { LazyModal } from './common/types';
import type { Post } from '../../graphql/posts';
import type { PagePermissionBridgeResult } from '../../features/extensionEmbed/pagePermissionBridge';

const mockOpenModal = jest.fn();
const mockCloseModal = jest.fn();
const mockUpdateFlag = jest.fn();
const mockIsMarkerPresent = jest.fn<boolean, []>();
const mockRequestPermission = jest.fn<
  Promise<PagePermissionBridgeResult>,
  []
>();

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({ updateFlag: mockUpdateFlag }),
}));

jest.mock('../post/reader/hooks/useLegacyPostLayoutOptOut', () => ({
  useLegacyPostLayoutOptOut: () => ({ optOut: jest.fn() }),
}));

jest.mock(
  '../../features/extensionEmbed/useIsBrowserExtensionInstalled',
  () => ({
    useIsBrowserExtensionInstalled: () => ({
      isInstalled: true,
      isChecking: false,
    }),
    isBrowserExtensionInstalled: () => mockIsMarkerPresent(),
    detectBrowserExtensionInstalled: jest.fn().mockResolvedValue(false),
  }),
);

jest.mock('../../features/extensionEmbed/getBrowserExtensionInstallId', () => ({
  getBrowserExtensionInstallId: () => 'test-extension-id',
}));

jest.mock('../../features/extensionEmbed/pagePermissionBridge', () => ({
  ...jest.requireActual('../../features/extensionEmbed/pagePermissionBridge'),
  requestFrameEmbeddingPermissionFromPage: () => mockRequestPermission(),
}));

jest.mock('../../features/extensionEmbed/ExtensionSiteEmbed', () => ({
  ExtensionSiteEmbed: () => null,
}));

const post = {
  id: 'p1',
  permalink: 'https://example.com/article',
  domain: 'example.com',
} as Post;

const renderComponent = () =>
  render(
    <ReaderInstallPromptModal post={post} isOpen onRequestClose={jest.fn()} />,
  );

const clickEnableButton = () => {
  fireEvent.click(
    screen.getByRole('button', { name: 'Enable permissions & read inside' }),
  );
};

describe('ReaderInstallPromptModal permission flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="__next"></div>';
    ReactModal.setAppElement('#__next');
    mockIsMarkerPresent.mockReturnValue(true);
  });

  it('skips the bridge and opens the reader preview when the content script never ran in this tab', () => {
    // Install detected via the resource probe only (e.g. tab opened before
    // install, or the extension new-tab surface) — the bridge request event
    // would go unanswered, so the click must not wait on it.
    mockIsMarkerPresent.mockReturnValue(false);

    renderComponent();
    clickEnableButton();

    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({ type: LazyModal.ReaderPreview }),
    );
  });

  it('falls back to the reader preview when the bridge fails instead of resetting silently', async () => {
    mockRequestPermission.mockResolvedValue({
      granted: false,
      error: 'timeout',
    });

    renderComponent();
    clickEnableButton();

    await waitFor(() =>
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: LazyModal.ReaderPreview }),
      ),
    );
    expect(mockUpdateFlag).not.toHaveBeenCalled();
  });

  it('persists acknowledgement and prepares the reader once permission is granted', async () => {
    mockRequestPermission.mockResolvedValue({ granted: true });

    renderComponent();
    clickEnableButton();

    await waitFor(() =>
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        'readerInstallPromptAcknowledged',
        true,
      ),
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('stays on the prompt when the user declines the browser permission prompt', async () => {
    mockRequestPermission.mockResolvedValue({ granted: false });

    renderComponent();
    clickEnableButton();

    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'Enable permissions & read inside',
        }),
      ).toBeEnabled(),
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
    expect(mockUpdateFlag).not.toHaveBeenCalled();
  });
});
