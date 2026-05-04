import React from 'react';
import { AnalyticsIcon } from '../../../../icons';
import type { ComposerVariant } from '../types';

const MIN_POLL_OPTIONS = 2;

const getValidOptions = (options: string[]): string[] =>
  options.map((option) => option.trim()).filter((option) => option.length > 0);

export const pollVariant: ComposerVariant<'poll'> = {
  kind: 'poll',
  picker: {
    label: 'Poll',
    icon: <AnalyticsIcon />,
    description: 'Ask a question with multiple choices.',
  },
  isEnabled: () => true,
  submitLabel: () => 'Post',
  validate: (state) => {
    if (!state.title.trim()) {
      return { isValid: false, reason: 'missing-question' };
    }
    if (getValidOptions(state.pollOptions).length < MIN_POLL_OPTIONS) {
      return { isValid: false, reason: 'not-enough-options' };
    }
    return { isValid: true };
  },
  serialize: (state) => {
    const options = getValidOptions(state.pollOptions);
    return {
      kind: 'poll',
      payload: {
        title: state.title.trim(),
        options,
        ...(state.pollDurationDays != null
          ? { durationDays: state.pollDurationDays }
          : {}),
      },
    };
  },
};
