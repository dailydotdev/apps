import {
  AuthenticationType,
  AuthPostParams,
  InitializationData,
  InitializationNode,
  KratosFormParams,
  KratosMessage,
  KratosMethod,
  MessageType,
} from './kratos';
import { Origin } from './log';

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
  LegacyLogout = 'legacy_logout',
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

export interface LoginPasswordParameters extends AuthPostParams {
  password: string;
  identifier: string;
  method: AuthenticationType;
}

export interface LoginSocialParameters extends AuthPostParams {
  provider: string;
  method: AuthenticationType;
}

export interface AccountRecoveryParameters extends AuthPostParams {
  email: string;
  method: KratosMethod;
}

export interface ResetPasswordParameters extends AuthPostParams {
  password: string;
  method: KratosMethod;
}

export type VerificationParams = KratosFormParams<AccountRecoveryParameters>;

export interface SocialRegistrationParameters {
  name?: string;
  username?: string;
  twitter?: string;
  file?: string;
  acceptedMarketing?: boolean;
  optOutMarketing?: boolean;
  experienceLevel?: string;
}

export interface RegistrationParameters {
  csrf_token: string;
  provider?: string;
  method: AuthenticationType | KratosMethod;
  password?: string;
  'traits.email': string;
  'traits.userId'?: string;
  'traits.referral'?: string;
  'traits.referralOrigin'?: string;
  'traits.timezone'?: string;
  'traits.twitter'?: string;
  'traits.name'?: string;
  'traits.username': string;
  'traits.image': string;
  'traits.acceptedMarketing'?: boolean;
  'traits.experienceLevel'?: string;
  optOutMarketing?: boolean;
}

export interface SettingsParameters extends AuthPostParams {
  link?: string;
  unlink?: string;
}

interface VerifyEmailParameters extends AuthPostParams {
  code: string;
  method: string;
}

export type ErrorMessages<T extends string | number> = { [key in T]?: string };
export type RegistrationError = ErrorMessages<keyof RegistrationParameters>;
export type ValidateRegistrationParams =
  KratosFormParams<RegistrationParameters>;
export type ValidateLoginParams = KratosFormParams<
  LoginPasswordParameters | LoginSocialParameters
>;
export type SettingsParams = KratosFormParams<SettingsParameters>;
export type ValidateResetPassword = KratosFormParams<ResetPasswordParameters>;
export type ValidateChangeEmail = KratosFormParams<RegistrationParameters>;
export type VerifyEmail = KratosFormParams<VerifyEmailParameters>;

export const errorsToJson = <T extends string>(
  data: InitializationData,
): Record<T, string> =>
  Object.values(data.ui.nodes).reduce(
    (result, node) => ({
      ...result,
      [node.attributes.name]: node.messages[0]?.text ?? '',
    }),
    {} as Record<T, string>,
  );

export const getErrorMessage = (errors: KratosMessage[]): string => {
  if (!errors?.length) {
    return '';
  }

  const error = errors.find(({ type }) => type === MessageType.Error);

  return error?.text || errors?.[0]?.text || '';
};

export const getNodeByKey = (
  key: string,
  nodes: InitializationNode[],
): InitializationNode =>
  nodes?.find(({ attributes }) => attributes.name === key);

export const getNodeValue = (
  key: string,
  nodes: InitializationNode[],
): string =>
  nodes?.find(({ attributes }) => attributes.name === key)?.attributes?.value;
