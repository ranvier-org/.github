#!/usr/bin/env bash
# Opens the triage PRs with your own GitHub login: one in ranvier-org/.github with the shared
# workflow, then one caller workflow per repository. Run from the root of the unpacked archive:
#   bash scripts/triage/open-prs.sh
# Needs git and gh (logged in with push access to ranvier-org). Safe to re-run: a repository that
# already has the branch is skipped.
set -euo pipefail

ORG=ranvier-org
BRANCH=triage/issue-labeler
REPOS=(Ranvier Ranvier.View Ranvier.WebCore Ranvier.Css Ranvier.Persistence Ranvier.Docs Ranvier.Examples)
SRC=$(pwd)
TRAILER='Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'

[ -f "$SRC/scripts/triage/triage.cjs" ] || { echo "Run this from the root of the unpacked archive."; exit 1; }
gh auth status >/dev/null
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

open_pr() { # repo title body commit-body copy-function
  local repo=$1 title=$2 body=$3 msg=$4 copy=$5
  if git ls-remote --exit-code --heads "https://github.com/$ORG/$repo" "$BRANCH" >/dev/null 2>&1; then
    echo "skip  $ORG/$repo: branch $BRANCH already exists"
    return
  fi
  gh repo clone "$ORG/$repo" "$WORK/$repo" -- --depth 1 -q
  (
    cd "$WORK/$repo"
    git checkout -q -b "$BRANCH"
    "$copy"
    git add -A
    git commit -q -m "$title" -m "$msg" -m "$TRAILER"
    git push -q -u origin "$BRANCH"
    gh pr create --head "$BRANCH" --title "$title" --body "$body"$'\n\n'"$FOOTER"
  )
}

copy_shared() {
  mkdir -p .github/workflows workflow-templates scripts/triage
  cp "$SRC/.github/workflows/triage.yml" .github/workflows/triage.yml
  cp "$SRC"/workflow-templates/triage.* workflow-templates/
  cp "$SRC"/scripts/triage/*.cjs "$SRC/scripts/triage/README.md" "$SRC/scripts/triage/open-prs.sh" scripts/triage/
}

copy_caller() {
  mkdir -p .github/workflows
  cp "$SRC/workflow-templates/triage.yml" .github/workflows/triage.yml
}

open_pr .github \
  "feat(triage): label and route new issues with Claude Haiku" \
  "Adds the shared issue triage that every ranvier-org repository calls. One Claude Haiku 5.5 call per new or reopened issue (about \$0.001) applies \`type:\`, \`area:\`, \`lane:\` and \`size:\` labels from \`scripts/triage/taxonomy.cjs\`, checks for duplicates across the org, and comments only for outside reporters with a likely duplicate or missing reproduction details.

Before merging:
- [ ] Org secret \`ANTHROPIC_API_KEY\` from a Console workspace with a spend limit
- [ ] Labels created with \`GH_TOKEN=\$(gh auth token) node scripts/triage/sync-labels.cjs --apply\`

Details and safety notes are in \`scripts/triage/README.md\`. Tests: \`node --test scripts/triage/triage.test.cjs\`." \
  "Reusable workflow, org workflow template, label taxonomy and sync script, and tests." \
  copy_shared

for repo in "${REPOS[@]}"; do
  open_pr "$repo" \
    "ci: triage new issues with the shared ranvier-org workflow" \
    "Calls the shared triage workflow in ranvier-org/.github for new and reopened issues. Merge after the .github PR.

To try it first: Actions → Triage → Run workflow with an issue number. Manual runs are dry runs by default and only write the job summary." \
    "Calls ranvier-org/.github/.github/workflows/triage.yml on opened and reopened issues, with a manual dry-run trigger." \
    copy_caller
done
