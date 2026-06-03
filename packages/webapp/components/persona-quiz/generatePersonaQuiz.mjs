/* eslint-disable no-console */
// --------------------------------------------------------------------------
// Persona-quiz regenerator (v3: branching C/D + sub-personas).
//
// WHY THIS EXISTS
//   The v2 graph branched only twice per path (the rest of the questions just
//   accumulated tags), so ~91% of answers couldn't change the revealed
//   persona and the questionnaire felt repetitive. v3 makes a branch land in
//   roughly every phase: each domain is a depth-3 binary decision tree, so a
//   user's answers genuinely steer them to one of 8 sub-personas per domain
//   (32 total). Colour (non-branching) questions add coherent, non-redundant
//   tag flavour — never opposite-domain tags — so the reveal's tags stop
//   contradicting its headline. Prompts deliberately vary sentence structure
//   so the quiz doesn't read as templated.
//
// HOW TO REGENERATE
//   node packages/webapp/components/persona-quiz/generatePersonaQuiz.mjs
//   (emits personaQuizQuestionGraph.json + personaQuizArchetypes.json and runs
//   the validation gate; it throws if any invariant is violated.)
//
// The DSL below is authored bottom-up (children before parents) because each
// parent references its children. Q1 lives in personaQuizSampleConfig.ts and
// routes into the four domain roots (qp1 / qi1 / qd1 / qs1).
// --------------------------------------------------------------------------

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

// Real daily.dev tag slugs already in use by the v2 graph + archetypes. All
// generated tagWeights / keyTags must come from this set.
const VOCAB = new Set([
  '3d', 'accessibility', 'agile', 'ai', 'analytics-platforms', 'android',
  'android-development', 'angular', 'ansible', 'anthropic', 'apache-airflow',
  'apache-flink', 'apache-iceberg', 'apache-kafka', 'apache-spark', 'api',
  'apm', 'app-store', 'appsec', 'architecture', 'arm', 'authentication', 'aws',
  'azure', 'backend', 'bi', 'big-data', 'bun', 'business',
  'business-development', 'c', 'c++', 'career', 'change-data-capture', 'cicd',
  'cli', 'cloud', 'cloud-native', 'code-review', 'code-security', 'commandline',
  'company-culture', 'compliance', 'continuous-improvement', 'cryptography',
  'css', 'cuda', 'data-analysis', 'data-engineering', 'data-quality',
  'data-science', 'data-streaming', 'data-visualization', 'data-warehouse',
  'databricks', 'deep-learning', 'design-patterns', 'design-systems', 'devops',
  'devrel', 'devsecops', 'devtools', 'distributed-systems', 'docker', 'dora',
  'duckdb', 'edge-computing', 'embedded', 'embeddings', 'enterprise',
  'entrepreneurship', 'etl', 'exploratory-data-analysis', 'expo', 'finance',
  'firmware', 'flutter', 'frontend', 'game-design', 'game-development',
  'gamedev', 'games', 'gaming', 'gcp', 'genai', 'general-programming', 'git',
  'go', 'godot', 'grafana', 'graphics-programming', 'graphql', 'hardware',
  'helm', 'huggingface', 'hybrid-cloud', 'iac', 'infrastructure', 'investing',
  'ios', 'iot', 'javascript', 'jetpack-compose', 'jupyter', 'kotlin',
  'kubernetes', 'langchain', 'leadership', 'lighthouse', 'llama', 'llm',
  'llmops', 'logging', 'machine-learning', 'mlops', 'mobile', 'mobile-dev',
  'mobile-gaming', 'monitoring', 'mqtt', 'multi-cloud', 'neural-networks',
  'nextjs', 'nodejs', 'observability', 'open-source', 'openai', 'openapi',
  'opentelemetry', 'pentesting', 'performance', 'platform-engineering',
  'postgresql', 'predictive-analytics', 'prisma', 'product-management',
  'productivity', 'project-management', 'prometheus', 'prompt-engineering',
  'pulumi', 'pwa', 'python', 'pytorch', 'rag', 'raspberry-pi', 'react',
  'react-hooks', 'react-native', 'real-time-analytics', 'remote-work',
  'rest-api', 'revenue', 'robotics', 'rust', 'sbom', 'scikit', 'scrum',
  'secrets-management', 'security', 'self-hosted', 'semantic-kernel', 'sensors',
  'series-a', 'serverless', 'snowflake', 'sql', 'sre', 'startup',
  'statistical-analysis', 'steam', 'storybook', 'styled-components', 'supabase',
  'svelte', 'swift', 'swiftui', 'tailwind-css', 'technical-debt', 'tensorflow',
  'terraform', 'testing', 'transformers', 'typescript', 'typography', 'ui',
  'ui-design', 'ui-ux', 'unity', 'unreal-engine', 'user-testing',
  'vector-search', 'venture-capital', 'vercel', 'vite', 'vs-code', 'vue',
  'vulkan', 'vulnerability', 'web-components', 'web-development', 'web-security',
  'webassembly', 'webdev', 'webgpu', 'webpack', 'y-combinator', 'zero-day',
]);

// --- DSL constructors ------------------------------------------------------
// chain: both answers continue to the same child (adds tag flavour, no fork).
const C = (axis, prompt, yesTags, noTags, child) => ({
  t: 'chain', axis, prompt, yesTags, noTags, child,
});
// branch: yes/no fork into different subtrees (this is where the persona is decided).
const B = (axis, prompt, yes, no) => ({ t: 'branch', axis, prompt, yes, no });
// end: terminal question carrying the archetypeId; both answers finish the quiz.
const E = (axis, prompt, yesTags, noTags, archetypeId) => ({
  t: 'end', axis, prompt, yesTags, noTags, archetypeId,
});

// --- Build (assign ids depth-first, then flatten) --------------------------
const assignIds = (node, prefix, counter) => {
  counter.n += 1;
  node.id = `${prefix}${counter.n}`;
  if (node.t === 'chain') {
    assignIds(node.child, prefix, counter);
  } else if (node.t === 'branch') {
    assignIds(node.yes.to, prefix, counter);
    assignIds(node.no.to, prefix, counter);
  }
};

const emit = (node, out) => {
  if (node.t === 'end') {
    out.push({
      id: node.id, axis: node.axis, prompt: node.prompt, cols: 2,
      archetypeId: node.archetypeId,
      options: [
        { id: 'yes', label: 'Yes', tagWeights: node.yesTags, next: null },
        { id: 'no', label: 'No', tagWeights: node.noTags, next: null },
      ],
    });
    return;
  }
  if (node.t === 'chain') {
    out.push({
      id: node.id, axis: node.axis, prompt: node.prompt, cols: 2,
      options: [
        { id: 'yes', label: 'Yes', tagWeights: node.yesTags, next: node.child.id },
        { id: 'no', label: 'No', tagWeights: node.noTags, next: node.child.id },
      ],
    });
    emit(node.child, out);
    return;
  }
  out.push({
    id: node.id, axis: node.axis, prompt: node.prompt, cols: 2,
    options: [
      { id: 'yes', label: 'Yes', tagWeights: node.yes.tags, next: node.yes.to.id },
      { id: 'no', label: 'No', tagWeights: node.no.tags, next: node.no.to.id },
    ],
  });
  emit(node.yes.to, out);
  emit(node.no.to, out);
};

const buildDomain = (root, prefix) => {
  assignIds(root, prefix, { n: 0 });
  const out = [];
  emit(root, out);
  return out;
};

// ==========================================================================
// PRODUCT — root qp1.
// ==========================================================================
const productRoot = (() => {
  const dsEnd = E(
    'product_design_systems_terminal',
    'A component without documented props and design tokens does not feel finished to you.',
    { 'design-systems': 2, storybook: 1, 'web-components': 1 },
    { css: 1, ui: 1 },
    'design_systems_engineer',
  );
  const a11yEnd = E(
    'product_accessibility_terminal',
    'You will open a screen reader to check a feature, not just the browser.',
    { accessibility: 2, 'ui-ux': 1, 'user-testing': 1 },
    { css: 1, ui: 1 },
    'accessibility_engineer',
  );
  const designForkB3 = B(
    'product_design_focus',
    'You think in reusable systems — one component should serve a hundred screens.',
    { tags: { 'design-systems': 2, 'web-components': 1 }, to: dsEnd },
    { tags: { accessibility: 2, 'ui-ux': 1 }, to: a11yEnd },
  );
  const designColorC2 = C(
    'product_design_tooling',
    'You build components in isolation, with a workshop like Storybook always open.',
    { storybook: 2, 'design-systems': 1 },
    { frontend: 1, ui: 1 },
    designForkB3,
  );

  const renderEnd = E(
    'product_rendering_perf_terminal',
    'You can explain why an avoidable re-render can cost more than the request that triggered it.',
    { performance: 2, react: 1 },
    { javascript: 1, 'web-development': 1 },
    'rendering_performance_engineer',
  );
  const buildPerfEnd = E(
    'product_build_perf_terminal',
    'A two-minute CI build feels like a bug with your name on it.',
    { performance: 2, cicd: 1, devtools: 1 },
    { javascript: 1, 'web-development': 1 },
    'build_performance_engineer',
  );
  const perfForkB3 = B(
    'product_perf_focus',
    'The performance problems that nag you happen while the page is running in the browser.',
    { tags: { performance: 1, lighthouse: 1, nextjs: 1 }, to: renderEnd },
    { tags: { webpack: 1, vite: 1, bun: 1 }, to: buildPerfEnd },
  );
  const perfColorC2 = C(
    'product_perf_measurement',
    'Profiling a real page with real data is a normal part of your week.',
    { performance: 2, lighthouse: 1 },
    { frontend: 1, 'web-development': 1 },
    perfForkB3,
  );

  const craftForkB2 = B(
    'product_craft_split',
    'You could happily spend a whole day getting one screen’s structure and spacing exactly right.',
    { tags: { 'design-systems': 1, ui: 1, css: 1 }, to: designColorC2 },
    { tags: { performance: 1, lighthouse: 1 }, to: perfColorC2 },
  );
  const uiColorC1 = C(
    'product_ui_framework',
    'Starting a new screen, you open a component framework like React first.',
    { react: 2, typescript: 1, frontend: 1 },
    { svelte: 1, vue: 1, 'web-components': 1 },
    craftForkB2,
  );

  const nativeEnd = E(
    'product_native_mobile_terminal',
    'Push notifications, biometrics, deep links — a platform’s own APIs are your bread and butter.',
    { ios: 2, android: 1, swift: 1, kotlin: 1 },
    { mobile: 1, 'mobile-dev': 1 },
    'native_mobile_engineer',
  );
  const crossEnd = E(
    'product_cross_platform_terminal',
    'Shipping one codebase to both app stores is the trade-off you happily make.',
    { 'react-native': 2, flutter: 1, expo: 1 },
    { mobile: 1, 'mobile-dev': 1 },
    'cross_platform_mobile_engineer',
  );
  const mobileForkB3 = B(
    'product_mobile_approach',
    'You’d happily write a feature twice to use each platform’s native language.',
    { tags: { swift: 1, kotlin: 1, swiftui: 1, 'jetpack-compose': 1 }, to: nativeEnd },
    { tags: { 'react-native': 1, flutter: 1 }, to: crossEnd },
  );
  const mobileColorC2 = C(
    'product_mobile_constraints',
    'App-store review cycles and OS updates shape how you plan a release.',
    { mobile: 2, 'mobile-dev': 1 },
    { mobile: 1, 'app-store': 1 },
    mobileForkB3,
  );

  const productFsEnd = E(
    'product_fullstack_terminal',
    'Owning a feature from the form on screen to the row in the database is your idea of a good week.',
    { nextjs: 2, react: 1, vercel: 1, serverless: 1 },
    { nodejs: 1, backend: 1 },
    'product_fullstack_engineer',
  );
  const apiFsEnd = E(
    'product_api_layer_terminal',
    'You sweat the shape of a payload the way others sweat a layout.',
    { graphql: 2, 'rest-api': 1, openapi: 1 },
    { backend: 1, api: 1 },
    'api_fullstack_engineer',
  );
  const fsForkB3 = B(
    'product_fullstack_focus',
    'Shipping a whole feature end to end is what makes the work satisfying for you.',
    { tags: { nextjs: 1, react: 1, vercel: 1 }, to: productFsEnd },
    { tags: { graphql: 1, postgresql: 1, prisma: 1 }, to: apiFsEnd },
  );
  const fsColorC2 = C(
    'product_fullstack_typednetwork',
    'You wire up a typed client between frontend and backend before writing much else.',
    { typescript: 2, graphql: 1 },
    { nodejs: 1, 'rest-api': 1 },
    fsForkB3,
  );

  const systemsForkB2 = B(
    'product_systems_split',
    'Your client code is built to land in an app store.',
    { tags: { mobile: 1, 'mobile-dev': 1, ios: 1 }, to: mobileColorC2 },
    { tags: { nodejs: 1, backend: 1, nextjs: 1 }, to: fsColorC2 },
  );
  const systemsColorC1 = C(
    'product_systems_ownership',
    'The API and the database behind your screens are usually yours to change too.',
    { backend: 2, nodejs: 1 },
    { frontend: 1, 'web-development': 1 },
    systemsForkB2,
  );

  const surfaceB1 = B(
    'product_surface',
    'Most of your day is spent on screens people actually look at.',
    { tags: { frontend: 2, ui: 1 }, to: uiColorC1 },
    { tags: { backend: 1, mobile: 1 }, to: systemsColorC1 },
  );
  return C(
    'product_language_default',
    'Reaching for TypeScript is a reflex; plain JavaScript feels under-dressed to you.',
    { typescript: 2, frontend: 1 },
    { javascript: 2, frontend: 1 },
    surfaceB1,
  );
})();

// ==========================================================================
// INFRA — root qi1.
// ==========================================================================
const infraRoot = (() => {
  const cloudEnd = E(
    'infra_cloud_terminal',
    'Provisioning a new environment is a piece of code you write, not a ticket you file.',
    { terraform: 2, iac: 1 },
    { cloud: 1, devops: 1 },
    'cloud_infrastructure_engineer',
  );
  const k8sEnd = E(
    'infra_kubernetes_terminal',
    'Kubernetes is the substrate you expect everything else to run on.',
    { kubernetes: 2, helm: 1, 'cloud-native': 1 },
    { docker: 1, infrastructure: 1 },
    'kubernetes_platform_engineer',
  );
  const cloudForkB3 = B(
    'infra_cloud_approach',
    'You’re happiest deep in provider-level infrastructure and IaC.',
    { tags: { terraform: 1, aws: 1, pulumi: 1, 'multi-cloud': 1 }, to: cloudEnd },
    { tags: { kubernetes: 1, helm: 1, 'platform-engineering': 1 }, to: k8sEnd },
  );
  const cloudColorC2 = C(
    'infra_cloud_golden_path',
    'Giving teams a paved road to ship on is a goal you actively design for.',
    { 'platform-engineering': 2, iac: 1 },
    { cloud: 1, devops: 1 },
    cloudForkB3,
  );

  const obsEnd = E(
    'infra_observability_terminal',
    'If a service moves, you want a metric or a trace that proves it.',
    { observability: 2, prometheus: 1, opentelemetry: 1 },
    { monitoring: 1, logging: 1 },
    'observability_engineer',
  );
  const incidentEnd = E(
    'infra_incident_terminal',
    'A clean incident retro that closes real action items is genuinely satisfying to you.',
    { sre: 2, dora: 1, 'distributed-systems': 1 },
    { monitoring: 1, cloud: 1 },
    'incident_reliability_engineer',
  );
  const reliabilityForkB3 = B(
    'infra_reliability_focus',
    'You’d rather instrument a system thoroughly than be the one paged when it breaks.',
    { tags: { observability: 1, grafana: 1, apm: 1 }, to: obsEnd },
    { tags: { sre: 1, dora: 1 }, to: incidentEnd },
  );
  const reliabilityColorC2 = C(
    'infra_reliability_slo',
    'Error budgets and SLOs are tools you actually use, not slides you have seen.',
    { sre: 2, observability: 1 },
    { monitoring: 1, cloud: 1 },
    reliabilityForkB3,
  );

  const platformForkB2 = B(
    'infra_platform_split',
    'Standing up and wiring the cloud platform is the work you reach for first.',
    { tags: { terraform: 1, kubernetes: 1, cloud: 1 }, to: cloudColorC2 },
    { tags: { observability: 1, sre: 1 }, to: reliabilityColorC2 },
  );
  const platformColorC1 = C(
    'infra_platform_scale',
    'The systems you run are large enough that a manual change is something you actively forbid.',
    { infrastructure: 2, 'cloud-native': 1 },
    { devops: 1, cloud: 1 },
    platformForkB2,
  );

  const appsecEnd = E(
    'infra_appsec_terminal',
    'A vulnerability in someone else’s dependency still feels like your problem to fix.',
    { appsec: 2, 'web-security': 1, 'code-security': 1 },
    { security: 1, vulnerability: 1 },
    'application_security_engineer',
  );
  const infrasecEnd = E(
    'infra_supplychain_terminal',
    'The build and release pipeline is the thing you most want to keep tamper-proof.',
    { devsecops: 2, sbom: 1, 'secrets-management': 1 },
    { security: 1, compliance: 1 },
    'infrastructure_security_engineer',
  );
  const securityForkB3 = B(
    'infra_security_focus',
    'When you look for risk, you read the application’s own code first.',
    { tags: { appsec: 1, 'code-security': 1, cryptography: 1 }, to: appsecEnd },
    { tags: { devsecops: 1, sbom: 1, 'secrets-management': 1 }, to: infrasecEnd },
  );
  const securityColorC2 = C(
    'infra_security_shiftleft',
    'A finding caught in the IDE or a pull request beats one caught in production every time.',
    { devsecops: 2, appsec: 1 },
    { security: 1, vulnerability: 1 },
    securityForkB3,
  );

  const dxEnd = E(
    'infra_dx_terminal',
    'You judge a tool by how many minutes it gives back to every engineer who uses it.',
    { devtools: 2, productivity: 1, 'vs-code': 1 },
    { cli: 1, 'open-source': 1 },
    'developer_experience_engineer',
  );
  const buildSysEnd = E(
    'infra_build_systems_terminal',
    'A compiler or a build graph is somewhere you have happily spent real engineering time.',
    { devtools: 2, rust: 1, go: 1 },
    { cli: 1, 'open-source': 1 },
    'build_systems_engineer',
  );
  const devtoolsForkB3 = B(
    'infra_devtools_focus',
    'You measure your impact in the daily friction you remove for other engineers.',
    { tags: { productivity: 1, git: 1, 'vs-code': 1 }, to: dxEnd },
    { tags: { rust: 1, go: 1, bun: 1 }, to: buildSysEnd },
  );
  const devtoolsColorC2 = C(
    'infra_devtools_distribution',
    'Open source is your natural way to get the tools you build into people’s hands.',
    { 'open-source': 2, devtools: 1 },
    { cli: 1, git: 1 },
    devtoolsForkB3,
  );

  const dxSecForkB2 = B(
    'infra_devtools_security_split',
    'Keeping attackers out is part of your daily work.',
    { tags: { security: 1, appsec: 1, devsecops: 1 }, to: securityColorC2 },
    { tags: { devtools: 1, productivity: 1 }, to: devtoolsColorC2 },
  );
  const dxSecColorC1 = C(
    'infra_developer_audience',
    'Other engineers are the people who actually use what you ship.',
    { devtools: 2, 'open-source': 1 },
    { security: 1, devops: 1 },
    dxSecForkB2,
  );

  const opsB1 = B(
    'infra_domain_split',
    'Your job is keeping the platform itself running and scaling.',
    { tags: { infrastructure: 2, cloud: 1 }, to: platformColorC1 },
    { tags: { devtools: 1, security: 1 }, to: dxSecColorC1 },
  );
  return C(
    'infra_iac_default',
    'Infrastructure as code is simply how your team runs everything.',
    { iac: 2, devops: 1 },
    { infrastructure: 2, cloud: 1 },
    opsB1,
  );
})();

// ==========================================================================
// DATA — root qd1.
// ==========================================================================
const dataRoot = (() => {
  const trainingEnd = E(
    'data_ml_training_terminal',
    'A new architecture paper can pull you in as fast as a new benchmark score.',
    { 'deep-learning': 2, 'neural-networks': 1, transformers: 1 },
    { 'machine-learning': 1, python: 1 },
    'ml_training_engineer',
  );
  const mlopsEnd = E(
    'data_mlops_terminal',
    'A model is only interesting to you once it is serving traffic without falling over.',
    { mlops: 2, llmops: 1, cicd: 1 },
    { 'machine-learning': 1, python: 1 },
    'mlops_engineer',
  );
  const mlForkB3 = B(
    'data_ml_focus',
    'You love digging into a model’s internals — its layers, attention, and gradients.',
    { tags: { 'deep-learning': 1, pytorch: 1, cuda: 1 }, to: trainingEnd },
    { tags: { mlops: 1, huggingface: 1 }, to: mlopsEnd },
  );
  const mlColorC2 = C(
    'data_ml_tooling',
    'A framework like PyTorch or TensorFlow is installed and in use on your machine.',
    { pytorch: 2, tensorflow: 1 },
    { 'machine-learning': 1, python: 1 },
    mlForkB3,
  );

  const llmAppEnd = E(
    'data_llm_app_terminal',
    'An agent that picks the right tool at the right moment is your kind of build.',
    { llm: 2, openai: 1, 'prompt-engineering': 1 },
    { genai: 1, ai: 1 },
    'llm_app_engineer',
  );
  const ragEnd = E(
    'data_rag_terminal',
    'Keeping an answer grounded in the right context is a problem you enjoy solving.',
    { rag: 2, 'vector-search': 1, embeddings: 1 },
    { llm: 1, genai: 1 },
    'rag_retrieval_engineer',
  );
  const llmForkB3 = B(
    'data_llm_focus',
    'The product layer — prompts, tools, and agent behaviour — is where you spend your time.',
    { tags: { llm: 1, 'prompt-engineering': 1, langchain: 1 }, to: llmAppEnd },
    { tags: { rag: 1, 'vector-search': 1, embeddings: 1 }, to: ragEnd },
  );
  const llmColorC2 = C(
    'data_llm_shipping',
    'Shipping an AI feature, you wire up context and tools and leave the model weights alone.',
    { genai: 2, llm: 1 },
    { ai: 1, 'machine-learning': 1 },
    llmForkB3,
  );

  const aiForkB2 = B(
    'data_ai_split',
    'You’d rather train and run your own models than build on a hosted one.',
    { tags: { 'machine-learning': 1, pytorch: 1, mlops: 1 }, to: mlColorC2 },
    { tags: { llm: 1, genai: 1 }, to: llmColorC2 },
  );
  const aiColorC1 = C(
    'data_ai_experiments',
    'Your work runs on experiments, and you expect plenty of them to fail.',
    { 'machine-learning': 1, ai: 1 },
    { ai: 1, python: 1 },
    aiForkB2,
  );

  const streamingEnd = E(
    'data_streaming_terminal',
    'Stale data bothers you more than slow data; freshness is a number you watch.',
    { 'data-streaming': 2, 'apache-kafka': 1, 'apache-flink': 1 },
    { 'data-engineering': 1, etl: 1 },
    'streaming_data_engineer',
  );
  const batchEnd = E(
    'data_batch_terminal',
    'A well-modelled table in the warehouse is an artefact you take real pride in.',
    { 'data-warehouse': 2, 'apache-spark': 1, snowflake: 1 },
    { 'data-engineering': 1, etl: 1 },
    'batch_data_engineer',
  );
  const deForkB3 = B(
    'data_eng_focus',
    'Events stream into your systems and you process them the moment they land.',
    { tags: { 'data-streaming': 1, 'apache-kafka': 1, 'change-data-capture': 1 }, to: streamingEnd },
    { tags: { 'apache-spark': 1, 'apache-airflow': 1, 'apache-iceberg': 1 }, to: batchEnd },
  );
  const deColorC2 = C(
    'data_eng_reliability',
    'You carry a pager for your pipelines, just like a backend engineer does for services.',
    { 'data-engineering': 2, 'data-quality': 1 },
    { etl: 1, 'big-data': 1 },
    deForkB3,
  );

  const analyticsEnd = E(
    'data_analytics_terminal',
    'You’ll happily kill nine dashboards to protect one trustworthy metric.',
    { 'analytics-platforms': 2, bi: 1, 'data-visualization': 1 },
    { sql: 1, 'data-analysis': 1 },
    'analytics_bi_engineer',
  );
  const dsEnd = E(
    'data_science_terminal',
    'Turning a fuzzy business question into a defensible, testable answer is the part you enjoy most.',
    { 'data-science': 2, 'statistical-analysis': 1, 'predictive-analytics': 1 },
    { sql: 1, 'data-analysis': 1 },
    'data_science_analyst',
  );
  const analyticsForkB3 = B(
    'data_analytics_focus',
    'You’d reach for a BI tool and a clean data model before a notebook of statistics.',
    { tags: { bi: 1, 'data-visualization': 1, duckdb: 1 }, to: analyticsEnd },
    { tags: { 'statistical-analysis': 1, 'exploratory-data-analysis': 1, jupyter: 1 }, to: dsEnd },
  );
  const analyticsColorC2 = C(
    'data_analytics_sql',
    'SQL is your home base; Python is the tool you grab when you need it.',
    { sql: 2, 'analytics-platforms': 1 },
    { 'data-analysis': 1, 'data-science': 1 },
    analyticsForkB3,
  );

  const dataForkB2 = B(
    'data_pipeline_split',
    'You take pride in building the pipelines that move data.',
    { tags: { 'data-engineering': 1, 'apache-kafka': 1, etl: 1 }, to: deColorC2 },
    { tags: { sql: 1, bi: 1, 'data-analysis': 1 }, to: analyticsColorC2 },
  );
  const dataColorC1 = C(
    'data_consumer',
    'Your work is consumed by other systems as often as by people.',
    { 'data-engineering': 1, 'big-data': 1 },
    { 'data-analysis': 1, sql: 1 },
    dataForkB2,
  );

  const modelsB1 = B(
    'data_domain_split',
    'Your day is closer to models and AI than to data pipelines and analytics.',
    { tags: { 'machine-learning': 2, ai: 1 }, to: aiColorC1 },
    { tags: { 'data-engineering': 1, 'data-analysis': 1 }, to: dataColorC1 },
  );
  return C(
    'data_python_default',
    'Python is where you live for most of your work.',
    { python: 2 },
    { sql: 2 },
    modelsB1,
  );
})();

// ==========================================================================
// SPECIALTY — root qs1.
// ==========================================================================
const specialtyRoot = (() => {
  const gameplayEnd = E(
    'specialty_gameplay_terminal',
    'Playtesting a build with real players teaches you more than any design doc.',
    { 'game-design': 2, unity: 1, godot: 1 },
    { 'game-development': 1, gamedev: 1 },
    'gameplay_developer',
  );
  const graphicsEnd = E(
    'specialty_graphics_terminal',
    'You benchmark a shader the way other engineers benchmark an API.',
    { 'graphics-programming': 2, webgpu: 1, vulkan: 1 },
    { 'game-development': 1, '3d': 1 },
    'graphics_programmer',
  );
  const gameForkB3 = B(
    'specialty_game_focus',
    'You judge your work by one question: is it fun to play?',
    { tags: { 'game-design': 1, unity: 1, 'unreal-engine': 1 }, to: gameplayEnd },
    { tags: { 'graphics-programming': 1, vulkan: 1, '3d': 1 }, to: graphicsEnd },
  );
  const gameColorC2 = C(
    'specialty_game_shipping',
    'You have shipped at least one game to a public store or platform.',
    { 'game-development': 2, steam: 1 },
    { gamedev: 1, gaming: 1 },
    gameForkB3,
  );

  const firmwareEnd = E(
    'specialty_firmware_terminal',
    'Bare metal is where you are comfortable; an operating system is a luxury you design around.',
    { firmware: 2, c: 1, arm: 1 },
    { embedded: 1, hardware: 1 },
    'firmware_engineer',
  );
  const iotEnd = E(
    'specialty_iot_terminal',
    'Your code reads sensors and drives motors as often as it talks to a server.',
    { robotics: 2, sensors: 1, mqtt: 1 },
    { iot: 1, embedded: 1 },
    'iot_robotics_engineer',
  );
  const embeddedForkB3 = B(
    'specialty_embedded_focus',
    'You enjoy wringing every last cycle out of a single chip.',
    { tags: { firmware: 1, c: 1, rust: 1 }, to: firmwareEnd },
    { tags: { iot: 1, robotics: 1, sensors: 1 }, to: iotEnd },
  );
  const embeddedColorC2 = C(
    'specialty_embedded_constraints',
    'Memory footprint and interrupt timing are numbers you watch as closely as throughput.',
    { embedded: 2, firmware: 1 },
    { hardware: 1, 'raspberry-pi': 1 },
    embeddedForkB3,
  );

  const builderForkB2 = B(
    'specialty_builder_split',
    'What you build runs on a screen and is meant to be played.',
    { tags: { 'game-development': 1, gamedev: 1, unity: 1 }, to: gameColorC2 },
    { tags: { embedded: 1, firmware: 1, hardware: 1 }, to: embeddedColorC2 },
  );
  const builderColorC1 = C(
    'specialty_builder_toolchain',
    'Your daily toolchain is built around native SDKs, game engines or embedded runtimes.',
    { 'game-development': 1, embedded: 1 },
    { 'c++': 1, hardware: 1 },
    builderForkB2,
  );

  const emEnd = E(
    'specialty_eng_manager_terminal',
    'Your team shipping well without you in the room is the clearest sign of your best work.',
    { leadership: 2, 'company-culture': 1, 'project-management': 1 },
    { career: 1, agile: 1 },
    'engineering_manager',
  );
  const techLeadEnd = E(
    'specialty_tech_lead_terminal',
    'Setting the technical direction the team can run with is squarely your responsibility.',
    { architecture: 2, 'design-patterns': 1, 'technical-debt': 1 },
    { leadership: 1, 'continuous-improvement': 1 },
    'technical_lead_architect',
  );
  const leadershipForkB3 = B(
    'specialty_leadership_focus',
    'Your instinct is to invest in people before you invest in the architecture.',
    { tags: { leadership: 1, 'company-culture': 1, scrum: 1 }, to: emEnd },
    { tags: { architecture: 1, 'design-patterns': 1, 'technical-debt': 1 }, to: techLeadEnd },
  );
  const leadershipColorC2 = C(
    'specialty_leadership_rhythm',
    'Your calendar is mostly one-on-ones and team rituals, with little design or architecture time.',
    { leadership: 2, 'remote-work': 1 },
    { agile: 1, 'project-management': 1 },
    leadershipForkB3,
  );

  const founderEnd = E(
    'specialty_founder_terminal',
    'Debugging production at 2am and pitching investors at 9am can happen on the same day for you.',
    { startup: 2, 'venture-capital': 1, revenue: 1 },
    { entrepreneurship: 1, business: 1 },
    'startup_founder',
  );
  const devrelEnd = E(
    'specialty_devrel_terminal',
    'Turning hard technology into something developers love to use is the work you gravitate to.',
    { devrel: 2, 'open-source': 1, 'business-development': 1 },
    { career: 1, productivity: 1 },
    'developer_advocate',
  );
  const founderForkB3 = B(
    'specialty_founder_focus',
    'Building the company and its product is what you’re really chasing.',
    { tags: { startup: 1, 'product-management': 1, revenue: 1 }, to: founderEnd },
    { tags: { devrel: 1, 'open-source': 1 }, to: devrelEnd },
  );
  const founderColorC2 = C(
    'specialty_founder_calendar',
    'Fundraising, customer calls and runway math are recurring items on your calendar.',
    { startup: 2, entrepreneurship: 1 },
    { business: 1, 'business-development': 1 },
    founderForkB3,
  );

  const peopleForkB2 = B(
    'specialty_people_split',
    'You’re growing a team inside a company someone else started.',
    { tags: { leadership: 1, 'company-culture': 1 }, to: leadershipColorC2 },
    { tags: { startup: 1, entrepreneurship: 1 }, to: founderColorC2 },
  );
  const peopleColorC1 = C(
    'specialty_people_accountability',
    'You answer to people — a team or a market — first, and to a block of code second.',
    { leadership: 1, 'company-culture': 1 },
    { startup: 1, business: 1 },
    peopleForkB2,
  );

  const handsOnB1 = B(
    'specialty_domain_split',
    'You still write more code than you review, delegate or pitch.',
    { tags: { 'game-development': 1, embedded: 1 }, to: builderColorC1 },
    { tags: { leadership: 1, startup: 1 }, to: peopleColorC1 },
  );
  return C(
    'specialty_surface',
    'Your work targets a device, a game, or a team — rarely a typical web service.',
    { 'game-development': 1, embedded: 1 },
    { leadership: 1, startup: 1 },
    handsOnB1,
  );
})();

// --- Archetypes (32 sub-personas) ------------------------------------------
const ARCHETYPES = [
  { id: 'design_systems_engineer', name: 'Design Systems Engineer', headline: 'Tokens, components, and the contracts between them', description: 'Your feed runs on component libraries, design tokens, and the API design of UI itself. You treat a well-documented component like a public interface.', keyTags: ['design-systems', 'frontend', 'react', 'css', 'storybook', 'typescript', 'ui', 'web-components', 'styled-components', 'tailwind-css'] },
  { id: 'accessibility_engineer', name: 'Accessibility Engineer', headline: 'Interfaces everyone can actually use', description: 'Your feed mixes ARIA patterns, inclusive UX, and the CSS to back them. A failed audit reads as a bug to you, not a nice-to-have.', keyTags: ['accessibility', 'frontend', 'css', 'ui', 'ui-ux', 'ui-design', 'web-components', 'react', 'typography', 'user-testing'] },
  { id: 'rendering_performance_engineer', name: 'Rendering Performance Engineer', headline: 'Frames, paints, and the cost of hydration', description: 'Your feed surfaces Core Web Vitals, rendering strategies, and when not to ship JavaScript at all.', keyTags: ['performance', 'lighthouse', 'nextjs', 'react', 'javascript', 'web-development', 'pwa', 'webassembly', 'frontend', 'vite'] },
  { id: 'build_performance_engineer', name: 'Build Performance Engineer', headline: 'Fast builds, lean bundles, happy CI', description: 'Your feed covers bundlers, tree-shaking, and shaving seconds off every install and deploy.', keyTags: ['performance', 'webpack', 'vite', 'bun', 'javascript', 'typescript', 'frontend', 'web-development', 'cicd', 'devtools'] },
  { id: 'native_mobile_engineer', name: 'Native Mobile Engineer', headline: 'Platform-native, down to the gesture', description: 'Your feed covers Swift, Kotlin, and the platform APIs that make an app feel at home on the device.', keyTags: ['ios', 'android', 'swift', 'kotlin', 'swiftui', 'jetpack-compose', 'mobile', 'mobile-dev', 'android-development'] },
  { id: 'cross_platform_mobile_engineer', name: 'Cross-Platform Mobile Engineer', headline: 'One codebase, two app stores', description: 'Your feed blends React Native, Flutter, and the trade-offs of shipping everywhere at once.', keyTags: ['react-native', 'flutter', 'expo', 'mobile', 'mobile-dev', 'typescript', 'ios', 'android', 'javascript'] },
  { id: 'product_fullstack_engineer', name: 'Product Full-Stack Engineer', headline: 'Whole features, database to deploy', description: 'Your feed blends frontend frameworks, APIs, and deploys. You like owning a feature end to end.', keyTags: ['nextjs', 'react', 'typescript', 'nodejs', 'vercel', 'serverless', 'rest-api', 'supabase', 'backend'] },
  { id: 'api_fullstack_engineer', name: 'API & Data-Layer Engineer', headline: 'The contract the whole product leans on', description: 'Your feed covers GraphQL and REST API design, Postgres schemas, and the data layer behind the UI. You sweat the shape of every payload.', keyTags: ['graphql', 'rest-api', 'postgresql', 'prisma', 'nodejs', 'typescript', 'backend', 'openapi', 'api'] },

  { id: 'cloud_infrastructure_engineer', name: 'Cloud Infrastructure Engineer', headline: 'Terraform applies and nobody flinches', description: 'Your feed covers cloud-provider internals, Terraform and IaC, and the blast radius of every change.', keyTags: ['terraform', 'aws', 'gcp', 'azure', 'iac', 'cloud', 'cloud-native', 'infrastructure', 'pulumi', 'devops', 'multi-cloud'] },
  { id: 'kubernetes_platform_engineer', name: 'Kubernetes Platform Engineer', headline: 'Orchestrating the substrate everything runs on', description: 'Your feed runs on Kubernetes, Helm, and the golden paths other teams build on.', keyTags: ['kubernetes', 'helm', 'docker', 'cloud-native', 'platform-engineering', 'devops', 'infrastructure', 'iac', 'self-hosted'] },
  { id: 'observability_engineer', name: 'Observability Engineer', headline: 'If it moves, you measure it', description: 'Your feed surfaces Prometheus metrics, OpenTelemetry traces, and the Grafana dashboards that catch trouble before users do.', keyTags: ['observability', 'monitoring', 'prometheus', 'grafana', 'opentelemetry', 'logging', 'apm', 'sre', 'distributed-systems'] },
  { id: 'incident_reliability_engineer', name: 'Reliability Engineer', headline: 'On-call is a design problem, not a ritual', description: 'Your feed mixes SLOs, incident retros, and error budgets. You treat reliability as a feature and watch your DORA metrics.', keyTags: ['sre', 'observability', 'distributed-systems', 'dora', 'cicd', 'monitoring', 'cloud', 'architecture', 'logging'] },
  { id: 'application_security_engineer', name: 'Application Security Engineer', headline: 'Threat modeling starts at sprint planning', description: 'Your feed covers appsec, code scanning, and the vulnerabilities that ship in someone else’s dependency.', keyTags: ['appsec', 'security', 'web-security', 'code-security', 'vulnerability', 'authentication', 'cryptography', 'devsecops', 'pentesting'] },
  { id: 'infrastructure_security_engineer', name: 'Infrastructure Security Engineer', headline: 'Securing the pipeline and everything it touches', description: 'Your feed mixes supply-chain threats, secrets management, and SBOMs — hardening the build itself.', keyTags: ['security', 'devsecops', 'sbom', 'secrets-management', 'zero-day', 'compliance', 'vulnerability', 'infrastructure', 'cloud'] },
  { id: 'developer_experience_engineer', name: 'Developer Experience Engineer', headline: 'Measuring productivity in friction removed', description: 'Your feed covers internal tooling, Git and CI workflows, and shaving minutes off every engineer’s day.', keyTags: ['devtools', 'productivity', 'cli', 'git', 'vs-code', 'open-source', 'cicd', 'testing', 'code-review'] },
  { id: 'build_systems_engineer', name: 'Build Systems Engineer', headline: 'Compilers, build graphs, and fast feedback', description: 'Your feed runs on build tooling, compilers in Rust and Go, and the CLIs other engineers live in.', keyTags: ['devtools', 'cli', 'rust', 'go', 'bun', 'vite', 'commandline', 'open-source', 'cicd'] },

  { id: 'ml_training_engineer', name: 'ML Training Engineer', headline: 'Where architectures and benchmarks meet', description: 'Your feed covers model training, neural architectures, and the math behind the benchmark scores.', keyTags: ['machine-learning', 'pytorch', 'tensorflow', 'deep-learning', 'neural-networks', 'transformers', 'cuda', 'python', 'scikit'] },
  { id: 'mlops_engineer', name: 'MLOps Engineer', headline: 'Getting models out of notebooks and into production', description: 'Your feed mixes serving, evaluation, and the pipelines that keep a model healthy in prod.', keyTags: ['mlops', 'machine-learning', 'python', 'huggingface', 'pytorch', 'llmops', 'deep-learning', 'cicd', 'data-engineering'] },
  { id: 'llm_app_engineer', name: 'AI Application Engineer', headline: 'LLMs as infrastructure, products as the goal', description: 'Your feed surfaces prompt design, agent patterns, and the layer between the model and the user.', keyTags: ['llm', 'openai', 'anthropic', 'genai', 'prompt-engineering', 'langchain', 'ai', 'semantic-kernel', 'llmops'] },
  { id: 'rag_retrieval_engineer', name: 'Retrieval & RAG Engineer', headline: 'Grounding answers in the right context', description: 'Your feed covers embeddings, vector search, and the retrieval that keeps an LLM honest.', keyTags: ['rag', 'vector-search', 'embeddings', 'llm', 'langchain', 'genai', 'openai', 'ai', 'semantic-kernel'] },
  { id: 'streaming_data_engineer', name: 'Streaming Data Engineer', headline: 'Pipelines that never sleep', description: 'Your feed runs on Kafka, Flink, and the freshness SLAs behind real-time data.', keyTags: ['data-engineering', 'apache-kafka', 'apache-flink', 'data-streaming', 'change-data-capture', 'real-time-analytics', 'big-data', 'etl', 'data-quality'] },
  { id: 'batch_data_engineer', name: 'Batch & Warehouse Engineer', headline: 'Lakehouses, warehouses, and trustworthy tables', description: 'Your feed covers Spark, Airflow, and the lakehouse architecture behind the warehouse.', keyTags: ['data-engineering', 'apache-spark', 'apache-airflow', 'apache-iceberg', 'snowflake', 'databricks', 'data-warehouse', 'etl', 'big-data'] },
  { id: 'analytics_bi_engineer', name: 'Analytics Engineer', headline: 'Turning queries into decisions', description: 'Your feed mixes SQL craft, BI tooling, and metric definitions worth a thousand ad-hoc queries.', keyTags: ['analytics-platforms', 'sql', 'bi', 'data-visualization', 'data-analysis', 'duckdb', 'data-warehouse', 'real-time-analytics'] },
  { id: 'data_science_analyst', name: 'Data Scientist', headline: 'From raw data to a defensible answer', description: 'Your feed covers statistics, exploratory analysis, and the models behind a prediction.', keyTags: ['data-science', 'statistical-analysis', 'exploratory-data-analysis', 'predictive-analytics', 'python', 'jupyter', 'scikit', 'data-analysis'] },

  { id: 'gameplay_developer', name: 'Gameplay Developer', headline: 'Where mechanics become fun', description: 'Your feed covers engines, game design, and the iteration loop that turns mechanics into play.', keyTags: ['game-development', 'gamedev', 'unity', 'unreal-engine', 'godot', 'game-design', 'gaming', 'c++', '3d'] },
  { id: 'graphics_programmer', name: 'Graphics Programmer', headline: 'Rendering pipelines and 60 honest frames', description: 'Your feed runs on shaders, GPUs, and the rendering math behind every frame.', keyTags: ['graphics-programming', 'webgpu', 'vulkan', '3d', 'c++', 'game-development', 'unreal-engine', 'gamedev', 'gaming'] },
  { id: 'firmware_engineer', name: 'Firmware Engineer', headline: 'Code that runs where there is no OS', description: 'Your feed surfaces RTOS trade-offs, bare-metal C, and counting every byte.', keyTags: ['embedded', 'firmware', 'c', 'rust', 'c++', 'arm', 'hardware', 'sensors', 'raspberry-pi'] },
  { id: 'iot_robotics_engineer', name: 'IoT & Robotics Engineer', headline: 'Bytes that move motors and read the world', description: 'Your feed covers sensors, robotics, and the protocols connecting devices to the cloud.', keyTags: ['iot', 'robotics', 'sensors', 'mqtt', 'embedded', 'raspberry-pi', 'hardware', 'rust', 'c++'] },
  { id: 'engineering_manager', name: 'Engineering Manager', headline: 'Growing people, not just code', description: 'Your feed covers team health, delivery, and the rituals that help engineers do their best work.', keyTags: ['leadership', 'company-culture', 'project-management', 'scrum', 'agile', 'remote-work', 'career', 'continuous-improvement', 'productivity'] },
  { id: 'technical_lead_architect', name: 'Technical Lead / Architect', headline: 'Setting technical direction the team can run with', description: 'Your feed mixes architecture, design patterns, and paying down debt before it compounds.', keyTags: ['architecture', 'design-patterns', 'technical-debt', 'leadership', 'continuous-improvement', 'distributed-systems', 'agile', 'code-review'] },
  { id: 'startup_founder', name: 'Technical Founder', headline: 'Building a company one hard decision at a time', description: 'Your feed blends startup strategy, fundraising, and shipping product on a runway.', keyTags: ['startup', 'entrepreneurship', 'business', 'venture-capital', 'product-management', 'revenue', 'y-combinator', 'series-a', 'investing'] },
  { id: 'developer_advocate', name: 'Developer Advocate', headline: 'Engineering that meets the community', description: 'Your feed covers devrel, open source, and turning hard tech into things developers love.', keyTags: ['devrel', 'open-source', 'career', 'productivity', 'business-development', 'remote-work', 'leadership', 'continuous-improvement'] },
];

// Q1 lives in the config; included here only so the validator can walk full
// user paths (Q1 + domain tree) and count Q1 as a branch point.
const Q1 = {
  id: 'q1_domain', axis: 'domain', prompt: 'Which of these feels most like your day?', cols: 1,
  options: [
    { id: 'product', tagWeights: { frontend: 1, 'web-development': 1 }, next: 'qp1' },
    { id: 'infra', tagWeights: { backend: 1, infrastructure: 1 }, next: 'qi1' },
    { id: 'data', tagWeights: { 'data-science': 1, 'machine-learning': 1, ai: 1 }, next: 'qd1' },
    { id: 'specialty', tagWeights: { 'game-development': 1, embedded: 1 }, next: 'qs1' },
  ],
};

const graph = [
  ...buildDomain(productRoot, 'qp'),
  ...buildDomain(infraRoot, 'qi'),
  ...buildDomain(dataRoot, 'qd'),
  ...buildDomain(specialtyRoot, 'qs'),
];

// --- Validation gate -------------------------------------------------------
const validate = (questions, archetypes) => {
  const errors = [];
  const byId = new Map(questions.map((q) => [q.id, q]));
  const isTerminal = (q) => q.options.every((o) => o.next == null);
  const branches = (q) => q.options[0].next !== q.options[1].next;

  questions.forEach((q) => {
    q.options.forEach((o) => {
      Object.keys(o.tagWeights ?? {}).forEach((t) => {
        if (!VOCAB.has(t)) errors.push(`tag "${t}" (in ${q.id}) not in vocabulary`);
      });
    });
  });
  archetypes.forEach((a) => {
    a.keyTags.forEach((t) => {
      if (!VOCAB.has(t)) errors.push(`keyTag "${t}" (in ${a.id}) not in vocabulary`);
    });
  });

  questions.forEach((q) => {
    q.options.forEach((o) => {
      if (o.next != null && !byId.has(o.next)) {
        errors.push(`${q.id}.${o.id}.next -> missing "${o.next}"`);
      }
    });
  });

  const archIds = new Set(archetypes.map((a) => a.id));
  const reachedArch = new Set();
  const visited = new Set();
  const paths = [];
  const walk = (id, axes, prompts, branchCount, depth) => {
    const q = byId.get(id);
    if (!q) return;
    visited.add(id);
    if (axes.has(q.axis)) errors.push(`axis "${q.axis}" repeats on a path ending near ${id}`);
    if (prompts.has(q.prompt)) errors.push(`prompt repeats on a path ending near ${id}`);
    const nAxes = new Set(axes).add(q.axis);
    const nPrompts = new Set(prompts).add(q.prompt);
    const nBranch = branchCount + (branches(q) ? 1 : 0);
    if (isTerminal(q)) {
      if (!q.archetypeId) errors.push(`terminal ${id} has no archetypeId`);
      else if (!archIds.has(q.archetypeId)) errors.push(`terminal ${id} -> unknown archetype "${q.archetypeId}"`);
      else reachedArch.add(q.archetypeId);
      if (nBranch < 4) errors.push(`path to ${id} has only ${nBranch} branch points (<4)`);
      paths.push({ id, length: depth, branchCount: nBranch });
      return;
    }
    const nexts = [...new Set(q.options.map((o) => o.next))];
    nexts.forEach((nx) => walk(nx, nAxes, nPrompts, nBranch, depth + 1));
  };
  walk(Q1.id, new Set(), new Set(), 0, 1);

  questions.forEach((q) => {
    if (!visited.has(q.id)) errors.push(`orphan node "${q.id}" not reachable from Q1`);
  });

  archetypes.forEach((a) => {
    if (!reachedArch.has(a.id)) errors.push(`archetype "${a.id}" has no terminal node`);
  });

  // Cross-bank monotony guard: no exact-duplicate prompts anywhere.
  const seen = new Map();
  questions.forEach((q) => {
    if (seen.has(q.prompt)) errors.push(`duplicate prompt across ${seen.get(q.prompt)} and ${q.id}`);
    else seen.set(q.prompt, q.id);
  });

  const lengths = paths.map((p) => p.length);
  return {
    errors,
    stats: {
      generatedNodes: questions.length - 1,
      archetypes: archetypes.length,
      paths: paths.length,
      pathLenMin: Math.min(...lengths),
      pathLenMax: Math.max(...lengths),
      branchMin: Math.min(...paths.map((p) => p.branchCount)),
    },
  };
};

const { errors, stats } = validate([Q1, ...graph], ARCHETYPES);
if (errors.length) {
  console.error(`❌ persona-quiz graph invalid (${errors.length} issue(s)):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

writeFileSync(join(HERE, 'personaQuizQuestionGraph.json'), `${JSON.stringify(graph, null, 2)}\n`);
writeFileSync(join(HERE, 'personaQuizArchetypes.json'), `${JSON.stringify(ARCHETYPES, null, 2)}\n`);

console.log('✅ persona-quiz graph valid and written.');
console.log(stats);
