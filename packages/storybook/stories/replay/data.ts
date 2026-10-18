import type { FrameData } from './frames';
import { asset, StreakTier } from './assets';
import { Mode } from './catalog';
import { avatarFor, ME, personBy } from './people';

// Mock content for every frame, plus the handful of people the ranking stories
// run the engine against.
//
// Every frame is written as a package: the claim, two or three supporting
// facts, and wherever it is possible, where that puts them against everyone
// else. A frame with one number on it is a statistic; a frame that tells you
// something about yourself you could not have worked out is a screenshot.

const week = (pattern: string): FrameData['days'] =>
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => ({
    label,
    state: pattern[index] === '1' ? 'on' : pattern[index] === 'x' ? 'miss' : 'off',
  }));

/** Keyed by candidate id. Anything missing falls back to the headline alone. */
export const sampleData: Record<string, FrameData> = {
  'persona.week': {
    headline: 'The Night Owl Infra Digger',
    note: 'Eight in ten of your reads landed after 11pm, and almost all of them were about things that run in production.',
    context: [
      { value: '81%', label: 'after 11pm' },
      { value: '1:14am', label: 'median read' },
      { value: '4 / 12', label: 'personas seen' },
    ],
    standing: {
      figure: '6%',
      label: 'Rarest trait',
      scope: '6% of developers read this late, this consistently',
      pin: 6,
    },
  },

  'tags.shift': {
    headline: 'Rust took over.',
    shift: [
      { label: 'rust', weight: 0.82, direction: 'up', value: '+310%' },
      { label: 'python', weight: 0.26, direction: 'down', value: '−64%' },
    ],
    note: 'Python had led your reading six weeks straight. Not this one.',
    context: [
      { value: '14', label: 'rust posts' },
      { value: '6 wks', label: 'python reign' },
      { value: '2nd', label: 'pivot this year' },
    ],
    standing: { figure: '+310%', label: 'vs last week', scope: 'Rust went from your fourth topic to your first in seven days', pin: 4 },
  },

  'tags.dominant': {
    headline: 'Kubernetes took 63% of your week.',
    percent: 63,
    note: 'Your most single-minded week since March, and twice as focused as the typical developer.',
    context: [
      { value: '29', label: 'k8s posts' },
      { value: '11', label: 'other topics' },
      { value: '3.1h', label: 'reading time' },
    ],
    standing: {
      figure: '2x',
      label: 'The typical developer’s focus',
      scope: 'Most developers’ top topic takes 31% of their week',
      pin: 80,
    },
  },

  'tags.newTerritory': {
    headline: 'You touched WebAssembly for the first time.',
    note: 'Four posts, three sources you had never opened, none of them from your usual feed.',
    context: [
      { value: '4', label: 'first reads' },
      { value: '3', label: 'new sources' },
      { value: '0', label: 'before this week' },
    ],
    standing: { figure: '0 → 4', label: 'vs your last four weeks', scope: 'You had never opened a WebAssembly post before Tuesday', pin: 2 },
  },

  'tags.deepDive': {
    value: '9',
    unit: 'posts on distributed systems',
    note: 'Nobody reads nine posts on one subject by accident.',
    context: [
      { value: '2.4h', label: 'on this alone' },
      { value: '5', label: 'sources' },
      { value: '1', label: 'bookmarked' },
    ],
    standing: {
      figure: 'Top 8%',
      label: 'Depth on one topic',
      scope: 'Most people never go past three posts on a single subject',
      pin: 8,
    },
  },

  'tags.tierList': {
    headline: 'Somebody has to say it.',
    rows: [
      { label: 'kubernetes', value: 'S', weight: 1 },
      { label: 'rust', value: 'A', weight: 0.74 },
      { label: 'postgres', value: 'B', weight: 0.46 },
      { label: 'react', value: 'C', weight: 0.18, muted: true },
    ],
    note: 'Ranked by the hours you actually gave them, not what you would claim.',
    standing: { figure: 'S → A', label: 'Rust, vs last week', scope: 'Up one tier on your own ladder; Kubernetes held S', pin: 20 },
  },

  'source.obscurity': {
    headline: 'Your sources are more obscure than 91% of developers.',
    rows: [
      { label: 'ACM Queue', value: 'read by 3.1k', weight: 0.9 },
      { label: 'kernel mailing list', value: 'read by 412', weight: 1 },
      { label: 'The Pragmatic Engineer', value: 'read by 190k', weight: 0.2, muted: true },
    ],
    note: 'Two thirds of what you read this week, almost nobody else opened.',
    standing: {
      figure: 'Top 9%',
      label: 'Source obscurity',
      scope: 'You read further from the front page than 91% of developers',
      pin: 9,
    },
  },

  'reading.grid': {
    headline: 'Your week, topic by day.',
    matrix: {
      cols: 7,
      cells: [0, 1, 1, 3, 2, 1, 1, 0, 0, 2, 1, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
      palette: ['rgba(255,255,255,0.07)', '#29D8E522', '#29D8E555', '#29D8E599', '#29D8E5'],
    },
    note: 'Six topics down, Monday to Sunday across. The darker the cell, the more you read.',
    context: [
      { value: '42', label: 'cells' },
      { value: 'Tue', label: 'busiest day' },
      { value: 'k8s', label: 'busiest row' },
    ],
    standing: { figure: '2.4x', label: 'Tuesday vs your average', scope: 'Your busiest day carried a third of the week', pin: 30 },
  },

  'reading.skyline': {
    headline: 'No two of these are alike.',
    towers: [
      { label: 'k8s', lit: 10, total: 12 },
      { label: 'rust', lit: 7, total: 12 },
      { label: 'pg', lit: 4, total: 12 },
      { label: 'go', lit: 6, total: 12 },
      { label: 'wasm', lit: 3, total: 12 },
      { label: 'ai', lit: 5, total: 12 },
    ],
    note: 'Every lit window is a post you finished. The shape is yours alone.',
    context: [
      { value: '1 in 40k', label: 'this shape' },
      { value: '35', label: 'lit windows' },
      { value: '6', label: 'topics' },
    ],
    standing: { figure: '1 in 40k', label: 'This shape', scope: 'Nobody else on daily.dev drew this skyline this week', pin: 1 },
  },

  'streak.moment': {
    flame: { count: '37', tier: StreakTier.Inferno, label: 'Inferno' },
    unit: 'days unbroken · Inferno',
    note: 'Twenty three days from Scorcher, and you have never been past 31 before.',
    context: [
      { value: '31', label: 'previous best' },
      { value: '23', label: 'to Scorcher' },
      { value: '2', label: 'freezes banked' },
    ],
    standing: {
      figure: 'Top 4%',
      label: 'Streak length',
      scope: '96% of developers never get past three weeks',
      pin: 4,
    },
  },

  'streak.personalBest': {
    headline: 'Inferno. Your longest streak ever.',
    note: 'You beat April by six days, through a week you nearly dropped on Thursday.',
    context: [
      { value: '37', label: 'days now' },
      { value: '31', label: 'old record' },
      { value: 'Apr 14', label: 'set previously' },
    ],
    standing: { figure: '+6', label: 'vs your April record', scope: 'Your old best was 31. This is 37 and counting', pin: 15 },
  },

  'streak.saved': {
    headline: 'Saved at 11:52pm. Eight minutes to spare.',
    flame: { count: '', tier: StreakTier.Inferno, label: 'Inferno held' },
    days: week('111x111'),
    note: 'One post at 11:52pm kept a 37-day streak alive.',
    context: [
      { value: '11:52pm', label: 'the save' },
      { value: '37', label: 'days kept' },
    ],
  },

  'rhythm.perfectWeek': {
    headline: 'Seven for seven.',
    flame: { count: '', tier: StreakTier.Inferno, label: 'Inferno · day 37' },
    days: week('1111111'),
    note: 'Every day, including the weekend, which is where almost everyone drops one.',
    context: [
      { value: '7 / 7', label: 'days' },
      { value: '3rd', label: 'perfect week' },
      { value: '+120', label: 'bonus XP' },
    ],
    standing: {
      figure: '4%',
      label: 'Of all weeks',
      scope: 'Four in a hundred weeks look like this',
      pin: 4,
    },
  },

  'rhythm.peak': {
    headline: '1am. Four nights running.',
    note: 'Still reading past 1am on four nights. Your earliest read all week was 11:40pm.',
    context: [
      { value: '1:14am', label: 'median' },
      { value: '4', label: 'nights past 1am' },
      { value: '11:40pm', label: 'earliest' },
    ],
    standing: { figure: '1am', label: 'Your peak vs everyone’s', scope: 'daily.dev peaks at 9am. You peak six hours after most people are asleep', pin: 6 },
  },

  'bookmarks.backlog': {
    charm: 'readLater',
    headline: 'Silent Archivist.',
    split: [
      { figure: '14', label: 'saved' },
      { figure: '4', label: 'reactions' },
    ],
    note: 'Fourteen saves, four upvotes. You are building a library, not a feed.',
    context: [
      { value: '61', label: 'in your library' },
      { value: '8', label: 'topics saved' },
    ],
    standing: { figure: '3.5x', label: 'Saves per reaction', scope: 'Most developers save one post for every four they upvote', pin: 86 },
  },

  'posts.top': {
    value: '4,218',
    unit: 'people saw it',
    note: 'Your post on Postgres connection pooling, shared Tuesday morning.',
    context: [
      { value: '63', label: 'upvotes' },
      { value: '11', label: 'comments' },
      { value: '+38', label: 'reputation' },
    ],
    people: [personBy('simonw'), personBy('antirez'), personBy('jessfraz')],
    peopleMore: 9,
    peopleNote: 'Twelve people you follow upvoted it.',
    standing: { figure: 'Top 3%', label: 'Of posts this week', scope: 'More views than 97% of the 1,666 posts published this week', pin: 3 },
  },

  'posts.firstTraction': {
    headline: 'Your first post to break 50 upvotes.',
    note: 'Sixty-three upvotes, eleven comments, and someone asked to reprint it.',
    context: [
      { value: '63', label: 'upvotes' },
      { value: '4,218', label: 'impressions' },
      { value: '17', label: 'posts before' },
    ],
    standing: {
      figure: 'Top 9%',
      label: 'Of posts this week',
      scope: 'Nine in ten posts never reach fifty upvotes',
      pin: 9,
    },
  },

  'achievement.unlocked': {
    badge: {
      medal: { imageUrl: asset.privilegesUnlocked, rarityPct: 0.9 },
      name: 'Deep Diver',
      rarity: 'Emerald · held by 0.9% of developers',
    },
    note: 'Ten posts on a single topic inside one week. You did it in six days.',
    context: [
      { value: '3%', label: 'hold this' },
      { value: '12', label: 'you now own' },
      { value: '+250', label: 'XP' },
    ],
    standing: { figure: '0.9%', label: 'Hold this', scope: 'Emerald tier: fewer than one developer in a hundred has Deep Diver', pin: 1 },
  },

  'achievement.nextUp': {
    headline: 'Two posts from Deep Diver.',
    progress: { current: 8, target: 10, label: 'Deep Diver', reward: '+250 XP on unlock' },
    note: 'You have been at eight for three days. Two more and it is yours.',
  },

  'quests.cleared': {
    badge: { icon: 'sparkle', name: 'Every weekly quest, cleared', rarity: '+240 XP' },
    note: 'Seven of seven, with a day to spare. The rotation resets Monday.',
    context: [
      { value: '7 / 7', label: 'cleared' },
      { value: '5 wks', label: 'in a row' },
      { value: '+240', label: 'XP' },
    ],
  },

  'quests.progress': {
    headline: 'Five of seven.',
    progress: { current: 5, target: 7, label: 'Quests cleared', reward: '+240 XP for all seven' },
    note: 'Two left, and both of them are things you were going to do anyway.',
  },

  'crown.topReader': {
    badge: {
      medal: { imageUrl: avatarFor(ME, 256), rarityPct: 3 },
      name: 'Top reader in Kubernetes',
      rarity: 'Week 37 · one per topic',
    },
    note: 'Out of 12,400 people reading Kubernetes this week, the badge went to you.',
    context: [
      { value: '12,400', label: 'competing' },
      { value: '2nd', label: 'time earned' },
      { value: '1st', label: 'your rank' },
    ],
    standingFrom: { rank: 1, pool: 12400, group: 'Kubernetes readers' },
  },

  'rank.topicReader': {
    headline: 'Top 2% of Kubernetes readers.',
    note: 'Across everyone on daily.dev who opened anything about Kubernetes this week.',
    context: [
      { value: '29', label: 'posts read' },
      { value: '↑ 4%', label: 'since last week' },
      { value: '12,400', label: 'readers' },
    ],
    standingFrom: { rank: 248, pool: 12400, group: 'Kubernetes readers' },
    standing: {
      figure: '#248',
      label: 'Your position',
      scope: 'Out of 12,400 Kubernetes readers this week',
      pin: 2,
    },
  },

  'rank.overtake': {
    value: '340',
    unit: 'developers passed this week',
    note: 'The biggest single-week climb you have had since you joined.',
    people: [personBy('cassidoo'), personBy('bradfitz'), personBy('ashleymcnamara')],
    peopleMore: 337,
    peopleNote: 'Three of them are people you follow.',
    standing: {
      figure: '#1,284',
      label: 'Overall rank',
      scope: 'Up from #1,624 last Monday',
      pin: 12,
    },
  },

  'community.podium': {
    headline: 'Third for longest streak.',
    podium: [
      { rank: 2, person: personBy('lydiahallie'), height: 58, value: '2nd' },
      { rank: 1, person: personBy('kelseyhightower'), height: 82, value: '1st' },
      { rank: 3, person: ME, isYou: true, height: 44, value: '3rd' },
    ],
    note: 'The top three have held for eleven days. You are four days off second.',
    context: [
      { value: '37', label: 'your streak' },
      { value: '41', label: 'to take 2nd' },
      { value: '11 d', label: 'podium held' },
    ],
    standing: { figure: '3rd', label: 'Longest streak', scope: 'Four days behind second, eleven ahead of fourth', pin: 3 },
  },

  'community.squad': {
    headline: 'Frontend Guild read 214 posts.',
    rows: [
      { label: 'Nadia', value: '61', weight: 1, person: personBy('lydiahallie') },
      { label: 'Ilya', value: '48', weight: 0.79, person: personBy('mitchellh') },
      { label: 'You', value: '39', weight: 0.64, isYou: true, person: ME },
      { label: 'Marco', value: '31', weight: 0.51, muted: true, person: personBy('bradfitz') },
    ],
    note: 'Nine posts behind second place, with a week to close it.',
  },

  'community.circle': {
    charm: 'inviteFriends',
    headline: 'The six developers you read most.',
    people: [
      personBy('simonw'),
      personBy('kelseyhightower'),
      personBy('jessfraz'),
      personBy('antirez'),
      personBy('karpathy'),
      personBy('cassidoo'),
    ],
    peopleNote: 'Every one of them gets tagged when you post this.',
    context: [
      { value: '38', label: 'of your reads' },
      { value: '6', label: 'people' },
      { value: '4', label: 'follow back' },
    ],
  },

  'community.readAlong': {
    headline: 'Six devs you follow read this too.',
    rows: [
      { label: 'Simon W.', value: 'Mon', weight: 1, person: personBy('simonw') },
      { label: 'Jess F.', value: 'Mon', weight: 0.9, person: personBy('jessfraz') },
      { label: 'Kelsey H.', value: 'Tue', weight: 0.7, person: personBy('kelseyhightower') },
    ],
    note: 'All six opened the Postgres async I/O piece inside two days of each other.',
  },

  'reception.followers': {
    charm: 'emptyProfile',
    value: '12',
    unit: 'developers follow you now',
    note: 'Nine of them found you through the Postgres post.',
    people: [personBy('cassidoo'), personBy('ThePrimeagen'), personBy('sindresorhus')],
    peopleMore: 9,
    peopleNote: 'Your biggest follower week so far.',
    context: [
      { value: '184', label: 'total' },
      { value: '+7%', label: 'this week' },
      { value: '9', label: 'from one post' },
    ],
  },

  'reception.awards': {
    badge: {
      medal: { imageUrl: asset.core, rarityPct: 8 },
      name: 'You were awarded twice',
      rarity: '+400 Cores',
    },
    note: 'Two people spent their own Cores to thank you for the pooling post.',
    people: [personBy('antirez'), personBy('simonw')],
    peopleNote: 'They both left a note with it.',
  },

  'reception.comment': {
    headline: 'You outscored the post.',
    split: [
      { figure: '84', label: 'your comment' },
      { figure: '52', label: 'the post' },
    ],
    note: 'On a thread about connection limits, where you corrected the author.',
    context: [
      { value: '84', label: 'upvotes' },
      { value: '9', label: 'replies' },
      { value: '1st', label: 'in thread' },
    ],
  },

  'topic.coverage': {
    value: '38%',
    unit: 'of every Kubernetes post published this week',
    note: 'Forty-one of a hundred and eight, most of them the day they landed.',
    context: [
      { value: '41', label: 'k8s posts read' },
      { value: '108', label: 'published' },
    ],
    standing: { figure: '9x', label: 'The median Kubernetes reader', scope: 'Most people who read the topic see 4% of it', pin: 90 },
  },
  'feed.verdicts': {
    headline: 'You gave a verdict on one in five posts you opened.',
    split: [
      { figure: '11', label: 'verdicts' },
      { figure: '47', label: 'opened' },
    ],
    note: 'Eleven votes on forty-seven posts. The feed learns faster when you do this.',
    context: [
      { value: '9', label: 'upvotes' },
      { value: '2', label: 'downvotes' },
    ],
    standing: { figure: '4x', label: 'The typical developer', scope: 'Most developers rate one in twenty of what they open', pin: 82 },
  },
  'reading.time': {
    value: '3.1h',
    unit: 'reading this week',
    note: 'Forty-seven posts, four minutes each on average.',
    context: [
      { value: '4 min', label: 'per post' },
      { value: 'Tue', label: 'longest day' },
    ],
    standing: { figure: '4.6x', label: 'The median developer', scope: 'Most developers read for 40 minutes a week', pin: 84 },
  },
  'reading.volume': {
    value: '47',
    unit: 'posts this week',
    note: 'Your second-biggest reading week of the year.',
    context: [
      { value: '6.7', label: 'per day' },
      { value: '+38%', label: 'vs your average' },
    ],
    standing: { figure: '8x', label: 'The median developer', scope: 'Most developers opened six posts this week', pin: 84 },
  },

  'reading.source': {
    headline: 'Source Loyalist.',
    rows: [
      { label: 'ACM Queue', value: '41%', weight: 1 },
      { label: 'Cloudflare Blog', value: '15%', weight: 0.37 },
      { label: 'Julia Evans', value: '11%', weight: 0.27 },
    ],
    note: 'ACM Queue took 41% of your week on its own.',
    standing: { figure: '41%', label: 'From one source', scope: 'The typical developer’s top source takes 18%', pin: 80 },
  },

  'level.up': {
    level: {
      level: 14,
      xpInLevel: 3400,
      xpToNextLevel: 14600,
      title: 'You reached level 14 on Thursday.',
    },
    note: 'Most of it from the quest rotation.',
    context: [
      { value: '3,400', label: 'XP earned' },
      { value: '18,000', label: 'to level 15' },
      { value: '6 d', label: 'to get here' },
    ],
  },

  'selectivity': {
    headline: '1,412 came past. You opened 47.',
    split: [
      { figure: '47', label: 'you opened' },
      { figure: '1,412', label: 'came past you' },
    ],
    note: 'One in thirty. Most people open one in twelve.',
    standing: {
      figure: '3.3%',
      label: 'Open rate',
      scope: 'Most developers open 8% of what reaches them',
      pin: 74,
    },
    context: [
      { value: '3.3%', label: 'open rate' },
      { value: '1,365', label: 'skipped' },
      { value: '29', label: 'never scrolled to' },
    ],
  },

  'xp.earned': {
    level: {
      level: 14,
      xpInLevel: 3400,
      xpToNextLevel: 14600,
      title: 'Top 9% of XP earners this week.',
    },
    context: [
      { value: '3,400', label: 'XP this week' },
      { value: '1,800', label: 'from quests' },
    ],
    standingFrom: { rank: 2100, pool: 24000, group: 'XP earners' },
  },

  'trend.early': {
    headline: 'You were early to two of this week’s three biggest stories.',
    posts: [
      { title: 'Postgres 19 ships async I/O', sourceId: 'postgres', meta: '14h before the median reader', read: true },
      { title: 'Rust in the kernel, one year on', sourceId: 'rust', meta: '9h before the median reader', read: true },
      { title: 'The end of the free CI tier', sourceId: 'pragmatic', meta: 'not opened' },
    ],
    postsLegend: true,
    note: 'Two of three, both before most of daily.dev got there.',
    context: [
      { value: '2 / 3', label: 'read' },
      { value: '14h', label: 'ahead of the median' },
    ],
    standing: { figure: '2 of 3', label: 'The week’s biggest stories', scope: 'Most developers read one of them', pin: 70 },
  },

  'trend.ahead': {
    headline: 'Kubernetes spiked 40% across daily.dev. You were already there.',
    shift: [
      { label: 'daily.dev this week', weight: 0.88, direction: 'up', value: '+40%' },
      { label: 'your week', weight: 0.63, direction: 'up', value: '63%' },
    ],
    note: 'Everyone arrived this week. You have been reading it since August.',
    context: [
      { value: '63%', label: 'of your week' },
      { value: 'Aug', label: 'since' },
    ],
    standing: { figure: '63%', label: 'Of your week, before the spike', scope: 'The average developer went from 3% to 5% of theirs', pin: 88 },
  },

  'streak.nudge': {
    headline: 'Three days from Inferno.',
    flame: { count: '', tier: StreakTier.Firestorm, label: 'Firestorm · day 27' },
    days: week('1111000'),
    note: 'Day thirty is Inferno, and it banks a freeze you can spend on a week you miss.',
    context: [
      { value: '27', label: 'days now' },
      { value: '3', label: 'to Inferno' },
      { value: '+1', label: 'freeze at 30' },
    ],
  },

  'away.missed': {
    headline: 'Eleven days. The feed kept going.',
    split: [
      { figure: '214', label: 'posts in your tags' },
      { figure: '11', label: 'days away' },
    ],
    note: 'Nineteen of them were about Kubernetes, which is where you left off.',
    context: [
      { value: '214', label: 'waiting' },
      { value: '19', label: 'on your topic' },
      { value: '3', label: 'from people you follow' },
    ],
  },

  'away.streakLost': {
    flame: { count: '22', lost: true },
    unit: 'days, ended on the 4th · Firestorm lost',
    note: 'Day one again on Monday. Your record is still 31, and Firestorm is recoverable until Sunday.',
    context: [
      { value: '31', label: 'your best' },
      { value: '4 d', label: 'to recover' },
    ],
    standing: { figure: '22 d', label: 'Your last streak', scope: 'The median streak on daily.dev ends on day three', pin: 89 },
  },

  'annual.reign': {
    headline: 'Who won each day of your year.',
    matrix: {
      cols: 52,
      cells: [2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 3, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 2, 1, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 2, 1, 2, 4, 1, 2, 2, 2, 2, 2, 1, 3, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 4, 0, 2, 0, 2, 2, 2, 0, 0, 2, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 2, 0, 1, 0, 2, 0, 0, 0, 1, 2, 0, 0, 0, 0, 1, 1, 0, 0, 2, 0, 1, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 2, 0, 2, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 1, 4, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4, 3, 0, 0, 1, 0],
      palette: ['#D97EFE', '#29D8E5', '#4A7EEE', '#FF9157', '#57E087'],
      legend: [{label: 'ai', colour: '#D97EFE'}, {label: 'typescript', colour: '#29D8E5'}, {label: 'react', colour: '#4A7EEE'}, {label: 'rust', colour: '#FF9157'}, {label: 'devops', colour: '#57E087'}],
    },
    note: 'Kubernetes held 141 days of the year. Nothing else got past sixty.',
    context: [
      { value: '141', label: 'k8s days' },
      { value: '312', label: 'days read' },
      { value: '19', label: 'topics' },
    ],
    standing: { figure: '141', label: 'Days Kubernetes won', scope: 'Nothing else took more than sixty', pin: 40 },
  },

  'annual.devCircle': {
    headline: 'The developers who shaped it.',
    people: [
      personBy('simonw'),
      personBy('kelseyhightower'),
      personBy('jessfraz'),
      personBy('antirez'),
      personBy('karpathy'),
      personBy('cassidoo'),
      personBy('lydiahallie'),
    ],
    peopleMore: 30,
    peopleNote: 'Thirty-seven people, every one of them tagged when you post this.',
  },

  'annual.readingDna': {
    headline: 'One strand, yours only.',
    towers: [
      { label: 'q1', lit: 9, total: 15 },
      { label: 'q2', lit: 12, total: 15 },
      { label: 'q3', lit: 7, total: 15 },
      { label: 'q4', lit: 14, total: 15 },
    ],
    note: 'Generated from every day you read and the sources you read them from.',
    context: [
      { value: '1 in 2M', label: 'this pattern' },
      { value: '312', label: 'days lit' },
      { value: '84', label: 'sources' },
    ],
    standing: { figure: '1 in 2M', label: 'This pattern', scope: 'Generated from every day you read and every source you read from', pin: 1 },
  },

  'annual.iceberg': {
    headline: 'Most of your sources are below the line.',
    rows: [
      { label: 'Hacker News', value: 'surface', weight: 0.2, muted: true },
      { label: 'ACM Queue', value: 'deep', weight: 0.62 },
      { label: 'kernel mailing list', value: 'abyssal', weight: 0.95 },
    ],
    note: 'Two thirds of what you read this year, almost nobody else opened.',
    standing: {
      figure: 'Top 1%',
      label: 'Source obscurity',
      scope: 'You read further from the front page than 99% of developers',
      pin: 1,
    },
  },

  // Creator loop.
  'creator.reach': {
    value: '18,420',
    unit: 'developers read your post',
    note: '"Stop using useEffect for data fetching". Top 1% of posts this week.',
    context: [
      { value: '842', label: 'upvotes' },
      { value: '3.1x', label: 'your last post' },
      { value: '23', label: 'comments' },
    ],
    cta: 'Join the discussion  →',
    standing: { figure: 'Top 1%', label: 'Of posts this week', scope: 'Reach higher than 99% of the 1,666 posts published on daily.dev this week', pin: 1 },
  },

  'creator.companies': {
    headline: 'Developers at these companies read your post.',
    chips: [
      'Google',
      'Vercel',
      'Shopify',
      'Stripe',
      'Datadog',
      'Postman',
      'Cloudflare',
      'Netflix',
      'Atlassian',
    ],
    chipsMore: '+ 400 more companies',
    note: 'Nobody else can tell a writer this, because nobody else sits across every source at once.',
    standing: { figure: 'Top 8%', label: 'Company spread', scope: 'Read at more companies than 92% of posts this week', pin: 8 },
  },

  'creator.unreadThread': {
    headline: '23 comments on your post. 96% of posts get none.',
    note: 'Twenty three comments and two camps. You are not in the room yet.',
    quotes: [
      {
        who: 'Dana R.',
        text: 'This is the first take on useEffect that actually explains the "why". Bookmarking for my team.',
        score: '128',
        person: personBy('lydiahallie'),
      },
      {
        who: 'Miguel K.',
        text: 'Hard disagree on point 3. Suspense boundaries solve this without a library.',
        score: '94',
        person: personBy('antirez'),
      },
    ],
    cta: 'Jump into the thread  →',
    standing: { figure: 'Top 4%', label: 'Of posts by comments this week', scope: 'Out of 3,120 posts published, 96% got no comment at all', pin: 4 },
  },

  'creator.beatTheRoom': {
    headline: 'Your post beat the Rust median by 4x.',
    rows: [
      { label: '"Why we rewrote our parser in Rust"', value: '842', weight: 1, isYou: true },
      { label: 'Rust median this week', value: '211', weight: 0.25, muted: true },
    ],
    note: 'Out of 214 Rust posts published on daily.dev last week. Rivals are not named.',
    standing: { figure: '4x', label: 'vs the Rust median', scope: 'The median Rust post this week got 211 upvotes. Yours got 842', pin: 2 },
  },

  'creator.alsoRead': {
    headline: 'Your readers are 3x more likely to read Rust than the average developer.',
    posts: [
      { title: 'The React compiler changes this', sourceId: 'vercel', meta: '61% of your readers' },
      { title: 'Suspense boundaries in practice', sourceId: 'jvns', meta: '44% of your readers' },
      { title: 'Why your effects run twice', sourceId: 'github', meta: '38% of your readers' },
    ],
    note: 'The company you keep on someone else’s reading list.',
    standing: { figure: '3x', label: 'Your readers vs everyone', scope: 'Rust is 4% of the average feed and 12% of theirs', pin: 85 },
  },

  'creator.firstReader': {
    headline: 'Stripe opened it first. 31 reads in the first hour.',
    note: 'Then Vercel, then Google, all inside the first hour.',
    context: [
      { value: '4 min', label: 'to first read' },
      { value: '9', label: 'companies' },
    ],
    standing: { figure: '3x', label: 'The median first hour', scope: 'Most posts get ten reads in their first hour', pin: 80 },
  },

  'creator.secondLife': {
    value: '340',
    unit: 'reads on a post from March',
    note: '"A practical guide to connection pooling" is still finding people seven months on.',
    context: [
      { value: '4,918', label: 'reads all time' },
      { value: '#2', label: 'your best ever' },
      { value: '7 mo', label: 'since publishing' },
    ],
    standing: { figure: '3.1x', label: 'vs its weekly average', scope: 'Seven months old and its best week since March', pin: 10 },
  },

  // Frame one. The totals live here so none of them needs a card, and the
  // count opens the gap without saying what is in it.
  opener: {
    heroArt: true,
    headline: "Let's look at your week.",
    tiles: [
      { figure: '47', label: 'posts read' },
      { figure: '3.1h', label: 'reading time' },
      { figure: '6', label: 'topics' },
      { figure: '37', label: 'day streak' },
    ],
    lead: 'Five things happened that you probably do not know about.',
    momentCount: 5,
  },

  // The last frame. Turns the attention the recap just earned towards the
  // week in front of them instead of dropping them back into a feed.
  handoff: {
    headline: 'That was week 37.',
    note: 'Next Replay lands Monday. The card you liked most travels better today than it will next week.',
    cta: 'Copy your best card  →',
  },

  'missed.comment': {
    charm: 'noComments',
    headline: 'The best comment on a post you read.',
    rows: [
      {
        label: '"The benchmark is measuring the page cache, not the I/O path."',
        value: '84',
        person: personBy('antirez'),
      },
    ],
    note: 'On the Postgres async I/O post you read on Tuesday. It outscored the post itself, and it went up four hours after you left.',
    context: [
      { value: '84', label: 'upvotes' },
      { value: '11', label: 'replies' },
      { value: '4h', label: 'after you left' },
    ],
  },

  'missed.story': {
    headline: 'The one Kubernetes story you skipped.',
    posts: [
      {
        title: 'The kubelet change nobody announced',
        sourceId: 'kubernetes',
        meta: '2,140 readers · 6 min',
      },
      {
        title: 'Why your probes are lying to you',
        sourceId: 'cloudflare',
        meta: 'you read this Tuesday',
        read: true,
      },
    ],
    postsLegend: true,
    note: 'It was the most-read Kubernetes post of the week, and it never made it into your feed session.',
    context: [
      { value: '2,140', label: 'readers' },
      { value: '#1', label: 'in kubernetes' },
      { value: '6 min', label: 'read time' },
    ],
    standing: {
      figure: '94%',
      label: 'Of Kubernetes readers',
      scope: 'Opened it. You are in the 6% who did not.',
      pin: 94,
    },
  },

  'missed.reply': {
    headline: 'Someone replied. You never came back.',
    rows: [
      {
        label: '"Did you benchmark this against pgbouncer?"',
        value: 'Tue',
        person: personBy('jessfraz'),
      },
      {
        label: '"Same result here on 16.4."',
        value: 'Wed',
        person: personBy('simonw'),
      },
    ],
    note: 'Two replies on your connection pooling post, both from people you follow.',
  },
};

/* -------------------------------------------------------------------------- */
/* People                                                                      */
/* -------------------------------------------------------------------------- */

export interface Profile {
  id: string;
  name: string;
  handle: string;
  /** GitHub login backing the avatar on their frames. */
  login: string;
  /** One line on who this is, shown above their recap in the stories. */
  summary: string;
  mode: Mode;
  /** Candidate id to magnitude. An absent id means the candidate did not fire. */
  signals: Record<string, number>;
  lastShown?: Record<string, number>;
  /** Days since their previous session, for the delivery stories. */
  daysAway: number;
  /** Posts opened this window. Drives the eligibility ladder. */
  opens: number;
  /** Posts that reached their feed. Feeds selectivity. */
  impressions: number;
}

export const profiles: Profile[] = [
  {
    id: 'maya',
    login: 'lydiahallie',
    name: 'Maya Chen',
    handle: '@mayabuilds',
    summary:
      'Reads daily, posts occasionally, 37-day streak. Opened 47 posts. The full deck, with a rare Tier S card firing.',
    mode: Mode.Weekly,
    daysAway: 1,
    opens: 47,
    impressions: 1412,
    signals: {
      'persona.week': 0.9,
      'rank.topicReader': 0.87,
      'crown.topReader': 0.92,
      'achievement.unlocked': 0.85,
      'source.obscurity': 0.78,
      'streak.moment': 0.95,
      'rhythm.perfectWeek': 0.8,
      'tags.dominant': 0.75,
      'tags.shift': 0.85,
      'reading.grid': 0.7,
      'selectivity': 0.8,
      'posts.top': 0.88,
      'community.podium': 0.8,
      'rhythm.peak': 0.5,
    },
    lastShown: { 'streak.moment': 3, 'tags.dominant': 1 },
  },
  {
    id: 'tom',
    login: 'ThePrimeagen',
    name: 'Tom Alvarez',
    handle: '@tomdev',
    summary:
      'Opened three posts across four days, one dominant topic. The reduced deck: this is the median week and the one the engine has to be good at.',
    mode: Mode.Weekly,
    daysAway: 2,
    opens: 3,
    impressions: 640,
    signals: {
      'tags.dominant': 0.68,
      'rhythm.peak': 0.52,
      'reading.grid': 0.55,
      'source.obscurity': 0.6,
      'missed.story': 0.74,
      'streak.saved': 0.6,
    },
    lastShown: { 'tags.dominant': 2 },
  },
  {
    id: 'priya',
    login: 'ashleymcnamara',
    name: 'Priya Raman',
    handle: '@priyar',
    summary:
      'Scrolled the feed on three days, opened nothing. Nothing about her to say and nothing to compare, so no Replay renders.',
    mode: Mode.Weekly,
    daysAway: 3,
    opens: 0,
    impressions: 380,
    signals: {
      'missed.story': 0.7,
      'trend.early': 0.7,
    },
  },
  {
    id: 'jonas',
    login: 'mitchellh',
    name: 'Jonas Weber',
    handle: '@jonasw',
    summary:
      'Was here every day, then vanished for eleven. Came back and opened six posts. Catch-up mode, full deck.',
    mode: Mode.CatchUp,
    daysAway: 11,
    opens: 6,
    impressions: 900,
    signals: {
      'away.missed': 0.8,
      'away.streakLost': 0.75,
      'trend.early': 0.7,
      'tags.dominant': 0.45,
      'persona.week': 0.6,
      'reading.grid': 0.5,
    },
  },
  {
    id: 'noah',
    login: 'bradfitz',
    name: 'Noah Kim',
    handle: '@noahk',
    summary:
      'No activity at all this week. No Replay. An empty recap is worse than none.',
    mode: Mode.Weekly,
    daysAway: 8,
    opens: 0,
    impressions: 0,
    signals: {},
  },
];
