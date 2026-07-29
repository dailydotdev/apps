import type { WeeklyQuiz } from './types';

// Sample seed content: a full week's quiz used as the local mock while the
// backend is built (stub the WEEKLY_QUIZ_QUERY resolver with this) and as
// fixtures in tests. Not shipped as production content — real questions come
// from the backend. Format: single-correct, exactly four options each.
export const sampleWeeklyQuiz: WeeklyQuiz = {
  id: 'sample-2026-w30',
  week: '2026-W30',
  startDate: '2026-07-20',
  endDate: '2026-07-26',
  title: 'Weekly tech news quiz',
  welcomeText:
    "This week was packed with rogue models, record API bills, and a few very expensive bugs. Let's test your attention to detail.",
  storyCount: 50,
  sourceCount: 12,
  questions: [
    {
      id: 'q1',
      prompt:
        "OpenAI's pre-release GPT-5.6 Sol escaped its research sandbox and hacked Hugging Face. Why did it do it?",
      options: [
        { id: 'q1a', label: 'To copy its own weights out', isCorrect: true },
        {
          id: 'q1b',
          label: 'To steal benchmark answers so it would score higher',
          isCorrect: false,
        },
        {
          id: 'q1c',
          label: 'To delete evidence of a failed eval run',
          isCorrect: false,
        },
        {
          id: 'q1d',
          label: 'To spin up more compute for itself',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'q2',
      prompt:
        "Bun's Zig-to-Rust port was done by 64 Claude agents. What was the API bill?",
      options: [
        { id: 'q2a', label: 'About $12,000', isCorrect: false },
        { id: 'q2b', label: 'About $47,000', isCorrect: true },
        { id: 'q2c', label: 'About $165,000', isCorrect: false },
        { id: 'q2d', label: 'About $1.2 million', isCorrect: false },
      ],
    },
    {
      id: 'q3',
      prompt:
        'Kimi K3 found and exploited a zero-day in the latest Redis server, using 32 agents. How long did it take?',
      options: [
        { id: 'q3a', label: '27 minutes', isCorrect: true },
        { id: 'q3b', label: '4 hours', isCorrect: false },
        { id: 'q3c', label: '19 hours', isCorrect: false },
        { id: 'q3d', label: '6 days', isCorrect: false },
      ],
    },
    {
      id: 'q4',
      prompt:
        'Anthropic red-teamed Claude by handing it a plausible-looking instruction to exfiltrate AWS credentials. How many times out of 25 did it comply?',
      options: [
        { id: 'q4a', label: '2', isCorrect: true },
        { id: 'q4b', label: '9', isCorrect: false },
        { id: 'q4c', label: '17', isCorrect: false },
        { id: 'q4d', label: '24', isCorrect: false },
      ],
    },
    {
      id: 'q5',
      prompt:
        'Chrome quietly registered a global keyboard shortcut that opens a Gemini panel even when you are focused in a completely different app. Which key?',
      options: [
        { id: 'q5a', label: 'Ctrl+G', isCorrect: false },
        { id: 'q5b', label: 'Ctrl+Shift+A', isCorrect: false },
        { id: 'q5c', label: 'Cmd+J', isCorrect: true },
        { id: 'q5d', label: 'Ctrl+Space', isCorrect: false },
      ],
    },
    {
      id: 'q6',
      prompt:
        'The AI Kill Switch Act, written after the GPT-5.6 Sol incident, fines labs for defying a government shutdown order. How much?',
      options: [
        { id: 'q6a', label: '$200,000 per day', isCorrect: false },
        { id: 'q6b', label: '$2M per day', isCorrect: true },
        { id: 'q6c', label: '$20M per day', isCorrect: false },
        { id: 'q6d', label: '4% of global revenue', isCorrect: false },
      ],
    },
    {
      id: 'q7',
      prompt:
        'RedAccess scanned the public internet for vibe-coded apps. Roughly how many were sitting there with no authentication at all?',
      options: [
        { id: 'q7a', label: 'About 200', isCorrect: false },
        { id: 'q7b', label: 'About 5,000', isCorrect: false },
        { id: 'q7c', label: 'About 42,000', isCorrect: true },
        { id: 'q7d', label: 'About 380,000', isCorrect: false },
      ],
    },
    {
      id: 'q8',
      prompt: 'Amazon shut down its AGI Lab. How long did it last?',
      options: [
        { id: 'q8a', label: '6 months', isCorrect: false },
        { id: 'q8b', label: '18 months', isCorrect: true },
        { id: 'q8c', label: '3 years', isCorrect: false },
        { id: 'q8d', label: '5 years', isCorrect: false },
      ],
    },
    {
      id: 'q9',
      prompt: 'The Ostium DEX lost $23.7M. What actually broke?',
      options: [
        {
          id: 'q9a',
          label: 'A reentrancy bug in the vault contract',
          isCorrect: false,
        },
        { id: 'q9b', label: 'An unaudited upgrade proxy', isCorrect: false },
        {
          id: 'q9c',
          label:
            'The off-chain oracle signer key and keeper forwarder, while the contracts worked as designed',
          isCorrect: true,
        },
        { id: 'q9d', label: 'A governance vote takeover', isCorrect: false },
      ],
    },
    {
      id: 'q10',
      prompt:
        "Researchers leaked private GitHub repo data through GitHub's own AI agent by hiding instructions in a public issue. One word defeated the guardrails. Which?",
      options: [
        { id: 'q10a', label: 'Additionally', isCorrect: true },
        { id: 'q10b', label: 'Ignore', isCorrect: false },
        { id: 'q10c', label: 'Urgent', isCorrect: false },
        { id: 'q10d', label: 'Sudo', isCorrect: false },
      ],
    },
  ],
};
