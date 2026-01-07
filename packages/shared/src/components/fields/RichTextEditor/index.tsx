import type { ReactElement, MutableRefObject } from 'react';
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import classNames from 'classnames';
import type { RichTextToolbarRef } from './RichTextToolbar';
import { RichTextToolbar } from './RichTextToolbar';
import styles from './richtext.module.css';

export interface RichTextRef {
  setContent: (html: string) => void;
  getHTML: () => string;
  focus: () => void;
}

export interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  maxLength?: number;
  onValueUpdate?: (html: string) => void;
  onFocus?: () => void;
  className?: {
    container?: string;
    editor?: string;
  };
}

function RichTextEditorComponent(
  {
    initialContent = '',
    placeholder = 'Start typing...',
    maxLength = 2000,
    onValueUpdate,
    onFocus,
    className = {},
  }: RichTextEditorProps,
  ref: MutableRefObject<RichTextRef>,
): ReactElement {
  const toolbarRef = useRef<RichTextToolbarRef>(null);

  // Create Cmd+K shortcut extension
  const LinkShortcut = useMemo(
    () =>
      Extension.create({
        name: 'linkShortcut',
        addKeyboardShortcuts() {
          return {
            'Mod-k': () => {
              toolbarRef.current?.openLinkModal();
              return true;
            },
          };
        },
      }),
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener nofollow',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      LinkShortcut,
    ],
    content: initialContent,
    onUpdate: ({ editor: updatedEditor }) => {
      onValueUpdate?.(updatedEditor.getHTML());
    },
    onFocus: () => {
      onFocus?.();
    },
    // Disable immediate render to avoid SSR hydration mismatches
    immediatelyRender: false,
  });

  useImperativeHandle(ref, () => ({
    setContent: (html: string) => {
      editor?.commands.setContent(html);
    },
    getHTML: () => {
      return editor?.getHTML() ?? '';
    },
    focus: () => {
      editor?.commands.focus();
    },
  }));

  // Update content when initialContent changes externally
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
    // Only run when initialContent changes, not on every editor update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  const handleLinkAdd = useCallback(
    (url: string, label?: string) => {
      if (!editor) {
        return;
      }

      // If there's a selection, wrap it with link
      if (!editor.state.selection.empty) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // Insert link with label or URL as text
        const linkText = label || url;
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${linkText}</a>`)
          .run();
      }
    },
    [editor],
  );

  const characterCount = editor?.storage.characterCount.characters() ?? 0;
  const remainingCharacters = maxLength - characterCount;

  if (!editor) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float',
        className.container,
      )}
    >
      <RichTextToolbar
        ref={toolbarRef}
        editor={editor}
        onLinkAdd={handleLinkAdd}
      />
      <EditorContent
        editor={editor}
        className={classNames(
          styles.editor,
          'min-h-[8rem] p-4',
          className.editor,
        )}
      />
      <div className="flex justify-end border-t border-border-subtlest-tertiary p-2 px-4">
        <span
          className={classNames(
            'font-bold typo-callout',
            remainingCharacters < 100
              ? 'text-status-warning'
              : 'text-text-tertiary',
          )}
        >
          {remainingCharacters}
        </span>
      </div>
    </div>
  );
}

export const RichTextEditor = forwardRef(RichTextEditorComponent);

export default RichTextEditor;
