import type { ReactElement, ReactNode, Ref } from 'react';
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
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

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border-subtlest-tertiary p-2">
        <ToolbarButton
          tooltip="Bold (⌘B)"
          icon={<BoldIcon />}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          tooltip="Italic (⌘I)"
          icon={<ItalicIcon />}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
        <ToolbarButton
          tooltip="Bullet list (⌘⇧8)"
          icon={<BulletListIcon />}
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          tooltip="Numbered list (⌘⇧7)"
          icon={<NumberedListIcon />}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
        <ToolbarButton
          tooltip={editor.isActive('link') ? 'Edit link (⌘K)' : 'Add link (⌘K)'}
          icon={<LinkIcon />}
          isActive={editor.isActive('link')}
          onClick={openLinkModal}
        />
        {inlineActions && (
          <>
            <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
            <div className="flex items-center gap-1">{inlineActions}</div>
          </>
        )}
        {(editor.can().undo() || editor.can().redo()) && (
          <div className="mx-1 h-4 w-px bg-border-subtlest-tertiary" />
        )}
        <ToolbarButton
          tooltip="Undo (⌘Z)"
          icon={<UndoIcon />}
          isActive={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          tooltip="Redo (⌘⇧Z)"
          icon={<RedoIcon />}
          isActive={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
        {rightActions && (
          <div className="ml-auto flex items-center gap-1">{rightActions}</div>
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
