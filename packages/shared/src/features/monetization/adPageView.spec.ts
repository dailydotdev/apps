import Router from 'next/router';
import { getAdPageViewId } from './adPageView';

jest.mock('next/router', () => {
  const handlers = new Map<string, ((mockUrl: string) => void)[]>();
  return {
    events: {
      on: (event: string, handler: (mockUrl: string) => void) => {
        handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      },
      emit: (event: string, url: string) => {
        handlers.get(event)?.forEach((handler) => handler(url));
      },
    },
  };
});

describe('ad page-view identity', () => {
  it('shares an id across slots, refreshes, and hash changes', () => {
    const id = getAdPageViewId('/feed?page=1');
    expect(id).toBeTruthy();
    expect(getAdPageViewId('/feed?page=1')).toBe(id);
    expect(getAdPageViewId('/feed?page=1#next')).toBe(id);
  });

  it('creates a new id on navigation, including a return to a previous page', () => {
    const first = getAdPageViewId('/first');
    const second = getAdPageViewId('/second');
    expect(second).not.toBe(first);
    expect(getAdPageViewId('/first')).not.toBe(first);
  });

  it('rotates after visiting a page that makes no ad requests', () => {
    const first = getAdPageViewId('/feed');
    Router.events.emit('routeChangeComplete', '/ad-free');
    Router.events.emit('routeChangeComplete', '/feed');
    expect(getAdPageViewId('/feed')).not.toBe(first);
  });
});
