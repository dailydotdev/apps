import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Compliance contract for the iubenda first-layer card, ported from the
 * marketing sites' consent-banner test (recruiter-landing) so both repos
 * enforce the same guarantees: equal prominence for Accept/Reject, relative
 * type, no hidden mandated copy, and the press-again counter defaults.
 */

const css = readFileSync(join(__dirname, '../styles/iubenda.css'), 'utf8');

interface Rule {
  selector: string;
  body: string;
}

/**
 * Every style rule in the file, with at-rule wrappers flattened so the
 * `@media` overrides are reachable. A regex cannot do this: `[^}]*` treats
 * an at-rule's first nested rule as the at-rule's own body, which would hide
 * every mobile override from these assertions.
 */
const rules = (): Rule[] => {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Rule[] = [];
  let head = '';

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '}') {
      head = '';
    } else if (ch !== '{') {
      head += ch;
    } else {
      const selector = head.trim();
      head = '';
      // at-rules are descended into rather than captured
      if (!selector.startsWith('@')) {
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
          if (text[j] === '{') {
            depth += 1;
          } else if (text[j] === '}') {
            depth -= 1;
          }
          j += 1;
        }
        out.push({ selector, body: text.slice(i + 1, j - 1) });
        i = j - 1;
      }
    }
  }

  return out;
};

/**
 * Rules that style `token` itself — the class as the last simple selector in
 * some part of the list, optionally with pseudo-classes. Excludes descendant
 * and pseudo-element rules: `#iubenda-cs-paragraph br` styles a line break,
 * not the copy.
 */
const rulesTargeting = (token: string): string[] => {
  const target = new RegExp(`${token}(?![\\w-])(?::[\\w-().]+)*\\s*$`);
  return rules()
    .filter(({ selector }) =>
      selector.split(',').some((part) => target.test(part.trim())),
    )
    .map(({ body }) => body);
};

const declared = (bodies: string[], prop: string): string[] =>
  bodies.flatMap((body) =>
    [...body.matchAll(new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`, 'g'))].map(
      (m) => m[1].trim().replace(/\s+/g, ' '),
    ),
  );

describe('iubenda consent banner css', () => {
  it('keeps Reject and Accept at equal prominence', () => {
    // Structural, not value-by-value: every rule that names one of the two
    // buttons has to name the other in the same selector list. Comparing
    // colours would pass for a pair that agrees by luck today; this fails
    // the moment either button gets a style the other does not — which is
    // the shape the nudge toward Accept always takes.
    const unpaired = rules()
      .map(({ selector }) => selector)
      .filter(
        (selector) =>
          selector.includes('iubenda-cs-accept-btn') !==
          selector.includes('iubenda-cs-reject-btn'),
      );
    expect(unpaired).toEqual([]);
    // …and the pair is actually styled somewhere, so the loop above cannot
    // pass by matching nothing at all.
    expect(rulesTargeting('iubenda-cs-accept-btn').length).toBeGreaterThan(0);
  });

  it('sizes the pair from one shared rule they cannot drift from', () => {
    const shared = rules().filter(({ selector }) =>
      selector.includes('button:not(.dd-cs-more)'),
    );
    expect(shared.length).toBeGreaterThan(0);
    ['min-height', 'font-size', 'font-weight', 'padding'].forEach((prop) => {
      expect(
        declared(
          shared.map((r) => r.body),
          prop,
        ).length,
      ).toBeGreaterThan(0);
    });
    ['iubenda-cs-reject-btn', 'iubenda-cs-accept-btn'].forEach((cls) => {
      const bodies = rulesTargeting(cls);
      [
        'font-size',
        'min-height',
        'width',
        'opacity',
        'transform',
        'font-weight',
        'flex',
        'padding',
        'visibility',
      ].forEach((prop) => {
        expect(declared(bodies, prop)).toEqual([]);
      });
    });
  });

  it('gives Reject and Accept the same width whatever their labels say', () => {
    // iubenda wraps Customize+Reject in one box and Accept in another, so
    // each button would size against its own wrapper's slack — equal
    // styling, unequal boxes. `display: contents` removes both wrappers
    // from layout; without it the shared `flex` basis is resolved in two
    // different containers and the pair silently diverges.
    const wrappers = rules().filter(
      ({ selector }) =>
        selector.includes('iubenda-cs-opt-group-custom') ||
        selector.includes('iubenda-cs-opt-group-consent'),
    );
    expect(wrappers.length).toBeGreaterThan(0);
    wrappers.forEach(({ body }) => {
      expect(body).toMatch(/display: contents/);
    });

    const shared = rules().filter(({ selector }) =>
      selector.includes('button:not(.dd-cs-more)'),
    );
    expect(
      declared(
        shared.map((r) => r.body),
        'flex',
      ),
    ).toContain('1 1 0');

    // Equal width is only half of equal: with one width, a caption that
    // wraps in one button and not the other makes them different heights
    // unless the row stretches — and captions are dashboard-editable. The
    // gear and the show-more control opt out; stretching a square icon
    // button gives a rectangle with a gear floating in it.
    const row = rules().filter(
      ({ selector }) =>
        selector.trim() === '#iubenda-cs-banner .iubenda-cs-opt-group',
    );
    expect(
      declared(
        row.map((r) => r.body),
        'align-items',
      ),
    ).toContain('stretch');
    ['iubenda-cs-customize-btn', 'dd-cs-more'].forEach((cls) => {
      expect(declared(rulesTargeting(cls), 'align-self')).toContain('center');
    });
  });

  it('aligns the button row with the copy above it, at both widths', () => {
    // Left inset only. The copy's RIGHT inset is deliberately larger (it
    // clears the close x); the left edge is the one both share.
    const leftInset = (bodies: string[]) =>
      declared(bodies, 'padding')
        .map((value) => value.split(/\s+/))
        .filter((parts) => parts.length >= 3)
        .map((parts) => (parts.length >= 4 ? parts[3] : parts[1]));

    const copy = leftInset(rulesTargeting('iubenda-banner-content'));
    const row = leftInset(rulesTargeting('iubenda-cs-opt-group'));
    expect(copy.length).toBeGreaterThan(0);
    expect(row.length).toBe(copy.length); // desktop + the mobile override
    expect(row).toEqual(copy);
  });

  it("sizes every bit of banner text relative to the reader's font size", () => {
    // WCAG 1.4.4: a reader who raises their browser font size should get a
    // bigger banner, not one that ignores them. The unitless `font-size: 0`
    // on the icon-only Customize button is not type and never reaches this
    // list.
    const pixelType = rules().flatMap(({ selector, body }) =>
      declared([body], 'font-size')
        .filter((value) => value.endsWith('px'))
        .map((value) => `${selector} { font-size: ${value} }`),
    );
    expect(pixelType).toEqual([]);
  });

  it('never clips a consent label, whatever the language', () => {
    // `white-space: normal` only breaks at spaces, so one shared width plus
    // a long single word ("Zustimmen") is clipped text rather than a
    // narrower button.
    const shared = rules().filter(({ selector }) =>
      selector.includes('button:not(.dd-cs-more)'),
    );
    expect(
      declared(
        shared.map((r) => r.body),
        'overflow-wrap',
      ),
    ).toContain('break-word');

    // On phones the row wraps instead, handing the show-more control its
    // own line so the pair keeps enough width in every banner language.
    expect(
      declared(rulesTargeting('iubenda-cs-opt-group'), 'flex-wrap'),
    ).toContain('wrap');
    expect(declared(rulesTargeting('dd-cs-more'), 'flex')).toContain(
      '1 1 100%',
    );
  });

  it('hides the raw close glyph so the redrawn cross is the only one', () => {
    // closeButtonRejects makes this a consent decision; the accessible name
    // comes from iubendaBanner.ts since pseudo-elements carry none.
    expect(css).toMatch(/\.iubenda-cs-close-btn span \{[^}]*display: none/);
  });

  it('layers the mandated copy without removing text', () => {
    const clamps = [...css.matchAll(/(?:-webkit-)?line-clamp:\s*(\d+)/g)];
    // Without this the loop passes by finding nothing — exactly what would
    // happen if the clamp were swapped for `max-height` + `overflow: hidden`.
    expect(clamps.length).toBeGreaterThan(0);
    clamps.forEach((clamp) => {
      expect(Number(clamp[1])).toBeGreaterThanOrEqual(4);
    });
    expect(css).toContain(
      '#iubenda-cs-banner #iubenda-cs-paragraph br:first-of-type',
    );
    expect(css).toMatch(/\.iubenda-banner-content \{[^}]*overflow-y: auto/);
    const paragraph = rulesTargeting('iubenda-cs-paragraph');
    expect(paragraph.length).toBeGreaterThan(0);
    paragraph.forEach((rule) => {
      expect(rule).not.toMatch(/display:\s*none/);
    });
  });

  it('hides the press-again counter at zero and reveals it when counting', () => {
    // applyStyles:false drops iubenda's own `display: none` on this element,
    // so without a default here it reads "Press again to continue 0/2" on
    // every banner.
    expect(declared(rulesTargeting('iubenda-cs-counter'), 'display')).toContain(
      'none',
    );
    // But it must still appear if the gate ever fires, or Accept looks dead.
    expect(css).toMatch(
      /\.dd-cs-counting \.iubenda-cs-counter \{[^}]*display: block/,
    );
  });

  it('paints from theme tokens only, so the card follows the active theme', () => {
    const colorValues = rules().flatMap(({ body }) =>
      ['color', 'background', 'background-color', 'border-color'].flatMap(
        (prop) => declared([body], prop),
      ),
    );
    colorValues.forEach((value) => {
      expect(value).toMatch(
        /var\(--theme-|currentcolor|transparent|none|color-mix/,
      );
    });
  });

  it('mirrors every html.light override for the auto theme', () => {
    // Auto mode puts html.auto (not html.light) on the root and resolves
    // light via prefers-color-scheme, so a light-only override leaves
    // Auto+light-OS users with the dark treatment.
    const overrides = (prefix: string) =>
      rules()
        .filter(({ selector }) => selector.startsWith(prefix))
        .map(({ selector, body }) => ({
          tail: selector.slice(prefix.length).trim(),
          body: body.replace(/\s+/g, ' ').trim(),
        }))
        .sort((a, b) => a.tail.localeCompare(b.tail));

    const light = overrides('html.light');
    const auto = overrides('html.auto');
    expect(light.length).toBeGreaterThan(0);
    expect(auto).toEqual(light);
  });
});
