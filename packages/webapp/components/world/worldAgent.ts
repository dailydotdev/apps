import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

export const getWorldAgentGuideUrl = (
  configuredOrigin: string,
  currentOrigin?: string,
): string => {
  const origin = currentOrigin
    ? new URL(configuredOrigin, currentOrigin).toString()
    : configuredOrigin;
  const normalizedOrigin = origin.endsWith('/') ? origin : `${origin}/`;

  return `${normalizedOrigin}app/world-agent.md`;
};

export const promptForWorldAgent = ({
  handle,
  currentOrigin,
}: {
  handle: string;
  currentOrigin?: string;
}): string => {
  const guideUrl = getWorldAgentGuideUrl(webappUrl, currentOrigin);

  return [
    'Help me program my daily.dev world using this local coding agent.',
    '',
    `Read and follow ${guideUrl}`,
    '',
    `My daily.dev handle is ${handle}.`,
    '',
    'Create one reusable object set per realm. The same work must customize its',
    'districts and its zoomed-out world island; do not author the two views separately.',
    'Districts differ through the palette and through the recorded variants, so make',
    'them differ that way rather than by writing one shape everywhere.',
    '',
    'Ask me where to start and what it should look like in one go, then build.',
    'Set everything up and operate the tooling yourself. Do not ask me to install',
    'packages, run commands, choose files, or configure the preview. I only want',
    'to discuss what we should create, watch it change, and decide when to save.',
  ].join('\n');
};
