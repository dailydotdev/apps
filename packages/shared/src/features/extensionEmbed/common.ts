export const extensionSiteEmbedTargetQueryParam = 'target';
export const extensionSiteEmbedParentOriginQueryParam = 'parentOrigin';
export const extensionSiteEmbedReloadNonceQueryParam = 'reloadNonce';

export const extensionSiteEmbedFrameMessageSource =
  'daily-extension-site-embed';
export const extensionSiteEmbedParentMessageSource =
  'daily-extension-site-embed-parent';

export const extensionSiteEmbedFrameEvent = {
  PermissionsReady: 'daily-extension-site-embed-permissions-ready',
  EmbeddingReady: 'daily-extension-site-embed-embedding-ready',
  ReloadRequested: 'daily-extension-site-embed-reload-requested',
  Error: 'daily-extension-site-embed-error',
} as const;

export const extensionSiteEmbedParentEvent = {
  Disable: 'daily-extension-site-embed-disable',
} as const;

export const extensionSiteEmbedReconnectDelayMs = 1200;
export const extensionSiteEmbedReconnectAttempts = 8;

export type ExtensionSiteEmbedFrameEventType =
  (typeof extensionSiteEmbedFrameEvent)[keyof typeof extensionSiteEmbedFrameEvent];

export type ExtensionSiteEmbedFrameErrorReason =
  | 'missing-permission'
  | 'permission-denied'
  | 'permission-request-failed'
  | 'enable-frame-embedding-failed'
  | 'preview-unavailable'
  | 'missing-target'
  | 'invalid-target'
  | 'unsupported-target-protocol'
  | 'initialization-failed';

export type ExtensionSiteEmbedFrameMessage = {
  source: typeof extensionSiteEmbedFrameMessageSource;
  type: ExtensionSiteEmbedFrameEventType;
  target?: string;
  reason?: ExtensionSiteEmbedFrameErrorReason;
  error?: string;
};

export type ExtensionSiteEmbedParentMessage = {
  source: typeof extensionSiteEmbedParentMessageSource;
  type: (typeof extensionSiteEmbedParentEvent)[keyof typeof extensionSiteEmbedParentEvent];
};

export type ExtensionSiteEmbedStatus =
  | 'idle'
  | 'permission-required'
  | 'reloading-extension'
  | 'preparing-tab'
  | 'ready'
  | 'error';

export const isEmbeddableSiteTarget = (value: string): boolean => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const getExtensionOrigin = (extensionId: string): string =>
  `chrome-extension://${extensionId.trim()}`;

export const buildExtensionSiteEmbedFrameSrc = ({
  extensionId,
  targetUrl,
  parentOrigin,
  reloadNonce,
}: {
  extensionId: string;
  targetUrl: string;
  parentOrigin: string;
  reloadNonce?: string;
}): string => {
  const params = new URLSearchParams({
    [extensionSiteEmbedTargetQueryParam]: targetUrl,
    [extensionSiteEmbedParentOriginQueryParam]: parentOrigin,
  });

  if (reloadNonce) {
    params.set(extensionSiteEmbedReloadNonceQueryParam, reloadNonce);
  }

  return `${getExtensionOrigin(extensionId)}/frame.html?${params.toString()}`;
};

export const getExtensionSiteEmbedErrorMessage = ({
  reason,
  error,
}: {
  reason?: string;
  error?: string;
}): string => {
  if (error) {
    return error;
  }

  if (reason === 'missing-permission') {
    return 'Extension permission is required before the site can be embedded.';
  }

  if (reason === 'permission-denied') {
    return 'The permission request was dismissed.';
  }

  if (reason === 'permission-request-failed') {
    return 'The extension could not request the required permission.';
  }

  if (reason === 'enable-frame-embedding-failed') {
    return 'The extension could not prepare this tab for embedding.';
  }

  if (reason === 'preview-unavailable') {
    return 'Preview not available for this site.';
  }

  return 'The extension could not prepare the embedded site.';
};
