import {
  installDomMutationGuard,
  onDomMutationGuarded,
} from './domMutationGuard';

describe('installDomMutationGuard', () => {
  const listener = jest.fn();
  let unsubscribe: () => void;

  beforeAll(() => {
    installDomMutationGuard();
  });

  beforeEach(() => {
    listener.mockClear();
    unsubscribe = onDomMutationGuarded(listener);
  });

  afterEach(() => {
    unsubscribe();
  });

  it('should skip removing a node that is no longer a child', () => {
    const parent = document.createElement('div');
    const orphan = document.createTextNode('text');

    expect(parent.removeChild(orphan)).toBe(orphan);
    expect(listener).toHaveBeenCalledWith('removeChild');
  });

  it('should skip inserting before a node that is no longer a child', () => {
    const parent = document.createElement('div');
    const node = document.createElement('span');
    const orphan = document.createTextNode('text');

    expect(parent.insertBefore(node, orphan)).toBe(node);
    expect(node.parentNode).toBeNull();
    expect(listener).toHaveBeenCalledWith('insertBefore');
  });

  it('should keep regular mutations working', () => {
    const parent = document.createElement('div');
    const first = document.createElement('span');
    const second = document.createElement('span');

    parent.appendChild(first);
    parent.insertBefore(second, first);
    expect(parent.firstChild).toBe(second);
    parent.insertBefore(first, null);
    expect(parent.lastChild).toBe(first);
    parent.removeChild(second);
    expect(parent.childNodes).toHaveLength(1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should report hits caught before anyone subscribed', () => {
    unsubscribe();
    document.createElement('div').removeChild(document.createTextNode('a'));

    const lateListener = jest.fn();
    unsubscribe = onDomMutationGuarded(lateListener);

    expect(lateListener).toHaveBeenCalledWith('removeChild');
  });
});
