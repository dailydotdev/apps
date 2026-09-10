import {
  BRIEF_BLOCK_SELECTOR,
  getBriefSection,
  splitBriefBullet,
} from './briefBodyBlocks';

const BODY = `
  <h2>Must know</h2>
  <ul>
    <li><strong>AI agents are taking over your dev tools</strong>: The shift is accelerating.</li>
    <li><strong>Postgres keeps eating the specialists</strong>: One engine, every workload.</li>
  </ul>
  <h2>Worth a look</h2>
  <p>A paragraph under the second heading.</p>
  <ul>
    <li>A bullet under the second heading.</li>
  </ul>
`;

const render = (html = BODY) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  return container;
};

describe('BRIEF_BLOCK_SELECTOR', () => {
  it('matches every bullet and paragraph in the body', () => {
    const blocks = render().querySelectorAll(BRIEF_BLOCK_SELECTOR);

    expect(Array.from(blocks, (block) => block.tagName)).toEqual([
      'LI',
      'LI',
      'P',
      'LI',
    ]);
  });

  it('skips a paragraph that only wraps a list item', () => {
    const blocks = render(
      '<ul><li><p>Wrapped bullet</p></li></ul>',
    ).querySelectorAll(BRIEF_BLOCK_SELECTOR);

    expect(Array.from(blocks, (block) => block.tagName)).toEqual(['LI']);
  });
});

describe('getBriefSection', () => {
  it('collects only the bullets under the named heading', () => {
    const section = getBriefSection(render(), 'Must know');

    expect(section?.heading.tagName).toBe('H2');
    expect(section?.blocks).toHaveLength(2);
    expect(section?.blocks[1]).toContain('Postgres keeps eating');
  });

  it('stops at the next heading', () => {
    const section = getBriefSection(render(), 'Worth a look');

    expect(section?.blocks).toEqual([
      'A paragraph under the second heading.',
      'A bullet under the second heading.',
    ]);
  });

  it('matches the heading regardless of case', () => {
    expect(getBriefSection(render(), 'must KNOW')?.blocks).toHaveLength(2);
  });

  it('returns null when the brief has no such section', () => {
    expect(getBriefSection(render(), 'Deep dive')).toBeNull();
  });
});

describe('splitBriefBullet', () => {
  it('keeps the claim and drops the evidence', () => {
    expect(splitBriefBullet('The claim: the evidence')).toBe('The claim');
  });

  it('keeps a bullet with no lead whole', () => {
    expect(splitBriefBullet('One sentence with no colon')).toBe(
      'One sentence with no colon',
    );
  });

  it('keeps a bullet whole when the colon is far too late to be a lead', () => {
    const value = `${'a'.repeat(130)}: trailing`;

    expect(splitBriefBullet(value)).toBe(value);
  });
});
