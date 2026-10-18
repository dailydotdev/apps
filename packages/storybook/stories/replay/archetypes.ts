/**
 * The archetype system behind the identity card.
 *
 * Every label is a noun, ships with the number that earned it, and is
 * reverse-engineerable from that number in one glance. When several match,
 * the person gets the one the fewest developers qualified for this week, and
 * the card prints that rarity (Monzo's rule for its 192 "eras").
 */

export interface Archetype {
  /** [modifier] + [domain] + [role noun], four words or fewer. */
  label: string;
  /** The data rule that earns it. */
  rule: string;
  /** Which card or family carries it today, or what data it still needs. */
  where: string;
}

export const archetypes: Archetype[] = [
  { label: 'Night Owl Infra Digger', rule: '50%+ of reads after 11pm local; top tag in the infra cluster', where: 'persona.week today' },
  { label: 'Dawn Patrol', rule: '40%+ of reads before 8am on 3+ days', where: 'rhythm.peak variant' },
  { label: '{Tag} Devotee', rule: 'One tag 50%+ of reads (Spotify\'s Fanatic floor is a third)', where: 'tags.dominant' },
  { label: 'Tab Completionist', rule: '90%+ of opened posts read to the end', where: 'needs read-depth' },
  { label: 'Triager', rule: '70%+ of opens under 30s, 25+ opens', where: 'selectivity variant' },
  { label: 'First Contact', rule: 'A tag with zero lifetime reads before this week', where: 'tags.newTerritory' },
  { label: 'Early Adopter', rule: 'Median time-to-open on top posts under 2h after publication', where: 'needs post age at open' },
  { label: 'Time Traveler', rule: '40%+ of reads on posts older than 12 months', where: 'needs post age at open' },
  { label: 'Cartographer', rule: '8+ distinct tags, none above 20%', where: 'tags family' },
  { label: 'Rabbit Hole', rule: '5+ reads in one tag inside one session', where: 'tags.deepDive' },
  { label: 'Weekend Shift', rule: '60%+ of reads on Saturday and Sunday', where: 'reading.grid' },
  { label: 'Lunch Break Scholar', rule: '40%+ of reads between 12:00 and 14:00', where: 'rhythm family' },
  { label: 'Comeback Kid', rule: '3+ day gap, then 5+ reads', where: 'catch-up mode' },
  { label: 'Sniper', rule: '5 or fewer reads, 80%+ in one tag', where: 'the low-volume rescue' },
  { label: 'Postmortem Collector', rule: '3+ incident or postmortem-tagged reads', where: 'tags family' },
  { label: 'Source Loyalist', rule: 'One source 40%+ of reads', where: 'reading.source, promoted' },
  { label: 'Contrarian', rule: '3+ reads on posts with a net-negative community take', where: 'needs community take' },
  { label: 'Streak Keeper', rule: 'Read on all seven days', where: 'rhythm.perfectWeek' },
  { label: 'Binge Reader', rule: '50%+ of the week\'s reads in one calendar day', where: 'reading.grid' },
  { label: 'Signal Booster', rule: 'Upvotes or shares on 30%+ of reads', where: 'needs engagement ratio' },
  { label: 'Silent Archivist', rule: 'Bookmarks at 3x reactions or more', where: 'the backlog card, reframed' },
  { label: 'Polyglot', rule: '3+ language tags, each 15%+', where: 'tags family' },
  { label: 'Trend Surfer', rule: '50%+ of reads on the week\'s top-ten trending posts', where: 'needs trending set' },
  { label: 'Under the Radar', rule: '50%+ of reads on posts under 100 upvotes', where: 'source.obscurity cousin' },
  { label: 'AI Skeptic / AI Maximalist', rule: 'AI tag under 5% or over 60% of reads', where: 'tags family' },
];


export const LABEL_FORMULA = {
  modifiers: ['Night Owl', 'Dawn Patrol', 'Weekend', 'Deep-Dive', 'Early', 'Marathon', 'Sniper'],
  domains: ['Infra', 'Frontend', 'Rust', 'AI', 'Data', 'Security', 'Postgres'],
  roles: ['Digger', 'Collector', 'Scout', 'Devotee', 'Archivist', 'Triager', 'Cartographer', 'Completionist'],
};

export const BANNED_WORDS = [
  'only',
  'just',
  'should',
  'try to',
  'unhealthy',
  'addicted',
  'average',
  'below',
  'we noticed',
  'we saw',
  'based on your',
];
