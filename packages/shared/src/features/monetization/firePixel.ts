/**
 * Fires a tracker outside the render tree. A `keepalive` GET rather than an
 * `<img>`: these reports mostly go out as the reader leaves — the tab hidden,
 * the page unloading — when an image request started that late may never be
 * sent, while a keepalive request outlives the page. Still a GET, which is
 * what measurement endpoints count.
 */
export const firePixel = (src: string): void => {
  globalThis
    .fetch(src, {
      mode: 'no-cors',
      credentials: 'include',
      cache: 'no-store',
      keepalive: true,
    })
    .catch(() => undefined);
};
