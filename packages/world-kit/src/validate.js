/**
 * Budget and safety validation for a recorded op list.
 *
 * Two different jobs live here and the distinction matters. An ERROR is a thing
 * the renderer cannot draw or the reading has not paid for; it blocks. A WARNING
 * is a thing that will look wrong — floating off the ground, one triangle short
 * of a hole, glow the object cannot carry — and an agent that fixes warnings
 * converges on something a human will actually keep.
 *
 * Size is never an error. An object bigger than its envelope is FITTED into it
 * and the report says by how much, because a cheat that renders as a shrunken
 * blob needs no policing.
 */

import { budgetOf } from './budget.js';
import { measure } from './record.js';
import { MAT_OPTS, paletteKeys } from './vocabulary.js';

const near = (a, b, eps) => Math.abs(a - b) <= eps;

export function validate({ ops, realm, family, level }) {
  const errors = [];
  const warnings = [];
  const budget = budgetOf(family, level);

  if (!budget) {
    errors.push(
      `"${family}" is not unlocked in this district at level ${level}. Read more in this subject, or pick a family that is already standing.`,
    );
    return { ok: false, errors, warnings, budget: null };
  }

  if (!ops.length) errors.push('The builder produced no shapes. Call at least one primitive.');

  const legal = paletteKeys(realm);
  const legalSet = new Set(legal);

  ops.forEach((op, i) => {
    const where = `op ${i} (${op.g})`;
    if (!legalSet.has(op.m)) {
      errors.push(
        `${where}: "${op.m}" is not a colour in the ${realm} realm. Available: ${legal.join(', ')}`,
      );
    }
    for (const [k, v] of Object.entries(op.o)) {
      const rule = MAT_OPTS[k];
      if (!rule) {
        errors.push(`${where}: unknown material option "${k}". Available: ${Object.keys(MAT_OPTS).join(', ')}`);
        continue;
      }
      if (rule === 'boolean') {
        if (typeof v !== 'boolean') errors.push(`${where}: "${k}" must be true or false`);
        continue;
      }
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        errors.push(`${where}: "${k}" must be a finite number`);
      } else if (v < rule[0] || v > rule[1]) {
        errors.push(`${where}: "${k}" is ${v}, outside the allowed ${rule[0]} to ${rule[1]}`);
      }
    }
    for (const key of ['p', 'r', 's']) {
      if (op[key].some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        errors.push(`${where}: ${key === 'p' ? 'position' : key === 'r' ? 'rotation' : 'scale'} must be finite numbers`);
      }
    }
    if (op.s.some((n) => n === 0)) warnings.push(`${where}: a scale of 0 makes this shape invisible`);
  });

  const m = measure(ops);
  const [ew, eh, ed] = budget.envelope;
  /* Shrink-only. Scaling a small object UP to fill the envelope would take the
     "how big" decision away from the reading and hand it to whoever authored the
     smallest thing, so an author who wants to fill their plot sizes it themselves. */
  const fit = Math.min(1, ew / (m.size[0] || 1e-6), eh / (m.size[1] || 1e-6), ed / (m.size[2] || 1e-6));
  const glow = m.glow * fit * fit;

  if (ops.length > budget.maxOps) {
    errors.push(`${ops.length} shapes, but this family holds ${budget.maxOps} at level ${budget.level}. Merge or drop detail.`);
  }
  if (m.triangles > budget.maxTriangles) {
    errors.push(
      `${m.triangles} triangles, but the budget is ${budget.maxTriangles}. Lower the segment counts: a cylinder at 8 segments costs half of one at 16.`,
    );
  }
  if (glow > budget.maxGlow) {
    errors.push(
      `Glow is ${glow.toFixed(2)} against a budget of ${budget.maxGlow}. Reduce the intensity, or the area you are lighting.`,
    );
  }

  const base = m.min[1] * fit;
  if (base > 0.05) {
    warnings.push(`The object floats ${base.toFixed(2)} above the ground. Its lowest point should sit at y = 0.`);
  } else if (base < -0.05) {
    warnings.push(`The object sinks ${(-base).toFixed(2)} into the ground. Its lowest point should sit at y = 0.`);
  }

  const fill = m.size[1] / eh;
  if (fit === 1 && fill < 0.45 && ops.length > 2) {
    warnings.push(
      `This only uses ${Math.round(fill * 100)}% of the height the district allows (${eh}). It will read as small next to its neighbours.`,
    );
  }
  if (fit < 1) {
    warnings.push(
      `Scaled to ${Math.round(fit * 100)}% to fit the envelope ${ew} x ${eh} x ${ed}. Detail will read smaller than you drew it.`,
    );
  }
  if (!near(m.size[0], m.size[2], Math.max(m.size[0], m.size[2]) * 0.9) && family === 'lamp') {
    warnings.push('A lamp is seen from every side. A strongly one-sided lamp will look broken from behind.');
  }

  return {
    ok: !errors.length,
    errors,
    warnings,
    budget,
    usage: {
      ops: `${ops.length}/${budget.maxOps}`,
      triangles: `${m.triangles}/${budget.maxTriangles}`,
      glow: `${glow.toFixed(2)}/${budget.maxGlow}`,
    },
    geometry: {
      size: m.size.map((n) => Number(n.toFixed(3))),
      base: Number(base.toFixed(3)),
      fit: Number(fit.toFixed(4)),
      envelope: budget.envelope,
    },
  };
}
