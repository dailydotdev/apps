export type WorldBootFailureKind =
  | 'unsupported'
  | 'context-limit'
  | 'engine'
  | 'data';

export interface WorldBootFailure {
  reason: string;
  kind: WorldBootFailureKind;
}

/**
 * What a throwaway context is able to say about this browser.
 *
 * `inconclusive` is its own answer rather than a `false`, because the three
 * ways a probe can come back empty-handed are not the same news: a browser
 * with no WebGL at all is a fact about the reader's machine, while a blocked
 * canvas, a throw, or a context we could not hand back is a fact about the
 * probe. Only the first one earns `unsupported`, which is the one kind that
 * puts a sentence about their browser on a reader's screen.
 */
export type WebGLProbe = 'available' | 'absent' | 'inconclusive';

/* Only ever separates a context the browser refused from an engine that broke
   on its own — both of which are analytics buckets. `unsupported` is decided by
   the probe instead, so three.js rewording this on an upgrade costs a bucket
   rather than the reader's copy. */
const WEBGL_CONTEXT_ERROR = /error creating webgl context/i;

export const reasonForWorldBootFailure = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const probeWebGLSupport = (): WebGLProbe => {
  if (typeof document === 'undefined') {
    return 'inconclusive';
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!context) {
      return 'absent';
    }

    /* The probe has to give the context back. Browsers cap contexts per page,
       and this one is allocated in precisely the branch where context pressure
       is the hypothesis, so holding it until GC would be the bug it is trying
       to describe. Without the extension there is no way to release it, which
       makes the answer inconclusive rather than a yes. */
    const lose = context.getExtension('WEBGL_lose_context');
    if (!lose) {
      return 'inconclusive';
    }
    lose.loseContext();

    return 'available';
  } catch {
    return 'inconclusive';
  }
};

export const classifyWorldEngineCreationFailure = (
  error: unknown,
): WorldBootFailureKind => {
  /* Probed on every construction throw rather than only on the ones whose
     message looks like a context failure: the message belongs to three.js and
     an upgrade can reword it, and this is the branch that decides what the
     reader is told. */
  if (probeWebGLSupport() === 'absent') {
    return 'unsupported';
  }

  return WEBGL_CONTEXT_ERROR.test(reasonForWorldBootFailure(error))
    ? 'context-limit'
    : 'engine';
};
