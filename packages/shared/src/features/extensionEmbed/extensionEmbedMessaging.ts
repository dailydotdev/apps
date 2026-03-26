import {
  extensionSiteEmbedFrameEvent,
  extensionSiteEmbedFrameMessageSource,
  extensionSiteEmbedParentEvent,
  extensionSiteEmbedParentMessageSource,
  getExtensionSiteEmbedErrorMessage,
} from './common';
import type { ExtensionSiteEmbedFrameMessage } from './common';

const getFrameOrigin = (frame: HTMLIFrameElement | null): string | null => {
  if (!frame?.src) {
    return null;
  }

  try {
    return new URL(frame.src).origin;
  } catch {
    return null;
  }
};

export const postExtensionSiteEmbedDisableMessage = (
  frame: HTMLIFrameElement | null,
): void => {
  if (!frame?.contentWindow) {
    return;
  }

  const frameOrigin = getFrameOrigin(frame);
  if (!frameOrigin) {
    return;
  }

  frame.contentWindow.postMessage(
    {
      source: extensionSiteEmbedParentMessageSource,
      type: extensionSiteEmbedParentEvent.Disable,
    },
    frameOrigin,
  );
};

type HandleExtensionSiteEmbedMessageOptions = {
  event: MessageEvent;
  expectedExtensionOrigin: string | null;
  isReconnectPending: boolean;
  onPermissionsReady: () => void;
  onEmbeddingReady: () => void;
  onReloadRequested: () => void;
  onMissingPermission: () => void;
  onError: (message: string) => void;
};

export const handleExtensionSiteEmbedMessage = ({
  event,
  expectedExtensionOrigin,
  isReconnectPending,
  onPermissionsReady,
  onEmbeddingReady,
  onReloadRequested,
  onMissingPermission,
  onError,
}: HandleExtensionSiteEmbedMessageOptions): void => {
  if (
    !expectedExtensionOrigin ||
    event.origin !== expectedExtensionOrigin ||
    event.data?.source !== extensionSiteEmbedFrameMessageSource
  ) {
    return;
  }

  const message = event.data as ExtensionSiteEmbedFrameMessage;

  if (message.type === extensionSiteEmbedFrameEvent.PermissionsReady) {
    onPermissionsReady();
    return;
  }

  if (message.type === extensionSiteEmbedFrameEvent.EmbeddingReady) {
    onEmbeddingReady();
    return;
  }

  if (message.type === extensionSiteEmbedFrameEvent.ReloadRequested) {
    onReloadRequested();
    return;
  }

  if (message.type !== extensionSiteEmbedFrameEvent.Error) {
    return;
  }

  // During reconnect, the freshly reloaded frame briefly reports
  // "missing-permission" before Chromium finishes restoring the new context.
  // Treating that as real would flap the UI back to the permission prompt.
  if (isReconnectPending && message.reason === 'missing-permission') {
    return;
  }

  if (message.reason === 'missing-permission') {
    onMissingPermission();
    return;
  }

  onError(
    getExtensionSiteEmbedErrorMessage({
      reason: message.reason,
      error: message.error,
    }),
  );
};
