import { render } from '@testing-library/react';
import React from 'react';
import RichTextInput from './RichTextInput';

const mockFocus = jest.fn();
const mockUseEditor = jest.fn();
const mockEditor = {
  commands: {
    focus: mockFocus,
    setContent: jest.fn(),
  },
};

jest.mock('next/dynamic', () => () => () => null);

jest.mock('@tiptap/core', () => ({
  Extension: { create: jest.fn((config) => config) },
  markInputRule: jest.fn(),
  nodeInputRule: jest.fn(),
}));

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock('@tiptap/extension-link', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock('@tiptap/extension-placeholder', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock('@tiptap/extension-character-count', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock('@tiptap/extension-image', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@tiptap/react', () => ({
  __esModule: true,
  useEditor: (options: unknown) => {
    mockUseEditor(options);
    return mockEditor;
  },
  EditorContent: () => {
    const react = jest.requireActual('react') as typeof React;
    return react.createElement('div', { 'data-testid': 'editor-content' });
  },
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: null }),
}));

jest.mock('../../hooks/usePopupSelector', () => ({
  __esModule: true,
  usePopupSelector: () => ({ parentSelector: undefined }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('./RichTextEditor/useDraftStorage', () => ({
  useDraftStorage: () => ({
    getInitialValue: (initialContent = '') => initialContent,
    clearDraft: jest.fn(),
  }),
}));

jest.mock('./RichTextEditor/useImageUpload', () => ({
  useImageUpload: () => ({
    queueCount: 0,
    uploadRef: { current: null },
    insertImage: jest.fn(),
    handleDrop: jest.fn(),
    handlePaste: jest.fn(),
    onUpload: jest.fn(),
  }),
}));

jest.mock('./RichTextEditor/useMentionAutocomplete', () => ({
  useMentionAutocomplete: () => ({
    queryRef: { current: undefined },
    mentionsRef: { current: [] },
    selectedRef: { current: 0 },
    mentions: [],
    selected: 0,
    query: undefined,
    updateFromEditor: jest.fn(),
    clearMention: jest.fn(),
    applyMention: jest.fn(),
  }),
}));

jest.mock('./RichTextEditor/useEmojiAutocomplete', () => ({
  useEmojiAutocomplete: () => ({
    emojiQueryRef: { current: undefined },
    emojiDataRef: { current: [] },
    selectedEmojiRef: { current: 0 },
    emojiQuery: undefined,
    emojiData: [],
    selectedEmoji: 0,
    updateFromEditor: jest.fn(),
    clearEmoji: jest.fn(),
    applyEmoji: jest.fn(),
    setSelectedEmoji: jest.fn(),
  }),
}));

describe('RichTextInput', () => {
  beforeEach(() => {
    mockUseEditor.mockClear();
  });

  it('exposes the input id on the rich editor DOM attributes', () => {
    render(<RichTextInput inputId="comment-editor" hideFooter hideToolbar />);

    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editorProps: expect.objectContaining({
          attributes: { id: 'comment-editor' },
        }),
      }),
    );
  });
});
