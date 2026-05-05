import { extensionSiteEmbedFrameEvent } from '@dailydotdev/shared/src/features/extensionEmbed/common';
import browser from 'webextension-polyfill';
import { initializeFrame } from './controller';
import {
  enableFrameEmbeddingViaBackground,
  hasFrameEmbeddingPermissions,
  requestFrameEmbeddingPermissions,
} from '../lib/frameEmbedding';
import { renderMessage, renderPermissionPrompt } from './render';

jest.mock('../lib/frameEmbedding', () => ({
  enableFrameEmbeddingViaBackground: jest.fn(),
  hasFrameEmbeddingPermissions: jest.fn(),
  requestFrameEmbeddingPermissions: jest.fn(),
}));

jest.mock('webextension-polyfill', () => ({
  runtime: {
    reload: jest.fn(),
  },
}));

jest.mock('./render', () => ({
  renderMessage: jest.fn(),
  renderPermissionPrompt: jest.fn(),
}));

describe('initializeFrame', () => {
  const root = document.createElement('div');
  const target = new URL('https://example.com/article');
  const sendParentMessage = jest.fn();
  const onEmbeddingEnabled = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('requests an extension reload after permission is granted', async () => {
    (hasFrameEmbeddingPermissions as jest.Mock).mockResolvedValue(false);
    (requestFrameEmbeddingPermissions as jest.Mock).mockResolvedValue(true);

    let requestPermission:
      | (() => Promise<'granted' | 'dismissed' | 'failed'>)
      | undefined;
    (renderPermissionPrompt as jest.Mock).mockImplementation(
      ({
        onRequestPermission,
      }: {
        onRequestPermission: () => Promise<'granted' | 'dismissed' | 'failed'>;
      }) => {
        requestPermission = onRequestPermission;
      },
    );

    await initializeFrame({
      root,
      target,
      sendParentMessage,
      onEmbeddingEnabled,
    });

    expect(requestPermission).toBeDefined();
    await expect(requestPermission?.()).resolves.toBe('granted');

    expect(sendParentMessage).toHaveBeenCalledWith(
      extensionSiteEmbedFrameEvent.Error,
      {
        reason: 'missing-permission',
        target: target.href,
      },
    );
    expect(sendParentMessage).toHaveBeenCalledWith(
      extensionSiteEmbedFrameEvent.ReloadRequested,
      {
        target: target.href,
      },
    );
    expect(enableFrameEmbeddingViaBackground).not.toHaveBeenCalled();
    expect(onEmbeddingEnabled).not.toHaveBeenCalled();
    expect(renderMessage).not.toHaveBeenCalled();
    expect(browser.runtime.reload).toHaveBeenCalledTimes(0);
    jest.runOnlyPendingTimers();
    expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
  });
});
