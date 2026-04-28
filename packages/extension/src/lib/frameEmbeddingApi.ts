export const FRAME_EMBED_PERMISSION = 'declarativeNetRequestWithHostAccess';
export const FRAME_EMBED_ORIGIN = '*://*/*';

// Chromium can take a few seconds to apply DNR session-rule changes,
// especially right after the optional host-access permission is granted.
const DNR_CALL_TIMEOUT_MS = 4000;

export type FrameEmbedRule = {
  id: number;
  priority: number;
  condition: {
    tabIds: [number];
    resourceTypes: ['sub_frame'];
    regexFilter: string;
  };
  action: {
    type: 'modifyHeaders';
    responseHeaders: {
      header: string;
      operation: 'remove';
    }[];
  };
};

export type DeclarativeNetRequestApi = {
  updateSessionRules: (options: {
    removeRuleIds: number[];
    addRules?: FrameEmbedRule[];
  }) => Promise<void>;
  getSessionRules: () => Promise<FrameEmbedRule[]>;
};

export type PermissionsApi = {
  contains: (options: {
    permissions?: string[];
    origins?: string[];
  }) => Promise<boolean>;
  request: (options: {
    permissions?: string[];
    origins?: string[];
  }) => Promise<boolean>;
};

type ChromeGlobal = typeof globalThis & {
  chrome?: {
    declarativeNetRequest?: DeclarativeNetRequestApi;
    permissions?: PermissionsApi;
  };
};

const chromeApi = (globalThis as ChromeGlobal).chrome;

export const getDeclarativeNetRequestApi =
  (): DeclarativeNetRequestApi | null =>
    chromeApi?.declarativeNetRequest ?? null;

export const getPermissionsApi = (): PermissionsApi | null =>
  chromeApi?.permissions ?? null;

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withDnrTimeout = async <T>(
  promise: Promise<T>,
  label: string,
): Promise<T> => {
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = globalThis.setTimeout(() => {
          reject(
            new Error(`${label} timed out after ${DNR_CALL_TIMEOUT_MS}ms`),
          );
        }, DNR_CALL_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};
