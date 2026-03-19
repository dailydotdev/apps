#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const repoRoot = process.cwd();

const packageConfigs = [
  {
    dir: 'packages/shared',
    tsconfig: 'tsconfig.strict.json',
  },
  {
    dir: 'packages/webapp',
    tsconfig: 'tsconfig.strict.json',
  },
  {
    dir: 'packages/extension',
    tsconfig: 'tsconfig.strict.json',
  },
  {
    dir: 'packages/storybook',
    tsconfig: 'tsconfig.json',
  },
];

const changedFiles = getChangedTypescriptFiles();

if (!changedFiles.length) {
  console.log('No changed TypeScript files to check.');
  process.exit(0);
}

const bannedTsCommentViolations = findBannedTsCommentViolations(changedFiles);
const strictErrorViolations = findStrictErrorViolations(changedFiles);

if (!bannedTsCommentViolations.length && !strictErrorViolations.length) {
  console.log('Changed TypeScript files passed strict migration guard.');
  process.exit(0);
}

if (bannedTsCommentViolations.length) {
  console.error('Found banned TypeScript comment directives in changed files:');
  bannedTsCommentViolations.forEach((violation) => {
    console.error(
      `  - ${violation.file}:${violation.line} uses ${violation.directive}`,
    );
  });
}

if (strictErrorViolations.length) {
  console.error('Found strict type errors in changed files:');
  strictErrorViolations.forEach((violation) => {
    console.error(`  - ${violation.message}`);
  });
}

process.exit(1);

function getChangedTypescriptFiles() {
  const baseRef = resolveBaseRef();
  const mergeBase = execGit(['merge-base', 'HEAD', baseRef]);
  const branchDiffOutput = execGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    `${mergeBase}...HEAD`,
    '--',
    ':(glob)**/*.ts',
    ':(glob)**/*.tsx',
  ]);
  const workingTreeOutput = execGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    'HEAD',
    '--',
    ':(glob)**/*.ts',
    ':(glob)**/*.tsx',
  ]);
  const untrackedOutput = execGit([
    'ls-files',
    '--others',
    '--exclude-standard',
    '--',
    ':(glob)**/*.ts',
    ':(glob)**/*.tsx',
  ]);

  return [
    ...branchDiffOutput.split('\n'),
    ...workingTreeOutput.split('\n'),
    ...untrackedOutput.split('\n'),
  ]
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file, index, files) => files.indexOf(file) === index)
    .filter((file) => fs.existsSync(path.join(repoRoot, file)));
}

function resolveBaseRef() {
  const candidates = [
    process.argv[2],
    process.env.TS_STRICT_BASE_REF,
    process.env.GITHUB_BASE_REF && `origin/${process.env.GITHUB_BASE_REF}`,
    'origin/main',
    'main',
  ].filter(Boolean);

  const validCandidate = candidates.find((candidate) => gitRefExists(candidate));

  if (validCandidate) {
    return validCandidate;
  }

  return 'HEAD~1';
}

function gitRefExists(ref) {
  try {
    execGit(['rev-parse', '--verify', ref]);
    return true;
  } catch (error) {
    return false;
  }
}

function findBannedTsCommentViolations(files) {
  const violations = [];

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (/@ts-ignore\b/.test(line)) {
        violations.push({
          directive: '@ts-ignore',
          file,
          line: index + 1,
        });
      }

      if (/@ts-nocheck\b/.test(line)) {
        violations.push({
          directive: '@ts-nocheck',
          file,
          line: index + 1,
        });
      }
    });
  });

  return violations;
}

function findStrictErrorViolations(files) {
  const changedFilesSet = new Set(files.map(normalizePath));
  const relevantPackages = packageConfigs.filter((config) =>
    files.some((file) => file.startsWith(`${config.dir}/`)),
  );
  const violations = [];

  relevantPackages.forEach((config) => {
    const packageDir = path.join(repoRoot, config.dir);
    const tscBinaryPath = resolveTypeScriptBinary(packageDir);
    const command = tscBinaryPath ? process.execPath : 'pnpm';
    const args = tscBinaryPath
      ? [tscBinaryPath, '-p', config.tsconfig, '--noEmit', '--pretty', 'false']
      : [
          'exec',
          'tsc',
          '-p',
          config.tsconfig,
          '--noEmit',
          '--pretty',
          'false',
        ];
    const result = spawnSync(
      command,
      args,
      {
        cwd: packageDir,
        encoding: 'utf8',
      },
    );

    if (result.error) {
      throw result.error;
    }

    const output = `${result.stdout || ''}${result.stderr || ''}`;
    const parsedErrors = parseTypeScriptErrors(output, packageDir);

    if (result.status === 0) {
      return;
    }

    if (!parsedErrors.length) {
      throw new Error(
        `Strict typecheck failed for ${config.dir} before TypeScript reported file errors.\n${output}`,
      );
    }

    parsedErrors.forEach((error) => {
      if (changedFilesSet.has(error.file)) {
        violations.push(error);
      }
    });
  });

  return violations;
}

function resolveTypeScriptBinary(packageDir) {
  try {
    return require.resolve('typescript/bin/tsc', {
      paths: [packageDir, repoRoot],
    });
  } catch (error) {
    return null;
  }
}

function parseTypeScriptErrors(output, packageDir) {
  const lines = output.split('\n');
  const errors = [];
  const errorPattern = /^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/;

  lines.forEach((line) => {
    const match = line.match(errorPattern);

    if (!match) {
      return;
    }

    const [, filePath, lineNumber, columnNumber, message] = match;
    const resolvedFilePath = normalizePath(
      path.relative(repoRoot, path.resolve(packageDir, filePath)),
    );

    errors.push({
      file: resolvedFilePath,
      message: `${resolvedFilePath}:${lineNumber}:${columnNumber} ${message}`,
    });
  });

  return errors;
}

function execGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}
