import { BOOT_LOCAL_KEY } from '../contexts/common';
import {
  SHELL_ATTRIBUTE,
  SIDEBAR_ATTRIBUTE,
  SIDEBAR_DENSITY_ATTRIBUTE,
  shellPrepaintScript,
} from './shellPrepaint';

const root = document.documentElement;

const runScript = (boot?: unknown): void => {
  if (boot !== undefined) {
    localStorage.setItem(BOOT_LOCAL_KEY, JSON.stringify(boot));
  }
  const script = document.createElement('script');
  script.textContent = shellPrepaintScript;
  document.head.appendChild(script);
  script.remove();
};

describe('shellPrepaintScript', () => {
  beforeEach(() => {
    localStorage.clear();
    [SHELL_ATTRIBUTE, SIDEBAR_ATTRIBUTE, SIDEBAR_DENSITY_ATTRIBUTE].forEach(
      (name) => root.removeAttribute(name),
    );
  });

  it('leaves the rail shell for a first visit', () => {
    runScript();

    expect(root).not.toHaveAttribute(SHELL_ATTRIBUTE);
    expect(root).not.toHaveAttribute(SIDEBAR_ATTRIBUTE);
  });

  it('restores the sidebar state of a cached signed-in session', () => {
    runScript({
      user: { id: 'u1', providers: ['github'] },
      settings: { sidebarExpanded: true, flags: { sidebarCompact: false } },
    });

    expect(root).not.toHaveAttribute(SHELL_ATTRIBUTE);
    expect(root).toHaveAttribute(SIDEBAR_ATTRIBUTE, 'expanded');
    expect(root).toHaveAttribute(SIDEBAR_DENSITY_ATTRIBUTE, 'comfortable');
  });

  it('keeps the header for a cached anonymous session', () => {
    runScript({ user: { id: 'anon' }, settings: {} });

    expect(root).toHaveAttribute(SHELL_ATTRIBUTE, 'header');
  });

  it('survives a corrupt cache', () => {
    localStorage.setItem(BOOT_LOCAL_KEY, '{');

    expect(() => runScript()).not.toThrow();
  });
});
