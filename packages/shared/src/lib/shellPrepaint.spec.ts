import {
  SHELL_ATTRIBUTE,
  SHELL_PREPAINT_KEY,
  SIDEBAR_ATTRIBUTE,
  SIDEBAR_DENSITY_ATTRIBUTE,
  setRootAttribute,
  shellPrepaintScript,
} from './shellPrepaint';

const root = document.documentElement;
const attributes = [
  SHELL_ATTRIBUTE,
  SIDEBAR_ATTRIBUTE,
  SIDEBAR_DENSITY_ATTRIBUTE,
];

const runScript = (): void => {
  const script = document.createElement('script');
  script.textContent = shellPrepaintScript;
  document.head.appendChild(script);
  script.remove();
};

describe('shellPrepaint', () => {
  beforeEach(() => {
    localStorage.clear();
    attributes.forEach((name) => root.removeAttribute(name));
  });

  it('keeps the header shell when nothing was stored', () => {
    runScript();

    attributes.forEach((name) => expect(root).not.toHaveAttribute(name));
  });

  it('restores the shell MainLayout stored', () => {
    setRootAttribute(SHELL_ATTRIBUTE, 'rail');
    setRootAttribute(SIDEBAR_ATTRIBUTE, 'expanded');
    setRootAttribute(SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable');
    attributes.forEach((name) => root.removeAttribute(name));

    runScript();

    expect(root).toHaveAttribute(SHELL_ATTRIBUTE, 'rail');
    expect(root).toHaveAttribute(SIDEBAR_ATTRIBUTE, 'expanded');
    expect(root).toHaveAttribute(SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable');
  });

  it('takes the mirror cookie as a signed-in laptop session', () => {
    document.cookie = 'dl_v=v2';

    runScript();

    expect(root).toHaveAttribute(SHELL_ATTRIBUTE, 'rail');
    document.cookie = 'dl_v=; max-age=0';
  });

  it('forgets the rail once the session signs out', () => {
    setRootAttribute(SHELL_ATTRIBUTE, 'rail');
    setRootAttribute(SHELL_ATTRIBUTE, null);
    root.removeAttribute(SHELL_ATTRIBUTE);

    runScript();

    expect(root).not.toHaveAttribute(SHELL_ATTRIBUTE);
    expect(localStorage.getItem(SHELL_PREPAINT_KEY)).toBe('');
  });
});
