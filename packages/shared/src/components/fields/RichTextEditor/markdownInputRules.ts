import { Extension, markInputRule, nodeInputRule } from '@tiptap/core';

const linkRegex = /\[([^\]]+)\]\((?:[^)]+)\)$/;
const imageRegex = /!\[[^\]]*\]\((?:[^)]+)\)$/;

const extractUrl = (value: string): string | null => {
  const match = value.match(/\(([^)]+)\)\s*$/);
  return match?.[1]?.trim() ?? null;
};

const extractAlt = (value: string): string =>
  value.match(/^!\[([^\]]*)\]/)?.[1] ?? '';

export const MarkdownInputRules = Extension.create({
  name: 'markdownInputRules',
  addInputRules() {
    const rules = [];
    const linkType = this.editor.schema.marks.link;
    const imageType = this.editor.schema.nodes.image;

    if (linkType) {
      rules.push(
        markInputRule({
          find: linkRegex,
          type: linkType,
          getAttributes: (match) => {
            const url = extractUrl(match[0]);
            if (!url) {
              return false;
            }
            return { href: url };
          },
        }),
      );
    }

    if (imageType) {
      rules.push(
        nodeInputRule({
          find: imageRegex,
          type: imageType,
          getAttributes: (match) => {
            const url = extractUrl(match[0]);
            return {
              src: url ?? '',
              alt: extractAlt(match[0]),
            };
          },
        }),
      );
    }

    return rules;
  },
});

export default MarkdownInputRules;
