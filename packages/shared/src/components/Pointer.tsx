import React, { CSSProperties, ReactElement } from 'react';
import classed from '../lib/classed';

const PointerContainer = classed(
  'div',
  'h-5 z-3 flex flex-col items-center absolute',
);
const PointerPoint = classed('i', 'w-1.5 h-1.5 rounded-full block');
const PointerLine = classed('i', 'w-px h-3.5  block');

export enum PointerColor {
  Success = 'bg-theme-status-success',
  Cabbage = 'bg-theme-status-cabbage',
}

interface PointerProps {
  color: PointerColor;
  className?: string;
  style?: CSSProperties;
}

export function Pointer({
  color,
  className,
  ...props
}: PointerProps): ReactElement {
  return (
    <PointerContainer className={className} {...props}>
      <PointerPoint className={color} />
      <PointerLine className={color} />
    </PointerContainer>
  );
}
