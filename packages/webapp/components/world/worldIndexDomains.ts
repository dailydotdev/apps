/**
 * How each domain is presented. Nothing here decides what belongs to it.
 *
 * The grouping used to live in this file as a list of niche slugs, copied out
 * of `engine/taxonomy.js`. The API carries `niche.domain` now, so the copy is
 * gone and this is only a name and an accent per domain: the two could not
 * drift apart before, and now there is nothing to drift.
 *
 * The index avoids the world's own vocabulary, so realms are domains and
 * districts are topics. The flavour name survives one size down, where it
 * connects the two without having to be learned first.
 */

export interface WorldDomainStyle {
  id: string;
  /** What the taxonomy calls it, kept small so it never has to be decoded. */
  worldName: string;
  name: string;
  /** Theme variable, for the bars that have to be coloured inline. */
  accent: string;
  accentBg: string;
}

/* Tailwind only sees whole class names, so the six in use are spelled out:
   bg-accent-cabbage-default bg-accent-avocado-default bg-accent-bun-default
   bg-accent-blueCheese-default bg-accent-water-default bg-accent-bacon-default */

export const worldDomains: WorldDomainStyle[] = [
  {
    id: 'swarm',
    worldName: 'Arcane Swarm',
    name: 'AI & data',
    accent: 'var(--theme-accent-cabbage-default)',
    accentBg: 'bg-accent-cabbage-default',
  },
  {
    id: 'frame',
    worldName: 'Frameworks',
    name: 'Web & mobile',
    accent: 'var(--theme-accent-avocado-default)',
    accentBg: 'bg-accent-avocado-default',
  },
  {
    id: 'forge',
    worldName: 'Metal Forges',
    name: 'Systems & low level',
    accent: 'var(--theme-accent-bun-default)',
    accentBg: 'bg-accent-bun-default',
  },
  {
    id: 'ship',
    worldName: 'Shipyards',
    name: 'Cloud & infra',
    accent: 'var(--theme-accent-blueCheese-default)',
    accentBg: 'bg-accent-blueCheese-default',
  },
  {
    id: 'bastion',
    worldName: 'Bastion',
    name: 'Security',
    accent: 'var(--theme-accent-water-default)',
    accentBg: 'bg-accent-water-default',
  },
  {
    id: 'quarter',
    worldName: 'Artisan’s Quarter',
    name: 'Craft & career',
    accent: 'var(--theme-accent-bacon-default)',
    accentBg: 'bg-accent-bacon-default',
  },
];

const byId = new Map(worldDomains.map((domain) => [domain.id, domain]));

/** Falls back to the first domain, so an unplaced topic still draws a colour. */
export const domainStyle = (id?: string | null): WorldDomainStyle =>
  (id && byId.get(id)) || worldDomains[0];
