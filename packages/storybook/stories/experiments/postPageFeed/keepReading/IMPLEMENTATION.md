# Keep reading: implementation guide

A feed under the post page, after the comments, for signed-in readers, behind a GrowthBook flag. This file is the source of truth for building it in production. Storybook (`Experiments / Post page feed / Keep reading (A)`) shows every case it describes; the table at the end maps each requirement to the story that shows it.

Paths are from the repository root. `shared` is `packages/shared/src`, `webapp` is `packages/webapp`.

## What ships

- A feed after the comments on the post page: tabs, then production list cards, paging as the reader scrolls.
- Behind a new flag, `post_page_feed`, default `false`.
- **Signed-in readers only.** Signed-out readers keep today's page (comments and the sticky sign-up footer) and never enter the experiment: the flag is evaluated only when a reader is signed in.
- The post page only. Not the post modal, not the reader pane, not History's post pane.
- Every post type the post page renders with comments: article, video, share, freeform, poll, collection, X post. Not briefs, not digests.

## Behaviour

### Tabs

| Tab     | Shows                                                   | Query                                                                                                                                                                                       | Ends?                              |
| ------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| For you | The reader's own For you feed, the one on the home page | `FEED_QUERY` (or `FEED_V2_QUERY`, as `MainFeedLayout` picks for signed-in readers) with the home feed's variables                                                                           | Never: it pages like the home feed |
| `#tag`  | One tab for each of the post's first 3 tags             | `TAG_FEED_QUERY` with `{ tag, ranking: RankingAlgorithm.Popularity, supportedTypes }` (the tag page uses `Time`; popularity reads better under a post, confirm with the experiment's owner) | Yes, when the tag runs out         |
| Source  | More from the post's source                             | `SOURCE_FEED_QUERY` with `{ source: post.source.id, ranking: RankingAlgorithm.Time, supportedTypes }`, as the source page                                                                   | Yes                                |

- Order: For you, the tags in the post's order, the source.
- The source tab is hidden when the source has nothing else to show (a guaranteed empty tab is a dead click): if the source query comes back empty, hide the tab.
- A post with only one tab (no tags, no source tab) shows no tab row: the list starts right after the comments.
- Every tab excludes the current post: pass `excludedPostIds={[post.id]}` to `Feed`.
- The active tab is local state. It resets to For you when the post changes (the page remounts per post).
- No visible title. The tabs say what the list is, as on the home feed. The section keeps a screen-reader heading: `<h2 className="sr-only">Keep reading</h2>`, and the section is `aria-labelledby` it.

### Paging, end, empty, error

- Paging: `Feed`'s own infinite scroll (`useFeedInfiniteScroll`), 7 posts a page (`Feed`'s default without a `FeedLayoutProvider`).
- Loading: `Feed`'s placeholders (`PlaceholderList` rows).
- End of a tag or source tab: `Feed` has no hook for its end today. Add an optional `footer?: ReactNode` prop to `Feed`, rendered after the cards when `!canFetchMore && !isFetching` (next to `trackFinishFeed`, which already detects the end for `LogEvent.FinishFeed`). The footer is a new end note, "You’re all caught up", "That’s every #tag post for now.", with a Secondary small "Back to top" button and a Tertiary small "Go to my feed" link. For you never shows it.
- For you empty (rare: a brand-new account with nothing in its feed yet): `SimilarEmptyScreen`'s content, "No similar posts yet" and the post's tags as `TagLinks`, with its tag row fixed to wrap (as shipped, the row cannot shrink and runs off both edges on phones). No tab row.
- Empty tag tab: `CharmEmptyState` (inline), image `cloudinaryCharmNoPosts`, title "No other #tag posts yet", description "New posts on this topic will show up here.", action "Show posts for you" (switches to For you).
- Error: not `Feed`'s default. On a failed query `Feed` renders `FeedErrorScreen`, a full-page "Production is down (FML)", which is wrong under a post that loaded fine. Add an optional `errorScreen?: ReactNode` prop to `Feed` (used instead of `FeedErrorScreen` when given) and pass an inline `CharmEmptyState`: image `cloudinaryCharmNoPosts`, title "We couldn’t load more posts", description "Your post is fine. The posts under it didn’t load.", action "Try again" (refetch the feed query).

### Clicks

- `Feed`'s normal behaviour on a list layout: a card click navigates to the post page (`getPostPath`), which remounts the page for the new post with its own feed. Readers with the reader enabled get the reader modal, as on every list feed.
- Card actions (upvote, bookmark, comment, share, copy) are `Feed`'s own handlers.

## Placement and layout

Inside the post's main column, after `PostEngagements` (the comments), at every width. Below laptop the post page is one column, so the feed sits between the comments and the side widgets. From laptop up it fills the main column and the side column beside it has nothing more under the widgets.

| Width                                        | Tabs                                                                                                   | Card text inset | Card layout                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------- |
| Phone (< 656, or a touch phone in landscape) | `ShellRow` + `Segments`, pinned under the page row (`sticky top-[3.25rem]`)                            | 16px            | Stacked below 554px of column, side by side above                                             |
| Tablet (656–1019)                            | The home feed's chip strip (`UnifiedMobileFeedNav` classes), `sticky top-0`, bottom line               | 24px            | Side by side                                                                                  |
| Laptop (1020+)                               | The v2 page header strip (`pageHeaderClassName` with `!py-0`) holding `ExploreChipsBar`'s compact tabs | 32px            | Stacked while the main column is under 554px (windows up to about 1130px), side by side above |

"Tablet" is `styles/media.ts`'s `tablet` query (min 656px with a fine pointer, no pointer, more than 500px tall, or 960px+), the same one Tailwind's `tablet:` uses. Use Tailwind classes or that query; never a bare `min-width: 656px`.

### Tabs, class for class

- **Phone:** `shared/components/shell/ShellRow.tsx`, used as is: `<ShellRow><Segments items={tabs.map((tab) => ({ key, label, active, onClick }))} /></ShellRow>`. Items without `href` render `<button aria-pressed>`. Wrap in `div.sticky.top-[3.25rem].z-1.bg-background-default.tablet:hidden`.
- **Tablet:** the chips from `shared/components/feeds/UnifiedMobileFeedNav.tsx` (L39–44). Export its chip class constants and reuse them, do not copy them. Row: `sticky top-0 z-1 hidden w-full items-stretch border-b border-border-subtlest-tertiary bg-background-default tablet:flex laptop:hidden`; strip: `no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto bg-background-default px-3 py-4`; each chip a `<button aria-pressed>`.
- **Laptop:** the compact tab from `shared/components/feeds/ExploreChipsBar.tsx` (L131–158): `span.relative.flex.shrink-0.items-center.py-3` around a `Button` (`size={ButtonSize.Small}`, `pressed`, `variant={active ? ButtonVariant.Float : ButtonVariant.Tertiary}`), the active one with a centred `w-1/2 border-b-2 border-text-primary` underline. Extract that tab into an exported component (`ExploreChipTab`) and use it in both places rather than copying it. Strip: `pageHeaderClassName` from `shared/components/layout/PageHeader.tsx` with `!py-0` and the horizontal padding reduced so the first label lines up with the post's text (gutter minus the button's 12px); scroller `no-scrollbar flex items-center gap-2 overflow-x-auto pr-12`; right fade `pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default`.
- Render all three and hide by breakpoint with Tailwind classes, not `useViewSize`: the post page renders on the server, and CSS avoids a layout jump on hydration.

### Cards: flush with the column

The feed has no frame of its own. The tab row's line and every card divider run the full width of the main column and meet its side borders.

- Pass `disableListFrame` to `Feed` (no rounded border, no title row).
- Cancel the column padding around the list with negative margins (`-mx-4 tablet:-mx-6 laptop:-mx-8`, the inverse of `PostContainer`'s `px-4 tablet:px-6 laptop:px-8`), and give each card the column's inset instead of its own 16px: padding `16 / 24 / 32px`, `border-radius: 0`.
- Inside the v2 card (laptop), card dividers are `border-border-subtlest-quaternary`, as `FeedContainer` does for the home feed.
- With a tab line above it (tablet, laptop), the first card's top border is transparent, so the line does not double. Phones have no tab line, so the first card keeps its border. With no tabs, the first card's border is transparent at every width (the section's top line is the divider).

### Cards: layout by their own width

`ListCard` switches to side by side by window width (`mobileXL`, 500px). In a narrow column that overflows: the text column cannot shrink below its action bar (about 234px), so side by side needs about 522px of card, 554px with the 32px inset. Windows 500–521px wide scroll sideways today, and the post's main column on a 1020–1130px laptop is far narrower.

- v1: scope a container query to the feed. Make the list a container (`container: post-page-feed / inline-size`), and below 554px of container force the stacked layout on the cards' `mobileXL:` and `mobileXXL:` classes: `flex-direction: column` on `.mobileXL\:flex-row`, `width: 100%` on `.mobileXL\:w-40`, `.mobileXL\:w-60`, `.mobileXXL\:w-56`, `max-height: 12.5rem` on `.mobileXL\:max-h-40`, `.mobileXXL\:max-h-56`, `margin-top: 1rem` on `.mobileXL\:mt-0`, `align-self: auto` on the `self-start` variants. The exact CSS is `feedCss` in `keepReading/KeepReading.tsx`.
- Follow-up (its own PR): make the list cards container-aware (`@tailwindcss/container-queries` is already installed and unused), which also fixes the 500–521px overflow on the home feed. `ArticleList`'s `isNarrow` prop and `useNarrowContainer` are the existing precedent for one card type.

## Files to change

1. `shared/lib/featureManagement.ts`: add, with a one-line comment like its neighbours:
   `export const featurePostPageFeed = new Feature('post_page_feed', false);`
2. `shared/components/post/common.tsx`: add `belowComments?: ReactNode` to `PostContentProps` (next to `aboveComments`) and to `BasePostContentProps`.
3. `shared/components/post/BasePostContent.tsx`: render `{belowComments}` right after `<PostEngagements … />`.
4. Forward `belowComments` from every content component that renders `BasePostContent` for a post page: `PostContent.tsx` (article, video), `SquadPostContent.tsx` (share, freeform), `collection/CollectionPostContent.tsx`, `poll/PollPostContent.tsx`, `SocialTwitterPostContent.tsx`. Not `BriefPostContent`, not `DigestPostContent`.
5. New `shared/components/post/feed/PostPageFeed.tsx`: the section. Props: `{ post: Post }`. It builds the tabs, renders the three tab rows, and one `Feed` keyed by the active tab:
   - `feedName={OtherFeedPage.Post}` (already list layout at every width in `useFeedLayout`), wrapped in `ActiveFeedNameContext.Provider` with that name.
   - `feedQueryKey`: `['postPageFeed', user.id, tab, post.id]`.
   - `query` and `variables` per tab, from the table above; `excludedPostIds={[post.id]}`; `disableListFrame`; `disableAds` and `disableTopHero` for v1 (see Open questions).
   - `emptyScreen`: the empty tab state above; `footer` (new prop): the end note, for tag and source tabs only; `errorScreen` (new prop): the inline error.
6. New `shared/components/post/feed/PostPageFeedTabs.tsx`: the three tab rows above. Export the chip classes from `UnifiedMobileFeedNav.tsx` and the compact tab from `ExploreChipsBar.tsx` for it.
7. `webapp/pages/posts/[id]/index.tsx`: evaluate the flag next to `featurePostSignupStrip`:
   `const { value: isPostPageFeed } = useConditionalFeature({ feature: featurePostPageFeed, shouldEvaluate: isLoggedIn && !!post?.id && !isFallback });`
   and pass `belowComments={isPostPageFeed ? <PostPageFeed post={post} /> : undefined}` to `Content`. Pass it from the page only: `isPostPage` is also true in History's post pane.
8. `shared/lib/log.ts`: add `LogEvent.ChangePostPageFeedTab = 'change post page feed tab'`, logged on tab click with `target_id` the tab (`for_you`, the tag, or the source id) and `extra: { post_id }`. Feed impressions and clicks already carry `extra.feed = 'posts[id]'` through `Feed`, so the feed's own events need nothing new.

## Acceptance criteria

- [ ] Flag off, or signed out: the post page is unchanged, pixel for pixel, at every width.
- [ ] Flag on and signed in: the feed follows the comments on every listed post type; never on briefs or digests, never in the post modal, the reader pane or History.
- [ ] Tabs: For you, the first 3 tags, the source; single-tab posts show no tab row; the current post never appears in any tab.
- [ ] For you pages forever; tag and source tabs end with the end note.
- [ ] Phone, tablet and laptop each use their home-feed tab component; tabs are pinned on phone and tablet, not on laptop.
- [ ] Card text lines up with the post's text (16 / 24 / 32px); dividers run edge to edge; no double line under the tabs.
- [ ] No horizontal scroll at any width from 320px to 2560px, including 500–521px and 1020–1130px.
- [ ] Light and dark from theme tokens only.
- [ ] Keyboard: every tab is a button with `aria-pressed`; focus is visible; the section has a screen-reader heading.
- [ ] Opening a card navigates to that post, which renders its own feed, starting on For you.
- [ ] Impressions and clicks are logged with `extra.feed = 'posts[id]'`; tab switches log `change post page feed tab`.

## Tests

- `webapp/__tests__/PostPage.tsx`: add `post_page_feed` to the `useConditionalFeature` mock (it mocks by `feature.id`). Cover flag off, flag on signed in, and flag on signed out; mock the feed queries with `mockGraphQL`.
- `shared/components/post/feed/PostPageFeed.spec.tsx`: tabs per post (tags, source, single tab), switching tabs swaps the query, `excludedPostIds` drops the current post, the end note on a finite tab, the empty tab. `shared/components/Feed.spec.tsx` (`createFeedMock`, `renderComponent`) shows how to mock a feed.
- `shared/components/post/BasePostContent` / `PostContent.spec.tsx`: `belowComments` renders after the comments.

## Open questions

- **Ads:** v1 runs with `disableAds` so the experiment reads the feed alone. Turning ads on later is one prop.
- **For you cache:** the feed uses its own query key, so it does not share pages with the home feed. Sharing the home feed's key would continue where the reader left the home feed; decide with the experiment's owner.
- **The flag's audience:** decide whether it also targets the mobile apps' web views or only the web app.

## Where each requirement is shown

| Requirement                                                                                                | Story             |
| ---------------------------------------------------------------------------------------------------------- | ----------------- |
| The whole design, every control                                                                            | 2. Playground     |
| Every width from 320 to 2560, incl. 500, 600, 1020, 1140 and phone landscape                               | 3. Breakpoints    |
| Every post type as the host                                                                                | 4. Post types     |
| Every list card type in the feed                                                                           | 5. Card types     |
| Loading, loading more, end of a tab, empty tab, nothing similar, error, no tags, no source tab, single tab | 6. States         |
| Tabs on phone, tablet and laptop, short and long                                                           | 7. Tabs           |
| Signed out: no feed                                                                                        | 8. Signed out     |
| Light and dark                                                                                             | 9. Light and dark |
| End of post, switch tab, scroll, open a post, its own feed                                                 | 10. Flows         |

The Storybook renders the feed from local data and places it after the comments from outside the post page, because the slot does not exist yet. In production the slot (`belowComments`) places it, and `Feed` fetches it. Both produce the same layout.
