import type { FrameEmbedRule } from './frameEmbeddingApi';

const FRAME_EMBED_RULE_ID_OFFSET = 1_000_000;
const FRAME_EMBED_HEADERS = [
  'X-Frame-Options',
  'Frame-Options',
  'Content-Security-Policy',
  'Cross-Origin-Opener-Policy',
];
const FRAME_EMBED_RULE_REGEX = '^https?://';

export const getFrameEmbedRuleId = (tabId: number): number =>
  FRAME_EMBED_RULE_ID_OFFSET + tabId;

export const isFrameEmbedRuleId = (ruleId: number): boolean =>
  ruleId >= FRAME_EMBED_RULE_ID_OFFSET;

export const getFrameEmbedRule = (tabId: number): FrameEmbedRule => ({
  id: getFrameEmbedRuleId(tabId),
  priority: 1,
  condition: {
    tabIds: [tabId],
    resourceTypes: ['sub_frame'],
    regexFilter: FRAME_EMBED_RULE_REGEX,
  },
  action: {
    type: 'modifyHeaders',
    responseHeaders: FRAME_EMBED_HEADERS.map((header) => ({
      header,
      operation: 'remove',
    })),
  },
});
