import React, {
  Attributes,
  ClassAttributes,
  ComponentClass,
  ElementType,
  FunctionComponent,
  FunctionComponentElement,
  ReactElement,
} from 'react';
import classNames from 'classnames';

function classed<
  T extends keyof JSX.IntrinsicElements,
  P extends JSX.IntrinsicElements[T]
>(
  type: ElementType,
  ...className: string[]
): (props?: (ClassAttributes<T> & P) | null) => ReactElement<P, T>;

// function classed<P extends HTMLAttributes<T>, T extends HTMLElement>(
//   type: keyof ReactHTML,
//   ...className: string[]
// ): (props?: (ClassAttributes<T> & P) | null) => DetailedReactHTMLElement<P, T>;
//
// function classed<P extends DOMAttributes<T>, T extends Element>(
//   type: keyof ReactHTML,
//   ...className: string[]
// ): (props?: (ClassAttributes<T> & P) | null) => DOMElement<P, T>;

function classed<P extends Record<string, never>>(
  type: FunctionComponent<P>,
  ...className: string[]
): (props?: (Attributes & P) | null) => FunctionComponentElement<P>;

function classed<P extends Record<string, never>>(
  type: FunctionComponent<P> | ComponentClass<P> | string,
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
