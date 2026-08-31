/**
 * The report an agent reads.
 *
 * Two audiences, one object. `--json` is the agent's: every number it needs to
 * decide what to change, plus the source hash so it can never reason about a
 * stale run. The pretty form is the human's.
 *
 * Errors say what to do, not just what is wrong. An agent fixes an enumerated
 * error instantly and flails on "invalid material", so every message that can
 * list the legal values does.
 */

/* Built rather than written, so this file stays free of raw control bytes. */
const ESC = String.fromCharCode(27);
const c = (n) => (process.stdout.isTTY ? `${ESC}[${n}m` : '');
const RED = c(31);
const YEL = c(33);
const GRN = c(32);
const DIM = c(2);
const OFF = c(0);

export function printReport(r, { json, file }) {
  if (json) {
    const { tiers, variants, ...rest } = r;
    process.stdout.write(
      `${JSON.stringify({
        ...rest,
        tierCount: tiers ? Object.keys(tiers).length : undefined,
        variantCount:
          variants?.length ??
          (tiers ? Object.values(tiers)[0]?.length ?? 0 : 0),
      }, null, 2)}\n`,
    );
    return;
  }

  const head = r.ok ? `${GRN}PASS${OFF}` : `${RED}FAIL${OFF}`;
  const target = r.niche || 'entire realm';
  const level = r.level ? ` - level ${r.level}` : ' - all tiers';
  process.stdout.write(
    `\n${head}  ${file}  ${DIM}${r.realm}/${target} - ${r.family}${level}${OFF}\n`,
  );

  if (r.budget) {
    process.stdout.write(`${DIM}tier ${r.tier}, envelope ${r.budget.envelope.join(' x ')}${OFF}\n`);
  }
  if (r.usage) {
    process.stdout.write(
      `${DIM}shapes ${r.usage.ops}, triangles ${r.usage.triangles}, glow ${r.usage.glow}${OFF}\n`,
    );
  }
  if (r.geometry) {
    const g = r.geometry;
    process.stdout.write(
      `${DIM}size ${g.size.join(' x ')}, base y ${g.base}, fitted to ${Math.round(g.fit * 100)}%${OFF}\n`,
    );
  }

  for (const e of r.errors ?? []) process.stdout.write(`${RED}  error${OFF}  ${e}\n`);
  for (const w of r.warnings ?? []) process.stdout.write(`${YEL}  warn ${OFF}  ${w}\n`);
  process.stdout.write('\n');
}
