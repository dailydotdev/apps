import {
  AuthenticationType,
  AuthPostParams,
  InitializationData,
  InitializationNode,
  KratosFormParams,
  KratosMessage,
  KratosMethod,
} from './kratos';

export interface LoginPasswordParameters extends AuthPostParams {
  password: string;
  identifier: string;
  method: AuthenticationType;
}
export interface AccountRecoveryParameters extends AuthPostParams {
  email: string;
  method: KratosMethod;
}

export type VerificationParams = KratosFormParams<AccountRecoveryParameters>;

export interface RegistrationParameters {
  csrf_token: string;
  provider?: string;
  method: AuthenticationType | KratosMethod;
  password?: string;
  referral?: string;
  'traits.email': string;
  'traits.name'?: string;
  'traits.username': string;
  'traits.image': string;
}

export type ValidateRecoveryParams =
  KratosFormParams<AccountRecoveryParameters>;

export interface SettingsParameters {
  csrf_token: string;
  link?: string;
  unlink?: string;
}

export type ErrorMessages<T extends string | number> = { [key in T]?: string };
export type RegistrationError = ErrorMessages<keyof RegistrationParameters>;
export type ValidateRegistrationParams =
  KratosFormParams<RegistrationParameters>;
export type ValidateLoginParams = KratosFormParams<LoginPasswordParameters>;
export type SettingsParams = KratosFormParams<SettingsParameters>;

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

export const getErrorMessage = (errors: KratosMessage[]): string =>
  errors?.[0]?.text || '';

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
