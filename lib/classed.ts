import React, {
  ClassAttributes,
  ElementType,
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  HTMLAttributes,
  InputHTMLAttributes,
  PropsWithoutRef,
  ReactHTML,
  RefAttributes,
} from 'react';
import classNames from 'classnames';

function classed(
  type: 'input',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>
  > &
    RefAttributes<HTMLInputElement>
>;

function classed<P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  ...className: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

function classed<P extends Record<string, unknown>>(
  type: FunctionComponent<P>,
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<FunctionComponent<P>>
>;

function classed<T, P extends Record<string, unknown>>(
  type: ElementType,
  ...className: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
  return forwardRef<T, P>(function Classed(props, ref) {
    return React.createElement(type, {
      ...props,
      className: classNames(
        // eslint-disable-next-line react/prop-types
        props?.className,
        ...className,
      ),
      ref,
    });
  });
}

export default classed;
