export type ParsedFrameTarget =
  | { ok: true; target: URL }
  | { ok: false; reason: 'invalid-target' | 'unsupported-target-protocol' };

const isEmbeddableProtocol = (url: URL): boolean =>
  ['http:', 'https:'].includes(url.protocol);

export const parseFrameTarget = (rawTarget: string): ParsedFrameTarget => {
  try {
    const target = new URL(rawTarget);

    if (!isEmbeddableProtocol(target)) {
      return { ok: false, reason: 'unsupported-target-protocol' };
    }

    return { ok: true, target };
  } catch {
    return { ok: false, reason: 'invalid-target' };
  }
};
