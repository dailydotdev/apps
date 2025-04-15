import type { FunnelStepTransitionType, FunnelStep } from './funnel';

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

export enum FunnelTargetId {
  QuizInput = 'quiz input',
  StepCta = 'step cta',
  StepSkip = 'step skip',
  StepBack = 'step back',
  SubPlan = 'subscription plan',
}

export type FunnelEvent =
  | { name: FunnelEventName.StartFunnel }
  | { name: FunnelEventName.ResumeFunnel }
  | { name: FunnelEventName.CompleteFunnel }
  | { name: FunnelEventName.LeaveFunnel }
  | { name: FunnelEventName.FunnelStepView }
  | {
      name: FunnelEventName.TransitionFunnel;
      target_type: FunnelStepTransitionType;
      target_id: FunnelStep['id'];
      details: {
        duration: number;
      };
    }
  | {
      name: FunnelEventName.ScrollFunnel;
      details: {
        scroll_y: number;
      };
    }
  | {
      name:
        | FunnelEventName.HoverFunnelElement
        | FunnelEventName.ClickFunnelElement;
      target_type: FunnelTargetId;
      target_id?: string;
    }
  | {
      name: FunnelEventName.CookieConsentView;
      target_id: 'gdpr' | 'non-gdpr';
    }
  | { name: FunnelEventName.AcceptCookieConsent }
  | { name: FunnelEventName.RejectCookieConsent };
