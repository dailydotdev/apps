import { act, renderHook } from '@testing-library/react';
import { useTextSelectionShare } from './useTextSelectionShare';

const rect = {
  top: 200,
  bottom: 220,
  left: 40,
  right: 260,
  width: 220,
  height: 20,
};

const mockSelection = ({
  text,
  node,
  isCollapsed = false,
}: {
  text: string;
  node: Node | null;
  isCollapsed?: boolean;
}) => {
  const range = { getBoundingClientRect: () => rect } as unknown as Range;

  window.getSelection = jest.fn().mockReturnValue({
    isCollapsed,
    rangeCount: isCollapsed ? 0 : 1,
    anchorNode: node,
    focusNode: node,
    toString: () => text,
    getRangeAt: () => range,
  });
};

const setup = (enabled = true) => {
  const container = document.createElement('div');
  const child = document.createTextNode('some post body text');
  container.appendChild(child);
  document.body.appendChild(container);

  const containerRef = { current: container };
  const { result } = renderHook(() =>
    useTextSelectionShare({ containerRef, enabled }),
  );

  return { result, container, child };
};

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('useTextSelectionShare', () => {
  it('exposes the selected text and its rect once the selection ends', () => {
    const { result, child } = setup();

    mockSelection({ text: 'post body', node: child });
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.text).toEqual('post body');
    expect(result.current.rect).toEqual({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  });

  it('ignores selections made outside the container', () => {
    const { result } = setup();
    const outside = document.createTextNode('sidebar text');
    document.body.appendChild(outside);

    mockSelection({ text: 'sidebar text', node: outside });
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.text).toBeNull();
  });

  it('clears once the selection collapses', () => {
    const { result, child } = setup();

    mockSelection({ text: 'post body', node: child });
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
    expect(result.current.text).toEqual('post body');

    mockSelection({ text: '', node: child, isCollapsed: true });
    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.text).toBeNull();
    expect(result.current.rect).toBeNull();
  });

  it('stays inert when disabled', () => {
    const { result, child } = setup(false);

    mockSelection({ text: 'post body', node: child });
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.text).toBeNull();
  });
});
