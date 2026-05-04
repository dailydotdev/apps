import React from 'react';
import { EditIcon } from '../../../../icons';
import { cleanShareCommentary } from '../../../../../hooks/post/useSmartComposer';
import type {
  ComposerState,
  ComposerVariant,
  ComposerSerializeContext,
} from '../types';

const hasResolvableShare = (state: ComposerState): boolean => {
  if (!state.detectedUrl) {
    return false;
  }
  return Boolean(state.preview?.id || state.preview?.title);
};

const buildSubmission = (
  state: ComposerState,
  ctx: ComposerSerializeContext,
) => {
  const customTitle = state.title.trim();
  const { preview } = state;
  const url = preview?.finalUrl ?? preview?.url ?? state.detectedUrl?.url;

  if (state.detectedUrl && preview?.id) {
    return {
      kind: 'text-share-existing' as const,
      payload: {
        sharedPostId: preview.id,
        commentary: cleanShareCommentary(state.body, url),
        ...(customTitle ? { title: customTitle } : {}),
      },
    };
  }

  if (state.detectedUrl && url) {
    return {
      kind: 'text-share-external' as const,
      payload: {
        externalLink: url,
        title: customTitle || preview?.title || '',
        imageUrl: ctx.coverImageUrl ?? preview?.image ?? undefined,
        commentary: cleanShareCommentary(state.body, url),
      },
    };
  }

  return {
    kind: 'text-freeform' as const,
    payload: {
      title: customTitle,
      content: state.body,
      ...(state.coverImage?.file ? { image: state.coverImage.file } : {}),
    },
  };
};

export const textVariant: ComposerVariant<'text'> = {
  kind: 'text',
  picker: {
    label: 'Text',
    icon: <EditIcon />,
    description: 'Share an article, link, image, or write your own.',
  },
  isEnabled: () => true,
  submitLabel: () => 'Post',
  validate: (state) => {
    if (state.detectedUrl) {
      if (!hasResolvableShare(state)) {
        return { isValid: false, reason: 'share-not-resolvable' };
      }
      return { isValid: true };
    }

    if (!state.title.trim()) {
      return { isValid: false, reason: 'missing-title' };
    }

    if (!state.body.trim()) {
      return { isValid: false, reason: 'missing-body' };
    }

    return { isValid: true };
  },
  serialize: (state, ctx) => buildSubmission(state, ctx),
};
