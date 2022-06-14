import React, {
  AnchorHTMLAttributes,
  ClassAttributes,
  Component,
  ComponentType,
  DetailsHTMLAttributes,
  ElementType,
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  HTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  PropsWithoutRef,
  ReactHTML,
  ReactSVG,
  RefAttributes,
  SVGAttributes,
  TimeHTMLAttributes,
} from 'react';
import classNames from 'classnames';

export type ClassedHTML<
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

function classed(
  type: 'input',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>
  > &
    RefAttributes<HTMLInputElement>
>;

function classed(
  type: 'time',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    TimeHTMLAttributes<HTMLTimeElement> & ClassAttributes<HTMLTimeElement>
  > &
    RefAttributes<HTMLTimeElement>
>;

function classed(
  type: 'a',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    AnchorHTMLAttributes<HTMLAnchorElement> & ClassAttributes<HTMLAnchorElement>
  > &
    RefAttributes<HTMLAnchorElement>
>;

function classed(
  type: 'img',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    ImgHTMLAttributes<HTMLImageElement> & ClassAttributes<HTMLImageElement>
  > &
    RefAttributes<HTMLImageElement>
>;

function classed(
  type: 'details',
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    DetailsHTMLAttributes<HTMLDetailsElement> &
      ClassAttributes<HTMLDetailsElement>
  > &
    RefAttributes<HTMLDetailsElement>
>;

function classed<P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  ...className: string[]
): ClassedHTML<P, T>;

function classed<P extends SVGAttributes<T>, T extends SVGElement>(
  type: keyof ReactSVG,
  ...className: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

function classed<P extends unknown>(
  type: FunctionComponent<P>,
  ...className: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<FunctionComponent<P>>
>;

function classed<P extends unknown>(
  type: ComponentType<P>,
  ...className: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<Component<P>>>;

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
