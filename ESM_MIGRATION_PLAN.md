# ESM Migration Plan for daily.dev Apps

## Executive Summary

**Status:** ✅ ESM migration is **POSSIBLE** but requires significant effort.

**Key Findings:**
- Source code already uses ES6 imports/exports (95% ready)
- Main blockers: Jest 26.x (needs upgrade), build tool configs in CommonJS
- Estimated effort: 2-3 weeks for full migration
- Risk level: Medium-High (primarily testing infrastructure)

## Current State

### Module Configuration
- ❌ No `"type": "module"` in any package.json
- ✅ TypeScript configs use `"module": "esnext"`
- ✅ All source code (`.ts/.tsx`) uses ES6 imports/exports
- ❌ Build configs (`.js`) use CommonJS

### CommonJS Usage (19 files)
- `webpack.config.js` (extension)
- `jest.config.js` (webapp, extension, shared)
- `babel.config.js` (extension, shared)
- `postcss.config.js` (all packages)
- `.eslintrc.js` (all packages)
- ESLint custom rules/config packages
- Prettier config package
- **Source code:** Only 1 `require()` in test file

### Dependencies ESM Status

**✅ Ready:**
- Next.js 15.4.10
- React 18.3.1
- TypeScript 5.6.3
- @tanstack/react-query v5.80.5

**⚠️ Needs Attention:**
- Jest 26.x → Must upgrade to 29.x
- babel-jest 26.x → Must upgrade to 29.x
- graphql-request 3.7.0 → Works via CJS interop, v6+ for pure ESM
- node-fetch 2.6.x → Remove (use native fetch in Node 22)

## Migration Strategies

### Option A: Full Migration (Recommended Long-term)
**Effort:** 2-3 weeks
**Risk:** Medium-High

#### Benefits:
- Future-proof architecture
- Better tree-shaking
- Modern tooling compatibility
- Aligns with ecosystem direction

#### Steps:

**Phase 1: Update Testing Infrastructure** (Highest Priority)
1. Upgrade Jest 26 → 29
   ```json
   "jest": "^29.7.0",
   "babel-jest": "^29.7.0",
   "ts-jest": "^29.1.0"
   ```
2. Migrate jest configs: `jest.config.js` → `jest.config.mjs`
3. Fix test file: Replace `require('react')` with `import` in `UserExperiencesList.spec.tsx:21`
4. Configure Jest for ESM with `extensionsToTreatAsEsm`

**Phase 2: Convert Config Files**
1. Add `"type": "module"` to all package.json files
2. Convert configs:
   - `babel.config.js` → `babel.config.mjs`
   - `postcss.config.js` → `postcss.config.mjs`
   - `.eslintrc.js` → `.eslintrc.cjs` (ESLint prefers CJS)
   - `webpack.config.js` → `webpack.config.cjs` or ESM
3. Update shared packages (eslint-config, prettier-config, eslint-rules)

**Phase 3: Update Dependencies**
1. Remove `node-fetch` (use native fetch)
2. Consider upgrading `graphql-request` to v6+
3. Update Babel config (remove `babel-plugin-dynamic-import-node`)

**Phase 4: Test & Verify**
1. Test each package individually
2. Verify builds work
3. Check browser extension compatibility
4. Test Next.js SSR/SSG

### Option B: Partial Migration (Pragmatic)
**Effort:** Few days
**Risk:** Low

#### Steps:
1. Keep config files as CommonJS (rename to `.cjs`)
2. Add `"type": "module"` to package.json
3. Fix the one `require()` in test code
4. Minimal Jest updates

#### Benefits:
- 80% of ESM benefits
- Lower risk
- Easier rollback
- Works with current tooling

### Option C: Wait & Watch
**Effort:** None
**Risk:** None

Stay with current setup. The codebase works fine today.

## Risk Analysis

### 🔴 High Risk
- **Jest upgrade:** v26 → v29 may break existing tests
- **Webpack config:** 235-line complex config with many plugins
- **Monorepo constraint:** All packages must migrate together

### 🟡 Medium Risk
- **Babel configuration:** Dynamic imports may behave differently
- **graphql-request:** May need major version upgrade with breaking changes
- **Browser extension:** webextension-polyfill ESM compatibility

### 🟢 Low Risk
- **Source code:** Already ESM
- **Next.js:** Already uses ESM (next.config.ts)
- **PostCSS plugins:** Most have ESM support

## Blockers Summary

| Item | Severity | Solution |
|------|----------|----------|
| Jest 26.x | 🔴 Critical | Upgrade to Jest 29+ |
| graphql-request 3.x | 🟡 Medium | Works via interop, or upgrade to v6+ |
| Webpack config | 🟡 Medium | Rename to `.cjs` or refactor |
| ESLint/Prettier packages | 🟢 Low | Simple export changes |
| node-fetch | 🟢 Low | Remove, use native fetch |

## Recommendation

**Start with Option B (Partial Migration):**
1. Get immediate benefits with minimal risk
2. Evaluate pain points in practice
3. Move to Option A (Full Migration) based on actual needs

**Rationale:**
- You're on Node 22 (excellent ESM support)
- Next.js 15 is ESM-first
- Source code is already ESM-ready
- Testing infrastructure upgrade is the main challenge

## Next Steps

If proceeding with migration:

1. **Immediate:**
   - Create feature branch
   - Upgrade Jest ecosystem (packages/webapp first)
   - Fix the one `require()` in test code

2. **Short-term:**
   - Add `"type": "module"` to package.json files
   - Rename config files to `.cjs` or `.mjs` appropriately
   - Update shared packages (eslint-config, prettier-config)

3. **Before merging:**
   - Full test suite pass
   - Manual QA on webapp
   - Browser extension smoke tests
   - Performance benchmarks (bundle sizes)

## Resources

- [Jest ESM Support](https://jestjs.io/docs/ecmascript-modules)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [Next.js ESM Support](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Webpack ESM Guide](https://webpack.js.org/guides/ecma-script-modules/)
