import type { AdvertiserCampaign } from '../../types';
import { googleCloudLogoDataUri } from './logo';
import {
  bigQueryImage,
  cloudComputeImage,
  cloudRunImage,
  cloudSqlImage,
  geminiImage,
  genericGcpImage,
} from './images';

// UTM strings are copied verbatim from the campaign asset tracker
// (EXT - Daily.Dev Asset Tracker.xlsx). Ad-server macros like `%epid!` /
// `{device}` are intentionally left unresolved — that mirrors what the ad
// server receives.
const utm = (campaign: string): string =>
  `utm_source=DailyDev&utm_medium=display&utm_campaign=Cloud-SS-DR-GCP-1713658-GCP-DR-NA-US-en-DailyDev-Display-Banner-All-%epid!-%ecid!-${campaign}&utm_content={device}-{adgroupid}-{network}-{targetid}-{loc_physical_ms}-{campaignid}`;

// Google Cloud campaign: 6 products × 2 headline versions from the tracker.
// Add a new advertiser by copying this file's shape into a sibling campaign
// folder and registering it in ../../registry.ts.
export const googleCloudCampaign: AdvertiserCampaign = {
  id: 'google-cloud',
  brand: {
    name: 'Google Cloud',
    logo: googleCloudLogoDataUri,
  },
  placements: [
    {
      id: 'google-cloud/generic-gcp-v1',
      product: 'Generic GCP',
      headline: '$300 Free Credits to Build on Google Cloud',
      image: genericGcpImage,
      landingPage: 'https://cloud.google.com/free',
      utm: utm('GenericGCP'),
      tags: ['cloud', 'google-cloud', 'devops'],
    },
    {
      id: 'google-cloud/generic-gcp-v2',
      product: 'Generic GCP',
      headline: '$300 Free Credits for Your Google Cloud Projects',
      image: genericGcpImage,
      landingPage: 'https://cloud.google.com/free',
      utm: utm('GenericGCP'),
      tags: ['cloud', 'google-cloud', 'devops'],
    },
    {
      id: 'google-cloud/gemini-agent-platform-v1',
      product: 'Gemini Enterprise Agent Platform',
      headline: 'Build Agents and Models on One Platform',
      image: geminiImage,
      landingPage:
        'https://cloud.google.com/products/gemini-enterprise-agent-platform',
      utm: utm('AIEngineers'),
      tags: ['ai', 'agents', 'machine-learning'],
    },
    {
      id: 'google-cloud/gemini-agent-platform-v2',
      product: 'Gemini Enterprise Agent Platform',
      headline: 'Ship Agents Faster',
      image: geminiImage,
      landingPage:
        'https://cloud.google.com/products/gemini-enterprise-agent-platform',
      utm: utm('AIEngineers'),
      tags: ['ai', 'agents', 'machine-learning'],
    },
    {
      id: 'google-cloud/cloud-run-v1',
      product: 'Cloud Run',
      headline: 'Go from Code to Production URL in Seconds',
      image: cloudRunImage,
      landingPage: 'https://cloud.google.com/run',
      utm: utm('Web&Dev-CloudRun'),
      tags: ['serverless', 'devops', 'containers'],
    },
    {
      id: 'google-cloud/cloud-run-v2',
      product: 'Cloud Run',
      headline: 'Host LLMs in Production With On-Demand GPUs',
      image: cloudRunImage,
      landingPage: 'https://cloud.google.com/run',
      utm: utm('Web&Dev-CloudRun'),
      tags: ['serverless', 'gpu', 'ai'],
    },
    {
      id: 'google-cloud/cloud-compute-v1',
      product: 'Cloud Compute',
      headline: 'Custom VMs From 1 to 96 vCPUs With 99.95% Uptime',
      image: cloudComputeImage,
      landingPage: 'https://cloud.google.com/compute',
      utm: utm('Web&Dev-CloudCompute'),
      tags: ['cloud', 'infrastructure', 'vm'],
    },
    {
      id: 'google-cloud/cloud-compute-v2',
      product: 'Cloud Compute',
      headline: 'Save Up to 91% on Cloud Compute With Spot VMs',
      image: cloudComputeImage,
      landingPage: 'https://cloud.google.com/compute',
      utm: utm('Web&Dev-CloudCompute'),
      tags: ['cloud', 'infrastructure', 'vm'],
    },
    {
      id: 'google-cloud/cloud-sql-v1',
      product: 'Cloud SQL',
      headline: 'Fully Managed MySQL, PostgreSQL, and SQL Server',
      image: cloudSqlImage,
      landingPage: 'https://cloud.google.com/sql',
      utm: utm('Web&Dev-CloudSQL'),
      tags: ['databases', 'sql', 'postgres'],
    },
    {
      id: 'google-cloud/cloud-sql-v2',
      product: 'Cloud SQL',
      headline: '99.99% Uptime for MySQL and PostgreSQL Databases',
      image: cloudSqlImage,
      landingPage: 'https://cloud.google.com/sql',
      utm: utm('Web&Dev-CloudSQL'),
      tags: ['databases', 'sql', 'postgres'],
    },
    {
      id: 'google-cloud/bigquery-v1',
      product: 'BigQuery',
      headline: 'Train ML Models With SQL You Already Know',
      image: bigQueryImage,
      landingPage: 'https://cloud.google.com/bigquery',
      utm: utm('AIPractitioners'),
      tags: ['data', 'analytics', 'sql'],
    },
    {
      id: 'google-cloud/bigquery-v2',
      product: 'BigQuery',
      headline: 'Cut Data Warehouse Costs by 54%',
      image: bigQueryImage,
      landingPage: 'https://cloud.google.com/bigquery',
      utm: utm('AIPractitioners'),
      tags: ['data', 'analytics', 'sql'],
    },
  ],
};
