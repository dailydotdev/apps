/**
 * Disallow raw `btn-*` and `btn-v2-*` class strings in JSX className /
 * `classed(...)` / `classNames(...)` / `cn(...)` calls.
 *
 * The token classes are an implementation detail of <Button> / <ButtonV2>
 * and the buttons.ts / buttons-v2.ts Tailwind plugins. Hand-stamping
 * them in className strings bypasses every variant guarantee
 * (typography, focus ring, disabled state, theme contract).
 *
 * Use the component instead:
 *
 *   // BAD
 *   <a className="btn btn-primary">Click</a>
 *
 *   // GOOD
 *   <Button tag="a" variant={ButtonVariant.Primary}>Click</Button>
 */

const RAW_BUTTON_CLASS_PATTERN = /(?:^|\s)(btn(?:-v2)?(?:-[a-zA-Z]+)*)\b/;

const collectStringPieces = (node, out = []) => {
  if (!node) {
    return out;
  }
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') {
        out.push({ value: node.value, node });
      }
      return out;
    case 'TemplateLiteral':
      node.quasis.forEach((quasi) => {
        out.push({ value: quasi.value.cooked || quasi.value.raw, node: quasi });
      });
      node.expressions.forEach((expr) => collectStringPieces(expr, out));
      return out;
    case 'TemplateElement':
      out.push({ value: node.value.cooked || node.value.raw, node });
      return out;
    case 'JSXExpressionContainer':
      return collectStringPieces(node.expression, out);
    case 'CallExpression':
      node.arguments.forEach((arg) => collectStringPieces(arg, out));
      return out;
    case 'ConditionalExpression':
      collectStringPieces(node.consequent, out);
      collectStringPieces(node.alternate, out);
      return out;
    case 'LogicalExpression':
      collectStringPieces(node.left, out);
      collectStringPieces(node.right, out);
      return out;
    case 'ArrayExpression':
      node.elements.forEach((el) => collectStringPieces(el, out));
      return out;
    case 'ObjectExpression':
      node.properties.forEach((prop) => {
        if (prop.type === 'Property' && prop.key) {
          collectStringPieces(prop.key, out);
        }
      });
      return out;
    default:
      return out;
  }
};

const reportMatches = (context, pieces) => {
  pieces.forEach(({ value, node }) => {
    if (!value || typeof value !== 'string') {
      return;
    }
    const match = value.match(RAW_BUTTON_CLASS_PATTERN);
    if (!match) {
      return;
    }
    context.report({
      node,
      message:
        `Raw button class "${match[1]}" is not allowed. ` +
        'Use the <Button> or <ButtonV2> component with a `variant` prop.',
    });
  });
};

const isClassNameAttribute = (node) =>
  node.name && /^class(Name)?$/.test(node.name.name);

const CLASSNAME_HELPERS = new Set([
  'classNames',
  'classnames',
  'cn',
  'clsx',
  'classed',
  'twMerge',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw `btn-*` / `btn-v2-*` class strings; use <Button> instead.',
      recommended: false,
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (!isClassNameAttribute(node) || !node.value) {
          return;
        }
        const pieces = collectStringPieces(node.value);
        reportMatches(context, pieces);
      },
      CallExpression(node) {
        const callee = node.callee;
        const calleeName =
          (callee.type === 'Identifier' && callee.name) ||
          (callee.type === 'MemberExpression' &&
            callee.property &&
            callee.property.name);
        if (!calleeName || !CLASSNAME_HELPERS.has(calleeName)) {
          return;
        }
        const pieces = [];
        node.arguments.forEach((arg) => collectStringPieces(arg, pieces));
        reportMatches(context, pieces);
      },
    };
  },
};
