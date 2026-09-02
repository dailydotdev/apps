/**
 * Styles for the DOM the engine owns.
 *
 * Injected as a <style> inside the engine's own root rather than imported as a
 * stylesheet: Next's Pages Router only allows global CSS from _app, and these
 * rules are useless anywhere but under `.world-root` anyway. Everything a React
 * overlay lays out itself (panel, timeline, header) is Tailwind and is not here.
 *
 * The colours are the same daily.dev tokens the renderer draws with — the label
 * plates sit ON the world, so they are chrome over a 3D frame rather than app
 * surface, and they have to hold against a bright sky at any theme.
 */
export const WORLD_CSS = `
/* Two declarations here are load-bearing on a phone and inert everywhere else.
   touch-action, because every gesture in this world is one the browser would
   otherwise claim: a drag is a scroll, two fingers are a page zoom, and a
   pointer stream the browser has claimed is a pointer stream that ends in
   pointercancel halfway through a pan. And isolation, because everything below
   is z-indexed against its own layers (labels over leads, the ride flash over
   both) — with no stacking context of its own, a toast at z-index 6 was
   competing with the React chrome instead, and winning, so the feed drew over
   the phone's header bar. */
.world-root{--world-dim:#A8B3CE;--world-dim2:#BAC4DA;--world-line:rgba(168,179,206,.18);
  position:absolute;inset:0;overflow:hidden;isolation:isolate;
  touch-action:none;overscroll-behavior:none;
  font:13px/1.45 ui-sans-serif,-apple-system,"Segoe UI",Inter,system-ui,sans-serif;
  color:#F5F6FA;-webkit-font-smoothing:antialiased;
  user-select:none;-webkit-user-select:none}
.world-root canvas{display:block}
.world-stage{position:absolute;inset:0}
.world-stage.grab{cursor:grab}
/* NO BACKTICKS ANYWHERE IN THIS FILE: it is all one template literal, and one
   of them ends the stylesheet in the middle of a comment.
   The plates already say they are clickable (.lb below carries its own pointer),
   but the GROUND is the bigger target and said nothing: a realm you walk into by
   clicking its island looked exactly like a map you can only drag. The cursor is
   the whole of the affordance on purpose: the labels deliberately do not react
   to a pointer (see the note in world.js), because anything that swells or
   lights up rewrites the map under the reader mid-read. */
.world-stage.pick,.world-stage.pick.grab{cursor:pointer}
/* Both of these beat pick: a drag in progress is not an offer to click, and a
   bird under the pointer is the more specific offer of the two. */
.world-stage.grabbing,.world-stage.grabbing.pick{cursor:grabbing}
.world-stage.ride,.world-stage.ride.grab,.world-stage.ride.pick{cursor:pointer}

/* =================================================================== labels */
/* ONE component at both levels. A realm label and a district label are the same
   object at two sizes: a plate, a name, one line of plain numbers. Everything is
   on a dark plate because the world is bright and white-on-white is not a label. */
.world-labels{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.world-leads{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:visible}
.world-leads line{stroke-width:1.25}
.world-root .lb{position:absolute;transform:translate(-50%,-50%);text-align:center;
  will-change:transform,opacity;transition:opacity .18s linear;
  pointer-events:auto;cursor:pointer}
.world-root .lb .box{display:inline-block;padding:5px 11px 6px;border-radius:9px;
  background:rgba(10,13,19,.8);border:1px solid rgba(168,179,206,.22);
  box-shadow:0 8px 26px rgba(0,0,0,.5)}
/* Names are written the way a person writes them ("AI infra", "iOS") and the
   plates say them that way too: the rail and the map are looking at the same
   forty districts, and a district that is "iOS" in the list and "IOS" on the
   ground is two names for one place.
   The tracking comes down with the caps. Wide letter-spacing is a device for
   setting all-caps signage, and on mixed case at this size it reads as gaps
   between letters rather than as weight. */
.world-root .lb .nm{font-size:12px;font-weight:800;letter-spacing:.04em;color:#fff;
  white-space:nowrap;line-height:1.25}
.world-root .lb .mt{font-size:9.5px;letter-spacing:.04em;font-weight:600;color:#D7DDE9;
  white-space:nowrap;margin-top:2px}
.world-root .lb .sb{font-size:8.5px;letter-spacing:.06em;font-weight:700;margin-top:3px;
  white-space:nowrap;opacity:.9}
/* How far through its current level a plot is, on its owner's own world only.
   Hidden by default and shown from JS, because the tier that hides a plate's
   count hides this with it and an inline display would beat the class doing it.
   currentColor is the district's or realm's own accent, already on the label. */
.world-root .lb .pg{display:none;height:2px;margin-top:5px;border-radius:2px;
  background:rgba(168,179,206,.26);overflow:hidden}
.world-root .lb .pg i{display:block;height:100%;border-radius:2px;
  background:currentColor;transition:width .2s linear}
.world-root .lb .stem,.world-root .lb .pin{display:none}
/* Tier 1 is a bare name over the world — no plate, nothing hidden behind it. */
.world-root .lb.t1 .box{background:none;border-color:transparent;box-shadow:none;padding:0}
.world-root .lb.t1 .nm{font-size:10px;
  text-shadow:0 1px 3px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.8)}
.world-root .lb.t1 .mt,.world-root .lb.t1 .sb,.world-root .lb.t2 .sb{display:none}
/* A realm label is the same thing, one size up, and always says what it is
   about — "SHIPYARDS" alone does not tell a first-time visitor that this is
   where their cloud and ops reading lives. */
.world-root .rl .nm{font-size:15px;letter-spacing:.02em}
.world-root .rl .sb{margin-top:3px}
.world-root .rl .mt{font-size:10.5px;margin-top:4px;color:#F5F6FA}
.world-root .rl.t2 .sb,.world-root .rl.t1 .sb{display:block;color:currentColor}

/* A phone gets the same plates one size down. Six realm names at desktop
   metrics is most of a small screen, and a label that covers the thing it names
   is worse than no label. */
@media (max-width: 700px){
  .world-root .lb .box{padding:4px 8px 5px;border-radius:8px}
  .world-root .lb .nm{font-size:10.5px;letter-spacing:.03em}
  .world-root .lb .mt{font-size:8.5px}
  .world-root .lb .sb{font-size:7.5px;letter-spacing:.05em}
  .world-root .rl .nm{font-size:12px;letter-spacing:.02em}
  .world-root .rl .mt{font-size:9px}
}

/* Floating read pulse, thrown by the replay and by a slap. */
.world-root .fx{position:absolute;transform:translate(-50%,-100%);font-size:11px;
  font-weight:800;letter-spacing:.06em;text-shadow:0 1px 6px rgba(0,0,0,.9);
  pointer-events:none;white-space:nowrap}

/* ==================================================================== feed */
.world-feed{position:absolute;right:16px;top:16px;z-index:6;display:flex;
  flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;
  max-height:52vh;overflow:hidden}
/* Below the laptop line the mark stands in this corner rather than in a rail,
   and the feed now sits UNDER it rather than over it, so it has to clear it
   instead: one plate's height down. */
@media (max-width: 1019px){
  .world-feed{top:64px;max-height:34vh}
}
.world-root .toast{background:rgba(30,34,41,.92);border:1px solid var(--world-line);
  border-radius:8px;padding:6px 11px;font-size:10.5px;letter-spacing:.08em;
  font-weight:600;animation:world-toast-in .28s ease-out;white-space:nowrap;
  box-shadow:0 6px 24px rgba(0,0,0,.45)}
.world-root .toast b{font-weight:800}
.world-root .toast .tag{font-size:8.5px;letter-spacing:.18em;font-weight:800;
  margin-right:7px}
@keyframes world-toast-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}

/* ================================================================ the ride */
/* A ZERO-SIZED anchor with both parts hung off it. Laying the ring and its
   caption out as a centred flex column puts the box's middle on the bird —
   which is the gap between them, so the ring floats above the thing it is
   supposed to be circling. The anchor IS the bird. */
.world-reticle{position:absolute;z-index:6;pointer-events:none;opacity:0;
  width:0;height:0;transition:opacity .1s linear;will-change:transform}
.world-reticle .r{position:absolute;left:0;top:0;transform:translate(-50%,-50%);
  width:26px;height:26px;border-radius:50%;border:1.5px solid #fff;
  box-shadow:0 0 10px rgba(0,0,0,.7),inset 0 0 6px rgba(255,255,255,.5)}
.world-reticle .t{position:absolute;left:0;top:17px;transform:translateX(-50%);
  font-size:8.5px;font-weight:800;letter-spacing:.2em;color:#fff;
  white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.95)}
/* Possession swaps an orthographic camera for a perspective one and there is no
   way to ease between two projections — the framing simply cuts. So it is
   covered by a fast wash while the camera swoops onto the bird underneath it. */
.world-flash{position:absolute;inset:0;z-index:20;background:#F5F6FA;opacity:0;
  pointer-events:none;transition:opacity .34s ease-out}
.world-flash.on{opacity:.9;transition:none}
/* Everything that reads the world from OUTSIDE it goes away while you are
   inside it. A label plate anchored to a plot is meaningless from a bird. */
.world-root.pov .world-labels,.world-root.pov .world-leads{opacity:0;pointer-events:none}
`;
