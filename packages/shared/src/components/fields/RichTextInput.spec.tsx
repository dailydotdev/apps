import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { LoggedUser } from '../../lib/user';
import type { RichTextInputRef } from './RichTextInput';
import RichTextInput from './RichTextInput';

const mockFocus = jest.fn();
const mockUseEditor = jest.fn();
const mockEditor = {
  commands: {
    focus: mockFocus,
    setContent: jest.fn(),
  },
  getHTML: jest.fn(() => ''),
};
let mockEditorReady = true;
let mockUser: Partial<LoggedUser> | null = null;

const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

jest.mock('next/dynamic', () => () => () => null);

jest.mock('@tiptap/core', () => ({
  Extension: { create: jest.fn((config) => config) },
  Node: { create: jest.fn((config) => config) },
  mergeAttributes: jest.fn((...attrs) => Object.assign({}, ...attrs)),
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
    return mockEditorReady ? mockEditor : null;
  },
  useEditorState: () => ({
    isBold: false,
    isItalic: false,
    isBulletList: false,
    isOrderedList: false,
    isLink: false,
    canUndo: false,
    canRedo: false,
  }),
  EditorContent: () => {
    const react = jest.requireActual('react') as typeof React;
    return react.createElement('div', { 'data-testid': 'editor-content' });
  },
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser }),
}));

jest.mock('../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

// Cloning the tooltip content onto the child as an aria-label lets tests reach
// the icon-only toggle button by an accessible name.
jest.mock('../tooltips/SimpleTooltip', () => ({
  SimpleTooltip: ({
    content,
    children,
  }: React.PropsWithChildren<{ content: React.ReactNode }>) => {
    const react = jest.requireActual('react') as typeof React;
    return react.cloneElement(children as React.ReactElement, {
      'aria-label': String(content),
    });
  },
}));

jest.mock('./RichTextEditor/LinkModal', () => ({
  LinkModal: () => null,
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
    jest.clearAllMocks();
    mockEditorReady = true;
    mockUser = null;
  });

  it('exposes the input id on the rich editor DOM attributes', () => {
    render(<RichTextInput inputId="comment-editor" hideFooter hideToolbar />);

    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editorProps: expect.objectContaining({
          attributes: expect.objectContaining({ id: 'comment-editor' }),
        }),
      }),
    );
  });

  it('exposes the rich editor as a multiline textbox', () => {
    render(<RichTextInput hideFooter hideToolbar />);

    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editorProps: expect.objectContaining({
          attributes: expect.objectContaining({
            role: 'textbox',
            'aria-multiline': 'true',
          }),
        }),
      }),
    );
  });

  it('keeps one avatar mounted across the markdown toggle', () => {
    // Regression: each mode used to build its own subtree, so toggling
    // remounted the avatar (refetching the image, hence the visible blink).
    mockUser = {
      id: 'u1',
      username: 'ido',
      image: 'https://daily.dev/ido.png',
    };
    renderWithClient(
      <RichTextInput showUserAvatar toolbarPosition="bottom" hideFooter />,
    );

    const avatar = screen.getByAltText("ido's profile");

    fireEvent.click(
      screen.getByLabelText('Switch to Markdown Editor', {
        selector: 'button',
      }),
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByAltText("ido's profile")).toBe(avatar);

    fireEvent.click(
      screen.getByLabelText('Switch to Rich Text Editor', {
        selector: 'button',
      }),
    );
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByAltText("ido's profile")).toBe(avatar);
  });

  it('queues an early focus until the editor is created', () => {
    // The editor is created async (`immediatelyRender: false`), while the
    // composer requests autofocus from a mount-time ref callback. Regression:
    // that focus silently no-oped, leaving reply composers unfocused.
    mockEditorReady = false;
    const ref = React.createRef<RichTextInputRef>();
    const { rerender } = render(
      <RichTextInput ref={ref} hideFooter hideToolbar />,
    );

    ref.current?.focus();
    expect(mockFocus).not.toHaveBeenCalled();

    mockEditorReady = true;
    rerender(<RichTextInput ref={ref} hideFooter hideToolbar />);

    expect(mockFocus).toHaveBeenCalledWith('end');
  });

  it('gives the bottom bar the safe-area floor instead of the drawer', () => {
    // `max(1.25rem, safe-area)` on the bar itself keeps the bottom spacing
    // equal to the sides; drawer padding stacked under it read as double.
    render(<RichTextInput toolbarPosition="bottom" hideFooter />);

    expect(
      document.querySelector('[class*="safe-area-inset-bottom"]'),
    ).toBeInTheDocument();
  });

  it('swaps only the editor element between modes', () => {
    render(<RichTextInput toolbarPosition="bottom" hideFooter />);

    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByLabelText('Switch to Markdown Editor', {
        selector: 'button',
      }),
    );

    expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
