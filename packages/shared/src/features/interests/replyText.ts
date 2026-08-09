import type { AgentMessage } from './chat';

/** So a title with a quote in it cannot break the attribute it sits in. */
const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * What the agent said, one paragraph per entry.
 *
 * Per block-level element rather than per block: a block's `textContent` runs
 * its paragraphs together, so "…clears your bar." and "First pass over…" arrived
 * as one sentence with no space in the middle of it.
 */
export const messageParagraphs = (message: AgentMessage): string[] =>
  (message.blocks ?? []).flatMap((block) => {
    if (block.type !== 'text') {
      return [];
    }

    const { body } = new DOMParser().parseFromString(block.html, 'text/html');

    return Array.from(body.children)
      .map((element) => element.textContent?.trim() ?? '')
      .filter(Boolean);
  });

/**
 * The reply as flat text: markup stripped, paragraph gaps kept. What the agent
 * said, with none of what it cited — which is what a quote back into the prompt
 * wants.
 */
export const messageAsText = (message: AgentMessage): string =>
  messageParagraphs(message).join('\n\n');

/**
 * The reply for the clipboard, links and all.
 *
 * A reply's whole value is the handful of posts it picked out, and stripping to
 * text left someone pasting it into Slack with a paragraph about five articles
 * and no way to reach any of them. Markdown, because that is what the places
 * this gets pasted into render.
 */
export const messageAsMarkdown = (message: AgentMessage): string =>
  (message.blocks ?? [])
    .map((block) => {
      if (block.type === 'text') {
        return (
          new DOMParser().parseFromString(block.html, 'text/html').body
            .textContent ?? ''
        );
      }

      const links = block.posts
        .map((post) => `- [${post.title}](${post.commentsPermalink})`)
        .join('\n');

      return block.type === 'feedLink'
        ? `${block.label}\n${links}`
        : [block.caption, links].filter(Boolean).join('\n');
    })
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();

/**
 * The reply as its own small document, for the share sheet's preview.
 *
 * The citations become a plain list of links rather than the cards the
 * transcript draws: a preview is a reminder of which reply this is, and nine
 * post cards in a modal is the reply again rather than a picture of it.
 */
export const messageAsHtml = (message: AgentMessage): string =>
  (message.blocks ?? [])
    .map((block) => {
      if (block.type === 'text') {
        return block.html;
      }

      const items = block.posts
        .map(
          (post) =>
            `<li><a href="${escapeAttribute(post.commentsPermalink)}">${
              post.title
            }</a></li>`,
        )
        .join('');
      const caption = block.type === 'feedLink' ? block.label : block.caption;

      return `${caption ? `<p>${caption}</p>` : ''}<ul>${items}</ul>`;
    })
    .join('');
