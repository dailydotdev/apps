import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Minimal TipTap node so markdown videos (`![](file.mp4)`) survive editing.
 * Without it, TipTap's schema strips unknown `<video>` tags and a post that
 * embeds a video would lose it on save. Alt text round-trips via `aria-label`
 * to match how the markdown converter serializes it back.
 */
export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('aria-label'),
        renderHTML: (attributes) =>
          attributes.alt ? { 'aria-label': attributes.alt } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        controls: 'true',
        preload: 'metadata',
      }),
    ];
  },
});
