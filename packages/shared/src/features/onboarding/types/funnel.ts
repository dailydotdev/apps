import type { ComponentProps } from 'react';
import type {
  BoxContentImageProps,
  BoxFaqProps,
  BoxListProps,
  ImageReviewProps,
  Review,
  PricingPlansProps,
} from '../shared';

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
  SocialProof = 'socialProof',
  Loading = 'loading',
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
  steps: Array<NonChapterStep>;
}

export interface FunnelStepLandingPage extends FunnelStepCommon {
  type: FunnelStepType.LandingPage;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepLoading extends FunnelStepCommon {
  type: FunnelStepType.Loading;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepFact extends FunnelStepCommon {
  type: FunnelStepType.Fact;
  onTransition: FunnelStepTransitionCallback<void>;
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
    value?: string;
    image?: ComponentProps<'img'>;
  }>;
  imageUrl?: string;
}

export interface FunnelStepQuiz extends FunnelStepCommon {
  type: FunnelStepType.Quiz;
  question: FunnelStepQuizQuestion;
  explainer: string;
  onTransition: FunnelStepTransitionCallback<Record<string, string | string[]>>;
}

export interface FunnelStepSignup extends FunnelStepCommon {
  type: FunnelStepType.Signup;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepPricing extends FunnelStepCommon {
  type: FunnelStepType.Pricing;
  discount: {
    message: string;
    duration: number;
    startDate: Date;
  };
  headline: string;
  pricing: Omit<PricingPlansProps, 'className' | 'name' | 'onChange'>;
  defaultPlan: string;
  cta: string;
  featuresList: Omit<BoxListProps, 'className'>;
  review: Omit<ImageReviewProps, 'className'>;
  refund: Omit<BoxContentImageProps, 'className'>;
  faq: Omit<BoxFaqProps, 'className'>;
  onTransition: FunnelStepTransitionCallback<{
    plan: string;
    applyDiscount: boolean;
  }>;
}

export interface FunnelStepCheckout extends FunnelStepCommon {
  type: FunnelStepType.Checkout;
  priceId: string;
  discountCode?: string;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepTagSelection extends FunnelStepCommon {
  type: FunnelStepType.TagSelection;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepReadingReminder extends FunnelStepCommon {
  type: FunnelStepType.ReadingReminder;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepAppPromotion extends FunnelStepCommon {
  type: FunnelStepType.AppPromotion;
  onTransition: FunnelStepTransitionCallback<void>;
}

export interface FunnelStepSocialProof extends FunnelStepCommon {
  type: FunnelStepType.SocialProof;
  imageUrl: string;
  rating: string;
  reviews: Review[];
  reviewSubtitle: string;
  onTransition: FunnelStepTransitionCallback<void>;
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
  | FunnelStepAppPromotion
  | FunnelStepSocialProof
  | FunnelStepLoading;

export type NonChapterStep = Exclude<FunnelStep, FunnelStepChapter>;

export type FunnelPosition = {
  chapter: number;
  step: number;
};

export interface FunnelJSON {
  id: string;
  version: number;
  parameters: FunnelStepParameters;
  entryPoint: FunnelStep['id'];
  steps: Array<FunnelStep>;
}
