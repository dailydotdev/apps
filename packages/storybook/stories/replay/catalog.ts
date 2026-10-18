// The Replay candidate catalog: every win moment the engine knows how to find,
// mapped to the field it actually comes from.
//
// This is data, not prose, because the ranking stories run the real selector
// over it. A candidate that cannot name its source field does not belong here.

export enum Tier {
  Rare = 'rare',
  Story = 'story',
  Stat = 'stat',
}

export enum Status {
  /** Every field exists today and accepts an arbitrary window. */
  Now = 'now',
  /** Needs the previous window's value cached on the client. */
  LocalCache = 'local-cache',
  /** daily-api has to change before this can render. */
  NeedsApi = 'needs-api',
}

export enum Cadence {
  Weekly = 'weekly',
  Annual = 'annual',
}

/**
 * Which window the recap is actually covering. The cadence is weekly either
 * way; the mode decides what "last week" means for this particular person.
 *
 * `Weekly` — they were here inside the last seven days, so the window is the
 * ISO week that just closed.
 * `CatchUp` — they have been away longer than that, so the window runs from
 * their last visit to now, capped at 28 days. The recap reframes itself as
 * "while you were away" rather than pretending they saw last Monday's.
 */
export enum Mode {
  Weekly = 'weekly',
  CatchUp = 'catch-up',
}

export enum Mechanic {
  SurprisingTruth = 'Surprising truth',
  ArchetypeNaming = 'Archetype naming',
  ConsentToBrag = 'Consent to brag',
  GenerativeRarity = 'Generative rarity',
  MilestoneMoment = 'Milestone moment',
  SocialEmbedding = 'Social embedding',
  InvitedComparison = 'Invited comparison',
}

/** Whether a mechanic buys reach, buys a loop, or both. */
export const mechanicEffect: Record<Mechanic, 'Reach' | 'Loop' | 'Both'> = {
  [Mechanic.SurprisingTruth]: 'Reach',
  [Mechanic.ArchetypeNaming]: 'Both',
  [Mechanic.ConsentToBrag]: 'Reach',
  [Mechanic.GenerativeRarity]: 'Both',
  [Mechanic.MilestoneMoment]: 'Reach',
  [Mechanic.SocialEmbedding]: 'Loop',
  [Mechanic.InvitedComparison]: 'Loop',
};

export const mechanicNote: Record<Mechanic, string> = {
  [Mechanic.SurprisingTruth]:
    'One fact they did not know about themselves. Surprise is what turns a look into a screenshot.',
  [Mechanic.ArchetypeNaming]:
    'Compress the data into a named type. People adopt names as identity far faster than numbers.',
  [Mechanic.ConsentToBrag]:
    'The product said it, not them, so posting it does not read as bragging.',
  [Mechanic.GenerativeRarity]:
    'Visually unique per person, with the rarity stated. Uniqueness makes it postable, rarity makes it comparable.',
  [Mechanic.MilestoneMoment]:
    'Fires on a threshold, not on demand. Scarcity in time makes a wave instead of a trickle.',
  [Mechanic.SocialEmbedding]:
    'Other named people inside the image. Every one of them is a notification and a candidate creator.',
  [Mechanic.InvitedComparison]:
    'Ends with an implicit "post yours". The cheapest re-share there is.',
};

/**
 * The composition axis. Families stop the recap repeating itself; categories
 * decide what it feels like. A recap of five stat cards is a report, and a
 * recap of five crowns is a participation trophy, so the selector anchors one
 * seat each for Crown, Surprise and Community: every recap has something to be
 * proud of, something they did not know, and someone else in it.
 *
 * Mapped to Berger's STEPPS: Crown and Community carry social currency,
 * Surprise carries the emotional arousal, Stat carries the practical value
 * that makes the artifact legible to whoever sees it posted.
 */
export enum Category {
  /** A number about them. Legible, comparable, low arousal on its own. */
  Stat = 'stat',
  /** Something true they did not know. The screenshot trigger. */
  Surprise = 'surprise',
  /** Other people are in it, or it is about their standing among them. */
  Community = 'community',
  /** A win, celebrated. Podiums, badges, milestones, progress. */
  Crown = 'crown',
}

export const categoryNote: Record<Category, string> = {
  [Category.Stat]:
    'A number about them, with the comparison that makes it worth saying. A bare total is a receipt and stays in Tier C.',
  [Category.Surprise]:
    'Something true they did not know about themselves. This is the frame that gets screenshotted.',
  [Category.Community]:
    'Other developers are in the picture, or it places them among other developers. The only category that buys a loop rather than reach.',
  [Category.Crown]:
    'A win, celebrated properly. Accomplishment is the strongest single driver of sharing an achievement.',
};

/**
 * Who the card is about.
 *
 * Everything started reader-facing — what you read, what you missed, how you
 * rank as a reader. Creators are a second audience with entirely different
 * moments, and they are the half that already has an audience to share into.
 */
export enum Audience {
  Reader = 'reader',
  Creator = 'creator',
}

/**
 * Whether another product could hand someone the same card.
 *
 * The sharpest question in the whole catalog, and it is not "what can we
 * show", it is "what can only we show". A streak is a commodity: every app has
 * one. Views are a commodity: every platform counts them. Company-level
 * readership is not, because it needs a graph that sits across every source
 * and every developer at once, and that graph is the product.
 *
 * Commodity cards still earn seats — they are the ones people are proud of.
 * But a recap made only of them is a recap any competitor could clone in a
 * fortnight, and none of it would make anyone curious about daily.dev
 * specifically.
 */
export enum Moat {
  /** Any product with the same feature could show this. */
  Commodity = 'commodity',
  /** Needs the cross-source, cross-developer graph. Only we have it. */
  Ours = 'ours',
}

export const moatNote: Record<Moat, string> = {
  [Moat.Commodity]:
    'Another product could hand someone the same card. Still worth showing — these are the ones people are proud of — but they differentiate nothing.',
  [Moat.Ours]:
    'Needs a graph that sits across every source and every developer at once. Nobody else can hand a developer this, which is exactly why it makes a stranger curious about us.',
};

/**
 * Shareability, from spec v3 — the axis the whole catalog is now ranked on.
 *
 * Grounded in what our own users did with the annual Log: 26,530 opened it,
 * 8.0% of openers shared, and the ONLY content that travelled was the identity
 * label. Everything below is ranked by how likely a developer is to post it
 * without adding a caption to explain it.
 */
export enum Shareability {
  /** Hero cards, designed to be posted. Carry the share buttons, take the early slots. */
  S = 'S',
  /** Share-capable with the right framing. */
  A = 'A',
  /** Earns its slot on engagement and retention. No share button; a "read this" action. */
  B = 'B',
  /** Cut from the deck. Kept here so the decision is reviewable, never selected. */
  C = 'C',
  /** Measured too rare or degenerate to exist at all. */
  Cut = 'cut',
}

export const shareabilityNote: Record<Shareability, string> = {
  [Shareability.S]:
    'Designed to be posted. Each combines an identity label or a standing with a comparison. These carry the share buttons and take the early slots.',
  [Shareability.A]:
    'Strong, share-capable with the right framing. Fires often enough to be a staple.',
  [Shareability.B]:
    'Keeps its slot on engagement and retention, not distribution. Still about you, still one number, but the number is not one people post.',
  [Shareability.C]:
    'Cut from the deck: a bare total, a nudge, a confession, or the welcome card that lost a third of the audience.',
  [Shareability.Cut]:
    'Cut entirely. Measured too rare (quests 0.3%, peer awards ~110 users, new followers 0.65%), needs a graph that does not exist, or is a content nudge, which the digest, the feed and the briefing already own.',
};

/**
 * What the card compares against. Standing is the strongest driver we have not
 * yet tested, and every comparison needs an honest denominator (spec v3 §5).
 */
export enum Comparison {
  /** "Double last week." The user's own prior windows. 80% of actives qualify. */
  SelfVsPast = 'C1',
  /** "More than 88% of developers." All 83,853 weekly actives. Always available. */
  SelfVsAll = 'C2',
  /** "Top 4% of Kubernetes readers." Tag or cohort. Strongest; needs gates G1–G4. */
  SelfVsPeers = 'C3',
  /** "Third in your squad." Needs the connection graph. Does not exist yet. */
  SelfVsNamed = 'C4',
}

/**
 * How often a card can fire. The brief asked for granularity: many weekly
 * variants per category, with some cards allowed to be monthly or rarer, so a
 * deck always has something and a rare card still gets its moment.
 */
export enum Frequency {
  /** Fires most weeks for most eligible users. The staples. */
  Weekly = 'weekly',
  /** Weekly cadence, rare trigger. Promotes into the hero slot when it fires. */
  WhenFires = 'when-fires',
  /** Batch-issued monthly. A monthly special, never a weekly card. */
  Monthly = 'monthly',
  /** December only. */
  Annual = 'annual',
}

export enum Family {
  Archetype = 'archetype',
  Streak = 'streak',
  Rhythm = 'rhythm',
  Tags = 'tags',
  Reading = 'reading',
  Creation = 'creation',
  Progression = 'progression',
  Curation = 'curation',
  Reception = 'reception',
  /** The week across daily.dev, always framed against what the person did. */
  World = 'world',
  /**
   * Things that happened to them while they were not looking. Its own family
   * because it is a distinct kind of moment, and because it should never lose
   * a seat to a crowning just for sharing a data source with one.
   */
  Missed = 'missed',
}

/**
 * A frame is a layout plus a hue plus data, which is also how the shipped
 * renderer should work: bespoke art per candidate does not survive contact with
 * a weekly cadence.
 */
export enum FrameLayout {
  BigNumber = 'big-number',
  Statement = 'statement',
  Shift = 'shift',
  Share = 'share',
  Ranked = 'ranked',
  Skyline = 'skyline',
  Week = 'week',
  Badge = 'badge',
  Split = 'split',
  /** Three steps, them on one of them. The crowning layout. */
  Podium = 'podium',
  /** A bar with a target on it. Turns a stat into an unfinished thing. */
  Progress = 'progress',
  /** The establishing shot. Raw numbers, and how many moments are coming. */
  Opener = 'opener',
  /** The last frame. Hands their attention to the week ahead. */
  Handoff = 'handoff',
  /** A wall of pills. Company logos, squads, anything countable and nameable. */
  Chips = 'chips',
  /** The level badge over its progress track. The product's own level UI. */
  Level = 'level',
  /**
   * The contribution grid. Two modes on one renderer: intensity, where a cell
   * is how much, and reign, where a cell is who won. Developers already know
   * how to read this shape, which is the whole reason to use it.
   */
  Matrix = 'matrix',
  /** Real comment text in cards, with who said it and how it scored. */
  Quotes = 'quotes',
}

/**
 * daily.dev brand hues. One per candidate, stable across weeks.
 *
 * `bacon` is not a free choice: it is the reading streak's colour. The v2 rail
 * badge fills bacon once you have read today, the tier artwork burns pink
 * through to warm red, and the ember burst is built from the same ramp. Any
 * frame about a streak, a perfect week or a rest day uses it, and none of them
 * may celebrate in green or orange.
 */
export const HUE = {
  cabbage: '#CE3DF3',
  onion: '#887BF8',
  water: '#4A7EEE',
  blueCheese: '#29D8E5',
  avocado: '#57E087',
  lettuce: '#A9F261',
  cheese: '#FFE24C',
  bun: '#FF9157',
  bacon: '#F25D82',
  ketchup: '#DD5143',
};

export interface Candidate {
  id: string;
  /** Where it sits on the shareability ladder. Drives slot, share affordance and whether it is selected at all. */
  shareability: Shareability;
  category: Category;
  /** The comparison type behind its standing line, if it has one. */
  comparison?: Comparison;
  /** How often it fires, as a share of the 83,853 weekly actives, over four weeks. */
  fires?: string;
  /** A tighter trigger the data demanded, where the naive one measured degenerate. */
  trigger?: string;
  /** Fires often enough to anchor a deck. At least two staple slots per deck. */
  staple?: boolean;
  /**
   * The one primary metric, in plain words. Every card is one number about
   * them; a card with two is two cards.
   */
  metric?: string;
  /**
   * What that number is compared against, in the words the card uses. The
   * brief's rule: every card is "how this relates to me" plus "how I compare
   * to something else". A card with no versus is a receipt.
   */
  versus?: string;
  frequency?: Frequency;
  /** Defaults to reader when unset. */
  audience?: Audience;
  /** Defaults to commodity when unset: the honest default is the cheap one. */
  moat?: Moat;
  family: Family;
  /** What the frame says, in the voice it ships in. */
  headline: string;
  layout: FrameLayout;
  mechanics: Mechanic[];
  /** The GraphQL field, verbatim, or the gap if there isn't one. */
  source: string;
  tier: Tier;
  cadences: Cadence[];
  status: Status;
  /**
   * Whether the frame reads correctly as a standalone image with no
   * surrounding story. Only these are candidates for position one.
   */
  standsAlone: boolean;
  hue: string;
  /**
   * Produces a frame for anybody, including a user who did nothing at all.
   * These exist because the recap always renders: a week with one personal
   * highlight still has to be worth opening, and a guaranteed frame is what
   * keeps it from being a single sad number.
   */
  guaranteed?: boolean;
  /** Defaults to both modes. Only set it when a frame belongs to one. */
  modes?: Mode[];
}

const both = [Cadence.Weekly, Cadence.Annual];

export const catalog: Candidate[] = [
  {
    id: 'persona.week',
    metric: 'Your reading archetype this week',
    versus: 'Share of developers who read this way',
    frequency: Frequency.Weekly,
    shareability: Shareability.S,
    comparison: Comparison.SelfVsAll,
    fires: '20.9%',
    staple: true,
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Archetype,
    headline: 'You were a Night Owl Infra Digger this week.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.ArchetypeNaming, Mechanic.ConsentToBrag],
    source: 'userMostReadTags + readHistory hour histogram',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cabbage,
  },
  {
    id: 'tags.shift',
    metric: 'Your #1 topic changed',
    versus: 'vs your own last week (≥40% share or 2x jump)',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    fires: '80% flip naively',
    trigger: 'Require ≥40% share of the week or a 2x jump, or it fires for everyone.',
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Tags,
    headline: 'Rust took over. Python is out.',
    layout: FrameLayout.Shift,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ArchetypeNaming],
    source: 'userMostReadTags, this window vs previous',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bun,
  },
  {
    id: 'tags.dominant',
    metric: 'Share of your week on one topic',
    versus: 'vs the typical developer’s spread',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: '13.4% at ≥40%',
    staple: true,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Tags,
    headline: 'Kubernetes took 63% of your week.',
    layout: FrameLayout.Share,
    mechanics: [Mechanic.ArchetypeNaming, Mechanic.ConsentToBrag],
    source: 'userMostReadTags(after, before).percentage',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.water,
  },
  {
    id: 'tags.newTerritory',
    comparison: Comparison.SelfVsPast,
    metric: 'First reads in a topic',
    versus: 'vs your own prior four weeks (≥3 opens, safe tags)',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    fires: '98% naively',
    trigger: 'Require ≥3 opens in the tag, restricted to the 109 safe tags.',
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Tags,
    headline: 'First time you have ever touched WebAssembly.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'tag absent from the previous four windows',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.lettuce,
  },
  {
    id: 'tags.deepDive',
    metric: 'Posts on a single subject',
    versus: 'Deeper than X% of developers on one subject',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Tags,
    headline: 'Nine posts on one subject. Not an accident.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.SurprisingTruth],
    source: 'userMostReadTags[].count over threshold',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: false,
    hue: HUE.blueCheese,
  },
  {
    id: 'tags.tierList',
    comparison: Comparison.SelfVsPast,
    metric: 'Your topics ranked by hours',
    versus: 'vs your own hours last week',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Tags,
    headline: 'Your week, ranked S to C.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'userMostReadTags',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'source.obscurity',
    metric: 'How niche your sources are',
    versus: 'More obscure than X% of developers',
    frequency: Frequency.Weekly,
    shareability: Shareability.S,
    comparison: Comparison.SelfVsAll,
    fires: 'staple',
    trigger: 'The Log’s sourcePercentile proves it computes. A pure dev flex.',
    staple: true,
    category: Category.Surprise,
    moat: Moat.Ours,
    family: Family.Reading,
    headline: 'Your sources are more obscure than 91% of developers.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'weekly aggregate: source audience size per read, ranked globally',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.water,
  },
  {
    id: 'reading.grid',
    metric: 'Your reads by topic and day',
    versus: 'Your peak day vs your own average',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    fires: 'staple',
    trigger: 'Carried by the artwork.',
    staple: true,
    category: Category.Stat,
    moat: Moat.Ours,
    family: Family.Reading,
    headline: 'Your week, topic by day.',
    layout: FrameLayout.Matrix,
    mechanics: [Mechanic.GenerativeRarity, Mechanic.SurprisingTruth],
    source: 'userReadHistory + userMostReadTags, per day',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: true,
    hue: HUE.blueCheese,
  },
  {
    id: 'reading.skyline',
    comparison: Comparison.SelfVsAll,
    metric: 'Your week as a generated shape',
    versus: 'Rarity: 1 in N have this shape',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    fires: 'staple',
    trigger: 'Generative; carried by the artwork.',
    staple: true,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Reading,
    headline: 'Your week, as a skyline.',
    layout: FrameLayout.Skyline,
    mechanics: [Mechanic.GenerativeRarity, Mechanic.ConsentToBrag],
    source: 'userReadHistory + userMostReadTags',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.onion,
  },
  {
    id: 'streak.moment',
    metric: 'Streak length',
    versus: 'Longer than X% of developers',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: '7.6% have a streak ≥2',
    category: Category.Crown,
    family: Family.Streak,
    headline: '37 days. Unbroken.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.MilestoneMoment, Mechanic.ConsentToBrag],
    source: 'userStreak.current crossing a milestone band',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'streak.personalBest',
    metric: 'Your longest streak ever',
    versus: 'vs your own previous best',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    category: Category.Crown,
    family: Family.Streak,
    headline: 'The longest streak you have ever had.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.MilestoneMoment, Mechanic.ConsentToBrag],
    source: 'userStreak.current === max, max rose in window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'streak.saved',
    metric: 'The day you nearly missed',
    versus: 'vs your own streak',
    frequency: Frequency.WhenFires,
    shareability: Shareability.B,
    comparison: Comparison.SelfVsPast,
    category: Category.Surprise,
    family: Family.Streak,
    headline: 'Saved at 11:52pm. Eight minutes to spare.',
    layout: FrameLayout.Week,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'zero-read day in userReadHistory, streak intact',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    hue: HUE.bacon,
  },
  {
    id: 'rhythm.perfectWeek',
    metric: 'Seven of seven days',
    versus: 'X% of developers read every day',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: '0.9%',
    trigger: 'Rare, pure brag. Promote when it fires.',
    category: Category.Crown,
    family: Family.Rhythm,
    headline: 'Seven for seven.',
    layout: FrameLayout.Week,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.MilestoneMoment],
    source: 'userReadHistory(grouped: true), all days > 0',
    tier: Tier.Rare,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'rhythm.peak',
    metric: 'Your peak reading hour',
    versus: 'vs your own average and everyone’s',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    fires: '20.9%',
    staple: true,
    category: Category.Surprise,
    family: Family.Rhythm,
    headline: '1am. Four nights running.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ArchetypeNaming],
    source: 'readHistory timestamps',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'bookmarks.backlog',
    fires: 'saves at 3x reactions or more',
    frequency: Frequency.WhenFires,
    versus: 'vs the typical developer',
    metric: 'Saves per reaction',
    comparison: Comparison.SelfVsAll,
    shareability: Shareability.A,
    category: Category.Surprise,
    family: Family.Curation,
    headline: 'Silent Archivist. You save three times more than you react.',
    layout: FrameLayout.Split,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'bookmarksFeed.createdAt in window, minus readHistory',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'posts.top',
    metric: 'Views on your top post',
    versus: 'Percentile among posts published this week',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPeers,
    fires: '1.7%',
    category: Category.Crown,
    family: Family.Creation,
    headline: '4,218 people saw what you posted.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag],
    source: 'userPostsWithAnalytics, createdAt in window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.water,
  },
  {
    id: 'posts.firstTraction',
    metric: 'First post past 50 upvotes',
    versus: 'vs your own previous posts',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    category: Category.Crown,
    family: Family.Creation,
    headline: 'Your first post to break 50 upvotes.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.MilestoneMoment, Mechanic.ConsentToBrag],
    source: 'userPostsWithAnalytics compared against lifetime',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.avocado,
  },
  {
    id: 'achievement.unlocked',
    comparison: Comparison.SelfVsAll,
    metric: 'The achievement you unlocked',
    versus: 'Its rarity: held by X% of developers',
    frequency: Frequency.WhenFires,
    shareability: Shareability.S,
    fires: '6.5%',
    trigger: 'Lead with Achievement.rarity, which is already populated for all 76.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Deep Diver unlocked.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.GenerativeRarity, Mechanic.ConsentToBrag],
    source: 'userAchievements[].unlockedAt in window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cabbage,
  },
  {
    id: 'quests.cleared',
    shareability: Shareability.Cut,
    fires: '0.02%',
    trigger: 'All weekly quests: 0.02%.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Every weekly quest, cleared.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.MilestoneMoment],
    source: 'questDashboard.weekly all claimed',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    hue: HUE.lettuce,
  },
  {
    id: 'topic.coverage',
    metric: 'Share of a topic’s posts you read this week',
    versus: 'vs the median reader of that topic',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPeers,
    fires: 'staple',
    staple: true,
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Tags,
    headline: 'You read 38% of everything published about Kubernetes this week.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'posts tagged X published in window ∩ readHistory; median coverage per topic from the aggregate job',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.water,
  },
  {
    id: 'feed.verdicts',
    metric: 'Share of opened posts you gave a verdict on',
    versus: 'vs the typical developer',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: 'staple',
    staple: true,
    category: Category.Community,
    family: Family.Curation,
    headline: 'You gave a verdict on one in five posts you opened.',
    layout: FrameLayout.Split,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: '(upvotes + downvotes) / opens in window; typical rate from the aggregate job',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.lettuce,
  },
  {
    id: 'reading.time',
    metric: 'Hours spent reading this week',
    versus: 'vs the median developer',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: 'staple',
    staple: true,
    trigger:
      '"Hours saved" needs a definition we can defend (TLDR reads against full opens, say) before it becomes a card. Hours spent is measured, so it ships first.',
    category: Category.Stat,
    family: Family.Reading,
    headline: '3.1 hours reading. The median developer reads for 40 minutes.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'sum of read time in window; median from the aggregate job',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.bun,
  },
  {
    id: 'reading.volume',
    frequency: Frequency.Weekly,
    versus: 'vs the median developer',
    metric: 'Posts opened this week',
    comparison: Comparison.SelfVsAll,
    shareability: Shareability.B,
    category: Category.Stat,
    family: Family.Reading,
    headline: '47 posts. Eight times the median developer.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag],
    source: 'sum of userReadHistory[].reads',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: false,
    hue: HUE.blueCheese,
  },
  {
    id: 'reading.source',
    fires: '40%+ from one source',
    frequency: Frequency.WhenFires,
    versus: 'vs the typical developer’s top source',
    metric: 'Share of your reads from one source',
    comparison: Comparison.SelfVsAll,
    shareability: Shareability.A,
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Reading,
    headline: 'Source Loyalist. 41% of your week from ACM Queue.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'readHistory grouped by post.source',
    tier: Tier.Story,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.bacon,
  },
  {
    id: 'level.up',
    shareability: Shareability.C,
    trigger: 'Gamification stat.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Level 14.',
    layout: FrameLayout.Level,
    mechanics: [Mechanic.MilestoneMoment, Mechanic.ConsentToBrag],
    source: 'questDashboard.level.level rose',
    tier: Tier.Rare,
    cadences: both,
    status: Status.LocalCache,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'selectivity',
    metric: 'Posts opened vs posts seen',
    versus: 'More selective than X% of developers (p75+ only)',
    frequency: Frequency.Weekly,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    fires: '~90% have the data',
    trigger: 'Fire only above p75. 74% open under 2% of what they see; never frame the low end as failure.',
    staple: true,
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Reading,
    headline: '1,412 posts reached your feed. You read 47.',
    layout: FrameLayout.Split,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'feed impressions vs reads in window',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.onion,
  },
  {
    id: 'reception.followers',
    shareability: Shareability.Cut,
    fires: '0.65%',
    category: Category.Community,
    family: Family.Reception,
    headline: '12 more devs follow you now.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.SocialEmbedding],
    source: 'weekly delta on userStats.numFollowers',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.avocado,
  },
  {
    id: 'reception.awards',
    shareability: Shareability.Cut,
    fires: '~110 users',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Someone paid Cores to say thanks.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.ConsentToBrag],
    source: 'njord transactions, date-filtered',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'reception.comment',
    shareability: Shareability.Cut,
    fires: '626 commenters/week',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Your comment outscored the post.',
    layout: FrameLayout.Split,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ConsentToBrag],
    source: 'comment analytics in window',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.ketchup,
  },
  {
    id: 'xp.earned',
    staple: true,
    fires: 'staple',
    frequency: Frequency.Weekly,
    versus: 'Top X% of XP earners this week',
    metric: 'XP earned this week',
    comparison: Comparison.SelfVsAll,
    shareability: Shareability.A,
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Top 9% of XP earners this week.',
    layout: FrameLayout.Level,
    mechanics: [Mechanic.ConsentToBrag],
    source: 'weekly XP delta',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.lettuce,
  },

  // Standing. Where they sit against everyone else, which is the thing nobody
  // can work out for themselves and the reason a recap teaches them something
  // instead of reading their own numbers back at them.
  {
    id: 'rank.topicReader',
    metric: 'Posts opened in your #1 topic',
    versus: 'Top X% of that tag’s click-readers (G4)',
    frequency: Frequency.Weekly,
    shareability: Shareability.S,
    comparison: Comparison.SelfVsPeers,
    fires: '22.8%',
    trigger: 'G4: ≥1,000 weekly click-readers in the tag (109 qualify). G2: only above p75.',
    staple: true,
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Top 2% of Kubernetes readers.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'per-topic read counts ranked across all users',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'rank.overtake',
    metric: 'Developers you passed this week',
    versus: 'Overall rank, vs last Monday',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    trigger: 'Needs a weekly-scored leaderboard.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Progression,
    headline: 'You passed 340 developers this week.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.InvitedComparison, Mechanic.ConsentToBrag],
    source: 'leaderboardPosition delta, window over window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.avocado,
  },
  {
    id: 'community.readAlong',
    shareability: Shareability.Cut,
    comparison: Comparison.SelfVsNamed,
    trigger: 'No connection graph.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Six devs you follow read this too.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.InvitedComparison],
    source: 'contentPreference follows joined to readHistory',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.blueCheese,
  },

  // Creator loop. Everything above is about what someone read; these are about
  // what they published, which is the half that already has an audience to
  // share into. Four of them come from Chris's concepts, and the split between
  // them is the point: rank is the vanity baseline anyone could build, and the
  // rest need a graph only we have.
  {
    id: 'creator.reach',
    metric: 'Reach on your post this week',
    versus: 'Percentile among posts published this week',
    frequency: Frequency.WhenFires,
    shareability: Shareability.S,
    comparison: Comparison.SelfVsPeers,
    fires: '1.7%',
    trigger: 'Percentile among posts published that week. Fund after Tier S works.',
    category: Category.Crown,
    audience: Audience.Creator,
    family: Family.Creation,
    headline: '18,420 developers read your post.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'userPostsWithAnalytics + percentile across posts in window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.onion,
  },
  {
    id: 'creator.companies',
    comparison: Comparison.SelfVsAll,
    metric: 'Companies whose developers read your post',
    versus: 'More companies than X% of posts this week',
    frequency: Frequency.WhenFires,
    shareability: Shareability.S,
    fires: '1.7%',
    trigger: 'Needs company-affiliation joins. Expensive; decide later.',
    category: Category.Community,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Reception,
    headline: 'Developers at these companies read your post.',
    layout: FrameLayout.Chips,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ConsentToBrag],
    source: 'reader company affiliation joined to post reads',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.cabbage,
  },
  {
    id: 'creator.unreadThread',
    comparison: Comparison.SelfVsAll,
    metric: 'Comments on your post this week',
    versus: 'vs every post published this week',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    fires: '626 commenters/week',
    category: Category.Community,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Reception,
    headline: '23 comments on your post. 96% of posts get none.',
    layout: FrameLayout.Quotes,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.SocialEmbedding],
    source: 'unread comments on their posts in window',
    tier: Tier.Rare,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.cabbage,
  },
  {
    id: 'creator.beatTheRoom',
    metric: 'Upvotes on your post',
    versus: 'vs the tag median this week',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPeers,
    fires: '1.7%',
    trigger: 'Compare to the tag median. Never name rivals.',
    category: Category.Crown,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Creation,
    headline: 'Your post beat the Rust median by 4x.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'post ranking within a tag for the window',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.onion,
  },
  {
    id: 'creator.alsoRead',
    fires: '1.7%',
    comparison: Comparison.SelfVsAll,
    metric: 'What your readers read far more than the average developer',
    versus: 'Your readers vs all developers',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    category: Category.Community,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Reception,
    headline: 'Your readers are 3x more likely to read Rust than the average developer.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.SocialEmbedding],
    source: 'co-readership across sources for readers of their post',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.blueCheese,
  },
  {
    id: 'creator.firstReader',
    comparison: Comparison.SelfVsAll,
    metric: 'Time to first read',
    versus: 'vs the median post’s first hour',
    frequency: Frequency.WhenFires,
    shareability: Shareability.B,
    trigger: 'Needs company affiliation for the first line; the first-hour comparison works without it.',
    category: Category.Surprise,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Reception,
    headline: 'Stripe opened it first. 31 reads in the first hour.',
    layout: FrameLayout.Statement,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ConsentToBrag],
    source: 'first read event with reader company affiliation',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.avocado,
  },
  {
    id: 'creator.secondLife',
    metric: 'Reads on an old post this week',
    versus: 'vs its weekly average since publishing',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    category: Category.Surprise,
    audience: Audience.Creator,
    moat: Moat.Ours,
    family: Family.Creation,
    headline: 'A post you wrote in March is still being read.',
    layout: FrameLayout.BigNumber,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.ConsentToBrag],
    source: 'reads in window on posts created before it',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.lettuce,
  },

  // What they missed. An information gap is the most reliable curiosity
  // trigger there is: people feel the absence of something they now know
  // exists. These are also the only frames that send someone straight back
  // into the product with a specific thing to open.
  {
    id: 'missed.comment',
    comparison: Comparison.SelfVsAll,
    metric: 'Best comment on a post you read',
    versus: 'It outscored the post',
    frequency: Frequency.WhenFires,
    shareability: Shareability.Cut,
    trigger:
      'Out of scope. Content discovery belongs to the digest, the feed and the briefing. Replay only says what you did and how it compares.',
    fires: '626 commenters/week',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Missed,
    headline: 'The best comment on a post you read. You never saw it.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.SocialEmbedding],
    source: 'top comment on posts in readHistory, not seen',
    tier: Tier.Rare,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: false,
    hue: HUE.blueCheese,
  },
  {
    id: 'missed.story',
    metric: 'The post in your topic you skipped',
    versus: 'Read by X% of that tag’s readers',
    frequency: Frequency.Weekly,
    shareability: Shareability.Cut,
    comparison: Comparison.SelfVsPeers,
    trigger:
      'Out of scope. Content discovery belongs to the digest, the feed and the briefing. Replay only says what you did and how it compares.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Missed,
    headline: 'Everyone in Kubernetes read this. You did not.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SurprisingTruth, Mechanic.InvitedComparison],
    source: 'top post in their tags, absent from readHistory',
    tier: Tier.Rare,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: false,
    hue: HUE.bun,
  },
  {
    id: 'missed.reply',
    shareability: Shareability.Cut,
    fires: '626 commenters/week',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Missed,
    headline: 'Someone replied to you. You never came back.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.SurprisingTruth],
    source: 'unread replies and mentions in window',
    tier: Tier.Rare,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: false,
    hue: HUE.bacon,
  },

  // Crowning. Accomplishment is the strongest driver of sharing an
  // achievement, and daily.dev already hands out real rewards that currently
  // get almost no visibility — the Top Reader badge, achievements, quest
  // rotations, leaderboard standing. The recap is where they finally get a
  // stage.
  {
    id: 'crown.topReader',
    comparison: Comparison.SelfVsPeers,
    metric: '#1 reader of a tag',
    versus: 'Of N developers reading that tag this month',
    frequency: Frequency.Monthly,
    shareability: Shareability.S,
    fires: 'monthly, ~4,200 users',
    trigger: 'Batch-issued monthly, 30 per keyword. A monthly special, never a weekly card.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Top reader in Kubernetes this week.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.GenerativeRarity],
    source: 'topReaderBadge(userId, limit)',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'community.podium',
    metric: 'Your leaderboard position',
    versus: 'vs the two developers either side of you',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPeers,
    trigger: 'leaderboardPosition, three lifetime types. Weekly-scored leaderboard is expensive; decide later.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Third for longest streak this week.',
    layout: FrameLayout.Podium,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'leaderboardPosition(type) — rank, score, cappedAt',
    tier: Tier.Rare,
    cadences: both,
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cheese,
  },
  {
    id: 'achievement.nextUp',
    shareability: Shareability.C,
    trigger: 'A nudge.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Two posts from Deep Diver.',
    layout: FrameLayout.Progress,
    mechanics: [Mechanic.MilestoneMoment],
    source: 'trackedAchievement — progress vs criteria.targetCount',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    guaranteed: true,
    hue: HUE.cabbage,
  },
  {
    id: 'quests.progress',
    shareability: Shareability.Cut,
    fires: '0.3%',
    trigger: 'Weekly quests fire for 0.3%.',
    category: Category.Crown,
    family: Family.Progression,
    headline: 'Five of seven weekly quests.',
    layout: FrameLayout.Progress,
    mechanics: [Mechanic.MilestoneMoment, Mechanic.ConsentToBrag],
    source: 'questDashboard.weekly progress and rewards',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    guaranteed: true,
    hue: HUE.lettuce,
  },
  {
    id: 'community.squad',
    frequency: Frequency.Weekly,
    versus: 'vs named squad members',
    metric: 'Your rank inside your squad by posts read',
    shareability: Shareability.A,
    comparison: Comparison.SelfVsNamed,
    trigger: 'Needs squad members’ reads in the window. Squads already exist; this never needed the connection graph.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'Your squad read 214 posts. You were third.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.InvitedComparison],
    source: 'source members + readHistory in window',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.avocado,
  },
  {
    id: 'community.circle',
    frequency: Frequency.Monthly,
    versus: 'No comparison yet',
    metric: 'The developers you read most',
    shareability: Shareability.B,
    comparison: Comparison.SelfVsNamed,
    trigger: 'Needs the authors of the posts you read, aggregated. Read history, not the follow graph.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'The six developers you read most.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.InvitedComparison],
    source: 'connection graph — the viral folder scoped this',
    tier: Tier.Rare,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.onion,
  },

  // Guaranteed frames. These are what make "always render" survivable: they
  // need nothing from the user, so the thinnest possible week is still three
  // frames rather than one number nobody wants to look at.
  {
    id: 'trend.early',
    comparison: Comparison.SelfVsAll,
    metric: 'How many of the week’s three biggest stories you read, and how early',
    versus: 'vs the median reader of each story',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    fires: '~30% read two of the top three',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.World,
    headline: 'You were early to two of this week’s three biggest stories.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.ConsentToBrag, Mechanic.InvitedComparison],
    source: 'top three posts of the window ∩ readHistory, open time vs post publish time; median open time from the aggregate job',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.water,
  },
  {
    id: 'trend.ahead',
    fires: 'when a tag spikes 30%+ and it was already 20%+ of their week',
    metric: 'A topic’s surge across daily.dev vs its share of your week before it',
    versus: 'You vs the crowd arriving',
    frequency: Frequency.WhenFires,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsAll,
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.World,
    headline: 'Kubernetes spiked 40% across daily.dev. You were already there.',
    layout: FrameLayout.Shift,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'tag volume this window vs previous, against the user’s own tag share',
    tier: Tier.Story,
    cadences: both,
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.blueCheese,
  },
  {
    id: 'streak.nudge',
    shareability: Shareability.C,
    trigger: 'A nudge.',
    category: Category.Crown,
    family: Family.Streak,
    headline: 'Three days from thirty.',
    layout: FrameLayout.Week,
    mechanics: [Mechanic.MilestoneMoment],
    source: 'userStreak.current vs the next milestone band',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    guaranteed: true,
    hue: HUE.bacon,
  },

  // Catch-up only. A person who has been away for eleven days should not be
  // handed last Monday's recap as though they saw it; these frames name the
  // absence instead of papering over it.
  {
    id: 'away.missed',
    metric: 'Posts in your tags while away',
    versus: 'vs a normal week for you',
    frequency: Frequency.WhenFires,
    shareability: Shareability.Cut,
    trigger:
      'Out of scope. Content discovery belongs to the digest, the feed and the briefing. Replay only says what you did and how it compares.',
    comparison: Comparison.SelfVsPast,
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.World,
    headline: 'You were away 11 days. 214 posts landed in your tags.',
    layout: FrameLayout.Split,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'feed volume since lastVisitAt, capped at 28 days',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.NeedsApi,
    standsAlone: true,
    guaranteed: true,
    modes: [Mode.CatchUp],
    hue: HUE.onion,
  },
  {
    id: 'away.streakLost',
    metric: 'The streak that ended',
    versus: 'vs every streak on daily.dev',
    frequency: Frequency.WhenFires,
    shareability: Shareability.B,
    comparison: Comparison.SelfVsAll,
    category: Category.Surprise,
    family: Family.Streak,
    headline: '22 days. Longer than most streaks ever get.',
    layout: FrameLayout.Week,
    mechanics: [Mechanic.SurprisingTruth],
    source: 'userStreak.max vs current, userReadHistory gap',
    tier: Tier.Story,
    cadences: [Cadence.Weekly],
    status: Status.Now,
    standsAlone: false,
    modes: [Mode.CatchUp],
    hue: HUE.bacon,
  },
];

/**
 * Annual-only flagships, ported from the earlier viral-artifact exploration.
 * They are catalog entries with a different cadence, not a separate feature,
 * and they are where the loop mechanics live once they are switched on.
 */
export const annualFlagships: Candidate[] = [
  {
    id: 'annual.reign',
    metric: 'Which topic won each day',
    versus: 'vs your own year',
    frequency: Frequency.Annual,
    shareability: Shareability.A,
    comparison: Comparison.SelfVsPast,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Tags,
    headline: 'Who won each day of your year.',
    layout: FrameLayout.Skyline,
    mechanics: [Mechanic.GenerativeRarity, Mechanic.ConsentToBrag],
    source: 'userReadHistory + userMostReadTags over 365 days',
    tier: Tier.Rare,
    cadences: [Cadence.Annual],
    status: Status.Now,
    standsAlone: true,
    hue: HUE.cabbage,
  },
  {
    id: 'annual.devCircle',
    shareability: Shareability.B,
    comparison: Comparison.SelfVsNamed,
    trigger: 'Needs the authors of the posts you read, aggregated over the year. Read history, not the follow graph.',
    moat: Moat.Ours,
    category: Category.Community,
    family: Family.Reception,
    headline: 'The developers who shaped your year.',
    layout: FrameLayout.Badge,
    mechanics: [Mechanic.SocialEmbedding, Mechanic.InvitedComparison],
    source: 'connection graph — not built yet',
    tier: Tier.Rare,
    cadences: [Cadence.Annual],
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.onion,
  },
  {
    id: 'annual.readingDna',
    comparison: Comparison.SelfVsAll,
    metric: '365 days as a generated strand',
    versus: 'Rarity: 1 in N have this pattern',
    frequency: Frequency.Annual,
    shareability: Shareability.A,
    moat: Moat.Ours,
    category: Category.Stat,
    family: Family.Reading,
    headline: '365 days, one strand.',
    layout: FrameLayout.Skyline,
    mechanics: [Mechanic.GenerativeRarity],
    source: 'userReadHistory + top sources over 365 days',
    tier: Tier.Rare,
    cadences: [Cadence.Annual],
    status: Status.Now,
    standsAlone: true,
    hue: HUE.blueCheese,
  },
  {
    id: 'annual.iceberg',
    metric: 'Depth of your sources over the year',
    versus: 'More obscure than X% of developers',
    frequency: Frequency.Annual,
    shareability: Shareability.S,
    comparison: Comparison.SelfVsAll,
    trigger: 'The Log’s sourcePercentile proves it computes.',
    moat: Moat.Ours,
    category: Category.Surprise,
    family: Family.Reading,
    headline: 'How deep your sources go.',
    layout: FrameLayout.Ranked,
    mechanics: [Mechanic.GenerativeRarity, Mechanic.InvitedComparison],
    source: 'source obscurity ranking — not built yet',
    tier: Tier.Story,
    cadences: [Cadence.Annual],
    status: Status.NeedsApi,
    standsAlone: true,
    hue: HUE.water,
  },
];

/**
 * The establishing shot, and always frame one.
 *
 * This used to be the closer, and moving it to the front is the single biggest
 * structural change to the story. Frame one is not the place for the best
 * highlight: it is the place to open the information gap. It says how many
 * moments are coming without saying what they are, which is the condition
 * Loewenstein describes for curiosity — you feel the absence of something you
 * now know exists.
 *
 * It also absorbs the raw numbers. Volume, XP and time-spent are not moments,
 * they are furniture, and giving each of them its own frame is what made the
 * old nine-card version feel like a report.
 */
export const openerFrame: Candidate = {
  id: 'opener',
  shareability: Shareability.C,
  trigger: 'The measured 33% leak: 8,656 of 26,530 Log openers never swiped past the welcome card.',
  category: Category.Stat,
  family: Family.Reading,
  headline: "Let's look at your week.",
  layout: FrameLayout.Opener,
  mechanics: [Mechanic.SurprisingTruth],
  source: 'the totals already fetched for every other frame',
  tier: Tier.Stat,
  cadences: both,
  status: Status.Now,
  standsAlone: false,
  hue: HUE.cabbage,
};

/**
 * The last frame, and the only one that asks for anything.
 *
 * The peak-end rule says the ending is weighted out of all proportion in what
 * people remember, so the recap does not trail off on a statistic. It turns
 * around: last week is finished, here is the week in front of you. That hands
 * the attention it just earned to the Presidential briefing rather than
 * dropping it back into a feed.
 */
export const handoffFrame: Candidate = {
  id: 'handoff',
  shareability: Shareability.B,
  category: Category.Community,
  family: Family.World,
  headline: 'That was week 37.',
  layout: FrameLayout.Handoff,
  mechanics: [Mechanic.ConsentToBrag],
  source: 'next Monday’s Replay and the share sheet',
  tier: Tier.Stat,
  cadences: both,
  status: Status.Now,
  standsAlone: false,
  hue: HUE.onion,
};

export const byId = (id: string): Candidate => {
  const found = [...catalog, ...annualFlagships, openerFrame, handoffFrame].find(
    (item) => item.id === id,
  );

  if (!found) {
    throw new Error(`Unknown Replay candidate: ${id}`);
  }

  return found;
};

export const shipsNow = (candidate: Candidate): boolean =>
  candidate.status === Status.Now;

export const statusLabel: Record<Status, string> = {
  [Status.Now]: 'Ships now',
  [Status.LocalCache]: 'Needs local cache',
  [Status.NeedsApi]: 'Needs API',
};
