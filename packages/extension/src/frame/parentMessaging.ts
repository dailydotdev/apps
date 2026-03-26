import {
  extensionSiteEmbedFrameMessageSource,
  extensionSiteEmbedParentEvent,
  extensionSiteEmbedParentMessageSource,
} from '@dailydotdev/shared/src/features/extensionEmbed/common';

const isAllowedParentHost = (hostname: string): boolean =>
  hostname === 'daily.dev' ||
  hostname.endsWith('.daily.dev') ||
  hostname.endsWith('.local.fylla.dev');

const getAllowedOrigin = (value: string): string | null => {
  try {
    const origin = new URL(value);
    return isAllowedParentHost(origin.hostname) ? origin.origin : null;
  } catch {
    return null;
  }
};

export const resolveFrameParentOrigin = (
  rawParentOrigin: string | null,
): string | null => {
  // The parent passes its origin explicitly because referrer becomes
  // unreliable across the permission-grant reload path in Chromium.
  if (rawParentOrigin) {
    const parentOrigin = getAllowedOrigin(rawParentOrigin);
    if (parentOrigin) {
      return parentOrigin;
    }
  }

  if (!document.referrer) {
    return null;
  }

  return getAllowedOrigin(document.referrer);
};

export const sendFrameMessageToParent = ({
  parentOrigin,
  type,
  detail,
}: {
  parentOrigin: string | null;
  type: string;
  detail: Record<string, string>;
}): void => {
  if (!parentOrigin) {
    return;
  }

  window.parent.postMessage(
    { source: extensionSiteEmbedFrameMessageSource, type, ...detail },
    parentOrigin,
  );
};

export const isDisableFrameMessage = (
  event: MessageEvent,
  parentOrigin: string | null,
): boolean => {
  if (!parentOrigin || event.origin !== parentOrigin) {
    return false;
  }

  return (
    event.data?.source === extensionSiteEmbedParentMessageSource &&
    event.data?.type === extensionSiteEmbedParentEvent.Disable
  );
};
