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
  TurnstileTokenWait = 'turnstile token wait',
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
  CreatePost = 'create post',
  ReportComment = 'report comment',
  SearchReferral = 'search referral',
  CreateFeedFilters = 'create feed filters',
  AccountPage = 'account page',
  NewComment = 'new comment',
  CommentsTeaser = 'comments teaser',
  SearchInput = 'search input',
  SearchSuggestion = 'search suggestion',
  LoginPage = 'login page',
  GenericReferral = 'generic referral',
  CollectionSubscribe = 'collection subscribe',
  SourceSubscribe = 'source subscribe',
  CommentDownvote = 'comment downvote',
  FromNotification = 'from notification',
  Follow = 'follow',
  Plus = 'plus',
  GiveAward = 'give award',
  Organization = 'organization',
  OAuth = 'oauth',
  Opportunity = 'opportunity',
  RecruiterSelfServe = 'recruiter self serve',
  StartupsCheckout = 'startups checkout',
  CompanyPage = 'company page',
  AiFluencyQuiz = 'ai fluency quiz',
  AddToStack = 'add to stack',
  PostPage = 'post page',
  Hackathon = 'hackathon',
  Marketplace = 'marketplace',
  AgentOnboarding = 'agent onboarding',
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

// Flows that sign a social account up without the profile form and go
// straight back to what the visitor came for
export const autoProfileTriggers: AuthTriggersType[] = [
  AuthTriggers.RecruiterSelfServe,
  AuthTriggers.StartupsCheckout,
  AuthTriggers.CompanyPage,
  AuthTriggers.AgentOnboarding,
];

// Founders signing up to create a company page, through the checkout or the
// free company page form
export const isStartupsAuthTrigger = (trigger?: AuthTriggersType): boolean =>
  trigger === AuthTriggers.StartupsCheckout ||
  trigger === AuthTriggers.CompanyPage;

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
  'traits.company'?: string;
  'traits.title'?: string;
  'traits.cloudProvider'?: string;
  'traits.language'?: string;
  optOutMarketing?: boolean;
  id_token?: string;
  id_token_nonce?: string;
  'traits.region'?: string;
}

export type ErrorMessages<T extends string | number> = { [key in T]?: string };
export type RegistrationError = ErrorMessages<keyof RegistrationParameters>;

export interface SocialRegistrationParameters {
  email?: string;
  name?: string;
  username?: string;
  file?: string;
  acceptedMarketing?: boolean;
  optOutMarketing?: boolean;
  experienceLevel?: string;
  language?: string | null;
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

// Long enough for a password and a second factor on the native sheet.
export const IOS_NATIVE_AUTH_TIMEOUT_MS = 2 * 60 * 1000;

/** What the iOS app sends back when native sign-in does not complete. */
export type NativeAuthFailure = {
  provider: string;
  error: string;
  cancelled?: boolean;
  /** `domain:code` of the native error, e.g. `com.google.GIDSignIn:-4`. */
  code?: string;
};

type NativeAuthReply =
  | NativeAuthResponse
  | NativeAuthFailure
  | null
  | undefined;

const nativeAuthTimedOut = Symbol('native-auth-timeout');

const isNativeAuthFailure = (
  reply: NativeAuthReply,
): reply is NativeAuthFailure => !!reply && 'error' in reply && !!reply.error;

/**
 * Asks the iOS app to sign in natively and waits for its `native-auth` reply.
 * Resolves with the token, or `undefined` when there is none: the app reports
 * a cancel or failure (`onFailure` gets the reason), or nothing arrives within
 * `timeoutMs` (`onTimeout`). App builds up to 1.26 send nothing at all when
 * Google or Apple sign-in fails.
 */
export const iosNativeAuth = async (
  provider: string,
  {
    timeoutMs = IOS_NATIVE_AUTH_TIMEOUT_MS,
    onTimeout,
    onFailure,
  }: {
    timeoutMs?: number;
    onTimeout?: () => void;
    onFailure?: (failure: NativeAuthFailure) => void;
  } = {},
): Promise<NativeAuthResponse | undefined> => {
  const promise = promisifyEventListener<
    NativeAuthReply | typeof nativeAuthTimedOut,
    NativeAuthReply
  >('native-auth', (event) => event.detail, {
    timeout: { ms: timeoutMs, value: nativeAuthTimedOut },
  });
  postWebKitMessage(WebKitMessageHandlers.NativeAuth, provider);
  const res = await promise;
  if (res === nativeAuthTimedOut) {
    onTimeout?.();
    return undefined;
  }
  if (isNativeAuthFailure(res)) {
    onFailure?.(res);
    return undefined;
  }
  if (!res || !('token' in res) || !res.token) {
    return undefined;
  }
  // A sheet that outlived an earlier, timed-out request can answer this one.
  // Its token belongs to that provider, so it cannot complete this sign-in.
  if (res.provider && res.provider !== provider) {
    onFailure?.({
      provider: res.provider,
      error: `Reply for ${res.provider} while waiting for ${provider}`,
    });
    return undefined;
  }
  return res;
};
