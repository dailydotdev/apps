#!/usr/bin/env node

// Copies the gitignored local files listed in .worktreeinclude from the main
// checkout into a linked worktree. Claude Code reads .worktreeinclude natively;
// this covers worktrees created with a plain `git worktree add`.
// Only plain paths relative to the repo root are supported (a trailing `/`
// marks a directory), no globs or negation. Existing files are never
// overwritten, tracked files are never copied, and it never fails the install.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try {
  copyWorktreeFiles();
} catch (error) {
  console.warn(`copy-worktree-files: skipped (${error.message})`);
}

process.exit(0);

function copyWorktreeFiles() {
  const gitDir = tryGit(['rev-parse', '--path-format=absolute', '--git-dir']);
  const commonDir = tryGit([
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  ]);

  if (!gitDir || !commonDir || gitDir === commonDir) {
    return;
  }

  const worktreeRoot = tryGit(['rev-parse', '--show-toplevel']);
  const mainRoot = getMainCheckoutRoot();

  if (!worktreeRoot || !mainRoot || worktreeRoot === mainRoot) {
    return;
  }

  // Falls back to the list beside this script when it runs by path against an
  // older worktree that predates .worktreeinclude.
  const includeFile = [worktreeRoot, path.resolve(__dirname, '..')]
    .map((dir) => path.join(dir, '.worktreeinclude'))
    .find((file) => fs.existsSync(file));

  if (!includeFile) {
    return;
  }

  fs.readFileSync(includeFile, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((entry) => {
      const relativePath = entry.replace(/\/+$/, '');
      const source = path.join(mainRoot, relativePath);
      const destination = path.join(worktreeRoot, relativePath);

      if (
        !fs.existsSync(source) ||
        fs.existsSync(destination) ||
        !isIgnored(entry, mainRoot)
      ) {
        return;
      }

      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.cpSync(source, destination, { recursive: true });
      console.log(
        `copy-worktree-files: copied ${entry} from the main checkout`,
      );
    });
}

function getMainCheckoutRoot() {
  const mainWorktree = tryGit(['worktree', 'list', '--porcelain'])
    ?.split('\n')
    .find((line) => line.startsWith('worktree '));

  return mainWorktree ? mainWorktree.slice('worktree '.length) : null;
}

function isIgnored(entry, cwd) {
  try {
    execGit(['check-ignore', '-q', '--', entry], cwd);
    return true;
  } catch (error) {
    return false;
  }
}

function tryGit(args) {
  try {
    return execGit(args);
  } catch (error) {
    return null;
  }
}

function execGit(args, cwd = process.cwd()) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}
