/* eslint-disable @typescript-eslint/no-var-requires */
const { createMacro } = require('babel-plugin-macros');

exports.quickMacro = (requireFunc) =>
  createMacro(({ references, state, babel }) => {
    // lets walk through all calls of the macro
    references.default.map((referencePath) => {
      // check if it is call expression e.g. someFunction("blah-blah")
      if (referencePath.parentPath.type === 'CallExpression') {
        // call our macro
        requireFunc({ referencePath, state, babel });
      } else {
        // fail otherwise
        throw new Error(
          `This is not supported: \`${referencePath
            .findParent(babel.types.isExpression)
            .getSource()}\`. Please see the documentation`,
        );
      }
    });
  });

exports.replaceMacro = (replaceFunc) =>
  exports.quickMacro(({ referencePath, babel }) => {
    const t = babel.types;
    const callExpressionPath = referencePath.parentPath;
    let arg;
    try {
      arg = callExpressionPath.get('arguments')[0].evaluate().value;
    } catch (err) {
      // swallow error, print better error below
    }

    if (arg === undefined) {
      throw new Error(
        `There was a problem evaluating the value of the argument for the code: ${callExpressionPath.getSource()}. ` +
          `If the value is dynamic, please make sure that its value is statically deterministic.`,
      );
    }

    referencePath.parentPath.replaceWith(t.stringLiteral(replaceFunc(arg)));
  });
