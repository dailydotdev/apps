import type { ParsedUrlQuery } from 'querystring';
import { WriteFormTab } from '@dailydotdev/shared/src/components/fields/form/common';
import type { WriteForm } from '@dailydotdev/shared/src/contexts';
import { getFirstQueryParam } from '@dailydotdev/shared/src/lib/func';
import { isValidHttpUrl } from '@dailydotdev/shared/src/lib/links';

export const MAX_CREATE_POST_TITLE_LENGTH = 250;
export const MAX_CREATE_POST_BODY_LENGTH = 10_000;

interface SquadsCreatePrefillState {
  initialDisplay: WriteFormTab | null;
  initialDraft: Partial<WriteForm>;
  initialShareUrl?: string;
  initialShareCommentary?: string;
}

const sanitizeParam = (
  value: string | string[] | undefined,
  maxLength?: number,
): string | undefined => {
  const trimmed = getFirstQueryParam(value)?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength);
};

const hasValue = (value?: string): boolean => !!value?.trim();

export const getSquadsCreatePrefillState = (
  query: ParsedUrlQuery,
  existingDraft: Partial<WriteForm> = {},
): SquadsCreatePrefillState => {
  const title = sanitizeParam(query.title, MAX_CREATE_POST_TITLE_LENGTH);
  const body = sanitizeParam(query.body, MAX_CREATE_POST_BODY_LENGTH);
  const link = sanitizeParam(query.link);
  const hasShareQueryParam = !!getFirstQueryParam(query.share);
  const hasPollQueryParam = !!getFirstQueryParam(query.poll);

  const initialShareUrl = link && isValidHttpUrl(link) ? link : undefined;
  const shouldOpenShare = !!initialShareUrl || hasShareQueryParam;
  let initialDisplay: WriteFormTab | null = null;

  if (hasPollQueryParam) {
    initialDisplay = WriteFormTab.Poll;
  } else if (shouldOpenShare) {
    initialDisplay = WriteFormTab.Share;
  }

  const initialDraft: Partial<WriteForm> = {};
  if (!shouldOpenShare) {
    if (title && !hasValue(existingDraft.title)) {
      initialDraft.title = title;
    }

    if (body && !hasValue(existingDraft.content)) {
      initialDraft.content = body;
    }
  }

  return {
    initialDisplay,
    initialDraft,
    initialShareUrl,
    initialShareCommentary: shouldOpenShare ? body ?? title : undefined,
  };
};
