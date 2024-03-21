const tailwindConfig = require('../../../shared/tailwind.config');
const targetClassNames = ['bg-', 'text-'];
const alwaysValidClasses = [
  'text-base',
  'text-center',
  'text-2xl',
  'text-left',
  'text-right',
  'text-lg',
  'text-xl',
  'text-ellipsis',
  'bg-clip-text',
  'bg-none',
  'bg-gradient-to-r',
  'bg-gradient-to-l',
  'bg-gradient-to-t',
  'bg-inherit',
  'bg-gradient-to-b',
  'bg-gradient-to-br',
  'bg-cover',
  'bg-no-repeat',
  'bg-center',
  'bg-contain',
  'text-opacity-64', // refactor in a separate PR to something that would filter all text-opacity-*
];
const findTargetClassNames = (classNames) => {
  if (!classNames) {
    return;
  }

  if (
    !Array.isArray(classNames) &&
    (typeof classNames === 'string' || classNames instanceof String)
  ) {
    classNames = classNames.replace(/\s{2,}/g, ' ');
    classNames = classNames.split(' ').filter((cls) => cls.length);
  }

  if (!Array.isArray(classNames)) {
    return;
  }

  return classNames.filter((className) => {
    return targetClassNames.some((matchClassName) =>
      className.startsWith(matchClassName),
    );
  });
};

const isValidObject = (object) => {
  return typeof object === 'object' && object !== null;
};

const pushItemToArray = (existingArray, newItems) => {
  return uniqueifyArray(existingArray.concat(existingArray, newItems));
};

const uniqueifyArray = (array) => {
  return [...new Set(array)];
};

const mapValidClassNames = (inputColors, prefix = '') => {
  return Object.keys(inputColors).reduce((outputColors, colorKey) => {
    // Check if the color key is an array, if so we have to map the children
    if (isValidObject(inputColors[colorKey])) {
      // Define a child key prefix
      const newPrefix = prefix ? `${prefix}-${colorKey}` : colorKey;
      outputColors = pushItemToArray(
        outputColors,
        mapValidClassNames(inputColors[colorKey], newPrefix),
      );
    } else {
      outputColors.push(`${prefix && `${prefix}-`}${colorKey}`);
    }
    return outputColors;
  }, []);
};

const { theme } = tailwindConfig;
const mappedValidClassNames = [
  ...alwaysValidClasses,
  ...mapValidClassNames(theme.colors).flatMap((color) => {
    return targetClassNames.flatMap((prefix) => {
      return `${prefix}${color}`;
    });
  }),
];

const isClassAttribute = (node) => {
  return node.name && /^class(Name)?$/.test(node.name.name);
};

const isLiteralAttributeValue = (node) => {
  if (node.value) {
    switch (node.value?.type) {
      case 'Literal':
        // No support for dynamic or conditional...
        return !/\{|\?|\}/.test(node.value.value);
      case 'JSXExpressionContainer':
        // className={"..."}
        return node.value.expression.type === 'Literal';
      default:
        return false;
    }
  }
};

const isValidJSXAttribute = (node) => {
  if (!isClassAttribute(node)) {
    // Only run for class[Name] attributes
    return false;
  }
  if (!isLiteralAttributeValue(node)) {
    // No support for dynamic or conditional classnames
    return false;
  }
  return true;
};

const getClassNameValuesFromNode = (node) => {
  if (node.value?.type === 'JSXExpressionContainer') {
    return node.value.expression.value;
  }

  return node.value?.value;
};

const parseNodeRecursive = (node, arg, callback) => {
  let classNames;
  if (arg === null) {
    classNames = getClassNameValuesFromNode(node);
    callback(classNames, node);
  } else {
    switch (arg.type) {
      case 'TemplateLiteral':
        arg.expression?.forEach((exp) => {
          parseNodeRecursive(node, exp.right, callback);
        });
        arg.quasis?.forEach((quasis) => {
          parseNodeRecursive(node, quasis, callback);
        });
        return;
      case 'Literal':
        classNames = arg.value;
        break;
      case 'TemplateElement':
        classNames = arg.value.raw;
        break;
    }
    callback(classNames, node);
  }
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Incorrect command class name',
      suggestion: false,
    },
    fixable: 'code',
  },
  create: (context) => {
    const parseForCustomColors = (classNames, node) => {
      classNames = findTargetClassNames(classNames);

      if (!classNames) {
        return;
      }

      classNames.forEach((className) => {
        if (mappedValidClassNames.includes(className)) {
          return;
        }

        context.report({
          node,
          message: `${className} is not a theme color`,
          data: {
            classname: className,
          },
        });
      });
    };

    return {
      JSXAttribute: (node) => {
        if (!isValidJSXAttribute(node)) {
          return;
        }
        parseNodeRecursive(node, null, parseForCustomColors);
      },
      CallExpression: function (node) {
        node.arguments.forEach((arg) => {
          parseNodeRecursive(node, arg, parseForCustomColors);
        });
      },
      TaggedTemplateExpression: (node) => {
        parseNodeRecursive(node, null, parseForCustomColors);
      },
    };
  },
};
