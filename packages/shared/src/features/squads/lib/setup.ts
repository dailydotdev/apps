import { SQUAD_LINKS_MAX } from './limits';
import {
  SQUAD_PLAN_INTEL_TOPICS,
  SQUAD_PLAN_SEATS,
  SquadPlan,
  squadPlanDetails,
} from './plans';

// What a buyer sets up after paying for daily.dev for Startups, by hand in
// Manage or through their agent over the daily.dev MCP server.

export const DAILY_MCP_URL = 'https://api.daily.dev/mcp';

export enum AgentClient {
  ClaudeCode = 'claude code',
  Cursor = 'cursor',
  Codex = 'codex',
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
    snippet: `claude mcp add --transport http daily-dev ${DAILY_MCP_URL}`,
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
  [AgentClient.Other]: {
    label: 'Other',
    snippet: DAILY_MCP_URL,
    note: 'Add it as a remote MCP server (streamable HTTP). Clients with OAuth sign in to daily.dev; others send an API token from Settings › API as a Bearer header.',
  },
};

export const agentClients = Object.values(AgentClient);

const SKILLS_URL = 'https://github.com/dailydotdev/daily/blob/master/skills';

/** Points the agent at a daily.dev skill, with its file for clients without the plugin. */
const skillRef = (name: string): string =>
  `the ${name} skill (if you don't have it, read and follow ${SKILLS_URL}/${name}/SKILL.md)`;

/**
 * The prompt for the founder's first agent session over the daily.dev MCP
 * server: the page, their profile, a first post, a boost from the cashback
 * wallet and a daily routine that brings them back. It lists only what the API
 * can do.
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
  const sections: { title: string; steps: string[] }[] = [
    {
      title: 'Weekly intel',
      steps: [
        `Find @${handle} in my squads and check its features and my role.`,
        "Learn what we build from this project (README, docs, package metadata, our website). Ask me for anything you can't find.",
        `Pick up to ${SQUAD_PLAN_INTEL_TOPICS[plan]} existing daily.dev tags that match what we build and save them as the weekly intel topics.${
          plan === SquadPlan.Team
            ? ' Ask me which developer seniority the intel should count (junior, mid-level, senior), or leave it for every level.'
            : ''
        } Our first intel builds in a minute or two; we use it for the first post.`,
      ],
    },
    {
      title: 'Company page',
      steps: [
        'Write the page description: one or two sentences on what we build and for which developers.',
        'Set our logo and a cover image (boosting the page needs one). Use images from our site or ones I give you. If there is no good wide image, make a cover with our logo, name and one line on what we do, show it to me, and upload it.',
        `Set our website and up to ${SQUAD_LINKS_MAX} links developers look for: docs, GitHub, changelog, community.`,
        'Add our product with its name, tagline, URL and pricing.',
        ...(plan === SquadPlan.Team
          ? [
              'Add the header CTA: a short label and the URL developers should land on, such as sign up or docs.',
              `List the admins and moderators and ask me who gets the ${
                SQUAD_PLAN_SEATS[plan] - 1
              } remaining seats. For a teammate who isn't on the page yet, give me the invite link to send them.`,
            ]
          : []),
      ],
    },
    {
      title: 'My profile',
      steps: [
        `My name and photo sit on every post, so improve my daily.dev profile with ${skillRef(
          'daily-dev-profile',
        )}.`,
      ],
    },
    {
      title: 'First post',
      steps: [
        "Read our weekly intel. If it isn't ready yet, wait and check again for a few minutes.",
        `List what we already published: blog posts, release notes, changelog entries, videos, talks, docs pages, launch posts. Recommend the one that fits the intel best, using any engagement you can see (views, comments, stars, earlier daily.dev posts). Say which intel numbers back it and give two runners-up. If nothing fits, suggest a new post with ${skillRef(
          'daily-dev-content-ideas',
        )}.`,
        `Draft the post as a link with one or two lines of commentary in my voice, or as a written post when there is nothing to link. Publish it to @${handle} as me.`,
      ],
    },
    {
      title: 'Boost',
      steps: [
        "Check our page wallet and the estimated reach of boosting the post. Recommend 7 days at the daily budget closest to a third of the wallet, and show the cost in Cores, the reach and what stays in the wallet. Start the boost from the page wallet when I say yes. If the wallet can't cover a boost, tell me and skip this.",
      ],
    },
    {
      title: 'Daily routine',
      steps: [
        `Set up ${skillRef(
          'daily-dev-growth-routine',
        )}: ask me how often we want to publish, then schedule its daily report on our page, posts and boosts, with a reminder when the next post is due.`,
      ],
    },
  ];

  let step = 0;
  const body = sections.flatMap(({ title, steps }) => [
    '',
    title,
    ...steps.map((text) => {
      step += 1;
      return `${step}. ${text}`;
    }),
  ]);

  return [
    `Set up ${name}'s company page on daily.dev (@${handle}, ${squadPlanDetails[plan].title} plan), polish my profile, get our first post out and boosted, and set up our daily routine, with the daily.dev MCP server. If its tools aren't connected, stop and tell me to add ${DAILY_MCP_URL}.`,
    ...body,
    '',
    'Before each change, show me exactly what you will save and wait for my OK. Finish with links to our page, my profile and the boosted post, and a short list of anything left.',
  ].join('\n');
};

/** What an agent can do with the weekly intel, over the same MCP server. */
export const getIntelPrompt = (handle: string): string =>
  [
    `Read the latest weekly intel for @${handle} with the daily.dev MCP server. If its tools aren't connected, stop and tell me to add ${DAILY_MCP_URL}.`,
    '',
    'Then look at what I shipped or wrote recently and suggest three posts for our daily.dev page. For each, give the angle, format, title, length and the best day and hour to publish, and say which numbers in the intel back it.',
  ].join('\n');

export const getIntelApiUrl = (handle: string): string =>
  `https://api.daily.dev/public/v1/squads/${handle}/intel`;
