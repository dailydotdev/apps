import {
  getBriefBlocks,
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

describe('getBriefBlocks', () => {
  it('returns every bullet and paragraph in the body', () => {
    const blocks = getBriefBlocks(render());

    expect(blocks).toHaveLength(4);
    expect(blocks[0].text).toContain(
      'AI agents are taking over your dev tools',
    );
    expect(blocks[2].text).toBe('A paragraph under the second heading.');
  });

  it('skips a paragraph that only wraps a list item', () => {
    const blocks = getBriefBlocks(
      render('<ul><li><p>Wrapped bullet</p></li></ul>'),
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0].node.tagName).toBe('LI');
  });

  it('drops empty blocks', () => {
    expect(getBriefBlocks(render('<p></p><p>  </p><p>Real</p>'))).toHaveLength(
      1,
    );
  });
});

describe('getBriefSection', () => {
  it('collects only the bullets under the named heading', () => {
    const section = getBriefSection(render(), 'Must know');

    expect(section?.heading.tagName).toBe('H2');
    expect(section?.blocks).toHaveLength(2);
    expect(section?.blocks[1].text).toContain('Postgres keeps eating');
  });

  it('stops at the next heading', () => {
    const section = getBriefSection(render(), 'Worth a look');

    expect(section?.blocks.map((block) => block.text)).toEqual([
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
  it('splits the claim from the evidence', () => {
    expect(splitBriefBullet('The claim: the evidence')).toEqual({
      lead: 'The claim',
      rest: 'the evidence',
    });
  });

  it('keeps a bullet with no lead whole', () => {
    expect(splitBriefBullet('One sentence with no colon')).toEqual({
      lead: 'One sentence with no colon',
    });
  });

  it('keeps a bullet whole when the colon is far too late to be a lead', () => {
    const value = `${'a'.repeat(130)}: trailing`;

    expect(splitBriefBullet(value)).toEqual({ lead: value });
  });
});
