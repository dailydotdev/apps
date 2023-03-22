import { KeyboardEvent, MouseEvent, createContext, ReactNode } from 'react';
import { AnalyticsEvent } from '../../../lib/analytics';

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
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

export enum LazyModal {
  EditSquad = 'editSquad',
  NewSquad = 'newSquad',
  PostToSquad = 'postToSquad',
  SquadInvite = 'squadInvite',
  SquadMember = 'squadMember',
  SquadTour = 'squadTour',
  UpvotedPopup = 'upvotedPopup',
}

export type ModalTabItem = {
  title: string;
  options: Record<string, unknown>;
};

export type ModalStep = {
  key: string;
  screen_value?: string;
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
  onTrackNext?: AnalyticsEvent;
  onTrackPrev?: AnalyticsEvent;
};

export const ModalPropsContext = createContext<ModalContextProps>({
  onRequestClose: null,
  kind: ModalKind.FlexibleCenter,
  size: ModalSize.Medium,
});

export function modalTabTitle(tab: string | ModalTabItem): string {
  return typeof tab === 'string' ? tab : tab.title;
}
