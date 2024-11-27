const isCredentialsSupported = 'credentials' in Request.prototype;

export const withCredentials = (
  credentials: RequestInit['credentials'],
): RequestInit['credentials'] | undefined => {
  if (!isCredentialsSupported) {
    return undefined;
  }

  return credentials;
};
