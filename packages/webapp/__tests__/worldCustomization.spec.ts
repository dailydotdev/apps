import type { WorldDistrict, WorldSettings } from '../graphql/world';
import {
  isWorldCustomised,
  resolveCrest,
  resolveLook,
  resolveSky,
  suggestedCrest,
  WORLD_NAME_MAX_LENGTH,
  worldSuggestions,
} from '../components/world/worldCustomization';
import { REALMS } from '../components/world/engine/taxonomy';
import { worldSettingsPatch } from '../components/world/useWorldDraft';

const district = (slug: string, reads: number): WorldDistrict => ({
  niche: { slug },
  reads,
  firstReadAt: '2024-01-01',
  lastReadAt: '2026-01-01',
  activeDays: 10,
});

describe('worldSuggestions', () => {
  it('names a world after the realm it read most', () => {
    const [first] = worldSuggestions([
      district('ai_llm', 400),
      district('k8s', 12),
    ]);

    expect(first).toContain('Arcane Swarm');
  });

  it('offers several distinct shapes, so ✦ can be walked round', () => {
    const suggestions = worldSuggestions([district('ai_llm', 400)]);

    expect(suggestions.length).toBeGreaterThan(1);
    expect(new Set(suggestions).size).toBe(suggestions.length);
  });

  /* ✦ COMMITS what it shows, and the API rejects a name over the limit — so a
     suggestion that does not fit is a save that fails. Exhaustive rather than
     spot-checked, because the overflow depends on which realm, role and epithet
     happen to collide, and the longest realm name only meets the longest role in
     one corner of the space. */
  it('never suggests a name the field cannot hold', () => {
    // Every realm, against every breadth (which picks the role) and every
    // volume (which picks the epithet).
    const breadths = REALMS.map((_, index) => index + 1);
    const volumes = [1, 4, 40, 400, 4000, 40000];
    const cases = REALMS.flatMap((realm) =>
      breadths.flatMap((breadth) =>
        volumes.map((reads) => {
          // The realm under test reads most, so it is the one that gets named.
          const districts = REALMS.slice(0, breadth).map((other) =>
            district(other.niches[0].id, 1),
          );
          districts.push(district(realm.niches[0].id, reads * 2));

          return worldSuggestions(districts);
        }),
      ),
    );

    cases.forEach((suggestions) => {
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach((name) =>
        expect(name.length).toBeLessThanOrEqual(WORLD_NAME_MAX_LENGTH),
      );
    });
  });

  it('still has something to call a world with nothing in it', () => {
    expect(worldSuggestions([])).toEqual(['My world']);
    expect(worldSuggestions(undefined)).toEqual(['My world']);
  });

  it('ignores a niche the taxonomy cannot place', () => {
    expect(worldSuggestions([district('not_a_real_niche', 900)])).toEqual([
      'My world',
    ]);
  });
});

describe('suggestedCrest', () => {
  it('takes the charge from the largest district and the tinctures from the top two', () => {
    const crest = suggestedCrest('u1', [
      district('ai_llm', 40),
      district('k8s', 12),
    ]);

    // `ai_llm` raises the obelisk; the taxonomy owns both accents.
    expect(crest?.charge).toBe('obelisk');
    expect(crest?.a).not.toBe(crest?.b);
  });

  it('has no mark at all until something has been raised', () => {
    expect(suggestedCrest('u1', [district('ai_llm', 2)])).toBeNull();
    expect(suggestedCrest('u1', [])).toBeNull();
  });

  it('picks the same division for the same reader every time', () => {
    const districts = [district('ai_llm', 40)];

    expect(suggestedCrest('u1', districts)?.div).toBe(
      suggestedCrest('u1', districts)?.div,
    );
  });
});

describe('resolving what a world is drawn with', () => {
  const stored = {
    charge: 'anvilyard',
    div: 'bend',
    a: 0x111111,
    b: 0x222222,
  };

  it('prefers what the owner chose over the suggestion', () => {
    const settings = { crest: stored } as WorldSettings;

    expect(resolveCrest(settings, 'u1', [district('ai_llm', 40)])).toBe(stored);
  });

  it('falls back to the suggestion when the owner never dressed it', () => {
    expect(resolveCrest(null, 'u1', [district('ai_llm', 40)])?.charge).toBe(
      'obelisk',
    );
  });

  it('photographs an untouched world through DIORAMA', () => {
    expect(resolveLook(null).id).toBe('diorama');
    expect(resolveLook(undefined).mine).toBe(false);
  });

  it('hangs the file’s own sky over an untouched world', () => {
    expect(resolveSky(null)).toEqual({ pal: 'brand', hour: 'day' });
  });

  it('shows a visitor the sky its owner picked, not a default', () => {
    const sky = { pal: 'slate', hour: 'night' };

    expect(resolveSky({ sky } as WorldSettings)).toBe(sky);
  });
});

describe('isWorldCustomised', () => {
  it('is false for a world nobody has made anything of', () => {
    expect(isWorldCustomised(null)).toBe(false);
    expect(
      isWorldCustomised({
        name: null,
        sky: null,
        crest: null,
        look: null,
        private: false,
      }),
    ).toBe(false);
  });

  it('does not count hiding a world as making it yours', () => {
    expect(
      isWorldCustomised({
        name: null,
        sky: null,
        crest: null,
        look: null,
        private: true,
      }),
    ).toBe(false);
  });

  it('is true the moment it has a name', () => {
    expect(
      isWorldCustomised({
        name: 'The quiet scholar',
        sky: null,
        crest: null,
        look: null,
        private: false,
      }),
    ).toBe(true);
  });
});

describe('worldSettingsPatch', () => {
  const saved: WorldSettings = {
    name: 'Old name',
    sky: null,
    crest: null,
    look: null,
    private: false,
  };

  it('sends only what changed, so a rename does not pin the crest', () => {
    const patch = worldSettingsPatch({ ...saved, name: 'New name' }, saved);

    expect(patch).toEqual({ name: 'New name' });
  });

  it('clears a name back to the suggestion with an explicit null', () => {
    expect(worldSettingsPatch({ ...saved, name: '  ' }, saved)).toEqual({
      name: null,
    });
  });

  it('is empty when the bench was opened and closed again', () => {
    expect(worldSettingsPatch(saved, saved)).toEqual({});
  });

  it('treats a world with no stored settings as untouched', () => {
    const draft = {
      name: null,
      sky: null,
      crest: null,
      look: null,
      private: true,
    };

    expect(worldSettingsPatch(draft, null)).toEqual({ private: true });
  });
});
