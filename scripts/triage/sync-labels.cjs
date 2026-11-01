'use strict';
// Creates or updates the taxonomy labels in every listed repository. Never deletes labels.
//   GH_TOKEN=$(gh auth token) node scripts/triage/sync-labels.cjs            # dry run
//   GH_TOKEN=$(gh auth token) node scripts/triage/sync-labels.cjs --apply
const { allLabels } = require('./taxonomy.cjs');

const ORG = 'ranvier-org';
const REPOS = ['Ranvier', 'Ranvier.View', 'Ranvier.WebCore', 'Ranvier.Css', 'Ranvier.Persistence', 'Ranvier.Docs', 'Ranvier.Examples'];

async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.GH_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 404) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return res.status === 404 ? null : res.json();
}

async function main() {
  if (!process.env.GH_TOKEN) throw new Error('Set GH_TOKEN, e.g. GH_TOKEN=$(gh auth token)');
  const apply = process.argv.includes('--apply');
  const wanted = allLabels();
  for (const repo of REPOS) {
    const existing = new Map();
    for (let page = 1; ; page++) {
      const batch = await gh('GET', `/repos/${ORG}/${repo}/labels?per_page=100&page=${page}`);
      if (!batch?.length) break;
      for (const l of batch) existing.set(l.name, l);
    }
    for (const [name, def] of Object.entries(wanted)) {
      const cur = existing.get(name);
      const change = !cur ? 'create' : cur.color.toLowerCase() !== def.color.toLowerCase() || (cur.description || '') !== def.description ? 'update' : null;
      if (!change) continue;
      console.log(`${apply ? '' : '[dry run] '}${repo}: ${change} ${name}`);
      if (!apply) continue;
      if (change === 'create') await gh('POST', `/repos/${ORG}/${repo}/labels`, { name, ...def });
      else await gh('PATCH', `/repos/${ORG}/${repo}/labels/${encodeURIComponent(name)}`, def);
    }
  }
  if (!apply) console.log('\nDry run only. Re-run with --apply to write.');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
