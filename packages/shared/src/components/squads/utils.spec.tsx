import {
  createModerationPromptProps,
  editModerationPromptProps,
} from './utils';

describe('moderation prompt props', () => {
  it('hides the cancel button for post and edit review confirmations', () => {
    expect(createModerationPromptProps.cancelButton).toBeNull();
    expect(editModerationPromptProps.cancelButton).toBeNull();
  });
});
