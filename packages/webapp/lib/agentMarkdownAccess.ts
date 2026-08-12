// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- GrowthBook 0.26 does not expose its declarations for bundler resolution.
import { GrowthBook } from '@growthbook/growthbook';

const MARKDOWN_TOKEN_PREFIX = 'ddm_';
const MARKDOWN_TOKEN_AUDIENCE = 'dailydev-markdown';
const MARKDOWN_TOKEN_ISSUER = 'https://api.daily.dev';
const MARKDOWN_TOKEN_SCOPE = 'markdown:read';
const SIGNUP_WALL_FEATURE = 'agent_markdown_signup_wall';
const MARKDOWN_AUTH_PREFIX = `Bearer ${MARKDOWN_TOKEN_PREFIX}`;

export const AGENT_SIGNUP_URL = 'https://api.daily.dev/agents/v1/signup';

const decodeBase64Url = (value: string): ArrayBuffer => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const decoded = atob(padded);
  const buffer = new ArrayBuffer(decoded.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return buffer;
};

const decodeJwtPart = <T>(value: string): T =>
  JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;

type MarkdownTokenPayload = {
  aud?: unknown;
  exp?: unknown;
  iss?: unknown;
  scope?: unknown;
};

export const hasValidAgentMarkdownToken = async (
  authorization: string | null,
): Promise<boolean> => {
  const secret = process.env.AGENT_ACCESS_TOKEN_SECRET;
  if (!authorization?.startsWith(MARKDOWN_AUTH_PREFIX) || !secret) {
    return false;
  }

  try {
    const token = authorization.slice(MARKDOWN_AUTH_PREFIX.length);
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => !part)) {
      return false;
    }
    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const header = decodeJwtPart<{ alg?: unknown }>(encodedHeader);
    if (header.alg !== 'HS256') {
      return false;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['verify'],
    );
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    if (!verified) {
      return false;
    }

    const payload = decodeJwtPart<MarkdownTokenPayload>(encodedPayload);
    const now = Math.floor(Date.now() / 1000);
    return (
      payload.aud === MARKDOWN_TOKEN_AUDIENCE &&
      payload.iss === MARKDOWN_TOKEN_ISSUER &&
      payload.scope === MARKDOWN_TOKEN_SCOPE &&
      typeof payload.exp === 'number' &&
      payload.exp > now
    );
  } catch {
    return false;
  }
};

type AgentSignupWallEvaluation = {
  allocation?: { experimentId: string; variationId: string };
  enabled: boolean;
};

export const evaluateAgentSignupWall = async (
  deviceId: string,
): Promise<AgentSignupWallEvaluation> => {
  const clientKey = process.env.GROWTHBOOK_CLIENT_KEY;
  if (!clientKey) {
    return { enabled: false };
  }

  let allocation: AgentSignupWallEvaluation['allocation'];
  const growthbook = new GrowthBook({
    apiHost: 'https://cdn.growthbook.io',
    clientKey,
    attributes: {
      deviceId,
      loggedIn: false,
      platform: 'web',
      userId: deviceId,
    },
    trackingCallback: (
      experiment: { key: string },
      result: { variationId: number },
    ) => {
      allocation = {
        experimentId: experiment.key,
        variationId: result.variationId.toString(),
      };
    },
  });

  try {
    await growthbook.loadFeatures({ timeout: 1000 });
    const enabled = growthbook.getFeatureValue(SIGNUP_WALL_FEATURE, false);
    return { allocation, enabled };
  } catch {
    return { enabled: false };
  } finally {
    growthbook.destroy();
  }
};

export const trackAgentSignupWallAllocation = async (
  deviceId: string,
  allocation: NonNullable<AgentSignupWallEvaluation['allocation']>,
): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return;
  }

  try {
    await fetch(`${apiUrl}/e/x`, {
      method: 'POST',
      body: JSON.stringify({
        device_id: deviceId,
        event_timestamp: new Date(),
        experiment_id: allocation.experimentId,
        variation_id: allocation.variationId,
      }),
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    // Allocation tracking must never affect the response.
  }
};

export const getAgentSignupRequiredBody =
  (): string => `# Agent registration required

Register for markdown access with one API call:

\`\`\`http
POST ${AGENT_SIGNUP_URL}
Content-Type: application/json

{}
\`\`\`

Your access is temporary. Retry this URL with \`Authorization: Bearer <token>\`, then immediately send the returned \`signupUrl\` to your human and ask them to claim the account.
`;
