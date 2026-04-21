import type { Origin } from './log';
import { promisifyEventListener } from './func';
import {
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from './ios';

export enum AuthEvent {
  Login = 'login',
  Error = 'error',
  SocialRegistration = 'social_registration',
}

export enum AuthEventNames {
  OpenSignup = 'open signup',
  OpenLogin = 'open login',
  CloseSignUp = 'close signup',
  SignUpProvider = 'signup provider',
  LoginProvider = 'login provider',
  StartSignUpForm = 'start signup form',
  SubmitSignUpForm = 'submit signup form',
  SubmitSignUpFormError = 'submit signup form error',
  SubmitSignupFormExtra = 'submit signup form extra',
  SignupSuccessfully = 'signup successfully',
  LoginSuccessfully = 'login successfully',
  LoginError = 'login error',
  ForgotPassword = 'forgot password',
  SubmitForgotPassword = 'submit forgot password',
  RegistrationError = 'registration error',
  RegistrationInitializationError = 'registration initialization error',
  VerifiedSuccessfully = 'verified successfully',
  TurnstileLoadError = 'turnstile load error',
}

export enum AuthTriggers {
  Author = 'author',
  Bookmark = 'bookmark',
  Comment = 'comment',
  CommentUpvote = 'comment upvote',
  DevCard = 'devcard',
  Filter = 'filter',
  Upvote = 'upvote',
  Settings = 'settings',
  Verification = 'verification',
  VerifySession = 'verify session',
  ReportPost = 'report post',
  HidePost = 'hide post',
  MainButton = 'main button',
  Onboarding = 'onboarding',
  SubmitNewSource = 'submit new source',
  Downvote = 'downvote',
  JoinSquad = 'join squad',
  CreateSquad = 'create squad',
  ReportComment = 'report comment',
  SearchReferral = 'search referral',
  CreateFeedFilters = 'create feed filters',
  AccountPage = 'account page',
  NewComment = 'new comment',
  SearchInput = 'search input',
  SearchSuggestion = 'search suggestion',
  LoginPage = 'login page',
  GenericReferral = 'generic referral',
  Roast = 'roast',
  CollectionSubscribe = 'collection subscribe',
  SourceSubscribe = 'source subscribe',
  CommentDownvote = 'comment downvote',
  WelcomePage = 'welcome page',
  FromNotification = 'from notification',
  Follow = 'follow',
  Plus = 'plus',
  GiveAward = 'give award',
  Organization = 'organization',
  Opportunity = 'opportunity',
  RecruiterSelfServe = 'recruiter self serve',
  AiFluencyQuiz = 'ai fluency quiz',
  Gear = 'gear',
  PostPage = 'post page',
}

export type AuthTriggersType =
  | AuthTriggers
  | Extract<
      Origin,
      | Origin.TagsFilter
      | Origin.TagsSearch
      | Origin.BlockedFilter
      | Origin.PostContextMenu
      | Origin.SourcePage
      | Origin.TagPage
    >;

export interface LoginPasswordParameters {
  identifier: string;
  password: string;
  method?: 'password';
  csrf_token?: string;
}

export interface RegistrationParameters {
  csrf_token?: string;
  provider?: string;
  method?: 'password' | 'oidc';
  password?: string;
  'traits.email'?: string;
  'traits.userId'?: string;
  'traits.referral'?: string;
  'traits.referralOrigin'?: string;
  'traits.timezone'?: string;
  'traits.name'?: string;
  'traits.username'?: string;
  'traits.image'?: string;
  'traits.acceptedMarketing'?: boolean;
  'traits.experienceLevel'?: string;
  'traits.language'?: string;
  optOutMarketing?: boolean;
  id_token?: string;
  id_token_nonce?: string;
  'traits.region'?: string;
}

export type ErrorMessages<T extends string | number> = { [key in T]?: string };
export type RegistrationError = ErrorMessages<keyof RegistrationParameters>;

export interface SocialRegistrationParameters {
  name?: string;
  username?: string;
  file?: string;
  acceptedMarketing?: boolean;
  optOutMarketing?: boolean;
  experienceLevel?: string;
  language?: string;
}

export const isNativeAuthSupported = (provider: string): boolean =>
  messageHandlerExists(WebKitMessageHandlers.NativeAuth) &&
  ['apple', 'google'].includes(provider);

export type NativeAuthResponse = {
  provider: string;
  token: string;
  nonce: string;
  name?: string;
};

export const iosNativeAuth = async (
  provider: string,
): Promise<NativeAuthResponse | undefined> => {
  const promise = promisifyEventListener<
    NativeAuthResponse | undefined,
    NativeAuthResponse | undefined
  >('native-auth', (event) => event.detail);
  postWebKitMessage(WebKitMessageHandlers.NativeAuth, provider);
  return promise;
};
