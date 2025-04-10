import type { ComponentProps } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import type {
  BoxFaqProps,
  BoxListProps,
  ImageReviewProps,
  PricingPlanVariation,
  Review,
} from '../shared';
import type { FormInputCheckboxGroupProps } from '../../common/components/FormInputCheckboxGroup';
import type { StepHeadlineAlign } from '../shared/StepHeadline';

export enum FunnelStepType {
  LandingPage = 'landingPage',
  Fact = 'fact',
  Quiz = 'quiz',
  Signup = 'registration',
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

export const COMPLETED_STEP_ID = 'FINISH' as const;

export type FunnelStepTransitionCallback<Details = Record<string, unknown>> =
  (transition: { type: FunnelStepTransitionType; details?: Details }) => void;

type FunnelStepParameters<
  Params extends {
    [p: string]: unknown;
  } = Record<string, unknown>,
> = {
  [key in keyof Params]: Params[key];
} & { [p: string]: unknown };

export type FunnelStepTransition = {
  on: FunnelStepTransitionType;
  destination: FunnelStep['id'] | typeof COMPLETED_STEP_ID;
};

interface FunnelStepCommon<T = FunnelStepParameters> {
  id: string;
  parameters: T;
  transitions: FunnelStepTransition[];
  isActive?: boolean;
}

export interface FunnelChapter extends FunnelStepCommon {
  steps: Array<FunnelStep>;
}

export interface FunnelStepLandingPage extends FunnelStepCommon {
  type: FunnelStepType.LandingPage;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepLoading extends FunnelStepCommon {
  type: FunnelStepType.Loading;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepFact extends FunnelStepCommon {
  type: FunnelStepType.Fact;
  parameters: FunnelStepParameters<{
    headline: string;
    cta?: string;
    reverse?: boolean;
    explainer: string;
    align: StepHeadlineAlign;
    visualUrl?: string;
  }>;
  onTransition: FunnelStepTransitionCallback;
}

export enum FunnelStepQuizQuestionType {
  Radio = 'singleChoice',
  Checkbox = 'multipleChoice',
  Rating = 'rating',
}

export type FunnelStepQuizQuestion = {
  text: string;
  placeholder?: string;
  options: Array<{
    label: string;
    value?: string;
    image?: ComponentProps<'img'>;
  }>;
  imageUrl?: string;
} & (
  | ({
      type:
        | FunnelStepQuizQuestionType.Checkbox
        | FunnelStepQuizQuestionType.Radio;
    } & Pick<FormInputCheckboxGroupProps, 'variant' | 'cols'>)
  | { type: FunnelStepQuizQuestionType.Rating }
);

export interface FunnelStepQuiz extends FunnelStepCommon {
  type: FunnelStepType.Quiz;
  onTransition: FunnelStepTransitionCallback<Record<string, string | string[]>>;
  parameters: FunnelStepParameters<{
    question: FunnelStepQuizQuestion;
    explainer?: string;
  }>;
}

export interface FunnelStepSignup extends FunnelStepCommon {
  type: FunnelStepType.Signup;
  onTransition: FunnelStepTransitionCallback;
  parameters: FunnelStepParameters<{
    headline: string;
    image: string;
    imageMobile: string;
  }>;
}

export interface FunnelStepPricing extends FunnelStepCommon {
  type: FunnelStepType.Pricing;
  parameters: FunnelStepParameters<{
    headline: string;
    cta: string;
    discount: {
      message: string;
      duration: number;
    };
    defaultPlan: string;
    plans: {
      priceId: string;
      label: string;
      variation?: PricingPlanVariation;
      badge: {
        text: string;
        background: string;
      };
    }[];
    perks: string[];
    featuresList: Omit<BoxListProps, 'className'>;
    review: Omit<ImageReviewProps, 'className'>;
    refund: {
      title: string;
      content: string;
      image: string;
    };
    faq: BoxFaqProps['items'];
  }>;
  onTransition: FunnelStepTransitionCallback<{
    plan: string;
    applyDiscount: boolean;
  }>;
  discountStartDate: Date;
  paddle?: Paddle;
}

export interface FunnelStepCheckout extends FunnelStepCommon {
  type: FunnelStepType.Checkout;
  priceId: string;
  discountCode?: string;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepTagSelection extends FunnelStepCommon {
  type: FunnelStepType.TagSelection;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepReadingReminder extends FunnelStepCommon {
  type: FunnelStepType.ReadingReminder;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepAppPromotion extends FunnelStepCommon {
  type: FunnelStepType.AppPromotion;
  onTransition: FunnelStepTransitionCallback;
}

export interface FunnelStepSocialProof extends FunnelStepCommon {
  type: FunnelStepType.SocialProof;
  parameters: FunnelStepParameters<{
    imageUrl: string;
    rating: string;
    reviews: Review[];
    reviewSubtitle: string;
  }>;
  onTransition: FunnelStepTransitionCallback;
}

export type FunnelStep =
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

export type FunnelPosition = {
  chapter: number;
  step: number;
};

export interface FunnelJSON {
  id: string;
  version: number;
  parameters: FunnelStepParameters;
  entryPoint: FunnelStep['id'];
  chapters: Array<FunnelChapter>;
}

export const stepsWithHeader: Array<FunnelStepType> = [FunnelStepType.Quiz];
