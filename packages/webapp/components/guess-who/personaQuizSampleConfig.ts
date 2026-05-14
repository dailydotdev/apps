import type { FunnelStepPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';

export const personaQuizSampleParameters: FunnelStepPersonaQuiz['parameters'] =
  {
    headline: 'Let me figure out who you are',
    explainer:
      'Answer a few quick questions and I’ll guess your developer profile.',
    entryQuestionId: 'q_domain',
    questions: [
      // ============================================================
      // Q1 — opener (10 options, each `next` → q2_<bucket>)
      // ============================================================
      {
        id: 'q_domain',
        axis: 'domain',
        prompt: 'Be honest. Where do you actually live?',
        cols: 1,
        options: [
          {
            id: 'frontend',
            label: 'Pushing pixels, arguing about CSS',
            signal:
              'Frontend / UI craft — building user interfaces (web, design systems, styling, client-side state)',
            emoji: '🎨',
            tagWeights: { frontend: 1, react: 1, css: 1 },
            next: 'q2_frontend',
          },
          {
            id: 'backend',
            label: 'Wrangling APIs and grumpy databases',
            signal:
              'Backend engineering — APIs, business logic, databases, server-side systems',
            emoji: '⚙️',
            tagWeights: { backend: 1, api: 1, databases: 1 },
            next: 'q2_backend',
          },
          {
            id: 'fullstack',
            label: 'Both sides of the API contract',
            signal:
              'Full-stack / end-to-end web — shipping both frontend and backend on the same product',
            emoji: '🧩',
            tagWeights: { fullstack: 1, 'web-development': 1 },
            next: 'q2_fullstack',
          },
          {
            id: 'mobile',
            label: 'Two app stores, one bug tracker',
            signal:
              'Mobile or native app development — iOS, Android, React Native, Flutter, native desktop',
            emoji: '📱',
            tagWeights: { mobile: 1, ios: 1, android: 1 },
            next: 'q2_mobile',
          },
          {
            id: 'data-ml',
            label: 'Anything that touches a dataframe',
            signal:
              'Data, ML, or AI engineering — BROAD lane covering data analytics / BI / dashboards, data engineering / ETL / pipelines, applied ML, MLOps, AI app building (RAG / agents), AND model research / training. Do not assume the user is specifically a model researcher — they could equally be an analyst, data engineer, ML engineer, or AI app builder.',
            emoji: '🧪',
            tagWeights: {
              'machine-learning': 1,
              'data-science': 1,
              ai: 1,
            },
            next: 'q2_data_ml',
          },
          {
            id: 'devops',
            label: 'Fluent in YAML, fighting clouds',
            signal:
              'Cloud, infra, DevOps, platform, or SRE — broad lane: containers, IaC, CI/CD, observability, on-call, cloud architecture',
            emoji: '🛠️',
            tagWeights: { devops: 1, cloud: 1, infrastructure: 1 },
            next: 'q2_devops',
          },
          {
            id: 'security',
            label: 'Paranoid is the job description',
            signal:
              'Security — offensive (red team / pentest), defensive (blue team / SOC), or AppSec / DevSecOps',
            emoji: '🛡️',
            tagWeights: { cybersecurity: 1, devsecops: 1 },
            next: 'q2_security',
          },
          {
            id: 'devtools',
            label: 'Making other devs less miserable',
            signal:
              'Developer tools, developer experience, or internal platform — building infra, libraries, CLIs, frameworks, or IDPs that other engineers use',
            emoji: '🧰',
            tagWeights: { 'developer-tools': 1, productivity: 1 },
            next: 'q2_devtools',
          },
          {
            id: 'founder-non-eng',
            label: 'Building the company more than the codebase',
            signal:
              'Tech founder, CTO, product manager, designer, or other non-engineering tech-adjacent role — interested in technology and engineering culture but not primarily writing production code day-to-day',
            emoji: '💼',
            tagWeights: {
              startups: 1,
              'product-management': 1,
              business: 1,
            },
            next: 'q2_founder_non_eng',
          },
          {
            id: 'specialty',
            label: 'Closer to the metal than the cloud',
            signal:
              'Specialty / systems development — game dev, embedded / firmware, robotics, graphics, AR/VR, OS / compiler / database internals, hardware-adjacent work',
            emoji: '🎮',
            tagWeights: { 'game-development': 1, embedded: 1 },
            next: 'q2_specialty',
          },
        ],
      },

      // ============================================================
      // FRONTEND BRANCH (q2 → q3 × 2 → q4 × 4)
      // ============================================================
      {
        id: 'q2_frontend',
        axis: 'fe_design_vs_engineering',
        cols: 3,
        prompt: 'You shipped a pure-styling PR this week.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Frontend dev whose primary energy is visual craft — pixel-perfect implementation, brand fidelity, design polish, animation.',
            tagWeights: { css: 1, tailwindcss: 1, 'design-systems': 1 },
            next: 'q3_fe_design',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Frontend dev who values visual craft but is equally engaged by component architecture.',
            tagWeights: { css: 1, frontend: 1 },
            next: 'q3_fe_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Frontend dev whose primary energy is application engineering — routing, state, perf, build tooling.',
            tagWeights: { frontend: 1, 'frontend-architecture': 1 },
            next: 'q3_fe_engineering',
          },
        ],
      },
      {
        id: 'q3_fe_design',
        axis: 'fe_design_specialty',
        cols: 3,
        prompt: 'Other teams import components from a library you maintain.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Design-system maintainer — builds shared components used across teams or products.',
            tagWeights: { 'design-systems': 1, components: 1, frontend: 1 },
            next: 'q4_fe_ds_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Builds some shared components but mostly works on product UIs.',
            tagWeights: { 'design-systems': 1, frontend: 1 },
            next: 'q4_fe_ds_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Pure feature / product-UI implementer — designs land in code as one-off product screens.',
            tagWeights: { css: 1, frontend: 1 },
            next: 'q4_fe_ds_no',
          },
        ],
      },
      {
        id: 'q3_fe_engineering',
        axis: 'fe_engineering_specialty',
        cols: 3,
        prompt:
          'Your last technical write-up was about state management or routing.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'App architect — focused on state management, routing, component composition, frontend application architecture.',
            tagWeights: {
              'frontend-architecture': 1,
              'state-management': 1,
              frontend: 1,
            },
            next: 'q4_fe_arch_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Mixed — between app architecture and build / perf / DX concerns.',
            tagWeights: { 'frontend-architecture': 1, frontend: 1 },
            next: 'q4_fe_arch_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Frontend platform / build / performance engineer — works on build tools, monorepos, bundlers, perf, DX.',
            tagWeights: {
              'build-tools': 1,
              'web-performance': 1,
              'developer-tools': 1,
            },
            next: 'q4_fe_arch_no',
          },
        ],
      },
      {
        id: 'q4_fe_ds_yes',
        axis: 'fe_ds_tokens_vs_components',
        cols: 3,
        prompt:
          'Design tokens, theming, and dark-mode parity show up in your weekly tasks.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Design-token / theming specialist — works on tokens, themes, light/dark mode.',
            tagWeights: { 'design-systems': 1, css: 1, theming: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Splits between tokens / themes and component code.',
            tagWeights: { 'design-systems': 1, css: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Pure component-library maintainer — focuses on component API, not theming / tokens.',
            tagWeights: { 'design-systems': 1, components: 1, react: 1 },
          },
        ],
      },
      {
        id: 'q4_fe_ds_no',
        axis: 'fe_motion_vs_static',
        cols: 3,
        prompt:
          'Animation timing and transitions are something you actually tune.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Motion / interaction designer-dev — animation, transitions.',
            tagWeights: { animation: 1, 'motion-design': 1, css: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Does some animation but mostly static UIs.',
            tagWeights: { animation: 1, css: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Static / brand-polish implementer — focuses on visual polish without heavy animation.',
            tagWeights: { css: 1, 'design-systems': 1 },
          },
        ],
      },
      {
        id: 'q4_fe_arch_yes',
        axis: 'fe_ssr_vs_csr',
        cols: 3,
        prompt:
          'Server-side rendering and streaming are part of your daily mental model.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Modern-meta-framework architect — Next.js / Remix / streaming SSR / RSC.',
            tagWeights: { nextjs: 1, react: 1, 'frontend-architecture': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Some SSR exposure but mostly classic SPA work.',
            tagWeights: { nextjs: 1, react: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Classic SPA / state-management architect — client-side state, single-page apps.',
            tagWeights: { react: 1, 'state-management': 1 },
          },
        ],
      },
      {
        id: 'q4_fe_arch_no',
        axis: 'fe_perf_vs_build',
        cols: 3,
        prompt:
          'Your last performance improvement was about bundle size or load time.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Web-perf / Core Web Vitals engineer — runtime perf, load time, bundle size.',
            tagWeights: { 'web-performance': 1, 'core-web-vitals': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Cares about perf but also build tooling.',
            tagWeights: { 'web-performance': 1, frontend: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Build-tooling / DX engineer — bundlers, monorepos, codegen, build infra.',
            tagWeights: { 'build-tools': 1, 'developer-tools': 1 },
          },
        ],
      },

      // ============================================================
      // BACKEND BRANCH
      // ============================================================
      {
        id: 'q2_backend',
        axis: 'be_api_vs_data',
        cols: 3,
        prompt: 'You debated endpoint naming or HTTP status codes this week.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Backend dev focused on API design, request/response shapes, business logic, services architecture.',
            tagWeights: { api: 1, backend: 1, 'system-design': 1 },
            next: 'q3_be_api',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal:
              'Backend dev who splits time between API work and data-layer work — small-team backend generalist.',
            tagWeights: { backend: 1, api: 1, databases: 1 },
            next: 'q3_be_mixed',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Backend dev whose primary energy is data-layer / scale concerns — schema design, query performance, pipelines, distributed systems.',
            tagWeights: {
              databases: 1,
              'distributed-systems': 1,
              'data-engineering': 1,
            },
            next: 'q3_be_data',
          },
        ],
      },
      {
        id: 'q3_be_api',
        axis: 'be_distributed_vs_monolith',
        cols: 3,
        prompt:
          'Your week had at least one discussion about service boundaries or distributed traces.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Service / distributed-systems-leaning backend — service boundaries, async messaging, distributed traces, microservices.',
            tagWeights: {
              'distributed-systems': 1,
              microservices: 1,
              'system-design': 1,
            },
            next: 'q4_be_api_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Working in a mix of distributed-services and monolith code.',
            tagWeights: { microservices: 1, backend: 1 },
            next: 'q4_be_api_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Monolith / domain-model-leaning backend — single deployable, rich domain logic, fewer service boundaries.',
            tagWeights: { backend: 1, 'software-architecture': 1 },
            next: 'q4_be_api_no',
          },
        ],
      },
      {
        id: 'q3_be_data',
        axis: 'be_oltp_vs_pipelines',
        cols: 3,
        prompt: 'Your last week was tuning live queries, not batch pipelines.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'OLTP / live-database engineer — query tuning, transactional schema, indexing, real-time data.',
            tagWeights: { databases: 1, sql: 1, postgresql: 1 },
            next: 'q4_be_data_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal:
              'Mixes OLTP work with some pipeline / batch responsibilities.',
            tagWeights: { databases: 1, sql: 1 },
            next: 'q4_be_data_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Data engineer focused on pipelines, batch jobs, streaming, or data warehousing.',
            tagWeights: {
              'data-engineering': 1,
              etl: 1,
              'data-pipelines': 1,
            },
            next: 'q4_be_data_no',
          },
        ],
      },
      {
        id: 'q4_be_api_yes',
        axis: 'be_async_vs_sync',
        cols: 3,
        prompt:
          'Your services talk over message queues or event streams as much as HTTP.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Async / event-driven architect — message queues, event sourcing, pub/sub, streaming.',
            tagWeights: {
              'event-driven-architecture': 1,
              'message-queues': 1,
              'distributed-systems': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Mix of synchronous APIs and event-driven flows.',
            tagWeights: { 'event-driven-architecture': 1, microservices: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal: 'Synchronous-RPC service builder — REST / gRPC / GraphQL.',
            tagWeights: { microservices: 1, api: 1 },
          },
        ],
      },
      {
        id: 'q4_be_api_no',
        axis: 'be_domain_vs_thin',
        cols: 3,
        prompt: 'Domain models with rich business rules sit in your codebase.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'DDD / domain-driven engineer — rich domain models, aggregates, bounded contexts.',
            tagWeights: {
              'domain-driven-design': 1,
              'software-architecture': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Some domain modeling but the codebase is mostly procedural / data-oriented.',
            tagWeights: { 'software-architecture': 1, backend: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Thin-API / orchestrator engineer — the backend wraps third-party calls or simple CRUD.',
            tagWeights: { api: 1, backend: 1 },
          },
        ],
      },
      {
        id: 'q4_be_data_yes',
        axis: 'be_query_vs_schema',
        cols: 3,
        prompt:
          'Your week had at least one EXPLAIN ANALYZE or query plan review.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'OLTP / query-tuning specialist — execution plans, indexes, slow-query analysis.',
            tagWeights: {
              postgresql: 1,
              'query-optimization': 1,
              databases: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Touches query tuning but most days are schema / data modeling.',
            tagWeights: { databases: 1, sql: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Schema / data-modeling specialist — schema design, migrations, ER modeling.',
            tagWeights: { databases: 1, 'data-modeling': 1 },
          },
        ],
      },
      {
        id: 'q4_be_data_no',
        axis: 'be_batch_vs_streaming',
        cols: 3,
        prompt: 'Your data pipelines kick off on a cron schedule.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Batch / Airflow-style data engineer — scheduled DAGs, nightly ETL, warehouse loads.',
            tagWeights: { 'data-engineering': 1, etl: 1, airflow: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Mostly batch but starting to add streaming jobs.',
            tagWeights: { 'data-engineering': 1, airflow: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Streaming / CDC data engineer — Kafka / Flink / real-time event-driven pipelines.',
            tagWeights: { kafka: 1, streaming: 1, 'data-engineering': 1 },
          },
        ],
      },

      // ============================================================
      // FULL-STACK BRANCH
      // ============================================================
      {
        id: 'q2_fullstack',
        axis: 'fs_product_vs_specialist',
        cols: 3,
        prompt: 'Idea on Monday, in prod by Friday — by you alone.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Product-building full-stack dev — works alone or in a small team, ships features across the whole stack. Likely startup / indie / small-team context.',
            tagWeights: {
              'web-development': 1,
              fullstack: 1,
              startups: 1,
            },
            next: 'q3_fs_product',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Full-stack dev who ships features end-to-end in a larger-team context with specialists nearby.',
            tagWeights: { fullstack: 1, 'web-development': 1 },
            next: 'q3_fs_mixed',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Full-stack dev who is meaningfully stronger on one side — frontend-leaning or backend-leaning.',
            tagWeights: { fullstack: 1, 'web-development': 1 },
            next: 'q3_fs_specialist',
          },
        ],
      },
      {
        id: 'q3_fs_product',
        axis: 'fs_founder_vs_team',
        cols: 3,
        prompt: 'You decide what to build, not just how to build it.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Indie hacker / technical founder — controls product direction as well as engineering.',
            tagWeights: {
              startups: 1,
              'indie-hacking': 1,
              entrepreneurship: 1,
            },
            next: 'q4_fs_product_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Has input on what to build but works alongside a PM / designer.',
            tagWeights: { startups: 1, 'web-development': 1 },
            next: 'q4_fs_product_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Small-team full-stack who takes specs from PM / design and executes end-to-end.',
            tagWeights: { 'web-development': 1, fullstack: 1 },
            next: 'q4_fs_product_no',
          },
        ],
      },
      {
        id: 'q3_fs_specialist',
        axis: 'fs_fe_vs_be_leaning',
        cols: 3,
        prompt: 'You’d rather pick up a frontend ticket than a backend one.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Frontend-leaning full-stack — frontend is home, backend is necessity.',
            tagWeights: { frontend: 1, react: 1 },
            next: 'q4_fs_spec_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Slight frontend lean but comfortable on both sides.',
            tagWeights: { frontend: 1, fullstack: 1 },
            next: 'q4_fs_spec_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Backend-leaning full-stack — backend is home, frontend is necessity.',
            tagWeights: { backend: 1, api: 1 },
            next: 'q4_fs_spec_no',
          },
        ],
      },
      {
        id: 'q4_fs_product_yes',
        axis: 'fs_paid_vs_sideproject',
        cols: 3,
        prompt: 'Someone other than you has paid for something you built.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Solopreneur with paying customers — bootstrap / indie SaaS / niche product.',
            tagWeights: { startups: 1, entrepreneurship: 1, saas: 1 },
          },
          {
            id: 'sort_of',
            label: 'A little',
            signal: 'Some revenue but mostly pre-revenue side projects.',
            tagWeights: { startups: 1, entrepreneurship: 1 },
          },
          {
            id: 'no',
            label: 'Not yet',
            signal:
              'Pre-revenue / side-project builder — shipping, not earning yet.',
            tagWeights: { 'indie-hacking': 1, 'side-projects': 1 },
          },
        ],
      },
      {
        id: 'q4_fs_product_no',
        axis: 'fs_external_vs_internal',
        cols: 3,
        prompt:
          'Your product has external paying customers — not just internal users.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'External-customer SaaS team — product sold to other companies / consumers.',
            tagWeights: { saas: 1, startups: 1 },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of external and internal stakeholders.',
            tagWeights: { saas: 1, 'web-development': 1 },
          },
          {
            id: 'no',
            label: 'Internal users',
            signal:
              'Internal-tools / B2E team — building for other employees, not external customers.',
            tagWeights: { 'internal-tools': 1, productivity: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_spec_yes',
        axis: 'fs_app_vs_marketing',
        cols: 3,
        prompt: 'Auth, accounts, and real-time state are in your weekly code.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Application-SaaS frontend specialist — auth flows, account mgmt, real-time UIs.',
            tagWeights: { 'web-development': 1, react: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Mix of application code and marketing-site work.',
            tagWeights: { 'web-development': 1, frontend: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Marketing-site / static-site frontend — landing pages, CMS, content sites.',
            tagWeights: { frontend: 1, css: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_spec_no',
        axis: 'fs_logic_vs_scale',
        cols: 3,
        prompt:
          'Your backend handles complex business rules — not high-traffic load.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Business-domain backend engineer — complex rules, validations, workflows.',
            tagWeights: { backend: 1, 'software-architecture': 1 },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of business logic and scale concerns.',
            tagWeights: { backend: 1, api: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'High-traffic / scale backend engineer — caching, sharding, throughput.',
            tagWeights: { backend: 1, performance: 1, scalability: 1 },
          },
        ],
      },

      // ============================================================
      // MOBILE BRANCH
      // ============================================================
      {
        id: 'q2_mobile',
        axis: 'mob_native_vs_xplat',
        cols: 3,
        prompt: 'Xcode or Android Studio is your daily IDE.',
        options: [
          {
            id: 'yes',
            label: 'Native all the way',
            signal:
              'Native mobile dev — Swift, SwiftUI, Kotlin, Jetpack Compose. Platform-specific deep knowledge.',
            tagWeights: { ios: 1, android: 1, swift: 1, kotlin: 1 },
            next: 'q3_mobile_native',
          },
          {
            id: 'sort_of',
            label: 'Some of both',
            signal:
              'Mobile dev who works in both native and cross-platform stacks.',
            tagWeights: { ios: 1, android: 1, mobile: 1 },
            next: 'q3_mobile_mixed',
          },
          {
            id: 'no',
            label: 'Cross-platform world',
            signal:
              'Mobile dev who primarily uses cross-platform frameworks — React Native, Flutter, Expo.',
            tagWeights: { 'react-native': 1, flutter: 1, mobile: 1 },
            next: 'q3_mobile_xplat',
          },
        ],
      },
      {
        id: 'q3_mobile_native',
        axis: 'mob_ios_vs_android',
        cols: 3,
        prompt: 'iOS is where you ship most of your code.',
        options: [
          {
            id: 'yes',
            label: 'Mostly iOS',
            signal: 'iOS-primary native dev.',
            tagWeights: { ios: 1, swift: 1 },
            next: 'q4_mobile_native_yes',
          },
          {
            id: 'sort_of',
            label: 'Both equally',
            signal: 'Splits time between iOS and Android equally.',
            tagWeights: { ios: 1, mobile: 1 },
            next: 'q4_mobile_native_mixed',
          },
          {
            id: 'no',
            label: 'Mostly Android',
            signal: 'Android-primary native dev.',
            tagWeights: { android: 1, kotlin: 1 },
            next: 'q4_mobile_native_no',
          },
        ],
      },
      {
        id: 'q3_mobile_xplat',
        axis: 'mob_rn_vs_flutter',
        cols: 3,
        prompt: 'Your codebase is JavaScript or TypeScript, not Dart.',
        options: [
          {
            id: 'yes',
            label: 'JS/TS world',
            signal: 'React Native dev — JavaScript / TypeScript codebase.',
            tagWeights: { 'react-native': 1, javascript: 1 },
            next: 'q4_mobile_xplat_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Worked in both RN and Flutter.',
            tagWeights: { 'react-native': 1, mobile: 1 },
            next: 'q4_mobile_xplat_mixed',
          },
          {
            id: 'no',
            label: 'Dart world',
            signal: 'Flutter dev — Dart codebase.',
            tagWeights: { flutter: 1, dart: 1 },
            next: 'q4_mobile_xplat_no',
          },
        ],
      },
      {
        id: 'q4_mobile_native_yes',
        axis: 'mob_ios_swiftui_vs_uikit',
        cols: 3,
        prompt: 'Your most recent screen was built in SwiftUI.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'iOS dev on SwiftUI — modern declarative UI.',
            tagWeights: { swiftui: 1, ios: 1, swift: 1 },
          },
          {
            id: 'sort_of',
            label: 'Mix',
            signal: 'Mix of SwiftUI and UIKit in the same codebase.',
            tagWeights: { ios: 1, swift: 1 },
          },
          {
            id: 'no',
            label: 'UIKit life',
            signal: 'iOS dev on UIKit — imperative legacy UI.',
            tagWeights: { uikit: 1, ios: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_native_no',
        axis: 'mob_android_compose_vs_views',
        cols: 3,
        prompt: 'Your most recent screen was built in Jetpack Compose.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Android dev on Jetpack Compose — modern declarative UI.',
            tagWeights: { 'jetpack-compose': 1, android: 1, kotlin: 1 },
          },
          {
            id: 'sort_of',
            label: 'Mix',
            signal: 'Mix of Compose and XML Views.',
            tagWeights: { android: 1, kotlin: 1 },
          },
          {
            id: 'no',
            label: 'XML life',
            signal: 'Android dev on XML / Views — legacy / imperative UI.',
            tagWeights: { android: 1, kotlin: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_xplat_yes',
        axis: 'mob_expo_vs_bare',
        cols: 3,
        prompt:
          'Your build setup is fully managed by a CLI — no Xcode config files in sight.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Managed-workflow React Native dev (Expo-style).',
            tagWeights: { expo: 1, 'react-native': 1 },
          },
          {
            id: 'sort_of',
            label: 'Mix',
            signal: 'Started managed, eject occasionally for native modules.',
            tagWeights: { expo: 1, 'react-native': 1 },
          },
          {
            id: 'no',
            label: 'Bare RN',
            signal:
              'Bare-RN / native-module dev — custom native code is part of the workflow.',
            tagWeights: { 'react-native': 1, mobile: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_xplat_no',
        axis: 'mob_flutter_targets',
        cols: 3,
        prompt: 'Your Flutter targets are mobile only.',
        options: [
          {
            id: 'yes',
            label: 'Mobile only',
            signal: 'Mobile-first Flutter dev — iOS + Android targets.',
            tagWeights: { flutter: 1, mobile: 1 },
          },
          {
            id: 'sort_of',
            label: 'Mostly',
            signal: 'Mainly mobile but ships web or desktop occasionally.',
            tagWeights: { flutter: 1, dart: 1 },
          },
          {
            id: 'no',
            label: 'Multi-platform',
            signal:
              'Multi-platform Flutter dev — web / desktop / embedded targets too.',
            tagWeights: { flutter: 1, 'web-development': 1 },
          },
        ],
      },

      // ============================================================
      // DATA / ML / AI BRANCH
      // ============================================================
      {
        id: 'q2_data_ml',
        axis: 'dml_models_vs_data',
        cols: 3,
        prompt: 'You ran a `model.fit()` or LLM eval this week.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Model-side practitioner — ML engineer, ML researcher, or AI app developer.',
            tagWeights: {
              'machine-learning': 1,
              'deep-learning': 1,
              ai: 1,
            },
            next: 'q3_dml_models',
          },
          {
            id: 'sort_of',
            label: 'Mixed',
            signal:
              'Builds with models AND wrangles data — applied ML / MLOps / RAG engineer.',
            tagWeights: {
              'machine-learning': 1,
              'data-engineering': 1,
              ai: 1,
            },
            next: 'q3_dml_mixed',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Data-side practitioner — data engineer, analytics engineer, data analyst, BI developer.',
            tagWeights: { 'data-engineering': 1, 'data-science': 1, sql: 1 },
            next: 'q3_dml_data',
          },
        ],
      },
      {
        id: 'q3_dml_models',
        axis: 'dml_training_vs_app',
        cols: 3,
        prompt:
          'Your week involved fine-tuning or training a model from scratch.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'ML researcher / training engineer — training models from scratch or fine-tuning.',
            tagWeights: {
              'machine-learning': 1,
              'deep-learning': 1,
              pytorch: 1,
            },
            next: 'q4_dml_models_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Does training occasionally but mostly builds on top of trained models.',
            tagWeights: { 'machine-learning': 1, 'deep-learning': 1 },
            next: 'q4_dml_models_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'AI app builder — uses existing models / APIs, builds RAG, agents, LLM-powered features.',
            tagWeights: { ai: 1, llm: 1, rag: 1 },
            next: 'q4_dml_models_no',
          },
        ],
      },
      {
        id: 'q3_dml_data',
        axis: 'dml_analyst_vs_eng',
        cols: 3,
        prompt:
          'Your output is dashboards and reports, not pipelines and warehouses.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Analyst / BI engineer — dashboards, reports, ad-hoc analysis, insights.',
            tagWeights: {
              'data-science': 1,
              analytics: 1,
              'business-intelligence': 1,
            },
            next: 'q4_dml_data_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of analysis and pipeline work.',
            tagWeights: { 'data-science': 1, analytics: 1 },
            next: 'q4_dml_data_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Data engineer — pipelines, warehouses, ETL/ELT, streaming infrastructure.',
            tagWeights: { 'data-engineering': 1, etl: 1 },
            next: 'q4_dml_data_no',
          },
        ],
      },
      {
        id: 'q4_dml_models_yes',
        axis: 'dml_nlp_vs_cv',
        cols: 3,
        prompt: 'Your models work with text and language.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'NLP / LLM researcher — text, language, transformers.',
            tagWeights: {
              llm: 1,
              nlp: 1,
              'natural-language-processing': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Works on both text and other modalities.',
            tagWeights: { llm: 1, 'machine-learning': 1 },
          },
          {
            id: 'no',
            label: 'Other',
            signal:
              'CV / tabular ML researcher — images, structured data, classical ML.',
            tagWeights: { 'computer-vision': 1, 'machine-learning': 1 },
          },
        ],
      },
      {
        id: 'q4_dml_models_no',
        axis: 'dml_rag_vs_agents',
        cols: 3,
        prompt: 'Retrieval and re-ranking sit at the center of your day.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'RAG / search engineer — retrieval, ranking, embeddings, vector search.',
            tagWeights: { rag: 1, 'vector-search': 1, embeddings: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Some RAG work but also agent loops or other LLM-app patterns.',
            tagWeights: { rag: 1, llm: 1 },
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Agent / autonomy engineer — multi-step agents, tool use, planning.',
            tagWeights: { agents: 1, llm: 1, 'agentic-ai': 1 },
          },
        ],
      },
      {
        id: 'q4_dml_data_yes',
        axis: 'dml_experimentation_vs_dashboards',
        cols: 3,
        prompt: 'Your work involves A/B tests or causal analysis.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Experimentation / product-analytics engineer.',
            tagWeights: { experimentation: 1, 'ab-testing': 1, analytics: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Mix of experimentation and dashboards.',
            tagWeights: { analytics: 1, 'data-science': 1 },
          },
          {
            id: 'no',
            label: 'Mostly dashboards',
            signal:
              'Pure dashboard / BI analyst — reports, ad-hoc queries, stakeholder asks.',
            tagWeights: { 'business-intelligence': 1, analytics: 1 },
          },
        ],
      },
      {
        id: 'q4_dml_data_no',
        axis: 'dml_streaming_vs_batch',
        cols: 3,
        prompt:
          'Your pipelines react to events in real time, not nightly cron jobs.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Streaming / CDC data engineer — Kafka / Flink / real-time pipelines.',
            tagWeights: { kafka: 1, streaming: 1, 'data-engineering': 1 },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of streaming and batch.',
            tagWeights: { 'data-engineering': 1, streaming: 1 },
          },
          {
            id: 'no',
            label: 'Mostly batch',
            signal:
              'Batch / warehouse data engineer — scheduled DAGs, nightly loads.',
            tagWeights: { 'data-engineering': 1, etl: 1, airflow: 1 },
          },
        ],
      },

      // ============================================================
      // DEVOPS BRANCH
      // ============================================================
      {
        id: 'q2_devops',
        axis: 'do_platform_vs_sre',
        cols: 3,
        prompt: 'Engineers slack you about broken CI, not prod outages.',
        options: [
          {
            id: 'yes',
            label: 'Platform side',
            signal:
              'Platform engineer / IDP builder — internal tools, CI/CD, golden paths.',
            tagWeights: {
              'platform-engineering': 1,
              devops: 1,
              'developer-tools': 1,
            },
            next: 'q3_do_platform',
          },
          {
            id: 'sort_of',
            label: 'Both hats',
            signal: 'DevOps generalist who builds platforms AND owns on-call.',
            tagWeights: {
              devops: 1,
              'platform-engineering': 1,
              sre: 1,
            },
            next: 'q3_do_mixed',
          },
          {
            id: 'no',
            label: 'Run-ops side',
            signal:
              'SRE / production-ops engineer — reliability, incident response, on-call.',
            tagWeights: { sre: 1, 'site-reliability': 1, observability: 1 },
            next: 'q3_do_sre',
          },
        ],
      },
      {
        id: 'q3_do_platform',
        axis: 'do_sdk_vs_iac',
        cols: 3,
        prompt: 'Your last release was an internal library or CLI tool.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Internal SDK / CLI / DX engineer — libraries, CLIs, code generators for internal use.',
            tagWeights: {
              'developer-tools': 1,
              productivity: 1,
              'platform-engineering': 1,
            },
            next: 'q4_do_platform_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of SDK / library work and infra work.',
            tagWeights: { 'developer-tools': 1, 'platform-engineering': 1 },
            next: 'q4_do_platform_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'IaC / cluster-ops / cloud platform engineer — Terraform, Helm, K8s manifests.',
            tagWeights: { kubernetes: 1, terraform: 1, infrastructure: 1 },
            next: 'q4_do_platform_no',
          },
        ],
      },
      {
        id: 'q3_do_sre',
        axis: 'do_incident_vs_reliability',
        cols: 3,
        prompt:
          'Your last week had at least one incident bridge or postmortem.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Incident responder — active on-call rotation, war-rooms, postmortems.',
            tagWeights: {
              sre: 1,
              'site-reliability': 1,
              'incident-response': 1,
            },
            next: 'q4_do_sre_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'On-call but not as the primary firefighter.',
            tagWeights: { sre: 1, observability: 1 },
            next: 'q4_do_sre_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Reliability / capacity / observability engineer — proactive work, less firefighting.',
            tagWeights: {
              observability: 1,
              'site-reliability': 1,
              performance: 1,
            },
            next: 'q4_do_sre_no',
          },
        ],
      },
      {
        id: 'q4_do_platform_yes',
        axis: 'do_sdks_vs_localdev',
        cols: 3,
        prompt: 'Your work ships as SDKs or CLIs other engineers install.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Internal SDK / CLI maintainer.',
            tagWeights: {
              'developer-tools': 1,
              cli: 1,
              'platform-engineering': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'A mix',
            signal: 'Mix of SDKs and local-dev scripts.',
            tagWeights: { 'developer-tools': 1, 'platform-engineering': 1 },
          },
          {
            id: 'no',
            label: 'Local-dev focus',
            signal:
              'Local-dev tooling / IDE-plugin maintainer — scaffolds, scripts, devbox.',
            tagWeights: { 'developer-tools': 1, productivity: 1 },
          },
        ],
      },
      {
        id: 'q4_do_platform_no',
        axis: 'do_k8s_vs_iac',
        cols: 3,
        prompt: 'Kubernetes manifests fill your daily files.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'K8s / container-orchestration engineer.',
            tagWeights: {
              kubernetes: 1,
              containers: 1,
              'cloud-native': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of K8s and IaC.',
            tagWeights: { kubernetes: 1, devops: 1 },
          },
          {
            id: 'no',
            label: 'IaC mostly',
            signal:
              'IaC / Terraform / cloud engineer — provisioning rather than orchestration.',
            tagWeights: { terraform: 1, 'infrastructure-as-code': 1 },
          },
        ],
      },
      {
        id: 'q4_do_sre_yes',
        axis: 'do_customer_vs_internal',
        cols: 3,
        prompt: 'Your pages are about customer-facing services.',
        options: [
          {
            id: 'yes',
            label: 'Customer-facing',
            signal: 'Customer-facing on-call SRE — user-impacting outages.',
            tagWeights: {
              sre: 1,
              'site-reliability': 1,
              'incident-response': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Mix',
            signal: 'On-call for both customer-facing and internal services.',
            tagWeights: { sre: 1, observability: 1 },
          },
          {
            id: 'no',
            label: 'Internal-only',
            signal:
              'Internal-platform SRE — infrastructure incidents, internal services.',
            tagWeights: { sre: 1, infrastructure: 1 },
          },
        ],
      },
      {
        id: 'q4_do_sre_no',
        axis: 'do_chaos_vs_capacity',
        cols: 3,
        prompt: 'Chaos and load testing show up in your week.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Chaos / resilience engineer — fault injection, load tests, game days.',
            tagWeights: { 'chaos-engineering': 1, resilience: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Some chaos work, also capacity / observability.',
            tagWeights: { sre: 1, resilience: 1 },
          },
          {
            id: 'no',
            label: 'Capacity focus',
            signal: 'Capacity / cost optimization engineer.',
            tagWeights: { sre: 1, performance: 1 },
          },
        ],
      },

      // ============================================================
      // SECURITY BRANCH
      // ============================================================
      {
        id: 'q2_security',
        axis: 'sec_offensive_vs_defensive',
        cols: 3,
        prompt:
          'Your reports describe how to break things, not how to fix them.',
        options: [
          {
            id: 'yes',
            label: 'Red side',
            signal:
              'Offensive security — pentester, red team, vulnerability researcher.',
            tagWeights: {
              'penetration-testing': 1,
              hacking: 1,
              cybersecurity: 1,
            },
            next: 'q3_sec_offensive',
          },
          {
            id: 'sort_of',
            label: 'Purple-ish',
            signal: 'Security dev who does both offensive and defensive work.',
            tagWeights: {
              cybersecurity: 1,
              'penetration-testing': 1,
              devsecops: 1,
            },
            next: 'q3_sec_mixed',
          },
          {
            id: 'no',
            label: 'Blue side',
            signal:
              'Defensive security — SOC, incident response, AppSec, DevSecOps.',
            tagWeights: {
              cybersecurity: 1,
              devsecops: 1,
              'application-security': 1,
            },
            next: 'q3_sec_defensive',
          },
        ],
      },
      {
        id: 'q3_sec_offensive',
        axis: 'sec_web_vs_binary',
        cols: 3,
        prompt: 'Your work targets web apps and APIs, not binaries or kernels.',
        options: [
          {
            id: 'yes',
            label: 'Web / app',
            signal:
              'Web / app pentester — OWASP, REST/GraphQL attacks, auth bypasses.',
            tagWeights: {
              'web-security': 1,
              'application-security': 1,
              'penetration-testing': 1,
            },
            next: 'q4_sec_off_yes',
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Works on web AND binary / native targets.',
            tagWeights: { cybersecurity: 1, 'penetration-testing': 1 },
            next: 'q4_sec_off_mixed',
          },
          {
            id: 'no',
            label: 'Low-level',
            signal:
              'Binary / exploit / kernel researcher — reverse engineering, exploit dev.',
            tagWeights: { cybersecurity: 1, 'reverse-engineering': 1 },
            next: 'q4_sec_off_no',
          },
        ],
      },
      {
        id: 'q3_sec_defensive',
        axis: 'sec_appsec_vs_soc',
        cols: 3,
        prompt: 'Your daily defensive work happens at the code-review stage.',
        options: [
          {
            id: 'yes',
            label: 'AppSec',
            signal:
              'AppSec / secure-coding engineer — code review, threat modeling.',
            tagWeights: {
              'application-security': 1,
              devsecops: 1,
              'code-review': 1,
            },
            next: 'q4_sec_def_yes',
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of AppSec and detection / response.',
            tagWeights: { cybersecurity: 1, 'application-security': 1 },
            next: 'q4_sec_def_mixed',
          },
          {
            id: 'no',
            label: 'Detection',
            signal:
              'SOC / detection / incident-response engineer — alerts, triage, IR.',
            tagWeights: { cybersecurity: 1, siem: 1 },
            next: 'q4_sec_def_no',
          },
        ],
      },
      {
        id: 'q4_sec_off_yes',
        axis: 'sec_consultant_vs_inhouse',
        cols: 3,
        prompt: 'Your engagements rotate across multiple companies.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Consultant pentester / agency red team.',
            tagWeights: { cybersecurity: 1, 'penetration-testing': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Mostly in-house with occasional engagements.',
            tagWeights: { cybersecurity: 1, 'penetration-testing': 1 },
          },
          {
            id: 'no',
            label: 'In-house',
            signal: 'In-house red team — single employer.',
            tagWeights: { cybersecurity: 1, 'application-security': 1 },
          },
        ],
      },
      {
        id: 'q4_sec_off_no',
        axis: 'sec_active_vs_ctf',
        cols: 3,
        prompt:
          "You've published or disclosed a vulnerability in the last year.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Active vulnerability researcher / 0day / bug bounty.',
            tagWeights: { cybersecurity: 1, 'vulnerability-research': 1 },
          },
          {
            id: 'sort_of',
            label: 'A little',
            signal: 'Some disclosures plus CTF / hobby work.',
            tagWeights: { cybersecurity: 1, hacking: 1 },
          },
          {
            id: 'no',
            label: 'Hobbyist',
            signal:
              'CTF player / hobbyist / learning — no public disclosures yet.',
            tagWeights: { ctf: 1, hacking: 1 },
          },
        ],
      },
      {
        id: 'q4_sec_def_yes',
        axis: 'sec_supplychain_vs_review',
        cols: 3,
        prompt:
          'Supply-chain and dependency security is part of your weekly work.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Supply-chain / SBOM security engineer.',
            tagWeights: { 'supply-chain-security': 1, devsecops: 1 },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of supply-chain and code-review work.',
            tagWeights: { cybersecurity: 1, devsecops: 1 },
          },
          {
            id: 'no',
            label: 'Code review',
            signal: 'Code-review / SAST AppSec engineer.',
            tagWeights: { 'application-security': 1, 'code-review': 1 },
          },
        ],
      },
      {
        id: 'q4_sec_def_no',
        axis: 'sec_siem_vs_edr',
        cols: 3,
        prompt: 'Your daily work is in SIEM log queries.',
        options: [
          {
            id: 'yes',
            label: 'SIEM',
            signal: 'SIEM / log-detection engineer.',
            tagWeights: { siem: 1, 'threat-detection': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of SIEM and endpoint telemetry.',
            tagWeights: { cybersecurity: 1, 'threat-detection': 1 },
          },
          {
            id: 'no',
            label: 'EDR',
            signal: 'EDR / endpoint-detection engineer.',
            tagWeights: { 'endpoint-security': 1, cybersecurity: 1 },
          },
        ],
      },

      // ============================================================
      // DEV TOOLS / DX BRANCH
      // ============================================================
      {
        id: 'q2_devtools',
        axis: 'dt_external_vs_internal',
        cols: 3,
        prompt:
          'Your last release shipped to a public package registry — npm, PyPI, crates, Maven.',
        options: [
          {
            id: 'yes',
            label: 'Public product',
            signal:
              'Dev-tools dev shipping externally — open-source maintainer, library author, dev-tools company employee.',
            tagWeights: {
              'developer-tools': 1,
              'open-source': 1,
              productivity: 1,
            },
            next: 'q3_dt_external',
          },
          {
            id: 'sort_of',
            label: 'Sometimes external',
            signal:
              'Internal platform dev who also publishes open-source side projects.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
            next: 'q3_dt_mixed',
          },
          {
            id: 'no',
            label: 'Internal only',
            signal:
              'Internal IDP / DX engineer — tooling exclusively for engineers inside the company.',
            tagWeights: { 'platform-engineering': 1, 'developer-tools': 1 },
            next: 'q3_dt_internal',
          },
        ],
      },
      {
        id: 'q3_dt_external',
        axis: 'dt_oss_vs_commercial',
        cols: 3,
        prompt:
          "You maintain an open-source project — your name's in the contributors graph.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Open-source maintainer.',
            tagWeights: { 'open-source': 1, 'developer-tools': 1 },
            next: 'q4_dt_ext_yes',
          },
          {
            id: 'sort_of',
            label: 'A little',
            signal: 'Some OSS plus commercial dev-tools work.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
            next: 'q4_dt_ext_mixed',
          },
          {
            id: 'no',
            label: 'Not really',
            signal:
              'Commercial dev-tools company employee — closed-source product work.',
            tagWeights: { 'developer-tools': 1, saas: 1 },
            next: 'q4_dt_ext_no',
          },
        ],
      },
      {
        id: 'q3_dt_internal',
        axis: 'dt_ci_vs_dx',
        cols: 3,
        prompt:
          'Your work is in build pipelines and runners, not in linters or code generators.',
        options: [
          {
            id: 'yes',
            label: 'CI / build',
            signal: 'CI / build / release infra engineer.',
            tagWeights: {
              'ci-cd': 1,
              'build-tools': 1,
              'developer-tools': 1,
            },
            next: 'q4_dt_int_yes',
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of build infra and DX tooling.',
            tagWeights: { 'developer-tools': 1, productivity: 1 },
            next: 'q4_dt_int_mixed',
          },
          {
            id: 'no',
            label: 'DX / linters',
            signal: 'DX / linters / scaffolds / code-gen engineer.',
            tagWeights: { 'developer-tools': 1, productivity: 1 },
            next: 'q4_dt_int_no',
          },
        ],
      },
      {
        id: 'q4_dt_ext_yes',
        axis: 'dt_library_vs_cli',
        cols: 3,
        prompt: "Your package shows up in users' import statements.",
        options: [
          {
            id: 'yes',
            label: 'Library',
            signal: 'Library / framework author — imported as code dependency.',
            tagWeights: { 'open-source': 1, frameworks: 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Maintains both libraries and CLIs.',
            tagWeights: { 'open-source': 1, 'developer-tools': 1 },
          },
          {
            id: 'no',
            label: 'CLI',
            signal: 'CLI / standalone-tool author — invoked from shell.',
            tagWeights: { cli: 1, 'developer-tools': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_ext_no',
        axis: 'dt_cloud_vs_ide',
        cols: 3,
        prompt: 'Your product runs on your servers as a service.',
        options: [
          {
            id: 'yes',
            label: 'Cloud-side',
            signal: 'Cloud-side dev-tools SaaS engineer.',
            tagWeights: { saas: 1, 'developer-tools': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of cloud-side service and client-side tooling.',
            tagWeights: { 'developer-tools': 1, saas: 1 },
          },
          {
            id: 'no',
            label: 'Editor side',
            signal: 'IDE / editor / desktop dev-tools engineer.',
            tagWeights: { editors: 1, ides: 1 },
          },
        ],
      },
      {
        id: 'q4_dt_int_yes',
        axis: 'dt_buildperf_vs_release',
        cols: 3,
        prompt: 'Build speed and incremental compilation matter to you.',
        options: [
          {
            id: 'yes',
            label: 'Build perf',
            signal:
              'Build-perf / caching specialist — incremental builds, distributed cache.',
            tagWeights: { 'build-tools': 1, performance: 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of build perf and release infra.',
            tagWeights: { 'build-tools': 1, 'developer-tools': 1 },
          },
          {
            id: 'no',
            label: 'Release',
            signal:
              'Release / artifact-management specialist — versioning, packaging, rollouts.',
            tagWeights: { 'ci-cd': 1, 'release-management': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_int_no',
        axis: 'dt_codegen_vs_lint',
        cols: 3,
        prompt: 'Code generators and project scaffolds are in your day.',
        options: [
          {
            id: 'yes',
            label: 'Codegen',
            signal: 'Codegen / scaffolds / template engineer.',
            tagWeights: { 'code-generation': 1, 'developer-tools': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of codegen and static analysis.',
            tagWeights: { 'developer-tools': 1, productivity: 1 },
          },
          {
            id: 'no',
            label: 'Linters',
            signal: 'Linter / static-analysis engineer.',
            tagWeights: { 'static-analysis': 1, linting: 1 },
          },
        ],
      },

      // ============================================================
      // FOUNDER / NON-ENG BRANCH
      // ============================================================
      {
        id: 'q2_founder_non_eng',
        axis: 'fn_technical_vs_nontechnical',
        cols: 3,
        prompt:
          "You wrote and merged your own PR this week, not just reviewed others'.",
        options: [
          {
            id: 'yes',
            label: 'Hands-on',
            signal:
              'Hands-on technical leader — CTO, technical founder, principal-with-management role. Still writes production code.',
            tagWeights: {
              startups: 1,
              leadership: 1,
              'engineering-management': 1,
            },
            next: 'q3_fn_technical',
          },
          {
            id: 'sort_of',
            label: 'Code-curious',
            signal:
              'Non-engineering tech-adjacent role (PM, designer, founder) who codes for prototypes / side projects.',
            tagWeights: {
              'product-management': 1,
              startups: 1,
              business: 1,
            },
            next: 'q3_fn_mixed',
          },
          {
            id: 'no',
            label: 'Not in IDE',
            signal:
              'Pure non-engineering role — product, design, marketing, business, ops.',
            tagWeights: {
              'product-management': 1,
              business: 1,
              leadership: 1,
            },
            next: 'q3_fn_nontechnical',
          },
        ],
      },
      {
        id: 'q3_fn_technical',
        axis: 'fn_founder_vs_ic',
        cols: 3,
        prompt: 'Your name is on the cap table.',
        options: [
          {
            id: 'yes',
            label: 'Founder',
            signal: 'Founder / CTO — equity holder, decision maker.',
            tagWeights: {
              startups: 1,
              leadership: 1,
              entrepreneurship: 1,
            },
            next: 'q4_fn_tech_yes',
          },
          {
            id: 'sort_of',
            label: 'Some equity',
            signal:
              'Early employee with meaningful equity, near-founder responsibilities.',
            tagWeights: { startups: 1, leadership: 1 },
            next: 'q4_fn_tech_mixed',
          },
          {
            id: 'no',
            label: 'Not founder',
            signal:
              'Principal IC / EM who still codes — strong influence but not equity-holder.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
            next: 'q4_fn_tech_no',
          },
        ],
      },
      {
        id: 'q3_fn_nontechnical',
        axis: 'fn_product_vs_business',
        cols: 3,
        prompt:
          'Your day involves designs, specs, or roadmaps — not revenue spreadsheets.',
        options: [
          {
            id: 'yes',
            label: 'Product/design',
            signal: 'PM / designer — product strategy, specs, design.',
            tagWeights: {
              'product-management': 1,
              design: 1,
              ux: 1,
            },
            next: 'q4_fn_nontech_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of product and business work.',
            tagWeights: { 'product-management': 1, business: 1 },
            next: 'q4_fn_nontech_mixed',
          },
          {
            id: 'no',
            label: 'Business/ops',
            signal: 'Business / ops / marketing — revenue, growth, operations.',
            tagWeights: { business: 1, marketing: 1 },
            next: 'q4_fn_nontech_no',
          },
        ],
      },
      {
        id: 'q4_fn_tech_yes',
        axis: 'fn_earlystage_vs_growing',
        cols: 3,
        prompt: 'Your team is 5 people or fewer.',
        options: [
          {
            id: 'yes',
            label: 'Tiny team',
            signal: 'Pre-seed / seed founder — small, scrappy team.',
            tagWeights: { startups: 1, 'early-stage': 1 },
          },
          {
            id: 'sort_of',
            label: '5-20',
            signal: 'Small but growing team.',
            tagWeights: { startups: 1, entrepreneurship: 1 },
          },
          {
            id: 'no',
            label: 'Larger',
            signal: 'Series A+ / growing CTO — managing a larger team.',
            tagWeights: { startups: 1, 'engineering-management': 1 },
          },
        ],
      },
      {
        id: 'q4_fn_tech_no',
        axis: 'fn_principal_vs_em',
        cols: 3,
        prompt: 'You spend more time in PR reviews than in 1:1 meetings.',
        options: [
          {
            id: 'yes',
            label: 'Principal-IC',
            signal:
              'Principal-IC type still in code — strong technical influence.',
            tagWeights: {
              'software-architecture': 1,
              'engineering-leadership': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Hybrid IC / manager.',
            tagWeights: {
              'engineering-leadership': 1,
              'engineering-management': 1,
            },
          },
          {
            id: 'no',
            label: 'EM',
            signal: 'EM / line-manager who codes occasionally.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
        ],
      },
      {
        id: 'q4_fn_nontech_yes',
        axis: 'fn_design_vs_pm',
        cols: 3,
        prompt: 'Design files outnumber spec docs in your daily work.',
        options: [
          {
            id: 'yes',
            label: 'Designer',
            signal: 'Designer — UI / UX / product design.',
            tagWeights: { design: 1, ux: 1, 'ui-design': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Designer-PM hybrid.',
            tagWeights: { design: 1, 'product-management': 1 },
          },
          {
            id: 'no',
            label: 'PM',
            signal: 'Product manager — specs, roadmaps, prioritization.',
            tagWeights: { 'product-management': 1, business: 1 },
          },
        ],
      },
      {
        id: 'q4_fn_nontech_no',
        axis: 'fn_marketing_vs_business',
        cols: 3,
        prompt: 'Your work is marketing or DevRel.',
        options: [
          {
            id: 'yes',
            label: 'Marketing/DevRel',
            signal: 'Marketing / DevRel — content, community, growth.',
            tagWeights: {
              marketing: 1,
              'developer-relations': 1,
              devrel: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of marketing and business / ops.',
            tagWeights: { marketing: 1, business: 1 },
          },
          {
            id: 'no',
            label: 'Business/ops',
            signal: 'Business / ops / finance.',
            tagWeights: { business: 1, operations: 1 },
          },
        ],
      },

      // ============================================================
      // SPECIALTY BRANCH
      // ============================================================
      {
        id: 'q2_specialty',
        axis: 'sp_hardware_vs_software',
        cols: 3,
        prompt:
          'Your code runs on something with a battery or a microcontroller.',
        options: [
          {
            id: 'yes',
            label: 'Hardware in the loop',
            signal:
              'Embedded / firmware / robotics / IoT developer — code on physical hardware.',
            tagWeights: { embedded: 1, iot: 1, robotics: 1 },
            next: 'q3_sp_hardware',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Specialty dev who crosses into hardware occasionally — graphics, drivers, OS kernels.',
            tagWeights: { 'systems-programming': 1, embedded: 1 },
            next: 'q3_sp_mixed',
          },
          {
            id: 'no',
            label: 'Software only',
            signal:
              'Software-specialty dev — game development, graphics, compilers, DB internals, OS / kernel hacking.',
            tagWeights: { 'game-development': 1, 'systems-programming': 1 },
            next: 'q3_sp_software',
          },
        ],
      },
      {
        id: 'q3_sp_hardware',
        axis: 'sp_robotics_vs_embedded',
        cols: 3,
        prompt:
          'Your code controls something that physically moves — actuators, motors, drones, vehicles.',
        options: [
          {
            id: 'yes',
            label: 'Robotics',
            signal: 'Robotics / drones / vehicles dev.',
            tagWeights: { robotics: 1, embedded: 1 },
            next: 'q4_sp_hw_yes',
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal:
              'Some robotics adjacent work but mostly static-device embedded.',
            tagWeights: { embedded: 1, iot: 1 },
            next: 'q4_sp_hw_mixed',
          },
          {
            id: 'no',
            label: 'Static devices',
            signal: 'Embedded / firmware on static devices — no moving parts.',
            tagWeights: { embedded: 1, firmware: 1 },
            next: 'q4_sp_hw_no',
          },
        ],
      },
      {
        id: 'q3_sp_software',
        axis: 'sp_game_vs_internals',
        cols: 3,
        prompt:
          'What you ship gets played, watched, or rendered — not invoked by other developers.',
        options: [
          {
            id: 'yes',
            label: 'Game / graphics',
            signal:
              'Game dev / graphics / creative — players or end-users consume it.',
            tagWeights: { 'game-development': 1, graphics: 1 },
            next: 'q4_sp_sw_yes',
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of game / graphics and systems-internals work.',
            tagWeights: { 'game-development': 1, 'systems-programming': 1 },
            next: 'q4_sp_sw_mixed',
          },
          {
            id: 'no',
            label: 'Systems internals',
            signal:
              'Systems internals — compilers, OS, DB engines, language runtimes.',
            tagWeights: { 'systems-programming': 1, compilers: 1 },
            next: 'q4_sp_sw_no',
          },
        ],
      },
      {
        id: 'q4_sp_hw_yes',
        axis: 'sp_consumer_vs_industrial',
        cols: 3,
        prompt: "Your devices end up in consumers' hands.",
        options: [
          {
            id: 'yes',
            label: 'Consumer',
            signal: 'Consumer IoT / wearables / smart-home dev.',
            tagWeights: {
              iot: 1,
              'consumer-electronics': 1,
              wearables: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'A bit of both',
            signal: 'Mix of consumer and industrial.',
            tagWeights: { iot: 1, embedded: 1 },
          },
          {
            id: 'no',
            label: 'Industrial',
            signal:
              'Industrial / commercial / robotics — factories, labs, professional use.',
            tagWeights: { robotics: 1, 'industrial-automation': 1 },
          },
        ],
      },
      {
        id: 'q4_sp_hw_no',
        axis: 'sp_realtime_vs_general',
        cols: 3,
        prompt:
          'Your firmware has hard real-time deadlines — measured in milliseconds.',
        options: [
          {
            id: 'yes',
            label: 'Real-time',
            signal:
              'Real-time / safety-critical embedded — RTOS, hard deadlines.',
            tagWeights: {
              'real-time-systems': 1,
              embedded: 1,
              rtos: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sometimes',
            signal: 'Some real-time work plus general-purpose firmware.',
            tagWeights: { embedded: 1, 'real-time-systems': 1 },
          },
          {
            id: 'no',
            label: 'General',
            signal: 'General-purpose embedded / IoT firmware — soft timing.',
            tagWeights: { embedded: 1, firmware: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_sw_yes',
        axis: 'sp_game_vs_graphics',
        cols: 3,
        prompt: 'What you ship is a playable game.',
        options: [
          {
            id: 'yes',
            label: 'Games',
            signal: 'Game developer — gameplay, engine consumer.',
            tagWeights: { 'game-development': 1, 'game-design': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of game dev and graphics / tools.',
            tagWeights: { 'game-development': 1, graphics: 1 },
          },
          {
            id: 'no',
            label: 'Graphics',
            signal:
              'Graphics / rendering / VFX specialist — engines, shaders, pipelines.',
            tagWeights: { graphics: 1, rendering: 1, shaders: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_sw_no',
        axis: 'sp_compilers_vs_db',
        cols: 3,
        prompt:
          "You write code that runs other people's code — compilers, runtimes, interpreters.",
        options: [
          {
            id: 'yes',
            label: 'Compilers',
            signal: 'Compiler / language-runtime engineer.',
            tagWeights: { compilers: 1, 'programming-languages': 1 },
          },
          {
            id: 'sort_of',
            label: 'Both',
            signal: 'Mix of compilers and systems internals.',
            tagWeights: { compilers: 1, 'systems-programming': 1 },
          },
          {
            id: 'no',
            label: 'DB / OS',
            signal: 'DB / OS / kernel internals engineer.',
            tagWeights: {
              databases: 1,
              'operating-systems': 1,
              'systems-programming': 1,
            },
          },
        ],
      },
      // ============================================================
      // Q3 sort_of branches — "mixed" follow-ups per bucket
      // ============================================================
      {
        id: 'q3_fe_mixed',
        axis: 'fe_design_engineering_hybrid',
        cols: 3,
        prompt:
          'You can argue typography choices and React rendering perf in the same review.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Designer-developer hybrid — equally engaged by visual craft and framework architecture.',
            tagWeights: {
              frontend: 1,
              css: 1,
              'design-systems': 1,
              'frontend-architecture': 1,
            },
            next: 'q4_fe_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Frontend dev with design sensitivity but skews toward one side day-to-day.',
            tagWeights: { frontend: 1, 'design-systems': 1 },
            next: 'q4_fe_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Frontend dev who is firmly on one side of the design/engineering line, not both.',
            tagWeights: { frontend: 1 },
            next: 'q4_fe_mixed_no',
          },
        ],
      },
      {
        id: 'q3_be_mixed',
        axis: 'be_api_data_generalist',
        cols: 3,
        prompt:
          "Your week had both 'why is this query slow' and 'should this be its own service'.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Small-team backend generalist — owns both API surface and data layer.',
            tagWeights: {
              backend: 1,
              api: 1,
              databases: 1,
              performance: 1,
            },
            next: 'q4_be_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Backend dev who crosses API/data boundaries occasionally but mostly stays in one lane.',
            tagWeights: { backend: 1, api: 1 },
            next: 'q4_be_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Backend dev who works strictly in one part of the stack — not the small-team generalist shape.',
            tagWeights: { backend: 1 },
            next: 'q4_be_mixed_no',
          },
        ],
      },
      {
        id: 'q3_fs_mixed',
        axis: 'fs_generalist_ic',
        cols: 3,
        prompt:
          "You take whichever ticket's on top — frontend, backend, glue, infra.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Generalist IC fullstack — picks work from a shared queue without a strong specialist lean.',
            tagWeights: { fullstack: 1, 'web-development': 1 },
            next: 'q4_fs_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Generalist most of the time but has a preferred lane when given the choice.',
            tagWeights: { fullstack: 1 },
            next: 'q4_fs_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Fullstack but with a clear preference or specialism, not a pick-anything generalist.',
            tagWeights: { fullstack: 1 },
            next: 'q4_fs_mixed_no',
          },
        ],
      },
      {
        id: 'q3_mobile_mixed',
        axis: 'mobile_native_xplat_hybrid',
        cols: 3,
        prompt:
          'Your team ships native and a cross-platform layer in the same app.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Mobile dev working across a native shell and a cross-platform layer (React Native / Flutter) in the same project.',
            tagWeights: {
              mobile: 1,
              'react-native': 1,
              ios: 1,
              android: 1,
            },
            next: 'q4_mobile_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Mostly one stack but has dipped into the other for specific surfaces.',
            tagWeights: { mobile: 1, 'react-native': 1 },
            next: 'q4_mobile_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Mobile dev firmly on one side of the native vs cross-platform line.',
            tagWeights: { mobile: 1 },
            next: 'q4_mobile_mixed_no',
          },
        ],
      },
      {
        id: 'q3_dml_mixed',
        axis: 'dml_mlops_rag',
        cols: 3,
        prompt:
          'Putting models into production is more of your week than training them.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Applied ML / MLOps / AI engineer — productionises models, builds RAG / agent systems, owns serving and evals.',
            tagWeights: {
              mlops: 1,
              'ai-engineering': 1,
              'machine-learning': 1,
              llm: 1,
              rag: 1,
            },
            next: 'q4_dml_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly applied work but trains or fine-tunes when needed.',
            tagWeights: { 'machine-learning': 1, ai: 1, mlops: 1 },
            next: 'q4_dml_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Not a productionisation focus — closer to research or to analytics.',
            tagWeights: { 'machine-learning': 1, ai: 1 },
            next: 'q4_dml_mixed_no',
          },
        ],
      },
      {
        id: 'q3_do_mixed',
        axis: 'do_platform_sre_hybrid',
        cols: 3,
        prompt:
          'You spend equal time on platform tooling and on-call rotations.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'DevOps / SRE hybrid on a small team — builds platform tools AND owns production reliability.',
            tagWeights: {
              devops: 1,
              sre: 1,
              'platform-engineering': 1,
              observability: 1,
            },
            next: 'q4_do_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Wears both hats but leans one way more than the other.',
            tagWeights: { devops: 1, sre: 1 },
            next: 'q4_do_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Either platform-only (no on-call) or on-call-only (no platform work) — not the hybrid shape.',
            tagWeights: { devops: 1 },
            next: 'q4_do_mixed_no',
          },
        ],
      },
      {
        id: 'q3_sec_mixed',
        axis: 'sec_appsec_devsecops',
        cols: 3,
        prompt:
          'You write security tooling for engineers, not pentest reports for management.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'AppSec / DevSecOps — builds security tooling, integrates checks into CI, sits between offense and defense.',
            tagWeights: {
              devsecops: 1,
              cybersecurity: 1,
              'application-security': 1,
            },
            next: 'q4_sec_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Some tooling work, but the day-to-day is closer to one of the classic offense/defense roles.',
            tagWeights: { cybersecurity: 1, devsecops: 1 },
            next: 'q4_sec_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Security work is firmly offensive or firmly defensive — not the engineering-enablement shape.',
            tagWeights: { cybersecurity: 1 },
            next: 'q4_sec_mixed_no',
          },
        ],
      },
      {
        id: 'q3_dt_mixed',
        axis: 'dt_oss_internal_hybrid',
        cols: 3,
        prompt:
          "Your work splits between an OSS project and your company's internal tooling.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid devtools engineer — maintains OSS AND builds internal developer platform tooling.',
            tagWeights: {
              'developer-tools': 1,
              'open-source': 1,
              'platform-engineering': 1,
            },
            next: 'q4_dt_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Does both occasionally but most weeks lean toward one side.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
            next: 'q4_dt_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Devtools work is purely external (OSS / public product) or purely internal — not the hybrid shape.',
            tagWeights: { 'developer-tools': 1 },
            next: 'q4_dt_mixed_no',
          },
        ],
      },
      {
        id: 'q3_fn_mixed',
        axis: 'fn_player_coach',
        cols: 3,
        prompt:
          'You still ship code daily, even though others on the team could.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Player-coach founder / lead — ships code daily while also driving direction, hiring, and reviews.',
            tagWeights: {
              'engineering-management': 1,
              leadership: 1,
              startups: 1,
            },
            next: 'q4_fn_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Ships code regularly but not every day — splits time with leadership work.',
            tagWeights: { leadership: 1, 'engineering-management': 1 },
            next: 'q4_fn_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Mostly out of the IC code — leadership, hiring, and direction are the day job.',
            tagWeights: { leadership: 1, 'engineering-management': 1 },
            next: 'q4_fn_mixed_no',
          },
        ],
      },
      {
        id: 'q3_sp_mixed',
        axis: 'sp_embedded_software',
        cols: 3,
        prompt:
          "Your code lives close to hardware but doesn't drive motors or render visuals.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              "Embedded / IoT / firmware engineer — code runs near hardware (sensors, instruments, edge devices) but isn't driving motion or media.",
            tagWeights: { embedded: 1, iot: 1, firmware: 1 },
            next: 'q4_sp_mixed_yes',
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Sometimes touches firmware but mostly works one layer up.',
            tagWeights: { embedded: 1, iot: 1 },
            next: 'q4_sp_mixed_sort_of',
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Hardware-adjacent work is on the robotics or media side, not the firmware / IoT middle.',
            tagWeights: { embedded: 1 },
            next: 'q4_sp_mixed_no',
          },
        ],
      },
      // ============================================================
      // Q4 sort_of branches + Q3_mixed children — "mixed" leaves
      // ============================================================
      {
        id: 'q4_fe_ds_mixed',
        axis: 'fe_ds_monorepo_or_public',
        cols: 3,
        prompt:
          'Your component library lives in a monorepo, not a public package.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Maintains an internal monorepo-hosted design system for sibling teams.',
            tagWeights: { 'design-systems': 1, frontend: 1, monorepo: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Library is shared but the distribution shape is not a typical monorepo.',
            tagWeights: { 'design-systems': 1, frontend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Library is a public / OSS package, not internal-only.',
            tagWeights: { 'design-systems': 1, 'open-source': 1, frontend: 1 },
          },
        ],
      },
      {
        id: 'q4_fe_arch_mixed',
        axis: 'fe_arch_ssr_rsc',
        cols: 3,
        prompt:
          'Server-rendered or RSC code is part of your week, not just client components.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid SSR / React Server Components dev — Next.js or similar shapes.',
            tagWeights: { frontend: 1, nextjs: 1, react: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Dabbles in SSR / RSC but most code is client-side.',
            tagWeights: { frontend: 1, react: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Pure client-side SPA work — no server rendering in the codebase.',
            tagWeights: { frontend: 1, javascript: 1, react: 1 },
          },
        ],
      },
      {
        id: 'q4_fe_mixed_yes',
        axis: 'fe_mixed_solo_bridge',
        cols: 3,
        prompt:
          "You're the only one bridging design and engineering on your team.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Solo design + engineering bridge — IC fullstack-on-frontend with design ownership.',
            tagWeights: { 'design-systems': 1, frontend: 1, css: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Shares the bridging role with a designer-engineer counterpart.',
            tagWeights: { 'design-systems': 1, frontend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Bridging role exists on the team but is owned by someone else (design ops / design eng).',
            tagWeights: { frontend: 1 },
          },
        ],
      },
      {
        id: 'q4_fe_mixed_sort_of',
        axis: 'fe_mixed_visual_default',
        cols: 3,
        prompt:
          "When forced to pick, you'd grab a CSS or design ticket over a state-machine refactor.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Hybrid dev whose default reach is visual / CSS work.',
            tagWeights: { css: 1, 'design-systems': 1, frontend: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Default lane depends on the day — no strong preference.',
            tagWeights: { frontend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Hybrid dev whose default reach is application architecture, not visual polish.',
            tagWeights: { frontend: 1, react: 1 },
          },
        ],
      },
      {
        id: 'q4_fe_mixed_no',
        axis: 'fe_mixed_visual_polish_specialist',
        cols: 3,
        prompt:
          'Your specialty is visual polish, not application architecture.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Visual / interaction design specialist within a frontend role.',
            tagWeights: { css: 1, 'design-systems': 1, frontend: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Skews visual but does some architecture work.',
            tagWeights: { frontend: 1, css: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Specialty is application architecture — state, routing, perf — not visual polish.',
            tagWeights: { frontend: 1, react: 1, javascript: 1 },
          },
        ],
      },
      {
        id: 'q4_be_api_mixed',
        axis: 'be_api_monolith_with_satellites',
        cols: 3,
        prompt:
          'Most of your code lives in one big service, with a few small ones around it.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Backend dev mostly in a monolith, with a handful of satellite services.',
            tagWeights: { backend: 1, api: 1, monolith: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Roughly even split between monolith and microservices.',
            tagWeights: { backend: 1, api: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Full microservices environment — no dominant monolith.',
            tagWeights: {
              backend: 1,
              microservices: 1,
              'distributed-systems': 1,
            },
          },
        ],
      },
      {
        id: 'q4_be_data_mixed',
        axis: 'be_data_schema_vs_queries',
        cols: 3,
        prompt: 'Schema migrations are more of your week than query plans.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Data-layer backend dev focused on schema design and migrations.',
            tagWeights: { databases: 1, backend: 1, 'schema-design': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Both schema and query work in roughly equal amounts.',
            tagWeights: { databases: 1, backend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Query tuning and live performance work dominates your data-layer week.',
            tagWeights: { databases: 1, backend: 1, performance: 1 },
          },
        ],
      },
      {
        id: 'q4_be_mixed_yes',
        axis: 'be_mixed_owns_deploy',
        cols: 3,
        prompt: 'Owning the deploy pipeline counts as part of your job.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Backend generalist who also owns infra / deploy pipelines.',
            tagWeights: { backend: 1, devops: 1, 'ci-cd': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Occasionally touches infra but does not own the pipeline.',
            tagWeights: { backend: 1, devops: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Strictly application code — infra is someone else.',
            tagWeights: { backend: 1 },
          },
        ],
      },
      {
        id: 'q4_be_mixed_sort_of',
        axis: 'be_mixed_api_first_default',
        cols: 3,
        prompt:
          'If a feature ticket needs API + DB work, you default to starting with the API.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Generalist with an API-first instinct.',
            tagWeights: { backend: 1, api: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Default depends on the ticket — no strong start preference.',
            tagWeights: { backend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Generalist with a data-first instinct.',
            tagWeights: { backend: 1, databases: 1 },
          },
        ],
      },
      {
        id: 'q4_be_mixed_no',
        axis: 'be_mixed_specific_tool',
        cols: 3,
        prompt:
          'Your day is spent in a specific tool or system, not jumping between layers.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Backend specialist in a single subsystem (queue, payment service, search, etc.).',
            tagWeights: { backend: 1, api: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly one tool but crosses over occasionally.',
            tagWeights: { backend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Spread across many tools and systems — not a single-system specialist.',
            tagWeights: { backend: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_product_mixed',
        axis: 'fs_product_shapes_not_decides',
        cols: 3,
        prompt: 'You shape the roadmap, but someone else owns the final call.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Senior IC / tech-lead — influences product direction without owning it.',
            tagWeights: {
              fullstack: 1,
              'engineering-management': 1,
              leadership: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Some input on roadmap but mostly just builds what is decided.',
            tagWeights: { fullstack: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'No formal say in roadmap — pure execution role.',
            tagWeights: { fullstack: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_spec_mixed',
        axis: 'fs_spec_secret_backend_preference',
        cols: 3,
        prompt:
          "Backend tickets get picked up by you more often than you'd admit.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Fullstack with secret backend lean despite identifying as broadly fullstack.',
            tagWeights: { fullstack: 1, backend: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'About even but with a slight backend pull.',
            tagWeights: { fullstack: 1, backend: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Truly balanced — picks frontend and backend tickets equally.',
            tagWeights: { fullstack: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_mixed_yes',
        axis: 'fs_mixed_small_team',
        cols: 3,
        prompt: "You're the only engineer on your product, or one of two.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Solo / two-person engineering team — generalist by necessity.',
            tagWeights: { fullstack: 1, startups: 1, 'indie-hacking': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Small team (3-5 engs) — generalist by choice within a small group.',
            tagWeights: { fullstack: 1, startups: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Larger team — generalist behavior is personal preference, not headcount.',
            tagWeights: { fullstack: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_mixed_sort_of',
        axis: 'fs_mixed_phase_dependent',
        cols: 3,
        prompt:
          'Some weeks you reach for frontend tickets first, other weeks backend.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Generalist whose preferred lane oscillates week to week.',
            tagWeights: { fullstack: 1, 'web-development': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly stable preference with occasional drift.',
            tagWeights: { fullstack: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Generalist with a stable, consistent default lane.',
            tagWeights: { fullstack: 1 },
          },
        ],
      },
      {
        id: 'q4_fs_mixed_no',
        axis: 'fs_mixed_fast_specialist',
        cols: 3,
        prompt: 'Frontend or backend — you have a side, you just answer fast.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Specialist who works fullstack but knows their preferred side immediately.',
            tagWeights: { fullstack: 1, 'web-development': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Mostly leans one side but is honestly comfortable on the other.',
            tagWeights: { fullstack: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'No real preference — true generalist.',
            tagWeights: { fullstack: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_native_mixed',
        axis: 'mobile_native_android',
        cols: 3,
        prompt: 'Your codebase is Kotlin and Jetpack Compose, not Swift.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Android-native dev — Kotlin, Jetpack Compose primary.',
            tagWeights: { mobile: 1, android: 1, kotlin: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Android-leaning but with some iOS work too.',
            tagWeights: { mobile: 1, android: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'iOS-first dev — Swift / SwiftUI primary.',
            tagWeights: { mobile: 1, ios: 1, swift: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_xplat_mixed',
        axis: 'mobile_xplat_flutter',
        cols: 3,
        prompt: 'Your cross-platform stack is Flutter, not React Native.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Cross-platform dev on Flutter / Dart.',
            tagWeights: { mobile: 1, flutter: 1, dart: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Uses Flutter sometimes but also other cross-platform tech.',
            tagWeights: { mobile: 1, flutter: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Cross-platform stack is React Native (JS / TS), not Flutter.',
            tagWeights: { mobile: 1, 'react-native': 1, javascript: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_mixed_yes',
        axis: 'mobile_mixed_native_modules',
        cols: 3,
        prompt:
          'Performance-critical screens drop to native modules; the rest is cross-platform.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid mobile dev who writes native modules to back a cross-platform app.',
            tagWeights: {
              mobile: 1,
              'react-native': 1,
              ios: 1,
              android: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Has done it once or twice but most work stays in the cross-platform layer.',
            tagWeights: { mobile: 1, 'react-native': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Native and cross-platform live in separate apps, not the same one.',
            tagWeights: { mobile: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_mixed_sort_of',
        axis: 'mobile_mixed_xplat_dominant',
        cols: 3,
        prompt:
          'Most of the codebase is cross-platform, with a few native islands.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Cross-platform-dominant hybrid — small native pockets for specific surfaces.',
            tagWeights: { mobile: 1, 'react-native': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Roughly equal native and cross-platform.',
            tagWeights: { mobile: 1, 'react-native': 1, ios: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Native-dominant hybrid — cross-platform is the side concern.',
            tagWeights: { mobile: 1, ios: 1, android: 1 },
          },
        ],
      },
      {
        id: 'q4_mobile_mixed_no',
        axis: 'mobile_mixed_native_only_team',
        cols: 3,
        prompt:
          'Your team is firmly native-only, not running cross-platform code alongside.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Native-only mobile team — no cross-platform in the codebase.',
            tagWeights: { mobile: 1, ios: 1, android: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly native, with isolated cross-platform experiments.',
            tagWeights: { mobile: 1, ios: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Cross-platform-only team — no native code at all.',
            tagWeights: { mobile: 1, 'react-native': 1 },
          },
        ],
      },
      {
        id: 'q4_dml_models_mixed',
        axis: 'dml_models_eval_over_loss',
        cols: 3,
        prompt: 'Your evals matter more than your loss curves.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Applied ML / eval engineer — runs eval harnesses, less time on raw training.',
            tagWeights: { 'machine-learning': 1, 'ai-engineering': 1, llm: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Cares about both eval rigor and training dynamics.',
            tagWeights: { 'machine-learning': 1, 'deep-learning': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Training / loss-curve work dominates — research-leaning.',
            tagWeights: {
              'machine-learning': 1,
              'deep-learning': 1,
              pytorch: 1,
            },
          },
        ],
      },
      {
        id: 'q4_dml_data_mixed',
        axis: 'dml_data_pipelines_not_dashboards',
        cols: 3,
        prompt: 'Your output is data pipelines, not dashboards.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Data engineer — pipelines, warehouses, transforms.',
            tagWeights: { 'data-engineering': 1, sql: 1, etl: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly pipelines but builds the occasional dashboard.',
            tagWeights: { 'data-engineering': 1, 'data-science': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Analytics engineer / analyst — output is dashboards and reports.',
            tagWeights: { 'data-science': 1, sql: 1, analytics: 1 },
          },
        ],
      },
      {
        id: 'q4_dml_mixed_yes',
        axis: 'dml_mixed_latency_budgets',
        cols: 3,
        prompt:
          'Inference latency budgets are part of your design discussions.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Production-ML / inference engineer — owns serving, latency, cost.',
            tagWeights: { mlops: 1, 'ai-engineering': 1, llm: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Latency comes up but is not the primary design constraint.',
            tagWeights: { mlops: 1, 'machine-learning': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'No serving-latency concern — works upstream of production inference.',
            tagWeights: { 'machine-learning': 1, ai: 1 },
          },
        ],
      },
      {
        id: 'q4_dml_mixed_sort_of',
        axis: 'dml_mixed_productionise_and_train',
        cols: 3,
        prompt: 'You productionise models AND occasionally train new ones.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid applied ML — productionisation primary, occasional training / fine-tuning.',
            tagWeights: {
              mlops: 1,
              'machine-learning': 1,
              'ai-engineering': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Heavy on productionisation, very little training.',
            tagWeights: { mlops: 1, 'ai-engineering': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Productionisation only — never trains.',
            tagWeights: { mlops: 1, 'ai-engineering': 1 },
          },
        ],
      },
      {
        id: 'q4_dml_mixed_no',
        axis: 'dml_mixed_research_or_analytics',
        cols: 3,
        prompt:
          "Research or analytics is your main beat — production is someone else's problem.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Research / analytics ML — model dev or data analysis, not production.',
            tagWeights: {
              'machine-learning': 1,
              'deep-learning': 1,
              'data-science': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Mostly research / analytics but ships things to production occasionally.',
            tagWeights: { 'machine-learning': 1, 'data-science': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Actually production-focused after all — previous answer was misleading.',
            tagWeights: { mlops: 1, 'ai-engineering': 1 },
          },
        ],
      },
      {
        id: 'q4_do_platform_mixed',
        axis: 'do_platform_iac_focus',
        cols: 3,
        prompt:
          'Your work is Terraform modules and Helm charts, not CLIs and SDKs.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Infrastructure-as-code / platform engineer — Terraform, Kubernetes manifests.',
            tagWeights: {
              devops: 1,
              kubernetes: 1,
              terraform: 1,
              'infrastructure-as-code': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly IaC, with some CLI / SDK building on the side.',
            tagWeights: { devops: 1, kubernetes: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Builds CLIs and SDKs, not IaC.',
            tagWeights: { devops: 1, 'developer-tools': 1 },
          },
        ],
      },
      {
        id: 'q4_do_sre_mixed',
        axis: 'do_sre_observability_design',
        cols: 3,
        prompt: 'You design observability before incidents, not during them.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Observability-focused SRE — designs monitoring / SLOs proactively.',
            tagWeights: { sre: 1, observability: 1, devops: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mix of proactive design and reactive on-call response.',
            tagWeights: { sre: 1, observability: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Reactive on-call response is the dominant SRE shape — observability work happens during incidents.',
            tagWeights: { sre: 1, devops: 1 },
          },
        ],
      },
      {
        id: 'q4_do_mixed_yes',
        axis: 'do_mixed_terraform_and_postmortems',
        cols: 3,
        prompt:
          'The same week had a Terraform PR and a postmortem with your name on it.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid platform + SRE — ships infra changes AND owns incident response.',
            tagWeights: {
              devops: 1,
              sre: 1,
              'platform-engineering': 1,
              terraform: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly platform with occasional incident response.',
            tagWeights: { devops: 1, 'platform-engineering': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Strictly platform OR strictly SRE — does not own both flows.',
            tagWeights: { devops: 1 },
          },
        ],
      },
      {
        id: 'q4_do_mixed_sort_of',
        axis: 'do_mixed_oncall_oscillation',
        cols: 3,
        prompt: 'On-call weeks lean SRE; normal weeks lean platform.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Platform engineer who flips into SRE mode during on-call rotations.',
            tagWeights: { devops: 1, sre: 1, 'platform-engineering': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Roughly oscillates but no clean rota structure.',
            tagWeights: { devops: 1, sre: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Both modes coexist constantly — not oscillating.',
            tagWeights: { devops: 1, sre: 1 },
          },
        ],
      },
      {
        id: 'q4_do_mixed_no',
        axis: 'do_mixed_single_lane',
        cols: 3,
        prompt:
          "Platform or SRE — you're firmly one, even though both touch your team.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Single-lane devops engineer — platform OR SRE, even on a small team.',
            tagWeights: { devops: 1, 'platform-engineering': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Single lane with rare excursions into the other.',
            tagWeights: { devops: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Actually a hybrid after all — previous answer was misread.',
            tagWeights: { devops: 1, sre: 1 },
          },
        ],
      },
      {
        id: 'q4_sec_off_mixed',
        axis: 'sec_off_mobile_or_hardware',
        cols: 3,
        prompt:
          'Mobile-app pentests or hardware-security work shows up in your week.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Offensive sec across surfaces beyond web/API — mobile, hardware, embedded.',
            tagWeights: { cybersecurity: 1, hacking: 1, 'mobile-security': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Mostly web/API but with occasional mobile or hardware work.',
            tagWeights: { cybersecurity: 1, hacking: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Pure web / API pentesting, no mobile or hardware.',
            tagWeights: {
              cybersecurity: 1,
              hacking: 1,
              'application-security': 1,
            },
          },
        ],
      },
      {
        id: 'q4_sec_def_mixed',
        axis: 'sec_def_threat_modeling',
        cols: 3,
        prompt:
          'Threat-modeling sessions are more of your week than code reviews.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Defensive sec focused on threat modeling and architectural review.',
            tagWeights: {
              cybersecurity: 1,
              'threat-modeling': 1,
              'application-security': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Threat modeling and code review in roughly equal measure.',
            tagWeights: { cybersecurity: 1, 'application-security': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Code review is the dominant defensive activity.',
            tagWeights: { cybersecurity: 1, 'application-security': 1 },
          },
        ],
      },
      {
        id: 'q4_sec_mixed_yes',
        axis: 'sec_mixed_explicit_title',
        cols: 3,
        prompt:
          "Your job description literally includes 'AppSec' or 'DevSecOps'.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Formal AppSec / DevSecOps title — engineering-enablement security role.',
            tagWeights: {
              devsecops: 1,
              'application-security': 1,
              cybersecurity: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Effectively AppSec / DevSecOps without the formal title.',
            tagWeights: { devsecops: 1, cybersecurity: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Title is a classic offense or defense role, not AppSec / DevSecOps.',
            tagWeights: { cybersecurity: 1 },
          },
        ],
      },
      {
        id: 'q4_sec_mixed_sort_of',
        axis: 'sec_mixed_tooling_and_findings',
        cols: 3,
        prompt:
          'Half your week is writing security tooling, the other half responding to findings.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Hybrid AppSec — builds engineer-facing tooling AND triages findings.',
            tagWeights: {
              devsecops: 1,
              cybersecurity: 1,
              'application-security': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Mostly tooling, with occasional findings-triage rotations.',
            tagWeights: { devsecops: 1, cybersecurity: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Tooling work happens on a separate team — you do one of those things, not both.',
            tagWeights: { cybersecurity: 1 },
          },
        ],
      },
      {
        id: 'q4_sec_mixed_no',
        axis: 'sec_mixed_purist',
        cols: 3,
        prompt:
          'Your security work is purely offensive or purely defensive, not the engineering-enablement middle.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Pure offense or pure defense — not AppSec / DevSecOps shaped.',
            tagWeights: { cybersecurity: 1, hacking: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly one side but does some tooling work occasionally.',
            tagWeights: { cybersecurity: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Actually AppSec / DevSecOps shaped — previous answer was misread.',
            tagWeights: { devsecops: 1, cybersecurity: 1 },
          },
        ],
      },
      {
        id: 'q4_dt_ext_mixed',
        axis: 'dt_ext_contributes_to_others',
        cols: 3,
        prompt:
          "Your commits land in someone else's OSS project as often as your own.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'OSS contributor — sends PRs upstream more than maintaining own repo.',
            tagWeights: { 'open-source': 1, 'developer-tools': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Some contribution to others, mostly own project.',
            tagWeights: { 'open-source': 1, 'developer-tools': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Strict maintainer — your OSS work is your own project.',
            tagWeights: { 'open-source': 1, 'developer-tools': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_int_mixed',
        axis: 'dt_int_linters_codegen',
        cols: 3,
        prompt:
          'You build linters, formatters, or codegen — not just CI pipelines.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Internal devtools focused on linters / formatters / codegen — DX tooling.',
            tagWeights: {
              'developer-tools': 1,
              'static-analysis': 1,
              linting: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Build pipelines plus some DX tooling.',
            tagWeights: { 'developer-tools': 1, 'ci-cd': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Build pipelines and CI runners only — no linters / codegen.',
            tagWeights: { 'developer-tools': 1, 'ci-cd': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_mixed_yes',
        axis: 'dt_mixed_extract_to_oss',
        cols: 3,
        prompt:
          'Your internal tools regularly get extracted into OSS releases.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Devtools engineer whose internal work upstreams into the OSS ecosystem.',
            tagWeights: {
              'developer-tools': 1,
              'open-source': 1,
              'platform-engineering': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Occasionally extracts internal work into OSS.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Internal tools stay strictly internal.',
            tagWeights: { 'developer-tools': 1, 'platform-engineering': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_mixed_sort_of',
        axis: 'dt_mixed_separate_streams',
        cols: 3,
        prompt: 'Your OSS work and internal work mostly stay separate.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Devtools engineer with parallel streams — OSS and internal do not feed each other.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly separate but occasional cross-pollination.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'OSS and internal are actually deeply intertwined.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
        ],
      },
      {
        id: 'q4_dt_mixed_no',
        axis: 'dt_mixed_different_teams',
        cols: 3,
        prompt:
          'Internal tooling and OSS are different teams in your world, not the same job.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'OSS work and internal tooling are owned by different teams entirely.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Different teams but with shared people across them.',
            tagWeights: { 'developer-tools': 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Same team owns both — not a clean split.',
            tagWeights: { 'developer-tools': 1, 'open-source': 1 },
          },
        ],
      },
      {
        id: 'q4_fn_tech_mixed',
        axis: 'fn_tech_lead_no_equity',
        cols: 3,
        prompt:
          "You make the technical hires, even though you don't sign the offers.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Tech lead / engineering manager — drives hiring without founder-level equity.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Some hiring input but does not own the bar.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'No hiring involvement — just an IC who codes.',
            tagWeights: { leadership: 1 },
          },
        ],
      },
      {
        id: 'q4_fn_nontech_mixed',
        axis: 'fn_nontech_shapes_implementation',
        cols: 3,
        prompt:
          'You shape what to build but also how — not just product specs.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'PM / lead with implementation influence — shapes architecture, not just scope.',
            tagWeights: { 'product-management': 1, leadership: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly specs but contributes to how things get built.',
            tagWeights: { 'product-management': 1, leadership: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Pure product specs — implementation is fully delegated.',
            tagWeights: { 'product-management': 1 },
          },
        ],
      },
      {
        id: 'q4_fn_mixed_yes',
        axis: 'fn_mixed_owns_gnarly',
        cols: 3,
        prompt:
          "You'd rather ship the gnarly feature yourself than hand it off.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Player-coach who keeps the hardest tickets for themselves.',
            tagWeights: {
              'engineering-management': 1,
              leadership: 1,
              startups: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Sometimes takes the hard tickets, sometimes hands them off to grow the team.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Hands off gnarly work to grow others — does not pick it up themselves.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
        ],
      },
      {
        id: 'q4_fn_mixed_sort_of',
        axis: 'fn_mixed_phase_dependent',
        cols: 3,
        prompt:
          "Some weeks are pure leadership; other weeks you're back in the IDE.",
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Player-coach with oscillating phases — leadership weeks then IC weeks.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly leadership, with rare IC sprints.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Always in both modes simultaneously — not phase-based.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
        ],
      },
      {
        id: 'q4_fn_mixed_no',
        axis: 'fn_mixed_evening_coder',
        cols: 3,
        prompt:
          'Leadership work is the day job — code is more of an evenings thing.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Engineering leader who codes on side projects, not the day job.',
            tagWeights: {
              'engineering-management': 1,
              leadership: 1,
              'side-projects': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Code occasionally during the day but most coding is outside it.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Code is firmly part of the day job, not the evening.',
            tagWeights: { 'engineering-management': 1, leadership: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_hw_mixed',
        axis: 'sp_hw_sensors_not_motion',
        cols: 3,
        prompt:
          'Your hardware controls sensors and readings, not actuators and motion.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Sensor / instrumentation engineer — reads signals, no motion control.',
            tagWeights: {
              embedded: 1,
              iot: 1,
              firmware: 1,
              sensors: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly sensors but with some basic actuator control.',
            tagWeights: { embedded: 1, iot: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Motion / robotics work — actuators dominate.',
            tagWeights: { embedded: 1, robotics: 1, firmware: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_sw_mixed',
        axis: 'sp_sw_audio_video',
        cols: 3,
        prompt: 'Your code processes audio or video, not renders 3D scenes.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Audio / video / signal-processing software — not 3D rendering.',
            tagWeights: {
              'audio-processing': 1,
              'video-processing': 1,
              multimedia: 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Both A/V processing and some rendering work.',
            tagWeights: { multimedia: 1, graphics: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              '3D / graphics / game-engine work — not audio/video processing.',
            tagWeights: { 'game-development': 1, graphics: 1, '3d': 1 },
          },
        ],
      },
      {
        id: 'q4_sp_mixed_yes',
        axis: 'sp_mixed_battery_and_sensors',
        cols: 3,
        prompt:
          'Battery life and sensor accuracy are the constraints you optimize against.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'IoT / embedded engineer — battery and sensor-accuracy budgets dominate.',
            tagWeights: { embedded: 1, iot: 1, firmware: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Cares about these constraints but they are not the primary axis.',
            tagWeights: { embedded: 1, iot: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal:
              'Different constraints dominate — latency, throughput, accuracy, etc.',
            tagWeights: { embedded: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_mixed_sort_of',
        axis: 'sp_mixed_firmware_and_cloud',
        cols: 3,
        prompt:
          'Some of your work is firmware, some is cloud-side data processing.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal: 'Full-stack IoT — firmware AND cloud / data pipeline work.',
            tagWeights: {
              embedded: 1,
              iot: 1,
              firmware: 1,
              'data-engineering': 1,
            },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal: 'Mostly firmware, occasionally touches the cloud side.',
            tagWeights: { embedded: 1, iot: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Strictly firmware — no cloud-side work.',
            tagWeights: { embedded: 1, firmware: 1 },
          },
        ],
      },
      {
        id: 'q4_sp_mixed_no',
        axis: 'sp_mixed_normal_software',
        cols: 3,
        prompt:
          'Hardware-adjacent is the wrong frame — you write standard software that happens to ship on a battery-powered thing.',
        options: [
          {
            id: 'yes',
            label: 'Spot on',
            signal:
              'Standard application software dev whose target hardware happens to be portable.',
            tagWeights: { mobile: 1, embedded: 1 },
          },
          {
            id: 'sort_of',
            label: 'Sort of',
            signal:
              'Some firmware-shaped concerns but most code is normal app code.',
            tagWeights: { embedded: 1, mobile: 1 },
          },
          {
            id: 'no',
            label: 'Way off',
            signal: 'Actually firmware / embedded shaped after all.',
            tagWeights: { embedded: 1, firmware: 1 },
          },
        ],
      },
    ],
    selection: {
      minQuestions: 10,
      maxQuestions: 14,
      tagConfidenceFloor: 1,
    },
    enrichment: {
      enabled: true,
      targetTotalTags: 10,
      fallbackTags: ['javascript', 'web-development', 'best-practices'],
    },
    reveal: {
      eyebrow: 'You are a…',
      cta: 'These look right',
      feedbackCta: 'This isn’t me — let me tell you why',
      feedbackPlaceholder:
        'We screwed up. Tell us what we missed and we’ll keep tuning.',
      addTagCta: 'Add another tag',
    },
  };

export const buildSamplePersonaQuizStep = (
  onTransition: FunnelStepPersonaQuiz['onTransition'],
): FunnelStepPersonaQuiz => ({
  id: 'persona-quiz-preview',
  type: FunnelStepType.PersonaQuiz,
  isActive: true,
  parameters: personaQuizSampleParameters,
  transitions: [
    { on: FunnelStepTransitionType.Complete, destination: 'finish' },
  ],
  onTransition,
});
