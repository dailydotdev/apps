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

export type ModalTabItem = {
  title: string;
  options: Record<string, unknown>;
};

export type ModalContextProps = {
  onRequestClose: null | ((event: MouseEvent | KeyboardEvent) => void);
  kind: ModalKind;
  size: ModalSize;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabs?: string[] | ModalTabItem[];
};

export const ModalPropsContext = createContext<ModalContextProps>({
  onRequestClose: null,
  kind: ModalKind.FlexibleCenter,
  size: ModalSize.Medium,
});

export function modalTabTitle(tab: string | ModalTabItem): string {
  return typeof tab === 'string' ? tab : tab.title;
}
