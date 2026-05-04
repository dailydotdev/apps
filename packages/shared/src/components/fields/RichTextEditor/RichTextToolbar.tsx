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
  ItalicIcon,
  NumberedListIcon,
  RedoIcon,
  UndoIcon,
} from '../../icons';
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
  /**
   * Slot rendered before any inline actions and formatting buttons. Useful for
   * a leading control (e.g. a post-type picker) that should sit at the start
   * of the toolbar with a visual divider after it.
   */
  inlineActionsLeading?: ReactNode;
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
  /**
   * Visual group identifier — items in the same group render adjacent to each
   * other; a divider is drawn whenever the rendered group changes.
   */
  group: string;
}

const ToolbarDivider = (): ReactElement => (
  <span
    aria-hidden
    className="mx-1.5 h-5 w-px shrink-0 bg-border-subtlest-tertiary"
  />
);

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
    inlineActionsLeading,
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
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
      canUndo: currentEditor.can().undo(),
      canRedo: currentEditor.can().redo(),
    }),
  });

  // Priority: lower = stays inline, higher = drops to overflow first.
  // Group: visual grouping for the separator-between-groups layout.
  const formattingItems = useMemo<ToolbarItem[]>(() => {
    const baseItems: ToolbarItem[] = [
      {
        id: 'bold',
        priority: 0,
        group: 'format',
        label: 'Bold',
        tooltip: 'Bold (⌘B)',
        icon: <BoldIcon />,
        isActive: editorState.isBold,
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        id: 'italic',
        priority: 0,
        group: 'format',
        label: 'Italic',
        tooltip: 'Italic (⌘I)',
        icon: <ItalicIcon />,
        isActive: editorState.isItalic,
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
    ];

    if (allowBlockFormatting) {
      baseItems.push(
        {
          id: 'bullet-list',
          priority: 4,
          group: 'list',
          label: 'Bullet list',
          tooltip: 'Bullet list (⌘⇧8)',
          icon: <BulletListIcon />,
          isActive: editorState.isBulletList,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          id: 'numbered-list',
          priority: 4,
          group: 'list',
          label: 'Numbered list',
          tooltip: 'Numbered list (⌘⇧7)',
          icon: <NumberedListIcon />,
          isActive: editorState.isOrderedList,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
      );
    }

    baseItems.push(
      {
        id: 'undo',
        priority: 5,
        group: 'history',
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
        group: 'history',
        label: 'Redo',
        tooltip: 'Redo (⌘⇧Z)',
        icon: <RedoIcon />,
        isActive: false,
        onClick: () => editor.chain().focus().redo().run(),
        disabled: !editorState.canRedo,
      },
    );

    return baseItems;
  }, [allowBlockFormatting, editor, editorState]);

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

  const renderedFormattingItems = (() => {
    const nodes: ReactElement[] = [];
    let lastGroup: string | undefined;
    visibleItems.forEach((item) => {
      if (lastGroup !== undefined && item.group !== lastGroup) {
        nodes.push(<ToolbarDivider key={`divider-${lastGroup}-${item.id}`} />);
      }
      nodes.push(
        <ToolbarButton
          key={item.id}
          tooltip={item.tooltip}
          icon={item.icon}
          isActive={item.isActive}
          onClick={item.onClick}
          disabled={item.disabled}
        />,
      );
      lastGroup = item.group;
    });
    return nodes;
  })();

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(
          'flex w-full flex-row flex-nowrap items-center gap-0 px-5 pb-5 pt-2',
          !borderless && 'border-b border-border-subtlest-tertiary',
        )}
      >
        <div className="flex flex-1 flex-nowrap items-center gap-0 overflow-hidden">
          {inlineActionsLeading && (
            <>
              <div className="flex shrink-0 items-center gap-0">
                {inlineActionsLeading}
              </div>
              <ToolbarDivider />
            </>
          )}
          {inlineActions && (
            <>
              <div
                ref={inlineActionsRef}
                className="flex shrink-0 items-center gap-0"
              >
                {inlineActions}
              </div>
              {visibleItems.length > 0 && <ToolbarDivider />}
            </>
          )}
          {renderedFormattingItems}
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
