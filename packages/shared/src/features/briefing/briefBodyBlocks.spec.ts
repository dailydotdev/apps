import {
  briefContentHtml,
  briefContentHtmlWithoutMustKnow,
} from '../../../__tests__/fixture/brief';
import {
  BRIEF_BLOCK_SELECTOR,
  getBriefBlockLabel,
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
    expect(
      getBriefSection(render(briefContentHtmlWithoutMustKnow), 'Must know'),
    ).toBeNull();
  });

  it('leaves the link to the sources out of every bullet', () => {
    const section = getBriefSection(render(briefContentHtml), 'Must know');

    expect(section?.blocks).toHaveLength(3);
    section?.blocks.forEach((block) => expect(block).not.toMatch(/Read more/));
    expect(section?.blocks[0]).toMatch(/protect their model weights\.$/);
    // A bullet backed by several posts links to a feed of them instead.
    expect(section?.blocks[2]).toMatch(/AI-assisted discovery tools\.$/);
  });
});

describe('getBriefBlockLabel', () => {
  it('names the button after the opening of its block', () => {
    expect(
      getBriefBlockLabel(
        'US intelligence labels Chinese AI distillation a national security threat: A joint advisory',
      ),
    ).toBe(
      'Snapshot: US intelligence labels Chinese AI distillation a national…',
    );
  });

  it('keeps a short block whole', () => {
    expect(getBriefBlockLabel('Short block')).toBe('Snapshot: Short block');
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
