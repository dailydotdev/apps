#!/bin/sh
# Vercel "Ignored Build Step" for the webapp and storybook projects.
# Exit 0 skips the build, exit 1 runs it. Anything unexpected runs it.
#
# Production builds when the project's inputs changed since the last
# deployment. A preview builds when the branch touches the project at all
# (compared with the commit where it left main) and its inputs changed since
# the branch's last deployment.

cd "$(git rev-parse --show-toplevel)" || exit 1

build() {
  echo "Building: $1"
  exit 1
}

skip() {
  echo "Skipping: $1"
  exit 0
}

case "$1" in
  webapp)
    [ "$VERCEL_GIT_COMMIT_REF" = "cf" ] && skip "the cf branch never deploys"
    # Everything except what the webapp build never reads. The extension's
    # package.json stays in: next.config.ts takes the version from it.
    inputs=". :!packages/storybook :!packages/playwright :!packages/eslint-rules :!packages/extension/src :!packages/extension/__tests__ :!.circleci :!.github :!.claude :!.cursor :!.vscode :!docs :!plans :!oxlint-plugins :!.oxlintrc.json :!.oxfmtrc.json :!vercel.json :!*.md :!*.stories.tsx :!*.mdx"
    touches="$inputs"
    ;;
  storybook)
    inputs="packages/storybook packages/shared vercel.json scripts/vercel-ignore-build.sh"
    touches="packages/storybook vercel.json scripts/vercel-ignore-build.sh"
    ;;
  *)
    build "unknown project '$1'"
    ;;
esac

known() {
  git cat-file -e "$1^{commit}" 2>/dev/null
}

# True when the paths differ, and when git cannot tell.
changed_since() {
  # shellcheck disable=SC2086
  ! git diff --quiet "$1" HEAD -- $2
}

previous="$VERCEL_GIT_PREVIOUS_SHA"

if [ "$VERCEL_ENV" != "production" ]; then
  # The clone is shallow; fetch the history (no file contents) to find the
  # commit where the branch left main.
  depth=""
  [ "$(git rev-parse --is-shallow-repository)" = "true" ] && depth="--unshallow"
  git fetch --quiet --filter=blob:none $depth \
    "https://github.com/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG.git" main || build "could not fetch main"
  fork_point=$(git merge-base FETCH_HEAD HEAD) || build "no common commit with main"
  changed_since "$fork_point" "$touches" || skip "the branch does not touch $1"
fi

known "$previous" || build "no previous deployment to compare with"
changed_since "$previous" "$inputs" && build "$1 inputs changed since $previous"
skip "nothing $1 uses changed since $previous"
