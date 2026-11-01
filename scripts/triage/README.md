# Issue triage

Every new or reopened issue in a ranvier-org repository gets one Claude Haiku 5.5 call that labels it, suggests who should pick it up, and checks for duplicates across the org. It costs about $0.001 per issue and is billed to the Console organization that owns `ANTHROPIC_API_KEY` (your plan's monthly API credits when that organization is the linked one).

Triage only labels and, for outside reporters, comments. It never closes, assigns, edits, or sets priority, and nothing it does marks an issue ready for work.

## Labels

Defined in [`taxonomy.cjs`](taxonomy.cjs), which is the single source of truth.

| Group | Per issue | Labels |
|---|---|---|
| `type:` | exactly one | `bug`, `feat`, `perf`, `docs`, `research`, `chore` (mirrors conventional-commit types) |
| `area:` | one to three | 15 shared areas, each mapped to the commit scopes it covers (`area:dom` covers `dom`, `svg`, `cssom`, `geometry`…) |
| `lane:` | exactly one | `ralph` (Ultra implement loop), `worker` (small mechanical, API credits), `research` (research note), `human` |
| `size:` | exactly one | `s`, `m`, `l` |
| flags | optional | `needs-decision`, `needs-info`, `possible-duplicate`, `triaged` |

`lane:` is a suggestion. A maintainer confirms it before an agent takes the work.

## How it behaves

- **Maintainers' issues** (owner, member, collaborator): labels only, never a comment. A gap that would be "needs info" for an outsider becomes `needs-decision`.
- **Outside reporters**: labels, plus one comment only when the issue may be a duplicate or is missing reproduction details. Model-written text is stripped of mentions, links, images and HTML before posting.
- **Untrusted input**: the issue is passed as data and the model can only answer through a fixed schema. Anything outside the taxonomy, or an issue reference it wasn't shown, is dropped; an unknown lane falls back to `lane:human`.
- **Skips** pull requests, issues opened by bots, and issues already labelled `triaged` (unless forced).
- **Fails safe**: if the API call fails, the job fails and the issue is left untouched, ready to re-run.
- Each run writes its decision, cost and token counts to the job summary.

## Setup

1. **API key.** In the Claude Console org linked to your plan's credits, create a workspace called `triage` with a small monthly spend limit (e.g. $5) and an API key inside it. Add it as an **organization** secret `ANTHROPIC_API_KEY` in ranvier-org (Settings → Secrets and variables → Actions), available to the repositories below.
2. **Labels.** From a checkout of this repository:
   ```bash
   GH_TOKEN=$(gh auth token) node scripts/triage/sync-labels.cjs          # shows what would change
   GH_TOKEN=$(gh auth token) node scripts/triage/sync-labels.cjs --apply  # creates/updates; never deletes
   ```
   Existing labels such as `bug` or `enhancement` are left alone.
3. **Callers.** Each repository needs `.github/workflows/triage.yml`, a copy of [`workflow-templates/triage.yml`](../../workflow-templates/triage.yml). It also appears under Actions → New workflow in every ranvier-org repo.
4. **Try it.** In any repo, Actions → Triage → Run workflow with an existing issue number. Manual runs are dry runs by default, so you can read the decisions in the job summary before letting it write.

## Opening the PRs

`bash scripts/triage/open-prs.sh` (from this repository's root, with `gh` logged in) opens this PR in ranvier-org/.github and one caller PR in each repository listed in it. Re-running skips repositories that already have the branch.

## Tests

```bash
node --test scripts/triage/triage.test.cjs
```
