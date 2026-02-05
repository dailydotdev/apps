const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeAttribute = (value: string): string =>
  value.replace(/"/g, '&quot;');

const normalizeText = (value: string): string => value.replace(/\u00a0/g, ' ');

const inlineMarkdownToHtml = (value: string): string => {
  let result = escapeHtml(value);

  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt: string, url: string) =>
      `<img src="${escapeAttribute(url)}" alt="${alt}" />`,
  );

  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label: string, url: string) =>
      `<a href="${escapeAttribute(url)}">${label}</a>`,
  );

  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
};

export const markdownToHtmlBasic = (markdown: string): string => {
  if (!markdown) {
    return '';
  }

  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let isInCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) {
      listType = null;
      listItems = [];
      return;
    }

    htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (isInCodeBlock) {
        const codeContent = escapeHtml(codeBlockLines.join('\n'));
        htmlParts.push(`<pre><code>${codeContent}</code></pre>`);
        codeBlockLines = [];
        isInCodeBlock = false;
      } else {
        flushList();
        isInCodeBlock = true;
      }
      return;
    }

    if (isInCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    const orderedMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);

    if (unorderedMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(`<li>${inlineMarkdownToHtml(unorderedMatch[1])}</li>`);
      return;
    }

    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(`<li>${inlineMarkdownToHtml(orderedMatch[2])}</li>`);
      return;
    }

    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      htmlParts.push(
        `<h${level}>${inlineMarkdownToHtml(headingMatch[2])}</h${level}>`,
      );
      return;
    }

    if (!trimmed) {
      flushList();
      return;
    }

    flushList();
    htmlParts.push(`<p>${inlineMarkdownToHtml(line)}</p>`);
  });

  if (isInCodeBlock) {
    const codeContent = escapeHtml(codeBlockLines.join('\n'));
    htmlParts.push(`<pre><code>${codeContent}</code></pre>`);
    codeBlockLines = [];
    isInCodeBlock = false;
  }

  flushList();

  return htmlParts.join('');
};

const serializeInline = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeText(node.textContent || '');
  }

  if (!(node instanceof Element)) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();

  switch (tagName) {
    case 'strong':
    case 'b':
      return `**${serializeChildren(node)}**`;
    case 'em':
    case 'i':
      return `_${serializeChildren(node)}_`;
    case 'a': {
      const href = node.getAttribute('href') || '';
      const label = serializeChildren(node) || href;
      return `[${label}](${href})`;
    }
    case 'code':
      return `\`${serializeChildren(node)}\``;
    case 'br':
      return '\n';
    case 'img': {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }
    case 'p':
      return serializeChildren(node).trim();
    case 'li':
      return serializeChildren(node).trim();
    default:
      return serializeChildren(node);
  }
};

const serializeChildren = (node: Element): string =>
  Array.from(node.childNodes)
    .map((child) => serializeInline(child))
    .join('');

const serializeList = (node: Element, ordered: boolean): string => {
  const items = Array.from(node.children).filter(
    (child) => child.tagName.toLowerCase() === 'li',
  );

  return items
    .map((item, index) => {
      const prefix = ordered ? `${index + 1}.` : '-';
      const content = serializeInline(item).trim();
      return `${prefix} ${content}`.trim();
    })
    .join('\n');
};

export const htmlToMarkdownBasic = (html: string): string => {
  if (!html) {
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const blocks = Array.from(doc.body.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return normalizeText(node.textContent || '').trim();
      }

      if (!(node instanceof Element)) {
        return '';
      }

      const tagName = node.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          return serializeChildren(node).trim();
        case 'pre': {
          const code = node.textContent ?? '';
          return `\`\`\`\n${normalizeText(code).trim()}\n\`\`\``;
        }
        case 'h1':
          return `# ${serializeChildren(node).trim()}`;
        case 'h2':
          return `## ${serializeChildren(node).trim()}`;
        case 'h3':
          return `### ${serializeChildren(node).trim()}`;
        case 'h4':
          return `#### ${serializeChildren(node).trim()}`;
        case 'h5':
          return `##### ${serializeChildren(node).trim()}`;
        case 'h6':
          return `###### ${serializeChildren(node).trim()}`;
        case 'ul':
          return serializeList(node, false);
        case 'ol':
          return serializeList(node, true);
        case 'img':
          return serializeInline(node).trim();
        default:
          return serializeChildren(node).trim();
      }
    })
    .filter(Boolean);

  return blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
};

export default markdownToHtmlBasic;
