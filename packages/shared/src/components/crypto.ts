import { isDevelopment } from '../lib/constants';

const base64ToBuf = (b: string) =>
  Uint8Array.from(atob(b), (c) => c.charCodeAt(0));

export const decrypt = async (
  input: string,
  key: string,
  algorithmName = 'AES-CBC',
  algorithmLength = 256,
  subtle = globalThis.crypto.subtle,
): Promise<string> => {
  if (!subtle || isDevelopment) {
    return input;
  }
  const keyObject = await subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: algorithmName, length: algorithmLength },
    true,
    ['encrypt', 'decrypt'],
  );
  const [iv, cipherText] = input.split(':');
  const plainTextBuffer = await subtle.decrypt(
    { name: algorithmName, iv: base64ToBuf(iv) },
    keyObject,
    base64ToBuf(cipherText),
  );

  return new TextDecoder().decode(plainTextBuffer);
};
