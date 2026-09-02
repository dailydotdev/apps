/**
 * The authoring contract, enforced.
 *
 * Three tables exist twice by necessity. `@dailydotdev/world-kit` cannot import
 * the renderer (it has to run in node, and the taxonomy imports three on its
 * first line), and the renderer must not need the package to boot. So the
 * envelopes, the tier thresholds, the realm grouping and the palette names are
 * written on both sides.
 *
 * World.md's whole complaint about this world is contracts no schema enforces.
 * These tests are the schema: a copy that drifts fails here rather than in
 * somebody's district, where the symptom would be a builder that validates
 * locally and renders wrong, or refuses to render at all.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  budgetOf,
  FAMILY_KINDS,
  hashSource,
  OPS_VERSION,
  paletteKeys,
  REALM_OF,
  REALMS,
  tierOf,
} from '@dailydotdev/world-kit';
import {
  NICHE_OF as RAW_NICHE_OF,
  REALM_OF as RAW_REALM_OF,
  paletteOf,
} from '../../components/world/engine/taxonomy';
import {
  stableWorldJson,
  worldPayloadHash,
} from '../../components/world/authoredPayload';

/* The taxonomy is untyped JS on purpose (it is the renderer's, and the renderer
   is plain JavaScript), so the shapes this test needs are stated here. */
const NICHE_OF = RAW_NICHE_OF as Record<string, { sig: string }>;
const ENGINE_REALM_OF = RAW_REALM_OF as Record<string, { id: string }>;
const palette = paletteOf as (
  realm: unknown,
  niche: unknown,
) => Record<string, number>;

const enginePath = join(__dirname, '../../components/world/engine/world.js');
const engineSource = readFileSync(enginePath, 'utf8');

/**
 * Pull one of the engine's authoring tables back out as data.
 *
 * Parsed, never evaluated. These tables are plain object literals of numbers, so
 * quoting the keys turns one into JSON, and the test never has to run a line of
 * the renderer to read them.
 */
const engineTable = <T>(name: string): Record<string, T> => {
  const start = engineSource.indexOf(`const ${name}={`);
  expect(start).toBeGreaterThan(-1);

  const open = engineSource.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (; end < engineSource.length; end += 1) {
    if (engineSource[end] === '{') {
      depth += 1;
    }
    if (engineSource[end] === '}') {
      depth -= 1;
      if (!depth) {
        break;
      }
    }
  }

  const json = engineSource
    .slice(open, end + 1)
    .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(json) as Record<string, T>;
};

describe('world authoring contract', () => {
  it('grants the same families on both sides', () => {
    const engineFamilies = engineSource
      .match(/const AUTH_FAMILIES=\[([^\]]+)\]/)![1]
      .split(',')
      .map((entry) => entry.trim().replace(/'/g, ''));

    expect(engineFamilies.sort()).toEqual([...FAMILY_KINDS].sort());
  });

  it('unlocks each family at the same rung on both sides', () => {
    const engineTierAt = engineTable<number[]>('AUTH_TIER_AT');

    FAMILY_KINDS.forEach((family) => {
      expect(engineTierAt[family]).toBeDefined();
      // Derived rather than compared directly: the package exposes the rung a
      // family reaches a tier at only through `tierOf`, which is the thing that
      // actually decides, so that is what has to agree.
      engineTierAt[family].forEach((rung, index) => {
        expect(tierOf(family, rung)).toBe(index + 1);
        if (rung > 1) {
          expect(tierOf(family, rung - 1)).toBe(index);
        }
      });
    });
  });

  it('fits objects into the same envelope on both sides', () => {
    const engineEnv = engineTable<number[][]>('AUTH_ENV');

    FAMILY_KINDS.forEach((family) => {
      const rungs = engineTable<number[]>('AUTH_TIER_AT')[family];
      rungs.forEach((rung, index) => {
        expect(budgetOf(family, rung)!.envelope).toEqual(
          engineEnv[family][index],
        );
      });
    });
  });

  it('groups every district into the realm the taxonomy puts it in', () => {
    const slugs = Object.keys(NICHE_OF);
    expect(Object.keys(REALM_OF).sort()).toEqual([...slugs].sort());
    slugs.forEach((slug) => {
      expect(REALM_OF[slug]).toBe(ENGINE_REALM_OF[slug].id);
    });
  });

  it('offers exactly the colour names the district actually resolves', () => {
    REALMS.forEach((realm) => {
      const slug = Object.keys(NICHE_OF).find(
        (id) => ENGINE_REALM_OF[id].id === realm,
      )!;
      const resolved = palette(ENGINE_REALM_OF[slug], NICHE_OF[slug]);

      paletteKeys(realm).forEach((key) => {
        // Every offered name must resolve to a real colour, or a builder using
        // it silently draws nothing.
        expect(typeof resolved[key]).toBe('number');
      });
    });
  });

  it('never offers a colour the renderer does not read', () => {
    // `roof` is set by the taxonomy and read by nothing. Offering it would be a
    // knob that does nothing, which is worse than no knob.
    REALMS.forEach((realm) => {
      expect(paletteKeys(realm)).not.toContain('roof');
    });
  });

  it('replays the same ops version the kit records', () => {
    // A silent mismatch here blanks every authored object on every saved world:
    // authoredRecord drops entries whose opsVersion it does not speak.
    const engineVersion = Number(
      engineSource.match(/const AUTH_OPS_VERSION=(\d+)/)![1],
    );
    expect(engineVersion).toBe(OPS_VERSION);
  });

  it('speaks the same authoring protocol as the dev server', () => {
    const hook = readFileSync(
      join(__dirname, '../../components/world/useWorldAuthoring.ts'),
      'utf8',
    );
    const dev = readFileSync(
      join(__dirname, '../../../world-cli/src/dev.js'),
      'utf8',
    );
    expect(hook.match(/AUTHORING_PROTOCOL = (\d+)/)![1]).toBe(
      dev.match(/PROTOCOL_VERSION = (\d+)/)![1],
    );
  });

  it('hashes payloads exactly the way the kit hashes source', () => {
    // The engine and the page both re-derive this hash; equality with the
    // kit's hashSource is what keeps all three from ever drifting.
    const payload = {
      tiers: { 1: [{ ops: [{ g: 'box', a: [1, 2, 3] }], size: [1, 2, 1] }] },
    };
    expect(worldPayloadHash(payload)).toBe(
      hashSource(stableWorldJson(payload)),
    );
  });

  it('reserves a landmark stand in every realm the great tree does not own', () => {
    // A realm missing from LANDMARK_AT is indistinguishable from the deliberate
    // frame omission and drops its authored landmark to dead centre.
    const landmarkAt = engineTable<{ r: number; a: number }>('LANDMARK_AT');
    expect(Object.keys(landmarkAt).sort()).toEqual(
      REALMS.filter((realm) => realm !== 'frame').sort(),
    );
  });
});
