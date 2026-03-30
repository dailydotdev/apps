import browser from 'webextension-polyfill';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import type { TabFrameEmbeddingResult } from './frameEmbeddingSession';

export {
  clearFrameEmbeddingSessionRules,
  disableFrameEmbeddingForTab,
  enableFrameEmbeddingForTab,
} from './frameEmbeddingSession';
export {
  hasFrameEmbeddingPermissions,
  requestFrameEmbeddingPermissions,
} from './frameEmbeddingPermissions';
export type { TabFrameEmbeddingResult } from './frameEmbeddingSession';

export const enableFrameEmbeddingViaBackground =
  async (): Promise<TabFrameEmbeddingResult> =>
    (await browser.runtime.sendMessage({
      type: ExtensionMessageType.EnableFrameEmbeddingForTab,
    })) as TabFrameEmbeddingResult;

export const disableFrameEmbeddingViaBackground =
  async (): Promise<TabFrameEmbeddingResult> =>
    (await browser.runtime.sendMessage({
      type: ExtensionMessageType.DisableFrameEmbeddingForTab,
    })) as TabFrameEmbeddingResult;
