import { KeyboardEvent, MouseEvent, createContext, ReactNode } from 'react';

export enum ModalHeaderKind {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Quaternary = 'quaternary',
}

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
  XLarge = 'xlarge',
}

export enum LazyModal {
  NewSquad = 'newSquad',
  BetaSquad = 'betaSquad',
  EditSquad = 'editSquad',
  PostToSquad = 'postToSquad',
  LockedSquad = 'lockedSquad',
  SquadMember = 'squadMember',
  UpvotedPopup = 'upvotedpopup',
}

export type ModalTabItem = {
  title: string;
  options: Record<string, unknown>;
};

export type ModalStep = {
  key: string;
  title?: string | ReactNode;
  hideProgress?: boolean;
};

export type ModalContextProps = {
  activeView?: string;
  kind: ModalKind;
  onViewChange?: (view: string) => void;
  onRequestClose: null | ((event: MouseEvent | KeyboardEvent) => void);
  setActiveView?: (view: string) => void;
  size: ModalSize;
  steps?: ModalStep[];
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
