import {
  KeyboardEvent,
  MouseEvent,
  createContext,
  ReactNode,
  useContext,
} from 'react';
import { LogEvent } from '../../../lib/log';

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
  FixedBottom = 'fixed-bottom',
}

export enum ModalSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

export enum LazyModal {
  SquadMember = 'squadMember',
  SquadTour = 'squadTour',
  UpvotedPopup = 'upvotedPopup',
  ReadingHistory = 'readingHistory',
  SquadPromotion = 'squadPromotion',
  CreateSharedPost = 'createSharedPost',
  ReportPost = 'reportPost',
  ReportComment = 'reportComment',
  SquadNotifications = 'squadNotifications',
  NewSource = 'newSource',
  SubmitArticle = 'submitArticle',
  FeedFilters = 'feedFilters',
  VerifySession = 'verifySession',
  GenericReferral = 'genericReferral',
  Video = 'video',
  NewStreak = 'newStreak',
  ReputationPrivileges = 'reputationPrivileges',
  MarketingCta = 'marketingCta',
  UserSettings = 'userSettings',
  Share = 'share',
  SubmitSquadForReview = 'submitSquadForReview',
  PrivilegedMembers = 'privilegedMembers',
  FirefoxPrivacy = 'firefoxPrivacy',
  BookmarkReminder = 'bookmarkReminder',
}

export type ModalTabItem = {
  title: string;
  options: Record<string, unknown>;
  group?: string;
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
  onLogNext?: LogEvent;
  onLogPrev?: LogEvent;
  isDrawer?: boolean;
  isForm?: boolean;
  isMobile?: boolean;
};

export const ModalPropsContext = createContext<ModalContextProps>({
  onRequestClose: null,
  kind: ModalKind.FlexibleCenter,
  size: ModalSize.Medium,
});

export const useModalContext = (): ModalContextProps =>
  useContext(ModalPropsContext);

export function modalTabTitle(tab: string | ModalTabItem): string {
  return typeof tab === 'string' ? tab : tab.title;
}
