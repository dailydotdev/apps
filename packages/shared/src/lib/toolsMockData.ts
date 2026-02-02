export interface SentimentDataPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface MockPost {
  id: string;
  title: string;
  source: string;
  date: string;
  upvotes: number;
  comments: number;
}

export interface MockComment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  upvotes: number;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  description: string;
  image: string;
  upvotes: number;
  children: Tool[];
  sentimentData: SentimentDataPoint[];
  relatedPosts: MockPost[];
  comments: MockComment[];
}

const generateSentimentData = (
  basePositive: number,
  baseNegative: number,
  baseNeutral: number,
): SentimentDataPoint[] => {
  const now = new Date();

  return Array.from({ length: 30 }, (_, index) => {
    const dayOffset = 29 - index;
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);

    const variance = () => Math.floor(Math.random() * 20) - 10;
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      positive: Math.max(0, basePositive + variance()),
      negative: Math.max(0, baseNegative + variance()),
      neutral: Math.max(0, baseNeutral + variance()),
    };
  });
};

const generateMockPosts = (toolName: string): MockPost[] => [
  {
    id: '1',
    title: `Getting Started with ${toolName}: A Comprehensive Guide`,
    source: 'Dev.to',
    date: '2024-01-15',
    upvotes: 342,
    comments: 45,
  },
  {
    id: '2',
    title: `${toolName} vs Competitors: An In-Depth Comparison`,
    source: 'Medium',
    date: '2024-01-12',
    upvotes: 256,
    comments: 78,
  },
  {
    id: '3',
    title: `10 Things I Wish I Knew Before Using ${toolName}`,
    source: 'Hacker News',
    date: '2024-01-10',
    upvotes: 189,
    comments: 34,
  },
  {
    id: '4',
    title: `Building Production Apps with ${toolName}`,
    source: 'daily.dev',
    date: '2024-01-08',
    upvotes: 421,
    comments: 92,
  },
];

const generateMockComments = (): MockComment[] => [
  {
    id: 'c1',
    userId: 'u1',
    username: 'techdev42',
    avatar: 'https://avatar.vercel.sh/techdev42',
    content:
      'This tool has completely changed my workflow. Highly recommend it!',
    timestamp: '2024-01-15T10:30:00Z',
    upvotes: 24,
  },
  {
    id: 'c2',
    userId: 'u2',
    username: 'airesearcher',
    avatar: 'https://avatar.vercel.sh/airesearcher',
    content:
      "I've been using this for 3 months now. The recent updates are impressive.",
    timestamp: '2024-01-14T15:45:00Z',
    upvotes: 18,
  },
  {
    id: 'c3',
    userId: 'u3',
    username: 'devops_ninja',
    avatar: 'https://avatar.vercel.sh/devops_ninja',
    content:
      'Great for prototyping, but I found some edge cases that need work.',
    timestamp: '2024-01-13T09:20:00Z',
    upvotes: 12,
  },
];

export const mockTools: Tool[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    slug: 'anthropic',
    parentSlug: null,
    description:
      'AI safety company building reliable, interpretable, and steerable AI systems.',
    image: 'https://img.icons8.com/color/96/anthropic.png',
    upvotes: 15420,
    sentimentData: generateSentimentData(85, 8, 45),
    relatedPosts: generateMockPosts('Anthropic'),
    comments: generateMockComments(),
    children: [
      {
        id: 'anthropic-claude',
        name: 'Claude',
        slug: 'anthropic/claude',
        parentSlug: 'anthropic',
        description:
          'AI assistant trained by Anthropic to be helpful, harmless, and honest.',
        image: 'https://img.icons8.com/color/96/anthropic.png',
        upvotes: 12350,
        sentimentData: generateSentimentData(90, 5, 40),
        relatedPosts: generateMockPosts('Claude'),
        comments: generateMockComments(),
        children: [
          {
            id: 'anthropic-claude-opus-4-5',
            name: 'Opus 4.5',
            slug: 'anthropic/claude/opus-4-5',
            parentSlug: 'anthropic/claude',
            description:
              "Anthropic's most capable model with extended thinking abilities.",
            image: 'https://img.icons8.com/color/96/anthropic.png',
            upvotes: 8920,
            sentimentData: generateSentimentData(92, 3, 35),
            relatedPosts: generateMockPosts('Claude Opus 4.5'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'anthropic-claude-sonnet',
            name: 'Sonnet',
            slug: 'anthropic/claude/sonnet',
            parentSlug: 'anthropic/claude',
            description:
              'Balanced model offering great performance at a lower cost.',
            image: 'https://img.icons8.com/color/96/anthropic.png',
            upvotes: 7650,
            sentimentData: generateSentimentData(88, 6, 42),
            relatedPosts: generateMockPosts('Claude Sonnet'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'anthropic-claude-haiku',
            name: 'Haiku',
            slug: 'anthropic/claude/haiku',
            parentSlug: 'anthropic/claude',
            description:
              'Fast and efficient model for quick tasks and high throughput.',
            image: 'https://img.icons8.com/color/96/anthropic.png',
            upvotes: 5430,
            sentimentData: generateSentimentData(82, 10, 48),
            relatedPosts: generateMockPosts('Claude Haiku'),
            comments: generateMockComments(),
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    slug: 'openai',
    parentSlug: null,
    description:
      'AI research company developing safe artificial general intelligence.',
    image: 'https://img.icons8.com/color/96/chatgpt.png',
    upvotes: 18750,
    sentimentData: generateSentimentData(80, 12, 50),
    relatedPosts: generateMockPosts('OpenAI'),
    comments: generateMockComments(),
    children: [
      {
        id: 'openai-gpt',
        name: 'GPT',
        slug: 'openai/gpt',
        parentSlug: 'openai',
        description:
          'Generative Pre-trained Transformer models for natural language processing.',
        image: 'https://img.icons8.com/color/96/chatgpt.png',
        upvotes: 16200,
        sentimentData: generateSentimentData(78, 14, 52),
        relatedPosts: generateMockPosts('GPT'),
        comments: generateMockComments(),
        children: [
          {
            id: 'openai-gpt-4o',
            name: 'GPT-4o',
            slug: 'openai/gpt/gpt-4o',
            parentSlug: 'openai/gpt',
            description:
              'Multimodal model with vision, audio, and text capabilities.',
            image: 'https://img.icons8.com/color/96/chatgpt.png',
            upvotes: 9870,
            sentimentData: generateSentimentData(85, 8, 45),
            relatedPosts: generateMockPosts('GPT-4o'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'openai-gpt-4',
            name: 'GPT-4',
            slug: 'openai/gpt/gpt-4',
            parentSlug: 'openai/gpt',
            description:
              'Advanced language model with improved reasoning abilities.',
            image: 'https://img.icons8.com/color/96/chatgpt.png',
            upvotes: 12450,
            sentimentData: generateSentimentData(82, 10, 48),
            relatedPosts: generateMockPosts('GPT-4'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'openai-gpt-o1',
            name: 'o1',
            slug: 'openai/gpt/o1',
            parentSlug: 'openai/gpt',
            description:
              'Reasoning-focused model designed for complex problem solving.',
            image: 'https://img.icons8.com/color/96/chatgpt.png',
            upvotes: 7230,
            sentimentData: generateSentimentData(75, 15, 55),
            relatedPosts: generateMockPosts('o1'),
            comments: generateMockComments(),
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    parentSlug: null,
    description:
      'AI research division of Google developing cutting-edge models.',
    image: 'https://img.icons8.com/color/96/google-logo.png',
    upvotes: 14320,
    sentimentData: generateSentimentData(75, 15, 55),
    relatedPosts: generateMockPosts('Google AI'),
    comments: generateMockComments(),
    children: [
      {
        id: 'google-gemini',
        name: 'Gemini',
        slug: 'google/gemini',
        parentSlug: 'google',
        description:
          'Multimodal AI model family built from the ground up for multimodality.',
        image: 'https://img.icons8.com/color/96/google-gemini.png',
        upvotes: 11890,
        sentimentData: generateSentimentData(77, 13, 52),
        relatedPosts: generateMockPosts('Gemini'),
        comments: generateMockComments(),
        children: [
          {
            id: 'google-gemini-ultra',
            name: 'Ultra',
            slug: 'google/gemini/ultra',
            parentSlug: 'google/gemini',
            description:
              "Google's most capable Gemini model for highly complex tasks.",
            image: 'https://img.icons8.com/color/96/google-gemini.png',
            upvotes: 6540,
            sentimentData: generateSentimentData(72, 18, 58),
            relatedPosts: generateMockPosts('Gemini Ultra'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'google-gemini-pro',
            name: 'Pro',
            slug: 'google/gemini/pro',
            parentSlug: 'google/gemini',
            description: 'Best performing model for a wide range of tasks.',
            image: 'https://img.icons8.com/color/96/google-gemini.png',
            upvotes: 8920,
            sentimentData: generateSentimentData(80, 12, 50),
            relatedPosts: generateMockPosts('Gemini Pro'),
            comments: generateMockComments(),
            children: [],
          },
          {
            id: 'google-gemini-flash',
            name: 'Flash',
            slug: 'google/gemini/flash',
            parentSlug: 'google/gemini',
            description: 'Lightweight and fast model optimized for speed.',
            image: 'https://img.icons8.com/color/96/google-gemini.png',
            upvotes: 5670,
            sentimentData: generateSentimentData(78, 14, 52),
            relatedPosts: generateMockPosts('Gemini Flash'),
            comments: generateMockComments(),
            children: [],
          },
        ],
      },
    ],
  },
];

const searchInTools = (tools: Tool[], slug: string): Tool | null => {
  let found: Tool | null = null;
  tools.some((tool) => {
    if (tool.slug === slug) {
      found = tool;
      return true;
    }
    if (tool.children.length > 0) {
      found = searchInTools(tool.children, slug);
      if (found) {
        return true;
      }
    }
    return false;
  });
  return found;
};

export const findToolBySlug = (slug: string): Tool | null => {
  return searchInTools(mockTools, slug);
};

export const getToolPath = (slug: string): Tool[] => {
  const parts = slug.split('/');
  return parts.reduce<{ path: Tool[]; currentSlug: string }>(
    (acc, part) => {
      const nextSlug = acc.currentSlug ? `${acc.currentSlug}/${part}` : part;
      const tool = findToolBySlug(nextSlug);
      if (tool) {
        acc.path.push(tool);
      }
      return { ...acc, currentSlug: nextSlug };
    },
    { path: [], currentSlug: '' },
  ).path;
};

export const getAllTopLevelTools = (): Tool[] => mockTools;
