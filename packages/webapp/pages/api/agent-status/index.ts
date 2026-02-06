import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory store — persists across requests within the same dev server process
let agentStatusStore: Record<string, unknown>[] = [];
let lastUpdated = 0;

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
  // Allow cross-origin for hooks running from terminal
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { agents } = req.body || {};

      if (!Array.isArray(agents)) {
        res.status(400).json({ error: 'agents array required' });
        return;
      }

      agentStatusStore = agents;
      lastUpdated = Date.now();
      res.status(200).json({ status: 'ok' });
      return;
    }

    if (req.method === 'GET') {
      // Expire after 2 minutes of no updates
      if (lastUpdated && Date.now() - lastUpdated > 120_000) {
        agentStatusStore = [];
      }

      res.status(200).json({ agentStatus: agentStatusStore });
      return;
    }

    res.status(405).json({ error: 'method not allowed' });
  } catch {
    res.status(500).json({ error: 'internal server error' });
  }
};

export default handler;
