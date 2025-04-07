export enum FunnelStepType {
  LandingPage = 'landingPage',
  Fact = 'fact',
  Quiz = 'quiz',
  Signup = 'signUp',
  Pricing = 'pricing',
  Checkout = 'checkout',
  TagSelection = 'tagsSelection',
  ReadingReminder = 'readingReminder',
  AppPromotion = 'appPromotion',
}

export enum FunnelStepTransitionType {
  Skip = 'skip',
  Complete = 'complete',
}

export type FunnelStepTransitionCallback<Details = unknown> = (transition: {
  type: FunnelStepTransitionType;
  details?: Details;
}) => void;

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

export enum FunnelStepQuizQuestionType {
  Radio = 'singleChoice',
  Checkbox = 'multipleChoice',
  Rating = 'rating',
}

export interface FunnelStepQuizQuestion {
  type: FunnelStepQuizQuestionType;
  text: string;
  placeholder?: string;
  options: Array<{
    label: string;
  }>;
  imageUrl?: string;
}

export interface FunnelStepQuiz extends FunnelStepCommon {
  type: FunnelStepType.Quiz;
  question: FunnelStepQuizQuestion;
  explainer: string;
  onTransition: FunnelStepTransitionCallback<{ value: string | string[] }>;
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
