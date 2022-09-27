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
import { isNullOrUndefined } from './func';

const combineObjectStrings = (
  classes1: Record<string, string>,
  classes2: Record<string, string>,
) => {
  const keys1 = Object.keys(classes1);
  const keys2 = Object.keys(classes2);
  const primaryKeys = keys1.length > keys2.length ? keys1 : keys2;
  return primaryKeys.reduce(
    (classes, key) => ({
      ...classes,
      [key]: classNames(classes1[key], classes2[key]),
    }),
    {},
  );
};

export type ClassedHTML<
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

function classed(
  type: 'input',
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>
  > &
    RefAttributes<HTMLInputElement>
>;

function classed(
  type: 'time',
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    TimeHTMLAttributes<HTMLTimeElement> & ClassAttributes<HTMLTimeElement>
  > &
    RefAttributes<HTMLTimeElement>
>;

function classed(
  type: 'a',
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    AnchorHTMLAttributes<HTMLAnchorElement> & ClassAttributes<HTMLAnchorElement>
  > &
    RefAttributes<HTMLAnchorElement>
>;

function classed(
  type: 'img',
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    ImgHTMLAttributes<HTMLImageElement> & ClassAttributes<HTMLImageElement>
  > &
    RefAttributes<HTMLImageElement>
>;

function classed(
  type: 'details',
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<
    DetailsHTMLAttributes<HTMLDetailsElement> &
      ClassAttributes<HTMLDetailsElement>
  > &
    RefAttributes<HTMLDetailsElement>
>;

function classed<P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  className: string | Record<string, string>,
  ...classes: string[]
): ClassedHTML<P, T>;

function classed<P extends SVGAttributes<T>, T extends SVGElement>(
  type: keyof ReactSVG,
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

function classed<P extends unknown>(
  type: FunctionComponent<P>,
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<FunctionComponent<P>>
>;

function classed<P extends unknown>(
  type: ComponentType<P>,
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<Component<P>>>;

function classed<T, P extends Record<string, unknown>>(
  type: ElementType,
  className: string | Record<string, string>,
  ...classes: string[]
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
  return forwardRef<T, P>(function Classed(props, ref) {
    if (typeof className === 'string') {
      return React.createElement(type, {
        ...props,
        className: classNames(
          // eslint-disable-next-line react/prop-types
          props?.className,
          className,
          ...classes,
        ),
        ref,
      });
    }

    if (
      !isNullOrUndefined(props.className) &&
      typeof className !== typeof props.className
    ) {
      throw new Error('Incompatible className and parameter');
    }

    return React.createElement(type, {
      ...props,
      className: isNullOrUndefined(props.className)
        ? className
        : combineObjectStrings(
            className,
            props.className as Record<string, string>,
          ),
      ref,
    });
  });
}

export default classed;
