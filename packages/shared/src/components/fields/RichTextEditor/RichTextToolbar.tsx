import type { ReactElement, ReactNode, Ref } from 'react';
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { getMarkRange } from '@tiptap/core';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  BoldIcon,
  ItalicIcon,
  BulletListIcon,
  NumberedListIcon,
  UndoIcon,
  RedoIcon,
} from '../../icons';
import { LinkIcon } from '../../icons/Link';
import { Tooltip } from '../../tooltip/Tooltip';
import { LinkModal } from './LinkModal';

export interface RichTextToolbarProps {
  editor: Editor;
  onLinkAdd: (url: string, label?: string) => void;
  inlineActions?: ReactNode;
  rightActions?: ReactNode;
}

export interface RichTextToolbarRef {
  openLinkModal: () => void;
}

interface ToolbarButtonProps {
  tooltip: string;
  icon: ReactElement;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton = ({
  tooltip,
  icon,
  isActive,
  onClick,
  disabled = false,
}: ToolbarButtonProps): ReactElement | null => {
  if (disabled) {
    return null;
  }

  return (
    <Tooltip content={tooltip}>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={icon}
        pressed={isActive}
        onClick={onClick}
        type="button"
      />
    </Tooltip>
  );
};

function RichTextToolbarComponent(
  { editor, onLinkAdd, inlineActions, rightActions }: RichTextToolbarProps,
  ref: Ref<RichTextToolbarRef>,
): ReactElement {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [initialUrl, setInitialUrl] = useState('');
  const [initialLabel, setInitialLabel] = useState('');

  const openLinkModal = useCallback(() => {
    if (editor.isActive('link')) {
      // Get current link attributes for editing
      const attrs = editor.getAttributes('link');
      const { $from } = editor.state.selection;
      const linkMark = editor.schema.marks.link;
      const range = getMarkRange($from, linkMark);

      // Get full link text from mark range
      let linkText = '';
      if (range) {
        linkText = editor.state.doc.textBetween(range.from, range.to, '');
      }

      setInitialUrl(attrs.href || '');
      setInitialLabel(linkText);
      setIsLinkModalOpen(true);
    } else {
      // Get selected text as initial label
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '');
      setInitialUrl('');
      setInitialLabel(selectedText);
      setIsLinkModalOpen(true);
    }
  }, [editor]);

  useImperativeHandle(ref, () => ({
    openLinkModal,
  }));

  const handleLinkSubmit = useCallback(
    (url: string, label?: string) => {
      // If editing existing link, remove it first
      if (editor.isActive('link')) {
        editor.chain().focus().unsetLink().run();
      }
      onLinkAdd(url, label);
      setIsLinkModalOpen(false);
    },
    [editor, onLinkAdd],
  );

  const handleModalClose = useCallback(() => {
    setIsLinkModalOpen(false);
  }, []);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor.isActive('bold'),
      isItalic: currentEditor.isActive('italic'),
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isLink: currentEditor.isActive('link'),
      canUndo: currentEditor.can().undo(),
      canRedo: currentEditor.can().redo(),
    }),
  });

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-border-subtlest-tertiary p-2 tablet:flex-row tablet:items-center tablet:gap-1">
        <div className="flex flex-wrap items-center gap-1 tablet:flex-1">
          <ToolbarButton
            tooltip="Bold (⌘B)"
            icon={<BoldIcon />}
            isActive={editorState.isBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            tooltip="Italic (⌘I)"
            icon={<ItalicIcon />}
            isActive={editorState.isItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
          <ToolbarButton
            tooltip="Bullet list (⌘⇧8)"
            icon={<BulletListIcon />}
            isActive={editorState.isBulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            tooltip="Numbered list (⌘⇧7)"
            icon={<NumberedListIcon />}
            isActive={editorState.isOrderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
          <ToolbarButton
            tooltip={editorState.isLink ? 'Edit link (⌘K)' : 'Add link (⌘K)'}
            icon={<LinkIcon />}
            isActive={editorState.isLink}
            onClick={openLinkModal}
          />
          {inlineActions && (
            <>
              <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
              <div className="flex items-center gap-1">{inlineActions}</div>
            </>
          )}
          {(editorState.canUndo || editorState.canRedo) && (
            <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
          )}
          <ToolbarButton
            tooltip="Undo (⌘Z)"
            icon={<UndoIcon />}
            isActive={false}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editorState.canUndo}
          />
          <ToolbarButton
            tooltip="Redo (⌘⇧Z)"
            icon={<RedoIcon />}
            isActive={false}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editorState.canRedo}
          />
        </div>
        {rightActions && (
          <div className="flex items-center justify-end gap-1 tablet:ml-auto">
            {rightActions}
          </div>
        )}
      </div>
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={handleModalClose}
        onSubmit={handleLinkSubmit}
        initialUrl={initialUrl}
        initialLabel={initialLabel}
      />
    </>
  );
}

export const RichTextToolbar = forwardRef(RichTextToolbarComponent);

export default RichTextToolbar;
