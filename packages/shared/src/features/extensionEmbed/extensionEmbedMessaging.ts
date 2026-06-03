import {
  extensionSiteEmbedFrameEvent,
  extensionSiteEmbedFrameMessageSource,
  extensionSiteEmbedParentEvent,
  extensionSiteEmbedParentMessageSource,
  extensionSiteEmbedTargetEvent,
  extensionSiteEmbedTargetMessageSource,
  getExtensionSiteEmbedErrorMessage,
} from './common';
import type {
  ExtensionSiteEmbedFrameMessage,
  ExtensionSiteEmbedTargetMessage,
} from './common';

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

const postFrameMessage = (
  frame: HTMLIFrameElement | null,
  type: (typeof extensionSiteEmbedParentEvent)[keyof typeof extensionSiteEmbedParentEvent],
): void => {
  if (!frame?.contentWindow) {
    return;
  }

  const frameOrigin = getFrameOrigin(frame);
  if (!frameOrigin) {
    return;
  }

  try {
    frame.contentWindow.postMessage(
      {
        source: extensionSiteEmbedParentMessageSource,
        type,
      },
      frameOrigin,
    );
  } catch {
    // Chrome throws when the iframe failed to navigate to the extension
    // origin (e.g. blocked by `web_accessible_resources` or extension
    // uninstalled mid-session) — the iframe ends up at about:blank inheriting
    // the parent origin, which mismatches the strict `targetOrigin` we pass.
    // The message would be a no-op anyway in that state, so swallow it.
  }
};

export const postExtensionSiteEmbedDisableMessage = (
  frame: HTMLIFrameElement | null,
): void => {
  postFrameMessage(frame, extensionSiteEmbedParentEvent.Disable);
};

type HandleExtensionSiteEmbedMessageOptions = {
  event: MessageEvent;
  expectedExtensionOrigin: string | null;
  isReconnectPending: boolean;
  onPermissionsReady: () => void;
  onEmbeddingReady: () => void;
  onReloadRequested: () => void;
  onOptOutRequested: () => void;
  onMissingPermission: () => void;
  onError: (payload: { message: string; reason?: string }) => void;
};

export const handleExtensionSiteEmbedMessage = ({
  event,
  expectedExtensionOrigin,
  isReconnectPending,
  onPermissionsReady,
  onEmbeddingReady,
  onReloadRequested,
  onOptOutRequested,
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

  if (message.type === extensionSiteEmbedFrameEvent.OptOutRequested) {
    onOptOutRequested();
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

  onError({
    message: getExtensionSiteEmbedErrorMessage({
      reason: message.reason,
      error: message.error,
    }),
    reason: message.reason,
  });
};

type HandleExtensionSiteEmbedTargetMessageOptions = {
  event: MessageEvent;
  expectedTargetOrigin: string | null;
  expectedTargetSource?: MessageEventSource | null;
  onTargetDomReady: (payload: { target: string }) => void;
};

export const handleExtensionSiteEmbedTargetMessage = ({
  event,
  expectedTargetOrigin,
  expectedTargetSource,
  onTargetDomReady,
}: HandleExtensionSiteEmbedTargetMessageOptions): void => {
  const isExpectedTarget = expectedTargetSource
    ? event.source === expectedTargetSource
    : !!expectedTargetOrigin && event.origin === expectedTargetOrigin;

  if (
    !isExpectedTarget ||
    event.data?.source !== extensionSiteEmbedTargetMessageSource
  ) {
    return;
  }

  const message = event.data as ExtensionSiteEmbedTargetMessage;

  if (message.type === extensionSiteEmbedTargetEvent.DomReady) {
    onTargetDomReady({ target: message.target ?? '' });
  }
};
