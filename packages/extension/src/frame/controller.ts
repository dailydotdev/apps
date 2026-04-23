import browser from 'webextension-polyfill';
import { extensionSiteEmbedFrameEvent } from '@dailydotdev/shared/src/features/extensionEmbed/common';
import {
  disableFrameEmbeddingViaBackground,
  enableFrameEmbeddingViaBackground,
  hasFrameEmbeddingPermissions,
  requestFrameEmbeddingPermissions,
} from '../lib/frameEmbedding';
import { renderMessage, renderPermissionPrompt } from './render';

const errorLog = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

type SendParentMessage = (type: string, detail: Record<string, string>) => void;

type PermissionRequestOutcome = 'granted' | 'dismissed' | 'failed';

export const createFrameCleanupController = () => {
  let shouldDisableEmbeddingOnCleanup = false;

  return {
    markEmbeddingEnabled() {
      // Only tear the rule down if this frame was the one that enabled it.
      shouldDisableEmbeddingOnCleanup = true;
    },
    async disableEmbeddingForTab() {
      if (!shouldDisableEmbeddingOnCleanup) {
        return;
      }

      shouldDisableEmbeddingOnCleanup = false;

      try {
        await disableFrameEmbeddingViaBackground();
      } catch (error) {
        errorLog('[frame] failed to disable frame embedding for tab:', error);
      }
    },
  };
};

export const initializeFrame = async ({
  root,
  target,
  sendParentMessage,
  onEmbeddingEnabled,
}: {
  root: HTMLDivElement;
  target: URL;
  sendParentMessage: SendParentMessage;
  onEmbeddingEnabled: () => void;
}): Promise<void> => {
  const hasPermissions = await hasFrameEmbeddingPermissions();

  if (!hasPermissions) {
    const onRequestPermission = async (): Promise<PermissionRequestOutcome> => {
      try {
        const granted = await requestFrameEmbeddingPermissions();

        if (!granted) {
          sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
            reason: 'permission-denied',
            target: target.href,
          });
          return 'dismissed';
        }

        sendParentMessage(extensionSiteEmbedFrameEvent.ReloadRequested, {
          target: target.href,
        });

        // After the optional permission prompt resolves, the fresh extension
        // context is much more reliable for enabling the DNR session rule.
        globalThis.setTimeout(() => {
          browser.runtime.reload();
        }, 100);

        return 'granted';
      } catch {
        sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
          reason: 'permission-request-failed',
          target: target.href,
        });
        return 'failed';
      }
    };

    renderPermissionPrompt({
      root,
      onRequestPermission,
    });

    sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
      reason: 'missing-permission',
      target: target.href,
    });
    return;
  }

  sendParentMessage(extensionSiteEmbedFrameEvent.PermissionsReady, {
    target: target.href,
  });

  // The visible site iframe only mounts after the tab-scoped rule is live.
  // That avoids a flash of the browser's built-in frame-blocked error page.
  renderMessage(
    root,
    'Preparing embedded browsing',
    'Configuring this tab so the requested site can be embedded safely.',
  );

  const result = await enableFrameEmbeddingViaBackground();
  if (!result.enabled) {
    sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
      reason: 'enable-frame-embedding-failed',
      target: target.href,
      error: result.error ?? 'Unknown frame embedding error',
    });
    return;
  }

  // The webapp keeps this frame mounted invisibly after success so it can
  // tear the tab-scoped rule down when the page unloads or a new target starts.
  onEmbeddingEnabled();
  sendParentMessage(extensionSiteEmbedFrameEvent.EmbeddingReady, {
    target: target.href,
  });
};
