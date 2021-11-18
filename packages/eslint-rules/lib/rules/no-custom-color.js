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
    return {
      JSXAttribute: (node) => {
        if (!node.value || node.name.name !== "className") {
          return;
        }

        const classNames = node.value.value?.split(" ");
        const sortedclassNames = "w-full";

        if (classNames && classNames.includes(sortedclassNames)) {
          context.report({
            message: `${sortedclassNames} should not be a className`,
            node,
          });
        }
      },
    };
  },
};
