export enum FunnelStepType {
  LandingPage = 'landing_page',
  Fact = 'fact',
  Quiz = 'quiz',
  Signup = 'sign_up',
  Pricing = 'pricing',
  Checkout = 'checkout',
  TagSelection = 'tags_selection',
  ReadingReminder = 'reading_reminder',
  AppPromotion = 'app_promotion',
}

enum FunnelStepTransitionType {
  Skip = 'skip',
  Complete = 'complete',
}

type FunnelStepParameters = Record<string, string>;

type FunnelStepTransition = {
  on: FunnelStepTransitionType;
  destination: FunnelStep['id'];
};

interface FunnelStepCommon {
  id: string;
  parameters: FunnelStepParameters;
  transitions: FunnelStepTransition[];
}

export interface FunnelStepChapter extends FunnelStepCommon {
  steps: Array<FunnelStep>;
}

export interface FunnelStepLandingPage extends FunnelStepCommon {
  type: FunnelStepType.LandingPage;
}

export interface FunnelStepFact extends FunnelStepCommon {
  type: FunnelStepType.Fact;
}

export interface FunnelStepQuiz extends FunnelStepCommon {
  type: FunnelStepType.Quiz;
}

export interface FunnelStepSignup extends FunnelStepCommon {
  type: FunnelStepType.Signup;
}

export interface FunnelStepPricing extends FunnelStepCommon {
  type: FunnelStepType.Pricing;
}

export interface FunnelStepCheckout extends FunnelStepCommon {
  type: FunnelStepType.Checkout;
}

export interface FunnelStepTagSelection extends FunnelStepCommon {
  type: FunnelStepType.TagSelection;
}

export interface FunnelStepReadingReminder extends FunnelStepCommon {
  type: FunnelStepType.ReadingReminder;
}

export interface FunnelStepAppPromotion extends FunnelStepCommon {
  type: FunnelStepType.AppPromotion;
}

export type FunnelStep =
  | FunnelStepChapter
  | FunnelStepLandingPage
  | FunnelStepFact
  | FunnelStepQuiz
  | FunnelStepSignup
  | FunnelStepPricing
  | FunnelStepCheckout
  | FunnelStepTagSelection
  | FunnelStepReadingReminder
  | FunnelStepAppPromotion;

export interface FunnelJSON {
  id: string;
  version: number;
  parameters: FunnelStepParameters;
  entryPoint: FunnelStep['id'];
  steps: Array<FunnelStep>;
}
