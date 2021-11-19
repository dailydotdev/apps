const tailwindConfig = require("../../../shared/tailwind.config");
const alwaysValidClasses = [
  "text-base",
  "text-center",
  "text-2xl",
  "text-left",
  "text-lg",
  "text-xl",
  "bg-none",
];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Incorrect command class name",
      suggestion: false,
    },
    fixable: "code",
  },
  create: (context) => {
    const targetClassNames = ["bg-", "text-"];
    const findTargetClassNames = (classNames) => {
      if (classNames === undefined) {
        return;
      }

      if (
        !Array.isArray(classNames) &&
        (typeof classNames === "string" || classNames instanceof String)
      ) {
        classNames = classNames.replace(/\s{2,}/g, " ");
        classNames = classNames.split(" ").filter((cls) => cls.length);
      }

      if (!Array.isArray(classNames)) {
        return;
      }

      return classNames.filter((className) => {
        return targetClassNames.some((matchClassName) =>
          className.startsWith(matchClassName)
        );
      });
    };

    const mapValidClassNames = (colors, prefix = "") => {
      return Object.keys(colors).reduce((r, k) => {
        if (typeof colors[k] === "object" && colors[k] !== null) {
          const newPrefix = prefix ? `${prefix}-${k}` : k;
          r = [
            ...new Set(r.concat(r, mapValidClassNames(colors[k], newPrefix))),
          ];
        } else {
          r.push(`${prefix && `${prefix}-`}${k}`);
        }
        return r;
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
          case "Literal":
            // No support for dynamic or conditional...
            return !/\{|\?|\}/.test(node.value.value);
          case "JSXExpressionContainer":
            // className={"..."}
            return node.value.expression.type === "Literal";
        }
      }
      return false;
    };

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
      if (node.value?.type === "JSXExpressionContainer") {
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
          case "TemplateLiteral":
            arg.expression?.forEach((exp) => {
              parseNodeRecursive(node, exp.right, callback);
            });
            arg.quasis?.forEach((quasis) => {
              parseNodeRecursive(node, quasis, callback);
            });
            return;
          case "Literal":
            classNames = arg.value;
            break;
          case "TemplateElement":
            classNames = arg.value.raw;
            break;
        }
        callback(classNames, node);
      }
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
