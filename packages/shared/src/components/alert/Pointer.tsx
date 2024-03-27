import React, {
  CSSProperties,
  forwardRef,
  MutableRefObject,
  ReactElement,
} from 'react';
import classed from '../../lib/classed';

const PointerContainer = classed('div', 'h-5 z-3 flex flex-col items-center');
const PointerPoint = classed('i', 'w-1.5 h-1.5 rounded-full block');
const PointerLine = classed('i', 'w-px h-3.5  block');

export enum PointerColor {
  Success = 'bg-status-success',
  Cabbage = 'bg-accent-cabbage-default',
}

interface PointerProps {
  color: PointerColor;
  className?: string;
  style?: CSSProperties;
}

function Pointer(
  { color, ...props }: PointerProps,
  ref?: MutableRefObject<HTMLDivElement>,
): ReactElement {
  return (
    <PointerContainer {...props} ref={ref}>
      <PointerPoint className={color} />
      <PointerLine className={color} />
    </PointerContainer>
  );
}

export default forwardRef(Pointer);
