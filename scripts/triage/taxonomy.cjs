'use strict';
// The ranvier-org label taxonomy. Single source of truth for the triage prompt, its validation
// and sync-labels.cjs. Change labels here, then run sync-labels.cjs.
//
// Groups: exactly one type, one to three areas, exactly one lane, one size. Flags are optional.
// Priority and "ready" are maintainer decisions and are deliberately not set by triage.

const TYPES = {
  'type:bug': { color: 'D73A4A', description: 'Something behaves wrongly' },
  'type:feat': { color: '7F77DD', description: 'New capability or API' },
  'type:perf': { color: 'BA7517', description: 'Speed, memory or allocation work' },
  'type:docs': { color: '378ADD', description: 'Guides, XML docs, examples' },
  'type:research': { color: '5DCAA5', description: 'Open question; the outcome is a note, not code' },
  'type:chore': { color: '888780', description: 'CI, build, release, deps, refactors, tests' },
};

// Each area lists the commit scopes it covers, so issues and conventional commits line up.
const AREAS = {
  'area:core': { scopes: ['core', 'graph', 'arms', 'twin', 'projection', 'maps', 'counters'], description: 'Reactive graph, signals, scheduling' },
  'area:trace': { scopes: ['trace', 'diagnostics', 'journal', 'replay'], description: 'Tracing, diagnostics, journal and replay' },
  'area:mcp': { scopes: ['mcp', 'agent'], description: 'MCP tools and agent-observable graph' },
  'area:view': { scopes: ['view', 'motion', 'anime', 'server', 'hydration', 'timing'], description: 'Templates, SSR, hydration, motion' },
  'area:dom': { scopes: ['dom', 'svg', 'cssom', 'geometry', 'caret', 'a11y', 'highlights', 'viewport', 'screen', 'resources', 'crypto', 'native-api'], description: 'DOM, SVG and CSSOM contracts and bindings' },
  'area:webcore': { scopes: ['webcore', 'host', 'abi', 'interop', 'native', 'patches', 'capabilities'], description: 'WebKit build, C ABI host, native packages' },
  'area:generator': { scopes: ['generator', 'gen', 'dom-generate'], description: 'Binding and contract generators' },
  'area:css': { scopes: ['css'], description: 'Typed CSS values, stylesheets, extraction' },
  'area:persistence': { scopes: ['persistence', 'store'], description: 'Persisted inputs and state stores' },
  'area:wire': { scopes: ['wire', 'query', 'elmish'], description: 'Ranvier.Wire, Ranvier.Query, Ranvier.Elmish' },
  'area:analyzers': { scopes: ['analyzers', 'rules'], description: 'F# analyzers and build-time checks' },
  'area:fable': { scopes: ['fable', 'aot'], description: 'Fable/JS target and AOT concerns' },
  'area:bench': { scopes: ['bench', 'benchmarks', 'perf'], description: 'Benchmarks and perf harnesses' },
  'area:build': { scopes: ['ci', 'build', 'release', 'deps', 'packages', 'tools'], description: 'CI, build scripts, packaging, releases' },
  'area:docs-site': { scopes: ['docs', 'examples', 'playground', 'guide'], description: 'Docs site, examples and playground' },
};

// Who should pick the work up. Triage suggests; a maintainer confirms before work starts.
const LANES = {
  'lane:ralph': {
    color: '534AB7',
    description: 'Implement with the ralph loop (Ultra)',
    rule: 'A code change with clear scope and checkable acceptance criteria, usually size m or l, touching library behaviour.',
  },
  'lane:worker': {
    color: '0F6E56',
    description: 'Small mechanical task for an API-credit worker',
    rule: 'Size s, mechanical, no public API change and no design choice: typo or doc fixes, regenerating outputs, formatting, a dependency bump, an obvious CI config fix.',
  },
  'lane:research': {
    color: '1D9E75',
    description: 'Research agent writes a note',
    rule: 'Exploratory or open-ended, compares options, or has no acceptance criteria. The outcome is a research note and a proposed scope.',
  },
  'lane:human': {
    color: '993C1D',
    description: 'Needs a maintainer to do or decide it',
    rule: 'Public API shape, breaking changes, security, release policy, project direction, native or platform build failures that need a real machine, or anything you are unsure about.',
  },
};

const SIZES = {
  'size:s': { color: 'D3D1C7', description: 'One file or a few lines' },
  'size:m': { color: 'B4B2A9', description: 'A feature-sized change' },
  'size:l': { color: '888780', description: 'Several areas or a design change' },
};

const FLAGS = {
  'needs-decision': { color: 'D85A30', description: 'Has an open question only a maintainer can answer' },
  'needs-info': { color: 'EF9F27', description: 'Waiting on the reporter for details' },
  'possible-duplicate': { color: 'CECBF6', description: 'Triage found an issue that looks the same' },
  triaged: { color: 'EEEDFE', description: 'Automated triage has run' },
};

const AREA_COLOR = 'C5DEF5';

function allLabels() {
  const out = {};
  for (const [n, v] of Object.entries(TYPES)) out[n] = { color: v.color, description: v.description };
  for (const [n, v] of Object.entries(AREAS)) out[n] = { color: AREA_COLOR, description: v.description };
  for (const [n, v] of Object.entries(LANES)) out[n] = { color: v.color, description: v.description };
  for (const [n, v] of Object.entries(SIZES)) out[n] = { color: v.color, description: v.description };
  for (const [n, v] of Object.entries(FLAGS)) out[n] = { color: v.color, description: v.description };
  return out;
}

module.exports = { TYPES, AREAS, LANES, SIZES, FLAGS, allLabels };
