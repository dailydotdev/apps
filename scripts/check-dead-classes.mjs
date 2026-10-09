#!/usr/bin/env node
// Fails on Tailwind classes that compile to nothing.
//
// The shared Tailwind config replaces the default scales (opacity, z-index,
// width, colours…), so a class that exists in stock Tailwind can silently
// produce no CSS here. It then looks harmless until a mobile-first split
// like `tablet:w-74 w-full` turns the no-op into a desktop regression
// (dailydotdev/apps#6767, fixed in #6840).
//
// Default: check the lines added since `origin/main` (or BASE_REF).
//   node scripts/check-dead-classes.mjs
// Whole files, for an audit:
//   node scripts/check-dead-classes.mjs --all packages/shared/src/components/foo.tsx
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const repoRoot = process.cwd();
const webappRequire = createRequire(
  path.join(repoRoot, "packages/webapp/package.json")
);
const tailwindcss = webappRequire("tailwindcss");
const loadConfig = webappRequire("tailwindcss/loadConfig");
// postcss and the selector parser are Tailwind's own dependencies; resolve
// them from its package so pnpm's strict layout finds them.
const tailwindRequire = createRequire(
  webappRequire.resolve("tailwindcss/package.json")
);
const postcss = tailwindRequire("postcss");
const selectorParser = tailwindRequire("postcss-selector-parser");

const args = process.argv.slice(2);
const wholeFiles = args.includes("--all");
const explicitFiles = args.filter((a) => !a.startsWith("--"));
const baseRef = process.env.BASE_REF || "origin/main";

const SOURCE_FILE = /\.(tsx|ts|jsx|js)$/;
// Tests, stories, and the Tailwind config itself (it names keyframes and
// tokens that are not classes).
const SKIP_FILE =
  /\.(spec|test|stories)\.|__tests__|\/storybook\/|tailwind\.config\.|\/tailwind\//;

// A class token: a known utility prefix or a variant chain. Keeps ids, event
// names and GraphQL fields out of the candidates.
const VARIANT =
  /^!?-?(mobileL|mobileXL|mobileXXL|tablet|laptop|laptopL|laptopXL|desktop|desktopL|mouse|responsiveModalBreakpoint|hover|focus|focus-visible|focus-within|active|disabled|group|peer|first|last|only|odd|even|dark|light|motion-safe|motion-reduce|max-|min-|data-|aria-|has-|\[|@)[a-zA-Z0-9[\]-]*:/;
const UTILITY =
  /^!?-?(w|h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|top|bottom|left|right|inset|inset-x|inset-y|size|min-w|min-h|max-w|max-h|text|bg|border|border-t|border-b|border-l|border-r|border-x|border-y|rounded|rounded-t|rounded-b|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|flex|grid|grid-cols|grid-rows|col|row|items|justify|self|place|content|shadow|opacity|z|overflow|overflow-x|overflow-y|translate|translate-x|translate-y|scale|rotate|transition|duration|ease|delay|animate|font|leading|tracking|typo|whitespace|break|truncate|line-clamp|object|fill|stroke|ring|outline|cursor|pointer-events|select|touch|scroll|snap|space-x|space-y|divide|order|basis|grow|shrink|col-span|row-span|aspect|backdrop|blur|brightness|contrast|list|decoration|underline|align|table|columns|will-change|origin|accent|caret|resize|appearance|visible|invisible|hidden|block|inline|relative|absolute|fixed|sticky|static|sr-only|not-sr-only|uppercase|lowercase|capitalize|italic|container|isolate|mix-blend|from|via|to|bg-gradient|btn|safe|pointer|tabular-nums|antialiased)(-|$)/;

// Short prefixes that also start ordinary identifiers (`my-feed`, `top-hero`,
// `z-modal`): a plain `prefix-word` with one of these is not treated as a
// class. A number, a variant, a bracket or a second segment still counts.
const AMBIGUOUS =
  /^!?-?(m|mx|my|mt|mb|ml|mr|p|px|py|pt|pb|pl|pr|w|h|z|top|left|right|bottom|inset|gap|col|row|order|basis|size|space-x|space-y|divide|list|table|content|select|scroll|snap|break|to|from|via|align|accent|caret|touch|resize|columns|origin|delay|duration|ease|transition|translate|scale|rotate|will-change|place|self|items|justify|grow|shrink|flex|grid|object|fill|stroke|pointer|safe)-[a-zA-Z]+$/;

const looksLikeClass = (t) =>
  /^!?-?[a-zA-Z][a-zA-Z0-9:_\-/.[\]%#(),'"!]*$/.test(t) &&
  /[-:]/.test(t) &&
  !/[:,(]$/.test(t) &&
  !/^(https?:|mailto:|\/|\.\.?\/|@|#)/.test(t) &&
  !/\.(tsx?|jsx?|css|svg|png|json|md)$/.test(t) &&
  (VARIANT.test(t) || UTILITY.test(t)) &&
  !AMBIGUOUS.test(t);

const STRING = /(["'`])((?:\\.|(?!\1).)*)\1/g;

function tokensIn(text, file, tokens) {
  let m;
  STRING.lastIndex = 0;
  while ((m = STRING.exec(text))) {
    const s = m[2];
    if (m[1] !== "`" && s.includes("${")) continue;
    // A class list never holds "a: b", "a, b" or ";" — those are CSS
    // values, prose or data.
    if (/: |, |;/.test(s)) continue;
    for (const raw of s.replace(/\$\{[^}]*\}/g, " ").split(/\s+/)) {
      const t = raw.trim();
      if (!t || !looksLikeClass(t)) continue;
      if (!tokens.has(t)) tokens.set(t, new Set());
      tokens.get(t).add(file);
    }
  }
}

function git(...a) {
  return execFileSync("git", a, { cwd: repoRoot, encoding: "utf8" });
}

function collectCandidates() {
  const tokens = new Map();
  if (wholeFiles || explicitFiles.length) {
    const files = explicitFiles.length
      ? explicitFiles
      : git("diff", "--name-only", "--diff-filter=ACMR", `${baseRef}...HEAD`)
          .split("\n")
          .filter(Boolean);
    for (const f of files) {
      if (!SOURCE_FILE.test(f) || SKIP_FILE.test(f)) continue;
      tokensIn(fs.readFileSync(path.join(repoRoot, f), "utf8"), f, tokens);
    }
    return tokens;
  }
  const diff = git("diff", "-U0", "--diff-filter=ACMR", `${baseRef}...HEAD`);
  let file = "";
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git")) {
      file = line.replace(/^diff --git a\/.* b\//, "");
      continue;
    }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (!SOURCE_FILE.test(file) || SKIP_FILE.test(file)) continue;
    tokensIn(line.slice(1), file, tokens);
  }
  return tokens;
}

async function compiledClasses(candidates) {
  // The webapp config resolves the shared package relative to its own cwd.
  const previousCwd = process.cwd();
  process.chdir(path.join(repoRoot, "packages/webapp"));
  let config;
  try {
    config = loadConfig(
      path.join(repoRoot, "packages/webapp/tailwind.config.ts")
    );
  } finally {
    process.chdir(previousCwd);
  }
  const result = await postcss([
    tailwindcss({
      ...config,
      content: [{ raw: [...candidates].join("\n"), extension: "html" }],
    }),
  ]).process("@tailwind components;\n@tailwind utilities;", {
    from: undefined,
  });
  const classes = new Set();
  const collect = (root) =>
    root.walkRules((rule) => {
      try {
        selectorParser((sel) =>
          sel.walkClasses((c) => classes.add(c.value))
        ).processSync(rule.selector);
      } catch {
        // a selector postcss-selector-parser cannot read; nothing to add
      }
    });
  collect(result.root);
  // Hand-written stylesheets define classes too (shell-*, no-scrollbar…).
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      if (e.name === "node_modules" || e.name === ".next") return [];
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : e.name.endsWith(".css") ? [p] : [];
    });
  for (const f of walk(path.join(repoRoot, "packages"))) {
    try {
      collect(postcss.parse(fs.readFileSync(f, "utf8")));
    } catch {
      // a stylesheet postcss cannot parse on its own (Tailwind directives)
    }
  }
  return classes;
}

const candidates = collectCandidates();
if (candidates.size === 0) {
  console.log("No class candidates to check.");
  process.exit(0);
}
const known = await compiledClasses(candidates.keys());
const dead = [...candidates].filter(([t]) => !known.has(t));
if (dead.length === 0) {
  console.log(`All ${candidates.size} classes compile.`);
  process.exit(0);
}
console.error(
  `${dead.length} class${
    dead.length === 1 ? "" : "es"
  } compile to nothing (not in the Tailwind config or any stylesheet):\n`
);
for (const [t, files] of dead) {
  console.error(`  ${t}`);
  for (const f of files) console.error(`      ${f}`);
}
console.error(
  "\nUse a value from packages/shared/tailwind.config.ts, extend the config, or write it as an arbitrary value."
);
process.exit(1);
