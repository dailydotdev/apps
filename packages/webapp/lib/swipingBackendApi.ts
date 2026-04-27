const BASE =
  process.env.NEXT_PUBLIC_SWIPING_BACKEND_URL || 'http://localhost:8000';

export interface PostSummary {
  post_id: string;
  title: string;
  summary: string;
  tags: string[];
}

export interface DiscoverPostsRequest {
  prompt?: string;
  selected_tags?: string[];
  confirmed_tags?: string[];
  liked_titles?: string[];
  exclude_ids?: string[];
  saturated_tags?: string[];
  n?: number;
}

export interface DiscoverPostsResponse {
  posts: PostSummary[];
  sub_prompts: string[];
}

export async function discoverPosts(
  req: DiscoverPostsRequest,
): Promise<DiscoverPostsResponse> {
  const res = await fetch(`${BASE}/api/discover-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: req.prompt ?? '',
      selected_tags: req.selected_tags ?? [],
      confirmed_tags: req.confirmed_tags ?? [],
      liked_titles: req.liked_titles ?? [],
      exclude_ids: req.exclude_ids ?? [],
      saturated_tags: req.saturated_tags ?? [],
      n: req.n ?? 8,
    }),
  });
  return res.json();
}

export async function extractTags(prompt: string): Promise<string[]> {
  const res = await fetch(`${BASE}/api/extract-tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.tags;
}

export async function fetchAllTags(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/tags`);
  return res.json();
}
