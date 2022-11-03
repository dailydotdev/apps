import { KeyboardEvent, MouseEvent, createContext } from 'react';

export enum ModalKind {
  FlexibleCenter = 'flexible-center',
  FlexibleTop = 'flexible-top',
  FixedCenter = 'fixed-center',
}

export enum ModalSize {
  XSmall = 'x-small',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export const ModalContext = createContext<
  null | ((event: MouseEvent | KeyboardEvent) => any)
>(null);
