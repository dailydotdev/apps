import type { EngagementCreative } from './engagementAds';
import {
  findCreativeForTags,
  findCreativeForTool,
  parseCreatives,
  resolveCreative,
} from './engagementAds';

const validRaw: EngagementCreative = {
  gen_id: 'c1',
  promoted_name: 'Brand',
  promoted_body: 'Body',
  promoted_cta: 'Try',
  promoted_url: 'https://example.com',
  promoted_logo_img: {
    dark: 'https://example.com/logo-dark.png',
    light: 'https://example.com/logo-light.png',
  },
  promoted_icon_img: {
    dark: 'https://example.com/icon-dark.png',
    light: 'https://example.com/icon-light.png',
  },
  promoted_gradient_start: { dark: '#000', light: '#fff' },
  promoted_gradient_end: { dark: '#111', light: '#eee' },
  tools: ['VSCode'],
  keywords: ['ai'],
  tags: ['ai', 'copilot'],
};

describe('parseCreatives', () => {
  it('returns [] for non-arrays', () => {
    expect(parseCreatives(undefined)).toEqual([]);
    expect(parseCreatives(null)).toEqual([]);
    expect(parseCreatives({})).toEqual([]);
  });

  it('keeps creatives with valid http(s) urls', () => {
    expect(parseCreatives([validRaw])).toHaveLength(1);
  });

  it('prepends https:// to bare-host urls', () => {
    const bareHost = { ...validRaw, promoted_url: 'example.com' };
    const [parsed] = parseCreatives([bareHost]);
    expect(parsed.promoted_url).toBe('https://example.com/');
  });

  it('drops creatives with non-http(s) urls', () => {
    const bad = { ...validRaw, promoted_url: 'javascript:alert(1)' };
    expect(parseCreatives([bad])).toEqual([]);
  });

  it('drops creatives with malformed themed image urls', () => {
    const bad = {
      ...validRaw,
      promoted_logo_img: {
        dark: 'not a url',
        light: validRaw.promoted_logo_img.light,
      },
    };
    expect(parseCreatives([bad])).toEqual([]);
  });

  it('keeps valid creatives alongside invalid ones', () => {
    const invalid = { ...validRaw, gen_id: 'bad', promoted_url: 'javascript:' };
    const parsed = parseCreatives([validRaw, invalid]);
    expect(parsed.map((c) => c.gen_id)).toEqual(['c1']);
  });
});

describe('resolveCreative', () => {
  it('resolves themed values to the current theme', () => {
    const dark = resolveCreative(validRaw, false);
    expect(dark.logo).toBe('https://example.com/logo-dark.png');
    expect(dark.primaryColor).toBe('#000');

    const light = resolveCreative(validRaw, true);
    expect(light.logo).toBe('https://example.com/logo-light.png');
    expect(light.primaryColor).toBe('#fff');
  });
});

describe('findCreativeForTags', () => {
  const creatives = [resolveCreative(validRaw, false)];

  it('returns null when no tags overlap', () => {
    expect(findCreativeForTags(creatives, ['golang'])).toBeNull();
  });

  it('matches case-insensitively', () => {
    expect(findCreativeForTags(creatives, ['AI'])?.genId).toBe('c1');
  });

  it('handles empty or missing inputs', () => {
    expect(findCreativeForTags(undefined, ['ai'])).toBeNull();
    expect(findCreativeForTags(creatives, [])).toBeNull();
  });
});

describe('findCreativeForTool', () => {
  const creatives = [resolveCreative(validRaw, false)];

  it('matches tool name case-insensitively', () => {
    expect(findCreativeForTool(creatives, 'vscode')?.genId).toBe('c1');
  });

  it('returns null for missing or unmatched tool names', () => {
    expect(findCreativeForTool(creatives, null)).toBeNull();
    expect(findCreativeForTool(creatives, undefined)).toBeNull();
    expect(findCreativeForTool(creatives, 'webstorm')).toBeNull();
  });
});
