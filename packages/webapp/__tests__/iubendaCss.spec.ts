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
    // structural: a rule naming one button must name the other, so any
    // one-sided styling (the shape a nudge toward Accept takes) fails
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

  it('cannot recess one side of the choice through its wrapper', () => {
    // iubenda puts Reject in .iubenda-cs-opt-group-custom and Accept in
    // .iubenda-cs-opt-group-consent, so a rule scoped to one wrapper — by
    // class or by position — restyles half the choice without ever naming a
    // button, which the paired-selector check above cannot see
    const side = (selector: string, own: string, ordinal: RegExp) =>
      selector.includes(own) || ordinal.test(selector);
    const oneSided = rules().filter(({ selector }) => {
      if (!selector.includes('iubenda-cs-opt-group')) {
        return false;
      }
      const custom = side(
        selector,
        'opt-group-custom',
        /:(first-of-type|first-child|nth-child\(1\))/,
      );
      const consent = side(
        selector,
        'opt-group-consent',
        /:(last-of-type|last-child|nth-child\(2\))/,
      );
      return custom !== consent;
    });

    oneSided.forEach(({ body }) => {
      [
        'display',
        'opacity',
        'visibility',
        'font-weight',
        'font-size',
        'transform',
        'order',
      ].forEach((prop) => {
        expect(declared([body], prop)).toEqual([]);
      });
    });
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
    // without display:contents the shared flex basis resolves inside two
    // different iubenda wrapper boxes and the pair silently diverges
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

    // the row must stretch so dashboard-edited captions cannot give the
    // pair unequal heights; the gear and show-more control opt out
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
    // WCAG 1.4.4; the unitless `font-size: 0` on the icon-only Customize
    // button is not type and never reaches this list
    const pixelType = rules().flatMap(({ selector, body }) =>
      declared([body], 'font-size')
        .filter((value) => value.endsWith('px'))
        .map((value) => `${selector} { font-size: ${value} }`),
    );
    expect(pixelType).toEqual([]);
  });

  it('never clips a consent label, whatever the language', () => {
    // one shared width plus a long unbreakable word ("Zustimmen") clips
    // without overflow-wrap
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
    // box-shadow is the deliberate exception: no theme token carries the soft
    // two-layer treatment, so it is written raw and re-declared per theme by
    // the light/auto overrides the next test pins
    const colorValues = rules().flatMap(({ body }) =>
      [
        'color',
        'background',
        'background-color',
        'border-color',
        'border',
      ].flatMap((prop) => declared([body], prop)),
    );
    colorValues.forEach((value) => {
      expect(value).toMatch(
        /var\(--theme-|currentcolor|transparent|none|color-mix|^0$/,
      );
    });
  });

  it('mirrors every html.light override for the auto theme', () => {
    // Auto mode puts html.auto (not html.light) on the root and resolves
    // light via prefers-color-scheme, so a light-only override leaves
    // Auto+light-OS users with the dark treatment.
    // The parser flattens at-rules, so guard the media scope separately: an
    // unwrapped html.auto rule would light-theme Auto users on a dark OS.
    expect(css).toMatch(
      /@media \(prefers-color-scheme: light\) \{\s*html\.auto/,
    );

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
