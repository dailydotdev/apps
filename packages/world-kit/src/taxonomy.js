/**
 * Which realm a district belongs to.
 *
 * A copy of the grouping in the renderer's `taxonomy.js`, carried here because
 * that file imports three on its first line and this package has to run in
 * node. It lives beside `paletteKeys` because that is all it decides: which
 * colour names a builder for this district may use.
 *
 * A district missing from this table is one the tooling refuses to author for
 * rather than one it guesses at. `worldKitContract.test.ts` diffs the pair so
 * they cannot drift.
 */

export const REALM_OF = {
  ai_llm: 'swarm', ai_agents: 'swarm', ai_infra: 'swarm', ml_ds: 'swarm',
  data_eng: 'swarm', ai_safety: 'swarm', python: 'swarm',
  js_ts: 'frame', css_design: 'frame', android: 'frame', ios_apple: 'frame',
  jvm: 'frame', dotnet: 'frame', php: 'frame', ruby: 'frame',
  c_cpp: 'forge', rust: 'forge', linux_os: 'forge', embedded: 'forge',
  gamedev: 'forge', niche_langs: 'forge',
  k8s: 'ship', cloud: 'ship', go: 'ship', ci_devex: 'ship',
  observability: 'ship', databases: 'ship', distributed_arch: 'ship', selfhost: 'ship',
  sec_appsec: 'bastion', sec_crypto: 'bastion', sec_threats: 'bastion',
  devtools: 'quarter', git_vcs: 'quarter', software_craft: 'quarter',
  cs_fundamentals: 'quarter', career: 'quarter', eng_mgmt: 'quarter',
  industry_news: 'quarter', other: 'quarter',
};

export const realmOf = (niche) => REALM_OF[niche] ?? null;
