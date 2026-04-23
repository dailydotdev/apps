import {
  getDeclarativeNetRequestApi,
  withDnrTimeout,
  wait,
} from './frameEmbeddingApi';
import type {
  DeclarativeNetRequestApi,
  FrameEmbedRule,
} from './frameEmbeddingApi';
import { hasFrameEmbeddingPermissions } from './frameEmbeddingPermissions';
import {
  getFrameEmbedRule,
  getFrameEmbedRuleId,
  isFrameEmbedRuleId,
} from './frameEmbeddingRules';

const SYNC_RETRY_COUNT = 4;
const SYNC_RETRY_DELAY_MS = 150;
const FRAME_LOG_PREFIX = '[frame-embed]';

const warn = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.warn(...args);
};

const errorLog = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

export type TabFrameEmbeddingResult = {
  enabled: boolean;
  tabId: number;
  ruleId: number;
  rulesCount: number;
  error?: string;
};

const getFrameEmbeddingSessionRules = async (): Promise<FrameEmbedRule[]> =>
  (
    await withDnrTimeout(
      getDeclarativeNetRequestApi()?.getSessionRules() ?? Promise.resolve([]),
      'getSessionRules',
    )
  ).filter((rule) => isFrameEmbedRuleId(rule.id));

const tryEnableFrameEmbeddingRule = async (
  dnr: DeclarativeNetRequestApi,
  tabId: number,
  attempt = 0,
): Promise<TabFrameEmbeddingResult> => {
  const ruleId = getFrameEmbedRuleId(tabId);

  try {
    // Chromium can lag immediately after the optional permission grant, so we
    // use a bounded timeout and a few short retries instead of hanging forever.
    await withDnrTimeout(
      dnr.updateSessionRules({
        removeRuleIds: [ruleId],
        addRules: [getFrameEmbedRule(tabId)],
      }),
      'updateSessionRules(add)',
    );

    const rules = await getFrameEmbeddingSessionRules();
    if (rules.some((rule) => rule.id === ruleId)) {
      return {
        enabled: true,
        tabId,
        ruleId,
        rulesCount: rules.length,
      };
    }
  } catch (error) {
    errorLog(
      `${FRAME_LOG_PREFIX} updateSessionRules failed for tab ${tabId}:`,
      error,
    );
    if (attempt === SYNC_RETRY_COUNT - 1) {
      return {
        enabled: false,
        tabId,
        ruleId,
        rulesCount: 0,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown DNR session-rule error',
      };
    }
  }

  if (attempt === SYNC_RETRY_COUNT - 1) {
    const rules = await getFrameEmbeddingSessionRules();
    warn(
      `${FRAME_LOG_PREFIX} rule still missing after final attempt for tab ${tabId}. Existing rules:`,
      rules,
    );
    return {
      enabled: false,
      tabId,
      ruleId,
      rulesCount: rules.length,
      error: 'Frame embedding rule missing after update',
    };
  }

  await wait(SYNC_RETRY_DELAY_MS * (attempt + 1));
  return tryEnableFrameEmbeddingRule(dnr, tabId, attempt + 1);
};

export const enableFrameEmbeddingForTab = async (
  tabId: number,
): Promise<TabFrameEmbeddingResult> => {
  const dnr = getDeclarativeNetRequestApi();
  const ruleId = getFrameEmbedRuleId(tabId);

  if (!dnr) {
    errorLog(`${FRAME_LOG_PREFIX} DNR API unavailable while enabling`);
    return {
      enabled: false,
      tabId,
      ruleId,
      rulesCount: 0,
      error: 'declarativeNetRequest API unavailable',
    };
  }

  const hasPermissions = await hasFrameEmbeddingPermissions();
  if (!hasPermissions) {
    warn(
      `${FRAME_LOG_PREFIX} enabling requested without permissions for tab ${tabId}`,
    );
    // If permissions were removed mid-session, clear any stale rule so the tab
    // does not keep working with broader access than the user still grants.
    await withDnrTimeout(
      dnr.updateSessionRules({
        removeRuleIds: [ruleId],
      }),
      'updateSessionRules(remove)',
    );
    const rules = await getFrameEmbeddingSessionRules();
    return {
      enabled: false,
      tabId,
      ruleId,
      rulesCount: rules.length,
      error: 'Missing frame-embedding permissions',
    };
  }

  return tryEnableFrameEmbeddingRule(dnr, tabId);
};

export const disableFrameEmbeddingForTab = async (
  tabId: number,
): Promise<TabFrameEmbeddingResult> => {
  const dnr = getDeclarativeNetRequestApi();
  const ruleId = getFrameEmbedRuleId(tabId);

  if (!dnr) {
    // The DNR API is only present once the user grants the optional
    // `declarativeNetRequestWithHostAccess` permission. If it's missing here,
    // we also couldn't have enabled a rule in the first place, so disabling
    // is a no-op. Return success silently instead of logging — callers like
    // the frame cleanup routinely invoke this on pagehide regardless of
    // permission state.
    return {
      enabled: false,
      tabId,
      ruleId,
      rulesCount: 0,
    };
  }

  await withDnrTimeout(
    dnr.updateSessionRules({
      removeRuleIds: [ruleId],
    }),
    'updateSessionRules(remove)',
  );
  const rules = await getFrameEmbeddingSessionRules();

  return {
    enabled: false,
    tabId,
    ruleId,
    rulesCount: rules.length,
  };
};

export const clearFrameEmbeddingSessionRules = async (): Promise<void> => {
  // Service-worker restarts and permission removals are global events, so this
  // helper clears every embed rule instead of requiring a live tab context.
  const rules = await getFrameEmbeddingSessionRules();
  if (!rules.length) {
    return;
  }

  await withDnrTimeout(
    getDeclarativeNetRequestApi()?.updateSessionRules({
      removeRuleIds: rules.map((rule) => rule.id),
    }) ?? Promise.resolve(),
    'updateSessionRules(clear)',
  );
};
