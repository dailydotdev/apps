import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { GraduationIcon } from '@dailydotdev/shared/src/components/icons/Graduation';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { DiscordIcon } from '@dailydotdev/shared/src/components/icons/Discord';
import { RedditIcon } from '@dailydotdev/shared/src/components/icons/Reddit';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { DownloadIcon } from '@dailydotdev/shared/src/components/icons/Download';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { AlertIcon } from '@dailydotdev/shared/src/components/icons/Alert';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import type {
  LeafPageData,
  Manifest,
  ManifestEntry,
  Prompt,
  RecommendedPath,
} from '../../data/learn-to-code/types';
import type { DynamicSeoProps } from '../../components/common';
import manifest from '../../data/learn-to-code/manifest.json';

/* ═══ Helpers ═══ */

function ForceListMode({ children }: { children: ReactNode }): ReactElement {
  const settings = useContext(SettingsContext);
  return (
    <SettingsContext.Provider value={{ ...settings, insaneMode: true }}>
      {children}
    </SettingsContext.Provider>
  );
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  'claude-code': 'Claude Code',
  generic: 'Any AI Tool',
};
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  stretch: 'Stretch',
};
const DIFFICULTY_COLORS: Record<
  string,
  { bg: string; text: string; left: string }
> = {
  beginner: {
    bg: 'bg-accent-avocado-subtlest',
    text: 'text-accent-avocado-default',
    left: 'border-l-accent-avocado-default',
  },
  intermediate: {
    bg: 'bg-accent-cheese-subtlest',
    text: 'text-accent-cheese-default',
    left: 'border-l-accent-cheese-default',
  },
  stretch: {
    bg: 'bg-accent-onion-subtlest',
    text: 'text-accent-onion-default',
    left: 'border-l-accent-onion-default',
  },
};
const RESOURCE_TYPE_ICONS: Record<string, ReactElement> = {
  video: <PlayIcon size={IconSize.XSmall} className="text-text-tertiary" />,
  article: <DocsIcon size={IconSize.XSmall} className="text-text-tertiary" />,
  course: (
    <GraduationIcon size={IconSize.XSmall} className="text-text-tertiary" />
  ),
  docs: <BookmarkIcon size={IconSize.XSmall} className="text-text-tertiary" />,
};
const PLATFORM_ICONS: Record<string, ReactElement> = {
  reddit: <RedditIcon size={IconSize.Small} className="text-text-tertiary" />,
  discord: <DiscordIcon size={IconSize.Small} className="text-text-tertiary" />,
  dailydev: (
    <GraduationIcon size={IconSize.Small} className="text-text-tertiary" />
  ),
  other: <EarthIcon size={IconSize.Small} className="text-text-tertiary" />,
};

const DEFAULT_PREREQUISITES: string[] = [
  'A laptop or desktop computer',
  'About 30 minutes of free time',
  'One free AI tool (Cursor or Claude Code)',
  'Zero coding experience required',
];
const DEFAULT_TROUBLESHOOTING = [
  {
    problem: "It broke and I don't know why",
    fix: 'Paste the full error into your AI tool and ask: "What does this error mean and how do I fix it?"',
  },
  {
    problem: "Code doesn't do what I expected",
    fix: 'Tell AI: "I expected X but got Y. Here\'s my code." — be specific about the mismatch.',
  },
  {
    problem: "I'm not actually learning, just copy-pasting",
    fix: 'After every AI response, change one thing yourself. Understanding comes from modifying code.',
  },
  {
    problem: 'AI keeps going in circles',
    fix: 'Start a new chat with a clearer description of what you want. Short, concrete prompts work best.',
  },
];

const SKILL_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'setup', label: 'Setup' },
  { id: 'debug', label: 'Debugging' },
  { id: 'build', label: 'Building' },
  { id: 'learn', label: 'Learning' },
  { id: 'quality', label: 'Code quality' },
];

const AGENT_SKILLS = [
  {
    title: 'Python Project Starter',
    description:
      'Virtual envs, requirements, .gitignore — the right foundation',
    category: 'setup',
    content:
      '# Python Project Starter\n\nWhen starting a new Python project:\n- Create a virtual environment with `python -m venv .venv`\n- Add a `requirements.txt` with pinned versions\n- Include a `.gitignore` for Python (include .venv/, __pycache__/, .env)\n- Use f-strings for string formatting, type hints on all function signatures\n- Wrap risky operations in try/except with specific exception types\n- Add docstrings to every function explaining what it does, its params, and return value\n- Structure: main.py at root, modules in src/, tests in tests/',
  },
  {
    title: 'Debug Detective',
    description: 'Find and fix bugs by analyzing errors step by step',
    category: 'debug',
    content:
      '# Debug Detective\n\nWhen I share an error or unexpected behavior:\n1. Read the full traceback bottom-to-top and identify the exact line that failed\n2. Explain what the error type means (TypeError, ValueError, KeyError, etc.) in plain English\n3. Show me the broken code and the fixed version side by side\n4. Explain WHY the fix works, not just what changed\n5. Suggest a defensive check I can add to prevent this error in the future\n6. If the error is in a library, explain what my code did wrong when calling it',
  },
  {
    title: 'Error Translator',
    description: 'Turn cryptic Python errors into plain English',
    category: 'debug',
    content:
      "# Error Translator\n\nWhen I paste a Python error message:\n- Translate the error into a single sentence a beginner would understand\n- Point to the exact line and variable causing it\n- Give the one-line fix\n- Show a 'before and after' of the code\n- Explain what to Google if this happens again\n- Common errors to recognize: IndentationError (wrong spacing), NameError (typo or undefined variable), TypeError (wrong data type), ImportError (missing pip install)",
  },
  {
    title: 'Backend Engineer',
    description: 'Build APIs, databases, and server-side code the right way',
    category: 'build',
    content:
      '# Backend Engineer\n\nWhen building backend Python code:\n- Use FastAPI for new APIs (or Flask for simpler projects)\n- Always validate input with Pydantic models\n- Use SQLAlchemy or raw SQL with parameterized queries (never string concatenation)\n- Return proper HTTP status codes (201 for created, 404 for not found, 422 for validation error)\n- Add error handling middleware that returns JSON error responses\n- Use environment variables for secrets (never hardcode API keys, DB passwords)\n- Structure: routes/ for endpoints, models/ for data, services/ for business logic',
  },
  {
    title: 'Script Builder',
    description: 'Automate tasks with clean, reusable Python scripts',
    category: 'build',
    content:
      '# Script Builder\n\nWhen writing automation scripts:\n- Accept input via command-line arguments (argparse) not hardcoded values\n- Add a --dry-run flag that shows what would happen without doing it\n- Log progress with print() or logging module so the user knows it is working\n- Handle file-not-found, permission errors, and network timeouts gracefully\n- Add a if __name__ == "__main__": guard\n- Include a --help description for every argument\n- If processing files: show a progress count (Processing 3/50...)',
  },
  {
    title: 'Data Wrangler',
    description: 'Clean, transform, and analyze data with pandas',
    category: 'build',
    content:
      '# Data Wrangler\n\nWhen working with data in Python:\n- Use pandas for tabular data, json module for JSON, csv module for simple CSVs\n- Always inspect data first: df.head(), df.info(), df.describe()\n- Handle missing values explicitly (dropna or fillna with a sensible default)\n- When merging datasets, specify the join type and check for duplicates after\n- Name variables descriptively: raw_df, cleaned_df, summary_df\n- Save intermediate results so you can debug each step\n- Add comments explaining WHY you filtered or transformed, not just what',
  },
  {
    title: "Explain Like I'm New",
    description: 'Plain-language explanations with real-world analogies',
    category: 'learn',
    content:
      "# Explain Like I'm New\n\nAfter writing code:\n- Explain each section in plain English using real-world analogies\n- Variables are like labeled boxes, functions are like recipes, loops are like assembly lines\n- Highlight which parts are boilerplate (safe to ignore) vs which parts to modify\n- After explaining, suggest ONE small change I can make myself to test understanding\n- If I ask 'why', never say 'because that's how it works' — explain the actual reason\n- Use analogies from cooking, building, or everyday life — not other programming concepts",
  },
  {
    title: 'Code Reviewer',
    description: 'Catch beginner mistakes and suggest improvements',
    category: 'quality',
    content:
      '# Code Reviewer\n\nBefore I run my Python code, review it for:\n- Missing error handling (bare try/except, no handling for file or network operations)\n- Hardcoded values that should be variables or config\n- Functions doing more than one thing (should be split)\n- Missing type hints on function parameters and return values\n- print() used for debugging (should use logging)\n- Security issues: SQL injection, hardcoded secrets, unsafe file paths\n- Give feedback as: [Issue] what is wrong → [Fix] specific code change → [Why] one sentence explanation',
  },
  {
    title: 'Testing Coach',
    description: 'Write tests that actually catch bugs',
    category: 'quality',
    content:
      '# Testing Coach\n\nWhen writing or reviewing Python code:\n- Suggest 3 test cases for every function: happy path, edge case, error case\n- Use pytest (not unittest) with descriptive test names: test_add_person_with_empty_name_raises_error\n- Show how to run tests: pytest -v\n- Mock external dependencies (API calls, file system, databases)\n- Test behavior, not implementation — test what the function returns, not how it works inside\n- If I am new to testing, start with the simplest assertion: assert function(input) == expected_output',
  },
  {
    title: 'Refactoring Guide',
    description: 'Improve existing code without breaking it',
    category: 'quality',
    content:
      '# Refactoring Guide\n\nWhen I share code that works but looks messy:\n- First acknowledge what works well (positive reinforcement)\n- Identify the biggest readability issue and fix that first\n- Rename variables to be descriptive (x → user_age, d → response_data)\n- Extract repeated logic into named functions\n- Replace nested if/else with early returns\n- Show the refactored version and explain each change\n- Never change behavior — the output should be identical before and after',
  },
  {
    title: 'Design Patterns',
    description: 'When and how to structure Python code for real projects',
    category: 'learn',
    content:
      '# Design Patterns for Python\n\nWhen my project grows beyond a single file:\n- Separate concerns: data access, business logic, and presentation in different files\n- Use classes when you have data + behavior together (e.g., a User that can authenticate)\n- Use plain functions when you just transform data in → data out\n- Configuration goes in .env files, loaded with python-dotenv\n- For CLI tools: one file per command, shared utils in a helpers module\n- Common pattern: main.py imports from modules, modules never import from main\n- Explain each pattern with a concrete example from my project, not abstract theory',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Do I need coding experience?',
    a: 'No. AI writes the code; you learn by reading and modifying it.',
  },
  {
    q: 'How long does it take?',
    a: '30 min/day — real projects in 2-4 weeks.',
  },
  {
    q: 'Which AI tool should I use?',
    a: 'Cursor (free) or Claude Code — both work great for beginners.',
  },
  {
    q: "I don't understand the code AI writes",
    a: 'Ask AI: "Explain this code to me line by line." Every time.',
  },
  {
    q: 'What can I actually build with Python?',
    a: 'Web apps, scripts, dashboards, CLIs, APIs, chatbots, automations.',
  },
];

const USE_CASES = [
  {
    title: 'Automate repetitive tasks',
    description:
      'Rename files, process CSVs, send emails, scrape data — scripts that save hours of manual work.',
    tags: ['automation', 'scripts'],
  },
  {
    title: 'Build a personal dashboard',
    description:
      'Track habits, finances, or fitness with a web app built on Flask or Streamlit.',
    tags: ['web app', 'data'],
  },
  {
    title: 'Create a Discord / Slack bot',
    description:
      'Build a bot that responds to commands, posts updates, or integrates with APIs.',
    tags: ['bot', 'API'],
  },
  {
    title: 'Analyze data and make charts',
    description:
      'Load a dataset, clean it, find insights, and visualize results with matplotlib or plotly.',
    tags: ['data science', 'visualization'],
  },
  {
    title: 'Build a CLI tool',
    description:
      'Create your own command-line utility with subcommands, flags, and colored output.',
    tags: ['CLI', 'developer tools'],
  },
  {
    title: 'Deploy an API',
    description:
      'Build a REST API with FastAPI or Flask that other apps can call.',
    tags: ['API', 'backend'],
  },
];

/* ═══ Intent definitions ═══ */

interface Intent {
  id: string;
  label: string;
  shortLabel: string;
  icon: ReactElement;
  description: string;
}

function buildIntents(pageData: LeafPageData): Intent[] {
  return [
    {
      id: 'start',
      label: 'Get started',
      shortLabel: 'Start',
      icon: <SparkleIcon size={IconSize.Small} />,
      description: 'Setup checklist and your first prompt',
    },
    {
      id: 'ai',
      label: 'AI skills',
      shortLabel: 'AI',
      icon: <MagicIcon size={IconSize.Small} />,
      description: `${AGENT_SKILLS.length} prompt templates for every scenario`,
    },
    {
      id: 'build',
      label: 'Projects',
      shortLabel: 'Build',
      icon: <TerminalIcon size={IconSize.Small} />,
      description: `${
        pageData.prompts?.length ?? 0
      } step-by-step prompts to copy & run`,
    },
    {
      id: 'understand',
      label: 'Concepts',
      shortLabel: 'Learn',
      icon: <GraduationIcon size={IconSize.Small} />,
      description: `${pageData.concepts.length} key topics explained simply`,
    },
    {
      id: 'inspiration',
      label: 'Inspiration',
      shortLabel: 'Ideas',
      icon: <StarIcon size={IconSize.Small} />,
      description: `Use cases, community projects & trending posts`,
    },
  ];
}

/* ═══ Search index ═══ */

interface SearchEntry {
  text: string;
  label: string;
  intentId: string;
  category: string;
}

function buildSearchIndex(pageData: LeafPageData): SearchEntry[] {
  const entries: SearchEntry[] = [];
  (pageData.prompts ?? []).forEach((p) => {
    entries.push({
      text: `${p.title} ${p.subtitle ?? ''} ${p.body}`.toLowerCase(),
      label: `Project ${p.step}: ${p.title}`,
      intentId: 'build',
      category: 'Project',
    });
  });
  pageData.concepts.forEach((c) => {
    entries.push({
      text: `${c.name} ${c.explanation}`.toLowerCase(),
      label: c.name,
      intentId: 'understand',
      category: 'Concept',
    });
  });
  FAQ_ITEMS.forEach((f) => {
    entries.push({
      text: `${f.q} ${f.a}`.toLowerCase(),
      label: f.q,
      intentId: 'start',
      category: 'FAQ',
    });
  });
  (pageData.troubleshooting ?? DEFAULT_TROUBLESHOOTING).forEach((t) => {
    entries.push({
      text: `${t.problem} ${t.fix}`.toLowerCase(),
      label: t.problem,
      intentId: 'start',
      category: 'Help',
    });
  });
  USE_CASES.forEach((u) => {
    entries.push({
      text: `${u.title} ${u.description} ${u.tags.join(' ')}`.toLowerCase(),
      label: u.title,
      intentId: 'inspiration',
      category: 'Use case',
    });
  });
  pageData.tools.forEach((t) => {
    entries.push({
      text: `${t.name} ${t.description}`.toLowerCase(),
      label: t.name,
      intentId: 'start',
      category: 'Tool',
    });
  });
  pageData.resources.forEach((r) => {
    entries.push({
      text: `${r.title}`.toLowerCase(),
      label: r.title,
      intentId: 'start',
      category: 'Resource',
    });
  });
  AGENT_SKILLS.forEach((s) => {
    entries.push({
      text: `${s.title} ${s.description} ${s.content}`.toLowerCase(),
      label: s.title,
      intentId: 'ai',
      category: 'AI Skill',
    });
  });
  return entries;
}

/* ═══ Types ═══ */

interface LeafPageParams extends ParsedUrlQuery {
  slug: string[];
}
type LearnToCodeLeafProps = DynamicSeoProps & { pageData: LeafPageData };

/* ═══ Spotlight ═══ */

interface IntentChip {
  label: string;
  intentId: string;
}

function buildIntentChips(pageData: LeafPageData): IntentChip[] {
  const topic = pageData.title.replace(/^Learn\s+/i, '');
  return [
    { label: `I want to start learning ${topic}`, intentId: 'start' },
    { label: 'Help me set up my tools', intentId: 'start' },
    { label: 'Give me a project to build', intentId: 'build' },
    { label: `What can I build with ${topic}?`, intentId: 'inspiration' },
    { label: `Supercharge my AI for ${topic}`, intentId: 'ai' },
    { label: 'Explain a concept to me', intentId: 'understand' },
  ];
}

function Spotlight({
  searchIndex,
  onNavigate,
  intentChips,
}: {
  searchIndex: SearchEntry[];
  onNavigate: (id: string) => void;
  intentChips: IntentChip[];
}): ReactElement {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    if (query.length < 2) {
      return [];
    }
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex
      .filter((e) => words.every((w) => e.text.includes(w)))
      .slice(0, 6);
  }, [query, searchIndex]);
  const showDropdown = focused && query.length >= 2;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !focused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [focused]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={classNames(
          'flex items-center gap-3 rounded-14 border bg-surface-float px-4 py-2.5 transition-all duration-200',
          focused
            ? 'border-accent-cabbage-default shadow-2'
            : 'border-border-subtlest-tertiary',
        )}
      >
        <SearchIcon
          size={IconSize.Small}
          className={classNames(
            'shrink-0 transition-colors',
            focused ? 'text-accent-cabbage-default' : 'text-text-quaternary',
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="What do you need help with?"
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="shrink-0 text-text-quaternary transition-colors hover:text-text-secondary"
          >
            <MiniCloseIcon size={IconSize.Small} />
          </button>
        )}
        {!focused && (
          <kbd className="hidden shrink-0 rounded-8 border border-border-subtlest-tertiary bg-background-default px-1.5 py-0.5 font-mono text-text-quaternary typo-caption2 tablet:block">
            /
          </kbd>
        )}
      </div>

      {/* Intent chips */}
      {!showDropdown && (
        <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto">
          {intentChips.map((chip) => (
            <button
              type="button"
              key={chip.label}
              onClick={() => onNavigate(chip.intentId)}
              className="hover:border-accent-cabbage-default/40 hover:bg-accent-cabbage-subtlest/10 shrink-0 rounded-10 border border-border-subtlest-tertiary bg-background-default px-3 py-1 text-text-tertiary transition-colors typo-caption1 hover:text-text-secondary"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {showDropdown && (
        <div className="z-50 absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default shadow-3">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-quaternary typo-callout">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {results.map((r) => (
                <button
                  type="button"
                  key={`${r.intentId}-${r.label}`}
                  onClick={() => {
                    onNavigate(r.intentId);
                    setFocused(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-quaternary typo-caption2">
                    {r.category}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-text-primary typo-callout">
                    {r.label}
                  </span>
                  <ArrowIcon
                    size={IconSize.XSmall}
                    className="shrink-0 rotate-90 text-text-quaternary"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ Sub-components ═══ */

function PromptCard({ prompt }: { prompt: Prompt }): ReactElement {
  const { displayToast } = useToastNotification();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    displayToast('Prompt copied');
    setTimeout(() => setCopied(false), 2000);
  };
  const d = prompt.difficulty ?? 'beginner';
  const c = DIFFICULTY_COLORS[d];
  return (
    <div
      className={classNames(
        'overflow-hidden rounded-16 border-y border-l-4 border-r transition-all duration-200',
        expanded
          ? 'border-y-border-subtlest-secondary border-r-border-subtlest-secondary bg-surface-float'
          : 'border-y-border-subtlest-tertiary border-r-border-subtlest-tertiary hover:bg-surface-float',
        c.left,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-10 bg-surface-float font-bold text-text-tertiary typo-footnote">
          {prompt.step}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            {prompt.title}
          </span>
          {prompt.subtitle && !expanded && (
            <span className="truncate text-text-quaternary typo-footnote">
              {prompt.subtitle}
            </span>
          )}
        </div>
        <span
          className={classNames(
            'shrink-0 rounded-8 px-2 py-0.5 font-bold typo-caption1',
            c.bg,
            c.text,
          )}
        >
          {DIFFICULTY_LABELS[d]}
        </span>
        {prompt.timeEstimate && (
          <span className="hidden items-center gap-1 text-text-quaternary typo-caption1 tablet:flex">
            <TimerIcon size={IconSize.XXSmall} />
            {prompt.timeEstimate}
          </span>
        )}
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'shrink-0 text-text-quaternary transition-transform',
            expanded ? '-rotate-90' : 'rotate-90',
          )}
        />
      </button>
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary p-4">
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
            <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-3 py-2">
              <span className="flex items-center gap-1.5 text-text-quaternary typo-footnote">
                <TerminalIcon size={IconSize.XSmall} />
                {prompt.tools.map((t) => TOOL_LABELS[t]).join(' · ')}
              </span>
              <Button
                variant={
                  copied ? ButtonVariant.Primary : ButtonVariant.Tertiary
                }
                size={ButtonSize.Small}
                icon={copied ? <VIcon /> : <CopyIcon />}
                onClick={handleCopy}
                className={classNames(copied && 'bg-accent-avocado-default')}
              >
                {copied ? 'Copied!' : 'Copy prompt'}
              </Button>
            </div>
            <div className="p-4">
              <p className="whitespace-pre-wrap font-mono leading-relaxed text-text-secondary typo-footnote">
                {prompt.body}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {prompt.expectedOutput && (
              <div className="bg-accent-avocado-subtlest/20 rounded-12 p-3">
                <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
                  <VIcon size={IconSize.XSmall} />
                  Expected output
                </span>
                <p className="mt-1.5 text-text-secondary typo-footnote">
                  {prompt.expectedOutput}
                </p>
              </div>
            )}
            {prompt.comprehensionPrompt && (
              <div className="bg-accent-water-subtlest/20 rounded-12 p-3">
                <span className="flex items-center gap-1.5 font-bold text-accent-water-default typo-footnote">
                  <GraduationIcon size={IconSize.XSmall} />
                  Understand it
                </span>
                <p className="mt-1.5 text-text-secondary typo-footnote">
                  {prompt.comprehensionPrompt}
                </p>
              </div>
            )}
            {prompt.challenge && (
              <div className="bg-accent-onion-subtlest/20 rounded-12 p-3">
                <span className="flex items-center gap-1.5 font-bold text-accent-onion-default typo-footnote">
                  <SparkleIcon size={IconSize.XSmall} />
                  Challenge
                </span>
                <p className="mt-1.5 text-text-secondary typo-footnote">
                  {prompt.challenge}
                </p>
              </div>
            )}
            {prompt.stuckTip && (
              <div className="bg-accent-cheese-subtlest/20 rounded-12 p-3">
                <span className="flex items-center gap-1.5 font-bold text-accent-cheese-default typo-footnote">
                  <AlertIcon size={IconSize.XSmall} />
                  Stuck?
                </span>
                <p className="mt-1.5 text-text-secondary typo-footnote">
                  {prompt.stuckTip}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentSkillCard({
  skill,
}: {
  skill: (typeof AGENT_SKILLS)[number];
}): ReactElement {
  const { displayToast } = useToastNotification();
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="group rounded-14 border border-border-subtlest-tertiary transition-colors hover:border-border-subtlest-secondary hover:bg-surface-float">
      <div className="flex items-start gap-2.5 p-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setShowContent((p) => !p)}
            className="flex items-center gap-1.5 text-left"
          >
            <span className="font-bold text-text-primary typo-footnote">
              {skill.title}
            </span>
            <ArrowIcon
              size={IconSize.XXSmall}
              className={classNames(
                'shrink-0 text-text-quaternary transition-transform',
                showContent ? '-rotate-90' : 'rotate-90',
              )}
            />
          </button>
          <p className="mt-0.5 text-text-tertiary typo-caption1">
            {skill.description}
          </p>
        </div>
        <Button
          variant={copied ? ButtonVariant.Primary : ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={copied ? <VIcon /> : <CopyIcon />}
          className={classNames(
            'shrink-0 opacity-0 transition-opacity group-hover:opacity-100',
            copied && 'bg-accent-avocado-default !opacity-100',
          )}
          onClick={async () => {
            await navigator.clipboard.writeText(skill.content);
            setCopied(true);
            displayToast('Copied — paste into your AI tool');
            setTimeout(() => setCopied(false), 2000);
          }}
        />
      </div>
      {showContent && (
        <div className="border-t border-border-subtlest-tertiary px-3 pb-3 pt-2">
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-10 bg-background-default p-2.5 font-mono text-text-secondary typo-caption1">
            {skill.content}
          </pre>
          <div className="mt-2 flex gap-2">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              icon={<CopyIcon />}
              onClick={async () => {
                await navigator.clipboard.writeText(skill.content);
                setCopied(true);
                displayToast('Copied — paste into your AI tool');
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<DownloadIcon />}
              onClick={() => {
                const b = new Blob([skill.content], {
                  type: 'text/markdown',
                });
                const u = URL.createObjectURL(b);
                const a = document.createElement('a');
                a.href = u;
                a.download = `${skill.title
                  .toLowerCase()
                  .replace(/\s+/g, '-')}.md`;
                a.click();
                URL.revokeObjectURL(u);
                displayToast('Downloaded');
              }}
            >
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedPathCard({
  path,
}: {
  path: RecommendedPath;
}): ReactElement {
  return (
    <Link href={`/learn-to-code/${path.slug}`}>
      <a className="group flex items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5 transition-all hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-primary typo-callout group-hover:text-text-link">
            {path.title}
          </span>
          <span className="text-text-tertiary typo-footnote">
            {path.reason}
          </span>
        </div>
        <ArrowIcon
          size={IconSize.Small}
          className="rotate-90 text-text-quaternary"
        />
      </a>
    </Link>
  );
}

/* ═══ Intent panels ═══ */

function SectionPreview({
  intent,
  onNavigate,
  children,
}: {
  intent: Intent;
  onNavigate: (id: string) => void;
  children: ReactNode;
}): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-14 border border-border-subtlest-tertiary transition-colors hover:border-border-subtlest-secondary">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-surface-float"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
          {intent.icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-footnote">
            {intent.label}
          </span>
          <span className="text-text-quaternary typo-caption1">
            {intent.description}
          </span>
        </div>
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'shrink-0 text-text-quaternary transition-transform duration-200',
            open ? 'rotate-0' : 'rotate-90',
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border-subtlest-tertiary bg-surface-float px-4 pb-3 pt-3">
          {children}
          <button
            type="button"
            onClick={() => onNavigate(intent.id)}
            className="mt-3 flex items-center gap-1.5 font-bold text-accent-cabbage-default typo-footnote hover:underline"
          >
            View all
            <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
}

function IntentStart({
  pageData,
  intents,
  onNavigate,
}: {
  pageData: LeafPageData;
  intents: Intent[];
  onNavigate: (id: string) => void;
}): ReactElement {
  const { displayToast } = useToastNotification();
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const prerequisites = pageData.prerequisites ?? DEFAULT_PREREQUISITES;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const firstPrompt = pageData.prompts?.[0];
  const intentMap = useMemo(() => {
    const m: Record<string, Intent> = {};
    intents.forEach((i) => {
      m[i.id] = i;
    });
    return m;
  }, [intents]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Quick context ── */}
      <p className="text-text-secondary typo-body">{pageData.description}</p>

      {/* ── Common questions ── */}
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
        {FAQ_ITEMS.slice(0, 4).map((faq) => (
          <div
            key={faq.q}
            className="rounded-12 border border-border-subtlest-tertiary p-3"
          >
            <span className="font-bold text-text-primary typo-footnote">
              {faq.q}
            </span>
            <p className="mt-1 text-text-quaternary typo-caption1">{faq.a}</p>
          </div>
        ))}
      </div>

      {/* ── Setup checklist ── */}
      <div className="rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold text-text-primary typo-callout">
            Setup checklist
          </span>
          <span className="rounded-10 bg-accent-cabbage-subtlest px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
            {checkedCount}/{prerequisites.length}
          </span>
        </div>
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-surface-float">
          <div
            className="h-full rounded-full bg-accent-avocado-default transition-all duration-500"
            style={{
              width: `${(checkedCount / prerequisites.length) * 100}%`,
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          {prerequisites.map((item, idx) => (
            <button
              type="button"
              key={item}
              onClick={() =>
                setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }))
              }
              className="flex items-center gap-2.5 rounded-10 px-2 py-1.5 text-left transition-colors hover:bg-surface-float"
            >
              <span
                className={classNames(
                  'h-4.5 w-4.5 flex shrink-0 items-center justify-center rounded-6 border-2 transition-all',
                  checked[idx]
                    ? 'border-accent-avocado-default bg-accent-avocado-default'
                    : 'border-border-subtlest-secondary',
                )}
              >
                {checked[idx] && (
                  <VIcon size={IconSize.XXSmall} className="text-white" />
                )}
              </span>
              <span
                className={classNames(
                  'typo-footnote',
                  checked[idx]
                    ? 'text-text-quaternary line-through'
                    : 'text-text-secondary',
                )}
              >
                {item}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── First prompt ── */}
      {firstPrompt && (
        <div className="border-accent-cabbage-default/25 bg-accent-cabbage-subtlest/8 rounded-16 border p-4">
          <div className="mb-2 flex items-center gap-2">
            <SparkleIcon
              size={IconSize.Small}
              className="text-accent-cabbage-default"
            />
            <span className="font-bold text-text-primary typo-callout">
              Your first prompt
            </span>
          </div>
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
            <span className="block font-bold text-text-secondary typo-footnote">
              {firstPrompt.title}
            </span>
            <p className="mt-1 truncate font-mono text-text-quaternary typo-caption1">
              {firstPrompt.body}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={copied ? ButtonVariant.Primary : ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={copied ? <VIcon /> : <CopyIcon />}
              className={classNames(copied && 'bg-accent-avocado-default')}
              onClick={async () => {
                await navigator.clipboard.writeText(firstPrompt.body);
                setCopied(true);
                displayToast('Prompt copied');
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Copied!' : 'Copy prompt'}
            </Button>
            <span className="text-text-quaternary typo-caption1">
              Paste into Cursor or Claude Code and hit enter
            </span>
          </div>
        </div>
      )}

      {/* ── What you'll build ── */}
      {pageData.outcomes && pageData.outcomes.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold text-text-primary typo-callout">
            What you&apos;ll build
          </h3>
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
            {pageData.outcomes.map((o) => (
              <div
                key={o}
                className="flex items-start gap-2 rounded-12 border border-border-subtlest-tertiary p-3"
              >
                <VIcon
                  size={IconSize.XSmall}
                  className="mt-0.5 shrink-0 text-accent-avocado-default"
                />
                <span className="text-text-secondary typo-footnote">{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI tips ── */}
      {pageData.aiTips && pageData.aiTips.length > 0 && (
        <div className="rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="mb-3 flex items-center gap-2">
            <MagicIcon
              size={IconSize.Small}
              className="text-accent-cabbage-default"
            />
            <span className="font-bold text-text-primary typo-callout">
              Tips for working with AI
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {pageData.aiTips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-text-secondary typo-footnote"
              >
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cabbage-default" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Help & troubleshooting ── */}
      <div>
        <h3 className="mb-3 font-bold text-text-primary typo-callout">
          Stuck? Try this
        </h3>
        <div className="border-accent-cheese-default/25 bg-accent-cheese-subtlest/8 mb-3 rounded-12 border p-3">
          <p className="text-text-secondary typo-footnote">
            <strong className="text-accent-cheese-default">Quick fix:</strong>{' '}
            Paste the full error message into your AI tool and ask: &quot;What
            does this mean and how do I fix it?&quot;
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
          {(pageData.troubleshooting ?? DEFAULT_TROUBLESHOOTING)
            .slice(0, 4)
            .map((t) => (
              <div
                key={t.problem}
                className="rounded-12 border border-border-subtlest-tertiary p-3"
              >
                <span className="font-bold text-text-primary typo-footnote">
                  &ldquo;{t.problem}&rdquo;
                </span>
                <p className="mt-1 text-text-quaternary typo-caption1">
                  {t.fix}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* ── Explore sections (expandable previews) ── */}
      <div>
        <h3 className="mb-3 font-bold text-text-primary typo-callout">
          Explore this page
        </h3>
        <div className="flex flex-col gap-2">
          {/* AI Skills preview */}
          {intentMap.ai && (
            <SectionPreview intent={intentMap.ai} onNavigate={onNavigate}>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const count = AGENT_SKILLS.filter(
                    (s) => s.category === cat.id,
                  ).length;
                  return (
                    <span
                      key={cat.id}
                      className="rounded-8 bg-background-default px-2.5 py-1 text-text-secondary typo-caption1"
                    >
                      {cat.label}{' '}
                      <span className="text-text-quaternary">({count})</span>
                    </span>
                  );
                })}
              </div>
            </SectionPreview>
          )}

          {/* Projects preview */}
          {intentMap.build && (
            <SectionPreview intent={intentMap.build} onNavigate={onNavigate}>
              <div className="flex flex-col gap-2">
                {(pageData.prompts ?? []).slice(0, 3).map((p) => (
                  <div
                    key={p.step}
                    className="flex items-center gap-2 rounded-10 bg-background-default p-2"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-6 bg-surface-float font-bold text-text-tertiary typo-caption2">
                      {p.step}
                    </span>
                    <span className="font-bold text-text-secondary typo-caption1">
                      {p.title}
                    </span>
                    {p.difficulty && (
                      <span
                        className={classNames(
                          'ml-auto shrink-0 rounded-6 px-1.5 py-0.5 font-bold typo-caption2',
                          DIFFICULTY_COLORS[p.difficulty]?.bg,
                          DIFFICULTY_COLORS[p.difficulty]?.text,
                        )}
                      >
                        {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </SectionPreview>
          )}

          {/* Concepts preview */}
          {intentMap.understand && (
            <SectionPreview
              intent={intentMap.understand}
              onNavigate={onNavigate}
            >
              <div className="flex flex-wrap gap-2">
                {pageData.concepts.slice(0, 5).map((c) => (
                  <span
                    key={c.name}
                    className="rounded-8 bg-background-default px-2.5 py-1 font-bold text-text-secondary typo-caption1"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </SectionPreview>
          )}

          {/* Inspiration preview */}
          {intentMap.inspiration && (
            <SectionPreview
              intent={intentMap.inspiration}
              onNavigate={onNavigate}
            >
              <div className="flex flex-col gap-2">
                {USE_CASES.slice(0, 2).map((u) => (
                  <div
                    key={u.title}
                    className="rounded-10 bg-background-default p-2"
                  >
                    <span className="font-bold text-text-secondary typo-caption1">
                      {u.title}
                    </span>
                    <p className="mt-0.5 text-text-quaternary typo-caption2">
                      {u.description}
                    </p>
                  </div>
                ))}
              </div>
            </SectionPreview>
          )}
        </div>
      </div>
    </div>
  );
}

function IntentBuild({ pageData }: { pageData: LeafPageData }): ReactElement {
  const prompts = pageData.prompts ?? [];
  const totalTime = prompts.reduce((sum, p) => {
    const m = p.timeEstimate?.match(/(\d+)/);
    return sum + (m ? parseInt(m[1], 10) : 30);
  }, 0);
  return (
    <div className="flex flex-col gap-4">
      {pageData.projectDescription && (
        <p className="text-text-secondary typo-body">
          {pageData.projectDescription}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-text-tertiary typo-footnote">
          <TerminalIcon size={IconSize.XSmall} />
          {prompts.length} projects
        </span>
        <span className="h-3 w-px bg-border-subtlest-secondary" />
        <span className="flex items-center gap-1.5 text-text-tertiary typo-footnote">
          <TimerIcon size={IconSize.XSmall} />~{totalTime} min total
        </span>
        <span className="h-3 w-px bg-border-subtlest-secondary" />
        <span className="text-text-quaternary typo-footnote">
          Copy each prompt into your AI tool and follow along
        </span>
      </div>
      {prompts.map((prompt) => (
        <PromptCard key={prompt.step} prompt={prompt} />
      ))}
    </div>
  );
}

function IntentUnderstand({
  pageData,
}: {
  pageData: LeafPageData;
}): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-secondary typo-body">
        These are the core concepts you&apos;ll encounter while building
        projects. You don&apos;t need to memorize them — reference them when you
        need clarity.
      </p>
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {pageData.concepts.map((concept) => (
          <div
            key={concept.name}
            className="rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:bg-surface-float"
          >
            <span className="font-bold text-text-primary typo-callout">
              {concept.name}
            </span>
            <p className="mt-2 text-text-tertiary typo-footnote">
              {concept.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntentAI({ pageData }: { pageData: LeafPageData }): ReactElement {
  const grouped = useMemo(() => {
    const cats = SKILL_CATEGORIES.filter((c) => c.id !== 'all');
    return cats
      .map((cat) => ({
        ...cat,
        skills: AGENT_SKILLS.filter((s) => s.category === cat.id),
      }))
      .filter((g) => g.skills.length > 0);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-text-secondary typo-body">
        Prompt templates that teach your AI tool how to help you better. Copy
        any skill and paste it at the start of a chat session.
      </p>

      {grouped.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 font-bold text-text-primary typo-callout">
            {group.label}
          </h3>
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
            {group.skills.map((skill) => (
              <AgentSkillCard key={skill.title} skill={skill} />
            ))}
          </div>
        </div>
      ))}

      {(pageData.aiTips ?? []).length > 0 && (
        <div className="bg-accent-cabbage-subtlest/10 rounded-16 p-4">
          <span className="mb-2 flex items-center gap-2 font-bold text-accent-cabbage-default typo-footnote">
            <SparkleIcon size={IconSize.XSmall} /> Tips for working with AI
          </span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {(pageData.aiTips ?? []).map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-text-secondary typo-footnote"
              >
                <span className="mt-1 shrink-0 text-accent-cabbage-default">
                  &bull;
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function IntentInspiration({
  feedTag,
  feedVariables,
  userId,
}: {
  feedTag: string;
  feedVariables: Record<string, unknown>;
  userId: string;
}): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-text-secondary typo-body">
        Not sure what to build? Browse real-world use cases, see what the
        community is working on, and find your next project idea.
      </p>

      {/* Use cases */}
      <div>
        <h3 className="mb-3 font-bold text-text-primary typo-callout">
          What people build
        </h3>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="group rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:bg-surface-float"
            >
              <span className="font-bold text-text-primary typo-callout">
                {uc.title}
              </span>
              <p className="mt-1.5 text-text-tertiary typo-footnote">
                {uc.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-6 bg-surface-float px-2 py-0.5 text-text-quaternary typo-caption2 group-hover:bg-surface-hover"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending from daily.dev */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <UpvoteIcon
            size={IconSize.Small}
            className="text-accent-cabbage-default"
          />
          <h3 className="font-bold text-text-primary typo-callout">
            Trending in {feedTag}
          </h3>
          <span className="text-text-quaternary typo-caption1">
            from daily.dev
          </span>
        </div>
        <ForceListMode>
          <ActiveFeedNameContext.Provider
            value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
          >
            <Feed
              feedName={OtherFeedPage.TagsMostUpvoted}
              feedQueryKey={[
                'learnToCodeRelated',
                userId,
                Object.values(feedVariables),
              ]}
              query={MOST_UPVOTED_FEED_QUERY}
              variables={feedVariables}
              className="!mx-0 !w-auto"
              disableAds
              disableListFrame
              allowFetchMore={false}
              pageSize={5}
            />
          </ActiveFeedNameContext.Provider>
        </ForceListMode>
      </div>
    </div>
  );
}

/* ═══ Right sidebar ═══ */

function RightSidebar({
  pageData,
  relatedPages,
}: {
  pageData: LeafPageData;
  relatedPages: ManifestEntry[];
}): ReactElement {
  return (
    <aside className="flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-1">
        <span className="px-1 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
          Tools
        </span>
        {pageData.tools.map((tool) => (
          <a
            key={tool.url}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float"
          >
            <OpenLinkIcon
              size={IconSize.XSmall}
              className="shrink-0 text-text-quaternary"
            />
            <span className="truncate font-bold text-text-primary typo-caption1 group-hover:text-text-link">
              {tool.name}
            </span>
          </a>
        ))}
      </div>
      <hr className="border-border-subtlest-tertiary" />
      <div className="flex flex-col gap-1">
        <span className="px-1 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
          Resources
        </span>
        {pageData.resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float"
          >
            {RESOURCE_TYPE_ICONS[r.type]}
            <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1 group-hover:text-text-link">
              {r.title}
            </span>
            {r.free && (
              <span className="shrink-0 rounded-6 bg-accent-avocado-subtlest px-1 py-0.5 font-bold text-accent-avocado-default typo-caption2">
                Free
              </span>
            )}
          </a>
        ))}
      </div>
      <hr className="border-border-subtlest-tertiary" />
      <div className="flex flex-col gap-1">
        <span className="px-1 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
          Community
        </span>
        {pageData.communities.map((c) => (
          <a
            key={c.url}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float"
          >
            {PLATFORM_ICONS[c.platform]}
            <span className="truncate text-text-primary typo-caption1 group-hover:text-text-link">
              {c.name}
            </span>
          </a>
        ))}
      </div>
      {relatedPages.length > 0 && (
        <>
          <hr className="border-border-subtlest-tertiary" />
          <div className="flex flex-col gap-1">
            <span className="px-1 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
              Related
            </span>
            {relatedPages.map((p) => (
              <Link key={p.slug} href={`/learn-to-code/${p.slug}`}>
                <a className="group flex items-center gap-2 rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-float">
                  <ArrowIcon
                    size={IconSize.XSmall}
                    className="rotate-90 text-text-quaternary"
                  />
                  <span className="truncate text-text-primary typo-caption1 group-hover:text-text-link">
                    {p.title}
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

/* ═══ Main component ═══ */

const LearnToCodeLeaf = ({ pageData }: LearnToCodeLeafProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();

  const feedTag = pageData?.tags?.[0];
  const isSubHub = !!pageData?.recommendedPaths?.length;
  const hasPrompts = !!pageData?.prompts?.length;
  const isHub = !isSubHub && hasPrompts;

  const [activeIntent, setActiveIntent] = useState('start');
  const navRef = useRef<HTMLElement>(null);

  const intents = useMemo(
    () => (pageData ? buildIntents(pageData) : []),
    [pageData],
  );
  const searchIndex = useMemo(
    () => (pageData ? buildSearchIndex(pageData) : []),
    [pageData],
  );
  const intentChips = useMemo(
    () => (pageData ? buildIntentChips(pageData) : []),
    [pageData],
  );
  const feedVariables = useMemo(
    () => ({
      tag: feedTag,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
      period: 30,
    }),
    [feedTag],
  );

  const handleIntentClick = useCallback((id: string) => {
    setActiveIntent(id);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: pageData?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      displayToast('Link copied to clipboard');
    }
  }, [pageData?.title, displayToast]);

  const handleDownloadAllSkills = useCallback(() => {
    const allContent = AGENT_SKILLS.map((s) => s.content).join('\n\n---\n\n');
    const blob = new Blob([allContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageData?.slug ?? 'python'}-ai-skills.md`;
    a.click();
    URL.revokeObjectURL(url);
    displayToast('All skills downloaded');
  }, [pageData?.slug, displayToast]);

  if (isLoading || !pageData) {
    return <></>;
  }

  const { pages } = manifest as Manifest;
  const relatedPages = pageData.relatedSlugs
    .map((s) => pages.find((p) => p.slug === s))
    .filter((p): p is ManifestEntry => !!p);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://app.daily.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learn to Code',
        item: 'https://app.daily.dev/learn-to-code',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageData.title,
        item: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
      },
    ],
  };
  const pageLd = isSubHub
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageData.title,
        description: pageData.description,
        url: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: (pageData.recommendedPaths ?? []).map((path, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: path.title,
            url: `https://app.daily.dev/learn-to-code/${path.slug}`,
          })),
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `Learn ${pageData.title}`,
        description: pageData.description,
        url: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
        step: (pageData.prompts ?? []).map((p) => ({
          '@type': 'HowToStep',
          position: p.step,
          name: p.title,
          text: p.body,
        })),
      };

  return (
    <div className="relative mx-auto flex w-full max-w-[72rem] flex-col">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([pageLd, breadcrumbLd]),
          }}
        />
      </Head>
      <PageWrapperLayout className="py-6">
        <BreadCrumbs>
          <Link href="/learn-to-code">
            <a className="flex items-center gap-1">
              <GraduationIcon size={IconSize.XSmall} secondary /> Learn to Code
            </a>
          </Link>
        </BreadCrumbs>

        {isSubHub && (
          <>
            <header className="mb-8 mt-8 flex flex-col gap-4 laptop:mt-10">
              <h1 className="font-bold text-text-primary typo-title1 laptop:typo-mega2">
                {pageData.title}
              </h1>
              <p className="max-w-2xl text-text-secondary typo-body laptop:typo-title3">
                {pageData.description}
              </p>
            </header>
            <section className="mb-12">
              <h2 className="mb-6 font-bold text-text-primary typo-title2">
                Recommended paths
              </h2>
              <div className="flex flex-col gap-4">
                {(pageData.recommendedPaths ?? []).map((path) => (
                  <RecommendedPathCard key={path.slug} path={path} />
                ))}
              </div>
            </section>
          </>
        )}

        {isHub && (
          <div className="mt-6 flex flex-col laptop:mt-8">
            {/* Header */}
            <header className="mb-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-text-primary typo-title1 laptop:typo-mega2">
                  {pageData.title}
                </h1>
                <p className="max-w-3xl text-text-secondary typo-body">
                  {pageData.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<DownloadIcon />}
                  onClick={handleDownloadAllSkills}
                  aria-label="Download all AI skills"
                >
                  <span className="hidden tablet:inline">Skills</span>
                </Button>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<ShareIcon />}
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <span className="hidden tablet:inline">Share</span>
                </Button>
              </div>
            </header>

            {/* Spotlight */}
            <div className="mb-4">
              <Spotlight
                searchIndex={searchIndex}
                onNavigate={handleIntentClick}
                intentChips={intentChips}
              />
            </div>

            {/* 2-column layout */}
            <div className="flex gap-8">
              <div className="min-w-0 flex-1">
                {/* Compact tab bar: icon + short label, no badges */}
                <nav
                  ref={navRef}
                  className="scrollbar-hide z-40 sticky top-0 -mx-4 flex border-b border-border-subtlest-tertiary bg-background-default px-4 laptop:mx-0 laptop:px-0"
                  aria-label="Navigation"
                >
                  {intents.map((intent) => {
                    const isActive = activeIntent === intent.id;
                    return (
                      <button
                        type="button"
                        key={intent.id}
                        onClick={() => handleIntentClick(intent.id)}
                        className={classNames(
                          'relative flex shrink-0 items-center gap-1.5 px-3 pb-2.5 pt-2 transition-colors duration-150',
                          isActive
                            ? 'text-text-primary'
                            : 'text-text-quaternary hover:text-text-secondary',
                        )}
                      >
                        {intent.icon}
                        <span className="hidden whitespace-nowrap font-bold typo-footnote tablet:inline">
                          {intent.label}
                        </span>
                        <span className="whitespace-nowrap font-bold typo-footnote tablet:hidden">
                          {intent.shortLabel}
                        </span>
                        {isActive && (
                          <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-accent-cabbage-default" />
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Content */}
                <div className="pb-8 pt-5">
                  {activeIntent === 'start' && (
                    <IntentStart
                      pageData={pageData}
                      intents={intents}
                      onNavigate={handleIntentClick}
                    />
                  )}
                  {activeIntent === 'build' && (
                    <IntentBuild pageData={pageData} />
                  )}
                  {activeIntent === 'understand' && (
                    <IntentUnderstand pageData={pageData} />
                  )}
                  {activeIntent === 'ai' && <IntentAI pageData={pageData} />}
                  {activeIntent === 'inspiration' && feedTag && (
                    <IntentInspiration
                      feedTag={feedTag}
                      feedVariables={feedVariables}
                      userId={user?.id ?? 'anonymous'}
                    />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="hidden w-56 shrink-0 laptop:block">
                <div className="sticky top-12 pt-2">
                  <RightSidebar
                    pageData={pageData}
                    relatedPages={relatedPages}
                  />
                </div>
              </div>
            </div>

            {/* Mobile sidebar */}
            <div className="border-t border-border-subtlest-tertiary pt-6 laptop:hidden">
              <RightSidebar pageData={pageData} relatedPages={relatedPages} />
            </div>
          </div>
        )}

        {!isSubHub && !hasPrompts && (
          <>
            <header className="mb-8 mt-8 flex flex-col gap-4 laptop:mt-10">
              <h1 className="font-bold text-text-primary typo-title1 laptop:typo-mega2">
                {pageData.title}
              </h1>
              <p className="max-w-2xl text-text-secondary typo-body laptop:typo-title3">
                {pageData.description}
              </p>
            </header>
            {pageData.concepts.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 font-bold text-text-primary typo-title2">
                  Key concepts
                </h2>
                <div className="flex flex-col gap-4">
                  {pageData.concepts.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5"
                    >
                      <h3 className="font-bold text-text-primary typo-callout">
                        {c.name}
                      </h3>
                      <p className="mt-2 text-text-secondary typo-body">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {feedTag && (
              <section className="pb-6">
                <div className="mb-6 flex items-center gap-3">
                  <UpvoteIcon
                    size={IconSize.Medium}
                    className="text-text-tertiary"
                  />
                  <h2 className="font-bold text-text-primary typo-title2">
                    Trending in {feedTag}
                  </h2>
                </div>
                <ForceListMode>
                  <ActiveFeedNameContext.Provider
                    value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
                  >
                    <Feed
                      feedName={OtherFeedPage.TagsMostUpvoted}
                      feedQueryKey={[
                        'learnToCodeRelated',
                        user?.id ?? 'anonymous',
                        Object.values(feedVariables),
                      ]}
                      query={MOST_UPVOTED_FEED_QUERY}
                      variables={feedVariables}
                      className="!mx-0 !w-auto"
                      disableAds
                      disableListFrame
                      allowFetchMore={false}
                      pageSize={5}
                    />
                  </ActiveFeedNameContext.Provider>
                </ForceListMode>
              </section>
            )}
          </>
        )}
      </PageWrapperLayout>
    </div>
  );
};

const getLeafPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));
LearnToCodeLeaf.getLayout = getLeafPageLayout;
LearnToCodeLeaf.layoutProps = { screenCentered: false };
export default LearnToCodeLeaf;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const { pages } = manifest as Manifest;
  return {
    paths: pages.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<LeafPageParams>): Promise<
  GetStaticPropsResult<LearnToCodeLeafProps>
> {
  const slugParts = params?.slug;
  if (!slugParts || slugParts.length === 0) {
    return { notFound: true, revalidate: 3600 };
  }
  const slug = slugParts.join('/');
  try {
    const dataModule = await import(`../../data/learn-to-code/${slug}.json`);
    const pageData = dataModule.default as LeafPageData;
    const seoTitles = getPageSeoTitles(
      `Learn ${pageData.title} with AI — Copy-Paste Prompts, Build Real Projects`,
    );
    return {
      props: {
        pageData,
        seo: {
          ...defaultSeo,
          ...seoTitles,
          openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
          description: pageData.description,
        } as NextSeoProps,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
