import { act, render, screen } from '@testing-library/react';
import React from 'react';
import type { Editor } from '@tiptap/react';
import { RichTextToolbar } from './RichTextToolbar';

const mockTriggerProps = jest.fn();

// Radix menu content does not render in jsdom, so the module is mocked with
// an always-open content slot (same convention as other dropdown specs).
jest.mock('../../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => {
    mockTriggerProps(props);
    return children;
  },
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({ children }: React.PropsWithChildren) => (
    <div role="menuitem">{children}</div>
  ),
}));

jest.mock('@tiptap/react', () => ({
  useEditorState: () => ({
    isBold: false,
    isItalic: false,
    isBulletList: false,
    isOrderedList: false,
    isLink: false,
    canUndo: false,
    canRedo: false,
  }),
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

jest.mock('./LinkModal', () => ({
  LinkModal: () => null,
}));

const renderToolbar = (stackLeading: boolean) =>
  render(
    <RichTextToolbar
      editor={{} as Editor}
      onLinkAdd={jest.fn()}
      position="bottom"
      stackLeading={stackLeading}
      leadingActions={<button type="button">Free form</button>}
      rightActions={<button type="submit">Post</button>}
    />,
  );

describe('RichTextToolbar leading actions', () => {
  it('renders the leading slot exactly once inside the bar by default', () => {
    renderToolbar(false);

    expect(
      screen.getByRole('button', { name: 'Free form' }),
    ).toBeInTheDocument();
  });

  it('renders the leading slot exactly once on its own row when stacked', () => {
    renderToolbar(true);

    expect(
      screen.getByRole('button', { name: 'Free form' }),
    ).toBeInTheDocument();
  });

  it('keeps the stacked leading slot out of the clipped bar row', () => {
    renderToolbar(true);

    const leading = screen.getByRole('button', { name: 'Free form' });
    // The clipped group is the `overflow-hidden` row; a stacked picker must
    // not live inside it, or narrow screens slice it again.
    expect(leading.closest('.overflow-hidden')).toBeNull();
  });

  it('moves overflowed formatting into the menu with a working trigger', () => {
    // The tooltip must ride on the trigger's own `tooltip` prop — a `Tooltip`
    // wrapper blurs on mouseup and dismisses the non-modal menu.
    const nativeResizeObserver = global.ResizeObserver;
    let triggerResize: (() => void) | undefined;
    const observerStub = (
      cb: (entries: { contentRect: { width: number } }[]) => void,
    ) => ({
      observe: () => {
        triggerResize = () => cb([{ contentRect: { width: 140 } }]);
      },
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    });
    global.ResizeObserver = jest
      .fn()
      .mockImplementation(observerStub) as unknown as typeof ResizeObserver;

    try {
      renderToolbar(false);
      act(() => triggerResize?.());

      expect(screen.getByLabelText('More formatting')).toBeInTheDocument();
      expect(mockTriggerProps).toHaveBeenCalledWith(
        expect.objectContaining({
          tooltip: expect.objectContaining({ content: 'More formatting' }),
        }),
      );
      const menu = screen.getByRole('menu');
      expect(menu).toHaveTextContent('Italic');
    } finally {
      global.ResizeObserver = nativeResizeObserver;
    }
  });
});
