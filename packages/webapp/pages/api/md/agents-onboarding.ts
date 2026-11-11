import type { NextApiRequest, NextApiResponse } from 'next';

// The `.claude-plugin/plugins/...` path is a symlink, and
// raw.githubusercontent.com does not resolve symlinks.
const SKILL_URL =
  'https://raw.githubusercontent.com/dailydotdev/daily/master/skills/daily-dev-onboarding/SKILL.md';
const FETCH_TIMEOUT_MS = 5_000;
const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n+/;

// An agent that reads this URL has no daily.dev skills installed, so it needs
// to know where the ones this skill refers to live.
const PREAMBLE = `> These are the instructions for setting up a daily.dev account from an agent.
> Where they refer to the daily.dev skill, read https://api.daily.dev/public/v1/skill.md.
> The other skills are at https://github.com/dailydotdev/daily/tree/master/skills.

`;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const response = await fetch(SKILL_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Skill responded with ${response.status}`);
    }

    const skill = (await response.text()).replace(FRONTMATTER_REGEX, '');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=86400',
    );
    res.status(200).send(`${PREAMBLE}${skill}`);
  } catch {
    res.status(502).send('Failed to load the onboarding instructions');
  }
};

export default handler;
