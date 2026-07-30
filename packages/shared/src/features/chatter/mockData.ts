import type { ArticleChatter } from './types';
import { ChatterPlatform } from './types';

// POC: real captured community-pulse dataset for "GLM 5.2 and the coming AI
// margin collapse" (Martin Alderson). HN exact-URL match (#1, 508 points) + X
// amplification. Replace this with a live query keyed off the post's permalink
// / yggdrasilId when the data source is ready.
export const getMockChatter = (): ArticleChatter => ({
  pulse: {
    verdict:
      'X is calling the top (“the collapse is here”); HN is calling BS on the framing while quietly hunting the cheap plans.',
    stance: 'divided',
    controversyLevel: 'heated',
    totalVoices: 900,
    momentum: 'rising',
    overallSplit: { agree: 48, mixed: 30, disagree: 22 },
    perPlatform: [
      {
        platform: ChatterPlatform.HackerNews,
        read: 'Skeptical of the hype, deep in the weeds',
        split: { agree: 40, mixed: 33, disagree: 27 },
      },
      {
        platform: ChatterPlatform.X,
        read: 'Declaring victory for open weights',
        split: { agree: 66, mixed: 22, disagree: 12 },
      },
    ],
    contention: [
      'Is GLM 5.2 actually frontier, or just cheap? (HN says not close to Opus; X says GPT-5-class)',
      '“The collapse is here” vs. “this has been AI news every single day”',
      'Are frontier labs doomed, or does speed (Cerebras) become the new moat?',
    ],
    highlights: [
      {
        kind: 'the-bull-case',
        text: 'The AI margin collapse has already started. GLM 5.2 just dropped, a 7MB embedding model runs fully in your browser. 2026 is the year API access stops being a moat.',
        who: '@alsamahi (X)',
      },
      {
        kind: 'the-skeptic',
        text: '“The least understood shift in AI economics” — then proceeds to talk about something that’s in the AI news every day. By no measure is GLM 5.2 as good as Opus.',
        who: 'budsniffer952 (HN)',
      },
      {
        kind: 'the-tell',
        text: 'Somehow no one talks about LLM speed. — The whole top thread then pivots from cost to Cerebras and tokens/sec: speed may be the next moat.',
        who: 'copperx → tough → LoganDark (HN)',
      },
      {
        kind: 'the-receipt',
        text: 'I switched to the yearly Cline pass because it was too cheap haha — $6 a month, planning to mostly run DeepSeek v4 flash.',
        who: 'zackify (HN)',
      },
    ],
    bottomLine:
      'The thesis isn’t controversial — cheap open weights squeeze margins, everyone knows it. The fault line is the read: X treats GLM 5.2 as the moment API access stopped being a moat, while HN’s most-engaged replies think the post oversells a slow, already-obvious trend and quietly redirects the debate to the thing nobody benchmarks — raw inference speed.',
  },
  sources: [
    {
      platform: ChatterPlatform.HackerNews,
      heading: 'Hacker News · #1 on the front page',
      subtitle: 'exact URL match · 508 points',
      stats: [
        { label: 'points', value: '508' },
        { label: 'comments', value: '307' },
      ],
      mood: 'HN is skeptical of the framing.',
      moodTone: 'split',
      summary:
        'Deep in the weeds and unconvinced by the headline — the most-engaged replies argue the post oversells an already-obvious trend, then pivot the debate from cost to raw inference speed (Cerebras, tokens/sec).',
      sourceUrl: 'https://news.ycombinator.com/item?id=48809877',
      sourceLabel: 'Open discussion on Hacker News',
      defaultOpen: true,
      comments: [
        {
          id: 'hn1',
          author: 'budsniffer952',
          avatar: '#ff6600',
          timeAgo: 'recent',
          text: '“The least understood upcoming shift in AI economics” — then proceeds to talk about something that’s in the AI news every single day. By no measure is GLM 5.2 as good as Opus. Yes, open models pressure margins… eventually.',
        },
        {
          id: 'hn2',
          author: 'copperx',
          avatar: '#ff8a3d',
          timeAgo: 'recent',
          text: 'Somehow no one talks about LLM speed. [the thread pivots to Cerebras and tokens/sec — speed may be the next moat]',
        },
        {
          id: 'hn3',
          author: 'zackify',
          avatar: '#9a5a2a',
          timeAgo: 'recent',
          text: 'I switched to the yearly Cline pass because it was too cheap haha — $6 a month, planning to mostly run DeepSeek v4 flash.',
        },
      ],
    },
    {
      platform: ChatterPlatform.X,
      heading: 'X · widely shared',
      subtitle: 'mostly bullish',
      stats: [
        { label: 'sentiment', value: '66% pos' },
        { label: 'framing', value: 'collapse is here' },
      ],
      mood: 'X is declaring victory for open weights.',
      moodTone: 'mixed',
      summary:
        'Reframed as a milestone: GLM 5.2 is “the moment API access stops being a moat.” Amplified widely with little pushback.',
      sourceUrl: 'https://x.com/search?q=AI%20margin%20collapse%20GLM',
      sourceLabel: 'See posts on X',
      comments: [
        {
          id: 'x1',
          author: 'alsamahi',
          handle: '@alsamahi',
          avatar: 'linear-gradient(135deg,#1d9bf0,#0f6fb8)',
          timeAgo: 'recent',
          text: 'The AI margin collapse has already started. GLM 5.2 just dropped, a 7MB embedding model runs fully in your browser. 2026 is the year API access stops being a moat.',
        },
      ],
    },
  ],
});
