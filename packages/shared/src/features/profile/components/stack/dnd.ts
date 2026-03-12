import type {
  UserStack,
  ReorderUserStackInput,
} from '../../../../graphql/user/userStack';

export const SECTION_ORDER = [
  'Primary',
  'Hobby',
  'Learning',
  'Past',
  'Development',
  'Design',
  'Productivity',
  'Communication',
  'AI',
];

export const getSectionContainerId = (section: string): string =>
  `stack-section:${section}`;

export const isSectionContainerId = (value: string): boolean =>
  value.startsWith('stack-section:');

export const getSectionFromContainerId = (value: string): string =>
  value.replace('stack-section:', '');

export const sortSections = (sections: string[]): string[] =>
  [...sections].sort((a, b) => {
    const aIndex = SECTION_ORDER.indexOf(a);
    const bIndex = SECTION_ORDER.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }

    return a.localeCompare(b);
  });

export const buildSectionsState = (
  items: UserStack[],
): Record<string, UserStack[]> =>
  items.reduce<Record<string, UserStack[]>>((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }

    acc[item.section].push(item);

    return acc;
  }, {});

const findSectionForItem = (
  sections: Record<string, UserStack[]>,
  itemId: string,
): string | null => {
  const section = Object.keys(sections).find((key) =>
    sections[key].some((item) => item.id === itemId),
  );

  return section ?? null;
};

export const moveStackItem = ({
  activeId,
  overId,
  sections,
}: {
  activeId: string;
  overId: string;
  sections: Record<string, UserStack[]>;
}): Record<string, UserStack[]> => {
  const activeSection = findSectionForItem(sections, activeId);
  if (!activeSection) {
    throw new Error(`Missing source section for stack item ${activeId}`);
  }

  const overSection = isSectionContainerId(overId)
    ? getSectionFromContainerId(overId)
    : findSectionForItem(sections, overId);
  if (!overSection) {
    throw new Error(`Missing destination section for stack item ${overId}`);
  }

  const activeIndex = sections[activeSection].findIndex(
    (item) => item.id === activeId,
  );
  if (activeIndex === -1) {
    throw new Error(`Missing source index for stack item ${activeId}`);
  }

  const nextSections = Object.fromEntries(
    Object.entries(sections).map(([section, items]) => [section, [...items]]),
  );
  const [movedItem] = nextSections[activeSection].splice(activeIndex, 1);

  if (!movedItem) {
    throw new Error(`Missing moved stack item ${activeId}`);
  }

  const overIndex = isSectionContainerId(overId)
    ? nextSections[overSection].length
    : nextSections[overSection].findIndex((item) => item.id === overId);
  if (overIndex === -1) {
    throw new Error(`Missing destination index for stack item ${overId}`);
  }

  nextSections[overSection].splice(overIndex, 0, {
    ...movedItem,
    section: overSection,
  });

  return nextSections;
};

export const getReorderPayload = (
  sections: Record<string, UserStack[]>,
): ReorderUserStackInput[] =>
  Object.entries(sections).flatMap(([section, items]) =>
    items.map((item, position) => ({
      id: item.id,
      position,
      section,
    })),
  );
