import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/ButtonV2';

/**
 * InspirationButtons — visual references for the /dev/buttons review page.
 *
 * These components stylise our four North-Star products (Linear, Notion,
 * ChatGPT, Claude) so we can park their button DNA next to ours in the
 * comparison table. They are NOT design-system components and must NOT
 * be exported from `packages/shared`. They live alongside the dev page
 * to keep the visual reference sharp without contaminating production
 * tokens.
 *
 * Numbers are sourced from:
 *   - Linear: public design system preview (linear.app radius scale = 6 px buttons)
 *   - Claude: Anthropic playground recommends `12 px radius, 24 px H pad`
 *   - Notion / ChatGPT: empirical inspection from their live apps
 */

export type Inspiration = 'linear' | 'notion' | 'chatgpt' | 'claude';

type InspirationState = 'default' | 'hover' | 'active' | 'disabled';

interface InspirationButtonProps {
  source: Inspiration;
  variant: ButtonVariant;
  state?: InspirationState;
  children?: ReactNode;
}

/**
 * Per-variant mapping to the closest-feeling reference. We pick ONE
 * North Star per variant rather than all four, because the table needs
 * to stay readable. The full multi-vendor matrix lives in the
 * `Inspiration anchors` section of the page.
 */
export const inspirationByVariant: Record<ButtonVariant, Inspiration> = {
  [ButtonVariant.Primary]: 'chatgpt',
  [ButtonVariant.Secondary]: 'linear',
  [ButtonVariant.Tertiary]: 'notion',
  [ButtonVariant.Float]: 'claude',
  [ButtonVariant.Subtle]: 'linear',
  [ButtonVariant.Option]: 'chatgpt',
  [ButtonVariant.Quiz]: 'linear',
};

const SOURCE_LABEL: Record<Inspiration, string> = {
  linear: 'Linear',
  notion: 'Notion',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
};

type LookFn = (state: InspirationState) => string;

/**
 * Linear's button language: 6 px radius, 12 px H padding, 32 px tall,
 * 13 px Inter Medium label, dark-mode bg = neutral 90, hover = neutral
 * 80 with a 1 px border lift.
 */
const linearStyles: Record<'primary' | 'outlined' | 'ghost' | 'quiz', LookFn> =
  {
    primary: (state) => {
      if (state === 'hover') {
        return 'bg-[#7B7BFF] text-white';
      }
      if (state === 'active') {
        return 'bg-[#5b5bd6] text-white';
      }
      return 'bg-[#5E6AD2] text-white';
    },
    outlined: (state) =>
      state === 'hover'
        ? 'bg-[#1f1f24] text-[#ededed] border border-[#3a3a3f]'
        : 'bg-[#191920] text-[#ededed] border border-[#2a2a2f]',
    ghost: (state) =>
      state === 'hover'
        ? 'bg-[#1f1f24] text-[#ededed]'
        : 'bg-transparent text-[#a0a0aa]',
    quiz: (state) =>
      state === 'hover'
        ? 'bg-[#1f1f24] text-[#ededed] border border-[#5E6AD2]'
        : 'bg-[#191920] text-[#ededed] border border-[#2a2a2f]',
  };

const linearKindFor = (variant: ButtonVariant) => {
  if (variant === ButtonVariant.Primary) {
    return 'primary' as const;
  }
  if (variant === ButtonVariant.Secondary || variant === ButtonVariant.Subtle) {
    return 'outlined' as const;
  }
  if (variant === ButtonVariant.Quiz) {
    return 'quiz' as const;
  }
  return 'ghost' as const;
};

const LinearButton = ({
  variant,
  state = 'default',
  children,
}: {
  variant: ButtonVariant;
  state?: InspirationState;
  children?: ReactNode;
}) => {
  const base =
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150';
  const fill = linearStyles[linearKindFor(variant)](state);
  const cursor =
    state === 'disabled' ? 'cursor-not-allowed opacity-50' : 'cursor-default';
  return (
    <button type="button" className={`${base} ${fill} ${cursor}`}>
      {children}
    </button>
  );
};

/**
 * Notion's button language: 6 px radius, ~10 px H padding, 28 px tall,
 * 14 px Inter Medium label, very low-key default state.
 */
const notionStyles: Record<'primary' | 'outlined' | 'ghost', LookFn> = {
  primary: (state) =>
    state === 'hover' ? 'bg-[#2382E2] text-white' : 'bg-[#2383E2] text-white',
  outlined: (state) =>
    state === 'hover'
      ? 'bg-[#37352f0a] text-[#37352f] border border-[#37352f29]'
      : 'bg-white text-[#37352f] border border-[#37352f1f] shadow-[0_1px_2px_rgba(15,15,15,0.06)]',
  ghost: (state) =>
    state === 'hover'
      ? 'bg-[#37352f0d] text-[#37352f]'
      : 'bg-transparent text-[#37352fbf]',
};

const notionKindFor = (variant: ButtonVariant) => {
  if (variant === ButtonVariant.Primary) {
    return 'primary' as const;
  }
  if (
    variant === ButtonVariant.Secondary ||
    variant === ButtonVariant.Subtle ||
    variant === ButtonVariant.Quiz
  ) {
    return 'outlined' as const;
  }
  return 'ghost' as const;
};

const NotionButton = ({
  variant,
  state = 'default',
  children,
}: {
  variant: ButtonVariant;
  state?: InspirationState;
  children?: ReactNode;
}) => {
  const base =
    'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[14px] font-medium transition-colors duration-150';
  const fill = notionStyles[notionKindFor(variant)](state);
  const cursor =
    state === 'disabled' ? 'cursor-not-allowed opacity-50' : 'cursor-default';
  return (
    <button type="button" className={`${base} ${fill} ${cursor}`}>
      {children}
    </button>
  );
};

/**
 * ChatGPT's button language: ~16 px radius (`rounded-2xl`) for the
 * in-chat Send button and CTAs; near-black fill in light mode, white
 * text, `font-semibold` (600) label. We deliberately drop ChatGPT's
 * landing-page "pill" form because our house rule is "always rectangle
 * with corner radius" — a single corner-language across the product.
 */
const chatgptStyles: Record<'primary' | 'option' | 'outlined', LookFn> = {
  primary: (state) => {
    if (state === 'hover') {
      return 'bg-[#1a1a1a] text-white';
    }
    if (state === 'active') {
      return 'bg-[#000000] text-white';
    }
    return 'bg-[#0d0d0d] text-white';
  },
  option: (state) =>
    state === 'hover'
      ? 'bg-[#0d0d0d0d] text-[#0d0d0d]'
      : 'bg-transparent text-[#5d5d5d] font-medium',
  outlined: (state) =>
    state === 'hover'
      ? 'bg-[#0d0d0d0d] text-[#0d0d0d] border border-[#0d0d0d29]'
      : 'bg-white text-[#0d0d0d] border border-[#0d0d0d1f] font-medium',
};

const chatgptKindFor = (variant: ButtonVariant) => {
  if (variant === ButtonVariant.Primary || variant === ButtonVariant.Quiz) {
    return 'primary' as const;
  }
  if (variant === ButtonVariant.Option) {
    return 'option' as const;
  }
  return 'outlined' as const;
};

const ChatGPTButton = ({
  variant,
  state = 'default',
  children,
}: {
  variant: ButtonVariant;
  state?: InspirationState;
  children?: ReactNode;
}) => {
  const base =
    'inline-flex h-9 items-center justify-center gap-2 rounded-2xl px-4 text-[14px] font-semibold transition-colors duration-150';
  const fill = chatgptStyles[chatgptKindFor(variant)](state);
  const cursor =
    state === 'disabled' ? 'cursor-not-allowed opacity-50' : 'cursor-default';
  return (
    <button type="button" className={`${base} ${fill} ${cursor}`}>
      {children}
    </button>
  );
};

/**
 * Claude's button language: 8-12 px radius, 16 px H padding, 36 px
 * tall, 14 px Inter Medium label, brand fill (Claude's "clay" warm
 * orange #cc785c) for primary, sandy neutrals for secondary.
 * Anthropic's design playground literally documents
 * "12 px radius, 24 px H pad" as the recommendation.
 */
const claudeStyles: Record<'primary' | 'float' | 'outlined' | 'ghost', LookFn> =
  {
    primary: (state) => {
      if (state === 'hover') {
        return 'bg-[#bd6b51] text-white';
      }
      if (state === 'active') {
        return 'bg-[#a55d46] text-white';
      }
      return 'bg-[#cc785c] text-white';
    },
    float: (state) =>
      state === 'hover'
        ? 'bg-[#f0eee6] text-[#1f1e1c] border border-[#e1ddc9]'
        : 'bg-[#faf9f5] text-[#1f1e1c] border border-[#ebe7d7]',
    outlined: (state) =>
      state === 'hover'
        ? 'bg-[#f0eee6] text-[#1f1e1c] border border-[#cc785c]'
        : 'bg-transparent text-[#1f1e1c] border border-[#1f1e1c33]',
    ghost: (state) =>
      state === 'hover'
        ? 'bg-[#1f1e1c0a] text-[#1f1e1c]'
        : 'bg-transparent text-[#5d5b58]',
  };

const claudeKindFor = (variant: ButtonVariant) => {
  if (variant === ButtonVariant.Primary) {
    return 'primary' as const;
  }
  if (variant === ButtonVariant.Float) {
    return 'float' as const;
  }
  if (
    variant === ButtonVariant.Secondary ||
    variant === ButtonVariant.Subtle ||
    variant === ButtonVariant.Quiz
  ) {
    return 'outlined' as const;
  }
  return 'ghost' as const;
};

const ClaudeButton = ({
  variant,
  state = 'default',
  children,
}: {
  variant: ButtonVariant;
  state?: InspirationState;
  children?: ReactNode;
}) => {
  const base =
    'inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium transition-colors duration-150';
  const fill = claudeStyles[claudeKindFor(variant)](state);
  const cursor =
    state === 'disabled' ? 'cursor-not-allowed opacity-50' : 'cursor-default';
  return (
    <button type="button" className={`${base} ${fill} ${cursor}`}>
      {children}
    </button>
  );
};

export const InspirationButton = ({
  source,
  variant,
  state,
  children,
}: InspirationButtonProps): ReactElement => {
  const label = children ?? variant;
  switch (source) {
    case 'linear':
      return (
        <LinearButton variant={variant} state={state}>
          {label}
        </LinearButton>
      );
    case 'notion':
      return (
        <NotionButton variant={variant} state={state}>
          {label}
        </NotionButton>
      );
    case 'chatgpt':
      return (
        <ChatGPTButton variant={variant} state={state}>
          {label}
        </ChatGPTButton>
      );
    case 'claude':
      return (
        <ClaudeButton variant={variant} state={state}>
          {label}
        </ClaudeButton>
      );
    default:
      return <span>{label}</span>;
  }
};

export const InspirationLabel = ({
  source,
}: {
  source: Inspiration;
}): ReactElement => (
  <span className="text-text-tertiary typo-caption2">
    {SOURCE_LABEL[source]}
  </span>
);
