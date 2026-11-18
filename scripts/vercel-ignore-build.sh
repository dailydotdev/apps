#!/bin/sh
# Vercel "Ignored Build Step" for the webapp and storybook projects.
# Exit 0 skips the build, exit 1 runs it. Anything unexpected runs it.
#
# Production builds when the project's inputs changed since the last
# deployment. A preview builds when the branch touches the project at all
# (compared with the commit where it left main) and its inputs changed since
# the branch's last deployment.

cd "$(git rev-parse --show-toplevel)" || exit 1

case "$1" in
  webapp)
    [ "$VERCEL_GIT_COMMIT_REF" = "cf" ] && exit 0
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
    exit 1
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
    "https://github.com/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG.git" main || exit 1
  fork_point=$(git merge-base FETCH_HEAD HEAD) || exit 1
  changed_since "$fork_point" "$touches" || exit 0
fi

known "$previous" || exit 1
changed_since "$previous" "$inputs" && exit 1
exit 0
