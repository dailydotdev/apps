import type {
  PersonaArchetype,
  PersonaQuizQuestion,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { personaQuizSampleParameters } from './personaQuizSampleConfig';

// Structural gate over the committed persona-quiz graph. This guards the
// runtime artifact (Q1 + generated tree + selection) against drift or hand
// edits. Content (tag vocabulary, de-duplicated prompts) is enforced at
// generation time by generatePersonaQuiz.mjs.

const { questions, archetypes, selection, entryQuestionId } =
  personaQuizSampleParameters;

const byId = new Map<string, PersonaQuizQuestion>(
  questions.map((q) => [q.id, q]),
);
const isTerminal = (q: PersonaQuizQuestion) =>
  q.options.every((o) => o.next == null);
const branches = (q: PersonaQuizQuestion) =>
  q.options[0]?.next !== q.options[1]?.next;

interface PathInfo {
  terminalId: string;
  archetypeId?: string;
  length: number;
  branchPoints: number;
}

// Enumerate every root→terminal path, asserting no question concept (axis or
// prompt) repeats within a single user path along the way.
const collectPaths = (): { paths: PathInfo[]; reachable: Set<string> } => {
  const paths: PathInfo[] = [];
  const reachable = new Set<string>();
  const walk = (
    id: string,
    axes: Set<string>,
    prompts: Set<string>,
    branchPoints: number,
    length: number,
  ) => {
    const q = byId.get(id);
    if (!q) {
      throw new Error(`dangling next pointer to "${id}"`);
    }
    reachable.add(id);
    expect(axes.has(q.axis)).toBe(false);
    expect(prompts.has(q.prompt)).toBe(false);
    const nextAxes = new Set(axes).add(q.axis);
    const nextPrompts = new Set(prompts).add(q.prompt);
    const nextBranches = branchPoints + (branches(q) ? 1 : 0);
    if (isTerminal(q)) {
      paths.push({
        terminalId: q.id,
        archetypeId: q.archetypeId,
        length,
        branchPoints: nextBranches,
      });
      return;
    }
    [...new Set(q.options.map((o) => o.next))].forEach((nx) =>
      walk(nx as string, nextAxes, nextPrompts, nextBranches, length + 1),
    );
  };
  walk(entryQuestionId as string, new Set(), new Set(), 0, 1);
  return { paths, reachable };
};

describe('persona quiz graph', () => {
  const { paths, reachable } = collectPaths();
  const archetypeIds = new Set(archetypes.map((a) => a.id));

  it('has a valid entry question', () => {
    expect(entryQuestionId).toBeTruthy();
    expect(byId.has(entryQuestionId as string)).toBe(true);
  });

  it('points every `next` at an existing question', () => {
    questions.forEach((q) => {
      q.options.forEach((o) => {
        if (o.next != null) {
          expect(byId.has(o.next)).toBe(true);
        }
      });
    });
  });

  it('reaches every question from the entry (no orphans)', () => {
    questions.forEach((q) => expect(reachable.has(q.id)).toBe(true));
  });

  it('gives every terminal a known archetype', () => {
    paths.forEach((p) => {
      expect(p.archetypeId).toBeTruthy();
      expect(archetypeIds.has(p.archetypeId as string)).toBe(true);
    });
  });

  it('makes every archetype reachable', () => {
    const reached = new Set(paths.map((p) => p.archetypeId));
    archetypes.forEach((a: PersonaArchetype) =>
      expect(reached.has(a.id)).toBe(true),
    );
  });

  it('crosses at least 4 branch points on every path', () => {
    paths.forEach((p) => expect(p.branchPoints).toBeGreaterThanOrEqual(4));
  });

  it('keeps every path within the maxQuestions cap', () => {
    paths.forEach((p) =>
      expect(p.length).toBeLessThanOrEqual(selection.maxQuestions),
    );
  });

  it('gives every archetype a non-empty keyTags list', () => {
    archetypes.forEach((a: PersonaArchetype) =>
      expect(a.keyTags.length).toBeGreaterThan(0),
    );
  });
});
