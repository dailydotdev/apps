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

// Graft a 4th decision level onto a leaf: a colour question, then a branch that
// forks into two finer sub-personas. Used for the deeper data/infra trees.
const splitLeaf = (s) => {
  const yesEnd = E(
    `${s.a.archetypeId}_terminal`,
    s.a.terminalPrompt,
    s.a.terminalYesTags,
    s.a.terminalNoTags,
    s.a.archetypeId,
  );
  const noEnd = E(
    `${s.b.archetypeId}_terminal`,
    s.b.terminalPrompt,
    s.b.terminalYesTags,
    s.b.terminalNoTags,
    s.b.archetypeId,
  );
  const b4 = B(
    s.branch.axis,
    s.branch.prompt,
    { tags: s.branch.yesTags, to: yesEnd },
    { tags: s.branch.noTags, to: noEnd },
  );
  return C(s.colour.axis, s.colour.prompt, s.colour.yesTags, s.colour.noTags, b4);
};

// LLM-authored sub-persona splits (colour + B4 branch + 2 terminals each)
// for the deeper data/infra trees. See generatePersonaQuiz docs.
const DATA_SPLITS = {
  "ml_training_engineer": {
    "colour": {
      "axis": "data_ml_research_flavour",
      "prompt": "Reading academic papers is how you keep sharp in your domain.",
      "yesTags": {
        "deep-learning": 2,
        "transformers": 1
      },
      "noTags": {
        "machine-learning": 1,
        "python": 1
      }
    },
    "branch": {
      "axis": "data_ml_research_applied",
      "prompt": "Exploring novel architectures matters more to you than proving they work at scale.",
      "yesTags": {
        "deep-learning": 1,
        "transformers": 1
      },
      "noTags": {
        "pytorch": 1,
        "cuda": 1
      }
    },
    "a": {
      "archetypeId": "ml_research_engineer",
      "terminalPrompt": "You measure your impact by papers written or techniques contributed, not by models in production.",
      "terminalYesTags": {
        "deep-learning": 2,
        "transformers": 1,
        "neural-networks": 1
      },
      "terminalNoTags": {
        "machine-learning": 1,
        "python": 1
      }
    },
    "b": {
      "archetypeId": "ml_training_engineer",
      "terminalPrompt": "A new architecture paper can pull you in as fast as a new benchmark score.",
      "terminalYesTags": {
        "deep-learning": 2,
        "neural-networks": 1,
        "transformers": 1
      },
      "terminalNoTags": {
        "machine-learning": 1,
        "python": 1
      }
    }
  },
  "mlops_engineer": {
    "colour": {
      "axis": "data_mlops_holistic",
      "prompt": "Model cards, deployment logs, and monitoring dashboards are equally important to you.",
      "yesTags": {
        "mlops": 2,
        "llmops": 1
      },
      "noTags": {
        "machine-learning": 1,
        "python": 1
      }
    },
    "branch": {
      "axis": "data_mlops_evaluation_serving",
      "prompt": "Evaluating whether a model is production-ready fascinates you more than operating the serving layer.",
      "yesTags": {
        "deep-learning": 1,
        "cicd": 1
      },
      "noTags": {
        "mlops": 1,
        "huggingface": 1
      }
    },
    "a": {
      "archetypeId": "mlops_evaluation_engineer",
      "terminalPrompt": "You've built an evaluation framework that catches regressions the way a test suite catches bugs.",
      "terminalYesTags": {
        "mlops": 2,
        "deep-learning": 1,
        "data-science": 1
      },
      "terminalNoTags": {
        "machine-learning": 1,
        "python": 1
      }
    },
    "b": {
      "archetypeId": "mlops_engineer",
      "terminalPrompt": "A model is only interesting to you once it is serving traffic without falling over.",
      "terminalYesTags": {
        "mlops": 2,
        "llmops": 1,
        "cicd": 1
      },
      "terminalNoTags": {
        "machine-learning": 1,
        "python": 1
      }
    }
  },
  "llm_app_engineer": {
    "colour": {
      "axis": "data_llm_agentic_wonder",
      "prompt": "Watching an LLM solve multi-step problems through tool use still feels like magic.",
      "yesTags": {
        "llm": 2,
        "prompt-engineering": 1
      },
      "noTags": {
        "genai": 1,
        "ai": 1
      }
    },
    "branch": {
      "axis": "data_llm_agents_prompts",
      "prompt": "Designing tool chains and agent flows excites you more than perfecting prompt wording.",
      "yesTags": {
        "langchain": 1,
        "semantic-kernel": 1
      },
      "noTags": {
        "prompt-engineering": 1,
        "openai": 1
      }
    },
    "a": {
      "archetypeId": "llm_agentic_engineer",
      "terminalPrompt": "Designing an agent that sequences tools correctly without explicit prompts feels like genuine progress.",
      "terminalYesTags": {
        "llm": 2,
        "langchain": 1,
        "semantic-kernel": 1
      },
      "terminalNoTags": {
        "genai": 1,
        "ai": 1
      }
    },
    "b": {
      "archetypeId": "llm_prompt_engineer",
      "terminalPrompt": "Fine-tuning a prompt until a model consistently outputs your exact format feels like mastery.",
      "terminalYesTags": {
        "llm": 2,
        "prompt-engineering": 1,
        "openai": 1
      },
      "terminalNoTags": {
        "genai": 1,
        "ai": 1
      }
    }
  },
  "rag_retrieval_engineer": {
    "colour": {
      "axis": "data_rag_embedding_discussion",
      "prompt": "Embedding model trade-offs are conversations you have as often as most engineers discuss latency.",
      "yesTags": {
        "rag": 2,
        "vector-search": 1
      },
      "noTags": {
        "llm": 1,
        "genai": 1
      }
    },
    "branch": {
      "axis": "data_rag_pipeline_index",
      "prompt": "Optimizing how documents flow into the index interests you more than what lives in it.",
      "yesTags": {
        "embeddings": 1,
        "data-engineering": 1
      },
      "noTags": {
        "vector-search": 1,
        "llm": 1
      }
    },
    "a": {
      "archetypeId": "rag_ingestion_engineer",
      "terminalPrompt": "You spend more effort on document chunking and refresh strategies than on tuning LLM prompts.",
      "terminalYesTags": {
        "rag": 2,
        "embeddings": 1,
        "data-engineering": 1
      },
      "terminalNoTags": {
        "llm": 1,
        "genai": 1
      }
    },
    "b": {
      "archetypeId": "rag_vector_engineer",
      "terminalPrompt": "Improving retrieval accuracy through smarter indexing and ranking is where you find satisfaction.",
      "terminalYesTags": {
        "vector-search": 2,
        "embeddings": 1,
        "rag": 1
      },
      "terminalNoTags": {
        "llm": 1,
        "genai": 1
      }
    }
  },
  "streaming_data_engineer": {
    "colour": {
      "axis": "data_streaming_freshness",
      "prompt": "Real-time data freshness is baked into your system design from day one.",
      "yesTags": {
        "data-streaming": 2,
        "apache-kafka": 1
      },
      "noTags": {
        "data-engineering": 1,
        "etl": 1
      }
    },
    "branch": {
      "axis": "data_streaming_ingestion_compute",
      "prompt": "Reliably capturing changes from source systems fascinates you more than processing those events.",
      "yesTags": {
        "change-data-capture": 1,
        "apache-kafka": 1
      },
      "noTags": {
        "apache-flink": 1,
        "real-time-analytics": 1
      }
    },
    "a": {
      "archetypeId": "streaming_ingestion_engineer",
      "terminalPrompt": "A connector that catches every source change without data loss or double-counting is your achievement.",
      "terminalYesTags": {
        "change-data-capture": 2,
        "apache-kafka": 1,
        "data-streaming": 1
      },
      "terminalNoTags": {
        "data-engineering": 1,
        "etl": 1
      }
    },
    "b": {
      "archetypeId": "streaming_processor_engineer",
      "terminalPrompt": "A correctly windowed join across a distributed stream that handles late events gracefully is elegant.",
      "terminalYesTags": {
        "data-streaming": 2,
        "apache-flink": 1,
        "real-time-analytics": 1
      },
      "terminalNoTags": {
        "data-engineering": 1,
        "etl": 1
      }
    }
  },
  "batch_data_engineer": {
    "colour": {
      "axis": "data_batch_schema_philosophy",
      "prompt": "Your schema design philosophy shapes how you approach every transformation and pipeline.",
      "yesTags": {
        "data-warehouse": 2,
        "apache-spark": 1
      },
      "noTags": {
        "data-engineering": 1,
        "etl": 1
      }
    },
    "branch": {
      "axis": "data_batch_lakehouse_warehouse",
      "prompt": "Open table formats and schema-on-read appeal to you more than managed warehouse appliances.",
      "yesTags": {
        "apache-iceberg": 1,
        "apache-spark": 1
      },
      "noTags": {
        "snowflake": 1,
        "databricks": 1
      }
    },
    "a": {
      "archetypeId": "lakehouse_engineer",
      "terminalPrompt": "You chose Iceberg for schema evolution and time-travel because they align with your governance philosophy.",
      "terminalYesTags": {
        "apache-iceberg": 2,
        "apache-spark": 1,
        "data-warehouse": 1
      },
      "terminalNoTags": {
        "data-engineering": 1,
        "etl": 1
      }
    },
    "b": {
      "archetypeId": "warehouse_modeler_engineer",
      "terminalPrompt": "A normalized dimensional model with clear lineage and documentation is an artifact you're proud of.",
      "terminalYesTags": {
        "snowflake": 2,
        "databricks": 1,
        "data-warehouse": 1
      },
      "terminalNoTags": {
        "data-engineering": 1,
        "etl": 1
      }
    }
  },
  "analytics_bi_engineer": {
    "colour": {
      "axis": "data_analytics_performance",
      "prompt": "You consider data freshness and query performance as part of your craft.",
      "yesTags": {
        "analytics-platforms": 2,
        "bi": 1
      },
      "noTags": {
        "sql": 1,
        "data-analysis": 1
      }
    },
    "branch": {
      "axis": "data_analytics_metrics_dashboards",
      "prompt": "Building a governed metric layer matters more to you than crafting individual dashboards.",
      "yesTags": {
        "duckdb": 1,
        "sql": 1
      },
      "noTags": {
        "data-visualization": 1,
        "analytics-platforms": 1
      }
    },
    "a": {
      "archetypeId": "metrics_platform_engineer",
      "terminalPrompt": "When everyone stops arguing about which metric to use because there's one source of truth, you've won.",
      "terminalYesTags": {
        "analytics-platforms": 2,
        "duckdb": 1,
        "sql": 1
      },
      "terminalNoTags": {
        "data-analysis": 1,
        "data-visualization": 1
      }
    },
    "b": {
      "archetypeId": "bi_visualization_engineer",
      "terminalPrompt": "Watching someone understand a complex data story through your dashboard is genuinely fulfilling.",
      "terminalYesTags": {
        "data-visualization": 2,
        "analytics-platforms": 1,
        "bi": 1
      },
      "terminalNoTags": {
        "sql": 1,
        "data-analysis": 1
      }
    }
  },
  "data_science_analyst": {
    "colour": {
      "axis": "data_science_hypothesis",
      "prompt": "Hypothesis testing and experimental design are woven into how you think.",
      "yesTags": {
        "data-science": 2,
        "statistical-analysis": 1
      },
      "noTags": {
        "sql": 1,
        "data-analysis": 1
      }
    },
    "branch": {
      "axis": "data_science_prediction_exploration",
      "prompt": "Building models that predict the future excites you more than understanding what happened.",
      "yesTags": {
        "predictive-analytics": 1,
        "scikit": 1
      },
      "noTags": {
        "exploratory-data-analysis": 1,
        "jupyter": 1
      }
    },
    "a": {
      "archetypeId": "predictive_modeler",
      "terminalPrompt": "A model with strong cross-validation and lower error than the baseline is a win worth celebrating.",
      "terminalYesTags": {
        "predictive-analytics": 2,
        "scikit": 1,
        "data-science": 1
      },
      "terminalNoTags": {
        "sql": 1,
        "data-analysis": 1
      }
    },
    "b": {
      "archetypeId": "analytical_statistician",
      "terminalPrompt": "Proving with statistical rigor that a treatment worked is more satisfying than any model prediction.",
      "terminalYesTags": {
        "statistical-analysis": 2,
        "exploratory-data-analysis": 1,
        "data-analysis": 1
      },
      "terminalNoTags": {
        "data-science": 1,
        "sql": 1
      }
    }
  }
};

const INFRA_SPLITS = {
  "cloud_infrastructure_engineer": {
    "colour": {
      "axis": "infra_cloud_provisioning_span",
      "prompt": "Availability zones and traffic patterns weigh equally with the tooling you reach for.",
      "yesTags": {
        "multi-cloud": 2,
        "infrastructure": 1
      },
      "noTags": {
        "devops": 2,
        "iac": 1
      }
    },
    "branch": {
      "axis": "infra_cloud_layer",
      "prompt": "When you pick up an infrastructure task, are you writing IaC or designing network topology?",
      "yesTags": {
        "terraform": 1,
        "pulumi": 1,
        "aws": 1
      },
      "noTags": {
        "kubernetes": 1,
        "architecture": 1,
        "distributed-systems": 1
      }
    },
    "a": {
      "archetypeId": "cloud_provisioning_engineer",
      "terminalPrompt": "You can explain why a Terraform workspace structure matters for scaling.",
      "terminalYesTags": {
        "terraform": 2,
        "iac": 1
      },
      "terminalNoTags": {
        "cloud": 1,
        "devops": 1
      }
    },
    "b": {
      "archetypeId": "infrastructure_network_engineer",
      "terminalPrompt": "A zone going dark does not concern you; your architecture absorbs it.",
      "terminalYesTags": {
        "architecture": 2,
        "distributed-systems": 1
      },
      "terminalNoTags": {
        "cloud": 1,
        "infrastructure": 1
      }
    }
  },
  "kubernetes_platform_engineer": {
    "colour": {
      "axis": "infra_platform_abstraction",
      "prompt": "Whether you are managing the cluster itself or what developers build on it, your work is fundamentally about platforms.",
      "yesTags": {
        "platform-engineering": 2,
        "iac": 1
      },
      "noTags": {
        "infrastructure": 2,
        "devops": 1
      }
    },
    "branch": {
      "axis": "infra_k8s_level",
      "prompt": "Does your focus land on keeping the cluster running or on what developers build on top of it?",
      "yesTags": {
        "kubernetes": 1,
        "helm": 1,
        "docker": 1
      },
      "noTags": {
        "platform-engineering": 1,
        "productivity": 1,
        "devtools": 1
      }
    },
    "a": {
      "archetypeId": "kubernetes_cluster_engineer",
      "terminalPrompt": "You know your cluster's resource limits the way a DBA knows their indices.",
      "terminalYesTags": {
        "kubernetes": 2,
        "infrastructure": 1
      },
      "terminalNoTags": {
        "docker": 1,
        "devops": 1
      }
    },
    "b": {
      "archetypeId": "idp_platform_engineer",
      "terminalPrompt": "Developers deploy to production from the CLI without naming a single Kubernetes concept.",
      "terminalYesTags": {
        "platform-engineering": 2,
        "productivity": 1
      },
      "terminalNoTags": {
        "infrastructure": 1,
        "devops": 1
      }
    }
  },
  "observability_engineer": {
    "colour": {
      "axis": "infra_observability_span",
      "prompt": "Real-time dashboards and deep historical forensics are both part of how you think about systems.",
      "yesTags": {
        "observability": 2,
        "monitoring": 1
      },
      "noTags": {
        "sre": 1,
        "distributed-systems": 1
      }
    },
    "branch": {
      "axis": "infra_signal_type",
      "prompt": "Are metrics and traces your natural habitat, or do logs and events tell the stories you care about?",
      "yesTags": {
        "prometheus": 1,
        "opentelemetry": 1,
        "apm": 1
      },
      "noTags": {
        "logging": 1,
        "data-analysis": 1,
        "distributed-systems": 1
      }
    },
    "a": {
      "archetypeId": "metrics_tracing_engineer",
      "terminalPrompt": "Five minutes and a query are enough to find where a service is losing time.",
      "terminalYesTags": {
        "observability": 2,
        "prometheus": 1
      },
      "terminalNoTags": {
        "monitoring": 1,
        "logging": 1
      }
    },
    "b": {
      "archetypeId": "logs_events_engineer",
      "terminalPrompt": "Your logs tell the incident story more truthfully than any dashboard ever could.",
      "terminalYesTags": {
        "logging": 2,
        "data-analysis": 1
      },
      "terminalNoTags": {
        "observability": 1,
        "monitoring": 1
      }
    }
  },
  "incident_reliability_engineer": {
    "colour": {
      "axis": "infra_reliability_balance",
      "prompt": "Preventing incidents and learning from them when they happen are both central to your role.",
      "yesTags": {
        "sre": 2,
        "monitoring": 1
      },
      "noTags": {
        "observability": 1,
        "cloud": 1
      }
    },
    "branch": {
      "axis": "infra_reliability_direction",
      "prompt": "Would you rather design systems that fail gracefully or lead the team through crisis when they do not?",
      "yesTags": {
        "distributed-systems": 1,
        "architecture": 1,
        "cloud-native": 1
      },
      "noTags": {
        "dora": 1,
        "devops": 1,
        "cicd": 1
      }
    },
    "a": {
      "archetypeId": "resilience_engineer",
      "terminalPrompt": "Before scaling a service, you have already written its retry and timeout strategies.",
      "terminalYesTags": {
        "architecture": 2,
        "distributed-systems": 1
      },
      "terminalNoTags": {
        "sre": 1,
        "monitoring": 1
      }
    },
    "b": {
      "archetypeId": "incident_commander_engineer",
      "terminalPrompt": "A retro you ran left the team aligned on what actually failed and what to change.",
      "terminalYesTags": {
        "dora": 2,
        "leadership": 1
      },
      "terminalNoTags": {
        "sre": 1,
        "monitoring": 1
      }
    }
  },
  "application_security_engineer": {
    "colour": {
      "axis": "infra_security_stance",
      "prompt": "Your security mindset blends prevention and discovery, defense and offense, as partners.",
      "yesTags": {
        "appsec": 2,
        "security": 1
      },
      "noTags": {
        "devsecops": 1,
        "vulnerability": 1
      }
    },
    "branch": {
      "axis": "infra_security_timing",
      "prompt": "When you find a vulnerability, did you stop it in the code or uncover it in the live system?",
      "yesTags": {
        "code-security": 1,
        "authentication": 1,
        "cryptography": 1
      },
      "noTags": {
        "pentesting": 1,
        "vulnerability": 1,
        "web-security": 1
      }
    },
    "a": {
      "archetypeId": "defensive_appsec_engineer",
      "terminalPrompt": "You threat-model a feature sketch before you open an IDE.",
      "terminalYesTags": {
        "appsec": 2,
        "code-security": 1
      },
      "terminalNoTags": {
        "security": 1,
        "vulnerability": 1
      }
    },
    "b": {
      "archetypeId": "offensive_security_engineer",
      "terminalPrompt": "You find the edge case that breaks the threat model.",
      "terminalYesTags": {
        "pentesting": 2,
        "vulnerability": 1
      },
      "terminalNoTags": {
        "appsec": 1,
        "security": 1
      }
    }
  },
  "infrastructure_security_engineer": {
    "colour": {
      "axis": "infra_security_scope",
      "prompt": "From artifact signing to key rotation, your security posture is built end to end.",
      "yesTags": {
        "devsecops": 2,
        "security": 1
      },
      "noTags": {
        "compliance": 1,
        "infrastructure": 1
      }
    },
    "branch": {
      "axis": "infra_security_layer",
      "prompt": "Does hardening the build pipeline claim more of your focus than locking down access and secrets?",
      "yesTags": {
        "sbom": 1,
        "cicd": 1,
        "devsecops": 1
      },
      "noTags": {
        "secrets-management": 1,
        "compliance": 1,
        "vulnerability": 1
      }
    },
    "a": {
      "archetypeId": "supply_chain_security_engineer",
      "terminalPrompt": "Every binary in production can be traced back to its source commit and build logs.",
      "terminalYesTags": {
        "sbom": 2,
        "devsecops": 1
      },
      "terminalNoTags": {
        "security": 1,
        "compliance": 1
      }
    },
    "b": {
      "archetypeId": "secrets_compliance_engineer",
      "terminalPrompt": "Your team rotates every secret without a ticket or a Slack conversation.",
      "terminalYesTags": {
        "secrets-management": 2,
        "compliance": 1
      },
      "terminalNoTags": {
        "security": 1,
        "devsecops": 1
      }
    }
  },
  "developer_experience_engineer": {
    "colour": {
      "axis": "infra_dx_metrics",
      "prompt": "Whether you save time in the developer's loop or automate it away in the pipeline, friction reduction is your north star.",
      "yesTags": {
        "devtools": 2,
        "productivity": 1
      },
      "noTags": {
        "cicd": 1,
        "git": 1
      }
    },
    "branch": {
      "axis": "infra_dx_layer",
      "prompt": "Does your work optimise how developers work or how the build pipeline runs at scale?",
      "yesTags": {
        "productivity": 1,
        "vs-code": 1,
        "git": 1
      },
      "noTags": {
        "cicd": 1,
        "devops": 1,
        "testing": 1
      }
    },
    "a": {
      "archetypeId": "developer_workflow_engineer",
      "terminalPrompt": "Your tool turns a five-step manual dance into a single, memorable command.",
      "terminalYesTags": {
        "productivity": 2,
        "git": 1
      },
      "terminalNoTags": {
        "devtools": 1,
        "cli": 1
      }
    },
    "b": {
      "archetypeId": "cicd_automation_engineer",
      "terminalPrompt": "A developer merges; everything else happens without a human decision.",
      "terminalYesTags": {
        "cicd": 2,
        "devops": 1
      },
      "terminalNoTags": {
        "devtools": 1,
        "productivity": 1
      }
    }
  },
  "build_systems_engineer": {
    "colour": {
      "axis": "infra_build_scope",
      "prompt": "The entire chain from language runtime to developer command line is where your expertise flows.",
      "yesTags": {
        "devtools": 2,
        "cli": 1
      },
      "noTags": {
        "open-source": 1,
        "commandline": 1
      }
    },
    "branch": {
      "axis": "infra_build_depth",
      "prompt": "Do you spend more time in compilers and runtimes or shipping CLIs that developers rely on?",
      "yesTags": {
        "rust": 1,
        "go": 1,
        "bun": 1
      },
      "noTags": {
        "commandline": 1,
        "open-source": 1,
        "cicd": 1
      }
    },
    "a": {
      "archetypeId": "compiler_runtime_engineer",
      "terminalPrompt": "You understand the performance cost of the code your compiler generates.",
      "terminalYesTags": {
        "rust": 2,
        "architecture": 1
      },
      "terminalNoTags": {
        "devtools": 1,
        "cli": 1
      }
    },
    "b": {
      "archetypeId": "build_tooling_engineer",
      "terminalPrompt": "Your build tool's help text is the only guide anyone needs.",
      "terminalYesTags": {
        "commandline": 2,
        "devtools": 1
      },
      "terminalNoTags": {
        "cli": 1,
        "open-source": 1
      }
    }
  }
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
  const cloudForkB3 = B(
    'infra_cloud_approach',
    'You’re happiest deep in provider-level infrastructure and IaC.',
    { tags: { terraform: 1, aws: 1, pulumi: 1, 'multi-cloud': 1 }, to: splitLeaf(INFRA_SPLITS.cloud_infrastructure_engineer) },
    { tags: { kubernetes: 1, helm: 1, 'platform-engineering': 1 }, to: splitLeaf(INFRA_SPLITS.kubernetes_platform_engineer) },
  );
  const cloudColorC2 = C(
    'infra_cloud_golden_path',
    'Giving teams a paved road to ship on is a goal you actively design for.',
    { 'platform-engineering': 2, iac: 1 },
    { cloud: 1, devops: 1 },
    cloudForkB3,
  );

  const reliabilityForkB3 = B(
    'infra_reliability_focus',
    'Instrumentation and dashboards are where your day goes, not the pager.',
    { tags: { observability: 1, grafana: 1, apm: 1 }, to: splitLeaf(INFRA_SPLITS.observability_engineer) },
    { tags: { sre: 1, dora: 1 }, to: splitLeaf(INFRA_SPLITS.incident_reliability_engineer) },
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
    'Building and running the platform is your home turf; observability and on-call are the next layer up.',
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

  const securityForkB3 = B(
    'infra_security_focus',
    'When you look for risk, you read the application’s own code first.',
    { tags: { appsec: 1, 'code-security': 1, cryptography: 1 }, to: splitLeaf(INFRA_SPLITS.application_security_engineer) },
    { tags: { devsecops: 1, sbom: 1, 'secrets-management': 1 }, to: splitLeaf(INFRA_SPLITS.infrastructure_security_engineer) },
  );
  const securityColorC2 = C(
    'infra_security_shiftleft',
    'A finding caught in the IDE or a pull request beats one caught in production every time.',
    { devsecops: 2, appsec: 1 },
    { security: 1, vulnerability: 1 },
    securityForkB3,
  );

  const devtoolsForkB3 = B(
    'infra_devtools_focus',
    'You measure your impact in the daily friction you remove for other engineers.',
    { tags: { productivity: 1, git: 1, 'vs-code': 1 }, to: splitLeaf(INFRA_SPLITS.developer_experience_engineer) },
    { tags: { rust: 1, go: 1, bun: 1 }, to: splitLeaf(INFRA_SPLITS.build_systems_engineer) },
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
  const opsColorC0b = C(
    'infra_toil',
    'Automating away repetitive toil is a goal you actively chase.',
    { devops: 1, productivity: 1 },
    { infrastructure: 1, cloud: 1 },
    opsB1,
  );
  return C(
    'infra_iac_default',
    'Infrastructure as code is simply how your team runs everything.',
    { iac: 2, devops: 1 },
    { infrastructure: 2, cloud: 1 },
    opsColorC0b,
  );
})();

// ==========================================================================
// DATA — root qd1.
// ==========================================================================
const dataRoot = (() => {
  const mlForkB3 = B(
    'data_ml_focus',
    'You love digging into a model’s internals — its layers, attention, and gradients.',
    { tags: { 'deep-learning': 1, pytorch: 1, cuda: 1 }, to: splitLeaf(DATA_SPLITS.ml_training_engineer) },
    { tags: { mlops: 1, huggingface: 1 }, to: splitLeaf(DATA_SPLITS.mlops_engineer) },
  );
  const mlColorC2 = C(
    'data_ml_tooling',
    'A framework like PyTorch or TensorFlow is installed and in use on your machine.',
    { pytorch: 2, tensorflow: 1 },
    { 'machine-learning': 1, python: 1 },
    mlForkB3,
  );

  const llmForkB3 = B(
    'data_llm_focus',
    'The product layer — prompts, tools, and agent behaviour — is where you spend your time.',
    { tags: { llm: 1, 'prompt-engineering': 1, langchain: 1 }, to: splitLeaf(DATA_SPLITS.llm_app_engineer) },
    { tags: { rag: 1, 'vector-search': 1, embeddings: 1 }, to: splitLeaf(DATA_SPLITS.rag_retrieval_engineer) },
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

  const deForkB3 = B(
    'data_eng_focus',
    'Events stream into your systems and you process them the moment they land.',
    { tags: { 'data-streaming': 1, 'apache-kafka': 1, 'change-data-capture': 1 }, to: splitLeaf(DATA_SPLITS.streaming_data_engineer) },
    { tags: { 'apache-spark': 1, 'apache-airflow': 1, 'apache-iceberg': 1 }, to: splitLeaf(DATA_SPLITS.batch_data_engineer) },
  );
  const deColorC2 = C(
    'data_eng_reliability',
    'You carry a pager for your pipelines, just like a backend engineer does for services.',
    { 'data-engineering': 2, 'data-quality': 1 },
    { etl: 1, 'big-data': 1 },
    deForkB3,
  );

  const analyticsForkB3 = B(
    'data_analytics_focus',
    'You’d reach for a BI tool and a clean data model before a notebook of statistics.',
    { tags: { bi: 1, 'data-visualization': 1, duckdb: 1 }, to: splitLeaf(DATA_SPLITS.analytics_bi_engineer) },
    { tags: { 'statistical-analysis': 1, 'exploratory-data-analysis': 1, jupyter: 1 }, to: splitLeaf(DATA_SPLITS.data_science_analyst) },
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
  const dataColorC0b = C(
    'data_reproducibility',
    'A result you can’t reproduce isn’t finished, as far as you’re concerned.',
    { 'data-engineering': 1, 'data-quality': 1 },
    { 'data-science': 1, python: 1 },
    modelsB1,
  );
  return C(
    'data_python_default',
    'Python is where you live for most of your work.',
    { python: 2 },
    { sql: 2 },
    dataColorC0b,
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

// --- Archetypes (48 sub-personas) ------------------------------------------
const ARCHETYPES = [
  { id: 'design_systems_engineer', name: 'Design Systems Engineer', headline: 'Tokens, components, and the contracts between them', description: 'Your feed runs on component libraries, design tokens, and the API design of UI itself. You treat a well-documented component like a public interface.', keyTags: ['design-systems', 'frontend', 'react', 'css', 'storybook', 'typescript', 'ui', 'web-components', 'styled-components', 'tailwind-css'] },
  { id: 'accessibility_engineer', name: 'Accessibility Engineer', headline: 'Interfaces everyone can actually use', description: 'Your feed mixes ARIA patterns, inclusive UX, and the CSS to back them. A failed audit reads as a bug to you, not a nice-to-have.', keyTags: ['accessibility', 'frontend', 'css', 'ui', 'ui-ux', 'ui-design', 'web-components', 'react', 'typography', 'user-testing'] },
  { id: 'rendering_performance_engineer', name: 'Rendering Performance Engineer', headline: 'Frames, paints, and the cost of hydration', description: 'Your feed surfaces Core Web Vitals, rendering strategies, and when not to ship JavaScript at all.', keyTags: ['performance', 'lighthouse', 'nextjs', 'react', 'javascript', 'web-development', 'pwa', 'webassembly', 'frontend', 'vite'] },
  { id: 'build_performance_engineer', name: 'Build Performance Engineer', headline: 'Fast builds, lean bundles, happy CI', description: 'Your feed covers bundlers, tree-shaking, and shaving seconds off every install and deploy.', keyTags: ['performance', 'webpack', 'vite', 'bun', 'javascript', 'typescript', 'frontend', 'web-development', 'cicd', 'devtools'] },
  { id: 'native_mobile_engineer', name: 'Native Mobile Engineer', headline: 'Platform-native, down to the gesture', description: 'Your feed covers Swift, Kotlin, and the platform APIs that make an app feel at home on the device.', keyTags: ['ios', 'android', 'swift', 'kotlin', 'swiftui', 'jetpack-compose', 'mobile', 'mobile-dev', 'android-development'] },
  { id: 'cross_platform_mobile_engineer', name: 'Cross-Platform Mobile Engineer', headline: 'One codebase, two app stores', description: 'Your feed blends React Native, Flutter, and the trade-offs of shipping everywhere at once.', keyTags: ['react-native', 'flutter', 'expo', 'mobile', 'mobile-dev', 'typescript', 'ios', 'android', 'javascript'] },
  { id: 'product_fullstack_engineer', name: 'Product Full-Stack Engineer', headline: 'Whole features, database to deploy', description: 'Your feed blends frontend frameworks, APIs, and deploys. You like owning a feature end to end.', keyTags: ['nextjs', 'react', 'typescript', 'nodejs', 'vercel', 'serverless', 'rest-api', 'supabase', 'backend'] },
  { id: 'api_fullstack_engineer', name: 'API & Data-Layer Engineer', headline: 'The contract the whole product leans on', description: 'Your feed covers GraphQL and REST API design, Postgres schemas, and the data layer behind the UI. You sweat the shape of every payload.', keyTags: ['graphql', 'rest-api', 'postgresql', 'prisma', 'nodejs', 'typescript', 'backend', 'openapi', 'api'] },

  {"id": "ml_research_engineer", "name": "ML Research Engineer", "headline": "Pushing the boundaries of what models can learn", "description": "You're at the frontier of machine learning, exploring new architectures and training techniques. Publishing novel research excites you as much as any ship.", "keyTags": ["deep-learning", "transformers", "neural-networks", "machine-learning", "ai", "python", "jupyter", "scikit"]},
  {"id": "ml_training_engineer", "name": "ML Training Engineer", "headline": "Where architectures and benchmarks meet", "description": "Your feed covers model training, neural architectures, and the math behind the benchmark scores.", "keyTags": ["machine-learning", "pytorch", "tensorflow", "cuda", "deep-learning", "neural-networks", "python", "mlops"]},
  {"id": "mlops_evaluation_engineer", "name": "ML Evaluation Engineer", "headline": "Testing models like you test code", "description": "You treat model validation with the rigor of software testing, building benchmarks and metrics that prove a model is ready to ship.", "keyTags": ["machine-learning", "mlops", "deep-learning", "data-science", "python", "pytorch", "huggingface", "cicd", "data-engineering"]},
  {"id": "mlops_engineer", "name": "MLOps Engineer", "headline": "Getting models out of notebooks and into production", "description": "Your feed mixes serving, evaluation, and the pipelines that keep a model healthy in prod.", "keyTags": ["mlops", "machine-learning", "python", "huggingface", "pytorch", "llmops", "deep-learning", "cicd", "data-engineering"]},
  {"id": "llm_agentic_engineer", "name": "Agentic Systems Engineer", "headline": "Building AI that acts, not just talks", "description": "You architect multi-step LLM workflows with tool calling, memory, and decision logic. Your focus is on agent behaviour and system composition.", "keyTags": ["llm", "langchain", "semantic-kernel", "llmops", "genai", "ai", "anthropic", "vector-search"]},
  {"id": "llm_prompt_engineer", "name": "LLM Prompt Engineer", "headline": "Coaxing the right output through language", "description": "You excel at prompt design, few-shot examples, and instruction engineering. The craft of exact phrasing gets the best responses out of models.", "keyTags": ["prompt-engineering", "llm", "openai", "anthropic", "genai", "ai", "semantic-kernel"]},
  {"id": "rag_ingestion_engineer", "name": "RAG Data Pipeline Engineer", "headline": "Answers grounded in current, relevant context", "description": "You build data pipelines that feed LLMs with fresh, relevant context. Your focus is on chunking strategies, document processing, and keeping retrieval data current.", "keyTags": ["rag", "embeddings", "llm", "vector-search", "data-engineering", "genai", "langchain", "openai", "semantic-kernel"]},
  {"id": "rag_vector_engineer", "name": "Vector Search Engineer", "headline": "Finding signal in embedding space", "description": "You optimize vector databases and similarity search for speed and recall. The algebra of embeddings and ranking strategies is your domain.", "keyTags": ["vector-search", "rag", "embeddings", "llm", "genai", "langchain", "openai", "semantic-kernel", "ai"]},
  {"id": "streaming_ingestion_engineer", "name": "CDC & Integration Engineer", "headline": "Every change from every source system, reliably", "description": "You design CDC pipelines and source connectors that reliably ingest operational data in real time. Source system integration and reliability are your obsession.", "keyTags": ["data-engineering", "apache-kafka", "change-data-capture", "data-streaming", "etl", "real-time-analytics", "big-data", "data-quality", "python"]},
  {"id": "streaming_processor_engineer", "name": "Stream Processing Engineer", "headline": "Computing answers from infinite data", "description": "You write Flink jobs and stream transformations that aggregate, enrich, and join events as they flow. Stream topology and windowing strategy consume your focus.", "keyTags": ["data-streaming", "apache-flink", "apache-kafka", "data-engineering", "real-time-analytics", "etl", "big-data", "data-quality", "python"]},
  {"id": "lakehouse_engineer", "name": "Lakehouse & Open Format Engineer", "headline": "Data lakes that govern themselves", "description": "You build on open table formats like Iceberg and Delta, designing lakes with warehouse semantics. Schema evolution, time travel, and data governance are your tools.", "keyTags": ["data-engineering", "apache-spark", "apache-iceberg", "data-warehouse", "big-data", "etl", "databricks", "python", "data-quality"]},
  {"id": "warehouse_modeler_engineer", "name": "Warehouse Architect & Modeler", "headline": "Structured data and clean dimensional models", "description": "You design fact and dimension tables in Snowflake or Databricks, optimizing for query performance and business semantics. Modeling discipline is your craft.", "keyTags": ["data-engineering", "snowflake", "databricks", "data-warehouse", "apache-spark", "apache-airflow", "big-data", "etl", "sql"]},
  {"id": "metrics_platform_engineer", "name": "Metrics & Semantics Engineer", "headline": "One definition of truth across your org", "description": "You architect semantic layers and metric platforms so every team uses the same trusted definitions. Governance and consistency drive your work.", "keyTags": ["sql", "analytics-platforms", "data-warehouse", "duckdb", "data-engineering", "data-quality", "real-time-analytics", "bi"]},
  {"id": "bi_visualization_engineer", "name": "BI & Analytics Designer", "headline": "Data insights through intuitive visuals", "description": "You craft interactive dashboards and reports that let non-technical users discover insights. Design and usability shape your analytics practice.", "keyTags": ["data-visualization", "bi", "analytics-platforms", "data-analysis", "sql", "exploratory-data-analysis", "real-time-analytics", "duckdb"]},
  {"id": "predictive_modeler", "name": "Predictive Analytics Specialist", "headline": "Forecasting futures with statistical models", "description": "You build regression, classification, and time-series models that forecast outcomes. Feature engineering, model selection, and cross-validation are your daily work.", "keyTags": ["data-science", "predictive-analytics", "python", "jupyter", "scikit", "data-analysis", "exploratory-data-analysis", "statistical-analysis", "machine-learning"]},
  {"id": "analytical_statistician", "name": "Analytical Statistician", "headline": "Drawing defensible conclusions from data", "description": "You conduct hypothesis tests, construct confidence intervals, and model causality to understand what drives outcomes. Statistical rigor is your foundation.", "keyTags": ["statistical-analysis", "data-analysis", "data-science", "exploratory-data-analysis", "python", "jupyter", "sql", "predictive-analytics", "scikit"]},
  {"id": "cloud_provisioning_engineer", "name": "Cloud Provisioning Engineer", "headline": "Infrastructure is code; every state is versioned", "description": "Your feed covers state management, drift detection, and the IaC that engineers apply without tickets. Terraform feels like versioning your database schema.", "keyTags": ["terraform", "aws", "gcp", "azure", "iac", "cloud", "pulumi", "infrastructure", "devops", "multi-cloud"]},
  {"id": "infrastructure_network_engineer", "name": "Infrastructure Network Engineer", "headline": "Topology, connectivity, and blast radius", "description": "Your feed runs on networking primitives, load balancer strategies, and how traffic flows across failure domains. You design VPCs, subnets, and failover patterns before they are needed.", "keyTags": ["infrastructure", "distributed-systems", "cloud", "architecture", "aws", "gcp", "docker", "cloud-native", "devops"]},
  {"id": "kubernetes_cluster_engineer", "name": "Kubernetes Cluster Engineer", "headline": "K8s upgrades, etcd backups, cluster health", "description": "Your feed surfaces node pools, CNI plugins, version upgrades, and the substrate tuning that keeps a cluster reliable. You are the person who ensures the orchestrator itself runs well.", "keyTags": ["kubernetes", "helm", "docker", "cloud-native", "infrastructure", "devops", "iac", "distributed-systems", "monitoring"]},
  {"id": "idp_platform_engineer", "name": "Internal Developer Platform Engineer", "headline": "Abstracting infrastructure so developers do not have to think about it", "description": "Your feed covers self-service deployments, paved roads, and the guardrails that let teams ship without ops. You hide complexity inside service and developer joy.", "keyTags": ["platform-engineering", "productivity", "devtools", "iac", "kubernetes", "cloud-native", "infrastructure", "cicd", "open-source"]},
  {"id": "metrics_tracing_engineer", "name": "Metrics & Tracing Engineer", "headline": "Real-time signals flowing through your dashboards", "description": "Your feed surfaces Prometheus scrapes, distributed trace architectures, and the cardinality decisions that surprise you. You instrument systems so you can understand them in real time.", "keyTags": ["observability", "prometheus", "opentelemetry", "monitoring", "apm", "grafana", "distributed-systems", "cloud-native", "architecture"]},
  {"id": "logs_events_engineer", "name": "Logs & Events Engineer", "headline": "Structured events that reconstruct what actually happened", "description": "Your feed runs on logging pipelines, event correlation, and the forensics that explain 3am production drama. Logs are your primary debugger and witness.", "keyTags": ["logging", "observability", "distributed-systems", "data-analysis", "monitoring", "devops", "infrastructure", "cloud-native", "data-engineering"]},
  {"id": "resilience_engineer", "name": "Resilience Engineer", "headline": "Systems that degrade gracefully and self-heal", "description": "Your feed covers chaos engineering, bulkheads, retries, and the timeout logic that saves you. Failure is a first-class design concern, not an afterthought.", "keyTags": ["sre", "distributed-systems", "architecture", "cloud-native", "observability", "monitoring", "devops", "kubernetes", "infrastructure"]},
  {"id": "incident_commander_engineer", "name": "Incident Commander Engineer", "headline": "Coordinating response, owning the retro", "description": "Your feed covers blameless post-mortems, DORA metric tracking, and the runbooks that guide teams through outages. You own the learning loop after something breaks.", "keyTags": ["sre", "dora", "devops", "cicd", "monitoring", "leadership", "distributed-systems", "observability", "cloud"]},
  {"id": "defensive_appsec_engineer", "name": "Defensive AppSec Engineer", "headline": "Catching vulnerabilities before they reach prod", "description": "Your feed covers SAST, dependency audits, and the threat models that guide architecture decisions. Security starts in pull requests, not in the incident room.", "keyTags": ["appsec", "code-security", "authentication", "cryptography", "security", "devsecops", "vulnerability", "web-security", "cicd"]},
  {"id": "offensive_security_engineer", "name": "Offensive Security Engineer", "headline": "Finding what the defense missed", "description": "Your feed covers penetration testing, exploitation chains, and the attack vectors that prove systems are fallible. You think and act like the person trying to break in.", "keyTags": ["pentesting", "vulnerability", "web-security", "appsec", "security", "zero-day", "cryptography", "authentication", "code-security"]},
  {"id": "supply_chain_security_engineer", "name": "Supply Chain Security Engineer", "headline": "Every artifact signed, traced, and provenance-checked", "description": "Your feed surfaces SLSA levels, artifact attestations, and the build pinning that stops supply-chain attacks. You own and harden the entire pipeline from commit to production.", "keyTags": ["devsecops", "sbom", "cicd", "zero-day", "security", "infrastructure", "compliance", "vulnerability", "devops"]},
  {"id": "secrets_compliance_engineer", "name": "Secrets & Compliance Engineer", "headline": "Zero trust access, automatic secret rotation, clean audits", "description": "Your feed covers secrets management, zero-trust policies, and compliance that auditors find flawless. You bind identity to access and proof to change.", "keyTags": ["secrets-management", "compliance", "security", "devsecops", "zero-day", "authentication", "vulnerability", "infrastructure", "devops"]},
  {"id": "developer_workflow_engineer", "name": "Developer Workflow Engineer", "headline": "Every keystroke counts; eliminate friction", "description": "Your feed covers IDE extensions, shell aliases, and git hooks that protect engineers from themselves. The human-in-the-loop is where you optimise.", "keyTags": ["devtools", "productivity", "git", "vs-code", "cli", "open-source", "testing", "commandline", "code-review"]},
  {"id": "cicd_automation_engineer", "name": "CI/CD Automation Engineer", "headline": "The pipeline that runs without human input", "description": "Your feed runs on GitHub Actions, GitLab CI, and the automation that scales to thousands of merges a day. The machine does the tireless work.", "keyTags": ["cicd", "devops", "devtools", "testing", "git", "infrastructure", "kubernetes", "cloud-native", "open-source"]},
  {"id": "compiler_runtime_engineer", "name": "Compiler & Runtime Engineer", "headline": "Optimising the machinery that optimises code", "description": "Your feed covers ASTs, intermediate representations, and code generation that turns intent into instructions. You build the foundation others build upon.", "keyTags": ["devtools", "rust", "go", "bun", "cli", "open-source", "cicd", "commandline", "architecture"]},
  {"id": "build_tooling_engineer", "name": "Build Tooling Engineer", "headline": "The CLI developers run a thousand times daily", "description": "Your feed covers Bazel, task runners, and the build systems that scale to massive codebases. You are the bridge between engineers and compilers.", "keyTags": ["cli", "devtools", "commandline", "open-source", "cicd", "devops", "testing", "git", "architecture"]},

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
