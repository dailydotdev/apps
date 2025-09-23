import type { PromptOptions } from '../../../hooks/usePrompt';
import { labels } from '../../../lib/labels';

export const opportunityEditDiscardPrompt: PromptOptions = {
  title: labels.form.discard.title,
  description: labels.form.discard.description,
  okButton: {
    title: labels.form.discard.okButton,
  },
  cancelButton: {
    title: labels.form.discard.cancelButton,
  },
};
