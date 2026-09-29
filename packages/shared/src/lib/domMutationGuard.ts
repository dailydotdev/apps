export type DomMutationGuardMethod = 'removeChild' | 'insertBefore';

type DomMutationGuardListener = (method: DomMutationGuardMethod) => void;

let isInstalled = false;
let listener: DomMutationGuardListener | undefined;
const pendingHits: DomMutationGuardMethod[] = [];

const reportHit = (method: DomMutationGuardMethod): void => {
  if (listener) {
    listener(method);
    return;
  }

  pendingHits.push(method);
};

export const onDomMutationGuarded = (
  callback: DomMutationGuardListener,
): (() => void) => {
  listener = callback;
  pendingHits.splice(0).forEach((method) => callback(method));

  return () => {
    if (listener === callback) {
      listener = undefined;
    }
  };
};

// @see https://github.com/facebook/react/issues/11538#issuecomment-417504600
export const installDomMutationGuard = (): void => {
  if (isInstalled || typeof Node === 'undefined') {
    return;
  }

  isInstalled = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(
    this: Node,
    child: T,
  ): T {
    if (child.parentNode !== this) {
      reportHit('removeChild');
      return child;
    }

    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    child: Node | null,
  ): T {
    if (child && child.parentNode !== this) {
      reportHit('insertBefore');
      return node;
    }

    return originalInsertBefore.call(this, node, child) as T;
  };
};
