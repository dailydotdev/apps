/**
 * The rules that stop an authored object lying about how much reading is
 * behind it. Every one of these is a thing somebody will try.
 */

import type { Builder } from '@dailydotdev/world-kit';
import { budgetOf, runBuilder, tierOf } from '@dailydotdev/world-kit';

const run = (build: Builder, over: Record<string, unknown> = {}) =>
  runBuilder(build, {
    realm: 'forge',
    niche: 'rust',
    family: 'house',
    level: 9,
    source: String(build),
    ...over,
  });

describe('world-kit validator', () => {
  it('accepts a builder that stays inside its realm and its budget', () => {
    const result = run((w) => {
      w.cyl(0.4, 0.5, 0.9, 8).mat('brick', { rough: 0.9 }).at(0, 0.45, 0);
      w.cone(0.55, 0.4, 8).mat('iron').at(0, 1.1, 0);
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.geometry!.base).toBe(0);
  });

  it('records one op list per seed, so a district is not full of clones', () => {
    const result = run((w) => {
      w.box(0.6 + w.rnd() * 0.4, 0.8, 0.6)
        .mat('brick')
        .at(0, 0.4, 0);
    });

    const widths = result.variants!.map(
      (variant) => (variant.ops[0] as { a: number[] }).a[0],
    );
    expect(new Set(widths).size).toBe(widths.length);
  });

  it('rejects a colour the realm does not have, and says which it does', () => {
    const result = run((w) => w.box(1, 1, 1).mat('snow').at(0, 0.5, 0));

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('not a colour in the forge realm');
    expect(result.errors[0]).toContain('brick');
  });

  it('rejects a builder that is not deterministic', () => {
    const result = run((w) => {
      w.box(1, 0.5 + Math.random(), 1)
        .mat('brick')
        .at(0, 0.5, 0);
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('not deterministic');
  });

  it('fits an oversized object into the envelope rather than rejecting it', () => {
    const result = run((w) => w.box(20, 20, 20).mat('brick').at(0, 10, 0));
    const { envelope } = budgetOf('house', 9)!;

    // Not an error: a cheat that renders as a shrunken blob needs no policing.
    expect(result.errors).toEqual([]);
    expect(result.geometry!.fit).toBeLessThan(0.2);

    const fitted = result.geometry!.size.map(
      (n: number) => n * result.geometry!.fit,
    );
    // Inside on every axis, and touching on the one that bound it. A cube is
    // capped by the NARROWEST side of the envelope, not by its height.
    fitted.forEach((n: number, i: number) =>
      expect(n).toBeLessThanOrEqual(envelope[i] + 1e-6),
    );
    expect(
      fitted.some((n: number, i: number) => Math.abs(n - envelope[i]) < 1e-6),
    ).toBe(true);
  });

  it('never fits a small object UP to fill the envelope', () => {
    const result = run((w) => w.box(0.3, 0.3, 0.3).mat('brick').at(0, 0.15, 0));

    expect(result.geometry!.fit).toBe(1);
  });

  it('caps glow, which size normalisation alone would not', () => {
    const result = run((w) => {
      w.sphere(0.5, 12, 8).glow('lavaHot', 3).at(0, 0.5, 0);
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('Glow');
  });

  it('spends a smaller budget on a lower rung', () => {
    const low = budgetOf('house', 2)!;
    const high = budgetOf('house', 12)!;

    expect(low.tier).toBe(1);
    expect(high.tier).toBe(3);
    expect(low.maxOps).toBeLessThan(high.maxOps);
    expect(low.envelope[1]).toBeLessThan(high.envelope[1]);
  });

  it('refuses a family the district has not unlocked yet', () => {
    expect(tierOf('tower', 3)).toBe(0);
    const result = run((w) => w.box(1, 1, 1).mat('brick').at(0, 0.5, 0), {
      family: 'tower',
      level: 3,
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('not unlocked');
  });

  it('warns when an object floats or sinks', () => {
    const floating = run((w) => w.box(1, 1, 1).mat('brick').at(0, 3, 0));
    expect(floating.warnings.join(' ')).toContain('floats');

    const sunk = run((w) => w.box(1, 1, 1).mat('brick').at(0, 0, 0));
    expect(sunk.warnings.join(' ')).toContain('sinks');
  });

  it('hashes the source so a report can never be read against a stale file', () => {
    const a = run((w) => w.box(1, 1, 1).mat('brick').at(0, 0.5, 0));
    const b = run((w) => w.box(1, 1.2, 1).mat('brick').at(0, 0.6, 0));

    expect(a.sourceHash).not.toBe(b.sourceHash);
  });
});
