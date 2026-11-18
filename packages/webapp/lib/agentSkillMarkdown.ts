import type { NextApiRequest, NextApiResponse } from 'next';

// The `.claude-plugin/plugins/...` paths hold the plugin's MCP-only copies,
// so these routes serve the skills from the repo root.
const SKILLS_URL =
  'https://raw.githubusercontent.com/dailydotdev/daily/master/skills';
const FETCH_TIMEOUT_MS = 5_000;
const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n+/;

// An agent that reads one of these URLs has no daily.dev skills installed, so
// it needs to know where the ones the skill refers to live.
const getPreamble = (
  purpose: string,
): string => `> These are the instructions for ${purpose} from an agent.
> Where they refer to the daily.dev skill, read https://api.daily.dev/public/v1/skill.md.
> The other skills are at https://github.com/dailydotdev/daily/tree/master/skills.

`;

export const createAgentSkillMarkdownHandler =
  ({ skill, purpose }: { skill: string; purpose: string }) =>
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'GET') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const response = await fetch(`${SKILLS_URL}/${skill}/SKILL.md`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Skill responded with ${response.status}`);
      }

      const body = (await response.text()).replace(FRONTMATTER_REGEX, '');

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=600, stale-while-revalidate=86400',
      );
      res.status(200).send(`${getPreamble(purpose)}${body}`);
    } catch {
      res.status(502).send(`Failed to load the instructions for ${purpose}`);
    }
  };
