import { postPageHybridPrePaintScript } from '../hooks/usePostPageHybridPaint';

const PENDING = 'data-post-hybrid-pending';

const runOnFirstLoad = (): void => {
  jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
  const script = document.createElement('script');
  script.textContent = postPageHybridPrePaintScript;
  document.head.appendChild(script);
  script.remove();
};

describe('post page hybrid pre-paint script', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    document.documentElement.removeAttribute(PENDING);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('holds the classic layout for a reader in the hybrid arm, then reveals it after load', () => {
    localStorage.setItem('post_page_hybrid:arm', '1');
    runOnFirstLoad();
    expect(document.documentElement).toHaveAttribute(PENDING);

    window.dispatchEvent(new Event('load'));
    jest.advanceTimersByTime(999);
    expect(document.documentElement).toHaveAttribute(PENDING);
    jest.advanceTimersByTime(1);
    expect(document.documentElement).not.toHaveAttribute(PENDING);
  });

  it('reveals the classic layout after six seconds when the page never loads', () => {
    localStorage.setItem('post_page_hybrid:arm', '1');
    runOnFirstLoad();
    jest.advanceTimersByTime(6000);
    expect(document.documentElement).not.toHaveAttribute(PENDING);
  });

  it('leaves the page alone for the classic arm and unknown readers', () => {
    runOnFirstLoad();
    localStorage.setItem('post_page_hybrid:arm', '0');
    runOnFirstLoad();
    expect(document.documentElement).not.toHaveAttribute(PENDING);
  });
});
