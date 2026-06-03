import type { GQLPersona } from '@dailydotdev/shared/src/graphql/feedSettings';
import { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';

interface BuildSwipePromptArgs {
  personas?: GQLPersona[];
  experienceLevel?: keyof typeof UserExperienceLevel | null;
}

const dedupe = (values: string[]): string[] => Array.from(new Set(values));

const normalizeRoleLabel = (role: string): string =>
  role.toLowerCase().replace(/\s+engineer$/, '');

export function buildSwipePrompt({
  personas,
  experienceLevel,
}: BuildSwipePromptArgs): string {
  if (!personas?.length) {
    return '';
  }

  const roleClause =
    personas.length === 1
      ? `I'm a ${normalizeRoleLabel(personas[0].title)} engineer`
      : `I work across ${personas
          .map((p) => p.title.toLowerCase())
          .join(' and ')}`;

  const experienceLabel =
    experienceLevel && UserExperienceLevel[experienceLevel];
  const experienceClause = experienceLabel ? ` (${experienceLabel})` : '';

  const tags = dedupe(personas.flatMap((p) => p.tags));
  const interestsClause = tags.length
    ? ` I'm interested in: ${tags.join(', ')}.`
    : '';

  return `${roleClause}${experienceClause}.${interestsClause}`.trim();
}
