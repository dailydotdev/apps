import type { FunnelStepTransitionType, NonChapterStep } from './funnel';

export enum FunnelEventName {
  StartFunnel = 'start funnel',
  ResumeFunnel = 'resume funnel',
  CompleteFunnel = 'complete funnel',
  LeaveFunnel = 'leave_funnel',
  FunnelStepView = 'funnel step view',
  TransitionFunnel = 'transition funnel',
  ScrollFunnel = 'scroll funnel',
  HoverFunnelElement = 'hover funnel element',
  ClickFunnelElement = 'click funnel element',
  CookieConsentView = 'cookie consent view',
  AcceptCookieConsent = 'accept cookies',
  RejectCookieConsent = 'decline cookies',
}

export type FunnelEvent =
  | { name: FunnelEventName.StartFunnel }
  | { name: FunnelEventName.ResumeFunnel }
  | { name: FunnelEventName.CompleteFunnel }
  | { name: FunnelEventName.LeaveFunnel }
  | { name: FunnelEventName.FunnelStepView }
  | {
      name: FunnelEventName.TransitionFunnel;
      details: {
        target_type: FunnelStepTransitionType;
        target_id: NonChapterStep['id'];
        event_duration: number;
      };
    }
  | {
      name: FunnelEventName.ScrollFunnel;
      details: {
        scroll_y: number;
      };
    }
  | {
      name: FunnelEventName.HoverFunnelElement;
      details: {
        target_type: keyof HTMLElementTagNameMap;
        target_id?: string;
      };
    }
  | {
      name: FunnelEventName.ClickFunnelElement;
      details: {
        target_type: keyof HTMLElementTagNameMap;
        target_id?: string;
      };
    }
  | {
      name: FunnelEventName.CookieConsentView;
      details: {
        target_id: 'gdpr' | 'non-gdpr';
      };
    }
  | { name: FunnelEventName.AcceptCookieConsent }
  | { name: FunnelEventName.RejectCookieConsent };
