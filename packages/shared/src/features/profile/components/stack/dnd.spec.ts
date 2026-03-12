import {
  buildSectionsState,
  getReorderPayload,
  getSectionContainerId,
  moveStackItem,
  sortSections,
} from './dnd';

const createItem = ({
  id,
  section,
  position,
}: {
  id: string;
  section: string;
  position: number;
}) => ({
  id,
  section,
  position,
  tool: {
    id: `${id}-tool`,
    title: `${id}-tool`,
    faviconUrl: null,
  },
  startedAt: null,
  icon: null,
  title: null,
  createdAt: '2026-03-12T00:00:00.000Z',
});

describe('stack dnd helpers', () => {
  it('should move an item between sections', () => {
    const sections = buildSectionsState([
      createItem({ id: 'a', section: 'Primary', position: 0 }),
      createItem({ id: 'b', section: 'Hobby', position: 0 }),
    ]);

    const next = moveStackItem({
      activeId: 'a',
      overId: 'b',
      sections,
    });

    expect(next.Primary).toEqual([]);
    expect(next.Hobby.map((item) => item.id)).toEqual(['a', 'b']);
    expect(next.Hobby[0].section).toBe('Hobby');
  });

  it('should append an item into an empty section container', () => {
    const sections = {
      Primary: [createItem({ id: 'a', section: 'Primary', position: 0 })],
      Hobby: [],
    };

    const next = moveStackItem({
      activeId: 'a',
      overId: getSectionContainerId('Hobby'),
      sections,
    });

    expect(next.Primary).toEqual([]);
    expect(next.Hobby.map((item) => item.id)).toEqual(['a']);
  });

  it('should reorder an item downward within the same section', () => {
    const sections = buildSectionsState([
      createItem({ id: 'a', section: 'Primary', position: 0 }),
      createItem({ id: 'b', section: 'Primary', position: 1 }),
      createItem({ id: 'c', section: 'Primary', position: 2 }),
    ]);

    const next = moveStackItem({
      activeId: 'a',
      overId: 'b',
      sections,
    });

    expect(next.Primary.map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('should include section updates in reorder payload', () => {
    const payload = getReorderPayload({
      Primary: [],
      Hobby: [
        createItem({ id: 'a', section: 'Hobby', position: 0 }),
        createItem({ id: 'b', section: 'Hobby', position: 1 }),
      ],
    });

    expect(payload).toEqual([
      { id: 'a', position: 0, section: 'Hobby' },
      { id: 'b', position: 1, section: 'Hobby' },
    ]);
  });

  it('should keep predefined sections first', () => {
    expect(sortSections(['Zeta', 'Hobby', 'Primary', 'Alpha'])).toEqual([
      'Primary',
      'Hobby',
      'Alpha',
      'Zeta',
    ]);
  });
});
