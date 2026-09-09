#!/usr/bin/env python3
"""Resolve a daily.dev article into everything a // TL;DR reel needs.

    python3 fetch_article.py <url|slug|postId> [--out bundle.json]

Talks to the public API with no auth. Prints a human summary and writes a JSON
bundle: the post fields, the Happening Now headline if the post has one, and a
scored list of candidate background images from the post's own tags.
"""
import json, re, subprocess, sys, urllib.parse
from concurrent.futures import ThreadPoolExecutor

API = "https://api.daily.dev/graphql"

POST_Q = """query Post($id: ID!) { post(id: $id) {
  id title summary image readTime tags numUpvotes numComments views createdAt
  trending commentsPermalink creatorTwitter
  source { name handle image }
} }"""

HEADLINES_Q = """query MajorHeadlines($first: Int) { majorHeadlines(first: $first) {
  edges { node { id headline significance highlightedAt channel post { id } } } } }"""

TAGFEED_Q = """query TagFeed($tag: String!, $first: Int, $ranking: Ranking) {
  page: tagFeed(tag: $tag, first: $first, ranking: $ranking) {
    edges { node { id title image source { name handle } } } } }"""


def gql(query, variables):
    body = json.dumps({"query": query, "variables": variables})
    out = subprocess.run(
        ["curl", "-s", "-m", "30", "-X", "POST", API,
         "-H", "Content-Type: application/json", "--data", body],
        capture_output=True, text=True).stdout
    d = json.loads(out)
    if d.get("errors"):
        raise SystemExit("API error: " + d["errors"][0]["message"])
    return d["data"]


def post_ref(arg):
    """Accepts a full URL, a slug, or a raw post id.

    post(id:) resolves the full URL slug as well as the id, so pasting a link
    works. Note ids are CASE SENSITIVE: va5uoAWAC resolves, va5uoawac 404s.
    """
    if arg.startswith("http"):
        path = urllib.parse.urlparse(arg).path
        return path.rstrip("/").split("/")[-1]
    return arg


def head_dims(url):
    """Real pixel size, from the CDN's own server-timing header."""
    out = subprocess.run(["curl", "-sI", "-m", "12", url], capture_output=True, text=True).stdout
    m = re.search(r'content-info;desc="([^"]+)"', out)
    if not m:
        return (0, 0)
    d = dict(kv.split("=") for kv in m.group(1).split(",") if "=" in kv)
    return (int(d.get("width") or 0), int(d.get("height") or 0))


def candidates(tags, exclude_id):
    pool = {}
    jobs = [(t, r) for t in tags for r in ("POPULARITY", "TIME")]

    def one(job):
        tag, ranking = job
        try:
            d = gql(TAGFEED_Q, {"tag": tag, "first": 50, "ranking": ranking})
        except SystemExit:
            return tag, []
        return tag, [e["node"] for e in d["page"]["edges"]]

    with ThreadPoolExecutor(max_workers=8) as ex:
        for tag, nodes in ex.map(one, jobs):
            for n in nodes:
                img = n.get("image") or ""
                # placeholder covers are a shared stock asset, never usable
                if not img or "Placeholder" in img or n["id"] == exclude_id:
                    continue
                n.setdefault("tag", tag)
                pool.setdefault(n["id"], n)

    items = list(pool.values())
    with ThreadPoolExecutor(max_workers=16) as ex:
        dims = list(ex.map(lambda n: head_dims(n["image"]), items))
    out = []
    for n, (w, h) in zip(items, dims):
        if not w or not h:
            continue
        # a full-bleed 9:16 crop keeps only (h*9/16)/w of the width
        keep = min(1.0, (h * 9 / 16) / w)
        out.append({"id": n["id"], "title": n["title"], "image": n["image"],
                    "source": n["source"]["name"], "tag": n["tag"],
                    "width": w, "height": h, "crop_keep": round(keep, 3)})
    out.sort(key=lambda c: -c["crop_keep"])
    return out


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    ref = post_ref(sys.argv[1])
    post = gql(POST_Q, {"id": ref})["post"]
    if not post:
        raise SystemExit(f"no post for {ref!r} — check case, ids are case sensitive")

    hl = None
    for e in gql(HEADLINES_Q, {"first": 50})["majorHeadlines"]["edges"]:
        n = e["node"]
        if (n.get("post") or {}).get("id") == post["id"]:
            hl = {k: n[k] for k in ("headline", "significance", "highlightedAt", "channel")}
            break

    cands = candidates(post["tags"] or [], post["id"])
    own_source = (post["source"] or {}).get("handle") in ("trends", "collections")

    bundle = {
        "post": post,
        "highlight": hl,
        "flags": {
            "has_cover": bool(post.get("image")) and "Placeholder" not in (post.get("image") or ""),
            "source_is_dailydev": own_source,
            "has_editorial_headline": bool(hl),
            "creator_twitter": post.get("creatorTwitter"),
        },
        "image_candidates": cands,
    }
    out = "bundle.json"
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    with open(out, "w") as f:
        json.dump(bundle, f, indent=1)

    p = post
    print(f"id            {p['id']}")
    print(f"title         {p['title']}")
    print(f"headline      {hl['headline'] if hl else '(not a Happening Now highlight)'}")
    print(f"significance  {hl['significance'] if hl else '-'}")
    print(f"source        {(p['source'] or {}).get('name')}"
          f"{'   << daily.dev own aggregation: no publisher credit' if own_source else ''}")
    print(f"cover         {'yes' if bundle['flags']['has_cover'] else 'NONE — every frame must be retrieved'}")
    print(f"tags          {', '.join(p['tags'] or [])}")
    print(f"readTime      {p['readTime']}   upvotes {p['numUpvotes']}   trending {p['trending']}")
    print(f"candidates    {len(cands)} images; {sum(1 for c in cands if c['crop_keep'] >= 0.55)} "
          f"survive a full-bleed crop well")
    print(f"\nsummary\n{p['summary']}")
    print(f"\nwrote {out}")


if __name__ == "__main__":
    main()
