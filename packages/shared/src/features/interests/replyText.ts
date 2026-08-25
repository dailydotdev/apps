import type { AgentBlock, AgentMessage } from './chat';

// For attribute position: a quote in an API title would otherwise close it.
const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// For text position.
const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Per block-level element rather than per block: a block's `textContent` runs
// its paragraphs together into one unspaced sentence.
const blockParagraphs = (block: AgentBlock): string[] => {
  if (block.type !== 'text') {
    return [];
  }

  const { body } = new DOMParser().parseFromString(block.html, 'text/html');

  return Array.from(body.children)
    .map((element) => element.textContent?.trim() ?? '')
    .filter(Boolean);
};

export const messageParagraphs = (message: AgentMessage): string[] =>
  (message.blocks ?? []).flatMap(blockParagraphs);

// Prose only: none of the cited posts, which is what a quote back into the
// prompt wants.
export const messageAsText = (message: AgentMessage): string =>
  messageParagraphs(message).join('\n\n');

export const messageAsMarkdown = (message: AgentMessage): string =>
  (message.blocks ?? [])
    .map((block) => {
      if (block.type === 'text') {
        return blockParagraphs(block).join('\n\n');
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

export const messageAsHtml = (message: AgentMessage): string =>
  (message.blocks ?? [])
    .map((block) => {
      if (block.type === 'text') {
        return block.html;
      }

      const items = block.posts
        .map(
          (post) =>
            `<li><a href="${escapeAttribute(
              post.commentsPermalink,
            )}">${escapeHtml(post.title ?? '')}</a></li>`,
        )
        .join('');
      const caption = block.type === 'feedLink' ? block.label : block.caption;

      return `${
        caption ? `<p>${escapeHtml(caption)}</p>` : ''
      }<ul>${items}</ul>`;
    })
    .join('');
