import type { ReactElement, ReactNode, Ref } from 'react';
import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import classNames from 'classnames';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { getMarkRange } from '@tiptap/core';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  ArrowIcon,
  BoldIcon,
  BulletListIcon,
  CodeBlockIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HorizontalRuleIcon,
  InlineCodeIcon,
  ItalicIcon,
  NumberedListIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon,
} from '../../icons';
import { LinkIcon } from '../../icons/Link';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { LinkModal } from './LinkModal';

export interface RichTextToolbarProps {
  editor: Editor;
  onLinkAdd: (url: string, label?: string) => void;
  inlineActions?: ReactNode;
  rightActions?: ReactNode;
  allowBlockFormatting?: boolean;
  /**
   * Drop the visual border separator. Useful when the toolbar sits at the
   * bottom of a flat editor container (no surrounding card).
   */
  borderless?: boolean;
}

export interface RichTextToolbarRef {
  openLinkModal: () => void;
}

interface ToolbarItem {
  id: string;
  tooltip: string;
  label: string;
  icon: ReactElement;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  priority: number;
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
}: ToolbarButtonProps): ReactElement => (
  <Tooltip content={tooltip}>
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={React.cloneElement(icon, {
        className: icon.props.className
          ? `${icon.props.className} block m-auto`
          : 'block m-auto',
      })}
      pressed={isActive}
      onClick={onClick}
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      disabled={disabled}
      type="button"
      className="shrink-0 leading-none"
    />
  </Tooltip>
);

interface OverflowMenuProps {
  items: ToolbarItem[];
}

const OverflowMenu = ({ items }: OverflowMenuProps): ReactElement | null => {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip content="More formatting">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-180" secondary />}
            aria-label="More formatting"
            className="shrink-0"
          />
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" variant="field" className="min-w-56">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              item.onClick();
              setOpen(false);
            }}
            className={classNames(
              'gap-2',
              item.isActive ? 'text-text-link' : '',
            )}
          >
            {React.cloneElement(item.icon, { className: 'shrink-0' })}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TOOLBAR_BUTTON_WIDTH = 32;

function RichTextToolbarComponent(
  {
    editor,
    onLinkAdd,
    inlineActions,
    rightActions,
    allowBlockFormatting = true,
    borderless = false,
  }: RichTextToolbarProps,
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
      isStrike: currentEditor.isActive('strike'),
      isCode: currentEditor.isActive('code'),
      isCodeBlock: currentEditor.isActive('codeBlock'),
      isHeading1: currentEditor.isActive('heading', { level: 1 }),
      isHeading2: currentEditor.isActive('heading', { level: 2 }),
      isHeading3: currentEditor.isActive('heading', { level: 3 }),
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
      isLink: currentEditor.isActive('link'),
      canUndo: currentEditor.can().undo(),
      canRedo: currentEditor.can().redo(),
    }),
  });

  // Priority: 0 = always inline, higher = drops out first under width pressure.
  const formattingItems = useMemo<ToolbarItem[]>(() => {
    const baseItems: ToolbarItem[] = [
      {
        id: 'link',
        priority: 0,
        label: editorState.isLink ? 'Edit link' : 'Add link',
        tooltip: editorState.isLink ? 'Edit link (⌘K)' : 'Add link (⌘K)',
        icon: <LinkIcon />,
        isActive: editorState.isLink,
        onClick: openLinkModal,
      },
      {
        id: 'bold',
        priority: 0,
        label: 'Bold',
        tooltip: 'Bold (⌘B)',
        icon: <BoldIcon />,
        isActive: editorState.isBold,
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        id: 'italic',
        priority: 0,
        label: 'Italic',
        tooltip: 'Italic (⌘I)',
        icon: <ItalicIcon />,
        isActive: editorState.isItalic,
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        id: 'strike',
        priority: 1,
        label: 'Strikethrough',
        tooltip: 'Strikethrough (⌘⇧S)',
        icon: <StrikethroughIcon />,
        isActive: editorState.isStrike,
        onClick: () => editor.chain().focus().toggleStrike().run(),
      },
    ];

    if (allowBlockFormatting) {
      baseItems.push(
        {
          id: 'h1',
          priority: 2,
          label: 'Heading 1',
          tooltip: 'Heading 1 (⌘⌥1)',
          icon: <Heading1Icon />,
          isActive: editorState.isHeading1,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          id: 'h2',
          priority: 2,
          label: 'Heading 2',
          tooltip: 'Heading 2 (⌘⌥2)',
          icon: <Heading2Icon />,
          isActive: editorState.isHeading2,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          id: 'h3',
          priority: 2,
          label: 'Heading 3',
          tooltip: 'Heading 3 (⌘⌥3)',
          icon: <Heading3Icon />,
          isActive: editorState.isHeading3,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          id: 'inline-code',
          priority: 3,
          label: 'Inline code',
          tooltip: 'Inline code (⌘E)',
          icon: <InlineCodeIcon />,
          isActive: editorState.isCode,
          onClick: () => editor.chain().focus().toggleCode().run(),
        },
        {
          id: 'hr',
          priority: 3,
          label: 'Horizontal rule',
          tooltip: 'Horizontal rule',
          icon: <HorizontalRuleIcon />,
          isActive: false,
          onClick: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
          id: 'code-block',
          priority: 3,
          label: 'Code block',
          tooltip: 'Code block (⌘⌥C)',
          icon: <CodeBlockIcon />,
          isActive: editorState.isCodeBlock,
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          id: 'bullet-list',
          priority: 4,
          label: 'Bullet list',
          tooltip: 'Bullet list (⌘⇧8)',
          icon: <BulletListIcon />,
          isActive: editorState.isBulletList,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          id: 'numbered-list',
          priority: 4,
          label: 'Numbered list',
          tooltip: 'Numbered list (⌘⇧7)',
          icon: <NumberedListIcon />,
          isActive: editorState.isOrderedList,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
      );
    } else {
      baseItems.push({
        id: 'inline-code',
        priority: 3,
        label: 'Inline code',
        tooltip: 'Inline code (⌘E)',
        icon: <InlineCodeIcon />,
        isActive: editorState.isCode,
        onClick: () => editor.chain().focus().toggleCode().run(),
      });
    }

    baseItems.push(
      {
        id: 'undo',
        priority: 5,
        label: 'Undo',
        tooltip: 'Undo (⌘Z)',
        icon: <UndoIcon />,
        isActive: false,
        onClick: () => editor.chain().focus().undo().run(),
        disabled: !editorState.canUndo,
      },
      {
        id: 'redo',
        priority: 5,
        label: 'Redo',
        tooltip: 'Redo (⌘⇧Z)',
        icon: <RedoIcon />,
        isActive: false,
        onClick: () => editor.chain().focus().redo().run(),
        disabled: !editorState.canRedo,
      },
    );

    return baseItems;
  }, [allowBlockFormatting, editor, editorState, openLinkModal]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const rightActionsRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [reservedWidth, setReservedWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const inlineWidth =
      inlineActionsRef.current?.getBoundingClientRect().width ?? 0;
    const rightWidth =
      rightActionsRef.current?.getBoundingClientRect().width ?? 0;
    // Always reserve space for the overflow chevron so we can show it when
    // anything overflows.
    setReservedWidth(inlineWidth + rightWidth + TOOLBAR_BUTTON_WIDTH);
  }, [rightActions, inlineActions, containerWidth]);

  const visibleCount = useMemo(() => {
    if (containerWidth === 0) {
      return formattingItems.length;
    }
    const available = Math.max(0, containerWidth - reservedWidth);
    const fits = Math.floor(available / TOOLBAR_BUTTON_WIDTH);
    return Math.min(formattingItems.length, Math.max(0, fits));
  }, [containerWidth, reservedWidth, formattingItems.length]);

  const sortedByPriority = useMemo(
    () => [...formattingItems].sort((a, b) => a.priority - b.priority),
    [formattingItems],
  );

  const visibleIds = useMemo(
    () => new Set(sortedByPriority.slice(0, visibleCount).map((i) => i.id)),
    [sortedByPriority, visibleCount],
  );

  const visibleItems = useMemo(
    () => formattingItems.filter((item) => visibleIds.has(item.id)),
    [formattingItems, visibleIds],
  );

  const overflowItems = useMemo(
    () => formattingItems.filter((item) => !visibleIds.has(item.id)),
    [formattingItems, visibleIds],
  );

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(
          'flex h-10 min-h-10 w-full flex-row flex-nowrap items-center gap-0 px-2',
          !borderless && 'border-b border-border-subtlest-tertiary',
        )}
      >
        <div className="flex flex-1 flex-nowrap items-center gap-0 overflow-hidden">
          {inlineActions && (
            <div
              ref={inlineActionsRef}
              className="flex shrink-0 items-center gap-0"
            >
              {inlineActions}
            </div>
          )}
          {visibleItems.map((item) => (
            <ToolbarButton
              key={item.id}
              tooltip={item.tooltip}
              icon={item.icon}
              isActive={item.isActive}
              onClick={item.onClick}
              disabled={item.disabled}
            />
          ))}
          <OverflowMenu items={overflowItems} />
        </div>
        {rightActions && (
          <div
            ref={rightActionsRef}
            className="flex shrink-0 items-center gap-0"
          >
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
