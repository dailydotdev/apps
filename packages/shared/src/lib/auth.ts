import {
  AuthenticationType,
  AuthPostParams,
  InitializationData,
  InitializationNode,
  KratosFormParams,
} from './kratos';

export interface LoginPasswordParameters extends AuthPostParams {
  password: string;
  identifier: string;
}

export interface AccountRecoveryParameters extends AuthPostParams {
  email: string;
}

export interface RegistrationParameters {
  csrf_token: string;
  provider?: string;
  method: AuthenticationType | KratosAuthMethod;
  password?: string;
  'traits.email': string;
  'traits.name'?: string;
  'traits.username': string;
  'traits.image': string;
}

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

export const updateSettings = async ({
  action,
  params,
}: ValidateRegistrationParams): Promise<SuccessfulRegistrationResponse> => {
  const res = await fetch(action, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': params.csrf_token,
      Accept: 'application/json',
    },
    body: JSON.stringify(params),
  });

  const json = await res.json();

  if (res.status === 200) {
    return { data: json };
  }

  if (json.redirect_browser_to) {
    return { redirect: json.redirect_browser_to };
  }

  return { error: json?.error || json };
};

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

export const getNodeByKey = (
  key: string,
  nodes: InitializationNode[],
): InitializationNode =>
  nodes.find(({ attributes }) => attributes.name === key);

export const getNodeValue = (
  key: string,
  nodes: InitializationNode[],
): string =>
  nodes.find(({ attributes }) => attributes.name === key)?.attributes?.value;
