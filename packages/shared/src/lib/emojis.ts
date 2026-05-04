import emojiData from 'emojibase-data/en/compact.json';
import { storageWrapper } from './storageWrapper';

const recentEmojiStorageKey = 'emoji-picker-recent-v1';
const maxRecentEmojis = 32;

const emojiGroup = {
  smileysEmotion: 0,
  peopleBody: 1,
  animalsNature: 3,
  foodDrink: 4,
  travelPlaces: 5,
  activities: 6,
  objects: 7,
  symbols: 8,
  flags: 9,
} as const;

export type EmojiCategoryId =
  | 'recent'
  | 'smileys-emotion'
  | 'people-body'
  | 'animals-nature'
  | 'food-drink'
  | 'travel-places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags';

export type EmojiOption = {
  emoji: string;
  label: string;
  tags: string[];
  order: number;
};

export type EmojiCategory = {
  id: EmojiCategoryId;
  label: string;
  icon: string;
  emojis: EmojiOption[];
};

type EmojiDataItem = {
  emoji?: string;
  group?: number;
  label?: string;
  order?: number;
  tags?: string[];
  unicode?: string;
};

type BaseEmojiCategory = Omit<EmojiCategory, 'emojis'> & {
  group: number;
};

const baseCategories: BaseEmojiCategory[] = [
  {
    id: 'smileys-emotion',
    label: 'Smileys & emotion',
    icon: '😀',
    group: emojiGroup.smileysEmotion,
  },
  {
    id: 'people-body',
    label: 'People & body',
    icon: '👋',
    group: emojiGroup.peopleBody,
  },
  {
    id: 'animals-nature',
    label: 'Animals & nature',
    icon: '🌿',
    group: emojiGroup.animalsNature,
  },
  {
    id: 'food-drink',
    label: 'Food & drink',
    icon: '🍔',
    group: emojiGroup.foodDrink,
  },
  {
    id: 'travel-places',
    label: 'Travel & places',
    icon: '🚀',
    group: emojiGroup.travelPlaces,
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '⚽',
    group: emojiGroup.activities,
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '💡',
    group: emojiGroup.objects,
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: '❤️',
    group: emojiGroup.symbols,
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: '🚩',
    group: emojiGroup.flags,
  },
];

const toEmojiOption = (item: EmojiDataItem): EmojiOption | null => {
  const emoji = item.emoji ?? item.unicode;

  if (!emoji || typeof item.group !== 'number') {
    return null;
  }

  return {
    emoji,
    label: item.label ?? emoji,
    tags: item.tags ?? [],
    order: item.order ?? Number.MAX_SAFE_INTEGER,
  };
};

const emojiDataByGroup = new Map<number, EmojiOption[]>();

(emojiData as EmojiDataItem[]).forEach((item) => {
  const option = toEmojiOption(item);

  if (!option || typeof item.group !== 'number') {
    return;
  }

  const group = emojiDataByGroup.get(item.group) ?? [];
  group.push(option);
  emojiDataByGroup.set(item.group, group);
});

export const emojiCategories: EmojiCategory[] = baseCategories.map(
  ({ group, ...category }) => ({
    ...category,
    emojis: (emojiDataByGroup.get(group) ?? []).sort(
      (a, b) => a.order - b.order,
    ),
  }),
);

const allEmojiOptions = emojiCategories.flatMap((category) => category.emojis);

export const findEmojiOption = (emoji: string): EmojiOption | undefined => {
  return allEmojiOptions.find((item) => item.emoji === emoji);
};

export const searchEmojis = (query: string, limit = 80): EmojiOption[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return allEmojiOptions
    .filter(({ emoji, label, tags }) => {
      const searchable = [emoji, label, ...tags].join(' ').toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
};

export const getRecentEmojis = (): string[] => {
  const stored = storageWrapper.getItem(recentEmojiStorageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === 'string' && !!item)
      .filter((item) => !!findEmojiOption(item))
      .slice(0, maxRecentEmojis);
  } catch {
    return [];
  }
};

export const saveRecentEmoji = (emoji: string): string[] => {
  const next = [
    emoji,
    ...getRecentEmojis().filter((item) => item !== emoji),
  ].slice(0, maxRecentEmojis);

  storageWrapper.setItem(recentEmojiStorageKey, JSON.stringify(next));
  return next;
};
