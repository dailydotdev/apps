import { renderHook, act } from '@testing-library/react';
import type { DragEvent } from 'react';
import { useShortcutDropZone } from './useShortcutDropZone';

// In jsdom, DragEvent's DataTransfer is sparsely implemented and `types` is
// read-only — so we stub the parts the hook actually reads and fake just
// enough of a React synthetic event to drive the handlers directly. This
// matches how the hook is actually consumed (via React's synthetic event
// system spreading `dropHandlers` onto a JSX element), so we're exercising
// the same branches a real drag would hit.
interface FakeDataTransfer {
  types: string[];
  data: Record<string, string>;
  dropEffect: string;
}

const createDragEvent = (
  payload: Record<string, string> = {},
): {
  event: DragEvent<HTMLElement>;
  preventDefault: jest.Mock;
  dataTransfer: FakeDataTransfer;
} => {
  const dataTransfer: FakeDataTransfer = {
    types: Object.keys(payload),
    data: payload,
    dropEffect: 'none',
  };
  const preventDefault = jest.fn();
  const event = {
    preventDefault,
    dataTransfer: {
      ...dataTransfer,
      getData: (type: string) => dataTransfer.data[type] ?? '',
      // Make `dropEffect` writable the way the DOM spec treats it. The
      // hook flips it to 'copy' on dragOver; tests then assert on it.
      get dropEffect() {
        return dataTransfer.dropEffect;
      },
      set dropEffect(value: string) {
        dataTransfer.dropEffect = value;
      },
    },
  } as unknown as DragEvent<HTMLElement>;
  return { event, preventDefault, dataTransfer };
};

describe('useShortcutDropZone', () => {
  it('returns no handlers when onDropUrl is undefined', () => {
    const { result } = renderHook(() => useShortcutDropZone(undefined));
    expect(result.current.dropHandlers).toBeUndefined();
    expect(result.current.isDropTarget).toBe(false);
  });

  it('returns no handlers when explicitly disabled', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop, false));
    expect(result.current.dropHandlers).toBeUndefined();
    expect(result.current.isDropTarget).toBe(false);
  });

  it('ignores drags without a text/uri-list payload on hover', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));
    const { event, preventDefault } = createDragEvent({
      'text/plain': 'hello, plain text',
    });

    act(() => {
      result.current.dropHandlers?.onDragEnter(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.isDropTarget).toBe(false);
  });

  it('activates the drop target for text/uri-list drags and flips dropEffect on dragOver', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));

    const enter = createDragEvent({
      'text/uri-list': 'https://example.com',
    });
    act(() => {
      result.current.dropHandlers?.onDragEnter(enter.event);
    });
    expect(enter.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isDropTarget).toBe(true);

    const over = createDragEvent({ 'text/uri-list': 'https://example.com' });
    act(() => {
      result.current.dropHandlers?.onDragOver(over.event);
    });
    expect(over.preventDefault).toHaveBeenCalledTimes(1);
    expect(over.dataTransfer.dropEffect).toBe('copy');
  });

  it('keeps the highlight on while nested child boundaries are crossed', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));
    const payload = { 'text/uri-list': 'https://example.com' };

    // Simulates entering the toolbar, then crossing into a child tile: two
    // enters, only one leave should NOT yet deactivate the zone.
    act(() => {
      result.current.dropHandlers?.onDragEnter(createDragEvent(payload).event);
      result.current.dropHandlers?.onDragEnter(createDragEvent(payload).event);
    });
    expect(result.current.isDropTarget).toBe(true);

    act(() => {
      result.current.dropHandlers?.onDragLeave();
    });
    expect(result.current.isDropTarget).toBe(true);

    act(() => {
      result.current.dropHandlers?.onDragLeave();
    });
    expect(result.current.isDropTarget).toBe(false);
  });

  it('calls onDropUrl with the text/uri-list payload', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));

    act(() => {
      result.current.dropHandlers?.onDragEnter(
        createDragEvent({ 'text/uri-list': 'https://example.com' }).event,
      );
    });

    const drop = createDragEvent({ 'text/uri-list': 'https://example.com' });
    act(() => {
      result.current.dropHandlers?.onDrop(drop.event);
    });

    expect(drop.preventDefault).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith('https://example.com');
    expect(result.current.isDropTarget).toBe(false);
  });

  it('falls back to text/plain for the URL at drop time (Firefox case)', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));

    // Enter still gated on uri-list so the row lights up for real link drags.
    act(() => {
      result.current.dropHandlers?.onDragEnter(
        createDragEvent({ 'text/uri-list': 'https://example.com' }).event,
      );
    });

    // On drop, the uri-list is empty but text/plain carries the URL.
    const drop = createDragEvent({
      'text/uri-list': '',
      'text/plain': 'example.com',
    });
    act(() => {
      result.current.dropHandlers?.onDrop(drop.event);
    });

    expect(onDrop).toHaveBeenCalledWith('https://example.com');
  });

  it('skips comment lines and whitespace in text/uri-list', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));

    act(() => {
      result.current.dropHandlers?.onDragEnter(
        createDragEvent({ 'text/uri-list': 'https://example.com' }).event,
      );
    });

    // Per RFC 2483, `#`-prefixed lines are comments. We should pick the
    // first valid URL past them.
    const drop = createDragEvent({
      'text/uri-list':
        '# comment line\n  \nhttps://daily.dev\nhttps://ignored.example',
    });
    act(() => {
      result.current.dropHandlers?.onDrop(drop.event);
    });

    expect(onDrop).toHaveBeenCalledWith('https://daily.dev');
  });

  it('no-ops on drop when the payload is not a valid URL', () => {
    const onDrop = jest.fn();
    const { result } = renderHook(() => useShortcutDropZone(onDrop));

    act(() => {
      result.current.dropHandlers?.onDragEnter(
        createDragEvent({ 'text/uri-list': 'https://example.com' }).event,
      );
    });

    const drop = createDragEvent({
      'text/uri-list': '',
      'text/plain': 'just some selected text, not a URL at all',
    });
    act(() => {
      result.current.dropHandlers?.onDrop(drop.event);
    });

    expect(onDrop).not.toHaveBeenCalled();
    expect(result.current.isDropTarget).toBe(false);
  });
});
