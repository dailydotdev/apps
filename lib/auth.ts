export interface CodeChallenge {
  challenge: string;
  verifier: string;
}

export const generateChallenge = async (): Promise<CodeChallenge> => {
  const array = new Uint32Array(32);
  window.crypto.getRandomValues(array);
  const verifier = Array.from(array, (dec) =>
    ('0' + dec.toString(16)).substr(-2),
  ).join('');

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashed = await window.crypto.subtle.digest('SHA-256', data);
  const challenge = btoa(
    String.fromCharCode(...Array.from(new Uint8Array(hashed))),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return { verifier, challenge };
};
