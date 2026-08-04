import {
  levelOf,
  NICHE_OF,
  paletteOf,
  REALM_OF,
} from './taxonomy';

/* ------------------------------------------------------------------ the API
   `userWorld` returns one row per district and `userWorldTimeline` one row per
   (day, district) — the same two tables devcraft shipped as static files, so
   the model built here is the one the renderer below already expects.

   Districts are keyed by SLUG and anything the taxonomy does not know is
   dropped: the art is the authority on what is placeable, and a niche with no
   district built for it cannot be drawn at all. */

/* A day is a calendar day everywhere in this file, and the API's DateTime can
   arrive as an ISO string, as an epoch or as a Date depending on how the column
   travelled. Normalised once, here, so nothing downstream has to care. */
const day=v=>{
  if(v==null) return '';
  if(typeof v==='string') return v.slice(0,10);
  const d=v instanceof Date?v:new Date(v);
  return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);
};

export function buildWorld(userId,districts,timeline){
  const ds=(districts||[])
    .map(d=>({ slug:d.niche&&d.niche.slug, articles:d.reads,
               first:day(d.firstReadAt), last:day(d.lastReadAt),
               activeDays:d.activeDays }))
    /* Placeable, and standing. `articles>0` is not a rule of its own — it is
       what `spec()` needs: at level 0 its radius goes NaN, and one NaN reaches
       the camera and nothing renders again. The export could not express a
       district with no reads in it, so the lab never had to say so. */
    .filter(d=>NICHE_OF[d.slug]&&d.articles>0)
    .sort((a,b)=> a.first<b.first?-1 : a.first>b.first?1 : a.slug<b.slug?-1:1);
  if(!ds.length) throw new Error('no districts in this world');

  ds.forEach((d,i)=>{ d.i=i; d.niche=NICHE_OF[d.slug]; d.realm=REALM_OF[d.slug];
                      d.P=paletteOf(d.realm,d.niche); d.level=0; d.built=false;
                      d.animated=[]; d.shown=0; });
  const idxOf={}; ds.forEach(d=>idxOf[d.slug]=d.i);

  /* The lifetime span, read off the districts rather than off the growth log.
     The log is the slow half of this page and it is allowed to arrive late — so
     a span derived from it would read "1d" for as long as it took to land and
     then jump. These two are already in hand the moment the world can stand. */
  let first=ds[0].first, last=ds[0].last;
  for(const d of ds){ if(d.first<first)first=d.first; if(d.last>last)last=d.last; }

  /* The growth log is the primitive; districts fold out of it. Days are
     compacted to "days on which something happened" — four years of a real
     reading history is mostly gaps, and a replay that plays the gaps at scale
     is a replay nobody watches. */
  const byDay=new Map();
  for(const g of timeline||[]){
    const di=idxOf[g.niche&&g.niche.slug]; if(di===undefined)continue;
    const iso=day(g.date);
    if(!byDay.has(iso))byDay.set(iso,[]);
    byDay.get(iso).push([di,g.reads]);
  }
  /* No timeline, or a world built inside a single day: the place still stands,
     it just has no history to play. One synthetic day carrying every district's
     lifetime total puts the finished world on screen, and `replayable` is what
     tells the overlay not to offer a scrubber over one frame.
     This is also the shape the FIRST build takes on every load — the world is
     raised off the districts alone and the log is folded in underneath it once
     it arrives, so nothing waits on the big query. */
  const replayable=byDay.size>1;
  if(!byDay.size) byDay.set(last,ds.map(d=>[d.i,d.articles]));
  const days=[...byDay.keys()].sort();
  const nD=ds.length, nT=days.length;
  const cum=new Int32Array(nT*nD), lvl=new Uint8Array(nT*nD), daily=new Int32Array(nT);
  for(let t=0;t<nT;t++){
    if(t) cum.copyWithin(t*nD,(t-1)*nD,t*nD);
    for(const [di,n] of byDay.get(days[t])){ cum[t*nD+di]+=n; daily[t]+=n; }
    for(let d=0;d<nD;d++) lvl[t*nD+d]=levelOf(cum[t*nD+d]);
  }
  return { user:userId, replayable, first, last,
           districts:ds, days, cum, lvl, daily, nD, nT };
}
