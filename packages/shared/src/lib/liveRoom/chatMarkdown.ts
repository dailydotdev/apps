import type { UserShortProfile } from '../user';
import { webappUrl } from '../constants';
import { isValidHttpUrl } from '../links';

const tagRegex = /(<[^>]+>)/g;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
const mentionRegex = /(^|[^A-Za-z0-9_@/])@([A-Za-z0-9_-]+)/g;

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const applyInlineTextFormatting = (value: string): string => {
  let result = value;

  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(?!\*)([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');

  return result;
};

const replaceMentions = (
  value: string,
  mentionsByUsername: Map<string, ChatMentionUser>,
): string =>
  value.replace(mentionRegex, (fullMatch, prefix: string, username: string) => {
    const mention = mentionsByUsername.get(username.toLowerCase());

    if (!mention) {
      return fullMatch;
    }

    const href =
      mention.permalink && mention.permalink !== '#'
        ? mention.permalink
        : `${webappUrl}${mention.username}`;

    return `${prefix}<a href="${escapeAttribute(
      href,
    )}" data-mention-id="${escapeAttribute(
      mention.id,
    )}" data-mention-username="${escapeAttribute(
      mention.username,
    )}" translate="no">@${mention.username}</a>`;
  });

const processTextSegment = (
  value: string,
  mentionsByUsername: Map<string, ChatMentionUser>,
): string => {
  const withCode = escapeHtml(value).replace(/`([^`\n]+)`/g, '<code>$1</code>');
  let insideCode = false;

  return withCode
    .split(tagRegex)
    .map((part) => {
      if (!part) {
        return part;
      }

      if (part.startsWith('<')) {
        if (part.startsWith('<code')) {
          insideCode = true;
        } else if (part.startsWith('</code')) {
          insideCode = false;
        }

        return part;
      }

      if (insideCode) {
        return part.replace(/\n/g, '<br>');
      }

      return replaceMentions(
        applyInlineTextFormatting(part),
        mentionsByUsername,
      ).replace(/\n/g, '<br>');
    })
    .join('');
};

const replaceEmbeds = (value: string): string => {
  let result = value;

  result = result.replace(imageRegex, (fullMatch, alt: string, url: string) =>
    isValidHttpUrl(url)
      ? `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" />`
      : fullMatch,
  );

  result = result.replace(linkRegex, (fullMatch, label: string, url: string) =>
    isValidHttpUrl(url)
      ? `<a href="${escapeAttribute(url)}">${escapeHtml(label)}</a>`
      : fullMatch,
  );

  return result;
};

export type ChatMentionUser = Pick<
  UserShortProfile,
  'id' | 'username' | 'permalink'
>;

export interface ChatMarkdownOptions {
  mentions?: ChatMentionUser[];
}

export const chatMarkdownToHtml = (
  markdown: string,
  options: ChatMarkdownOptions = {},
): string => {
  if (!markdown) {
    return '';
  }

  const mentionsByUsername = new Map<string, ChatMentionUser>();
  options.mentions?.forEach((mention) => {
    mentionsByUsername.set(mention.username.toLowerCase(), mention);
  });

  return markdown
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const withEmbeds = replaceEmbeds(paragraph);
      let insideLink = false;
      const content = withEmbeds
        .split(tagRegex)
        .map((part) => {
          if (!part) {
            return part;
          }

          if (part.startsWith('<')) {
            if (part.startsWith('<a ')) {
              insideLink = true;
            } else if (part.startsWith('</a')) {
              insideLink = false;
            }

            return part;
          }

          if (insideLink) {
            return escapeHtml(part).replace(/\n/g, '<br>');
          }

          return processTextSegment(part, mentionsByUsername);
        })
        .join('');

      return `<p>${content}</p>`;
    })
    .join('');
};
