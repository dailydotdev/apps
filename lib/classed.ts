import React, {
  Attributes,
  ClassAttributes,
  ElementType,
  FunctionComponentElement,
  ReactElement,
} from 'react';
import classNames from 'classnames';

function classed<P extends Record<string, unknown>>(
  type: ElementType,
  ...className: string[]
): (props?: (Attributes & P) | null) => FunctionComponentElement<P>;

function classed<
  T extends keyof JSX.IntrinsicElements,
  P extends JSX.IntrinsicElements[T]
>(
  type: keyof JSX.IntrinsicElements,
  ...className: string[]
): (props?: (ClassAttributes<T> & P) | null) => ReactElement<P, T>;

function classed<P extends Record<string, unknown>>(
  type: ElementType | keyof JSX.IntrinsicElements,
  ...className: string[]
): (
  props?: (Attributes & P & { className?: string }) | null,
) => ReactElement<P> {
  return function Classed(props) {
    return React.createElement(type, {
      ...props,
      className: classNames(
        // eslint-disable-next-line react/prop-types
        props?.className,
        ...className,
      ),
    });
  };
}

export default classed;
