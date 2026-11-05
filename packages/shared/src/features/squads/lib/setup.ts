import { SQUAD_LINKS_MAX } from './limits';
import { SQUAD_PLAN_SEATS, SquadPlan, squadPlanDetails } from './plans';

// What a buyer sets up after paying for daily.dev for Startups, by hand in
// Manage or through their agent over the daily.dev MCP server.

export const DAILY_MCP_URL = 'https://api.daily.dev/mcp';

export enum AgentClient {
  ClaudeCode = 'claude code',
  Cursor = 'cursor',
  Codex = 'codex',
  VSCode = 'vs code',
  Other = 'other',
}

export interface AgentClientSetup {
  label: string;
  /** A command or config to copy. */
  snippet: string;
  /** A one-click install, where the client has one. */
  installUrl?: string;
  note: string;
}

// From docs.daily.dev/mcp-server/; change both together.
export const agentClientSetup: Record<AgentClient, AgentClientSetup> = {
  [AgentClient.ClaudeCode]: {
    label: 'Claude Code',
    snippet: `claude mcp add --transport http daily.dev ${DAILY_MCP_URL}`,
    note: 'Then run /mcp in Claude Code to sign in to daily.dev.',
  },
  [AgentClient.Cursor]: {
    label: 'Cursor',
    snippet: JSON.stringify(
      { mcpServers: { 'daily.dev': { url: DAILY_MCP_URL } } },
      null,
      2,
    ),
    installUrl: `https://cursor.com/en/install-mcp?name=daily.dev&config=${encodeURIComponent(
      btoa(JSON.stringify({ url: DAILY_MCP_URL })),
    )}`,
    note: 'Or add this to ~/.cursor/mcp.json. Cursor asks you to sign in to daily.dev.',
  },
  [AgentClient.Codex]: {
    label: 'Codex',
    snippet: `codex mcp add daily-dev --url ${DAILY_MCP_URL}`,
    note: 'Codex opens the daily.dev sign-in. Update Codex if it says dynamic client registration is not supported.',
  },
  [AgentClient.VSCode]: {
    label: 'VS Code',
    snippet: `code --add-mcp '${JSON.stringify({
      name: 'daily.dev',
      type: 'http',
      url: DAILY_MCP_URL,
    })}'`,
    note: 'VS Code asks you to sign in to daily.dev the first time it connects.',
  },
  [AgentClient.Other]: {
    label: 'Other',
    snippet: DAILY_MCP_URL,
    note: 'Add it as a remote MCP server (streamable HTTP). Clients with OAuth sign in to daily.dev; others send an API token from Settings › API as a Bearer header.',
  },
};

export const agentClients = Object.values(AgentClient);

/**
 * The prompt that has an agent set up the page through the daily.dev MCP
 * server. It lists only what the API can do: the weekly brief stays in the
 * app.
 */
export const getStartupsSetupPrompt = ({
  name,
  handle,
  plan,
}: {
  name: string;
  handle: string;
  plan: SquadPlan;
}): string => {
  const steps = [
    `Find @${handle} in my squads and check its features and my role.`,
    "Learn what we build from this project (README, docs, package metadata, our website). Ask me for anything you can't find.",
    'Write the page description: one or two sentences on what we build and for which developers.',
    'Set our logo, and a cover image if we have one, from image URLs on our site or ones I give you.',
    `Set our website and up to ${SQUAD_LINKS_MAX} links developers look for: docs, GitHub, changelog, community.`,
    'Add our product with its name, tagline, URL and pricing.',
  ];

  if (plan === SquadPlan.Team) {
    steps.push(
      'Add the header CTA: a short label and the URL developers should land on, such as sign up or docs.',
      `List the admins and moderators and ask me who gets the ${
        SQUAD_PLAN_SEATS[plan] - 1
      } remaining seats. For a teammate who isn't on the page yet, give me the invite link to send them.`,
    );
  }

  steps.push(
    'Offer to publish a first post: our latest launch, release or blog post as a link with a line of commentary.',
  );

  return [
    `Set up ${name}'s company page on daily.dev (@${handle}, ${squadPlanDetails[plan].title} plan) with the daily.dev MCP server. If its tools aren't connected, stop and tell me to add ${DAILY_MCP_URL}.`,
    '',
    ...steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    'Before each change, show me exactly what you will save and wait for my OK. Finish with a short summary of what is set and what is left.',
  ].join('\n');
};
