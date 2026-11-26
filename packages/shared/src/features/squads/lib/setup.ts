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
export const skillRef = (name: string): string =>
  `the ${name} skill (if you don't have it, read and follow ${SKILLS_URL}/${name}/SKILL.md)`;

/**
 * The prompt for the founder's first agent session over the daily.dev MCP
 * server: the page, their profile, a content strategy, a first post, a boost paid with the boost
 * credits in the wallet and a daily routine that brings them back. It lists only what the API
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
      title: 'Content strategy',
      steps: [
        `Plan what our page publishes with ${skillRef(
          'daily-dev-content-strategy',
        )}: interview me about our readers and what our team knows, then save the strategy I agree to.`,
      ],
    },
    {
      title: 'First post',
      steps: [
        "Read our weekly intel. If it isn't ready yet, wait and check again for a few minutes.",
        `List what we already published: blog posts, release notes, changelog entries, videos, talks, docs pages, launch posts. Recommend the one that fits our strategy and the intel best, using any engagement you can see (views, comments, stars, earlier daily.dev posts). Say which intel numbers back it and give two runners-up. If nothing fits, suggest a new post with ${skillRef(
          'daily-dev-content-ideas',
        )}.`,
        `I write the post myself, so don't write it or a draft of it. When I've written it, review it with ${skillRef(
          'daily-dev-content-review',
        )} and show me what it found, then publish it to @${handle} as me when I say so.`,
      ],
    },
    {
      title: 'Boost',
      steps: [
        "Check our page wallet and the estimated reach of boosting the post. Recommend 7 days at the daily budget closest to a third of the wallet, and show the cost in boost credits as dollars (100 Cores = $1), the reach and what stays in the wallet. Start the boost from the page wallet when I say yes. If the wallet can't cover a boost, tell me and skip this.",
      ],
    },
    {
      title: 'Daily routine',
      steps: [
        `Set up ${skillRef(
          'daily-dev-growth-routine',
        )}: use the cadence and review from our content strategy, then schedule its daily report on our page, posts and boosts, with a reminder when the next post is due.`,
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
    `Set up ${name}'s company page on daily.dev (@${handle}, ${squadPlanDetails[plan].title} plan), polish my profile, plan our content, get our first post out and boosted, and set up our daily routine. Use the daily.dev MCP tools if you have them, otherwise my daily.dev API token (\`DAILY_DEV_TOKEN\`). If you have neither, stop and tell me to add ${DAILY_MCP_URL}.`,
    ...body,
    '',
    'Before each change, show me exactly what you will save and wait for my OK. Finish with links to our page, my profile and the boosted post, and a short list of anything left.',
  ].join('\n');
};

const connectLine = (handle: string): string =>
  `This is for our daily.dev company page @${handle}. Use the daily.dev MCP tools if you have them, otherwise my daily.dev API token (\`DAILY_DEV_TOKEN\`). If you have neither, stop and tell me to add ${DAILY_MCP_URL}.`;

/** What a founder can ask their agent, one skill at a time. */
export const getStartupsSkillPrompt = (
  skill: 'strategy' | 'ideas' | 'review' | 'routine',
  handle: string,
): string => {
  const ask: Record<typeof skill, string> = {
    strategy: `Plan what @${handle} publishes with ${skillRef(
      'daily-dev-content-strategy',
    )}: interview me about our readers and what our team knows, then save the strategy I agree to.`,
    ideas: `Suggest three posts for @${handle} with ${skillRef(
      'daily-dev-content-ideas',
    )}. Start from what I shipped or wrote recently, and say which numbers in our weekly intel back each one. I write the posts myself, so don't write them or a draft.`,
    review: `I'm about to publish a post on @${handle}. Ask me to paste it, then review it with ${skillRef(
      'daily-dev-content-review',
    )} and show me what it found. Don't rewrite it for me.`,
    routine: `Set up ${skillRef(
      'daily-dev-growth-routine',
    )} for @${handle}: ask me how often we want to publish, then schedule its daily report on our page, posts and boosts, with a reminder when the next post is due.`,
  };

  return [connectLine(handle), '', ask[skill]].join('\n');
};

/**
 * One prompt for the first post: the agent reads the intel, then asks which
 * content skill the founder wants. It never writes the post.
 */
export const getStartupsContentPrompt = (handle: string): string =>
  [
    connectLine(handle),
    '',
    `Help me get our first post out on @${handle}. Read our latest weekly intel first, then ask me which of these I want:`,
    `1. Plan what we publish with ${skillRef(
      'daily-dev-content-strategy',
    )}: interview me about our readers and what our team knows, then save the strategy I agree to.`,
    `2. Ideas for a post with ${skillRef(
      'daily-dev-content-ideas',
    )}: start from what I shipped or wrote recently, suggest three posts and say which numbers in the intel back each one.`,
    `3. A review of a post I wrote with ${skillRef(
      'daily-dev-content-review',
    )}: ask me to paste it and show me what limits its reach.`,
    '',
    "I write the posts myself, so don't write a post or a draft for me. Before you save anything, show me what you will save and wait for my OK.",
  ].join('\n');
