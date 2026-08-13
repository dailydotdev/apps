import type { WorldNicheSummary } from '../../graphql/worldIndex';

/**
 * The six realms and the niches inside them, in taxonomy order.
 *
 * A standalone copy of what `engine/taxonomy.js` carries, for the same reason
 * `ladder.ts` is standalone: taxonomy imports three on its first line, and the
 * index has no renderer to drag half a megabyte in for.
 *
 * The index also drops the world's vocabulary, so realms are categories and
 * districts are topics. The flavour name survives one size down, where it
 * connects the two without having to be learned first.
 */

export interface WorldCategory {
  id: string;
  /** What the taxonomy calls it, kept small so it never has to be decoded. */
  worldName: string;
  name: string;
  /** Theme variable, for the bars that have to be coloured inline. */
  accent: string;
  accentBg: string;
  /** Niche slugs, in taxonomy order. */
  topics: string[];
}

export const worldCategories: WorldCategory[] = [
  {
    id: 'swarm',
    worldName: 'Arcane Swarm',
    name: 'AI & data',
    accent: 'var(--theme-accent-cabbage-default)',
    accentBg: 'bg-accent-cabbage-default',
    topics: [
      'ai_llm',
      'ai_agents',
      'ai_infra',
      'ml_ds',
      'data_eng',
      'ai_safety',
      'python',
    ],
  },
  {
    id: 'frame',
    worldName: 'Frameworks',
    name: 'Web & mobile',
    accent: 'var(--theme-accent-avocado-default)',
    accentBg: 'bg-accent-avocado-default',
    topics: [
      'js_ts',
      'css_design',
      'android',
      'ios_apple',
      'jvm',
      'dotnet',
      'php',
      'ruby',
    ],
  },
  {
    id: 'forge',
    worldName: 'Metal Forges',
    name: 'Systems & low level',
    accent: 'var(--theme-accent-bun-default)',
    accentBg: 'bg-accent-bun-default',
    topics: ['c_cpp', 'rust', 'linux_os', 'embedded', 'gamedev', 'niche_langs'],
  },
  {
    id: 'ship',
    worldName: 'Shipyards',
    name: 'Cloud & infra',
    accent: 'var(--theme-accent-blueCheese-default)',
    accentBg: 'bg-accent-blueCheese-default',
    topics: [
      'k8s',
      'cloud',
      'go',
      'ci_devex',
      'observability',
      'databases',
      'distributed_arch',
      'selfhost',
    ],
  },
  {
    id: 'bastion',
    worldName: 'Bastion',
    name: 'Security',
    accent: 'var(--theme-accent-water-default)',
    accentBg: 'bg-accent-water-default',
    topics: ['sec_appsec', 'sec_crypto', 'sec_threats'],
  },
  {
    id: 'quarter',
    worldName: 'Artisan’s Quarter',
    name: 'Craft & career',
    accent: 'var(--theme-accent-bacon-default)',
    accentBg: 'bg-accent-bacon-default',
    topics: [
      'devtools',
      'git_vcs',
      'software_craft',
      'cs_fundamentals',
      'career',
      'eng_mgmt',
      'industry_news',
      'other',
    ],
  },
];

const categoryBySlug = new Map(
  worldCategories.flatMap((category) =>
    category.topics.map((slug) => [slug, category] as const),
  ),
);

export const categoryOfSlug = (slug: string): WorldCategory | undefined =>
  categoryBySlug.get(slug);

export const categoryById = (id: string): WorldCategory =>
  worldCategories.find((category) => category.id === id) ?? worldCategories[0];

/** Topics of one category, ordered by the taxonomy and named by the API. */
export const topicsOfCategory = (
  category: WorldCategory,
  niches: Map<string, WorldNicheSummary>,
): WorldNicheSummary[] =>
  category.topics
    .map((slug) => niches.get(slug))
    .filter((niche): niche is WorldNicheSummary => !!niche);
