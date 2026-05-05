import type { ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';

type PaneDividerProps = {
  onResizeDelta: (deltaPx: number) => void;
  className?: string;
};

export function PaneDivider({
  onResizeDelta,
  className,
}: PaneDividerProps): ReactElement {
  const startXRef = useRef(0);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }
      const delta = event.clientX - startXRef.current;
      startXRef.current = event.clientX;
      onResizeDelta(delta);
    },
    [onResizeDelta],
  );

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={classNames(
        'z-10 group relative w-2 shrink-0 cursor-col-resize touch-none select-none',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-subtlest-tertiary group-hover:bg-border-subtlest-secondary" />
      <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2" />
    </div>
  );
}
