import typescriptEslint from '@typescript-eslint/eslint-plugin';
import { builtinRules } from 'eslint/use-at-your-own-risk';

const namingConvention = typescriptEslint.rules['naming-convention'];
const parserServices = {
  esTreeNodeToTSNodeMap: new WeakMap(),
  tsNodeToESTreeNodeMap: new WeakMap(),
  program: null,
};

const wrap = (target, overrides) =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        if (key in overrides) {
          return overrides[key];
        }
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    },
  );

const withParserServices = (context) => {
  const sourceCode = wrap(context.sourceCode, { parserServices });
  return wrap(context, { sourceCode, getSourceCode: () => sourceCode });
};

export default {
  meta: { name: 'eslint-compat' },
  rules: {
    'naming-convention': {
      ...namingConvention,
      create: (context) => namingConvention.create(withParserServices(context)),
    },
    'consistent-return': builtinRules.get('consistent-return'),
  },
};
