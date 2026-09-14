export type WorldBootFailureKind =
  | 'unsupported'
  | 'context-limit'
  | 'engine'
  | 'data';

export interface WorldBootFailure {
  reason: string;
  kind: WorldBootFailureKind;
}

const WEBGL_CONTEXT_ERROR = /error creating webgl context/i;

export const reasonForWorldBootFailure = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const canCreateThrowawayWebGLContext = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!context) {
      return false;
    }

    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
};

export const classifyWorldEngineCreationFailure = (
  error: unknown,
): WorldBootFailureKind => {
  const reason = reasonForWorldBootFailure(error);

  if (!WEBGL_CONTEXT_ERROR.test(reason)) {
    return 'engine';
  }

  return canCreateThrowawayWebGLContext() ? 'context-limit' : 'unsupported';
};
