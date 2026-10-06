# Agent picks in the main feed

Internal design prototype for surfacing posts found by configured agents in the
main feed. The default **Blended feed** adds a magic icon, a purple label and
border, the agent name, and an expandable explanation of why the post matched.
**Agent roundup** explores grouping those picks in one compact feed section.

Open `index.html` in a modern browser, or serve this directory:

```sh
python3 -m http.server 8766 --directory docs/mockups/agent-main-feed
```

Then open <http://localhost:8766>.

Try the design selector, Include agent picks, per-agent feed preferences,
Why this?, bookmarks, and upvotes. Preferences apply to both designs;
bookmark and upvote feedback is local to each design. All state resets on reload.

All posts, match explanations, counts, and agent statuses are illustrative.
There are no API calls, analytics, authentication, external assets, or production
route changes. Icons are copied from the shared icon sources. Styles are local
to this standalone mock, with light and dark appearance and a responsive grid.

This PR explores presentation only. Real feed ranking, deduplication, backend
agent attribution, and saved delivery preferences remain implementation work.
