import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }     from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WORLD_CSS } from './styles';
import { levelProgress, REALM_DIV } from '../ladder';
import { drawCrest } from './crest';
import { DEFAULT_LOOK_ID, lookFromPreset } from './look';
import { DEFAULT_SKY, skyHourOf, skyPalOf } from './sky';
import {
  LEVELS,
  levelOf,
  mixTok,
  paletteOf,
  realmLevelOf,
  T,
} from './taxonomy';

/* ============================================================================
   DEVCRAFT — the world your reading built.

   This is devcraft's `world-lab.html` renderer wrapped in a factory so a page
   can mount one and take it down again, with the art layer replaced by the
   second pass from `concept-lab.html`. What changed on the way in:

     - the world comes from the API (`buildWorld`, its own module) rather than
       from a sharded static export;
     - the lab's left panel, its timeline and its boot screen are React now. The
       engine keeps only the DOM that has to be positioned by projecting a world
       point to a pixel — labels, leader lines, the ride reticle, the toast feed
       — and pushes everything else out through `onState`;
     - the district nameplates are gone: a district's name is the taxonomy's.
       Sky, crest and look now come in via `setSky`/`setCrest`/`setLook`,
       driven by what the owner saved.

   One engine per page. Every accumulator the art builders share lives inside
   this closure, so two of them would not collide — but two WebGL contexts over
   one world would, and there is only ever one world on a page.
   ========================================================================== */
export function createWorldEngine(options) {
const { container, onState, lite } = options;

/* ============================================================= the two tiers
   A phone is not a small desktop. It has a tile-based GPU with a fraction of
   the bandwidth, a screen with three times the pixels per CSS unit, and a
   thermal budget that a frame costing three passes over the scene will spend
   in about ninety seconds — after which the whole device is throttled, not
   just this page.

   So `lite` is one decision, taken by the page before this engine exists (it
   configures a WebGL context, which cannot be reconfigured afterwards), and it
   is spent in exactly two places: the resolution the frame is drawn at, and
   how many times the scene is drawn for it. Nothing about the WORLD changes —
   the same land, the same buildings, the same look. */
const LITE = !!lite;
/* 2 is already a cap rather than the truth: a modern phone reports 3, and the
   difference between 2 and 3 is invisible at arm's length and 2.25x the
   fragments. On a handheld the same argument keeps going down one more step. */
const dprCap = () => Math.min(devicePixelRatio, LITE ? 1.5 : 2);

/* ============================================================================
   THE ART, and what it is arguing.

   The GROWTH machinery is the first pass's and is untouched, because it was
   never the part that was wrong:

   1. A district is NOT one building that gets taller. It is a PLACE that gets
      bigger, busier and better tended. Land area is the attention channel —
      "the more I read, the more land, the more life". Height is a supporting
      voice, not the melody.
   2. Twelve levels, not five. A five-level ladder saturates hard on real data
      (a four-year veteran reads a wall of 23 citadels), so the top of it
      carries no information. Twelve steps keep separating people all the way up.
   3. Everything is generated from (niche, level) — no models, no textures, no
      network. Two knobs, and the whole place re-composes.

   What the second pass changed is the LOOK. The first derived every realm's
   materials from daily.dev tokens by mixing, which kept the palette on-brand
   and made all six realms siblings of the same pastel family. The concept art
   per realm says something louder — each realm is its own WORLD, with its own
   light, its own rock and its own weather:

   4. REALM MATERIALS COME FROM THE CONCEPT ART (`C` in taxonomy), not from
      token mixes. DISTRICT ACCENTS STAY ON TOKENS: the realm is the place, the
      district is the subject, and the subject is daily.dev's. Brand rides the
      accent — lodestone band, roof trim, lamps, banners — where it is legible
      and where it does not fight the light.
   5. THE UNDERSIDE IS REALM IDENTITY. Every island floats, and in every concept
      image the bottom is the tell: crystal, wrapped roots, basalt columns, wet
      crag, icicles, clay. One keel cone for all six threw that away.
   6. EVERY REALM GETS A LANDFORM, standing at L1 before a single building is.
      Three realms used to have terrain of their own and three had only props,
      which left half the set unreadable until L3.
   ==========================================================================*/

/* ---------------------------------------------------------------- helpers */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const TAU=Math.PI*2;

/* mulberry32 — deterministic per (niche, purpose). Every prop draws from a
   purpose-scoped stream so adding a new prop family later cannot reshuffle the
   ones already placed. */
function rngOf(seed){
  let a=seed>>>0;
  return function(){
    a|=0;a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
const hash2=(a,b)=>(a*73856093 ^ b*19349663)>>>0;

/* ------------------------------------------------ the land, in ABSOLUTE units
   Everything below is measured in world units and never in fractions of the
   island's radius. That is the whole trick behind "the land grows, it doesn't
   move": a normalised layout has to drag every building outward when the radius
   changes, so levelling up reads as the town sliding around. Absolute layout
   means a building placed at L4 is at exactly those coordinates at L12 too —
   growth can only ever ADD.

   The land is a stack of fixed-width rings on a fixed grid. Ring j is identical
   geometry at every level; the level only decides how many exist. Terrace
   boundaries sit on that same grid, so a terrace is not a rescaled fraction of
   the island — it is a specific place, and the island reaches it or it doesn't. */
const RING_W=0.9;                       // the land's unit of growth
const RMAX=14.4;                        // L12, snapped to the ring grid
const TIER_R=[3.6,7.2,10.8];            // terrace boundaries, on the grid
const TIER_STEP=1.05;                   // each terrace steps DOWN by this
const RING_T=1.5;                       // every ring is this thick, always
/* Thickness is per-ring, not a shared floor. A shared floor meant the plateau
   had to be as deep as the lowest terrace could ever get, so a three-ring L2
   island came out as a squat cylinder — 3.6 across and 4.7 deep. Stepped
   bottoms stay hidden inside the keel cone, and a small island reads as the
   thin plate it should be. */
const tierOf=r=>{let t=0;for(const b of TIER_R)if(r>b+1e-6)t++;return t;};
const tierY=r=>-tierOf(r)*TIER_STEP;
const snapR=r=>Math.ceil(r/RING_W-1e-6)*RING_W;

/* Sunflower lattice in world units. Slot i sits at the same world coordinates
   at every level, and slots fill OUTWARD (r = sqrt(i/n)), so levelling up
   appends buildings at the frontier and disturbs nothing behind it. `f` is a
   stable per-slot number used for density infill: raising the fill threshold
   can only ever admit more slots, never move or evict one. */
function lattice(n, rot, rMax, seed){
  const rnd=rngOf(seed), out=[];
  for(let i=0;i<n;i++){
    const r=Math.sqrt((i+0.5)/n)*rMax;
    const a=i*2.399963229728653+rot;
    out.push({ r:Math.max(0.25,r+(rnd()-0.5)*RING_W*0.55),
               a:a+(rnd()-0.5)*0.3, f:rnd(), i });
  }
  return out;
}

/* =============================================================== the polish
   The lab shipped nine independent switches so each effect could be judged on
   its own — a screenshot of all nine on is useless for deciding which of them
   earned its place. Shipping is the other side of that question: the answer is
   "all of them", so what is left is the answer rather than the bench. It stays
   an object because the draw loop and the passes read it every frame. */
const FX={vc:true,bevel:true,env:true,noise:true,air:true,water:true,
          post:true,bloom:true,outline:true};

/* What the lab exposed as the VIEW checkboxes. No UI on them yet; the labels,
   the plot borders and the ambient motion all read these live, so the
   controller can offer them later without anything else moving. */
const VIEW={border:true,labels:true,life:true,sky:true};

/* Whether the plates carry how far through its rung each plot is. OFF by
   default, and turned on only for a reader looking at their OWN world: on
   somebody else's it is a stranger's homework, and the plate is already
   carrying a name, a subject and a count on a box the size of a stamp.
   Read live by the label pass, which runs every frame, so flipping it needs
   nothing rebuilt. */
let LVLPROG=false;

/* ------------------------------------------------------------ the engine DOM
   Only the layers that have to be placed by projecting a world point to a pixel
   live in here. The markup is built rather than handed in, so the engine can be
   dropped into any container without the page having to know its internals. */
const rootEl=document.createElement('div');
rootEl.className='world-root';
rootEl.innerHTML=
   '<div class="world-stage grab"></div>'
  +'<svg class="world-leads"></svg>'
  +'<div class="world-labels"></div>'
  +'<div class="world-feed"></div>'
  +'<div class="world-flash"></div>'
  +'<div class="world-reticle"><span class="r"></span><span class="t">RIDE</span></div>';
const styleEl=document.createElement('style');
styleEl.textContent=WORLD_CSS;
rootEl.appendChild(styleEl);
container.appendChild(rootEl);
/* Same call shape the lab used, one scope down: `$('labels')` reaches this
   engine's label layer and not some other element on the page that happens to
   share the name. */
const $=name=>rootEl.querySelector('.world-'+name);
const stageEl=$('stage');

/* ------------------------------------------------------------- the viewport
   The CONTAINER's box, not the window's, and the two are NOT the same box.

   Everything here maps between world space and pixels twice a frame — the
   labels project outward, the pointer unprojects inward — and both directions
   divide by "the size of the viewport". Read that from `innerWidth` and the
   moment anything makes the container narrower than the window, every label
   drifts further from the island it names the closer it gets to the right
   edge, and every click lands on the wrong place by the same growing margin.
   It is a SCALE error, so it does not look like an offset; it looks like the
   world is subtly wrong.

   Plenty makes the container narrower. A classic scrollbar takes layout width
   that `innerWidth` still counts (which is every desktop that is not a Mac on
   its default overlay-scrollbar setting). The app's own modal rules put a
   `margin-right` on fixed layers while a dialog is open, this page's root
   included. Neither fires a resize event, so neither can be caught by
   listening for one — hence the observer below.

   `x`/`y` matter for the other direction only: pointer events arrive in client
   coordinates, so they have to come back to this box's origin before they mean
   anything. Projection writes into DOM that shares this box, so it needs the
   size and not the origin. */
let VX=0, VY=0, VW=0, VH=0;
function measure(){
  const r=rootEl.getBoundingClientRect();
  VX=r.left; VY=r.top;
  /* Left unclamped on purpose: a world booted in a background tab measures 0,
     and the degenerate-viewport guards downstream are what defer the camera
     fit until there is something to fit into. */
  VW=Math.round(r.width); VH=Math.round(r.height);
}
measure();

/* Every listener the engine puts on window or document, so dispose() can take
   them all back off. A world still steering a camera after the page navigated
   away is the one leak this file can actually cause. */
const listeners=[];
const listen=(target,type,fn,opts)=>{ target.addEventListener(type,fn,opts);
  listeners.push([target,type,fn,opts]); };
let disposed=false;

/* Everything the React overlay renders is pushed through here rather than
   written into the DOM. Coalesced onto a microtask: one replay step can touch
   the counters, the ranking and the sky, and that is one render, not three. */
let stateDirty=false;
let STATE={status:'loading',progress:0,message:'Raising the land…',
           playing:false,speed:1,day:0,totalDays:1,rank:[]};
function emit(patch){
  STATE={...STATE,...patch};
  if(stateDirty)return;
  stateDirty=true;
  queueMicrotask(()=>{ stateDirty=false; if(!disposed&&onState) onState(STATE); });
}

/* --------------------------------------------------------------- renderer */
/* MSAA on the default framebuffer is nearly free on a desktop and buys the one
   frame a look with all post switched off draws directly. Under the composer it
   buys nothing at all — every pass renders into a plain render target and the
   only thing that reaches the default framebuffer is a fullscreen quad, which
   has no edges to sample. So on a handheld, where it is a multisampled buffer's
   worth of memory and a resolve every frame, it goes. */
const renderer=new THREE.WebGLRenderer({antialias:!LITE,alpha:false});
renderer.setPixelRatio(dprCap());
renderer.setSize(VW,VH);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
/* Trimmed from 1.02 once the bake, the rim and the structured environment were
   all in: each of them adds a little light, and three little additions over a
   world that was already near the top of the range is a world with no darks
   left in it. */
renderer.toneMappingExposure=0.93;
/* NO SHADOW MAP. A single directional shadow over a world of floating islands
   was never going to earn its place: at world scale the islands' shadows fall
   into open sky and land on nothing, and at realm scale the props are small
   enough that the baked vertex contact term already seats them. What was left
   was a 36 MB depth buffer, a per-frame sampling cost in every material, and a
   frustum that had to be re-fitted on every view change. The form is carried by
   the vertex bake, the structured environment and the rim instead — all three
   of which are free per frame. */
stageEl.appendChild(renderer.domElement);

const scene=new THREE.Scene();

/* True isometric: yaw free, pitch locked to atan(1/√2) so the ground grid reads
   as the classic 2:1 diamond. Orthographic — a personal world is a portrait and
   perspective would make the far side of the island lie about its size. */
const ISO_PITCH=Math.atan(1/Math.SQRT2);
const cam=new THREE.OrthographicCamera(-10,10,10,-10,-200,400);
/* The second camera, and the only thing in this file that is allowed to have a
   vanishing point. Orthographic is right for reading a world and hopeless for
   being inside one — a bird flying at an island under parallel projection gets
   no closer to it. This one is only ever live while you are riding something.
   `view` is whichever of the two the frame is currently drawn through. */
const camFP=new THREE.PerspectiveCamera(72,1,0.12,900);
let view=cam;
let yaw=Math.PI*0.25, pitch=ISO_PITCH, zoom=15, target=new THREE.Vector3(0,1.6,0);
function placeCam(){
  const d=90;
  cam.position.set(
    target.x+Math.cos(pitch)*Math.cos(yaw)*d,
    target.y+Math.sin(pitch)*d,
    target.z+Math.cos(pitch)*Math.sin(yaw)*d);
  cam.lookAt(target);
  const a=VW/VH;
  cam.left=-zoom*a; cam.right=zoom*a; cam.top=zoom; cam.bottom=-zoom;
  cam.updateProjectionMatrix();
}

/* ------------------------------------------------------------------ lights */
/* Ambient budget is shared with the PMREM environment added below — hemi was
   at 0.9 before the env existed and the two together flattened everything to
   pastel. The sun does the shaping; these two only keep shadows from going
   black. */
const hemi=new THREE.HemisphereLight(0xF5F6FA,0xA8B3CE,0.3);   // salt.10 / salt.90
scene.add(hemi);
/* Only the DIRECTION of a directional light matters — there is no falloff — so
   the sun is placed once here and never moved again. It used to be re-positioned
   on every view change purely so the shadow frustum could be re-fitted around
   the new bounds; with no shadow map there is nothing left to re-fit, and the
   environment map — which is painted from this vector — now only has to be
   painted once per sky rather than once per view. */
const SUN_V=new THREE.Vector3(0.62,1.5,0.4).normalize();
const sun=new THREE.DirectionalLight(0xFFF3B7,2.0);            // cheese.10
sun.position.copy(SUN_V).multiplyScalar(100);
scene.add(sun); scene.add(sun.target);
sun.target.updateMatrixWorld();
/* Cool bounce from below — floating islands with a black underside look dead,
   and "dead" is the one note this realm is not allowed to hit. */
const fill=new THREE.DirectionalLight(0x887BF8,0.8);           // onion.10
fill.position.set(-22,-18,-18); scene.add(fill);
/* A cool kicker from behind and slightly above, opposite the sun (FX.env). The
   islands sit against a sky whose value is close to their own, and without a
   rim the silhouette dissolves into it — this is the one light whose whole job
   is the OUTLINE of a shape rather than its form. Aimed opposite the sun rather
   than opposite the camera because the camera turns and the sun does not. */
/* Low. A rim's job is the edge of a shape, and any brighter it stops reading as
   a kicker and becomes a second key — which, on top of the sun and a structured
   environment, is simply three lights all claiming the same surface. */
const rim=new THREE.DirectionalLight(0xBFD4FF,0.4);
rim.position.set(-26,16,-18); scene.add(rim);
rim.visible=!!FX.env;

/* ------------------------------------------------------------------- sky */
/* Screen-space gradient, not a dome. Under an orthographic camera every ray is
   parallel, so a sky sphere collapses to one flat colour — the first render of
   this file came out uniformly peach for exactly that reason. A background
   texture is drawn as a full-screen quad and keeps its vertical ramp. */
const skyCanvas=document.createElement('canvas');
skyCanvas.width=4; skyCanvas.height=256;
const skyTex=new THREE.CanvasTexture(skyCanvas);
skyTex.colorSpace=THREE.SRGBColorSpace;
/* The same ramp again as an equirect, run through PMREM to give the scene an
   environment. Without one every metalness>0 surface renders black — the gold
   orrery rings came out as charcoal scribbles in the sky before this. */
const envCanvas=document.createElement('canvas');
envCanvas.width=64; envCanvas.height=32;
const envTex=new THREE.Texture(envCanvas);
envTex.mapping=THREE.EquirectangularReflectionMapping;
envTex.colorSpace=THREE.SRGBColorSpace;
const pmrem=new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
let envRT=null;

/* The equirect is painted PER PIXEL rather than as a canvas gradient, because a
   vertical ramp is exactly the problem (FX.env). A ramp has no horizontal
   variation at all, so after PMREM every surface in the world receives ambient
   light as a pure function of how upward-facing it is: two walls meeting at a
   right angle under the same sun get identical fill, and no amount of roughness
   or metalness can recover a difference that was never in the environment. That
   is most of why the materials read as inert.

   Directions are reconstructed with three's own equirect convention rather than
   guessed at, so the bright side of the environment genuinely lands where the
   sun is instead of a rotation away from it:

       u = atan2(z,x)/2pi + 0.5     v = asin(y)/pi + 0.5

   with the canvas' top row at v=1 because textures arrive flipped. 2048 pixels
   is nothing to walk, and it buys a sun disc, a warm halo around it, a cool
   anti-sun side, and a ground bounce — which between them are what tint the
   shadows. Shadowed surfaces see only the ambient term, so a cool anti-sun sky
   IS a blue shadow, and no separate shadow-colour hack is needed. */
const sunDir=new THREE.Vector3(0.36,0.87,0.23);
function paintEnv(a,b,hz){
  const e=envCanvas.getContext('2d');
  const hex=v=>'#'+v.toString(16).padStart(6,'0');
  hz=hz??0xFFFFFF;
  if(!FX.env){
    const eg=e.createLinearGradient(0,0,0,32);
    eg.addColorStop(0,hex(a)); eg.addColorStop(0.5,hex(hz)); eg.addColorStop(1,hex(b));
    e.fillStyle=eg; e.fillRect(0,0,64,32);
  }else{
    sunDir.copy(sun.position).sub(sun.target.position).normalize();
    const top=new THREE.Color(a), bot=new THREE.Color(b);
    /* Same haze the background is using. The environment and the sky the eye
       sees have to agree, and a white haze here is how a night world kept
       receiving a noon world's ambient light. */
    const haze=new THREE.Color(hz);
    const warm=new THREE.Color(0xFFF0C4);      // the sun's own colour, cheese.10
    const cool=new THREE.Color(0x8C97C8);      // what the shadow side is lit by
    const img=e.createImageData(64,32), px=img.data, c=new THREE.Color();
    for(let y=0;y<32;y++) for(let x=0;x<64;x++){
      const u=(x+0.5)/64, v=1-(y+0.5)/32;
      const phi=(u-0.5)*TAU, sy=Math.sin((v-0.5)*Math.PI);
      const r=Math.sqrt(Math.max(0,1-sy*sy));
      const dx=r*Math.cos(phi), dz=r*Math.sin(phi);
      /* Vertical ramp first — same three-stop shape the background uses, so the
         environment and the sky the eye sees agree with each other. */
      const t=clamp(sy*0.5+0.5,0,1);
      if(t>0.62) c.copy(haze).lerp(top,clamp((t-0.62)/0.38,0,1));
      else       c.copy(bot).lerp(haze,clamp(t/0.62,0,1));
      const d=dx*sunDir.x+sy*sunDir.y+dz*sunDir.z;
      /* The halo is the part that adds light, the anti-sun the part that takes
         it away — so the cool side is the stronger of the two. The environment
         is supposed to give ambient a DIRECTION, not raise its level. */
      c.lerp(warm,0.24*Math.pow(clamp(d,0,1),2.5));       // halo
      c.lerp(cool,0.38*Math.pow(clamp(-d,0,1),1.4));      // anti-sun
      if(d>0.986) c.lerp(warm,0.6);                       // the disc itself
      if(sy<0) c.lerp(bot,0.3*clamp(-sy*1.4,0,1));        // bounce off the sea
      px[(y*64+x)*4  ]=c.r*255;
      px[(y*64+x)*4+1]=c.g*255;
      px[(y*64+x)*4+2]=c.b*255;
      px[(y*64+x)*4+3]=255;
    }
    e.putImageData(img,0,0);
  }
  envTex.needsUpdate=true;
  envRT?.dispose();
  envRT=pmrem.fromEquirectangular(envTex);
  scene.environment=envRT.texture;
}
let skyH=0xFFFFFF;
function paintSky(a,b,haze){
  skyH=haze??0xFFFFFF;
  const hex=v=>'#'+v.toString(16).padStart(6,'0');
  const g=skyCanvas.getContext('2d');
  const grd=g.createLinearGradient(0,0,0,256);
  grd.addColorStop(0,hex(a));
  grd.addColorStop(0.52,hex(a));
  grd.addColorStop(0.72,hex(skyH));
  grd.addColorStop(1,hex(b));
  /* The band at 0.72 is the horizon haze; mixing it in as a stop keeps the two
     colours pure at top and bottom instead of muddying toward grey.
     It was a hardcoded white until the hours arrived, and hardcoded white is a
     LIGHT SOURCE — under NIGHT the sky went properly dark at the zenith and at
     the sea while a bright cream band stayed welded across the horizon, which
     reads less like an evening than like a hole in the world. The haze is the
     brightest part of any sky, so it is the part an hour has to reach first. */
  g.fillStyle=grd; g.fillRect(0,0,4,256);
  skyTex.needsUpdate=true;
  paintEnv(a,b,skyH);
}
paintSky(0x8E7BE0,0xFFD9C8);
scene.background=skyTex;

/* Canvas-made radial glow — the only "texture" in the file, generated at boot
   so the bench stays a single self-contained document. */
const glowTex=(()=>{
  const s=128,c=document.createElement('canvas');c.width=c.height=s;
  const g=c.getContext('2d');
  const rg=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  rg.addColorStop(0,'rgba(255,255,255,1)');
  rg.addColorStop(0.25,'rgba(255,255,255,0.55)');
  rg.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=rg;g.fillRect(0,0,s,s);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
})();

/* ------------------------------------------------------------- materials */
const matCache=new Map();
/* ------------------------------------------------ albedo noise (FX.noise) */
/* Every surface in this world is one solid colour over a large area, and the
   eye reads a large area of one exact value as "filled in" rather than "made
   of something". A couple of percent of world-space noise is enough to stop
   that, and it needs no UVs, no texture and no asset — which matters, because
   an imported texture would have to fight a palette that was chosen deliberately.

   The strength lives in a SHARED uniform rather than in the compiled source, so
   the switch costs nothing at flip time: baking it into the shader would mean
   either recompiling every material in the world or re-booting for a two-line
   change. Roughness gets the same wobble as the albedo — the sun sliding across
   a surface that varies slightly in how it scatters is doing more work than the
   colour change on its own. */
const NOISE={amt:0.085, rough:0.34, scale:2.6};
const NOISE_U={ a:{value:FX.noise?NOISE.amt:0}, r:{value:FX.noise?NOISE.rough:0},
                s:{value:NOISE.scale} };
const NOISE_GLSL=`
uniform float uNA; uniform float uNR; uniform float uNS;
varying vec3 vNPos;
float nHash(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float nVal(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(nHash(i),               nHash(i+vec3(1,0,0)),f.x),
                 mix(nHash(i+vec3(0,1,0)),   nHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(nHash(i+vec3(0,0,1)),   nHash(i+vec3(1,0,1)),f.x),
                 mix(nHash(i+vec3(0,1,1)),   nHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float nFbm(vec3 p){ return nVal(p*uNS)*0.66+nVal(p*uNS*2.7)*0.34; }
`;
function noisePatch(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uNA=NOISE_U.a; sh.uniforms.uNR=NOISE_U.r; sh.uniforms.uNS=NOISE_U.s;
    sh.vertexShader=sh.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec3 vNPos;')
      /* Instanced props carry their placement in instanceMatrix, which
         begin_vertex has not applied yet — miss this and every rock in the
         scatter samples the noise field at the same spot. */
      .replace('#include <begin_vertex>','#include <begin_vertex>\n'+
        '#ifdef USE_INSTANCING\n  vNPos=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n'+
        '#else\n  vNPos=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\n'+NOISE_GLSL)
      .replace('#include <color_fragment>','#include <color_fragment>\n'+
        '  float nV=0.5;\n'+
        '  if(uNA>0.0||uNR>0.0){ nV=nFbm(vNPos);\n'+
        '    diffuseColor.rgb*=1.0+(nV-0.5)*uNA; }')
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n'+
        '  roughnessFactor=clamp(roughnessFactor*(1.0+(nV-0.5)*uNR),0.04,1.0);');
  };
  /* Without this three may hand back a program compiled from the unpatched
     source for a material whose parameters happen to match. */
  m.customProgramCacheKey=()=>'devcraft-noise';
  return m;
}

function mat(hex,opt={}){
  /* FX.vc is part of the key on purpose. Toggling the vertex bake re-boots the
     world, and a rebuild that handed back materials cached under the old flag
     would build fresh geometry and then light it with a shader that ignores the
     attribute it just baked. FX.noise is deliberately NOT in the key — it rides
     a uniform, so one material serves both states. */
  const key=hex+'|'+JSON.stringify(opt)+'|'+(FX.vc?'v':'');
  if(matCache.has(key))return matCache.get(key);
  const m=new THREE.MeshStandardMaterial({
    color:hex, roughness:opt.rough??0.82, metalness:opt.metal??0.0,
    flatShading:opt.flat??true,
    emissive:opt.emissive??0x000000, emissiveIntensity:opt.ei??1,
    transparent:!!opt.opacity, opacity:opt.opacity??1,
    side:opt.side??THREE.FrontSide,
    envMapIntensity:opt.env??0.45,
    vertexColors:!!FX.vc,
  });
  noisePatch(m);
  matCache.set(key,m); return m;
}
const glowMat=(hex,i=1.4)=>mat(hex,{emissive:hex,ei:i,rough:0.35,flat:false});
/* Warm lit window, one material for the whole world. Every concept image has the
   same trick in it: small windows blazing gold against a cool wall. */
const winMat=(P,i=0.95)=>mat(P.warm,{emissive:P.warm,ei:i,rough:0.4,flat:false});

/* --------------------------------------------------------- geometry utils */
/* Island outline: a wobbled circle. Star-shaped around the origin on purpose —
   it makes "is this point on the island?" a one-line radius test, which every
   prop placement needs. */
function profile(seed, sides=30, wobble=0.13){
  const r=rngOf(seed), p1=r()*TAU, p2=r()*TAU, p3=r()*TAU, out=[];
  for(let i=0;i<sides;i++){
    const t=i/sides*TAU;
    out.push(1 + wobble*Math.sin(t*3+p1) + wobble*0.55*Math.sin(t*5+p2)
               + wobble*0.3*Math.sin(t*7+p3));
  }
  return out;
}
const radiusAt=(prof,a)=>{
  const n=prof.length, f=((a/TAU)%1+1)%1*n, i=Math.floor(f), t=f-i;
  return lerp(prof[i%n],prof[(i+1)%n],smooth(t));
};
function polyShape(prof, radius){
  const s=new THREE.Shape(), n=prof.length*3;
  for(let i=0;i<n;i++){
    const a=i/n*TAU, r=radiusAt(prof,a)*radius;
    const x=Math.cos(a)*r, y=Math.sin(a)*r;
    i?s.lineTo(x,y):s.moveTo(x,y);
  }
  s.closePath(); return s;
}
/* Same outline as a hole — wound the other way round, so ExtrudeGeometry cuts
   it out instead of trying to fill it. */
function polyHole(prof, radius){
  const p=new THREE.Path(), n=prof.length*3;
  for(let i=n-1;i>=0;i--){
    const a=i/n*TAU, r=radiusAt(prof,a)*radius;
    const x=Math.cos(a)*r, y=Math.sin(a)*r;
    i===n-1?p.moveTo(x,y):p.lineTo(x,y);
  }
  p.closePath(); return p;
}
/* ---------------------------------------------- baked vertex light (FX.vc) */
/* The thing good low-poly always has and this file did not: light baked into
   the mesh. Three signals, one pass, one colour attribute, nothing per frame:

     CONTACT  darkening toward the bottom of every object, so a cottage sits IN
              the ground rather than a millimetre above it. A shadow map cannot
              do this — what is occluded down there is the ambient term, and
              ambient arrives from the whole sky regardless of where the sun is.
     TINT     a vertical ramp, cooler and darker at the base. The realm terrace
              tops are the largest single-colour areas in the frame and this is
              what stops them reading as fills.
     EDGE     a lift along convex edges, a darkening inside concave ones. The
              expensive-looking one: paint thins over a corner and dust settles
              in the crease, so real painted objects are brighter on their edges.

   Convexity falls out of comparing each vertex's own normal — which for the
   flat-shaded geometry in this file is a FACE normal — against the average of
   every face meeting at that position. Agreement means smooth; divergence means
   an edge, and the sign of that divergence against the direction out from the
   object's centre says whether it bulges or folds.

   All of it is local to the geometry, so a geometry shared between two meshes
   bakes once and stays right for both. The `vcBaked` flag is what keeps the
   merge in mergeStatic() from baking an already-baked result a second time, at
   which point "local" would mean the whole district and the contact term would
   darken every building that happens to sit low on the hill. */
/* The edge lift is a MULTIPLIER on albedo, so anything over 1 is the bake
   making a surface brighter than the artist's colour. Kept small and capped
   close to 1: this effect is meant to be read as a catch of light along a
   corner, and at the strength it started on it was quietly raising the whole
   world's exposure instead. */
const VC={ contact:0.44, contactH:0.5, tint:0.22, edge:0.20, cavity:0.28 };
const VC_COOL=new THREE.Color(0x5C688F);
function bakeVC(geo){
  const at=geo&&geo.attributes;
  /* An existing colour attribute means this geometry came out of a merge or a
     subGeom slice and is already carrying someone else's bake. */
  if(!at||!at.position||at.color||geo.userData.vcBaked) return geo;
  geo.userData.vcBaked=true;
  if(!at.normal) geo.computeVertexNormals();
  const pos=at.position, nor=at.normal, n=pos.count;
  if(!nor||n<3) return geo;

  geo.computeBoundingBox();
  const bb=geo.boundingBox;
  const cx=(bb.min.x+bb.max.x)/2, cy=(bb.min.y+bb.max.y)/2, cz=(bb.min.z+bb.max.z)/2;
  const hgt=bb.max.y-bb.min.y;
  /* Contact is a physical falloff in world units, but a lamp post is shorter
     than the falloff — clamped, or half the props in the world go black.
     A geometry with no height at all is a ground plane or a sheet of water: it
     has no underside to occlude and no ramp to run, so both terms sit out.
     Without this they divide by its zero height and paint the whole sheet
     with the darkest end of the falloff. */
  const solid=hgt>0.06;
  const cH=solid?Math.min(VC.contactH,hgt*0.5):1;

  /* Weld by position on a 1/512 grid and average the face normals meeting
     there. Integer spatial hash rather than string keys: a realm bakes ~200k
     vertices during boot and string keys turn that into garbage-collector
     time you can see. */
  const slot=new Map(), sx=[], sy=[], sz=[];
  const key=i=>{
    const qx=Math.round(pos.getX(i)*512), qy=Math.round(pos.getY(i)*512),
          qz=Math.round(pos.getZ(i)*512);
    return ((qx*73856093)^(qy*19349663)^(qz*83492791))>>>0;
  };
  const bin=new Int32Array(n);
  for(let i=0;i<n;i++){
    const k=key(i);
    let s=slot.get(k);
    if(s===undefined){ s=sx.length; slot.set(k,s); sx.push(0); sy.push(0); sz.push(0); }
    bin[i]=s;
    sx[s]+=nor.getX(i); sy[s]+=nor.getY(i); sz[s]+=nor.getZ(i);
  }

  const col=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const s=bin[i];
    let ax=sx[s], ay=sy[s], az=sz[s];
    const al=Math.hypot(ax,ay,az)||1; ax/=al; ay/=al; az/=al;
    const nx=nor.getX(i), ny=nor.getY(i), nz=nor.getZ(i);
    /* 0 on a smooth surface, up toward 1 the harder the crease. */
    const sharp=clamp(1-(nx*ax+ny*ay+nz*az),0,1);

    const px=pos.getX(i), py=pos.getY(i), pz=pos.getZ(i);
    let ox=px-cx, oy=py-cy, oz=pz-cz;
    const ol=Math.hypot(ox,oy,oz)||1; ox/=ol; oy/=ol; oz/=ol;
    const out=ax*ox+ay*oy+az*oz;          // >0 bulges out, <0 folds in

    let v=1;
    if(solid) v-=VC.contact*(1-smooth(clamp((py-bb.min.y)/cH,0,1)));  // contact
    v+=VC.edge*sharp*clamp(out*1.6,0,1);                        // convex lift
    v-=VC.cavity*sharp*clamp(-out*1.6,0,1);                     // concave dirt
    v=clamp(v,0.08,1.16);

    /* The vertical ramp carries a hue as well as a value — a base that only
       goes darker reads as shadow, a base that goes cool reads as ground. */
    const t=solid?clamp((py-bb.min.y)/hgt,0,1):1, w=VC.tint*(1-t);
    col[i*3  ]=v*(1-w+w*VC_COOL.r);
    col[i*3+1]=v*(1-w+w*VC_COOL.g);
    col[i*3+2]=v*(1-w+w*VC_COOL.b);
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  return geo;
}
/* -------------------------------------------------- bevelled box (FX.bevel) */
/* A raw box gives the light nothing to catch along its edges, and under flat
   shading that is most of the difference between a block and an object. A real
   painted model has a narrow facet on every corner — the mould was drafted, the
   paint thinned over the edge, the thing got handled — and that facet reads as
   a third value between the top face and the side face.

   Hand-rolled rather than reached for from the addons because the vertex bake
   needs FACE normals to find edges at all: a geometry carrying smoothed normals
   looks curvature-free to bakeVC and earns no edge lift, which would have
   feature 2 quietly cancelling feature 1.

   24 vertices — every box corner pulled inward along each of the three axes —
   then 6 face quads, 12 edge quads and 8 corner triangles. 44 triangles against
   a box's 12, so it is only spent where it shows: under about 9 cm a box in
   this world is a window pane, a rib or a handrail, and a chamfer there is
   geometry nobody will ever resolve. */
const BEVEL_MIN=0.09;
function chamferBox(w,h,d,c){
  const e=[w/2,h/2,d/2];
  c=Math.min(c,Math.min(e[0],e[1],e[2])*0.6);
  const inn=[e[0]-c,e[1]-c,e[2]-c], pos=[];
  /* Every vertex of this solid sits at full extent on exactly one axis and
     inset on the other two — which is what makes one helper enough for the
     faces, the edges and the corners alike. */
  const v=(s,f)=>[s[0]*(f===0?e[0]:inn[0]),
                  s[1]*(f===1?e[1]:inn[1]),
                  s[2]*(f===2?e[2]:inn[2])];
  /* Winding is corrected against the known outward direction rather than
     reasoned about case by case — 26 polygons is 26 chances to put a normal in
     backwards and find out later as a black facet. */
  const emit=(ps,out)=>{
    const [a,b,cc]=ps;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const wx=cc[0]-a[0],wy=cc[1]-a[1],wz=cc[2]-a[2];
    const nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx;
    const q=(nx*out[0]+ny*out[1]+nz*out[2])<0?ps.slice().reverse():ps;
    for(let i=1;i+1<q.length;i++) pos.push(...q[0],...q[i],...q[i+1]);
  };
  const S=[-1,1];
  for(let a=0;a<3;a++) for(const sa of S){          // 6 faces
    const b=(a+1)%3, k=(a+2)%3, out=[0,0,0], q=[]; out[a]=sa;
    for(const [sb,sk] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      const s=[0,0,0]; s[a]=sa; s[b]=sb; s[k]=sk; q.push(v(s,a));
    }
    emit(q,out);
  }
  for(let a=0;a<3;a++) for(let b=a+1;b<3;b++)       // 12 edge chamfers
    for(const sa of S) for(const sb of S){
      const k=3-a-b, s=[0,0,0]; s[a]=sa; s[b]=sb;
      const out=[0,0,0]; out[a]=sa/Math.SQRT2; out[b]=sb/Math.SQRT2;
      const q=[];
      s[k]=-1; q.push(v(s,a));
      s[k]= 1; q.push(v(s,a)); q.push(v(s,b));
      s[k]=-1; q.push(v(s,b));
      emit(q,out);
    }
  for(const sx of S) for(const sy of S) for(const sz of S){   // 8 corners
    const s=[sx,sy,sz], m=1/Math.sqrt(3);
    emit([v(s,0),v(s,1),v(s,2)],[sx*m,sy*m,sz*m]);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals();     // non-indexed, so these come out per face
  return g;
}
function boxG(w,h,d){
  if(!FX.bevel||Math.min(w,h,d)<BEVEL_MIN) return new THREE.BoxGeometry(w,h,d);
  return chamferBox(w,h,d,clamp(Math.min(w,h,d)*0.11,0.012,0.05));
}

/* Everything the builders make funnels through here, which is why the bake can
   be one line rather than a call at 200 build sites. */
function meshOf(geo,material,cast=true,recv=true){
  if(FX.vc) bakeVC(geo);
  const m=new THREE.Mesh(geo,material);
  return m;
}

/* ============================================================ the district */
const animated=[];          // things with a per-frame tick
/* Animation that only touches a MATERIAL, held apart from the scene graph.
   A pulsing lantern used to carry its tick on the object, and mergeStatic has
   to leave any ticked object — and everything under it — out of the merge, so
   a hundred and ninety drawables were being kept as their own draw calls purely
   to write one float per frame. A material is not part of the geometry: it can
   be animated whether or not the mesh it belongs to has been merged into a
   thousand others.

   Keyed by material, and that is the honest part of this change: glowMat routes
   through the cached mat(), so these materials were ALREADY shared across every
   object using the same colour and intensity. Twenty lanterns each wrote the
   same shared material every frame and the last one to run won — so the
   per-object phase some of them carried was already being thrown away. One
   entry per material makes that explicit rather than accidental. */
const matTicks=new Map();
const matAnim=(m,fn)=>{ if(m&&!matTicks.has(m)) matTicks.set(m,fn); };
function disposeGroup(g){
  const cached=new Set(matCache.values());
  g.traverse(o=>{
    if(!(o.isMesh||o.isPoints||o.isSprite))return;
    o.geometry?.dispose?.();
    /* Cached materials are shared with the next build; per-instance ones (the
       few that animate opacity) are ours to free. */
    const m=o.material;
    if(m&&!cached.has(m)) (Array.isArray(m)?m:[m]).forEach(x=>x.dispose?.());
  });
  g.removeFromParent();
}

function keelCone(prof, radius, depth, seed, taper=1){
  const rnd=rngOf(seed), n=prof.length, pos=[];
  const ring=(scale,y,jit)=>{
    const a=[];
    for(let i=0;i<n;i++){
      const ang=i/n*TAU, r=prof[i]*radius*scale*(1+(rnd()-0.5)*jit);
      a.push([Math.cos(ang)*r,y,Math.sin(ang)*r]);
    }
    return a;
  };
  const r0=ring(1,0,0), r1=ring(0.66*taper,-depth*0.42,0.28), r2=ring(0.3*taper,-depth*0.76,0.4);
  const apex=[(rnd()-0.5)*radius*0.15,-depth,(rnd()-0.5)*radius*0.15];
  const quad=(A,B)=>{ for(let i=0;i<n;i++){ const j=(i+1)%n;
    pos.push(...A[i],...B[i],...B[j], ...A[i],...B[j],...A[j]); } };
  quad(r0,r1); quad(r1,r2);
  for(let i=0;i<n;i++){ const j=(i+1)%n; pos.push(...r2[i],...apex,...r2[j]); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals(); return g;
}

/* A tapered shaft's wall is at a different radius at every height, and every
   tower in this file builds its shaft as a stack of cones and then hangs
   windows on it afterwards. Those windows were all placed at `r` — which by
   then is the FINAL, narrowest radius at the very top — while their heights
   were spread over the whole shaft. So every window below the top segment was
   buried inside the brickwork, z-fighting with the wall it was meant to be cut
   into and popping through it as the camera swung.

   Record the segments on the way up, ask this for the radius at a height. */
function taper(){
  const segs=[];
  return {
    add(y0,y1,rBottom,rTop){ segs.push({y0,y1,rBottom,rTop}); },
    at(y){
      for(const s of segs){
        if(y>=s.y0&&y<=s.y1)
          return lerp(s.rBottom,s.rTop,(y-s.y0)/Math.max(1e-6,s.y1-s.y0));
      }
      if(!segs.length)return 0.5;
      return y<segs[0].y0?segs[0].rBottom:segs[segs.length-1].rTop;
    },
  };
}
function keelCrystal(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  /* No crystal down here. The skirt of hanging shards read as a hazard rather
     than as the bottom of somewhere you would want to live, and it fought the
     crystal ON the island — which is where the realm's magic is supposed to be.
     The underside is plain dressed marble now, and the mineral stays above
     ground where it means something.

     What carries it instead is STRATA: the plate is a stack of scalloped
     courses, each one narrower and a shade deeper than the one above, so the
     keel reads as quarried stone that was cut, not as a cone that was poured.
     Same silhouette from a distance, and it holds up close. */
  const courses=Math.max(4,Math.round(depth/1.6));
  for(let i=0;i<courses;i++){
    const u0=i/courses, u1=(i+1)/courses;
    /* Each course is an extruded slice of the island outline, shrunk as it
       descends — the scallops in the coast carry all the way down. */
    /* Exponent under 1 keeps the upper courses broad and then runs the taper
       away quickly at the bottom — the difference between a keel and a stack of
       plates. The old floor of 0.30R left a fat stub that the tip cone sat on
       like a bucket; it goes almost to nothing now and the point is a detail
       rather than a separate object. */
    const sc=Math.pow(1-u0,0.55), sc1=Math.pow(1-u1,0.55);
    const rr=R*lerp(0.06,0.995,sc), rr1=R*lerp(0.06,0.995,sc1);
    const th=depth/courses;
    const shape=polyShape(prof,rr);
    const geo=new THREE.ExtrudeGeometry(shape,
      {depth:th*1.06,bevelEnabled:false,curveSegments:1});
    /* ExtrudeGeometry runs along +Z, and rotateX(-90) sends +Z to +Y — so an
       untranslated course grows UPWARD out of the keel's origin. The first one
       therefore punched a full course-height up through the outermost terrace
       ring at exactly the same radius, and two coplanar walls fighting for the
       same depth is what the flicker was. Every course is dropped by its own
       thickness so it hangs BELOW the origin, where a keel goes. */
    geo.rotateX(-Math.PI/2); geo.translate(0,-u0*depth-th*1.06,0);
    geo.computeVertexNormals();
    /* Alternate the courses so the bedding shows, and darken with depth: light
       falls off under an island, and a keel of one flat tone reads as a decal. */
    const tone=new THREE.Color(i%2?P.cliff2:P.rock)
      .lerp(new THREE.Color(0x000000),u0*0.28);
    g.add(meshOf(geo,mat(tone.getHex(),{rough:0.86}),true,false));
    /* A drip edge standing proud of each course's own bottom rim, catching the
       bounce light from below. Hung on rr, not rr1 — on the next course down it
       would sit buried inside this one and never be seen. */
    if(i<courses-1){
      const lip=meshOf(new THREE.TorusGeometry(rr*1.005,th*0.11,4,26),
        mat(P.cliff,{rough:0.8}),true,false);
      lip.rotation.x=Math.PI/2;
      lip.position.y=-u0*depth-th*1.06+th*0.1; g.add(lip);
    }
  }
  /* The point: a short tapered plug so the strata resolve instead of stopping
     on a flat disc. */
  const tipH=depth*0.12;
  const tip=meshOf(new THREE.ConeGeometry(R*0.075,tipH,9),
    mat(mixTok(P.rock,0x000000,0.34),{rough:0.9}),true,false);
  tip.position.y=-depth-tipH/2+0.03; g.add(tip);
  return g;
}
function keelRoots(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  g.add(meshOf(keelCone(prof,R,depth,seed),mat(P.rock,{rough:0.98}),true,false));
  /* Root ribs running down the cone. Built as a chain of short tapering
     segments that follow the cone's own slope rather than as one big arc —
     a torus laid against the outside stood off the mass and read as a spider
     leg, which is the opposite of "the roots hold this island together". Each
     rib starts on the rim and walks inward and down, hugging the taper. */
  const n=Math.round(9+R*1.0);
  const rootMat=mat(P.bark2,{rough:0.98}), rootMat2=mat(P.bark,{rough:0.98});
  for(let i=0;i<n;i++){
    const a=i/n*TAU+rnd()*0.18;
    const rr=radiusAt(prof,a)*R;
    const steps=4+Math.floor(rnd()*3);
    let th=lerp(0.26,0.5,rnd());
    /* Slight lateral drift per rib so they are not six identical meridians. */
    const drift=(rnd()-0.5)*0.5/steps;
    let aa=a;
    for(let k=0;k<steps;k++){
      const u0=k/steps, u1=(k+1)/steps;
      /* Match keelCone's own profile: rim → 0.66 → 0.30 → apex. */
      const rOf=u=>rr*(u<0.42?lerp(1,0.66,u/0.42)
                     : u<0.76?lerp(0.66,0.30,(u-0.42)/0.34)
                     : lerp(0.30,0.04,(u-0.76)/0.24));
      const yOf=u=>-depth*u;
      const p0=new THREE.Vector3(Math.cos(aa)*rOf(u0)*1.02,yOf(u0),Math.sin(aa)*rOf(u0)*1.02);
      aa+=drift;
      const p1=new THREE.Vector3(Math.cos(aa)*rOf(u1)*1.02,yOf(u1),Math.sin(aa)*rOf(u1)*1.02);
      g.add(beam(p0,p1,th,k%2?rootMat:rootMat2));
      th*=lerp(0.74,0.88,rnd());
    }
    /* A tail root carrying on past the apex, so the mass frays into strands
       instead of stopping at a clean point. */
    if(rnd()<0.5){
      const tl=meshOf(new THREE.CylinderGeometry(th*1.1,th*0.25,lerp(1.0,2.4,rnd()),5),
        rootMat,true,false);
      tl.position.set(Math.cos(aa)*rr*0.08,-depth-0.6,Math.sin(aa)*rr*0.08);
      tl.rotation.set((rnd()-0.5)*0.4,rnd()*TAU,(rnd()-0.5)*0.4);
      g.add(tl);
    }
  }
  /* Vines off the rim, with a leaf or two. Cheap, and they read as growth. */
  for(let i=0;i<Math.round(10+R*1.6);i++){
    const a=rnd()*TAU, rr=radiusAt(prof,a)*R*lerp(0.9,1.0,rnd());
    const len=lerp(0.7,2.4,rnd());
    const v=meshOf(new THREE.CylinderGeometry(0.045,0.02,len,4),
      mat(P.moss2,{rough:1}),false,false);
    v.position.set(Math.cos(a)*rr,-len/2-0.05,Math.sin(a)*rr); g.add(v);
    const lf=meshOf(new THREE.IcosahedronGeometry(lerp(0.14,0.28,rnd()),0),
      mat(rnd()<0.5?P.canopy:P.moss,{rough:0.98}),false,false);
    lf.position.set(Math.cos(a)*rr,-len-0.1,Math.sin(a)*rr); lf.scale.y=0.6; g.add(lf);
  }
  return g;
}

function keelColumns(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  /* No cone at all here — the concept image's underside is COLUMNS, stepping
     inward and downward like a pipe organ, and a cone hidden behind them just
     fills the gaps that make the shape read. Concentric bands of hexagonal
     prisms, each band narrower and longer than the one outside it. */
  const bands=Math.max(3,Math.round(R/1.5));
  const dark=mat(P.rock,{rough:0.95}), mid=mat(P.cliff2,{rough:0.95});
  for(let b=0;b<bands;b++){
    const u=b/(bands-1||1);
    const rr=R*lerp(0.98,0.16,u);
    const len=depth*lerp(0.30,1.0,u*u*0.9+u*0.1);
    const n=Math.max(6,Math.round(TAU*rr/0.72));
    for(let i=0;i<n;i++){
      const a=i/n*TAU+b*0.4;
      const w=lerp(0.30,0.46,rnd());
      const jl=len*lerp(0.72,1.0,rnd());
      const col=meshOf(new THREE.CylinderGeometry(w,w*0.96,jl,6),
        rnd()<0.5?dark:mid,true,false);
      const wr=radiusAt(prof,a)*rr;
      col.position.set(Math.cos(a)*wr,-jl/2+0.05,Math.sin(a)*wr);
      col.rotation.y=rnd()*TAU;
      g.add(col);
    }
  }
  /* Molten light in the gaps. The columns are dark and the light comes from
     between them — same rule as the ground veins: a dark surface with light
     coming out of it, never a bright surface. */
  const lm=mat(mixTok(P.lava,0x1A0E14,0.35),{emissive:P.lava,ei:0.9,rough:0.6});
  const nc=Math.round(10+R*1.4);
  for(let i=0;i<nc;i++){
    const a=i*2.399963229728653+rnd()*0.3;
    const rr=radiusAt(prof,a)*R*lerp(0.3,0.95,rnd());
    const h=lerp(0.6,2.0,rnd());
    const s=meshOf(new THREE.BoxGeometry(lerp(0.1,0.26,rnd()),h,0.1),lm,false,false);
    s.position.set(Math.cos(a)*rr,-lerp(0.4,depth*0.6,rnd()),Math.sin(a)*rr);
    s.rotation.y=-a; g.add(s);
  }
  return g;
}

function keelCrag(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  g.add(meshOf(keelCone(prof,R,depth,seed),mat(P.rock,{rough:1}),true,false));
  /* Boulders stuck all over it. The shipyard crag in the art is not a smooth
     wedge — it is a pile, and the pile is what makes the deck above read as
     poured concrete rather than as more of the same stone. */
  const n=Math.round(40+R*7);
  const a1=mat(P.cliff,{rough:1}), a2=mat(P.cliff2,{rough:1});
  for(let i=0;i<n;i++){
    const a=i*2.399963229728653+rnd()*0.5;
    const u=Math.pow(rnd(),0.7);
    const rr=radiusAt(prof,a)*R*lerp(1.0,0.2,u);
    const y=-depth*u*0.95;
    const s=lerp(0.22,0.72,rnd())*lerp(1.35,0.6,u);
    const b=meshOf(new THREE.DodecahedronGeometry(s,0),rnd()<0.5?a1:a2,true,false);
    b.position.set(Math.cos(a)*rr,y,Math.sin(a)*rr);
    b.rotation.set(rnd()*3,rnd()*3,rnd()*3);
    b.scale.set(1,lerp(0.6,1.1,rnd()),1);
    g.add(b);
  }
  return g;
}

function keelIce(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  g.add(meshOf(keelCone(prof,R,depth,seed),mat(P.rock,{rough:0.95}),true,false));
  /* Snow lying on the rim shelf, then icicles. In the art the icicles are the
     single loudest signal that this island is cold — long, irregular, hanging in
     a fringe all the way round, and thickest where the rim overhangs most. */
  const nr=Math.round(TAU*R/0.55);
  for(let i=0;i<nr;i++){
    const a=i/nr*TAU;
    const rr=radiusAt(prof,a)*R;
    const sn=meshOf(new THREE.IcosahedronGeometry(lerp(0.3,0.55,rnd()),0),
      mat(P.snow,{rough:1}),true,true);
    sn.position.set(Math.cos(a)*rr*0.995,0.02,Math.sin(a)*rr*0.995);
    sn.scale.set(1,0.34,1); sn.rotation.y=rnd()*TAU;
    g.add(sn);
  }
  const iceMat=mat(P.ice,{rough:0.16,flat:true,opacity:0.88,emissive:P.ice,ei:0.10});
  const ni=Math.round(16+R*3.2);
  for(let i=0;i<ni;i++){
    const a=i/ni*TAU+rnd()*0.25;
    const rr=radiusAt(prof,a)*R*lerp(0.72,1.0,rnd());
    const len=lerp(0.8,3.4,Math.pow(rnd(),1.6));
    const w=lerp(0.09,0.2,rnd());
    const ic=meshOf(new THREE.ConeGeometry(w,len,5),iceMat,true,false);
    ic.position.set(Math.cos(a)*rr,-len/2-0.1,Math.sin(a)*rr);
    ic.rotation.set(0,rnd()*TAU,Math.PI);   // point down
    g.add(ic);
  }
  return g;
}

function keelClay(P,prof,R,depth,seed){
  const g=new THREE.Group(), rnd=rngOf(seed);
  g.add(meshOf(keelCone(prof,R,depth,seed,0.92),mat(P.rock,{rough:1}),true,false));
  /* Rounded clay lumps rather than faceted crag — the artisan island in the art
     is soft, almost dough-like, and that softness is the realm's whole mood. */
  const n=Math.round(26+R*4.4);
  const m1=mat(P.cliff,{rough:1,flat:false}), m2=mat(P.cliff2,{rough:1,flat:false});
  for(let i=0;i<n;i++){
    const a=i*2.399963229728653+rnd()*0.4;
    const u=Math.pow(rnd(),0.8);
    const rr=radiusAt(prof,a)*R*lerp(0.98,0.25,u);
    const s=lerp(0.5,1.15,rnd())*lerp(1.2,0.55,u);
    const b=meshOf(new THREE.SphereGeometry(s,7,6),rnd()<0.5?m1:m2,true,false);
    b.position.set(Math.cos(a)*rr,-depth*u*0.9-0.1,Math.sin(a)*rr);
    b.scale.set(1,lerp(0.7,1.0,rnd()),1);
    g.add(b);
  }
  /* Shrubs spilling over the lip, which is what stops the boulder from reading
     as bare earth — in the art there is a green fringe all the way round. */
  for(let i=0;i<Math.round(14+R*2.6);i++){
    const a=rnd()*TAU, rr=radiusAt(prof,a)*R*lerp(0.94,1.02,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.2,0.42,rnd()),0),
      mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.98}),true,false);
    b.position.set(Math.cos(a)*rr,lerp(-0.7,-0.05,rnd()),Math.sin(a)*rr);
    b.scale.y=0.7; g.add(b);
  }
  return g;
}

const KEELS={crystal:keelCrystal,roots:keelRoots,columns:keelColumns,
             crag:keelCrag,ice:keelIce,clay:keelClay};

/* A cylinder from a to b — struts, bridge posts, hanging vines, crane legs. */
function beam(a,b,r,material,cast=true){
  const dir=new THREE.Vector3().subVectors(b,a), len=dir.length();
  const m=meshOf(new THREE.CylinderGeometry(r,r,len,6),material,cast,false);
  m.position.copy(a).addScaledVector(dir,0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  return m;
}

/* The waterline whatever is currently being built floats on: the flooded ground
   under a harbour district, or the open sea under a whole realm. Boats and gulls
   read it, so it is set by buildIsland before anything that sails is placed. */
let SEA_Y=-2.3;

/* ---- spec(level): every number the builder needs, derived from one knob ---- */
function spec(level){
  const t=(level-1)/11;
  const radius=snapR(2.4+11.6*Math.pow(t,1.05));   // 2.7 → 14.4 on the ring grid
  return {
    level, radius,
    rings:  Math.round(radius/RING_W),
    /* UNLOCK GATES, not counts. How many of a family exist is decided by how
       much of its lattice falls inside the coast and under the fill threshold —
       and both of those only ever open further. */
    cottages: level<2?0:1,
    towers:   level<6?0:Math.round((level-4)/2),   // capped per realm in build()
    halls:    level<6?0:level<10?1:2,
    trees:    level<2?0:1,
    lamps:    level<2?0:1,
    gardens:  level<4?0:1,
    fill:     clamp(0.58+level*0.038,0.58,1),
    pond:     level>=5,
    falls:    level>=7,
    expand:   level>=9,
    undercroft: level<10?0:Math.round(radius*1.1),
    great:    level>=11,
    arch:     level>=3,
    signature: level>=3,
    banners:  level>=3,
    life:     level>=6?Math.min(3+level,14):0,
    motes:    3+level*3,
  };
}

/* --------------------------------------------------------------- terraces */
/* One ring of land. Geometry depends only on j — never on the island's current
   size — so ring 5 built at L4 is the identical mesh at L12 and simply stays
   put. */
function buildRing(P,prof,j){
  const r1=(j+1)*RING_W, r0=j*RING_W;
  const y=tierY(r1-1e-6)+j*0.002;
  const shape=polyShape(prof,r1);
  if(j>0) shape.holes.push(polyHole(prof,r0-0.06));
  const geo=new THREE.ExtrudeGeometry(shape,
    {depth:RING_T,bevelEnabled:false,curveSegments:1});
  geo.rotateX(-Math.PI/2); geo.translate(0,y-RING_T,0); geo.computeVertexNormals();
  /* Group 0 is the caps, group 1 the walls. The upper terraces are lightened a
     touch — in every one of the concept images the top plate catches the most
     sun, and a flat cap colour across four terraces reads as a printed map. */
  const tier=tierOf(r1-1e-6);
  const cap=new THREE.Color(tier===0?P.ground2:P.ground)
    .lerp(new THREE.Color(0xFFFFFF),Math.max(0,3-tier)*0.045);
  /* Built by hand rather than through meshOf, because the ring wants two
     materials — so the bake has to be asked for here or the terraces render
     black under a vertexColors material. */
  if(FX.vc) bakeVC(geo);
  const m=new THREE.Mesh(geo,[mat(cap.getHex(),{rough:0.98}),
    mat(j%2?P.cliff:P.cliff2,{rough:0.95})]);
  m.castShadow=true; m.receiveShadow=true;
  return m;
}

/* =========================================================== shared pieces
   Small parts every realm needs and none of them needs to disagree about. Where
   a realm DOES need to disagree, the disagreement is a `style` argument rather
   than a sixth copy of the function. */

/* A cylinder from a to b — struts, bridge posts, hanging vines, crane legs. */
function buildLodestone(P,rnd){
  const g=new THREE.Group();
  g.add(meshOf(new THREE.CylinderGeometry(0.50,0.60,0.17,9),
    mat(P.stone2,{rough:0.95})).translateY(0.085));
  for(let i=0;i<7;i++){
    const a=i/7*TAU+rnd()*0.22, sz=lerp(0.09,0.15,rnd());
    const k=meshOf(new THREE.DodecahedronGeometry(sz,0),mat(P.rock,{rough:1}));
    k.position.set(Math.cos(a)*0.58,0.10,Math.sin(a)*0.58);
    k.rotation.set(rnd()*3,rnd()*3,rnd()*3); g.add(k);
  }
  for(let i=0;i<3;i++){
    const a=rnd()*TAU, d=0.86+rnd()*0.46;
    const pv=meshOf(new THREE.BoxGeometry(0.44,0.07,0.32),mat(P.stone2,{rough:0.98}),false,true);
    pv.position.set(Math.cos(a)*d,0.04,Math.sin(a)*d);
    pv.rotation.y=rnd()*TAU; g.add(pv);
  }
  const h=1.52+rnd()*0.26;
  const st=new THREE.Group();
  const slab=meshOf(new THREE.CylinderGeometry(0.185,0.30,h,5),mat(P.stone,{rough:0.9}));
  slab.scale.z=0.52; slab.position.y=h/2; st.add(slab);
  const band=meshOf(new THREE.CylinderGeometry(0.212,0.222,0.10,5),
    glowMat(P.accent,1.35),false,false);
  band.scale.z=0.56; band.position.y=h*0.74; st.add(band);
  const band2=meshOf(new THREE.CylinderGeometry(0.238,0.248,0.06,5),
    mat(P.stone2,{rough:0.92}),false,false);
  band2.scale.z=0.56; band2.position.y=h*0.50; st.add(band2);
  st.position.y=0.16; st.rotation.set(0.05,rnd()*TAU,-0.05); g.add(st);
  /* The marker on the head of the stone, and it belongs to the realm. A
     floating shard is right in a sky-garden and wrong on a fortress and a
     market town, where it read as a gem somebody had left hovering over the
     cobbles for no reason. Only the realms whose art contains levitation get
     anything that leaves the stone at all — and it is still the one moving
     thing on an L1 plot, which is the difference between a world that is small
     and a world that is asleep. */
  const cy=h+0.52;
  if(P.kit==='swarm'){
    const c=meshOf(new THREE.OctahedronGeometry(0.25),glowMat(P.crys,1.9),false,false);
    c.scale.y=1.5; c.position.y=cy+0.1;
    c.userData.tick=t=>{ c.rotation.y=t*0.5; c.position.y=cy+0.1+Math.sin(t*1.15)*0.08; };
    g.add(c); animated.push(c);
  }else if(P.kit==='frame'){
    /* A seed-lantern hung off a bent twig — it swings, it does not hover. */
    const arm=meshOf(new THREE.TorusGeometry(0.2,0.025,5,10,Math.PI*0.5),
      mat(P.bark2,{rough:1}));
    arm.position.y=cy; arm.rotation.set(Math.PI/2,0,Math.PI*0.5); g.add(arm);
    const pod=meshOf(new THREE.SphereGeometry(0.13,9,7),glowMat(P.warm,1.8),false,false);
    pod.scale.y=1.35; pod.position.set(0.2,cy-0.22,0); g.add(pod);
    const ph=rnd()*TAU;
    pod.userData.tick=t=>{ pod.position.x=0.2+Math.sin(t*1.1+ph)*0.03; };
    animated.push(pod);
  }else if(P.kit==='forge'){
    /* A tallow lamp on an iron spike, sitting on the stone. */
    const spike=meshOf(new THREE.CylinderGeometry(0.03,0.045,0.22,6),
      mat(P.metal,{metal:0.5,rough:0.5}));
    spike.position.y=cy-0.05; g.add(spike);
    const bowl=meshOf(new THREE.CylinderGeometry(0.13,0.08,0.11,8),
      mat(P.iron,{metal:0.4,rough:0.6}));
    bowl.position.y=cy+0.11; g.add(bowl);
    const f=meshOf(new THREE.ConeGeometry(0.09,0.22,6),glowMat(P.warm,2.1),false,false);
    f.position.y=cy+0.26;
    const ph=rnd()*TAU;
    f.userData.tick=t=>{ f.scale.set(1,1+Math.sin(t*6+ph)*0.18,1); };
    g.add(f); animated.push(f);
  }else if(P.kit==='ship'){
    /* A harbour light in a cage — bolted down, as everything here is. */
    const cage=meshOf(new THREE.CylinderGeometry(0.13,0.15,0.24,8),
      mat(P.metal,{metal:0.5,rough:0.45}));
    cage.position.y=cy+0.06; g.add(cage);
    const lens=meshOf(new THREE.CylinderGeometry(0.1,0.1,0.15,8),
      glowMat(P.warm,1.9),false,false);
    lens.position.y=cy+0.06; g.add(lens);
    const cap=meshOf(new THREE.ConeGeometry(0.17,0.12,8),mat(P.stripe,{rough:0.6}));
    cap.position.y=cy+0.24; g.add(cap);
  }else if(P.kit==='bastion'){
    /* A rune plate set flat into the head of the stone. */
    const plate=meshOf(new THREE.CylinderGeometry(0.19,0.21,0.07,6),
      mat(P.metal,{metal:0.55,rough:0.45}));
    plate.position.y=cy-0.02; g.add(plate);
    const rune=meshOf(new THREE.TorusGeometry(0.11,0.026,5,14),
      mat(P.ward,{emissive:P.ward,ei:1.3,rough:0.4,flat:false}),false,false);
    rune.rotation.x=Math.PI/2; rune.position.y=cy+0.03; g.add(rune);
    const bar=meshOf(new THREE.BoxGeometry(0.2,0.03,0.035),
      mat(P.ward,{emissive:P.ward,ei:1.3,rough:0.4,flat:false}),false,false);
    bar.position.y=cy+0.03; g.add(bar);
  }else{
    /* A small iron weathervane. It turns; it does not levitate. */
    const post=meshOf(new THREE.CylinderGeometry(0.022,0.03,0.3,6),
      mat(P.metal,{metal:0.55,rough:0.45}));
    post.position.y=cy; g.add(post);
    const vane=new THREE.Group(); vane.position.y=cy+0.17; g.add(vane);
    vane.add(meshOf(new THREE.BoxGeometry(0.3,0.02,0.02),
      mat(P.metal,{metal:0.55,rough:0.45}),false,false));
    const tail=meshOf(new THREE.BoxGeometry(0.11,0.1,0.015),
      mat(P.metal,{metal:0.55,rough:0.45}),false,false);
    tail.position.x=-0.14; vane.add(tail);
    const head=meshOf(new THREE.ConeGeometry(0.04,0.1,4),
      mat(P.rose2,{rough:0.8}),false,false);
    head.rotation.z=-Math.PI/2; head.position.x=0.17; vane.add(head);
    const ph=rnd()*TAU;
    vane.userData.tick=t=>{ vane.rotation.y=Math.sin(t*0.4+ph)*1.2; };
    animated.push(vane);
  }
  return g;
}

/* --------------------------------------------------------------- lighting
   Lamps are in every single concept image and they are always the same idea:
   a small warm point at head height, repeated along a path. What differs is the
   fitting, so that is all that varies here. */
/* Six fittings, one per realm — no two realms share one. A lamp is the single
   most repeated object on any island (30-odd at L12), so when three realms drew
   the same post-with-a-box the repetition was multiplied by thirty before
   anything else in the district got a chance to differ. The post is the only
   part they still have in common, and even that changes material. */
function postLamp(P,rnd,style){
  const g=new THREE.Group();
  const h=lerp(0.9,1.45,rnd());
  const iron=mat(P.metal,{metal:0.45,rough:0.5});
  let lx=0, ly=h+0.08;

  if(style==='crystal'){
    /* Swarm — a shard floating clear of a marble pylon. No housing at all: in
       this realm the light IS the mineral, and a lantern would be a machine. */
    const post=meshOf(new THREE.CylinderGeometry(0.06,0.1,h,4),
      mat(P.stone2,{rough:0.8}));
    post.rotation.y=Math.PI/4; post.position.y=h/2; g.add(post);
    const cap=meshOf(new THREE.CylinderGeometry(0.14,0.1,0.1,4),
      mat(P.stone,{rough:0.8}));
    cap.rotation.y=Math.PI/4; cap.position.y=h+0.05; g.add(cap);
    const c=meshOf(new THREE.OctahedronGeometry(0.16),
      glowMat(P.crys??P.accent,1.9),false,false);
    c.scale.y=1.7; c.position.y=h+0.36;
    const ph=rnd()*TAU;
    c.userData.tick=t=>{ c.rotation.y=t*0.5;
      c.position.y=h+0.36+Math.sin(t*1.2+ph)*0.05; };
    g.add(c); animated.push(c);
    ly=h+0.36;

  }else if(style==='timber'){
    /* Frameworks — a bent sapling crook with the lantern swinging off the end.
       Nothing in that reference is bolted to a straight pole. */
    const wood=mat(P.wood,{rough:0.95});
    g.add(meshOf(new THREE.CylinderGeometry(0.05,0.08,h,5),wood).translateY(h/2));
    const arm=meshOf(new THREE.TorusGeometry(0.3,0.045,5,10,Math.PI*0.55),wood);
    arm.position.y=h; arm.rotation.set(Math.PI/2,0,Math.PI*0.5); g.add(arm);
    const tip=0.3;
    g.add(beam(new THREE.Vector3(tip,h+0.24,0),new THREE.Vector3(tip,h+0.06,0),
      0.018,mat(P.bark2??P.wood,{rough:1}),false));
    const lan=meshOf(new THREE.CylinderGeometry(0.11,0.13,0.22,6),
      glowMat(P.warm,1.9),false,false);
    lan.position.set(tip,h-0.06,0); g.add(lan);
    const hood=meshOf(new THREE.ConeGeometry(0.17,0.13,6),mat(P.moss,{rough:0.85}));
    hood.position.set(tip,h+0.1,0); g.add(hood);
    /* It swings. One tick, and it is the thing that makes the path feel windy. */
    const ph=rnd()*TAU;
    lan.userData.tick=t=>{ lan.position.x=tip+Math.sin(t*1.1+ph)*0.035; };
    animated.push(lan);
    lx=tip; ly=h-0.06;

  }else if(style==='cage'){
    /* Forges — a caged flame pot on a stubby riveted stump. Low, heavy, and
       nothing like the dock masts or the wrought iron. */
    const stump=meshOf(new THREE.CylinderGeometry(0.1,0.15,h*0.62,8),
      mat(P.iron,{metal:0.4,rough:0.6}));
    stump.position.y=h*0.31; g.add(stump);
    const pot=meshOf(new THREE.CylinderGeometry(0.17,0.12,0.24,8),
      mat(P.iron2,{metal:0.45,rough:0.55}));
    pot.position.y=h*0.62+0.12; g.add(pot);
    const coal=meshOf(new THREE.CylinderGeometry(0.14,0.14,0.06,8),
      glowMat(P.lava,1.8),false,false);
    coal.position.y=h*0.62+0.25; g.add(coal);
    /* The cage: four uprights and a ring cap over the flame. */
    for(let k=0;k<4;k++){
      const a=k/4*TAU;
      g.add(beam(new THREE.Vector3(Math.cos(a)*0.15,h*0.62+0.2,Math.sin(a)*0.15),
                 new THREE.Vector3(Math.cos(a)*0.1,h*0.62+0.56,Math.sin(a)*0.1),
                 0.022,mat(P.metal,{metal:0.55,rough:0.45}),false));
    }
    const lid=meshOf(new THREE.ConeGeometry(0.16,0.12,8),
      mat(P.metal,{metal:0.55,rough:0.45}));
    lid.position.y=h*0.62+0.62; g.add(lid);
    const ph=rnd()*TAU;
    coal.userData.tick=t=>{ coal.material.emissiveIntensity=1.6+Math.sin(t*5+ph)*0.5; };
    animated.push(coal);
    ly=h*0.62+0.3;

  }else if(style==='dock'){
    /* Shipyards — a tapered mast with a gooseneck and a downlight. Utility
       fitting, aimed at the ground, exactly what stands along a quay. */
    const mast=meshOf(new THREE.CylinderGeometry(0.045,0.09,h*1.25,7),iron);
    mast.position.y=h*0.625; g.add(mast);
    const neck=meshOf(new THREE.TorusGeometry(0.2,0.035,5,10,Math.PI*0.5),iron);
    neck.position.set(0,h*1.25,0); neck.rotation.set(Math.PI/2,0,Math.PI); g.add(neck);
    const shade=meshOf(new THREE.CylinderGeometry(0.17,0.09,0.14,10),
      mat(P.stripe,{rough:0.6}));
    shade.position.set(0.2,h*1.25-0.14,0); g.add(shade);
    const bulb=meshOf(new THREE.SphereGeometry(0.09,8,6),glowMat(P.warm,2.0),false,false);
    bulb.position.set(0.2,h*1.25-0.24,0); g.add(bulb);
    lx=0.2; ly=h*1.25-0.24;

  }else if(style==='brazier'){
    /* Bastion — an iron fire-basket on a stone plinth. Nothing in a snow
       fortress is made of glass. */
    const plinth=meshOf(new THREE.CylinderGeometry(0.16,0.2,h*0.5,6),
      mat(P.stone2,{rough:0.94}));
    plinth.position.y=h*0.25; g.add(plinth);
    const snow=meshOf(new THREE.CylinderGeometry(0.17,0.17,0.05,6),
      mat(P.snow,{rough:1}),false,false);
    snow.position.y=h*0.5; g.add(snow);
    const stem=meshOf(new THREE.CylinderGeometry(0.05,0.06,h*0.4,6),iron);
    stem.position.y=h*0.7; g.add(stem);
    const bowl=meshOf(new THREE.CylinderGeometry(0.2,0.11,0.2,7,1,true),
      mat(P.metal,{metal:0.5,rough:0.5,side:THREE.DoubleSide}));
    bowl.position.y=h*0.9+0.1; g.add(bowl);
    const fire=meshOf(new THREE.ConeGeometry(0.15,0.36,6),glowMat(P.warm,2.1),false,false);
    fire.position.y=h*0.9+0.3; g.add(fire);
    const ph=rnd()*TAU;
    fire.userData.tick=t=>{ fire.scale.set(1,1+Math.sin(t*6+ph)*0.16,1);
      fire.material.emissiveIntensity=1.9+Math.sin(t*7.3+ph)*0.5; };
    animated.push(fire);
    ly=h*0.9+0.3;

  }else{
    /* Artisan's — wrought iron with a scrolled arm and a glazed box, which is
       the fitting actually drawn in that reference. */
    const post=meshOf(new THREE.CylinderGeometry(0.04,0.08,h,8),iron);
    post.position.y=h/2; g.add(post);
    for(let i=0;i<2;i++){                      // collar mouldings
      const c=meshOf(new THREE.TorusGeometry(0.055,0.022,4,10),iron,false,false);
      c.rotation.x=Math.PI/2; c.position.y=h*(0.3+i*0.42); g.add(c);
    }
    const scroll=meshOf(new THREE.TorusGeometry(0.16,0.028,5,12,Math.PI*1.2),iron);
    scroll.position.set(0.13,h-0.02,0); scroll.rotation.y=Math.PI/2; g.add(scroll);
    const arm=meshOf(new THREE.BoxGeometry(0.3,0.04,0.04),iron);
    arm.position.set(0.14,h+0.1,0); g.add(arm);
    const box=meshOf(new THREE.CylinderGeometry(0.1,0.13,0.24,4),
      glowMat(P.warm,1.9),false,false);
    box.rotation.y=Math.PI/4; box.position.set(0.27,h-0.04,0); g.add(box);
    const roof=meshOf(new THREE.ConeGeometry(0.16,0.13,4),iron);
    roof.rotation.y=Math.PI/4; roof.position.set(0.27,h+0.14,0); g.add(roof);
    const fin=meshOf(new THREE.SphereGeometry(0.035,6,5),iron,false,false);
    fin.position.set(0.27,h+0.23,0); g.add(fin);
    lx=0.27; ly=h-0.04;
  }

  /* Halo kept small and dim on purpose: additive sprites STACK, and a dozen
     lamps on one terrace sum into a lens flare over the middle of the town. */
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,
    color:style==='crystal'?(P.crys??P.warm):P.warm,
    transparent:true,opacity:0.20,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.scale.setScalar(0.62); s.position.set(lx,ly,0); g.add(s);
  const ph=rnd()*TAU;
  g.userData.tick=t=>{ s.material.opacity=0.16+Math.sin(t*2+ph)*0.06; };
  animated.push(g);
  return g;
}

function buildBanner(P,rnd,h=1.9){
  const g=new THREE.Group();
  g.add(meshOf(new THREE.CylinderGeometry(0.05,0.05,h,5),mat(P.wood)).translateY(h/2));
  const w=0.5,hh=0.85;
  const cloth=meshOf(new THREE.PlaneGeometry(w,hh,6,4),
    mat(rnd()<0.5?P.roof2:P.accent,{side:THREE.DoubleSide,flat:false,rough:0.85}),true,false);
  cloth.position.set(w/2,h-hh/2-0.1,0); g.add(cloth);
  const base=cloth.geometry.attributes.position.array.slice();
  const ph=rnd()*TAU;
  cloth.userData.tick=t=>{
    const p=cloth.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=base[i*3], y=base[i*3+1];
      p.setZ(i,Math.sin(t*3+ph+x*5+y*1.5)*0.07*(x/w+0.5));
    }
    p.needsUpdate=true;
  };
  animated.push(cloth);
  return g;
}

/* The gate. Every realm has one because every realm has a way IN, and the way
   in is where the district hangs its colours — but it was two posts and a torus
   in all six, which made the one object whose whole job is to announce a place
   the least place-specific thing on the island. */
function buildGate(P,rnd){
  const g=new THREE.Group();
  const kit=P.kit;

  if(kit==='swarm'){
    /* A moon gate: a single ring standing on the turf, with nothing holding it
       shut. You pass through a hole in the air. */
    const rr=lerp(0.95,1.3,rnd());
    const ring=meshOf(new THREE.TorusGeometry(rr,0.13,8,26),mat(P.stone,{rough:0.7}));
    ring.position.y=rr+0.18; g.add(ring);
    const inner=meshOf(new THREE.TorusGeometry(rr*0.82,0.045,6,24),
      glowMat(P.crys,1.3),false,false);
    inner.position.y=rr+0.18; g.add(inner);
    inner.userData.tick=t=>{ inner.rotation.z=t*0.18;
      inner.material.emissiveIntensity=1.1+Math.sin(t*1.1)*0.3; };
    animated.push(inner);
    for(const sd of [-1,1]){
      const foot=meshOf(new THREE.CylinderGeometry(0.16,0.24,0.36,8),
        mat(P.stone2,{rough:0.75}));
      foot.position.set(sd*rr*0.72,0.18,0); g.add(foot);
    }

  }else if(kit==='frame'){
    /* Two saplings bent together and grown into an arch, with vines on it.
       Nothing here is quarried. */
    const woodM=mat(P.bark,{rough:0.96});
    const h=lerp(1.9,2.5,rnd()), w=lerp(0.85,1.15,rnd());
    for(const sd of [-1,1]){
      g.add(meshOf(new THREE.CylinderGeometry(0.09,0.15,h*0.68,6),woodM)
        .translateX(sd*w).translateY(h*0.34));
      const bend=meshOf(new THREE.TorusGeometry(w,0.09,6,12,Math.PI*0.5),woodM);
      bend.position.set(0,h*0.68,0);
      bend.rotation.set(Math.PI/2,0,sd>0?0:Math.PI); g.add(bend);
    }
    for(let i=0;i<7;i++){
      const a=lerp(0.15,Math.PI-0.15,i/6);
      const lf=meshOf(new THREE.IcosahedronGeometry(lerp(0.14,0.26,rnd()),0),
        mat(rnd()<0.5?P.canopy:P.moss,{rough:0.96}),true,false);
      lf.position.set(Math.cos(a)*w,h*0.68+Math.sin(a)*w,0);
      lf.scale.y=0.6; g.add(lf);
    }
    const lan=meshOf(new THREE.CylinderGeometry(0.1,0.12,0.2,6),
      glowMat(P.warm,1.7),false,false);
    lan.position.set(0,h*0.68+w-0.3,0); g.add(lan);

  }else if(kit==='forge'){
    /* A riveted portal frame with a warning lamp — the gate to a works, which
       is a machine and not a monument. */
    const iron=mat(P.iron,{metal:0.4,rough:0.55});
    const steel=mat(P.metal,{metal:0.55,rough:0.45});
    const h=lerp(1.9,2.4,rnd()), w=lerp(0.95,1.25,rnd());
    for(const sd of [-1,1]){
      const post=meshOf(new THREE.BoxGeometry(0.26,h,0.26),iron);
      post.position.set(sd*w,h/2,0); g.add(post);
      const base=meshOf(new THREE.BoxGeometry(0.46,0.16,0.46),steel);
      base.position.set(sd*w,0.08,0); g.add(base);
      for(let i=0;i<4;i++){
        const rv=meshOf(new THREE.SphereGeometry(0.03,5,4),steel,false,false);
        rv.position.set(sd*(w+0.14),h*(0.2+i*0.22),0); g.add(rv);
      }
    }
    const lint=meshOf(new THREE.BoxGeometry(w*2.5,0.3,0.3),iron);
    lint.position.y=h; g.add(lint);
    for(const sd of [-1,1]){                      // gussets
      const gu=meshOf(new THREE.BoxGeometry(0.4,0.4,0.12),steel,true,false);
      gu.position.set(sd*(w-0.24),h-0.24,0); gu.rotation.z=sd*Math.PI/4; g.add(gu);
    }
    const lamp=meshOf(new THREE.SphereGeometry(0.13,8,6),glowMat(P.lava,1.8),false,false);
    lamp.position.y=h+0.26; g.add(lamp);
    lamp.userData.tick=t=>{
      lamp.material.emissiveIntensity=0.8+Math.abs(Math.sin(t*1.5))*1.6; };
    animated.push(lamp);

  }else if(kit==='ship'){
    /* A dock gate: two bollard piers with a chain slung between them. It does
       not arch over you, it bars the way — and it is the only gate in the world
       you step over rather than through. */
    const steel=mat(P.metal,{metal:0.5,rough:0.45});
    const w=lerp(1.0,1.4,rnd());
    for(const sd of [-1,1]){
      const pier=meshOf(new THREE.BoxGeometry(0.42,0.9,0.42),
        mat(P.deck2,{rough:0.9}));
      pier.position.set(sd*w,0.45,0); g.add(pier);
      const cap=meshOf(new THREE.BoxGeometry(0.5,0.1,0.5),mat(P.stripe,{rough:0.65}));
      cap.position.set(sd*w,0.94,0); g.add(cap);
      const bol=meshOf(new THREE.CylinderGeometry(0.12,0.15,0.34,9),steel);
      bol.position.set(sd*w,1.14,0); g.add(bol);
      const top=meshOf(new THREE.SphereGeometry(0.14,9,6,0,TAU,0,Math.PI/2),steel);
      top.position.set(sd*w,1.3,0); g.add(top);
    }
    /* The chain, hanging in a catenary. */
    const links=9;
    for(let i=0;i<links;i++){
      const u=(i+0.5)/links;
      const lk=meshOf(new THREE.TorusGeometry(0.075,0.022,4,8),
        mat(P.rust,{rough:0.9}),false,false);
      lk.position.set(lerp(-w,w,u),1.14-Math.sin(u*Math.PI)*0.34,0);
      lk.rotation.set(0,i%2?Math.PI/2:0,Math.PI/2); g.add(lk);
    }
    const sign=meshOf(new THREE.BoxGeometry(0.44,0.3,0.04),
      mat(P.stripe2,{rough:0.6}),false,false);
    sign.position.set(0,0.95,0); g.add(sign);

  }else if(kit==='bastion'){
    /* A gate you could close: a stub of curtain wall, a portcullis in the
       opening and snow on the merlons. */
    const stoneM=mat(P.stone,{rough:0.94}), stone2M=mat(P.stone2,{rough:0.94});
    const w=lerp(1.0,1.3,rnd()), h=lerp(1.9,2.3,rnd());
    for(const sd of [-1,1]){
      const jamb=meshOf(new THREE.BoxGeometry(0.52,h,0.62),stoneM);
      jamb.position.set(sd*w,h/2,0); g.add(jamb);
      const sn=meshOf(new THREE.BoxGeometry(0.56,0.08,0.66),
        mat(P.snow,{rough:1}),false,false);
      sn.position.set(sd*w,h+0.04,0); g.add(sn);
    }
    const lint=meshOf(new THREE.BoxGeometry(w*2.6,0.36,0.66),stone2M);
    lint.position.y=h; g.add(lint);
    for(let i=0;i<5;i++){
      const m=meshOf(new THREE.BoxGeometry(0.28,0.3,0.4),stoneM);
      m.position.set(lerp(-w,w,i/4),h+0.33,0); g.add(m);
      const sn=meshOf(new THREE.BoxGeometry(0.3,0.07,0.42),
        mat(P.snow,{rough:1}),false,false);
      sn.position.set(lerp(-w,w,i/4),h+0.51,0); g.add(sn);
    }
    /* The portcullis, half lowered, glowing cold behind it. */
    const grid=mat(P.metal,{metal:0.55,rough:0.45});
    for(let i=0;i<6;i++){
      const b=meshOf(new THREE.BoxGeometry(0.05,h*0.45,0.05),grid,false,false);
      b.position.set(lerp(-w*0.8,w*0.8,i/5),h*0.78,0.1); g.add(b);
    }
    for(let i=0;i<2;i++){
      const b=meshOf(new THREE.BoxGeometry(w*1.7,0.05,0.05),grid,false,false);
      b.position.set(0,h*(0.62+i*0.28),0.1); g.add(b);
    }
    const glow=meshOf(new THREE.BoxGeometry(w*1.7,h*0.5,0.04),
      mat(P.ward,{emissive:P.ward,ei:0.9,rough:0.4,flat:false}),false,false);
    glow.position.set(0,h*0.3,-0.1); g.add(glow);

  }else{
    /* A stucco arch with a tiled cap and a wrought sign hanging off it — the
       entrance to a street, not to a fortress. */
    const w=lerp(0.85,1.15,rnd()), h=lerp(1.7,2.2,rnd());
    for(const sd of [-1,1]){
      const p=meshOf(new THREE.CylinderGeometry(0.15,0.19,h,10),
        mat(P.stucco,{rough:0.92,flat:false}));
      p.position.set(sd*w,h/2,0); g.add(p);
      const base=meshOf(new THREE.CylinderGeometry(0.24,0.27,0.16,10),
        mat(P.stucco3,{rough:0.9}));
      base.position.set(sd*w,0.08,0); g.add(base);
    }
    const arc=meshOf(new THREE.TorusGeometry(w,0.16,7,18,Math.PI),
      mat(P.stucco3,{rough:0.9}));
    arc.position.y=h; g.add(arc);
    const cap=softRoof(0.6,w*2.5,0.3,P.rose,{nu:7,nv:3,rough:0.78});
    cap.position.y=h+w; cap.rotation.y=Math.PI/2; g.add(cap);
    /* The hanging sign, on a scrolled bracket, swinging. */
    const brk=meshOf(new THREE.TorusGeometry(0.18,0.03,5,10,Math.PI*0.9),
      mat(P.metal,{metal:0.5,rough:0.5}));
    brk.position.set(w*0.6,h*0.78,0.2); brk.rotation.y=Math.PI/2; g.add(brk);
    const sign=new THREE.Group(); sign.position.set(w*0.78,h*0.72,0.2); g.add(sign);
    const bd=meshOf(new THREE.BoxGeometry(0.34,0.3,0.04),
      mat(P.rose2,{rough:0.82}),true,false);
    bd.position.y=-0.22; sign.add(bd);
    sign.add(beam(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-0.08,0),0.014,
      mat(P.metal,{metal:0.5,rough:0.5}),false));
    const ph=rnd()*TAU;
    sign.userData.tick=t=>{ sign.rotation.z=Math.sin(t*1.1+ph)*0.14; };
    animated.push(sign);
    const lamp=meshOf(new THREE.CylinderGeometry(0.08,0.1,0.18,4),
      glowMat(P.warm,1.7),false,false);
    lamp.rotation.y=Math.PI/4; lamp.position.set(-w*0.72,h*0.8,0.2); g.add(lamp);
  }
  return g;
}

/* ------------------------------------------------------------------ water
   Colour and glow come from the realm — the same builder makes a teal garden
   pool in the swarm, a turquoise dock basin in the shipyards and a molten
   crucible in the forges. */
/* ------------------------------------------------------------------ water */
/* An annulus of water following an island's own outline, for the open sea round
   a harbour realm. Built as a quad strip between two scaled copies of the same
   profile, so the inner edge sits against the real wobbled coast instead of a
   circle cutting through it, and with a few radial rings so the wave has
   something to break into facets against. */
function seaRing(prof,r0,r1,rings){
  /* Three segments per profile point rather than two, because this surface is
     the one thing here that carries a travelling wave: at 60 segments around a
     circumference of ~88 units a 4-unit wavelength got barely two samples per
     crest and aliased into a shimmer rather than reading as swell. */
  const n=prof.length*3, pos=[];
  /* BOTH edges follow the island's own wobbled profile, so the water reads as
     a bay that belongs to this island rather than a washer dropped over it.
     That makes the band a constant multiple of the coast at every bearing —
     which is also why the boats have to be given the profile too: an orbit on a
     plain circle would cross the shoreline at the narrow bearings and sail out
     past the rim at the wide ones. See buildFlyers. */
  const pt=(i,k)=>{ const a=i/n*TAU;
    const r=radiusAt(prof,a)*lerp(r0,r1,k);
    return [Math.cos(a)*r,0,Math.sin(a)*r]; };
  for(let m=0;m<rings;m++){
    const ka=m/rings, kb=(m+1)/rings;
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      const A=pt(i,ka),B=pt(i,kb),C=pt(j,kb),D=pt(j,ka);
      pos.push(...A,...C,...B, ...A,...D,...C);
    }
  }
  return flatUp(pos);
}

/* Two crossing waves plus a slow radial one, sampled in WORLD x/z so a shared
   surface never tears at a seam between two pieces of it. */
const waveY=(x,z,t,amp)=>
  (Math.sin(t*1.5+x*1.7)*0.45+Math.sin(t*1.1+z*2.1)*0.35
   +Math.sin(t*0.7+(x+z)*0.9)*0.2)*amp;
function buildPond(P,radius,y){
  const g=new THREE.Group();
  const kit=P.kit;
  /* Colour alone was carrying this: one circular pool with a torus kerb and a
     ring of glowing dots orbiting it, in five realms. What water IS differs more
     than what colour it is — a formal lily basin, a boggy forest pool, a frozen
     one you can walk on, a public wash-house. So the OUTLINE changes, the edge
     changes, and what floats on it changes. */
  const seg=kit==='frame'?13:kit==='quarter'?8:22;
  const geo=new THREE.CircleGeometry(radius,seg);
  geo.rotateX(-Math.PI/2);
  /* The frameworks' pool is irregular — a circle is a built thing, and nothing
     in that realm is built. */
  if(kit==='frame'){
    const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),z=pos.getZ(i),d=Math.hypot(x,z);
      if(d<1e-4)continue;
      const k=1+Math.sin(Math.atan2(z,x)*3+P.seed)*0.18
               +Math.sin(Math.atan2(z,x)*5+P.seed*2)*0.1;
      pos.setX(i,x*k); pos.setZ(i,z*k);
    }
  }
  const frozen=kit==='bastion';
  if(FX.vc) bakeVC(geo);
  const water=new THREE.Mesh(geo,mat(P.water,{opacity:frozen?0.75:0.88,
    rough:frozen?0.28:0.14,metal:0.1,flat:false,
    emissive:P.water,ei:P.liquidGlow??0.16}));
  water.receiveShadow=true; water.position.y=y+0.06;
  if(!frozen){
    const base=geo.attributes.position.array.slice();
    water.userData.tick=t=>{
      const q=water.geometry.attributes.position;
      for(let i=0;i<q.count;i++){
        const x=base[i*3], z=base[i*3+2];
        q.setY(i,Math.sin(t*1.5+x*1.7)*0.045+Math.sin(t*1.1+z*2.1)*0.035);
      }
      q.needsUpdate=true;
    };
    animated.push(water);
  }
  g.add(water);

  if(kit==='swarm'){
    /* A formal basin: dressed kerb, lily pads, and one crystal standing in it. */
    const rim=meshOf(new THREE.TorusGeometry(radius,0.13,6,28),mat(P.stone2,{rough:0.8}));
    rim.rotation.x=Math.PI/2; rim.position.y=y+0.06; g.add(rim);
    for(let i=0;i<5;i++){
      const a=i*2.399963229728653, rr=radius*lerp(0.25,0.75,(i*0.37)%1);
      const pad=meshOf(new THREE.CylinderGeometry(0.2,0.2,0.03,9),
        mat(P.foliage2,{rough:0.95}),false,false);
      pad.position.set(Math.cos(a)*rr,y+0.11,Math.sin(a)*rr); g.add(pad);
    }
    const c=meshOf(new THREE.OctahedronGeometry(0.22),
      mat(P.crys,{emissive:P.crys,ei:0.9,rough:0.2,opacity:0.94}),false,false);
    c.scale.y=2.4; c.position.set(radius*0.2,y+0.5,-radius*0.15);
    c.userData.tick=t=>{ c.rotation.y=t*0.25; };
    g.add(c); animated.push(c);

  }else if(kit==='frame'){
    /* A boggy pool: mossy boulders round the edge and reeds standing in it. */
    for(let i=0;i<9;i++){
      const a=i/9*TAU+P.seed*0.2, rr=radius*lerp(1.0,1.14,((i*0.41)%1));
      const b=meshOf(new THREE.DodecahedronGeometry(lerp(0.17,0.34,(i*0.29)%1),0),
        mat(i%2?P.rock:P.cliff2,{rough:1}));
      b.position.set(Math.cos(a)*rr,y+0.08,Math.sin(a)*rr);
      b.rotation.set(i,i*2,i*3); b.scale.y=0.7; g.add(b);
      if(i%2===0){
        const mo=meshOf(new THREE.IcosahedronGeometry(0.14,0),
          mat(P.moss,{rough:0.98}),false,false);
        mo.position.set(Math.cos(a)*rr,y+0.2,Math.sin(a)*rr);
        mo.scale.y=0.5; g.add(mo);
      }
    }
    for(let i=0;i<7;i++){
      const a=i*2.399963229728653, rr=radius*lerp(0.5,0.95,((i*0.53)%1));
      const rd=meshOf(new THREE.ConeGeometry(0.05,lerp(0.4,0.8,(i*0.31)%1),4),
        mat(P.canopy,{rough:0.98}),true,false);
      rd.position.set(Math.cos(a)*rr,y+0.3,Math.sin(a)*rr);
      rd.rotation.z=(((i*0.7)%1)-0.5)*0.5; g.add(rd);
    }

  }else if(kit==='bastion'){
    /* Frozen over: cracked plates of ice, a snow drift on the lee side and one
       dark hole cut through it. Water you can stand on. */
    for(let i=0;i<7;i++){
      const a=i/7*TAU+P.seed*0.3, rr=radius*lerp(0.3,0.85,((i*0.43)%1));
      const pl=meshOf(new THREE.CylinderGeometry(lerp(0.22,0.42,(i*0.37)%1),
        lerp(0.22,0.42,(i*0.37)%1),0.06,6),
        mat(P.ice,{rough:0.22,flat:true,opacity:0.9}),false,true);
      pl.position.set(Math.cos(a)*rr,y+0.12,Math.sin(a)*rr);
      pl.rotation.y=i; g.add(pl);
    }
    const drift=meshOf(new THREE.SphereGeometry(radius*0.55,12,8),
      mat(P.snow,{rough:1}));
    drift.position.set(-radius*0.4,y+0.06,radius*0.3); drift.scale.y=0.24; g.add(drift);
    const hole=meshOf(new THREE.CylinderGeometry(radius*0.22,radius*0.22,0.03,12),
      mat(mixTok(P.water,0x000000,0.5),{rough:0.2,flat:false}),false,false);
    hole.position.set(radius*0.25,y+0.14,-radius*0.2); g.add(hole);
    const rim=meshOf(new THREE.TorusGeometry(radius,0.11,5,26),mat(P.rock,{rough:1}));
    rim.rotation.x=Math.PI/2; rim.position.y=y+0.05; g.add(rim);

  }else{
    /* The artisan's: a public wash-house. Octagonal, kerbed in dressed stone,
       with steps down into it and a spout running. */
    const kerb=meshOf(new THREE.CylinderGeometry(radius*1.14,radius*1.2,0.28,8),
      mat(P.stone2,{rough:0.94}));
    kerb.position.y=y+0.02; g.add(kerb);
    const cop=meshOf(new THREE.CylinderGeometry(radius*1.18,radius*1.14,0.08,8),
      mat(P.stucco3,{rough:0.9}),false,false);
    cop.position.y=y+0.18; g.add(cop);
    for(let i=0;i<2;i++){
      const st=meshOf(new THREE.BoxGeometry(radius*0.9,0.09,0.3),
        mat(P.stone,{rough:0.94}),false,true);
      st.position.set(0,y+0.14-i*0.09,radius*(1.2+i*0.24)); g.add(st);
    }
    /* The spout: a stucco pillar with a mask and a thread of water. */
    const px=-radius*0.9, pz=-radius*0.6;
    const pil=meshOf(new THREE.CylinderGeometry(0.14,0.18,0.9,8),
      mat(P.stucco,{rough:0.92,flat:false}));
    pil.position.set(px,y+0.45,pz); g.add(pil);
    const spout=meshOf(new THREE.CylinderGeometry(0.05,0.05,0.22,6),
      mat(P.metal,{metal:0.6,rough:0.4}));
    spout.rotation.z=Math.PI/2; spout.position.set(px+0.16,y+0.78,pz); g.add(spout);
    for(let k=0;k<4;k++){
      const d=meshOf(new THREE.SphereGeometry(0.045,6,5),
        mat(P.water,{opacity:0.75,flat:false,emissive:P.water,ei:0.3}),false,false);
      d.userData.tick=t=>{
        const u=(t*0.9+k/4)%1;
        d.position.set(px+0.26+u*0.18,y+0.74-u*u*0.66,pz);
      };
      g.add(d); animated.push(d);
    }
  }
  return g;
}

function buildFalls(P,drop){
  const g=new THREE.Group();
  const w=0.9;
  /* Two crossed sheets: a single plane vanishes to a line whenever the camera
     swings to face it edge-on, which on a free iso view is a quarter of all
     headings. */
  const sheetMat=mat(P.water,{opacity:0.45,flat:false,rough:0.1,
    emissive:P.water,ei:P.liquidGlow??0.3,side:THREE.DoubleSide});
  for(const rot of [0,Math.PI/2]){
    const sheet=meshOf(new THREE.PlaneGeometry(w,drop),sheetMat,false,false);
    sheet.position.y=-drop/2; sheet.rotation.y=rot; g.add(sheet);
  }
  const spray=P.kit==='forge'?P.lavaHot:0xFFFFFF;
  for(let i=0;i<4;i++){
    const u=(i+1)/4;
    const puff=meshOf(new THREE.IcosahedronGeometry(0.3+u*0.55,0),
      mat(spray,{opacity:0.22*(1-u*0.7),flat:false}),false,false);
    puff.position.y=-drop*u; puff.scale.y=0.7; g.add(puff);
  }
  /* Own material per streak. Sharing one cached glow meant seven streaks all
     wrote `.opacity` on the same material every frame and the falls strobed
     instead of falling. */
  for(let i=0;i<6;i++){
    const sm=new THREE.MeshStandardMaterial({color:spray,emissive:spray,
      emissiveIntensity:0.8,roughness:0.35,transparent:true,opacity:0.75});
    const st=meshOf(new THREE.BoxGeometry(0.07,0.5,0.03),sm,false,false);
    const off=i/6, xo=(i/6-0.5)*w*0.8;
    st.userData.tick=t=>{
      const u=(t*0.55+off)%1;
      st.position.set(xo,-u*drop,0.02);
      st.scale.y=0.6+u*1.4;
      sm.opacity=0.75*(1-u*0.8);
    };
    g.add(st); animated.push(st);
  }
  return g;
}

/* -------------------------------------------- building off the rim, and life */
/* The platform braced off the rim. It was ONE builder for all six realms —
   struts, railing, a house or a hedge on top, a lamp in the corner — and a
   district carries up to seven of them, so it was the most repeated large
   object in the world after the houses. Recoloured six ways it still read as
   the same balcony six times.

   What each realm hangs off its own cliff, and how it holds it up, is the
   difference. Local +x points away from the island. */
function buildDeck(P,rnd,K,anchor){
  const g=new THREE.Group();
  const w=lerp(2.0,3.2,rnd()), d=lerp(1.5,2.4,rnd());
  const kit=P.kit;

  if(kit==='swarm'){
    /* Held up by nothing. This is the sky-garden — the plate simply floats, and
       being the only realm whose decks have no visible support is worth more
       than any amount of decoration on them. */
    const slab=meshOf(new THREE.CylinderGeometry(w*0.5,w*0.42,0.26,14),
      mat(P.stone,{rough:0.7}));
    g.add(slab);
    const turf=meshOf(new THREE.CylinderGeometry(w*0.44,w*0.44,0.1,14),
      mat(P.ground,{rough:0.98}));
    turf.position.y=0.17; g.add(turf);
    /* A crystal slung underneath, lighting the underside — the tell that it is
       held by the same thing that holds the island. */
    const c=meshOf(new THREE.OctahedronGeometry(0.3),
      mat(P.crys,{emissive:P.crys,ei:1.2,rough:0.2,opacity:0.92}),false,false);
    c.scale.y=2.2; c.position.y=-0.6;
    const ph=rnd()*TAU;
    c.userData.tick=t=>{ c.rotation.y=t*0.3;
      c.position.y=-0.6+Math.sin(t*0.8+ph)*0.07; };
    g.add(c); animated.push(c);
    /* And the whole plate drifts, very slightly. */
    const dph=rnd()*TAU;
    g.userData.tick=t=>{ g.position.y=g.userData.y0+Math.sin(t*0.5+dph)*0.08; };
    for(let i=0;i<9;i++){
      const a=i/9*TAU;
      const p=meshOf(new THREE.CylinderGeometry(0.04,0.04,0.4,5),
        mat(P.stone2,{rough:0.8}),true,false);
      p.position.set(Math.cos(a)*w*0.42,0.32,Math.sin(a)*w*0.42); g.add(p);
    }

  }else if(kit==='frame'){
    /* Grown, not built: a bough comes out of the cliff and the planks are laid
       across it. The support is a tree limb, which no other realm has. */
    const boughM=mat(P.bark,{rough:0.98});
    const bough=meshOf(new THREE.CylinderGeometry(0.16,0.34,w*1.5,7),boughM);
    bough.position.set(-w*0.15,-0.12,0); bough.rotation.z=Math.PI/2-0.12;
    g.add(bough);
    for(const sd of [-1,1]){
      const br=meshOf(new THREE.CylinderGeometry(0.08,0.16,d*0.9,6),boughM);
      br.position.set(w*0.18,-0.2,sd*d*0.24);
      br.rotation.set(sd*0.5,0,Math.PI/2-0.2); g.add(br);
    }
    for(let i=0;i<6;i++){
      const pl=meshOf(new THREE.BoxGeometry(w/6*0.94,0.09,d),
        mat(P.wood,{rough:0.92}));
      pl.position.set(-w/2+w/6*(i+0.5),0.06,0); g.add(pl);
    }
    for(let i=0;i<5;i++){
      const lf=meshOf(new THREE.IcosahedronGeometry(lerp(0.2,0.36,rnd()),0),
        mat(rnd()<0.5?P.canopy:P.moss,{rough:0.96}),true,false);
      lf.position.set(lerp(-w*0.4,w*0.4,rnd()),-0.28,lerp(-d*0.5,d*0.5,rnd()));
      lf.scale.y=0.6; g.add(lf);
    }
    const rope=mat(P.bark2,{rough:1});
    for(let i=0;i<=4;i++){
      const px=-w/2+0.15+i*(w-0.3)/4;
      for(const sd of [-1,1]){
        g.add(beam(new THREE.Vector3(px,0.1,sd*d*0.46),
                   new THREE.Vector3(px,0.62,sd*d*0.46),0.025,rope,false));
      }
    }

  }else if(kit==='forge'){
    /* An iron bracket balcony: riveted knees off the cliff face, a mesh floor
       and no soil on it at all. The only deck in the world you would not want
       to stand on barefoot. */
    const iron=mat(P.iron,{metal:0.4,rough:0.55});
    const steel=mat(P.metal,{metal:0.55,rough:0.45});
    g.add(meshOf(new THREE.BoxGeometry(w,0.14,d),iron));
    /* Grating, drawn as bars rather than a plate. */
    for(let i=0;i<7;i++){
      const bar=meshOf(new THREE.BoxGeometry(w*0.96,0.05,0.07),steel,false,false);
      bar.position.set(0,0.1,lerp(-d*0.42,d*0.42,i/6)); g.add(bar);
    }
    for(const sd of [-1,1]){
      /* Knee brackets, not struts — they fold back into the cliff. */
      const kn=meshOf(new THREE.BoxGeometry(0.12,0.9,0.14),iron);
      kn.position.set(-w*0.1,-0.5,sd*d*0.34); kn.rotation.z=-0.9; g.add(kn);
      g.add(beam(new THREE.Vector3(w*0.36,-0.1,sd*d*0.34),
                 new THREE.Vector3(-anchor.back,-anchor.drop,sd*d*0.2),0.07,steel));
    }
    /* Pipe rail with a bend, a drum and a glowing tap. */
    for(let i=0;i<=4;i++){
      const px=w/2-0.12-i*(w*0.5)/4;
      g.add(beam(new THREE.Vector3(px,0.07,-d*0.44),
                 new THREE.Vector3(px,0.62,-d*0.44),0.028,steel,false));
      g.add(beam(new THREE.Vector3(px,0.07,d*0.44),
                 new THREE.Vector3(px,0.62,d*0.44),0.028,steel,false));
    }
    const drum=meshOf(new THREE.CylinderGeometry(0.2,0.2,0.42,9),
      mat(P.brick2,{rough:0.85}));
    drum.position.set(-w*0.22,0.28,d*0.2); g.add(drum);
    const tap=meshOf(new THREE.BoxGeometry(0.3,0.07,0.07),
      glowMat(P.lava,1.4),false,false);
    tap.position.set(w*0.3,0.2,0); g.add(tap);

  }else if(kit==='ship'){
    /* A pontoon, and it goes DOWN rather than out — moored at the waterline
       with a ladder off the quay. Every other realm's platform is up in the
       air; the shipyards' is floating on the sea, which is the one place only
       this realm can put anything. */
    const pont=meshOf(new THREE.BoxGeometry(w,0.34,d),mat(P.stripe2,{rough:0.7}));
    g.add(pont);
    const deck=meshOf(new THREE.BoxGeometry(w-0.2,0.1,d-0.2),
      mat(P.wood,{rough:0.92}));
    deck.position.y=0.2; g.add(deck);
    for(const sd of [-1,1]){
      const fend=meshOf(new THREE.TorusGeometry(0.16,0.05,5,10),
        mat(P.rust,{rough:0.95}),false,false);
      fend.rotation.y=Math.PI/2;
      fend.position.set(-w*0.5,0.02,sd*d*0.28); g.add(fend);
    }
    /* The ladder back up to the quay, which is what tells you it is below. */
    const lad=mat(P.metal,{metal:0.5,rough:0.45});
    for(const sd of [-1,1]){
      g.add(beam(new THREE.Vector3(-w*0.42,0.2,sd*0.24),
                 new THREE.Vector3(-anchor.back*0.7,anchor.drop*0.9,sd*0.24),
                 0.035,lad));
    }
    for(let i=0;i<5;i++){
      const u=(i+0.5)/5;
      const rung=meshOf(new THREE.CylinderGeometry(0.025,0.025,0.5,5),lad,false,false);
      rung.rotation.x=Math.PI/2;
      rung.position.set(lerp(-w*0.42,-anchor.back*0.7,u),
                        lerp(0.2,anchor.drop*0.9,u),0); g.add(rung);
    }
    const bol=meshOf(new THREE.CylinderGeometry(0.09,0.11,0.26,8),lad);
    bol.position.set(w*0.36,0.38,d*0.3); g.add(bol);
    for(let i=0;i<2;i++){
      const cr=meshOf(new THREE.BoxGeometry(0.36,0.3,0.36),mat(P.wood,{rough:0.95}));
      cr.position.set(w*0.1+i*0.42,0.4,-d*0.2); cr.rotation.y=rnd(); g.add(cr);
    }
    /* It rides the swell. */
    const ph=rnd()*TAU;
    g.userData.tick=t=>{ g.rotation.z=Math.sin(t*0.9+ph)*0.035;
      g.rotation.x=Math.cos(t*0.7+ph)*0.03;
      g.position.y=g.userData.y0+Math.sin(t*0.8+ph)*0.06; };

  }else if(kit==='bastion'){
    /* A corbelled bartizan: stone brackets stepping out of the wall, a
       machicolated floor with the murder-holes showing, crenellations and snow.
       It is a fighting position, not a balcony. */
    const stoneM=mat(P.stone,{rough:0.94}), stone2M=mat(P.stone2,{rough:0.94});
    /* Three corbel courses, each wider than the one below. */
    for(let i=0;i<3;i++){
      const u=i/2;
      const cb=meshOf(new THREE.BoxGeometry(lerp(0.5,w,u),0.16,lerp(d*0.5,d,u)),
        i%2?stoneM:stone2M);
      cb.position.set(lerp(-w*0.3,0,u),-0.5+i*0.17,0); g.add(cb);
    }
    const floor=meshOf(new THREE.BoxGeometry(w,0.2,d),stoneM);
    floor.position.y=0.08; g.add(floor);
    /* Machicolations: gaps in the overhang, drawn as recesses on the underside. */
    for(let i=0;i<5;i++){
      const hole=meshOf(new THREE.BoxGeometry(0.16,0.1,0.16),
        mat(P.rock,{rough:1}),false,false);
      hole.position.set(w*0.42,-0.03,lerp(-d*0.34,d*0.34,i/4)); g.add(hole);
    }
    const par=Math.round(w/0.34);
    for(let i=0;i<par;i++){
      const px=lerp(-w*0.46,w*0.46,i/(par-1));
      for(const [pz,skip] of [[d*0.44,false],[-d*0.44,false]]){
        const m=meshOf(new THREE.BoxGeometry(0.26,i%2?0.42:0.26,0.18),stoneM);
        m.position.set(px,0.18+(i%2?0.21:0.13),pz); g.add(m);
        if(i%2){
          const sn=meshOf(new THREE.BoxGeometry(0.28,0.06,0.2),
            mat(P.snow,{rough:1}),false,false);
          sn.position.set(px,0.42,pz); g.add(sn);
        }
      }
    }
    const snowFloor=meshOf(new THREE.BoxGeometry(w*0.9,0.05,d*0.7),
      mat(P.snow,{rough:1}),false,true);
    snowFloor.position.y=0.2; g.add(snowFloor);
    const br=meshOf(new THREE.CylinderGeometry(0.13,0.09,0.18,7),
      mat(P.metal,{metal:0.45,rough:0.55}));
    br.position.set(w*0.24,0.29,0); g.add(br);
    const f=meshOf(new THREE.ConeGeometry(0.11,0.3,6),glowMat(P.warm,2.0),false,false);
    f.position.set(w*0.24,0.5,0);
    const fph=rnd()*TAU;
    f.userData.tick=t=>{ f.scale.set(1,1+Math.sin(t*6+fph)*0.16,1); };
    g.add(f); animated.push(f);

  }else{
    /* A stucco balcony under a striped awning, with pots on the rail. Domestic,
       shallow, and the only deck anywhere with a roof over it. */
    const floor=meshOf(new THREE.BoxGeometry(w*0.8,0.18,d*0.8),
      mat(P.stone2,{rough:0.94}));
    g.add(floor);
    const cop=meshOf(new THREE.BoxGeometry(w*0.86,0.06,d*0.86),
      mat(P.stucco3,{rough:0.9}),false,false);
    cop.position.y=0.12; g.add(cop);
    /* Scrolled iron corbels under it. */
    for(const sd of [-1,1]){
      const scr=meshOf(new THREE.TorusGeometry(0.22,0.04,5,12,Math.PI*1.1),
        mat(P.metal,{metal:0.5,rough:0.5}));
      scr.position.set(-w*0.16,-0.3,sd*d*0.3);
      scr.rotation.y=Math.PI/2; g.add(scr);
    }
    /* Balustrade: little turned posts, not plain sticks. */
    const n=Math.round(w*0.8/0.26);
    for(let i=0;i<n;i++){
      const px=lerp(-w*0.38,w*0.38,i/(n-1));
      const b=meshOf(new THREE.CylinderGeometry(0.045,0.06,0.34,7),
        mat(P.stucco3,{rough:0.9}),true,false);
      b.position.set(px,0.32,d*0.38); g.add(b);
    }
    const rail=meshOf(new THREE.BoxGeometry(w*0.82,0.07,0.14),
      mat(P.stucco3,{rough:0.9}));
    rail.position.set(0,0.52,d*0.38); g.add(rail);
    /* The awning, in the realm's stripes. */
    const bays=6;
    for(let i=0;i<bays;i++){
      const pn=meshOf(new THREE.BoxGeometry(w*0.8/bays,0.05,d*0.7),
        mat(i%2?P.rose:P.stucco3,{rough:0.8}));
      pn.position.set(-w*0.4+w*0.8/bays*(i+0.5),1.05,d*0.1);
      pn.rotation.x=-0.3; g.add(pn);
    }
    for(const sd of [-1,1]){
      g.add(beam(new THREE.Vector3(sd*w*0.36,0.1,-d*0.3),
                 new THREE.Vector3(sd*w*0.36,1.05,-d*0.3),0.035,
                 mat(P.metal,{metal:0.5,rough:0.5}),false));
    }
    for(let i=0;i<2;i++){
      const pot=K.plant(P,rnd);
      pot.position.set(lerp(-w*0.3,w*0.3,i),0.12,-d*0.2);
      pot.scale.setScalar(0.8); g.add(pot);
    }
  }

  /* Struts, for the realms that admit to needing them. The swarm has none by
     design and the ship hangs its ladder instead. */
  if(kit==='frame'||kit==='bastion'||kit==='quarter'){
    const strutMat=mat(kit==='frame'?P.bark2:P.stone2,{rough:0.92});
    for(const sd of [-1,1]){
      g.add(beam(new THREE.Vector3(w*0.28,-0.18,sd*d*0.3),
                 new THREE.Vector3(-anchor.back,-anchor.drop,sd*d*0.18),
                 0.08,strutMat));
    }
  }
  return g;
}

/* The span between two towers, realm by realm. It was one builder for all six:
   a run of stepped deck segments arcing up and over with little posts on it,
   which at an iso angle reads as a flight of stairs — the same flight, in the
   middle of every district in the world, from L9 on.

   The differences are structural, not decorative, and the load-bearing one is
   the PROFILE. A rope bridge sags, a steel gangway is dead flat, a stone span
   arcs, a garden causeway does not connect to anything at all. Get that right
   and the six read apart at silhouette scale before any material lands. */
function buildSkyBridge(P,a,b){
  const g=new THREE.Group();
  const span=new THREE.Vector3(b.x-a.x,0,b.z-a.z).length();
  const yawA=-Math.atan2(b.z-a.z,b.x-a.x);
  const nx=Math.sin(-yawA), nz=Math.cos(-yawA);        // unit normal, in plan
  const at=(u,lift)=>{
    const p=new THREE.Vector3().lerpVectors(a,b,u); p.y+=lift||0; return p;
  };
  const K=P.kit;

  if(K==='swarm'){
    /* A CAUSEWAY OF SLABS with air between them. Nothing structural — this is a
       sky-garden and the path simply floats, which is the one thing this realm
       can do that none of the others can. */
    const n=Math.max(5,Math.round(span/1.15));
    const rise=clamp(span*0.10,0.3,1.1);
    const slabM=mat(P.stone,{rough:0.7}), trimM=mat(P.stone2,{rough:0.75});
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n, lift=Math.sin(u*Math.PI)*rise;
      const p=at(u,lift);
      const sl=meshOf(new THREE.BoxGeometry(span/n*0.62,0.14,0.8),slabM);
      sl.position.copy(p); sl.rotation.y=yawA; g.add(sl);
      const tr=meshOf(new THREE.BoxGeometry(span/n*0.62,0.05,0.9),trimM,false,false);
      tr.position.set(p.x,p.y-0.09,p.z); tr.rotation.y=yawA; g.add(tr);
      /* Every third slab drifts, so the causeway breathes rather than hanging
         rigid — and only every third, so it costs three ticks and not fifteen. */
      if(i%3===1){
        const ph=i*1.7, y0=p.y;
        sl.userData.tick=t=>{ sl.position.y=y0+Math.sin(t*0.7+ph)*0.07; };
        animated.push(sl);
        const c=meshOf(new THREE.OctahedronGeometry(0.12),
          glowMat(P.crys,1.7),false,false);
        c.scale.y=1.8; c.position.set(p.x,p.y+0.45,p.z);
        g.add(c);
      }
    }

  }else if(K==='frame'){
    /* A ROPE BRIDGE, and it SAGS. Every other span in the world rises in the
       middle; this one is the only thing hanging from its ends. */
    const sag=clamp(span*0.13,0.4,1.5);
    const dip=u=>-Math.sin(u*Math.PI)*sag;
    const ropeM=mat(P.bark2,{rough:1}), plankM=mat(P.wood,{rough:0.92});
    const n=Math.max(8,Math.round(span/0.42));
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n, p=at(u,dip(u));
      const pl=meshOf(new THREE.BoxGeometry(span/n*0.82,0.06,0.66),plankM);
      pl.position.copy(p); pl.rotation.y=yawA;
      pl.rotation.z=Math.cos(u*Math.PI)*0.22;    // planks tilt along the curve
      g.add(pl);
    }
    /* Deck ropes and handrails: chords following the same catenary, offset. */
    for(const s of [-1,1]){
      for(const [h,rad] of [[0,0.035],[0.62,0.028]]){
        const segs=Math.max(8,Math.round(span/0.7));
        for(let i=0;i<segs;i++){
          const u0=i/segs, u1=(i+1)/segs;
          const p0=at(u0,dip(u0)+h), p1=at(u1,dip(u1)+h);
          p0.x+=nx*s*0.36; p0.z+=nz*s*0.36;
          p1.x+=nx*s*0.36; p1.z+=nz*s*0.36;
          g.add(beam(p0,p1,rad,ropeM,false));
        }
      }
      /* Vertical hangers every few planks. */
      for(let i=1;i<5;i++){
        const u=i/5, p=at(u,dip(u));
        g.add(beam(new THREE.Vector3(p.x+nx*s*0.36,p.y,p.z+nz*s*0.36),
                   new THREE.Vector3(p.x+nx*s*0.36,p.y+0.62,p.z+nz*s*0.36),
                   0.02,ropeM,false));
      }
    }
    const lan=meshOf(new THREE.CylinderGeometry(0.1,0.12,0.2,6),
      glowMat(P.warm,1.8),false,false);
    const mp=at(0.5,dip(0.5)+0.5);
    lan.position.copy(mp); g.add(lan);

  }else if(K==='forge'){
    /* A PIPE GANTRY. Not a walkway at all: a riveted truss carrying a hot line
       between two stacks, with the melt visible in the seam. */
    const trussM=mat(P.iron,{metal:0.4,rough:0.55});
    const pipeM=mat(P.metal,{metal:0.55,rough:0.45});
    /* Dead straight, and slung slightly BELOW the tower tops. */
    const drop=-0.35;
    const A=at(0,drop), B=at(1,drop);
    for(const s of [-1,1]){
      for(const h of [0,0.7]){
        const c0=new THREE.Vector3(A.x+nx*s*0.3,A.y+h,A.z+nz*s*0.3);
        const c1=new THREE.Vector3(B.x+nx*s*0.3,B.y+h,B.z+nz*s*0.3);
        g.add(beam(c0,c1,0.055,trussM));
      }
      /* Zig-zag web between the chords. */
      const segs=Math.max(4,Math.round(span/0.9));
      for(let i=0;i<segs;i++){
        const u0=i/segs, u1=(i+1)/segs;
        const lo=at(u0,drop), hi=at(u1,drop+0.7);
        g.add(beam(new THREE.Vector3(lo.x+nx*s*0.3,lo.y,lo.z+nz*s*0.3),
                   new THREE.Vector3(hi.x+nx*s*0.3,hi.y,hi.z+nz*s*0.3),
                   0.03,trussM,false));
      }
    }
    const pipe=meshOf(new THREE.CylinderGeometry(0.19,0.19,span*0.98,9),pipeM);
    const mid=at(0.5,drop+0.42);
    pipe.position.copy(mid);
    pipe.rotation.set(0,yawA,Math.PI/2); g.add(pipe);
    /* Lagging bands along it, and the seam glowing between them. */
    const bands=Math.max(3,Math.round(span/1.3));
    for(let i=0;i<bands;i++){
      const u=(i+0.5)/bands, p=at(u,drop+0.42);
      const bd=meshOf(new THREE.CylinderGeometry(0.23,0.23,0.1,9),
        mat(P.iron2,{metal:0.4,rough:0.6}),false,false);
      bd.position.copy(p); bd.rotation.set(0,yawA,Math.PI/2); g.add(bd);
    }
    const seam=meshOf(new THREE.BoxGeometry(span*0.94,0.05,0.06),
      glowMat(P.lava,1.4),false,false);
    seam.position.set(mid.x,mid.y+0.19,mid.z); seam.rotation.y=yawA; g.add(seam);

  }else if(K==='ship'){
    /* A STEEL GANGWAY: dead flat, lattice sides, kick plates, painted band.
       Flat is the tell — it is the only span in the world with no curve at all. */
    const steel=mat(P.metal,{metal:0.5,rough:0.45});
    const deckM=mat(P.deck,{rough:0.85});
    const A=at(0,-0.2), B=at(1,-0.2);
    const deck=meshOf(new THREE.BoxGeometry(span,0.1,0.85),deckM);
    const mid=at(0.5,-0.2);
    deck.position.copy(mid); deck.rotation.y=yawA; g.add(deck);
    for(const s of [-1,1]){
      const rail=new THREE.Vector3(0,0.68,0);
      g.add(beam(new THREE.Vector3(A.x+nx*s*0.42,A.y+rail.y,A.z+nz*s*0.42),
                 new THREE.Vector3(B.x+nx*s*0.42,B.y+rail.y,B.z+nz*s*0.42),
                 0.04,steel));
      const kick=meshOf(new THREE.BoxGeometry(span,0.18,0.06),
        mat(P.stripe,{rough:0.6}),false,false);
      kick.position.set(mid.x+nx*s*0.44,mid.y+0.1,mid.z+nz*s*0.44);
      kick.rotation.y=yawA; g.add(kick);
      const posts=Math.max(3,Math.round(span/1.1));
      for(let i=0;i<=posts;i++){
        const u=i/posts, p=at(u,-0.2);
        g.add(beam(new THREE.Vector3(p.x+nx*s*0.42,p.y,p.z+nz*s*0.42),
                   new THREE.Vector3(p.x+nx*s*0.42,p.y+0.68,p.z+nz*s*0.42),
                   0.028,steel,false));
      }
    }
    /* Underslung trusses, because a flat steel span this long needs depth. */
    const segs=Math.max(4,Math.round(span/1.0));
    for(let i=0;i<segs;i++){
      const u0=i/segs, u1=(i+1)/segs;
      const p0=at(u0,-0.28), p1=at(u1,-0.62);
      g.add(beam(p0,p1,0.032,steel,false));
      g.add(beam(at(u1,-0.28),at(u0,-0.62),0.032,steel,false));
    }

  }else if(K==='bastion'){
    /* A COVERED STONE SPAN on ribs, crenellated, with snow lying on it. Heavy,
       arched, and the only one you could defend. */
    const stoneM=mat(P.stone,{rough:0.94}), stone2M=mat(P.stone2,{rough:0.94});
    const rise=clamp(span*0.13,0.4,1.4);
    const arc=u=>Math.sin(u*Math.PI)*rise;
    const n=Math.max(6,Math.round(span/0.66));
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n, p=at(u,arc(u));
      const blk=meshOf(new THREE.BoxGeometry(span/n*1.08,0.36,1.0),
        i%2?stoneM:stone2M);
      blk.position.copy(p); blk.rotation.y=yawA; g.add(blk);
      /* Parapet, merlons and snow — the wall-walk carried into the air. */
      for(const s of [-1,1]){
        const par=meshOf(new THREE.BoxGeometry(span/n*1.08,0.3,0.16),stoneM);
        par.position.set(p.x+nx*s*0.42,p.y+0.32,p.z+nz*s*0.42);
        par.rotation.y=yawA; g.add(par);
        if(i%2===0){
          const sn=meshOf(new THREE.BoxGeometry(span/n*1.0,0.07,0.18),
            mat(P.snow,{rough:1}),false,false);
          sn.position.set(p.x+nx*s*0.42,p.y+0.5,p.z+nz*s*0.42);
          sn.rotation.y=yawA; g.add(sn);
        }
      }
      if(i%3===0){
        const sn=meshOf(new THREE.BoxGeometry(span/n*1.0,0.06,0.7),
          mat(P.snow,{rough:1}),false,false);
        sn.position.set(p.x,p.y+0.2,p.z); sn.rotation.y=yawA; g.add(sn);
      }
    }
    /* Two ribs under it, so the arch is carried and not floating. */
    const segs=Math.max(6,Math.round(span/0.8));
    for(const s of [-1,1]){
      for(let i=0;i<segs;i++){
        const u0=i/segs, u1=(i+1)/segs;
        const p0=at(u0,arc(u0)-0.28-Math.sin(u0*Math.PI)*0.5);
        const p1=at(u1,arc(u1)-0.28-Math.sin(u1*Math.PI)*0.5);
        p0.x+=nx*s*0.3; p0.z+=nz*s*0.3; p1.x+=nx*s*0.3; p1.z+=nz*s*0.3;
        g.add(beam(p0,p1,0.09,stone2M,false));
      }
    }

  }else{
    /* An ENCLOSED ARCADE — a bridge of sighs in stucco, with arched openings
       and a tiled roof. The only covered span, and the only one with windows. */
    const wallM=mat(P.stucco,{rough:0.92,flat:false});
    const rise=clamp(span*0.09,0.25,0.9);
    const arc=u=>Math.sin(u*Math.PI)*rise;
    const n=Math.max(5,Math.round(span/0.9));
    const wm=winMat(P,0.85);
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n, p=at(u,arc(u));
      const bay=meshOf(new THREE.BoxGeometry(span/n*1.04,1.15,0.95),wallM);
      bay.position.set(p.x,p.y+0.4,p.z); bay.rotation.y=yawA; g.add(bay);
      /* An arched window in each bay, both sides. */
      for(const s of [-1,1]){
        const w=meshOf(new THREE.CylinderGeometry(0.16,0.16,0.05,9,1,false,0,Math.PI),
          wm,false,false);
        w.rotation.z=Math.PI/2; w.rotation.y=yawA+Math.PI/2;
        w.position.set(p.x+nx*s*0.49,p.y+0.55,p.z+nz*s*0.49); g.add(w);
        const bx=meshOf(new THREE.BoxGeometry(0.3,0.3,0.04),wm,false,false);
        bx.rotation.y=yawA+Math.PI/2;
        bx.position.set(p.x+nx*s*0.49,p.y+0.4,p.z+nz*s*0.49); g.add(bx);
      }
    }
    /* One continuous tiled roof over the whole run, following the arch. */
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n, p=at(u,arc(u));
      const rf=softRoof(1.25,span/n*1.06,0.34,P.rose,{nu:7,nv:2,rough:0.78});
      rf.position.set(p.x,p.y+0.98,p.z); rf.rotation.y=yawA+Math.PI/2; g.add(rf);
    }
    /* Corbels under the deck, in the lighter stucco. */
    for(let i=0;i<=n;i++){
      const u=i/n, p=at(u,arc(u));
      const cb=meshOf(new THREE.BoxGeometry(0.2,0.24,1.05),
        mat(P.stucco3,{rough:0.9}),true,false);
      cb.position.set(p.x,p.y-0.24,p.z); cb.rotation.y=yawA; g.add(cb);
    }
  }
  return g;
}
/* What hangs under a terrace lip, realm by realm. Growth going DOWN, which the
   terraces alone can never show — and it was one builder for all six: a cord, a
   lantern or a planter, everywhere. Hung from the terrace BOUNDARIES rather
   than the coast, because the boundaries sit at fixed radii and a coast-hung
   thing would jump outward every time the island grew. */
function buildUndercroft(P,rnd,prof,edgeR,y){
  const g=new THREE.Group();
  const n=Math.max(5,Math.round(edgeR*1.3));
  const kit=P.kit;
  for(let i=0;i<n;i++){
    const a=(i/n)*TAU+rnd()*0.25;
    /* Just OUTSIDE the lip, so it shows against the cliff instead of tucking
       under the terrace above where it is never seen. */
    const r=radiusAt(prof,a)*edgeR*lerp(1.0,1.07,rnd());
    const x=Math.cos(a)*r, z=Math.sin(a)*r;

    if(kit==='swarm'){
      /* Crystal lamps and spill-over planters on marble brackets. */
      const brk=meshOf(new THREE.BoxGeometry(0.14,0.1,0.4),
        mat(P.stone2,{rough:0.8}));
      brk.position.set(x,y-0.05,z); brk.rotation.y=-a; g.add(brk);
      if(rnd()<0.5){
        const c=meshOf(new THREE.OctahedronGeometry(0.15),
          glowMat(P.crys,1.6),false,false);
        c.scale.y=1.8; c.position.set(x,y-0.44,z);
        const ph=rnd()*TAU;
        c.userData.tick=t=>{ c.rotation.y=t*0.4;
          c.position.y=y-0.44+Math.sin(t*0.9+ph)*0.05; };
        g.add(c); animated.push(c);
      }else{
        const bowl=meshOf(new THREE.SphereGeometry(0.3,10,7,0,TAU,0,Math.PI/2),
          mat(P.stone,{rough:0.8}));
        bowl.rotation.x=Math.PI; bowl.position.set(x,y-0.24,z); g.add(bowl);
        for(let k=0;k<3;k++){
          const lf=meshOf(new THREE.IcosahedronGeometry(0.16,0),
            mat(k%2?P.foliage:P.foliage2,{rough:0.96}),false,false);
          lf.position.set(x+(rnd()-0.5)*0.4,y-0.16,z+(rnd()-0.5)*0.4);
          lf.scale.y=0.6; g.add(lf);
        }
      }

    }else if(kit==='frame'){
      /* Aerial roots and creeper, reaching for the terrace below. */
      const len=lerp(0.6,1.5,rnd());
      g.add(beam(new THREE.Vector3(x,y,z),new THREE.Vector3(x,y-len,z),0.05,
        mat(P.bark2,{rough:1}),false));
      for(let k=0;k<3;k++){
        const lf=meshOf(new THREE.IcosahedronGeometry(lerp(0.12,0.24,rnd()),0),
          mat(rnd()<0.5?P.moss:P.canopy,{rough:0.97}),false,false);
        lf.position.set(x+(rnd()-0.5)*0.3,y-len*lerp(0.2,0.9,rnd()),
                        z+(rnd()-0.5)*0.3);
        lf.scale.y=0.6; g.add(lf);
      }
      if(rnd()<0.4){
        const cap=meshOf(new THREE.SphereGeometry(0.1,8,5,0,TAU,0,Math.PI/2),
          mat(P.shroom,{emissive:P.shroom,ei:0.4,rough:0.5,flat:false}),false,false);
        cap.position.set(x,y-0.12,z); cap.scale.y=0.7; g.add(cap);
      }

    }else if(kit==='forge'){
      /* Condensate pipes and drip pans, venting under the deck. */
      const drop=lerp(0.4,0.9,rnd());
      g.add(beam(new THREE.Vector3(x,y,z),new THREE.Vector3(x,y-drop,z),0.07,
        mat(P.metal,{metal:0.5,rough:0.5}),false));
      const el=meshOf(new THREE.TorusGeometry(0.16,0.07,5,8,Math.PI/2),
        mat(P.metal,{metal:0.5,rough:0.5}),false,false);
      el.position.set(x,y-drop,z); el.rotation.y=-a; g.add(el);
      if(rnd()<0.45){
        const glow=meshOf(new THREE.CylinderGeometry(0.09,0.11,0.07,7),
          glowMat(P.lava,1.4),false,false);
        glow.position.set(x,y-drop-0.06,z); g.add(glow);
      }else{
        const pan=meshOf(new THREE.CylinderGeometry(0.22,0.18,0.12,8),
          mat(P.iron,{metal:0.4,rough:0.6}),false,false);
        pan.position.set(x,y-drop-0.1,z); g.add(pan);
      }

    }else if(kit==='ship'){
      /* Mooring rings, hung fenders and a net — the working face of a quay. */
      const ring=meshOf(new THREE.TorusGeometry(0.13,0.032,5,12),
        mat(P.metal,{metal:0.5,rough:0.45}),false,false);
      ring.position.set(x,y-0.12,z); ring.rotation.y=-a+Math.PI/2; g.add(ring);
      const drop=lerp(0.3,0.7,rnd());
      g.add(beam(new THREE.Vector3(x,y-0.14,z),new THREE.Vector3(x,y-drop,z),
        0.022,mat(P.rust,{rough:0.95}),false));
      if(rnd()<0.55){
        for(let k=0;k<3;k++){
          const fd=meshOf(new THREE.TorusGeometry(0.14,0.05,5,10),
            mat(P.rust,{rough:0.95}),false,false);
          fd.position.set(x,y-drop-0.08-k*0.13,z);
          fd.rotation.x=Math.PI/2; g.add(fd);
        }
      }else{
        const buoy=meshOf(new THREE.SphereGeometry(0.16,9,7),
          mat(P.stripe,{rough:0.65}),false,false);
        buoy.position.set(x,y-drop-0.14,z); g.add(buoy);
      }

    }else if(kit==='bastion'){
      /* Icicles and a chained cresset. Nothing is planted under a fortress. */
      const len=lerp(0.5,1.4,Math.pow(rnd(),1.5));
      const ic=meshOf(new THREE.ConeGeometry(lerp(0.06,0.13,rnd()),len,5),
        mat(P.ice,{rough:0.16,flat:true,opacity:0.88,emissive:P.ice,ei:0.1}),
        true,false);
      ic.position.set(x,y-len/2-0.04,z); ic.rotation.set(0,rnd()*TAU,Math.PI);
      g.add(ic);
      if(rnd()<0.3){
        const drop=lerp(0.5,0.9,rnd());
        g.add(beam(new THREE.Vector3(x,y,z),new THREE.Vector3(x,y-drop,z),0.018,
          mat(P.metal,{metal:0.55,rough:0.45}),false));
        const cr=meshOf(new THREE.CylinderGeometry(0.13,0.08,0.16,7),
          mat(P.metal,{metal:0.5,rough:0.5}),false,false);
        cr.position.set(x,y-drop-0.08,z); g.add(cr);
        const f=meshOf(new THREE.ConeGeometry(0.1,0.24,6),glowMat(P.warm,2.0),false,false);
        f.position.set(x,y-drop+0.04,z);
        const ph=rnd()*TAU;
        f.userData.tick=t=>{ f.scale.set(1,1+Math.sin(t*6+ph)*0.18,1); };
        g.add(f); animated.push(f);
      }

    }else{
      /* Window boxes on corbels, and a washing line strung between them. The
         only undercroft in the world with laundry on it. */
      const cb=meshOf(new THREE.BoxGeometry(0.16,0.14,0.34),
        mat(P.stucco3,{rough:0.9}));
      cb.position.set(x,y-0.07,z); cb.rotation.y=-a; g.add(cb);
      const box=meshOf(new THREE.BoxGeometry(0.42,0.16,0.22),
        mat(P.cliff,{rough:0.92,flat:false}));
      box.position.set(x,y-0.2,z); box.rotation.y=-a; g.add(box);
      for(let k=0;k<2;k++){
        const lf=meshOf(new THREE.IcosahedronGeometry(0.12,0),
          mat(k%2?P.leaf:P.leaf2,{rough:0.96}),false,false);
        lf.position.set(x+(rnd()-0.5)*0.28,y-0.1,z+(rnd()-0.5)*0.28); g.add(lf);
      }
      if(i%3===0){
        const a2=((i+1)/n)*TAU;
        const r2=radiusAt(prof,a2)*edgeR*1.03;
        const x2=Math.cos(a2)*r2, z2=Math.sin(a2)*r2;
        const sag=0.24;
        for(let k=0;k<4;k++){
          const u=(k+0.5)/4;
          const cl=meshOf(new THREE.PlaneGeometry(0.2,0.26,3,2),
            mat([P.stucco3,P.blush,P.rose,0xFFFFFF][k%4],
              {side:THREE.DoubleSide,flat:false,rough:0.9}),true,false);
          cl.position.set(lerp(x,x2,u),y-0.28-Math.sin(u*Math.PI)*sag-0.12,
                          lerp(z,z2,u));
          cl.rotation.y=-a;
          const base=cl.geometry.attributes.position.array.slice();
          const ph=k*1.2+i;
          cl.userData.tick=t=>{
            const q=cl.geometry.attributes.position;
            for(let v=0;v<q.count;v++)
              q.setZ(v,Math.sin(t*2.4+ph+base[v*3]*6)*0.04);
            q.needsUpdate=true;
          };
          g.add(cl); animated.push(cl);
        }
      }
    }
  }
  return g;
}

/* Motes: dust in the light. Wisps in the swarm, pollen in the canopy, EMBERS in
   the forges — the forge image is full of them and they are most of what makes
   that sky read as hot rather than as merely dark. */
function buildMotes(P,n,radius){
  const g=new THREE.Group();
  const rnd=rngOf(hash2(P.seed,777));
  const ember=P.kit==='forge';
  for(let i=0;i<n;i++){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,
      color:ember?(rnd()<0.5?P.lava:P.lavaHot):(rnd()<0.5?P.accent:P.bloom),
      transparent:true,opacity:0.3,depthWrite:false,blending:THREE.AdditiveBlending}));
    s.scale.setScalar(lerp(ember?0.12:0.2,ember?0.28:0.42,rnd()));
    /* An ellipse, never tighter than 0.45R. Mismatched frequencies used to walk
       every mote through the middle of the district, and thirty additive sprites
       taking turns over one spot is a searchlight. */
    const r1=lerp(0.45,1.05,rnd())*radius, r2=lerp(0.45,1.05,rnd())*radius;
    const y0=lerp(0.9,4.5,rnd()), sp=lerp(0.12,0.4,rnd()), off=rnd()*TAU;
    const wob=lerp(0.3,1.1,rnd()), dir=rnd()<0.5?1:-1;
    const rise=ember?lerp(0.25,0.7,rnd()):0;
    s.userData.tick=t=>{
      const w=t*sp*dir+off;
      const yy=ember? y0+((t*rise+off)%3)*1.6 : y0+Math.sin(t*0.7+off)*wob;
      s.position.set(Math.cos(w)*r1,yy,Math.sin(w)*r2);
      s.material.opacity=(ember?0.34:0.2)+Math.sin(t*1.7+off)*0.12;
    };
    g.add(s); animated.push(s);
  }
  return g;
}

/* Flyers. Same rig, different wings: white birds over the sky-garden, gulls over
   the docks, butterflies under the canopy, ravens over the walls, doves over the
   square. The forges get none — nothing lives in the smoke. */
function buildFlyers(P,n,radius,style){
  const g=new THREE.Group();
  const rnd=rngOf(hash2(P.seed,888));
  /* Four silhouettes, not one. 'bird', 'gull' and 'dove' all used to fall
     through to the same white cross with the same flap — three realms sharing
     one animal, which at a dozen of them circling is a lot of sameness for
     something that is always moving and therefore always being looked at.

     They differ by the things you can actually read at this size: wingspan,
     flap rate, how high they fly and how tight they turn. */
  const S = style==='butterfly'
      ? {span:0.22,chord:0.20,body:0.16,flap:[9,14],alt:[1.2,3.4],R:[0.5,0.95],
         bob:0.9,spd:[0.10,0.22],cols:[P.shroom,P.shroom2,P.canopy2],glow:0.25}
    : style==='raven'
      ? {span:0.44,chord:0.14,body:0.26,flap:[3,4.6],alt:[3.5,8],R:[0.8,1.4],
         bob:0.4,spd:[0.07,0.15],cols:[0x2A2A32,0x33333C],glow:0}
    : style==='gull'
      /* Long-winged and lazy: gulls glide. Slowest flap in the world and the
         widest circle, low over the water. */
      ? {span:0.62,chord:0.10,body:0.22,flap:[1.6,2.6],alt:[2.0,5.0],R:[1.0,1.5],
         bob:0.75,spd:[0.06,0.13],cols:[0xFFFFFF,0xF2F4FA],glow:0}
    : style==='dove'
      /* Plump, short-winged, whirring — and they stay low over the square. */
      ? {span:0.26,chord:0.13,body:0.24,flap:[7,10],alt:[1.4,3.2],R:[0.45,0.9],
         bob:0.35,spd:[0.14,0.28],cols:[0xFFFFFF,0xF6F2EA],glow:0}
      /* Songbirds: small, quick, tight turns, high up among the spires. */
      : {span:0.3,chord:0.11,body:0.17,flap:[6,9],alt:[3.0,7.5],R:[0.6,1.2],
         bob:0.5,spd:[0.12,0.26],cols:[0xFFFFFF,0xF2F4FA],glow:0};

  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const c=S.cols[i%S.cols.length];
    const wingMat=mat(c,{rough:0.7,emissive:S.glow?c:0x000000,ei:S.glow});
    const wl=meshOf(new THREE.BoxGeometry(S.span,0.03,S.chord),wingMat,false,false);
    const wr=wl.clone();
    wl.position.x=-S.span/2; wr.position.x=S.span/2;
    b.add(wl,wr);
    /* Gulls get a swept tip, ravens a fingered one — one extra box each, and it
       is what separates them at silhouette scale. */
    if(style==='gull'||style==='raven'){
      for(const sd of [-1,1]){
        const tip=meshOf(new THREE.BoxGeometry(S.span*0.4,0.025,S.chord*0.7),
          wingMat,false,false);
        tip.position.set(sd*(S.span*0.85),0,style==='gull'?-S.chord*0.3:0);
        tip.rotation.y=sd*(style==='gull'?0.5:0.2); b.add(tip);
      }
    }
    b.add(meshOf(new THREE.BoxGeometry(S.body*0.5,S.body*0.42,S.body),
      mat(style==='butterfly'?0x2A2A32:c,{rough:0.7}),false,false));
    if(style==='dove'){                       // a fanned tail
      const tail=meshOf(new THREE.BoxGeometry(S.body*0.5,0.025,S.body*0.7),
        wingMat,false,false);
      tail.position.z=-S.body*0.7; b.add(tail);
    }
    const R=lerp(S.R[0],S.R[1],rnd())*radius;
    const y=lerp(S.alt[0],S.alt[1],rnd());
    const sp=lerp(S.spd[0],S.spd[1],rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU;
    const flap=lerp(S.flap[0],S.flap[1],rnd());
    const amp=style==='butterfly'?1.1:style==='gull'?0.32:0.5;
    b.userData.tick=t=>{
      const w=t*sp+off;
      b.position.set(Math.cos(w)*R,y+Math.sin(t*0.5+off)*S.bob,Math.sin(w)*R);
      b.rotation.y=-w+Math.PI/2;
      /* A gull banks into its turn; nothing else does. */
      if(style==='gull') b.rotation.z=0.22*Math.sign(sp);
      const f=Math.sin(t*flap+off)*amp;
      wl.rotation.z=f; wr.rotation.z=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* The cloud sea. It is what tells the eye the land is floating, and it gives the
   falls somewhere to fall to. Tinted per realm — the frameworks sit over pink
   evening cloud and the forges over none at all, only smoke. */

/* The cloud sea below the land — what tells the eye the islands are floating,
   and what gives the falls somewhere to fall to. So it has to be IN THE SHOT,
   which is the one thing it was not.

   Every cloud is laid out in fractions of whatever you are currently looking
   at rather than in absolute units, and the real numbers are filled in by
   placeClouds() from the same bounds the camera fits. The old version placed
   them on a fixed ring, scaled the whole GROUP to the world's span, and then
   pushed the group down again — so a per-cloud depth of -12 to -30 came out at
   -49 to -61 on a 96-unit world, forty units under anything the camera frames.
   Seven clouds in ten were off the bottom of the screen.

   Group scale is deliberately left at 1 for the same reason: scaling a group
   scales its children's POSITIONS, so size and placement could never be tuned
   independently. Puff size is set per cloud instead. */
const CLOUD={cx:0,cz:0,r:60,y:-16};
function buildClouds(){
  const g=new THREE.Group();
  const rnd=rngOf(4242);
  const m=mat(0xFFFFFF,{rough:1,flat:false,opacity:0.62});
  for(let i=0;i<14;i++){
    const c=new THREE.Group();
    const n=3+Math.floor(rnd()*3);
    for(let k=0;k<n;k++){
      const p=meshOf(new THREE.IcosahedronGeometry(lerp(1.2,2.6,rnd()),1),m,false,false);
      p.position.set((rnd()-0.5)*5,(rnd()-0.5)*0.8,(rnd()-0.5)*3);
      p.scale.y=0.55; c.add(p);
    }
    const u=c.userData;
    u.a=rnd()*TAU;
    /* Across the archipelago's own footprint, not on a ring outside it: a sea
       you can only see past the edge of the map is not a sea under it. */
    u.rf=lerp(0.30,1.0,rnd());
    /* Deep enough to clear the lowest keel, shallow enough to stay inside the
       fit. Both ends matter — the old range failed the second. */
    u.yf=lerp(0.72,1.0,rnd());
    u.drift=lerp(0.006,0.02,rnd())*(rnd()<0.5?1:-1);
    u.tick=t=>{
      const w=u.a+t*u.drift;
      c.position.set(CLOUD.cx+Math.cos(w)*u.rf*CLOUD.r,
                     CLOUD.y*u.yf,
                     CLOUD.cz+Math.sin(w)*u.rf*CLOUD.r);
    };
    g.add(c); animated.push(c);
  }
  return g;
}
/* Re-laid whenever what you are looking at changes — the world and one realm
   inside it are different sizes and want their sea in different places. */
function placeClouds(){
  if(!W)return;
  const b=OPEN?OPEN.bounds:W.worldBounds;
  CLOUD.cx=(b.x0+b.x1)/2; CLOUD.cz=(b.z0+b.z1)/2;
  const span=Math.max(b.x1-b.x0,b.z1-b.z0);
  /* Both floors matter for the world that half the userbase actually has: ONE
     district, eleven units across. A sea sunk eleven units under an island
     three units wide is below the frame, and a ring drawn at half of eleven is
     a single blob directly underneath rather than a horizon. So the ring has a
     minimum spread of its own, and the depth floor is small enough to stay in
     shot on a world that small. */
  CLOUD.r=Math.max(span*0.52,14);
  CLOUD.y=-clamp(span*0.18,6,30);
  const puff=clamp(span/140,0.85,2.4);
  const t=clock.getElapsedTime();
  for(const c of clouds.children){ c.scale.setScalar(puff); c.userData.tick(t); }
}
function swarmHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const r=lerp(0.55,0.8,rnd())*scale, h=lerp(0.5,0.8,rnd())*scale;
  /* Drum + hemisphere. The beehive is the realm's whole housing vocabulary in
     the art — no gables anywhere, at any size. */
  g.add(meshOf(new THREE.CylinderGeometry(r,r*1.05,h,12),mat(P.stone,{rough:0.72}))
    .translateY(h/2));
  const dome=meshOf(new THREE.SphereGeometry(r*1.02,14,9,0,TAU,0,Math.PI/2),
    mat(rnd()<0.6?P.stone:P.stone2,{rough:0.6,flat:false}));
  dome.position.y=h; dome.scale.y=lerp(0.8,1.15,rnd()); g.add(dome);
  const band=meshOf(new THREE.CylinderGeometry(r*1.07,r*1.07,0.07,12),
    mat(P.roof2,{rough:0.6}));
  band.position.y=h; g.add(band);
  /* Round gold windows. Discs pushed proud of the drum, never inset — an inset
     window at this scale is a dark dot and reads as damage. */
  const wm=winMat(P,1.0);
  for(let i=0;i<2+Math.floor(rnd()*3);i++){
    const a=rnd()*TAU;
    const w=meshOf(new THREE.CylinderGeometry(0.1*scale,0.1*scale,0.05,10),wm,false,false);
    w.rotation.z=Math.PI/2; w.rotation.y=-a;
    w.position.set(Math.cos(a)*(r+0.01),h*0.6,Math.sin(a)*(r+0.01));
    g.add(w);
    const fr=meshOf(new THREE.TorusGeometry(0.11*scale,0.022,4,10),
      mat(P.stone2,{rough:0.8}),false,false);
    fr.position.copy(w.position); fr.rotation.y=-a+Math.PI/2; g.add(fr);
  }
  /* One arched door, in wood — the only warm material on the building, and it
     is what gives the dome a scale to be read against. */
  const da=rnd()*TAU;
  const door=meshOf(new THREE.CylinderGeometry(0.13*scale,0.13*scale,0.06,8,1,false,0,Math.PI),
    mat(P.wood,{rough:0.9}),false,false);
  door.rotation.z=Math.PI/2; door.rotation.y=-da+Math.PI/2;
  door.position.set(Math.cos(da)*(r+0.01),0.16*scale,Math.sin(da)*(r+0.01));
  g.add(door);
  const dbox=meshOf(new THREE.BoxGeometry(0.22*scale,0.2*scale,0.05),
    mat(P.wood,{rough:0.9}),false,false);
  dbox.rotation.y=-da+Math.PI/2;
  dbox.position.set(Math.cos(da)*(r+0.01),0.1*scale,Math.sin(da)*(r+0.01));
  g.add(dbox);
  /* A crystal finial, in the district accent. */
  const fin=meshOf(new THREE.OctahedronGeometry(0.1*scale),glowMat(P.accent,1.6),false,false);
  fin.scale.y=1.7; fin.position.y=h+r*1.02*dome.scale.y+0.12*scale; g.add(fin);
  return g;
}

function swarmTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* SQUARE plan, stepped, with corner pinnacles — deliberately not another
     drum. The houses and the hall in this realm are both round and domed, and
     when the tower was a third drum the whole district read as one object
     photocopied at three sizes. A four-sided shaft with setbacks gives the
     skyline a hard edge to sit against all that curvature, and it is the
     silhouette the tall crystal wants anyway. */
  const segs=3+Math.floor(rnd()*2);
  const tp=taper();
  let y=0, r=lerp(0.36,0.5,rnd());
  for(let i=0;i<segs;i++){
    const sh=h/segs*lerp(0.85,1.15,rnd()), rt=r*lerp(0.80,0.9,rnd());
    tp.add(y,y+sh,r,rt);
    const s=meshOf(new THREE.CylinderGeometry(rt,r,sh,4),
      mat(i%2?P.stone:P.stone2,{rough:0.68}));
    s.rotation.y=Math.PI/4; s.position.y=y+sh/2; g.add(s);
    /* A setback cornice at each break, in gold — the horizontal that stops the
       shaft reading as one long taper. */
    const cor=meshOf(new THREE.BoxGeometry(rt*2.5,0.1,rt*2.5),
      mat(P.metal,{metal:0.5,rough:0.35}));
    cor.position.y=y+sh; g.add(cor);
    /* Corner pinnacles on the lower setbacks. */
    if(i<segs-1){
      for(let k=0;k<4;k++){
        const a=k/4*TAU+Math.PI/4;
        const pin=meshOf(new THREE.ConeGeometry(0.075,0.42,4),
          mat(P.stone,{rough:0.7}),true,false);
        pin.position.set(Math.cos(a)*rt*1.42,y+sh+0.24,Math.sin(a)*rt*1.42);
        pin.rotation.y=Math.PI/4; g.add(pin);
      }
    }
    y+=sh; r=rt;
  }
  /* Flat crown, not a dome: the crystal is the top of this building. */
  const crown=meshOf(new THREE.BoxGeometry(r*2.3,0.16,r*2.3),
    mat(P.stone2,{rough:0.7}));
  crown.position.y=y+0.08; g.add(crown);
  const tip=meshOf(new THREE.OctahedronGeometry(0.3),
    mat(P.crys,{emissive:P.crys,ei:1.5,rough:0.2,flat:true,opacity:0.94}),false,false);
  tip.scale.set(0.8,3.0,0.8); tip.position.y=y+1.05;
  tip.userData.tick=t=>{ tip.rotation.y=t*0.4;
    tip.material.emissiveIntensity=1.3+Math.sin(t*1.2)*0.35; };
  g.add(tip); animated.push(tip);
  /* Tall slot windows to match the square plan — the round portholes belong to
     the houses, and reusing them here was half the sameness. */
  const wm=winMat(P,0.9);
  for(let i=0;i<6;i++){
    /* Face centres, not corners: a 4-gon rotated by 45 degrees puts its arrises
       on the diagonals, so the walls face the axes. And the apothem, not the
       circumradius — r is the distance to the CORNER. */
    const a=Math.floor(rnd()*4)/4*TAU;
    const wy=lerp(0.7,h-0.7,i/6+rnd()*0.08);
    const rr=tp.at(wy)*Math.SQRT1_2;
    const w=meshOf(new THREE.BoxGeometry(0.11,0.4,0.05),wm,false,false);
    w.position.set(Math.cos(a)*(rr+0.03),wy,Math.sin(a)*(rr+0.03));
    w.rotation.y=-a+Math.PI/2; g.add(w);
  }
  if(great) greatCrown(P,g,y+2.1,r);
  return g;
}

/* The great tower's crown. Once a district can no longer widen it needs ONE
   element that still says "bigger" at silhouette scale, and it flies the
   district's colours — so the biggest thing on the plot is also the thing that
   says what the plot is about.

   Six of them, because there was one: an orb with two gimbal rings around it
   and a stack of rings sliding down the shaft, on every tower in the world. It
   is the single most conspicuous object a district ever builds, it only appears
   at L11, and having it be identical across six realms undid the identity work
   everything below it was doing. Nothing here shares a motion with anything
   else — no two crowns orbit, sweep or pulse the same way. */
function greatCrown(P,g,bh,r){
  const K=P.kit;

  if(K==='swarm'){
    /* THE GREAT SHARD — one enormous crystal growing out of the tower, lit from
       inside, with smaller shards hanging motionless around it and light
       running UP the shaft. Up, deliberately: the old rings fell down it. */
    const core=meshOf(new THREE.OctahedronGeometry(0.5,0),
      mat(P.crys,{emissive:P.crys,ei:2.0,rough:0.18,flat:true,opacity:0.95}),false,false);
    core.scale.set(1,3.4,1); core.position.y=bh+0.9;
    core.userData.tick=t=>{ core.rotation.y=t*0.22;
      core.material.emissiveIntensity=1.8+Math.sin(t*1.1)*0.5; };
    g.add(core); animated.push(core);
    for(let i=0;i<5;i++){
      const a=i/5*TAU+0.4, rr=0.85;
      const s=meshOf(new THREE.OctahedronGeometry(0.16,0),
        mat(P.accent,{emissive:P.accent,ei:1.5,rough:0.2,opacity:0.94}),false,false);
      s.scale.y=2.2;
      const y0=bh+lerp(0.2,1.6,(i*0.37)%1);
      s.position.set(Math.cos(a)*rr,y0,Math.sin(a)*rr);
      s.userData.tick=t=>{ s.position.y=y0+Math.sin(t*0.8+i)*0.09; };
      g.add(s); animated.push(s);
    }
    for(let k=0;k<5;k++){
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.accent,
        transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
      sp.scale.setScalar(0.3);
      sp.userData.tick=t=>{
        const u=(t*0.22+k/5)%1;
        sp.position.set(0,lerp(bh-1.4,bh+2.6,u),0);
        sp.material.opacity=0.5*Math.sin(u*Math.PI);
      };
      g.add(sp); animated.push(sp);
    }

  }else if(K==='frame'){
    /* THE LANTERN BOUGH — a great seed-pod lantern hung from a curved branch,
       swinging, with fireflies wandering around it. Nothing rotates. */
    const arm=meshOf(new THREE.TorusGeometry(0.8,0.09,6,12,Math.PI*0.5),
      mat(P.bark,{rough:0.96}));
    arm.position.y=bh+0.5; arm.rotation.set(Math.PI/2,0,Math.PI*0.5); g.add(arm);
    const swing=new THREE.Group(); swing.position.set(0.8,bh+0.5,0); g.add(swing);
    swing.add(beam(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-0.55,0),0.03,
      mat(P.bark2,{rough:1}),false));
    const pod=meshOf(new THREE.SphereGeometry(0.42,12,9),
      mat(P.warm,{emissive:P.warm,ei:1.9,rough:0.3,flat:false}),false,false);
    pod.scale.y=1.45; pod.position.y=-1.15; swing.add(pod);
    for(let i=0;i<6;i++){
      const rib=meshOf(new THREE.TorusGeometry(0.44,0.028,4,12,Math.PI),
        mat(P.wood,{rough:0.9}),false,false);
      rib.position.y=-1.15; rib.scale.y=1.45; rib.rotation.y=i/6*Math.PI; swing.add(rib);
    }
    const leaf=meshOf(new THREE.SphereGeometry(0.5,10,6,0,Math.PI),
      mat(P.canopy,{rough:0.92,flat:false,side:THREE.DoubleSide}),true,false);
    leaf.position.y=-0.55; leaf.scale.set(1,0.3,1.3); swing.add(leaf);
    const ph=P.seed*0.3;
    swing.userData.tick=t=>{ swing.rotation.z=Math.sin(t*0.75+ph)*0.13;
      pod.material.emissiveIntensity=1.7+Math.sin(t*1.6+ph)*0.35; };
    animated.push(swing);
    for(let i=0;i<7;i++){
      const f=meshOf(new THREE.SphereGeometry(0.06,6,5),
        glowMat(P.accent,2.0),false,false);
      const s1=lerp(0.5,1.1,(i*0.29)%1), s2=lerp(0.4,0.9,(i*0.53)%1), o=i*0.9;
      f.userData.tick=t=>{
        f.position.set(0.8+Math.sin(t*s1+o)*0.9,bh-0.4+Math.cos(t*s2+o)*0.7,
                       Math.cos(t*s1*0.8+o)*0.9);
      };
      g.add(f); animated.push(f);
    }

  }else if(K==='forge'){
    /* THE POUR — a cauldron of melt at the top of the stack, tipping on a slow
       cycle and running a thread of lava over the lip. Embers rise off it. */
    const cauldron=meshOf(new THREE.CylinderGeometry(0.62,0.44,0.62,10),
      mat(P.iron,{metal:0.45,rough:0.55}));
    cauldron.position.y=bh+0.3; g.add(cauldron);
    const hoop=meshOf(new THREE.TorusGeometry(0.64,0.06,5,14),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    hoop.rotation.x=Math.PI/2; hoop.position.y=bh+0.58; g.add(hoop);
    const melt=meshOf(new THREE.CylinderGeometry(0.56,0.56,0.08,12),
      mat(P.lavaHot,{emissive:P.lavaHot,ei:2.0,rough:0.3,flat:false}),false,false);
    melt.position.y=bh+0.56; g.add(melt);
    melt.userData.tick=t=>{ melt.material.emissiveIntensity=1.7+Math.sin(t*0.9)*0.5; };
    animated.push(melt);
    /* The trunnion frame the cauldron hangs in, a launder carrying the pour
       CLEAR of the shaft, and a catch pot under it.

       The melt used to drop 2.2 units straight down from the lip on a bearing
       that was inside the tower's own footprint — so the drips crossed the
       stack, disappeared into the brickwork and came out the other side. A pour
       has to land in something, and it has to land outside the thing it is
       pouring off. Everything below now belongs to the crown, so the fall is
       short, it is bounded, and it never meets the tower at all. */
    const steel=mat(P.metal,{metal:0.55,rough:0.45});
    for(const s of [-1,1]){
      g.add(beam(new THREE.Vector3(s*0.78,bh-0.5,0),new THREE.Vector3(s*0.72,bh+0.4,0),
        0.07,steel));
    }
    /* The launder: a shallow trough leaning away from the tower. */
    const lau=meshOf(new THREE.BoxGeometry(0.9,0.07,0.34),steel);
    lau.position.set(0.92,bh+0.36,0); lau.rotation.z=-0.26; g.add(lau);
    for(const s of [-1,1]){
      const wall=meshOf(new THREE.BoxGeometry(0.9,0.14,0.05),steel,false,false);
      wall.position.set(0.92,bh+0.42,s*0.17); wall.rotation.z=-0.26; g.add(wall);
    }
    const run=meshOf(new THREE.BoxGeometry(0.86,0.05,0.24),
      mat(P.lavaHot,{emissive:P.lavaHot,ei:1.9,rough:0.3,flat:false}),false,false);
    run.position.set(0.92,bh+0.41,0); run.rotation.z=-0.26; g.add(run);
    /* The catch pot, hung off the frame on the far side of the launder. */
    const potX=1.42, potY=bh-0.42;
    const pot=meshOf(new THREE.CylinderGeometry(0.34,0.26,0.34,10),
      mat(P.iron2,{metal:0.45,rough:0.55}));
    pot.position.set(potX,potY,0); g.add(pot);
    const potMelt=meshOf(new THREE.CylinderGeometry(0.29,0.29,0.06,10),
      mat(P.lavaHot,{emissive:P.lavaHot,ei:1.8,rough:0.3,flat:false}),false,false);
    potMelt.position.set(potX,potY+0.16,0); g.add(potMelt);
    potMelt.userData.tick=t=>{
      potMelt.material.emissiveIntensity=1.6+Math.sin(t*1.7)*0.4; };
    animated.push(potMelt);
    for(const s of [-1,1]){
      g.add(beam(new THREE.Vector3(s*0+potX,potY+0.2,s*0.3),
                 new THREE.Vector3(0.78,bh+0.3,s*0.18),0.035,steel,false));
    }
    /* The thread of melt, falling from the launder lip into the pot and no
       further. Fixed start, fixed end, nothing in between to intersect. */
    const dropTop=bh+0.28, dropLen=dropTop-(potY+0.17);
    for(let k=0;k<5;k++){
      const d=meshOf(new THREE.SphereGeometry(0.075,7,6),
        mat(P.lava,{emissive:P.lava,ei:1.8,rough:0.3,flat:false}),false,false);
      d.userData.tick=t=>{
        const u=(t*0.75+k/5)%1;
        d.position.set(lerp(1.34,potX,u),dropTop-u*dropLen,0);
        d.scale.setScalar(1-u*0.35);
      };
      g.add(d); animated.push(d);
    }
    for(let k=0;k<8;k++){
      const e=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,
        color:k%2?P.lava:P.lavaHot,transparent:true,opacity:0.6,
        depthWrite:false,blending:THREE.AdditiveBlending}));
      e.scale.setScalar(0.22);
      e.userData.tick=t=>{
        const u=(t*0.36+k/8)%1;
        e.position.set(Math.sin(u*7+k)*0.5,bh+0.6+u*3.0,Math.cos(u*6+k)*0.5);
        e.material.opacity=0.6*(1-u);
      };
      g.add(e); animated.push(e);
    }

  }else if(K==='ship'){
    /* THE SIGNAL MAST — crossed yardarms with a hoist of signal flags, an
       anemometer spinning on top, and a hard aero-beacon that sweeps. */
    const mastM=mat(P.metal,{metal:0.5,rough:0.45});
    const mast=meshOf(new THREE.CylinderGeometry(0.07,0.11,2.6,8),mastM);
    mast.position.y=bh+0.9; g.add(mast);
    for(let i=0;i<2;i++){
      const y=bh+0.5+i*0.85, len=1.5-i*0.45;
      const yard=meshOf(new THREE.CylinderGeometry(0.045,0.045,len,6),mastM);
      yard.rotation.z=Math.PI/2; yard.position.y=y; g.add(yard);
      /* Signal flags on the yard — small planes that ripple. */
      for(let k=0;k<4;k++){
        const fx=lerp(-len*0.4,len*0.4,k/3);
        const fl=meshOf(new THREE.PlaneGeometry(0.26,0.2,4,3),
          mat([P.stripe,P.accent,0xC2453C,P.hull][k%4],
            {side:THREE.DoubleSide,flat:false,rough:0.85}),true,false);
        fl.position.set(fx,y-0.16,0);
        const base=fl.geometry.attributes.position.array.slice();
        const o=k*1.3+i;
        fl.userData.tick=t=>{
          const p=fl.geometry.attributes.position;
          for(let v=0;v<p.count;v++)
            p.setZ(v,Math.sin(t*4+o+base[v*3]*7)*0.05);
          p.needsUpdate=true;
        };
        g.add(fl); animated.push(fl);
      }
    }
    /* Anemometer: three cups on a spinner. */
    const spin=new THREE.Group(); spin.position.y=bh+2.24; g.add(spin);
    for(let k=0;k<3;k++){
      const a=k/3*TAU;
      spin.add(beam(new THREE.Vector3(0,0,0),
        new THREE.Vector3(Math.cos(a)*0.26,0,Math.sin(a)*0.26),0.02,mastM,false));
      const cup=meshOf(new THREE.SphereGeometry(0.075,8,6,0,Math.PI),
        mat(P.stripe,{rough:0.6,side:THREE.DoubleSide}),false,false);
      cup.position.set(Math.cos(a)*0.28,0,Math.sin(a)*0.28);
      cup.rotation.y=-a; spin.add(cup);
    }
    spin.userData.tick=t=>{ spin.rotation.y=t*2.4; }; animated.push(spin);
    const lamp=meshOf(new THREE.CylinderGeometry(0.2,0.2,0.3,10),
      glowMat(P.accent,2.0),false,false);
    lamp.position.y=bh+2.0; g.add(lamp);
    const beamM=new THREE.MeshStandardMaterial({color:P.accent,emissive:P.accent,
      emissiveIntensity:1.1,roughness:0.3,transparent:true,opacity:0.24,
      side:THREE.DoubleSide,depthWrite:false});
    const bm=meshOf(new THREE.ConeGeometry(0.36,5.0,9,1,true),beamM,false,false);
    bm.rotation.z=Math.PI/2; bm.position.x=2.5;
    const bg=new THREE.Group(); bg.add(bm); bg.position.y=bh+2.0; g.add(bg);
    bg.userData.tick=t=>{ bg.rotation.y=-t*0.55; }; animated.push(bg);

  }else if(K==='bastion'){
    /* THE WARD SIGIL — a rune disc standing UPRIGHT like a shield emblem,
       turning in its own plane. It faces you; it does not orbit anything. */
    const sig=new THREE.Group(); sig.position.y=bh+0.9; g.add(sig);
    const rim=meshOf(new THREE.TorusGeometry(0.85,0.09,7,28),
      mat(P.metal,{metal:0.6,rough:0.4,env:1.0}),false,false);
    sig.add(rim);
    const inner=meshOf(new THREE.TorusGeometry(0.55,0.05,6,22),
      mat(P.ward,{emissive:P.ward,ei:1.6,rough:0.3,metal:0.2}),false,false);
    sig.add(inner);
    for(let k=0;k<6;k++){
      const a=k/6*TAU;
      const spoke=meshOf(new THREE.BoxGeometry(0.06,0.6,0.05),
        mat(P.stone2,{rough:0.9}),false,false);
      spoke.position.set(Math.cos(a)*0.7,Math.sin(a)*0.7,0);
      spoke.rotation.z=a+Math.PI/2; sig.add(spoke);
    }
    const eye=meshOf(new THREE.OctahedronGeometry(0.26),
      mat(P.accent,{emissive:P.accent,ei:2.2,rough:0.25,flat:true}),false,false);
    sig.add(eye);
    sig.userData.tick=t=>{
      sig.rotation.z=t*0.16;
      eye.rotation.set(t*0.5,t*0.35,0);
      inner.material.emissiveIntensity=1.4+Math.sin(t*1.2)*0.4;
    };
    animated.push(sig);
    /* Four carved standing stones, set on the parapet and lit along a cut
       groove. Not gems, and not floating — this realm builds in ashlar and
       everything it owns is bolted to the rock. */
    for(let k=0;k<4;k++){
      const a=k/4*TAU+Math.PI/4;
      const x=Math.cos(a)*1.25, z=Math.sin(a)*1.25;
      const st=meshOf(new THREE.CylinderGeometry(0.14,0.2,0.85,5),
        mat(P.stone,{rough:0.94}));
      st.position.set(x,bh+0.05,z); st.rotation.y=-a; g.add(st);
      const cap=meshOf(new THREE.CylinderGeometry(0.16,0.16,0.07,5),
        mat(P.snow,{rough:1}),false,false);
      cap.position.set(x,bh+0.5,z); cap.rotation.y=-a; g.add(cap);
      const groove=meshOf(new THREE.BoxGeometry(0.055,0.44,0.045),
        mat(P.ward,{emissive:P.ward,ei:1.4,rough:0.4,flat:false}),false,false);
      groove.position.set(x+Math.cos(a)*0.13,bh+0.08,z+Math.sin(a)*0.13);
      groove.rotation.y=-a;
      const ph=k*1.5;
      groove.userData.tick=t=>{
        groove.material.emissiveIntensity=1.2+Math.sin(t*1.1+ph)*0.35; };
      g.add(groove); animated.push(groove);
    }

  }else{
    /* THE GREAT BELL — it swings, and a weather-vane turns above it. The only
       crown in the world whose motion is a pendulum. */
    const canopy=new THREE.Group(); canopy.position.y=bh; g.add(canopy);
    /* A plinth the belfry actually stands on. Without it the whole canopy —
       posts, roof, bell and vane — hung in the air a clear metre above the
       dome, which is why it read as floating: it WAS. The drum sinks into the
       dome below and the posts land on its rim. */
    const plinth=meshOf(new THREE.CylinderGeometry(0.82,0.9,0.42,14),
      mat(P.stucco2,{rough:0.9}));
    plinth.position.y=-0.14; canopy.add(plinth);
    const step=meshOf(new THREE.CylinderGeometry(0.92,0.98,0.12,14),
      mat(P.stucco3,{rough:0.9}));
    step.position.y=0.11; canopy.add(step);
    for(let k=0;k<4;k++){
      const a=k/4*TAU+Math.PI/4;
      canopy.add(meshOf(new THREE.CylinderGeometry(0.06,0.07,1.1,7),
        mat(P.stucco3,{rough:0.9})).translateX(Math.cos(a)*0.6)
        .translateY(0.72).translateZ(Math.sin(a)*0.6));
    }
    const roof=meshOf(new THREE.SphereGeometry(0.95,14,9,0,TAU,0,Math.PI/2),
      mat(P.rose,{rough:0.76,flat:false}));
    roof.position.y=1.27; roof.scale.y=0.85; canopy.add(roof);
    const fin=meshOf(new THREE.SphereGeometry(0.1,8,6),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    fin.position.y=2.09; canopy.add(fin);
    /* The vane: an arrow on a spindle, swinging back and forth rather than
       spinning — a weather-vane hunts, it does not rotate steadily. */
    const vane=new THREE.Group(); vane.position.y=2.33; canopy.add(vane);
    const shaft=meshOf(new THREE.BoxGeometry(0.7,0.04,0.04),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    vane.add(shaft);
    const head=meshOf(new THREE.ConeGeometry(0.09,0.22,4),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    head.rotation.z=-Math.PI/2; head.position.x=0.42; vane.add(head);
    const tail=meshOf(new THREE.BoxGeometry(0.2,0.18,0.02),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    tail.position.x=-0.34; vane.add(tail);
    vane.userData.tick=t=>{ vane.rotation.y=Math.sin(t*0.35)*1.1+Math.sin(t*1.3)*0.12; };
    animated.push(vane);
    /* The bell hangs from the headstock under the canopy roof, on a yoke with
       visible straps — a bell floating in the middle of a gap was the other
       half of the problem. */
    const bell=new THREE.Group(); bell.position.y=bh+1.14; g.add(bell);
    for(const sd of [-1,1]){
      const strap=meshOf(new THREE.BoxGeometry(0.05,0.34,0.05),
        mat(P.metal,{metal:0.6,rough:0.4}),false,false);
      strap.position.set(sd*0.22,0.17,0); g.add(strap);
    }
    const body=meshOf(new THREE.CylinderGeometry(0.2,0.46,0.6,12),
      mat(P.metal,{metal:0.65,rough:0.35,env:1.0}));
    body.position.y=-0.3; bell.add(body);
    const lip=meshOf(new THREE.TorusGeometry(0.46,0.06,6,16),
      mat(P.metal,{metal:0.65,rough:0.35}),false,false);
    lip.rotation.x=Math.PI/2; lip.position.y=-0.6; bell.add(lip);
    const yoke=meshOf(new THREE.BoxGeometry(0.7,0.08,0.1),
      mat(P.wood,{rough:0.92}),false,false);
    bell.add(yoke);
    const glow=meshOf(new THREE.SphereGeometry(0.12,8,6),
      glowMat(P.accent,1.8),false,false);
    glow.position.y=-0.52; bell.add(glow);
    bell.userData.tick=t=>{ bell.rotation.z=Math.sin(t*1.15)*0.26; };
    animated.push(bell);
  }
}

function swarmHall(P,rnd){
  /* A basilica: LONG, low, colonnaded, entered up a flight of steps. The houses
     are round and squat and the tower is square and tall, so the hall takes the
     third axis — horizontal. A bigger version of the beehive was the obvious
     call and it is exactly the thing that made the district look like one shape
     at three scales. */
  const g=new THREE.Group();
  const w=lerp(1.7,2.2,rnd()), d=lerp(2.8,3.6,rnd()), h=lerp(0.95,1.3,rnd());
  /* Stylobate — three steps all the way round, which is most of what says
     "temple" before any of the detail lands. */
  for(let i=0;i<3;i++){
    const s=meshOf(new THREE.BoxGeometry(w+1.0-i*0.26,0.13,d+1.0-i*0.26),
      mat(i%2?P.stone:P.stone2,{rough:0.85}),true,true);
    s.position.y=0.065+i*0.13; g.add(s);
  }
  const base=0.39;
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.stone,{rough:0.7}))
    .translateY(base+h/2));
  /* The peristyle: columns down both long sides, on the step, with a proper
     architrave over them. */
  const nc=Math.max(5,Math.round(d/0.62));
  for(let i=0;i<nc;i++){
    const z=lerp(-d/2+0.2,d/2-0.2,i/(nc-1));
    for(const s of [-1,1]){
      const col=meshOf(new THREE.CylinderGeometry(0.085,0.1,h,9),
        mat(P.stone2,{rough:0.72}));
      col.position.set(s*(w/2+0.34),base+h/2,z); g.add(col);
      const cap=meshOf(new THREE.BoxGeometry(0.26,0.08,0.26),mat(P.stone,{rough:0.72}));
      cap.position.set(s*(w/2+0.34),base+h,z); g.add(cap);
    }
  }
  for(const s of [-1,1]){
    const arch=meshOf(new THREE.BoxGeometry(0.34,0.16,d),mat(P.stone,{rough:0.72}));
    arch.position.set(s*(w/2+0.34),base+h+0.12,0); g.add(arch);
  }
  const cornice=meshOf(new THREE.BoxGeometry(w+1.0,0.14,d+0.24),
    mat(P.roof2,{rough:0.6}));
  cornice.position.y=base+h+0.24; g.add(cornice);
  /* A shallow saucer dome on a low drum over the crossing — wide and flat, the
     opposite proportion to the houses' tall beehives. */
  const dr=w*0.52;
  const drum=meshOf(new THREE.CylinderGeometry(dr,dr*1.08,0.3,14),
    mat(P.stone2,{rough:0.7}));
  drum.position.y=base+h+0.46; g.add(drum);
  const dome=meshOf(new THREE.SphereGeometry(dr*1.02,16,10,0,TAU,0,Math.PI/2),
    mat(P.stone,{rough:0.55,flat:false}));
  dome.position.y=base+h+0.6; dome.scale.y=0.52; g.add(dome);
  for(let i=0;i<10;i++){
    const a=i/10*TAU;
    const rib=meshOf(new THREE.TorusGeometry(dr*1.03,0.035,4,10,Math.PI/2),
      mat(P.stone2,{rough:0.7}),true,false);
    rib.position.y=base+h+0.6; rib.rotation.y=-a; rib.scale.y=0.52; g.add(rib);
  }
  /* A tall arched door at the short end, and clerestory slots above the
     architrave — light comes in high in a basilica. */
  const door=meshOf(new THREE.CylinderGeometry(w*0.19,w*0.19,0.06,10,1,false,0,Math.PI),
    winMat(P,0.75),false,false);
  door.rotation.z=Math.PI/2; door.rotation.y=Math.PI/2;
  door.position.set(0,base+h*0.42,d/2+0.02); g.add(door);
  const dbox=meshOf(new THREE.BoxGeometry(w*0.38,h*0.44,0.05),winMat(P,0.75),false,false);
  dbox.position.set(0,base+h*0.22,d/2+0.02); g.add(dbox);
  const wm=winMat(P,0.95);
  for(let i=0;i<Math.max(3,nc-2);i++){
    const z=lerp(-d*0.34,d*0.34,i/Math.max(1,Math.max(3,nc-2)-1));
    for(const s of [-1,1]){
      const cl=meshOf(new THREE.BoxGeometry(0.05,0.2,0.22),wm,false,false);
      cl.position.set(s*(w/2+0.01),base+h*0.82,z); g.add(cl);
    }
  }
  const top=meshOf(new THREE.OctahedronGeometry(0.2),glowMat(P.accent,1.8),false,false);
  top.scale.y=1.8; top.position.y=base+h+0.6+dr*0.55+0.28;
  top.userData.tick=t=>{top.rotation.y=t*0.5;}; g.add(top); animated.push(top);
  return g;
}

function swarmPlant(P,rnd){
  const g=new THREE.Group();
  const h=lerp(0.9,1.9,rnd());
  /* A leaning, kinked trunk in two segments. Straight cylinders read as
     lampposts with salad on top; the kink is most of what makes it a tree. */
  const t1=meshOf(new THREE.CylinderGeometry(0.09,0.14,h*0.6,6),mat(P.wood,{rough:0.95}));
  t1.position.y=h*0.3; t1.rotation.z=(rnd()-0.5)*0.2; g.add(t1);
  const t2=meshOf(new THREE.CylinderGeometry(0.06,0.09,h*0.5,6),mat(P.wood,{rough:0.95}));
  t2.position.set(Math.sin(t1.rotation.z)*-h*0.3,h*0.82,0);
  t2.rotation.z=(rnd()-0.5)*0.5; g.add(t2);
  /* Lavender canopy: three overlapping blobs, flattened, so the crown reads as
     one mass rather than as three balls. */
  const n=3+Math.floor(rnd()*2);
  const cx=Math.sin(t1.rotation.z)*-h*0.3;
  for(let i=0;i<n;i++){
    const r=lerp(0.42,0.72,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(r,1),
      mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.9,flat:false}));
    b.position.set(cx+(rnd()-0.5)*0.6,h+0.1+(rnd()-0.5)*0.35,(rnd()-0.5)*0.6);
    b.scale.y=0.78; g.add(b);
  }
  if(rnd()<0.55){
    for(let i=0;i<3;i++){
      const b=meshOf(new THREE.SphereGeometry(0.07,6,5),glowMat(P.bloom,1.3),false,false);
      b.position.set(cx+(rnd()-0.5)*0.9,h+rnd()*0.5,(rnd()-0.5)*0.9); g.add(b);
    }
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*0.8+sway)*0.03;};
  animated.push(g);
  return g;
}

function swarmFeature(P,rnd){
  const g=new THREE.Group();
  const n=2+Math.floor(rnd()*4);
  /* Three behaviours, drawn per SHARD rather than per cluster. Every crystal in
     the realm used to pulse on the same clock and sit dead still otherwise,
     which made a field of them read as one blinking texture. Now most are
     simply rooted and quiet, a few turn on their axis, and a few have come
     loose and hang above the ground — so the eye finds motion where it looks
     rather than everywhere at once.

     Only the ones that move get a tick and a material of their own. The rooted
     majority share the cached material and cost nothing per frame, which is
     also why this is affordable at 20-odd clusters a district. */
  for(let i=0;i<n;i++){
    const h=lerp(0.35,1.5,rnd()), w=lerp(0.13,0.3,rnd());
    const hot=rnd()<0.6;
    const hex=hot?P.crys:P.crys2;
    const roll=rnd();
    const kind=roll<0.55?'root':roll<0.8?'spin':'float';

    if(kind==='root'){
      const c=meshOf(new THREE.OctahedronGeometry(1,0),
        mat(hex,{emissive:hex,ei:0.5,rough:0.22,flat:true,opacity:0.94}));
      c.scale.set(w,h,w);
      c.position.set((rnd()-0.5)*0.6,h*0.55,(rnd()-0.5)*0.6);
      c.rotation.set((rnd()-0.5)*0.3,rnd()*3,(rnd()-0.5)*0.3);
      g.add(c);
      continue;
    }

    /* Own material: these breathe, and a shared one would breathe for every
       crystal on the island at once. */
    const m=new THREE.MeshStandardMaterial({color:hex,emissive:hex,
      emissiveIntensity:0.5,roughness:0.22,flatShading:true,
      transparent:true,opacity:0.94});
    const c=meshOf(new THREE.OctahedronGeometry(1,0),m,true,kind==='root');
    c.scale.set(w,h,w);
    const px=(rnd()-0.5)*0.6, pz=(rnd()-0.5)*0.6, ph=rnd()*TAU;

    if(kind==='spin'){
      c.position.set(px,h*0.55,pz);
      c.rotation.set((rnd()-0.5)*0.2,0,(rnd()-0.5)*0.2);
      const sp=lerp(0.12,0.34,rnd())*(rnd()<0.5?1:-1);
      c.userData.tick=t=>{
        c.rotation.y=t*sp;
        m.emissiveIntensity=0.5+Math.sin(t*1.1+ph)*0.22;
      };
    }else{
      /* Loose, and hanging point-down — a shard that broke off the plate and
         never fell. Lifted clear of the turf so the gap under it is visible;
         resting on the ground it just reads as another rooted one. */
      const y0=h*0.55+lerp(0.45,1.1,rnd());
      c.position.set(px,y0,pz);
      c.receiveShadow=false;
      const sp=lerp(0.2,0.5,rnd())*(rnd()<0.5?1:-1);
      const bob=lerp(0.06,0.16,rnd()), rate=lerp(0.6,1.1,rnd());
      c.userData.tick=t=>{
        c.position.y=y0+Math.sin(t*rate+ph)*bob;
        c.rotation.y=t*sp;
        c.rotation.z=Math.sin(t*rate*0.7+ph)*0.12;
        m.emissiveIntensity=0.62+Math.sin(t*1.4+ph)*0.3;
      };
    }
    g.add(c); animated.push(c);
  }
  return g;
}
/* Frameworks planting: fern clumps, a hollow-log planter and mushroom rings.
   It used to share the clipped hedges and topiary balls with the swarm and the
   artisan's, which is exactly wrong — this is the one realm whose ground cover
   is WILD. Nothing here is trimmed. */
function frameGarden(P,rnd){
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.4){
    /* A fern clump: splayed fronds, no trunk. */
    const n=4+Math.floor(rnd()*3);
    for(let i=0;i<n;i++){
      const a=i/n*TAU+rnd()*0.3, len=lerp(0.3,0.55,rnd());
      const fr=meshOf(new THREE.ConeGeometry(0.1,len,4),
        mat(rnd()<0.5?P.moss:P.canopy,{rough:0.98}),true,false);
      fr.position.set(Math.cos(a)*0.12,len*0.45,Math.sin(a)*0.12);
      fr.rotation.set(Math.sin(a)*0.55,-a,-Math.cos(a)*0.55);
      fr.scale.z=0.4; g.add(fr);
    }
  }else if(style<0.72){
    /* A fallen log with things growing out of it. */
    const len=lerp(0.8,1.4,rnd());
    const log=meshOf(new THREE.CylinderGeometry(0.16,0.19,len,7),
      mat(P.bark2,{rough:0.98}));
    log.rotation.set(0,rnd()*TAU,Math.PI/2); log.position.y=0.17; g.add(log);
    for(let i=0;i<3;i++){
      const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.1,0.19,rnd()),0),
        mat(P.moss,{rough:0.98}),false,false);
      b.position.set((rnd()-0.5)*len*0.6,0.3,(rnd()-0.5)*0.2);
      b.scale.y=0.55; g.add(b);
    }
    const cap=meshOf(new THREE.SphereGeometry(0.11,8,6,0,TAU,0,Math.PI/2),
      mat(P.shroom,{emissive:P.shroom,ei:0.4,rough:0.5,flat:false}));
    cap.position.set(lerp(-0.2,0.2,rnd()),0.36,0.1); cap.scale.y=0.7; g.add(cap);
  }else{
    /* A fairy ring — mushrooms in a circle around bare earth. */
    const r=lerp(0.3,0.46,rnd()), n=5+Math.floor(rnd()*3);
    for(let i=0;i<n;i++){
      const a=i/n*TAU+rnd()*0.1, hh=lerp(0.1,0.2,rnd());
      const st=meshOf(new THREE.CylinderGeometry(0.028,0.036,hh,5),
        mat(0xF2E7D2,{rough:0.9}),true,false);
      st.position.set(Math.cos(a)*r,hh/2,Math.sin(a)*r); g.add(st);
      const cp=meshOf(new THREE.SphereGeometry(lerp(0.07,0.11,rnd()),8,5,0,TAU,0,Math.PI/2),
        mat(rnd()<0.5?P.shroom:P.shroom2,
          {emissive:rnd()<0.5?P.shroom:P.shroom2,ei:0.45,rough:0.5,flat:false}));
      cp.position.set(Math.cos(a)*r,hh,Math.sin(a)*r); cp.scale.y=0.75; g.add(cp);
    }
  }
  return g;
}

/* Artisan's planting: everything is in a POT. This realm's relationship with
   nature is that it is placed, clipped and swept around — sharing the swarm's
   loose hedges undersold the one idea the reference is clearest about. */
function quarterGarden(P,rnd){
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.45){
    /* A cluster of terracotta pots at three sizes. */
    const n=2+Math.floor(rnd()*3);
    for(let i=0;i<n;i++){
      const pr=lerp(0.11,0.2,rnd()), ph=lerp(0.14,0.26,rnd());
      const x=(rnd()-0.5)*0.5, z=(rnd()-0.5)*0.5;
      const pot=meshOf(new THREE.CylinderGeometry(pr,pr*0.72,ph,9),
        mat(rnd()<0.5?P.cliff:P.rose2,{rough:0.92,flat:false}));
      pot.position.set(x,ph/2,z); g.add(pot);
      const rim=meshOf(new THREE.TorusGeometry(pr,0.022,5,10),
        mat(P.cliff2,{rough:0.9}),false,false);
      rim.rotation.x=Math.PI/2; rim.position.set(x,ph,z); g.add(rim);
      const b=meshOf(new THREE.IcosahedronGeometry(pr*lerp(1.0,1.5,rnd()),1),
        mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.96,flat:false}));
      b.position.set(x,ph+pr*0.9,z); g.add(b);
    }
  }else if(style<0.78){
    /* A trellis with something climbing it — vertical planting, which nothing
       else in the world has. */
    const w=lerp(0.6,0.95,rnd()), h=lerp(0.8,1.2,rnd());
    const ry=rnd()*TAU;
    const frame=new THREE.Group(); frame.rotation.y=ry;
    for(const s of [-1,1]){
      frame.add(meshOf(new THREE.CylinderGeometry(0.028,0.032,h,5),
        mat(P.wood,{rough:0.94}),true,false).translateX(s*w/2).translateY(h/2));
    }
    for(let i=0;i<3;i++){
      const bar=meshOf(new THREE.BoxGeometry(w,0.04,0.04),
        mat(P.wood,{rough:0.94}),true,false);
      bar.position.y=h*(0.3+i*0.3); frame.add(bar);
    }
    for(let i=0;i<6;i++){
      const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.09,0.16,rnd()),0),
        mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.96}),false,false);
      b.position.set(lerp(-w*0.45,w*0.45,rnd()),lerp(0.15,h,rnd()),0.03);
      b.scale.z=0.6; frame.add(b);
      if(rnd()<0.5){
        const f=meshOf(new THREE.IcosahedronGeometry(0.05,0),
          mat(P.blush,{emissive:P.blush,ei:0.22,rough:0.7}),false,false);
        f.position.set(b.position.x+0.05,b.position.y+0.05,0.06); frame.add(f);
      }
    }
    g.add(frame);
  }else{
    /* A raised planter box in dressed stone, with a low clipped edge. */
    const w=lerp(0.7,1.1,rnd()), d=lerp(0.4,0.6,rnd());
    const box=meshOf(new THREE.BoxGeometry(w,0.24,d),mat(P.stone2,{rough:0.94}));
    box.rotation.y=rnd()*TAU; box.position.y=0.12; g.add(box);
    const cop=meshOf(new THREE.BoxGeometry(w+0.06,0.05,d+0.06),
      mat(P.stucco3,{rough:0.9}),false,false);
    cop.rotation.y=box.rotation.y; cop.position.y=0.26; g.add(cop);
    for(let i=0;i<4;i++){
      const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.1,0.16,rnd()),1),
        mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.96,flat:false}));
      const t=(i/3-0.5)*w*0.8;
      b.position.set(Math.cos(box.rotation.y)*t,0.34,-Math.sin(box.rotation.y)*t);
      g.add(b);
    }
  }
  return g;
}

/* Gardens: a hedge, a topiary or a flower bed. The swarm's own — clipped,
   ornamental, and the only realm still using it. */
function softGarden(P,rnd){
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.45){
    const l=lerp(0.8,1.8,rnd());
    const b=meshOf(new THREE.BoxGeometry(l,0.34,0.3),mat(P.foliage,{rough:0.98}));
    b.position.y=0.17; b.rotation.y=rnd()*TAU; g.add(b);
  }else if(style<0.8){
    const r=lerp(0.24,0.4,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(r,1),mat(P.foliage2,{rough:0.98}));
    b.position.y=r*0.9; g.add(b);
    g.add(meshOf(new THREE.CylinderGeometry(0.05,0.05,r,5),mat(P.wood))
      .translateY(r*0.4));
  }else{
    const r=lerp(0.3,0.5,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(r,r*0.9,0.16,8),mat(P.stone2))
      .translateY(0.08));
    for(let i=0;i<7;i++){
      const a=i/7*TAU;
      const f=meshOf(new THREE.IcosahedronGeometry(0.09,0),
        mat(P.bloom,{emissive:P.bloom,ei:0.35,rough:0.6}),false,false);
      f.position.set(Math.cos(a)*r*0.6,0.2,Math.sin(a)*r*0.6); g.add(f);
    }
  }
  return g;
}

/* The swarm's landform: crystal growing OUT of the lawn, and shards hanging in
   the air just off the rim. The realm is legible with no buildings on it at all,
   which is the whole reason every realm now has terrain. */
function swarmShards(P,prof,R,sp){
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,4400));
  const n=Math.round(3+R*0.5);
  for(let i=0;i<n;i++){
    const a=i*2.399963229728653+P.seed*0.11;
    const rr=radiusAt(prof,a)*R*lerp(1.08,1.32,rnd());
    const y=lerp(-1.6,2.2,rnd());
    /* Kept small. Big ones read as flat magenta playing cards hanging in the
       sky — at this size they are chips off the keel, which is the story. */
    const s=lerp(0.16,0.38,rnd());
    const c=meshOf(new THREE.OctahedronGeometry(s,0),
      mat(rnd()<0.5?P.crys:P.crys2,{emissive:P.crys,ei:0.4,rough:0.2,opacity:0.92}),
      false,false);
    c.scale.y=lerp(1.3,2.4,rnd());
    const ph=rnd()*TAU, spin=lerp(0.06,0.2,rnd())*(rnd()<0.5?1:-1);
    c.position.set(Math.cos(a)*rr,y,Math.sin(a)*rr);
    /* Same three-way split as the crystal on the ground: a third of them just
       hang there. A sky full of shards all bobbing in step reads as a screen
       saver, and the still ones are what make the moving ones read as moving. */
    const roll=rnd();
    if(roll<0.34){
      c.rotation.set(0.3,ph,0.2);
    }else if(roll<0.67){
      c.rotation.set(0.3,ph,0.2);
      c.userData.tick=t=>{ c.rotation.y=t*spin+ph; };
      animated.push(c);
    }else{
      c.userData.tick=t=>{ c.rotation.set(0.3,t*spin*0.5+ph,0.2);
        c.position.y=y+Math.sin(t*0.5+ph)*0.24; };
      animated.push(c);
    }
    g.add(c);
  }
  /* And a ring of low crystal in the turf at a fixed radius — the "ward" the
     district is built inside. Absolute, so it never moves. */
  const wr=Math.min(2.6,R-0.5);
  if(wr>1){
    const m=Math.round(TAU*wr/0.7);
    for(let i=0;i<m;i++){
      const a=i/m*TAU;
      const rr=radiusAt(prof,a)*wr;
      const c=meshOf(new THREE.OctahedronGeometry(lerp(0.1,0.2,rnd()),0),
        mat(P.crys,{emissive:P.crys,ei:0.5,rough:0.25}),false,true);
      c.scale.y=lerp(1.6,2.6,rnd());
      c.position.set(Math.cos(a)*rr,tierY(wr)+0.24,Math.sin(a)*rr);
      c.rotation.y=rnd()*TAU; g.add(c);
    }
  }
  return g;
}

/* ============================================================ THE FRAMEWORKS
   Reference: one colossal gnarled tree whose roots wrap the whole island, timber
   cottages with mossy gabled roofs and warm windows clustered under it, a glass
   greenhouse with timber ribs and a leaf-shaped cap, a winding cobble path with
   rail fences and lanterns, glowing mushrooms in the undergrowth, butterflies,
   and a lilac evening sky.

   The tree is not decoration — it is the landform, it exists at L1 as a sapling,
   and everything else in the realm is built in its shade. */

/* A roof with a proper gable, because a 4-sided cone is a tepee and the
   frameworks are the one realm whose houses have to read as HOUSES — but a
   straight-sided prism is the other wrong answer. Nothing in either the
   frameworks or the artisan reference has a flat plane on it: the roofs BOW,
   the ridges sag, the eaves flare out and droop. Three curves, all cheap:

     arch  — the cross-section is a swollen arc rather than two straight rakes.
             Exponent under 1 keeps it full near the ridge and turns down hard
             at the eave, which is the thatched/tiled look both realms want.
     droop — the last of the overhang bends below the wall line, so the eave
             reads as a lip and casts a shadow on the wall under it.
     sag   — the ridge dips in the middle. This is the one that does the most
             work for the money: a dead-straight ridge is what makes procedural
             housing look printed.

   Ridge runs along +z. DoubleSide because the eaves turn under and you can see
   the inside of the overhang from a low iso angle. */
function softRoof(w,d,rise,hex,opt={}){
  const nu=opt.nu??10, nv=opt.nv??5;
  const droop=opt.droop??rise*0.22, sag=opt.sag??rise*0.13;
  const pt=(i,j)=>{
    const u=i/nu*2-1, v=j/nv*2-1;
    const y=rise*Math.pow(Math.max(0,1-u*u),0.58)
          - droop*Math.pow(Math.abs(u),5)
          - sag*(1-v*v);
    return [u*w/2, y, v*d/2];
  };
  const pos=[];
  const tri=(a,b,c)=>pos.push(...a,...b,...c);
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
    const A=pt(i,j),B=pt(i+1,j),Cc=pt(i+1,j+1),D=pt(i,j+1);
    tri(A,D,Cc); tri(A,Cc,B);
  }
  /* Gable ends, fanned from a point under the ridge so the end wall follows the
     same arc as the slopes instead of cutting it off with a straight chord. */
  for(const j of [0,nv]){
    const z=pt(0,j)[2], hub=[0,-rise*0.22,z];
    for(let i=0;i<nu;i++){
      const A=pt(i,j), B=pt(i+1,j);
      j===0?tri(A,hub,B):tri(A,B,hub);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.computeVertexNormals();
  return meshOf(geo,mat(hex,{rough:opt.rough??0.9,flat:false,
    side:THREE.DoubleSide}));
}

function frameHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(0.9,1.3,rnd())*scale;
  const h=lerp(0.75,1.05,rnd())*scale;
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.wood,{rough:0.92})).translateY(h/2));
  /* Half-timbering: two cream panels on the long walls. Cheap, and it is what
     makes the cottages read as storybook rather than as sheds. */
  for(const s of [-1,1]){
    const pn=meshOf(new THREE.BoxGeometry(w*0.62,h*0.42,0.04),
      mat(P.stone,{rough:0.95}),false,false);
    pn.position.set(0,h*0.62,s*(d/2+0.01)); if(s<0)pn.rotation.y=Math.PI; g.add(pn);
  }
  let roofY=h, rw=w, rd=d;
  if(rnd()<0.45){
    const h2=h*0.66, w2=w*0.8, d2=d*0.8;
    const up=meshOf(new THREE.BoxGeometry(w2,h2,d2),mat(P.stone2,{rough:0.9}));
    up.position.set((rnd()-0.5)*0.14,h+h2/2,(rnd()-0.5)*0.14);
    up.rotation.y=(rnd()-0.5)*0.35; g.add(up);
    roofY=h+h2; rw=w2; rd=d2;
  }
  const rise=lerp(0.45,0.72,rnd())*scale;
  const roof=softRoof(rw*1.30,rd*1.26,rise,rnd()<0.6?P.moss:P.moss2);
  roof.position.y=roofY; g.add(roof);
  /* Moss and a couple of sprouts ON the roof — every roof in the reference has
     something growing out of it. */
  for(let i=0;i<2+Math.floor(rnd()*2);i++){
    const t=meshOf(new THREE.IcosahedronGeometry(lerp(0.09,0.17,rnd()),0),
      mat(P.canopy,{rough:0.98}),false,false);
    t.position.set((rnd()-0.5)*rw*0.6,roofY+rise*lerp(0.3,0.8,rnd()),(rnd()-0.5)*rd*0.7);
    t.scale.y=0.7; g.add(t);
  }
  const wm=winMat(P,1.0);
  for(let i=0;i<2+Math.floor(rnd()*3);i++){
    const side=Math.floor(rnd()*4), sw=0.2*scale, sh=0.26*scale;
    const win=meshOf(new THREE.BoxGeometry(sw,sh,0.06),wm,false,false);
    const off=(rnd()-0.5)*0.5;
    if(side===0)win.position.set(off,h*0.55,d/2+0.02);
    else if(side===1){win.position.set(off,h*0.55,-d/2-0.02);win.rotation.y=Math.PI;}
    else if(side===2){win.position.set(w/2+0.02,h*0.55,off);win.rotation.y=Math.PI/2;}
    else {win.position.set(-w/2-0.02,h*0.55,off);win.rotation.y=-Math.PI/2;}
    g.add(win);
    const fr=meshOf(new THREE.BoxGeometry(sw*1.4,0.05,0.05),mat(P.bark2,{rough:0.95}),false,false);
    fr.position.copy(win.position); fr.rotation.copy(win.rotation);
    fr.position.y+=sh*0.62; g.add(fr);
  }
  if(rnd()<0.5){
    const ch=meshOf(new THREE.BoxGeometry(0.18,0.6,0.18).translate(0,0.3,0),
      mat(P.cliff2,{rough:0.98}));
    ch.position.set(w*0.3,roofY,d*0.2); g.add(ch);
    smokePlume(g,w*0.3,roofY+0.62,d*0.2,0.5,0xFFFFFF,0.28);
  }
  /* A rail fence along one side. The reference is full of them and they are what
     make the cottages read as a settlement instead of as scattered huts. */
  if(rnd()<0.6){
    const fz=d/2+0.28;
    for(let i=0;i<4;i++){
      const px=lerp(-w*0.6,w*0.6,i/3);
      g.add(meshOf(new THREE.CylinderGeometry(0.04,0.045,0.4,5),
        mat(P.bark2,{rough:0.95}),true,false).translateX(px).translateY(0.2).translateZ(fz));
    }
    const rail=meshOf(new THREE.BoxGeometry(w*1.24,0.05,0.05),mat(P.bark2,{rough:0.95}),true,false);
    rail.position.set(0,0.3,fz); g.add(rail);
  }
  return g;
}

function frameTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* A tower here is a stack of cabins climbing a trunk — height in this realm is
     always something built AROUND wood, never a masonry shaft. */
  const trunk=meshOf(new THREE.CylinderGeometry(0.24,0.4,h,7),mat(P.bark,{rough:0.98}));
  trunk.position.y=h/2; g.add(trunk);
  const decks=3+Math.floor(rnd()*2);
  for(let i=0;i<decks;i++){
    const y=h*(0.28+i*0.62/decks)+rnd()*0.2;
    const r=lerp(0.9,1.35,rnd())*(1-i*0.12);
    const plat=meshOf(new THREE.CylinderGeometry(r,r,0.13,9),mat(P.wood,{rough:0.92}));
    plat.position.y=y; g.add(plat);
    for(let k=0;k<9;k++){
      const a=k/9*TAU;
      const p=meshOf(new THREE.CylinderGeometry(0.035,0.035,0.34,4),
        mat(P.bark2,{rough:0.95}),true,false);
      p.position.set(Math.cos(a)*r*0.92,y+0.23,Math.sin(a)*r*0.92); g.add(p);
    }
    const ring=meshOf(new THREE.TorusGeometry(r*0.92,0.03,4,14),
      mat(P.bark2,{rough:0.95}),true,false);
    ring.rotation.x=Math.PI/2; ring.position.y=y+0.4; g.add(ring);
    /* A cabin on every other deck, so the tower has mass and not just railings. */
    if(i%2===0){
      const cw=r*0.95, cd=r*0.8, ch=lerp(0.6,0.85,rnd());
      const cab=meshOf(new THREE.BoxGeometry(cw,ch,cd),mat(P.wood,{rough:0.92}));
      cab.position.set(r*0.15,y+ch/2+0.07,0); cab.rotation.y=rnd()*0.6; g.add(cab);
      const rf=softRoof(cw*1.3,cd*1.3,0.44,P.moss);
      rf.position.set(r*0.15,y+ch+0.07,0); rf.rotation.y=cab.rotation.y; g.add(rf);
      const w=meshOf(new THREE.BoxGeometry(0.2,0.24,0.05),winMat(P,1.0),false,false);
      w.position.set(r*0.15+Math.cos(cab.rotation.y)*cd*0.52,y+ch*0.6+0.07,
                     r*0.15-Math.sin(cab.rotation.y)*cd*0.52);
      w.rotation.y=cab.rotation.y; g.add(w);
    }
    /* A hanging lantern under each deck — the reference hangs them everywhere. */
    const la=rnd()*TAU;
    g.add(beam(new THREE.Vector3(Math.cos(la)*r*0.8,y-0.06,Math.sin(la)*r*0.8),
               new THREE.Vector3(Math.cos(la)*r*0.8,y-0.42,Math.sin(la)*r*0.8),0.02,
               mat(P.bark2,{rough:1}),false));
    const lan=meshOf(new THREE.BoxGeometry(0.16,0.2,0.16),glowMat(P.warm,1.7),false,false);
    lan.position.set(Math.cos(la)*r*0.8,y-0.55,Math.sin(la)*r*0.8); g.add(lan);
  }
  /* Canopy on top, not a spire: the tallest thing in the frameworks is foliage. */
  for(let i=0;i<4;i++){
    const r=lerp(0.8,1.4,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(r,1),
      mat(rnd()<0.5?P.canopy:P.canopy2,{rough:0.94,flat:false}));
    b.position.set((rnd()-0.5)*1.1,h+lerp(0.2,0.9,rnd()),(rnd()-0.5)*1.1);
    b.scale.y=0.75; g.add(b);
  }
  if(great) greatCrown(P,g,h+1.9,0.5);
  return g;
}

function frameHall(P,rnd){
  /* The greenhouse. A barrel vault of glass on timber ribs with a leaf-shaped
     cap over the ridge — the single most identifiable building in the whole
     reference set, so it is the realm's hall at every size. */
  const g=new THREE.Group();
  const w=lerp(1.6,2.2,rnd()), d=lerp(2.2,3.0,rnd()), h=lerp(0.5,0.7,rnd());
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.stone2,{rough:0.95})).translateY(h/2));
  const vault=meshOf(new THREE.CylinderGeometry(w/2,w/2,d,16,1,true,0,Math.PI),
    mat(P.glass,{opacity:0.42,rough:0.08,metal:0.1,flat:false,
      side:THREE.DoubleSide,env:1.2,emissive:P.glass,ei:0.12}),false,false);
  vault.rotation.z=Math.PI/2; vault.rotation.y=Math.PI/2; vault.position.y=h;
  g.add(vault);
  const ribMat=mat(P.wood,{rough:0.9});
  for(let i=0;i<=6;i++){
    const z=lerp(-d/2,d/2,i/6);
    const rib=meshOf(new THREE.TorusGeometry(w/2,0.045,4,14,Math.PI),ribMat);
    rib.position.set(0,h,z); g.add(rib);
  }
  const ridge=meshOf(new THREE.CylinderGeometry(0.05,0.05,d,5),ribMat);
  ridge.rotation.x=Math.PI/2; ridge.position.y=h+w/2; g.add(ridge);
  /* The leaf cap: two flattened, tapered blades laid over the ridge. */
  for(const s of [-1,1]){
    const leaf=meshOf(new THREE.SphereGeometry(w*0.42,10,6,0,Math.PI),
      mat(P.canopy,{rough:0.92,flat:false,side:THREE.DoubleSide}),true,false);
    leaf.position.set(s*w*0.12,h+w/2*0.92,0);
    leaf.scale.set(1,0.35,d/w*1.05); leaf.rotation.z=s*0.4; g.add(leaf);
  }
  /* Warm light and green shapes INSIDE, seen through the glass. */
  const glow=meshOf(new THREE.BoxGeometry(w*0.6,0.1,d*0.7),glowMat(P.warm,0.7),false,false);
  glow.position.y=h+0.12; g.add(glow);
  for(let i=0;i<5;i++){
    const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.16,0.3,rnd()),0),
      mat(rnd()<0.5?P.canopy:P.moss,{rough:0.98}),false,false);
    b.position.set((rnd()-0.5)*w*0.5,h+lerp(0.2,0.5,rnd()),(rnd()-0.5)*d*0.7); g.add(b);
  }
  /* A timber door at one end, with steps. */
  const door=meshOf(new THREE.CylinderGeometry(w*0.2,w*0.2,0.08,8,1,false,0,Math.PI),
    mat(P.wood,{rough:0.9}),false,false);
  door.rotation.z=Math.PI/2; door.position.set(0,h*0.5+0.1,d/2+0.02); g.add(door);
  for(let i=0;i<2;i++){
    const st=meshOf(new THREE.BoxGeometry(w*0.55,0.09,0.24),mat(P.stone,{rough:0.95}),false,true);
    st.position.set(0,0.09-i*0.09,d/2+0.16+i*0.2); g.add(st);
  }
  return g;
}

function framePlant(P,rnd){
  const g=new THREE.Group();
  /* Big soft-leaved undergrowth, not trees — the trees in this realm are the
     Great Tree and the tower canopies, and a lawn of little trees under a giant
     one destroys the scale that makes the giant read as giant. */
  const n=3+Math.floor(rnd()*3);
  for(let i=0;i<n;i++){
    const a=i/n*TAU+rnd(), len=lerp(0.35,0.75,rnd());
    const stem=meshOf(new THREE.CylinderGeometry(0.03,0.045,len,4),
      mat(P.moss2,{rough:1}),false,false);
    stem.position.set(Math.cos(a)*0.1,len/2,Math.sin(a)*0.1);
    stem.rotation.z=Math.cos(a)*0.35; stem.rotation.x=-Math.sin(a)*0.35; g.add(stem);
    const leaf=meshOf(new THREE.SphereGeometry(lerp(0.2,0.36,rnd()),7,5),
      mat(rnd()<0.5?P.canopy:P.moss,{rough:0.96,flat:false}));
    leaf.position.set(Math.cos(a)*(0.1+len*0.42),len*0.94,Math.sin(a)*(0.1+len*0.42));
    leaf.scale.set(1,0.24,1.25); leaf.rotation.y=-a; g.add(leaf);
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*1.1+sway)*0.045;};
  animated.push(g);
  return g;
}

function frameFeature(P,rnd){
  /* Glowing mushrooms. In the reference they are everywhere along the path, in
     pink and violet, and they are the realm's night-light. */
  const g=new THREE.Group();
  const n=2+Math.floor(rnd()*4);
  for(let i=0;i<n;i++){
    const h=lerp(0.16,0.42,rnd()), cr=lerp(0.11,0.24,rnd());
    const st=meshOf(new THREE.CylinderGeometry(cr*0.28,cr*0.36,h,6),
      mat(0xF2E7D2,{rough:0.9}),true,false);
    const x=(rnd()-0.5)*0.5, z=(rnd()-0.5)*0.5;
    st.position.set(x,h/2,z); g.add(st);
    const hot=rnd()<0.55;
    const cap=meshOf(new THREE.SphereGeometry(cr,9,6,0,TAU,0,Math.PI/2),
      mat(hot?P.shroom:P.shroom2,{emissive:hot?P.shroom:P.shroom2,ei:0.5,
        rough:0.5,flat:false}));
    cap.position.set(x,h,z); cap.scale.y=lerp(0.6,0.95,rnd()); g.add(cap);
    const ph=rnd()*TAU;
    cap.userData.tick=t=>{cap.material.emissiveIntensity=0.4+Math.sin(t*1.3+ph)*0.22;};
    animated.push(cap);
  }
  return g;
}

/* ---------------------------------------------------------- THE GREAT TREE
   The frameworks' landform, and the clearest growth story in the file: at L1 it
   is a sapling you could step over, at L12 it is a canopy the whole district
   lives under. Everything about it derives from `level` alone, and it stands at
   the exact centre for the whole life of the plot — so the district's signature
   monument is placed off-centre in this realm (see SIG_AT). */
function greatTree(P,level){
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,5500));
  const t=(level-1)/11;
  const h=lerp(1.1,13.5,Math.pow(t,0.85));
  const rBase=lerp(0.1,1.5,Math.pow(t,0.9));
  const barkMat=mat(P.bark,{rough:0.98}), bark2Mat=mat(P.bark2,{rough:0.98});

  /* Buttress roots, once the trunk is thick enough to need them. They splay out
     over the turf and are half of why the tree reads as ancient. */
  if(level>=4){
    const n=5+Math.floor(t*4);
    for(let i=0;i<n;i++){
      const a=i/n*TAU+P.seed*0.1;
      const len=rBase*lerp(2.0,3.2,rnd());
      const rt=meshOf(new THREE.CylinderGeometry(rBase*0.34,rBase*0.1,len,5),bark2Mat);
      rt.position.set(Math.cos(a)*len*0.42,rBase*0.3,Math.sin(a)*len*0.42);
      rt.rotation.set(Math.sin(a)*1.25,0,-Math.cos(a)*1.25);
      g.add(rt);
    }
  }
  /* Trunk in segments, leaning slightly and thinning — a single straight
     cylinder reads as a pillar however much bark you paint on it. */
  const segs=Math.max(2,Math.round(2+t*4));
  let y=0, r=rBase, lean=0;
  for(let i=0;i<segs;i++){
    const sh=h/segs, rt=r*lerp(0.72,0.86,rnd());
    const s=meshOf(new THREE.CylinderGeometry(rt,r,sh,8),i%2?barkMat:bark2Mat);
    lean+=(rnd()-0.5)*0.14;
    s.position.set(Math.sin(lean)*y*0.1,y+sh/2,Math.cos(lean)*0-0);
    s.rotation.z=lean*0.5;
    g.add(s);
    y+=sh; r=rt;
  }
  const topX=Math.sin(lean)*y*0.1;
  /* Boughs, then canopy. The canopy is a cluster of flattened blobs so it reads
     as one mass with a silhouette, not as a bowl of green marbles. */
  if(level>=3){
    const nb=Math.round(2+t*5);
    for(let i=0;i<nb;i++){
      const a=i/nb*TAU+P.seed*0.2, len=r*lerp(3.5,6.5,rnd())+h*0.12;
      const bo=meshOf(new THREE.CylinderGeometry(r*0.28,r*0.5,len,6),barkMat);
      const by=y*lerp(0.68,0.95,rnd());
      bo.position.set(topX+Math.cos(a)*len*0.35,by,Math.sin(a)*len*0.35);
      bo.rotation.set(Math.sin(a)*1.0,0,-Math.cos(a)*1.0);
      g.add(bo);
    }
  }
  const canopyR=lerp(0.55,5.6,Math.pow(t,0.8));
  const nc=Math.round(3+t*9);
  for(let i=0;i<nc;i++){
    const a=i*2.399963229728653, rr=Math.sqrt((i+0.4)/nc)*canopyR;
    const br=canopyR*lerp(0.34,0.55,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(br,1),
      mat(rnd()<0.5?P.canopy:P.canopy2,{rough:0.94,flat:false}));
    b.position.set(topX+Math.cos(a)*rr,y+lerp(-0.1,0.6,rnd())*canopyR*0.5+br*0.2,
                   Math.sin(a)*rr);
    b.scale.y=0.7; g.add(b);
  }
  /* Walkways spiralling the trunk, and lanterns hung off the boughs. Both are
     late unlocks: the tree has to be climbable before anybody climbs it. */
  if(level>=7){
    const turns=Math.round(1+t*2);
    const n=turns*10;
    const plankMat=mat(P.wood,{rough:0.92});
    for(let i=0;i<n;i++){
      const u=i/n;
      const a=u*TAU*turns+P.seed*0.3;
      const rr=r*1.4+lerp(1.5,2.6,u)*0.6+rBase*0.9;
      const py=lerp(h*0.22,h*0.78,u);
      const pl=meshOf(new THREE.BoxGeometry(0.62,0.09,0.42),plankMat,true,false);
      pl.position.set(topX*u+Math.cos(a)*rr,py,Math.sin(a)*rr); pl.rotation.y=-a;
      g.add(pl);
      if(i%2===0){
        const po=meshOf(new THREE.CylinderGeometry(0.035,0.035,0.36,4),
          mat(P.bark2,{rough:0.95}),true,false);
        po.position.set(topX*u+Math.cos(a)*rr*1.06,py+0.22,Math.sin(a)*rr*1.06);
        g.add(po);
      }
    }
  }
  if(level>=5){
    const nl=Math.round(3+t*10);
    for(let i=0;i<nl;i++){
      const a=i*2.399963229728653+P.seed*0.4;
      const rr=canopyR*lerp(0.35,0.95,rnd());
      const ly=y+lerp(-0.9,0.1,rnd())*canopyR*0.4;
      const drop=lerp(0.4,1.3,rnd());
      g.add(beam(new THREE.Vector3(topX+Math.cos(a)*rr,ly,Math.sin(a)*rr),
                 new THREE.Vector3(topX+Math.cos(a)*rr,ly-drop,Math.sin(a)*rr),
                 0.02,mat(P.bark2,{rough:1}),false));
      const lan=meshOf(new THREE.BoxGeometry(0.17,0.22,0.17),glowMat(P.warm,1.8),false,false);
      lan.position.set(topX+Math.cos(a)*rr,ly-drop-0.13,Math.sin(a)*rr);
      const ph=rnd()*TAU;
      lan.userData.tick=tt=>{lan.material.emissiveIntensity=1.6+Math.sin(tt*1.5+ph)*0.35;};
      g.add(lan); animated.push(lan);
    }
  }
  /* The whole tree breathes. One tick on the group, not per branch. */
  const sway=rnd()*TAU;
  g.userData.tick=tt=>{ g.rotation.z=Math.sin(tt*0.42+sway)*0.012;
    g.rotation.x=Math.cos(tt*0.35+sway)*0.010; };
  animated.push(g);
  return g;
}

/* ========================================================= THE METAL FORGES
   Reference: a dark hexagonal-column mesa under a slab deck, brick halls with
   corrugated barrel-vault roofs and glowing porthole windows, riveted stack
   towers venting smoke, a lava fountain spilling down cut steps, small teal
   quench pools, coal heaps — all under a deep indigo dusk with an ember horizon.

   The one rule that keeps it from becoming a hellscape: this is a WORKSHOP at
   the end of the day. Dark surfaces, warm light, nothing red-on-black. */
function forgeHouse(P,rnd,scale=1){
  /* A brick kiln-house with a crow-stepped gable and a low iron roof slung
     behind it. NOT another barrel vault: the shipyards own the curved
     corrugated shed, and while the forges built the same box-plus-half-cylinder
     the two realms shared their most numerous object — fifty-odd buildings a
     district, identical in structure, separated only by paint.

     The stepped gable is the tell. It is masonry, and it could not be pressed
     out of a sheet of steel. */
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(0.9,1.3,rnd())*scale;
  const h=lerp(0.6,0.9,rnd())*scale;
  const brickM=mat(rnd()<0.5?P.brick:P.brick2,{rough:0.95});
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),brickM).translateY(h/2));
  const steps=3;
  const rise=lerp(0.42,0.62,rnd())*scale;
  for(const sd of [-1,1]){
    for(let i=0;i<steps;i++){
      const u=i/steps;
      const sw=w*(1-u*0.62);
      const st=meshOf(new THREE.BoxGeometry(sw,rise/steps,0.16*scale),brickM);
      st.position.set(0,h+rise/steps*(i+0.5),sd*(d/2-0.06*scale)); g.add(st);
    }
    const cope=meshOf(new THREE.BoxGeometry(w*0.42,0.07*scale,0.2*scale),
      mat(P.metal,{metal:0.4,rough:0.6}),false,false);
    cope.position.set(0,h+rise+0.03*scale,sd*(d/2-0.06*scale)); g.add(cope);
  }
  const roof=meshOf(new THREE.BoxGeometry(w*0.94,0.09*scale,d*0.9),
    mat(P.iron,{metal:0.35,rough:0.6}));
  roof.position.y=h+rise*0.62; g.add(roof);
  for(let i=0;i<4;i++){
    const rb=meshOf(new THREE.BoxGeometry(0.05*scale,0.05*scale,d*0.9),
      mat(P.iron2,{metal:0.4,rough:0.55}),false,false);
    rb.position.set(lerp(-w*0.36,w*0.36,i/3),h+rise*0.62+0.06*scale,0); g.add(rb);
  }
  const wm=winMat(P,1.5);
  for(let i=0;i<2+Math.floor(rnd()*2);i++){
    const sd=rnd()<0.5?1:-1, off=(rnd()-0.5)*d*0.5;
    const win=meshOf(new THREE.CylinderGeometry(0.1*scale,0.1*scale,0.05,10),wm,false,false);
    win.rotation.z=Math.PI/2; win.position.set(sd*(w/2+0.01),h*0.58,off); g.add(win);
    const fr=meshOf(new THREE.TorusGeometry(0.12*scale,0.028,4,10),
      mat(P.metal,{metal:0.5,rough:0.45}),false,false);
    fr.position.copy(win.position); fr.rotation.y=Math.PI/2; g.add(fr);
  }
  const da=rnd()<0.5?1:-1;
  const dr=meshOf(new THREE.CylinderGeometry(0.2*scale,0.2*scale,0.06,9,1,false,0,Math.PI),
    glowMat(P.lavaHot,1.3),false,false);
  dr.rotation.z=Math.PI/2; dr.rotation.y=Math.PI/2;
  dr.position.set(0,0.2*scale,da*(d/2+0.01)); g.add(dr);
  if(rnd()<0.42){
    const ch=meshOf(new THREE.CylinderGeometry(0.11,0.13,0.75,7),
      mat(P.iron,{metal:0.4,rough:0.6}));
    ch.position.set(w*0.3,h+rise*0.62+0.5,d*0.22); g.add(ch);
    forgeSmoke(P,g,w*0.3,h+rise*0.62+0.95,d*0.22,0.9);
  }
  return g;
}

/* Smoke, budgeted. The forges are the realm that needs it — in the reference
   every chimney is venting, and it is what gives that flat dark deck a sky —
   but "every chimney" is 40+ houses at L12, and at four puffs each that was 160
   extra meshes each carrying a per-frame closure, on top of the motes and the
   lava. The budget is a hard cap per district: the first few chimneys smoke and
   the rest are cold, which is also true of any real works.

   Each puff gets its OWN material. They used to share one out of the cache and
   every one of them wrote `.opacity` on it every frame, so the whole district's
   smoke flickered together at whatever value happened to be written last — the
   fade never worked, it just strobed. A material that animates cannot be a
   shared material. */
let smokeBudget=0;
function smokePlume(g,x,y,z,scale,hex,rate=0.22,puffs=3){
  if(smokeBudget<=0)return;
  smokeBudget--;
  for(let k=0;k<puffs;k++){
    const m=new THREE.MeshStandardMaterial({color:hex,roughness:1,
      transparent:true,opacity:0.36,depthWrite:false});
    const p=meshOf(new THREE.IcosahedronGeometry(0.17*scale,0),m,false,false);
    p.userData.tick=t=>{
      const u=((t*rate+k/puffs)%1);
      p.position.set(x+Math.sin(u*3.4+k)*0.3*scale,y+u*3.2*scale,
                     z+Math.cos(u*2.6+k)*0.24*scale);
      p.scale.setScalar(0.6+u*2.4);
      m.opacity=0.36*(1-u);
    };
    g.add(p); animated.push(p);
  }
}
const forgeSmoke=(P,g,x,y,z,scale)=>smokePlume(g,x,y,z,scale,P.smoke,0.22);

function forgeTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* A riveted stack: banded drums, an external pipe running up one side, and a
     flared cap. Straight off the two smokestack towers in the reference. */
  const segs=3+Math.floor(rnd()*2);
  const tp=taper();
  let y=0, r=lerp(0.5,0.72,rnd());
  const ironM=mat(P.iron,{metal:0.42,rough:0.55});
  const brickM=mat(P.brick,{rough:0.95});
  for(let i=0;i<segs;i++){
    const sh=h/segs*lerp(0.85,1.15,rnd()), rt=r*lerp(0.82,0.92,rnd());
    tp.add(y,y+sh,r,rt);
    g.add(meshOf(new THREE.CylinderGeometry(rt,r,sh,10),i%2?ironM:brickM)
      .translateY(y+sh/2));
    const band=meshOf(new THREE.CylinderGeometry(rt*1.13,rt*1.13,0.14,10),
      mat(P.metal,{metal:0.6,rough:0.4}));
    band.position.y=y+sh; g.add(band);
    /* Rivets: a ring of little studs on the band. Two draw calls of detail that
       do more for "industrial" than any texture would. */
    for(let k=0;k<10;k++){
      const a=k/10*TAU;
      const rv=meshOf(new THREE.SphereGeometry(0.035,5,4),
        mat(P.metal,{metal:0.7,rough:0.35}),false,false);
      rv.position.set(Math.cos(a)*rt*1.15,y+sh,Math.sin(a)*rt*1.15); g.add(rv);
    }
    /* A glowing slot, so the stack looks charged rather than cold. */
    if(i===0||i===segs-2){
      const sl=meshOf(new THREE.BoxGeometry(rt*1.5,0.16,0.06),glowMat(P.lava,1.6),false,false);
      sl.position.y=y+sh*0.5; sl.rotation.y=rnd()*TAU; g.add(sl);
      const sl2=sl.clone(); sl2.rotation.y=sl.rotation.y+Math.PI/2; g.add(sl2);
    }
    y+=sh; r=rt;
  }
  /* The external pipe. */
  const pa=rnd()*TAU;
  const pipe=meshOf(new THREE.CylinderGeometry(0.09,0.09,h*0.8,7),
    mat(P.metal,{metal:0.55,rough:0.45}));
  pipe.position.set(Math.cos(pa)*(r*1.5),h*0.4,Math.sin(pa)*(r*1.5)); g.add(pipe);
  const elbow=meshOf(new THREE.TorusGeometry(0.2,0.09,5,10,Math.PI/2),
    mat(P.metal,{metal:0.55,rough:0.45}));
  elbow.position.set(Math.cos(pa)*(r*1.5),h*0.8,Math.sin(pa)*(r*1.5));
  elbow.rotation.y=-pa; g.add(elbow);
  const cap=meshOf(new THREE.CylinderGeometry(r*1.5,r*1.05,0.42,10),ironM);
  cap.position.y=y+0.21; g.add(cap);
  const mouth=meshOf(new THREE.CylinderGeometry(r*1.2,r*1.2,0.08,10),
    glowMat(P.lava,1.2),false,false);
  mouth.position.y=y+0.4; g.add(mouth);
  forgeSmoke(P,g,0,y+0.6,0,1.5);
  const wm=winMat(P,1.4);
  for(let i=0;i<4;i++){
    const a=rnd()*TAU, wy=lerp(0.6,h-0.9,i/4+rnd()*0.1);
    const rr=tp.at(wy);
    const w=meshOf(new THREE.CylinderGeometry(0.09,0.09,0.05,9),wm,false,false);
    w.rotation.z=Math.PI/2; w.rotation.y=-a;
    w.position.set(Math.cos(a)*(rr+0.02),wy,Math.sin(a)*(rr+0.02)); g.add(w);
  }
  if(great) greatCrown(P,g,y+1.4,r);
  return g;
}

function forgeHall(P,rnd){
  /* The blast furnace. NOT a bigger shed: the houses already own the brick
     barrel vault, and making the hall a scaled-up copy of one was the clearest
     case in the file of a realm built from a single object at two sizes.

     This is a stepped mass instead — a battered brick block with corner
     buttresses, a flat working roof carrying pipework and a charging gantry,
     and one enormous arched maw with the melt behind it. Vertical, heavy and
     angular against the low round-topped sheds around it. */
  const g=new THREE.Group();
  const w=lerp(2.2,2.8,rnd()), d=lerp(2.0,2.6,rnd());
  /* Three stages, each stepped in — a battered stack reads as something that
     holds heat, which a straight-sided box never does. */
  const stages=[[1.0,1.15],[0.82,1.0],[0.62,0.7]];
  let y=0;
  stages.forEach(([sc,sh],i)=>{
    const b=meshOf(new THREE.BoxGeometry(w*sc,sh,d*sc),
      mat(i%2?P.brick:P.brick2,{rough:0.95}));
    b.position.y=y+sh/2; g.add(b);
    const band=meshOf(new THREE.BoxGeometry(w*sc+0.14,0.13,d*sc+0.14),
      mat(P.iron,{metal:0.4,rough:0.55}));
    band.position.y=y+sh; g.add(band);
    y+=sh;
  });
  /* Corner buttresses on the bottom stage, battered outward at the foot. */
  for(let k=0;k<4;k++){
    const a=k/4*TAU+Math.PI/4;
    const bt=meshOf(new THREE.CylinderGeometry(0.14,0.26,1.15,5),
      mat(P.brick2,{rough:0.95}));
    bt.position.set(Math.cos(a)*w*0.46,0.575,Math.sin(a)*d*0.46); g.add(bt);
  }
  /* The maw: a tall arch with the melt behind it, and a tapping spout running
     out onto the deck. */
  const mw=w*0.3;
  const maw=meshOf(new THREE.CylinderGeometry(mw,mw,0.12,12,1,false,0,Math.PI),
    glowMat(P.lavaHot,1.6),false,false);
  maw.rotation.z=Math.PI/2; maw.rotation.y=Math.PI/2;
  maw.position.set(0,0.72,d/2+0.04); g.add(maw);
  const mbox=meshOf(new THREE.BoxGeometry(mw*2,0.72,0.08),glowMat(P.lavaHot,1.6),false,false);
  mbox.position.set(0,0.36,d/2+0.04); g.add(mbox);
  const jamb=meshOf(new THREE.TorusGeometry(mw*1.12,0.1,5,14,Math.PI),
    mat(P.metal,{metal:0.5,rough:0.45}));
  jamb.position.set(0,0.72,d/2+0.08); g.add(jamb);
  const spout=meshOf(new THREE.BoxGeometry(0.34,0.06,1.0),
    mat(mixTok(P.lava,0x18101C,0.45),{emissive:P.lava,ei:1.0,rough:0.5}),false,true);
  spout.position.set(0,0.1,d/2+0.6); g.add(spout);
  /* Roof furniture: a charging gantry across the top, and two offtake pipes
     elbowing down the outside. This is the silhouette that separates it from
     everything else on the island. */
  const gm=mat(P.metal,{metal:0.55,rough:0.45});
  for(const s of [-1,1]){
    g.add(beam(new THREE.Vector3(s*w*0.28,y,-d*0.24),
               new THREE.Vector3(s*w*0.28,y+0.9,-d*0.24),0.07,gm));
  }
  const gantry=meshOf(new THREE.BoxGeometry(w*0.72,0.12,0.3),gm);
  gantry.position.set(0,y+0.92,-d*0.24); g.add(gantry);
  const hopper=meshOf(new THREE.CylinderGeometry(0.3,0.18,0.42,8),
    mat(P.iron,{metal:0.4,rough:0.6}));
  const hx=w*0.2;
  hopper.userData.tick=t=>{ hopper.position.set(Math.sin(t*0.4)*hx,y+0.62,-d*0.24); };
  g.add(hopper); animated.push(hopper);
  for(const s of [-1,1]){
    const pipe=meshOf(new THREE.CylinderGeometry(0.11,0.11,y*0.8,8),gm);
    pipe.position.set(s*(w*0.4),y*0.5,d*0.1); g.add(pipe);
    const el=meshOf(new THREE.TorusGeometry(0.22,0.11,5,10,Math.PI/2),gm);
    el.position.set(s*(w*0.4),y*0.9,d*0.1); el.rotation.y=s>0?0:Math.PI; g.add(el);
  }
  /* The stack, off-centre and taller than anything the houses carry. */
  const st=meshOf(new THREE.CylinderGeometry(0.19,0.24,1.5,9),
    mat(P.iron,{metal:0.4,rough:0.6}));
  st.position.set(w*0.16,y+0.75,d*0.2); g.add(st);
  const cap=meshOf(new THREE.CylinderGeometry(0.28,0.2,0.2,9),gm);
  cap.position.set(w*0.16,y+1.55,d*0.2); g.add(cap);
  forgeSmoke(P,g,w*0.16,y+1.7,d*0.2,1.4);
  const wm=winMat(P,1.5);
  for(let i=0;i<6;i++){
    const s=i<3?1:-1, off=lerp(-d*0.24,d*0.24,(i%3)/2);
    const win=meshOf(new THREE.CylinderGeometry(0.12,0.12,0.06,10),wm,false,false);
    win.rotation.z=Math.PI/2;
    win.position.set(s*(w*0.5+0.02),0.6+(i%3)*0.5,off); g.add(win);
  }
  return g;
}

function forgePlant(P,rnd){
  /* Nothing grows here. What stands in for planting is a charred stump or a
     scrap bollard — and the emptiness is the point: the forges are the one realm
     where the ground is worked, not tended. */
  const g=new THREE.Group();
  if(rnd()<0.5){
    const h=lerp(0.4,0.9,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.09,0.16,h,5),mat(P.wood,{rough:1}))
      .translateY(h/2));
    for(let i=0;i<2;i++){
      const a=rnd()*TAU, len=lerp(0.3,0.6,rnd());
      const br=meshOf(new THREE.CylinderGeometry(0.03,0.05,len,4),mat(P.wood,{rough:1}));
      br.position.set(Math.cos(a)*len*0.3,h*0.85,Math.sin(a)*len*0.3);
      br.rotation.set(Math.sin(a)*1.1,0,-Math.cos(a)*1.1); g.add(br);
    }
  }else{
    const h=lerp(0.3,0.55,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.14,0.17,h,8),
      mat(P.metal,{metal:0.45,rough:0.55})).translateY(h/2));
    const cap=meshOf(new THREE.SphereGeometry(0.15,8,5,0,TAU,0,Math.PI/2),
      mat(P.iron,{metal:0.5,rough:0.5}));
    cap.position.y=h; g.add(cap);
  }
  return g;
}

function forgeFeature(P,rnd){
  /* Ore and coal heaps, and the occasional glowing ingot rack. */
  const g=new THREE.Group();
  if(rnd()<0.62){
    const n=4+Math.floor(rnd()*5);
    for(let i=0;i<n;i++){
      const s=lerp(0.1,0.24,rnd());
      const c=meshOf(new THREE.DodecahedronGeometry(s,0),
        mat(rnd()<0.75?0x2A2530:P.brick2,{rough:1}));
      const a=rnd()*TAU, rr=rnd()*0.34;
      c.position.set(Math.cos(a)*rr,s*0.8,Math.sin(a)*rr);
      c.rotation.set(rnd()*3,rnd()*3,rnd()*3); g.add(c);
    }
  }else{
    const rack=meshOf(new THREE.BoxGeometry(0.7,0.16,0.42),
      mat(P.iron,{metal:0.4,rough:0.6}));
    rack.position.y=0.08; g.add(rack);
    for(let i=0;i<3;i++){
      const ing=meshOf(new THREE.BoxGeometry(0.5,0.09,0.1),
        mat(mixTok(P.lava,0x2A1418,0.4),{emissive:P.lava,ei:0.9,rough:0.5}),false,false);
      ing.position.set(0,0.2+i*0.1,lerp(-0.13,0.13,i/2)); g.add(ing);
    }
    const ph=rnd()*TAU;
    g.userData.tick=t=>{
      g.children.forEach(c=>{ if(c.material.emissive)
        c.material.emissiveIntensity=0.75+Math.sin(t*0.9+ph)*0.3; });
    };
    animated.push(g);
  }
  return g;
}

function forgeGarden(P,rnd){
  /* Crates, drums and pipe stacks. The forges' equivalent of a hedge: the thing
     that fills the ground between buildings and says the place is WORKED. */
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.4){
    for(let i=0;i<2+Math.floor(rnd()*3);i++){
      const s=lerp(0.22,0.34,rnd());
      const b=meshOf(new THREE.BoxGeometry(s,s*0.9,s),mat(P.wood,{rough:0.98}));
      b.position.set((rnd()-0.5)*0.4,s*0.45+i*s*0.9*(rnd()<0.4?1:0),(rnd()-0.5)*0.4);
      b.rotation.y=rnd()*0.6; g.add(b);
    }
  }else if(style<0.75){
    for(let i=0;i<2+Math.floor(rnd()*2);i++){
      const r=lerp(0.14,0.2,rnd()), h=lerp(0.3,0.44,rnd());
      const d=meshOf(new THREE.CylinderGeometry(r,r,h,9),
        mat(rnd()<0.5?P.iron:P.brick2,{metal:0.3,rough:0.7}));
      d.position.set((rnd()-0.5)*0.4,h/2,(rnd()-0.5)*0.4); g.add(d);
      const rim=meshOf(new THREE.TorusGeometry(r,0.02,4,10),
        mat(P.metal,{metal:0.6,rough:0.4}),false,false);
      rim.rotation.x=Math.PI/2; rim.position.set(d.position.x,h*0.72,d.position.z); g.add(rim);
    }
  }else{
    const n=3+Math.floor(rnd()*3);
    for(let i=0;i<n;i++){
      const len=lerp(0.6,1.0,rnd());
      const p=meshOf(new THREE.CylinderGeometry(0.08,0.08,len,7),
        mat(P.metal,{metal:0.5,rough:0.5}));
      p.rotation.z=Math.PI/2; p.rotation.y=rnd()*0.5;
      p.position.set((rnd()-0.5)*0.2,0.08+Math.floor(i/2)*0.17,(i%2)*0.17-0.08);
      g.add(p);
    }
  }
  return g;
}

/* The forges' landform: a vent with cracks running out of it, and — once the
   district has terraces — a lava fall down each of them. Cut on fixed bearings
   from index alone, so growth extends the cracks it already has and opens new
   ones outward, and none of them ever moves. */
function forgeVeins(P,prof,R,sp){
  const g=new THREE.Group();
  /* The crust is DARK and the emissive is what glows. Setting colour AND
     emissive to molten orange gives you cream, because an emissive that bright
     pushes every channel past one and ACES hands back near-white — which reads
     as spilled plaster. Molten rock is a dark surface with light coming out. */
  const m=new THREE.MeshStandardMaterial({color:mixTok(P.lava,0x18101C,0.55),
    emissive:P.lava,emissiveIntensity:0.85,roughness:0.55});

  /* One vent, at a fixed bearing, and the cracks run OUT OF IT. Seven veins all
     starting at the centre is a sunburst — a pattern nothing geological makes. */
  const va=P.seed*0.77+1.3, vr=0.95, vrr=radiusAt(prof,va);
  const vx=Math.cos(va)*vr*vrr, vz=Math.sin(va)*vr*vrr, vy=tierY(vr)+0.175;
  g.userData.claims=[{x:vx,z:vz,d:(sp&&sp.pond?1.35:0.5)+0.6}];

  /* Segments OVERLAP rather than abut: laid end to end with a hair of gap they
     read as a dotted line of planks. */
  const crack=(x0,z0,a0,steps,w0)=>{
    let x=x0, z=z0, a=a0;
    for(let k=0;k<steps;k++){
      const len=lerp(0.55,0.95,((k*13+steps*7)%10)/10);
      a+=Math.sin(k*1.9+steps)*0.34;
      const w=Math.max(0.045,w0*(1-k/steps*0.65));
      const seg=meshOf(new THREE.BoxGeometry(len,0.03,w),m,false,false);
      const nx=x+Math.cos(a)*len*0.5, nz=z+Math.sin(a)*len*0.5;
      const rr=Math.hypot(nx,nz);
      if(rr>R-0.30)break;
      seg.position.set(nx,tierY(rr)+0.175,nz); seg.rotation.y=-a;
      g.add(seg);
      x+=Math.cos(a)*len*0.78; z+=Math.sin(a)*len*0.78;
    }
  };
  for(let i=0;i<4;i++) crack(vx,vz,i*1.57+P.seed*0.2,7,0.155);
  for(let i=0;i<3;i++){
    const a=i*2.39996+P.seed*0.61, r=1.9+i*0.9;
    if(r>R-0.6)break;
    const rr=radiusAt(prof,a);
    crack(Math.cos(a)*r*rr,Math.sin(a)*r*rr,a+1.1,3,0.10);
  }
  /* ---- the lake, and the river that leaves it ------------------------- */
  /* The shipyards got moving water and the forges got a glowing crust, which
     left the realm that OWNS liquid as the only one whose liquid did not move.
     This is the same idea as the harbour, in the other medium: a lake with a
     live surface, a river cut from it that steps down every terrace it crosses,
     and a fall at each lip. Fixed bearing and fixed radii like everything else,
     so the river a district cut at L5 is the same river at L12 — it only ever
     gets longer as the land reaches further. */
  const lake=sp&&sp.pond;
  const lr=lake?1.35:0.5;
  const surf=new THREE.MeshStandardMaterial({color:mixTok(P.lava,0x2A1410,0.22),
    emissive:P.lava,emissiveIntensity:1.15,roughness:0.38,flatShading:false});

  const disc=new THREE.CircleGeometry(lr,lake?20:12);
  disc.rotateX(-Math.PI/2);
  const pool=new THREE.Mesh(disc,surf);
  pool.position.set(vx,vy+0.04,vz); pool.receiveShadow=true;
  const pbase=disc.attributes.position.array.slice();
  pool.userData.tick=t=>{
    /* A live surface, exactly the trick the harbour water uses — the molten
       version just moves slower and heavier. */
    const p=pool.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=pbase[i*3], z=pbase[i*3+2];
      p.setY(i,Math.sin(t*0.7+x*1.4)*0.05+Math.sin(t*0.5+z*1.8)*0.04);
    }
    p.needsUpdate=true;
    surf.emissiveIntensity=1.15*(0.82+Math.sin(t*0.6)*0.18);
    m.emissiveIntensity=0.85*(0.74+Math.sin(t*0.7)*0.26);
  };
  g.add(pool); animated.push(pool);
  const lip=meshOf(new THREE.TorusGeometry(lr*1.06,0.12,4,lake?18:14),
    mat(P.cliff,{rough:1}),false,true);
  lip.rotation.x=Math.PI/2; lip.position.set(vx,vy,vz); g.add(lip);
  /* Crust islands floating on the melt — the black skin that forms on standing
     lava, and the thing that makes the pool read as molten rock rather than as
     orange paint. */
  if(lake){
    for(let i=0;i<5;i++){
      const a=i*2.399963229728653, rr=lr*lerp(0.25,0.78,((i*0.37)%1));
      const cr=meshOf(new THREE.DodecahedronGeometry(lerp(0.12,0.26,((i*0.61)%1)),0),
        mat(P.rock,{rough:1}),false,false);
      cr.position.set(vx+Math.cos(a)*rr,vy+0.07,vz+Math.sin(a)*rr);
      cr.scale.y=0.3; cr.rotation.y=a; g.add(cr);
    }
  }

  if(lake){
    /* The channel. Segments laid on the terrain so it steps down with it. */
    const r0=lr+0.35, r1=R-0.45;
    const step=0.5;
    for(let r=r0;r<r1;r+=step){
      const wr=radiusAt(prof,va)*r;
      const seg=meshOf(new THREE.BoxGeometry(step*1.25,0.07,0.62),surf,false,true);
      seg.position.set(Math.cos(va)*wr,tierY(r)+0.2,Math.sin(va)*wr);
      seg.rotation.y=-va; g.add(seg);
      /* Cooled banks either side, so the river is cut INTO something. */
      for(const s of [-1,1]){
        const bank=meshOf(new THREE.BoxGeometry(step*1.25,0.14,0.18),
          mat(P.rock,{rough:1}),false,true);
        bank.position.set(Math.cos(va)*wr-Math.sin(-va)*s*0.4,tierY(r)+0.21,
                          Math.sin(va)*wr-Math.cos(-va)*s*0.4);
        bank.rotation.y=-va; g.add(bank);
      }
    }
    /* Flow. Bright cells running outward down the channel — the one thing that
       says the lava is going somewhere. Own material each, because they fade. */
    for(let k=0;k<7;k++){
      const fm=new THREE.MeshStandardMaterial({color:P.lavaHot,emissive:P.lavaHot,
        emissiveIntensity:1.8,roughness:0.3,transparent:true,opacity:0.9});
      const cell=meshOf(new THREE.BoxGeometry(0.5,0.05,0.42),fm,false,false);
      cell.rotation.y=-va;
      cell.userData.tick=t=>{
        const u=(t*0.14+k/7)%1;
        const r=lerp(r0,r1,u), wr=radiusAt(prof,va)*r;
        cell.position.set(Math.cos(va)*wr,tierY(r)+0.24,Math.sin(va)*wr);
        fm.opacity=0.9*Math.min(1,Math.sin(u*Math.PI)*2.2);
      };
      g.add(cell); animated.push(cell);
    }
    /* A fall at every terrace lip the river crosses, and a plume off the coast
       once the district is big enough to have run out of land. */
    if(sp.falls){
      for(const b of TIER_R){
        if(b<r0||b>=R)continue;
        const bwr=radiusAt(prof,va)*b;
        const c=buildFalls(P,TIER_STEP+0.25);
        c.position.set(Math.cos(va)*bwr,tierY(b-1e-6)+0.18,Math.sin(va)*bwr);
        c.rotation.y=-va+Math.PI/2; g.add(c);
      }
      const rwr=radiusAt(prof,va)*R;
      const plume=buildFalls(P,R*0.5+3);
      plume.position.set(Math.cos(va)*rwr*0.99,tierY(R-1e-6)+0.1,
                         Math.sin(va)*rwr*0.99);
      plume.rotation.y=-va+Math.PI/2; g.add(plume);
    }
  }
  return g;
}

/* ============================================================ THE SHIPYARDS
   Reference: a grey crag under a poured concrete deck, rectangular basins of
   turquoise water cut into that deck and walled in painted quay, cream sheds
   with curved corrugated roofs and cyan stripes, lattice gantry cranes, a
   white-and-cyan banded lighthouse, stacked containers, barrels, coiled rope,
   bollards, gulls, and a bright noon sky.

   The realm's tell is that the WATER IS INSIDE THE ISLAND. Everywhere else the
   liquid is a pond or a moat; here the deck is cut open for it. */
function shipHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(1.0,1.5,rnd())*scale;
  const h=lerp(0.4,0.62,rnd())*scale;
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.hull,{rough:0.75})).translateY(h/2));
  const vault=meshOf(new THREE.CylinderGeometry(w/2,w/2,d,12,1,false,0,Math.PI),
    mat(P.hull,{rough:0.62,metal:0.1}));
  vault.rotation.z=Math.PI/2; vault.rotation.y=Math.PI/2; vault.position.y=h; g.add(vault);
  /* The cyan stripe. It is the single strongest realm signal in the reference —
     every shed, every hull, every tower has one. */
  const stripe=meshOf(new THREE.CylinderGeometry(w/2*1.012,w/2*1.012,d*0.3,12,1,false,0,Math.PI),
    mat(rnd()<0.6?P.stripe:P.stripe2,{rough:0.6,metal:0.1}),true,false);
  stripe.rotation.z=Math.PI/2; stripe.rotation.y=Math.PI/2;
  stripe.position.set(0,h,lerp(-d*0.25,d*0.25,rnd())); g.add(stripe);
  for(let i=0;i<6;i++){
    const z=lerp(-d/2,d/2,(i+0.5)/6);
    const rib=meshOf(new THREE.TorusGeometry(w/2*1.02,0.025,4,10,Math.PI),
      mat(P.metal,{metal:0.4,rough:0.5}),true,false);
    rib.position.set(0,h,z); g.add(rib);
  }
  /* A big roller door in stripe blue, and a couple of portholes. */
  const ds=rnd()<0.5?1:-1;
  const door=meshOf(new THREE.BoxGeometry(w*0.5,h*0.8+w*0.2,0.05),
    mat(P.stripe2,{rough:0.6}),false,false);
  door.position.set(0,(h*0.8+w*0.2)/2,ds*(d/2+0.02)); g.add(door);
  const wm=winMat(P,0.8);
  for(let i=0;i<2;i++){
    const s=rnd()<0.5?1:-1;
    const win=meshOf(new THREE.CylinderGeometry(0.09*scale,0.09*scale,0.05,10),wm,false,false);
    win.rotation.z=Math.PI/2; win.position.set(s*(w/2+0.01),h*0.6,(rnd()-0.5)*d*0.5);
    g.add(win);
    const fr=meshOf(new THREE.TorusGeometry(0.11*scale,0.025,4,10),
      mat(P.metal,{metal:0.5,rough:0.45}),false,false);
    fr.position.copy(win.position); fr.rotation.y=Math.PI/2; g.add(fr);
  }
  return g;
}

function shipTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* A gantry crane, not a spire. In this realm the tall things are machines, and
     the lattice is what reads at silhouette scale. */
  const legMat=mat(P.lattice,{rough:0.72});
  const legR=lerp(0.7,1.0,rnd());
  for(let i=0;i<4;i++){
    const a=i/4*TAU+Math.PI/4;
    g.add(beam(new THREE.Vector3(Math.cos(a)*legR*1.25,0,Math.sin(a)*legR*1.25),
               new THREE.Vector3(Math.cos(a)*legR*0.42,h*0.72,Math.sin(a)*legR*0.42),
               0.075,legMat));
  }
  /* Cross-bracing: the difference between a crane and four sticks. */
  for(let k=1;k<5;k++){
    const y=h*0.72*k/5, r=lerp(legR*1.25,legR*0.42,k/5);
    const ring=meshOf(new THREE.TorusGeometry(r,0.035,4,4),legMat,true,false);
    ring.rotation.x=Math.PI/2; ring.rotation.z=Math.PI/4; ring.position.y=y; g.add(ring);
  }
  const cab=meshOf(new THREE.BoxGeometry(0.7,0.5,0.7),mat(P.stripe,{rough:0.6}));
  cab.position.y=h*0.72+0.25; g.add(cab);
  const glass=meshOf(new THREE.BoxGeometry(0.55,0.24,0.05),winMat(P,0.8),false,false);
  glass.position.set(0,h*0.72+0.3,0.36); g.add(glass);
  /* The jib, out over the water, with a hook on a cable that actually moves. */
  const jibLen=lerp(2.2,3.4,rnd()), ja=rnd()*TAU;
  const jib=meshOf(new THREE.BoxGeometry(jibLen,0.16,0.24),legMat);
  jib.position.set(Math.cos(ja)*jibLen*0.34,h*0.72+0.62,Math.sin(ja)*jibLen*0.34);
  jib.rotation.y=-ja; g.add(jib);
  const tail=meshOf(new THREE.BoxGeometry(jibLen*0.4,0.14,0.2),legMat);
  tail.position.set(-Math.cos(ja)*jibLen*0.26,h*0.72+0.62,-Math.sin(ja)*jibLen*0.26);
  tail.rotation.y=-ja; g.add(tail);
  const stay=meshOf(new THREE.CylinderGeometry(0.03,0.03,jibLen*0.62,4),legMat,true,false);
  stay.position.set(Math.cos(ja)*jibLen*0.3,h*0.72+0.95,Math.sin(ja)*jibLen*0.3);
  stay.rotation.set(0,-ja,Math.PI/2-0.35); g.add(stay);
  const hookX=Math.cos(ja)*jibLen*0.62, hookZ=Math.sin(ja)*jibLen*0.62;
  const cable=meshOf(new THREE.CylinderGeometry(0.02,0.02,1,4),
    mat(P.metal,{metal:0.5,rough:0.5}),false,false);
  const hook=meshOf(new THREE.BoxGeometry(0.22,0.26,0.22),mat(P.rust,{rough:0.85}));
  const topY=h*0.72+0.54;
  cable.userData.tick=t=>{
    const drop=1.4+Math.sin(t*0.5)*1.1;
    cable.scale.y=drop; cable.position.set(hookX,topY-drop/2,hookZ);
    hook.position.set(hookX,topY-drop,hookZ);
  };
  g.add(cable,hook); animated.push(cable);
  /* A beacon on the cab, because a crane at this height is an obstruction. */
  const bl=meshOf(new THREE.SphereGeometry(0.09,7,6),glowMat(P.accent,1.8),false,false);
  bl.position.y=h*0.72+0.55;
  bl.userData.tick=t=>{bl.material.emissiveIntensity=1.0+Math.abs(Math.sin(t*1.6))*1.6;};
  g.add(bl); animated.push(bl);
  if(great) greatCrown(P,g,h*0.72+1.9,0.7);
  return g;
}

function shipHall(P,rnd){
  /* A SAWTOOTH assembly shop. The houses own the curved corrugated shed, and
     the hall was the same shed at three times the size — the one shape the
     shipyards repeated at two scales. A north-light roof is the other classic
     industrial section and it could not look less like a barrel vault: a run of
     hard asymmetric teeth, each with a glazed face, sitting on a squared-off
     box. It also gives the realm a straight roofline, which the whole island
     was missing. */
  const g=new THREE.Group();
  const w=lerp(2.4,3.0,rnd()), d=lerp(3.0,3.8,rnd()), h=lerp(0.9,1.2,rnd());
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.hull,{rough:0.72})).translateY(h/2));
  const teeth=Math.max(3,Math.round(d/0.95));
  const tw=d/teeth;
  for(let i=0;i<teeth;i++){
    const z=-d/2+tw*(i+0.5);
    /* The solid rake: a thin slab leaned over, tall edge to the north. */
    const rake=meshOf(new THREE.BoxGeometry(w,0.1,tw*1.16),
      mat(P.hull,{rough:0.65,metal:0.1}));
    rake.position.set(0,h+0.34,z+tw*0.1); rake.rotation.x=0.62; g.add(rake);
    /* The glazed face, near-vertical, catching the sky. */
    const glass=meshOf(new THREE.BoxGeometry(w*0.94,0.62,0.05),
      mat(0xCFEAF5,{opacity:0.6,rough:0.08,metal:0.25,flat:false,
        emissive:0xCFEAF5,ei:0.24}),false,false);
    glass.position.set(0,h+0.34,z-tw*0.34); glass.rotation.x=0.16; g.add(glass);
    for(let k=0;k<3;k++){
      const mul=meshOf(new THREE.BoxGeometry(0.05,0.62,0.06),
        mat(P.metal,{metal:0.5,rough:0.45}),false,false);
      mul.position.set(lerp(-w*0.3,w*0.3,k/2),h+0.34,z-tw*0.34-0.01);
      mul.rotation.x=0.16; g.add(mul);
    }
    /* The gutter between teeth. */
    const gut=meshOf(new THREE.BoxGeometry(w,0.09,0.14),mat(P.stripe2,{rough:0.6}));
    gut.position.set(0,h+0.04,z-tw*0.5); g.add(gut);
  }
  /* Eaves band and the big sliding doors, in the realm's cyan. */
  const band=meshOf(new THREE.BoxGeometry(w*1.02,0.18,d*1.02),mat(P.stripe,{rough:0.6}));
  band.position.y=h*0.78; g.add(band);
  const door=meshOf(new THREE.BoxGeometry(w*0.66,h*0.86,0.06),
    mat(P.stripe2,{rough:0.6}),false,false);
  door.position.set(0,h*0.43,d/2+0.02); g.add(door);
  for(let i=0;i<4;i++){
    const seam=meshOf(new THREE.BoxGeometry(0.05,h*0.86,0.05),
      mat(P.hull,{rough:0.7}),false,false);
    seam.position.set(lerp(-w*0.3,w*0.3,i/3),h*0.43,d/2+0.05); g.add(seam);
  }
  const wm=winMat(P,0.8);
  for(let i=0;i<4;i++){
    const s=i<2?1:-1;
    const win=meshOf(new THREE.BoxGeometry(0.05,0.26,0.5),wm,false,false);
    win.position.set(s*(w/2+0.02),h*0.5,lerp(-d*0.28,d*0.28,(i%2))); g.add(win);
  }
  /* A roof vent stack, so the shop reads as working. */
  const v=meshOf(new THREE.CylinderGeometry(0.12,0.14,0.5,8),
    mat(P.metal,{metal:0.45,rough:0.5}));
  v.position.set(w*0.3,h+0.95,-d*0.3); g.add(v);
  return g;
}

function shipPlant(P,rnd){
  /* A bollard with rope on it, or a scruff of dock grass. Nothing is planted in
     a working yard; things are TIED UP in it. */
  const g=new THREE.Group();
  if(rnd()<0.6){
    const h=lerp(0.28,0.42,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.11,0.14,h,9),
      mat(P.metal,{metal:0.35,rough:0.6})).translateY(h/2));
    const cap=meshOf(new THREE.SphereGeometry(0.13,9,6,0,TAU,0,Math.PI/2),
      mat(P.metal,{metal:0.4,rough:0.55}));
    cap.position.y=h; g.add(cap);
    for(let i=0;i<3;i++){
      const rope=meshOf(new THREE.TorusGeometry(0.15+i*0.012,0.028,4,12),
        mat(P.rust,{rough:0.95}),true,false);
      rope.rotation.x=Math.PI/2; rope.position.y=h*0.4+i*0.06; g.add(rope);
    }
  }else{
    for(let i=0;i<4;i++){
      const b=meshOf(new THREE.ConeGeometry(0.07,lerp(0.2,0.4,rnd()),4),
        mat(rnd()<0.5?P.grass:P.grass2,{rough:1}),false,false);
      b.position.set((rnd()-0.5)*0.4,0.14,(rnd()-0.5)*0.4);
      b.rotation.z=(rnd()-0.5)*0.4; g.add(b);
    }
  }
  return g;
}

function shipFeature(P,rnd){
  /* Containers, crates and barrels. The reference stacks them in reds, blues and
     teals, and that scatter of saturated boxes is most of what makes the yard
     look busy rather than derelict. */
  const g=new THREE.Group();
  const CON=[0xC2453C,0x2E6FA8,0x2FA0A8,0xC9A02E,0x8C8C87];
  const style=rnd();
  if(style<0.45){
    const n=1+Math.floor(rnd()*3);
    for(let i=0;i<n;i++){
      const w=lerp(0.7,1.0,rnd()), h=0.34, d=lerp(0.34,0.42,rnd());
      const c=meshOf(new THREE.BoxGeometry(w,h,d),
        mat(CON[Math.floor(rnd()*CON.length)],{rough:0.78}));
      c.position.set((rnd()-0.5)*0.22,h/2+i*h,(rnd()-0.5)*0.22);
      c.rotation.y=(rnd()-0.5)*0.4; g.add(c);
      /* Corrugation, as three ribs on the long face. */
      for(let k=0;k<3;k++){
        const rb=meshOf(new THREE.BoxGeometry(0.03,h*0.9,d*1.01),
          mat(0x000000,{rough:1,opacity:0.16}),false,false);
        rb.position.set(c.position.x+lerp(-w*0.3,w*0.3,k/2),c.position.y,c.position.z);
        rb.rotation.y=c.rotation.y; g.add(rb);
      }
    }
  }else if(style<0.78){
    for(let i=0;i<2+Math.floor(rnd()*3);i++){
      const r=lerp(0.13,0.18,rnd()), h=lerp(0.3,0.42,rnd());
      const b=meshOf(new THREE.CylinderGeometry(r,r,h,10),
        mat(rnd()<0.5?P.wood:P.stripe,{rough:0.8}));
      b.position.set((rnd()-0.5)*0.44,h/2,(rnd()-0.5)*0.44); g.add(b);
      for(let k=0;k<2;k++){
        const hp=meshOf(new THREE.TorusGeometry(r*1.02,0.018,4,12),
          mat(P.metal,{metal:0.55,rough:0.45}),false,false);
        hp.rotation.x=Math.PI/2;
        hp.position.set(b.position.x,h*(0.3+k*0.42),b.position.z); g.add(hp);
      }
    }
  }else{
    /* Coiled rope — flat, and unmistakably a dock. */
    for(let i=0;i<3;i++){
      const cr=meshOf(new THREE.TorusGeometry(0.16+i*0.07,0.045,5,16),
        mat(P.rust,{rough:0.95}));
      cr.rotation.x=Math.PI/2; cr.position.y=0.05; g.add(cr);
    }
  }
  return g;
}

function shipGarden(P,rnd){
  const g=new THREE.Group();
  if(rnd()<0.5){
    for(let i=0;i<3;i++){
      const pl=meshOf(new THREE.BoxGeometry(0.62,0.08,0.5),mat(P.wood,{rough:0.95}));
      pl.position.set((rnd()-0.5)*0.1,0.04+i*0.09,(rnd()-0.5)*0.1);
      pl.rotation.y=(rnd()-0.5)*0.3; g.add(pl);
    }
  }else{
    const pot=meshOf(new THREE.CylinderGeometry(0.22,0.18,0.24,8),
      mat(P.stripe2,{rough:0.7}));
    pot.position.y=0.12; g.add(pot);
    for(let i=0;i<3;i++){
      const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.12,0.2,rnd()),0),
        mat(rnd()<0.5?P.grass:P.grass2,{rough:0.98}));
      b.position.set((rnd()-0.5)*0.2,0.3,(rnd()-0.5)*0.2); g.add(b);
    }
  }
  return g;
}

/* The shipyards' landform, and the biggest of the six: open water outside the
   coast, a painted quay wall where the land meets it, and BASINS cut into the
   deck itself at fixed radii. */
/* NO SEA OF ITS OWN. The bench drew a moat round every harbour island, which is
   right for one island on a bench and wrong twice over here: a district stands
   on the realm's ground and that ground is ALREADY flooded (buildLand), and the
   realm island gets its own annulus in buildIsland. Drawing a third one put a
   ring of water inside the water, once per district. What the harbour builds is
   what the water meets — the quay wall — and the basins cut into the deck. */
function shipHarbour(P,prof,R){
  const g=new THREE.Group();
  /* Quay wall, painted at the top in the realm's cyan. Land has to meet water in
     SOMETHING, or the island looks like it was dropped in a puddle. */
  const top=tierY(R-1e-6), hgt=top-(SEA_Y-0.6);
  const n=Math.round(R*3.2);
  for(let i=0;i<n;i++){
    const a=i/n*TAU, rr=radiusAt(prof,a)*R;
    const seg=rr*TAU/n*1.2;
    const w=meshOf(new THREE.BoxGeometry(0.34,hgt,seg),mat(P.stone2,{rough:0.92}));
    w.position.set(Math.cos(a)*rr,top-hgt/2,Math.sin(a)*rr); w.rotation.y=-a; g.add(w);
    const cap=meshOf(new THREE.BoxGeometry(0.4,0.13,seg),mat(P.stripe,{rough:0.7}));
    cap.position.set(Math.cos(a)*rr,top-0.06,Math.sin(a)*rr); cap.rotation.y=-a; g.add(cap);
    if(i%4===0){
      const f=meshOf(new THREE.CylinderGeometry(0.12,0.12,0.5,8),mat(P.wood,{rough:0.95}));
      f.position.set(Math.cos(a)*(rr+0.16),SEA_Y+0.55,Math.sin(a)*(rr+0.16));
      f.rotation.z=Math.PI/2; f.rotation.y=-a; g.add(f);
    }
  }
  /* Basins cut into the deck. Fixed bearings and fixed radii, so a basin opened
     at L5 is the same basin at L12 — the deck grows around it. */
  const rnd=rngOf(hash2(P.seed,6600));
  g.userData.claims=[];
  for(let i=0;i<3;i++){
    const a=i*2.399963229728653+P.seed*0.23, br=2.6+i*2.4;
    if(br>R-1.4)break;
    const wr=radiusAt(prof,a)*br;
    const x=Math.cos(a)*wr, z=Math.sin(a)*wr, y=tierY(br)+0.16;
    const bw=lerp(1.8,2.6,rnd()), bd=lerp(1.1,1.7,rnd());
    const basin=new THREE.Group();
    const water=meshOf(new THREE.BoxGeometry(bw,0.1,bd),
      mat(P.water,{opacity:0.9,rough:0.12,metal:0.12,flat:false,
        emissive:P.water,ei:0.16}),false,true);
    water.position.y=-0.16; basin.add(water);
    /* The painted coping around it — this is the detail that makes the reference
       image's basins read as engineered rather than as spilled paint. */
    for(const [ox,oz,sw,sd] of [[0,bd/2+0.14,bw+0.56,0.28],[0,-bd/2-0.14,bw+0.56,0.28],
                                [bw/2+0.14,0,0.28,bd+0.02],[-bw/2-0.14,0,0.28,bd+0.02]]){
      const k=meshOf(new THREE.BoxGeometry(sw,0.24,sd),mat(P.stripe,{rough:0.7}));
      k.position.set(ox,-0.06,oz); basin.add(k);
    }
    basin.position.set(x,y,z); basin.rotation.y=-a;
    g.userData.claims.push({x,z,d:Math.max(bw,bd)/2+0.5});
    g.add(basin);
  }
  return g;
}

/* ============================================================== THE BASTION
   Reference: concentric crenellated ring-walls climbing to a domed keep, round
   drum towers with domed caps, deep snow lying on every ledge, icicles under the
   rim, snow-dusted conifers, small arrow-slits glowing cold blue, and a bright
   winter sky over distant peaks.

   The realm is legible from the LANDFORM alone: nothing else in the world is
   walled, and nothing else is white on top and grey underneath. */
function bastionHouse(P,rnd,scale=1){
  /* A rectangular blockhouse with a steep pitched roof, NOT a small drum tower.
     The bastion's towers are drums with domed caps, and when the houses were
     the same thing scaled down the whole fortress read as one turret repeated
     forty times. Barracks are built square, and a steep roof is what a place
     that gets this much snow actually needs — so the difference is functional
     rather than decorative. */
  const g=new THREE.Group();
  const w=lerp(0.85,1.25,rnd())*scale, d=lerp(0.7,1.0,rnd())*scale;
  const h=lerp(0.5,0.72,rnd())*scale;
  g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.stone,{rough:0.94}))
    .translateY(h/2));
  /* Quoined corners — lighter stone at the angles. Two draw calls that do more
     for "cut ashlar" than any amount of coursing on a curved wall could. */
  for(let k=0;k<4;k++){
    const a=k/4*TAU+Math.PI/4;
    const q=meshOf(new THREE.BoxGeometry(0.11*scale,h,0.11*scale),
      mat(P.stone2,{rough:0.94}),false,false);
    q.position.set(Math.cos(a)*w*0.5,h/2,Math.sin(a)*d*0.5); g.add(q);
  }
  /* Steep pitch, and the snow lying on it as its own shell just above. */
  const rise=lerp(0.5,0.72,rnd())*scale;
  const roof=meshOf(new THREE.CylinderGeometry(0.001,Math.max(w,d)*0.78,rise,4),
    mat(P.stone2,{rough:0.92}));
  roof.rotation.y=Math.PI/4; roof.position.y=h+rise/2; g.add(roof);
  const snow=meshOf(new THREE.CylinderGeometry(0.001,Math.max(w,d)*0.79,rise*0.62,4),
    mat(P.snow,{rough:1}));
  snow.rotation.y=Math.PI/4; snow.position.y=h+rise-rise*0.62/2+0.01; g.add(snow);
  /* A snow ledge on the eaves, where it actually piles up. */
  const eave=meshOf(new THREE.BoxGeometry(w*1.2,0.07*scale,d*1.2),
    mat(P.snow,{rough:1}),true,false);
  eave.position.y=h+0.02; g.add(eave);
  if(rnd()<0.5){
    const ch=meshOf(new THREE.BoxGeometry(0.16*scale,0.5*scale,0.16*scale),
      mat(P.stone2,{rough:0.94}));
    ch.position.set(w*0.28,h+rise*0.6,d*0.2); g.add(ch);
    const cs=meshOf(new THREE.BoxGeometry(0.19*scale,0.05*scale,0.19*scale),
      mat(P.snow,{rough:1}),false,false);
    cs.position.set(w*0.28,h+rise*0.6+0.26*scale,d*0.2); g.add(cs);
  }
  /* Arrow slits, glowing cold. Warm windows would make this a cottage. */
  const sm=mat(P.ward,{emissive:P.ward,ei:1.5,rough:0.4,flat:false});
  for(let i=0;i<2+Math.floor(rnd()*2);i++){
    const side=Math.floor(rnd()*4);
    const s=meshOf(new THREE.BoxGeometry(0.07*scale,0.22*scale,0.05),sm,false,false);
    const off=(rnd()-0.5)*0.4;
    if(side===0)s.position.set(off,h*0.55,d/2+0.01);
    else if(side===1){s.position.set(off,h*0.55,-d/2-0.01);s.rotation.y=Math.PI;}
    else if(side===2){s.position.set(w/2+0.01,h*0.55,off);s.rotation.y=Math.PI/2;}
    else {s.position.set(-w/2-0.01,h*0.55,off);s.rotation.y=-Math.PI/2;}
    g.add(s);
  }
  return g;
}

function bastionTower(P,rnd,h,great){
  const g=new THREE.Group();
  const segs=2+Math.floor(rnd()*2);
  const tp=taper();
  let y=0, r=lerp(0.55,0.78,rnd());
  for(let i=0;i<segs;i++){
    const sh=h/segs*lerp(0.9,1.1,rnd()), rt=r*lerp(0.86,0.94,rnd());
    tp.add(y,y+sh,r,rt);
    g.add(meshOf(new THREE.CylinderGeometry(rt,r,sh,10),
      mat(i%2?P.stone:P.stone2,{rough:0.94})).translateY(y+sh/2));
    /* A machicolated corbel course between drums — the flare is what makes a
       cylinder read as a defensive tower rather than as a silo. */
    const cor=meshOf(new THREE.CylinderGeometry(rt*1.2,rt*1.02,0.2,10),
      mat(P.stone2,{rough:0.94}));
    cor.position.y=y+sh; g.add(cor);
    y+=sh; r=rt;
  }
  /* Crenellations, then the dome cap, then snow on both. */
  const merlons=10;
  for(let i=0;i<merlons;i++){
    const a=i/merlons*TAU;
    const m=meshOf(new THREE.BoxGeometry(0.2,0.3,0.16),mat(P.stone,{rough:0.94}));
    m.position.set(Math.cos(a)*r*1.16,y+0.25,Math.sin(a)*r*1.16); m.rotation.y=-a; g.add(m);
    const sn=meshOf(new THREE.BoxGeometry(0.21,0.06,0.17),mat(P.snow,{rough:1}),false,false);
    sn.position.set(Math.cos(a)*r*1.16,y+0.42,Math.sin(a)*r*1.16); sn.rotation.y=-a; g.add(sn);
  }
  const dome=meshOf(new THREE.SphereGeometry(r*1.0,12,8,0,TAU,0,Math.PI/2),
    mat(P.stone2,{rough:0.9}));
  dome.position.y=y+0.35; dome.scale.y=0.85; g.add(dome);
  const cap=meshOf(new THREE.SphereGeometry(r*1.01,12,8,0,TAU,0,Math.PI*0.34),
    mat(P.snow,{rough:1}));
  cap.position.y=y+0.36; cap.scale.y=0.9; g.add(cap);
  /* The ward-light on top: this realm's answer to a beacon, in cold blue. */
  const orb=meshOf(new THREE.OctahedronGeometry(0.19),glowMat(P.ward,2.0),false,false);
  orb.position.y=y+0.35+r*0.9+0.28;
  orb.userData.tick=t=>{orb.rotation.y=t*0.5;
    orb.material.emissiveIntensity=1.7+Math.sin(t*1.3)*0.5;};
  g.add(orb); animated.push(orb);
  const sm=mat(P.ward,{emissive:P.ward,ei:1.4,rough:0.4,flat:false});
  for(let i=0;i<5;i++){
    const a=rnd()*TAU, wy=lerp(0.6,h-0.5,i/5+rnd()*0.1);
    const rr=tp.at(wy);
    const s=meshOf(new THREE.BoxGeometry(0.08,0.28,0.05),sm,false,false);
    s.position.set(Math.cos(a)*(rr+0.02),wy,Math.sin(a)*(rr+0.02));
    s.rotation.y=-a; g.add(s);
  }
  if(great) greatCrown(P,g,y+r+1.6,r);
  return g;
}

function bastionHall(P,rnd){
  /* The keep. A square block with corner turrets and a dome — the thing at the
     top of the hill in the reference, and the only building in the realm that
     gets a proper gate. */
  const g=new THREE.Group();
  const w=lerp(1.8,2.4,rnd()), h=lerp(1.0,1.4,rnd());
  g.add(meshOf(new THREE.BoxGeometry(w,h,w),mat(P.stone,{rough:0.94})).translateY(h/2));
  const cor=meshOf(new THREE.BoxGeometry(w*1.12,0.18,w*1.12),mat(P.stone2,{rough:0.94}));
  cor.position.y=h; g.add(cor);
  for(let i=0;i<4;i++){
    const a=i/4*TAU+Math.PI/4, tr=0.26;
    const t=meshOf(new THREE.CylinderGeometry(tr,tr*1.1,h*1.15,8),mat(P.stone2,{rough:0.94}));
    t.position.set(Math.cos(a)*w*0.62,h*0.575,Math.sin(a)*w*0.62); g.add(t);
    const tc=meshOf(new THREE.SphereGeometry(tr*1.15,9,6,0,TAU,0,Math.PI/2),
      mat(P.snow,{rough:1}));
    tc.position.set(Math.cos(a)*w*0.62,h*1.15,Math.sin(a)*w*0.62); tc.scale.y=0.8; g.add(tc);
  }
  const dome=meshOf(new THREE.SphereGeometry(w*0.44,14,9,0,TAU,0,Math.PI/2),
    mat(P.stone2,{rough:0.9}));
  dome.position.y=h+0.09; dome.scale.y=0.9; g.add(dome);
  const snow=meshOf(new THREE.SphereGeometry(w*0.445,14,9,0,TAU,0,Math.PI*0.33),
    mat(P.snow,{rough:1}));
  snow.position.y=h+0.1; snow.scale.y=0.95; g.add(snow);
  /* The gate: an arch with a cold blue door and a brazier either side. */
  const arch=meshOf(new THREE.CylinderGeometry(w*0.2,w*0.2,0.12,10,1,false,0,Math.PI),
    mat(P.ward,{emissive:P.ward,ei:1.1,rough:0.4,flat:false}),false,false);
  arch.rotation.z=Math.PI/2; arch.rotation.y=Math.PI/2;
  arch.position.set(0,h*0.3,w/2+0.02); g.add(arch);
  const jamb=meshOf(new THREE.TorusGeometry(w*0.22,0.08,5,12,Math.PI),
    mat(P.stone2,{rough:0.92}));
  jamb.position.set(0,h*0.3,w/2+0.04); g.add(jamb);
  for(const s of [-1,1]){
    const br=meshOf(new THREE.CylinderGeometry(0.12,0.08,0.16,7),
      mat(P.metal,{metal:0.4,rough:0.6}));
    br.position.set(s*w*0.32,0.4,w/2+0.14); g.add(br);
    const f=meshOf(new THREE.ConeGeometry(0.1,0.26,6),glowMat(P.warm,2.0),false,false);
    f.position.set(s*w*0.32,0.58,w/2+0.14);
    f.userData.tick=t=>{f.scale.set(1,1+Math.sin(t*6+s)*0.16,1);};
    g.add(f); animated.push(f);
  }
  return g;
}

function bastionPlant(P,rnd){
  /* Snow-laden conifers. Three stacked cones with a white cap on each — the
     cheapest possible spruce, and exactly what the reference is drawing. */
  const g=new THREE.Group();
  const h=lerp(0.9,1.8,rnd());
  g.add(meshOf(new THREE.CylinderGeometry(0.06,0.09,h*0.3,5),mat(P.wood,{rough:1}))
    .translateY(h*0.15));
  for(let i=0;i<3;i++){
    const u=i/3, r=lerp(0.42,0.18,u), ch=h*lerp(0.4,0.3,u);
    const c=meshOf(new THREE.ConeGeometry(r,ch,7),
      mat(rnd()<0.5?P.pine:P.pine2,{rough:0.98}));
    c.position.y=h*(0.28+u*0.32)+ch*0.3; g.add(c);
    const s=meshOf(new THREE.ConeGeometry(r*0.86,ch*0.5,7),mat(P.snow,{rough:1}),true,false);
    s.position.y=h*(0.28+u*0.32)+ch*0.55; g.add(s);
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*0.7+sway)*0.02;};
  animated.push(g);
  return g;
}

function bastionFeature(P,rnd){
  /* Ward-stones and snow drifts. The blue gems set into the walls in the
     reference are the realm's only saturated colour, so they get their own prop
     rather than being left to the lamps. */
  const g=new THREE.Group();
  if(rnd()<0.55){
    const h=lerp(0.3,0.5,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.19,0.24,h,6),mat(P.stone,{rough:0.94}))
      .translateY(h/2));
    const gem=meshOf(new THREE.OctahedronGeometry(0.15),
      mat(P.ward,{emissive:P.ward,ei:1.4,rough:0.2,flat:true,opacity:0.92}),false,false);
    gem.scale.y=1.5; gem.position.y=h+0.2;
    const ph=rnd()*TAU;
    gem.userData.tick=t=>{gem.rotation.y=t*0.4;
      gem.material.emissiveIntensity=1.2+Math.sin(t*1.2+ph)*0.4;};
    g.add(gem); animated.push(gem);
  }else{
    for(let i=0;i<3+Math.floor(rnd()*3);i++){
      const s=lerp(0.2,0.44,rnd());
      const d=meshOf(new THREE.IcosahedronGeometry(s,0),
        mat(rnd()<0.7?P.snow:P.rock,{rough:1}));
      d.position.set((rnd()-0.5)*0.7,s*0.35,(rnd()-0.5)*0.7);
      d.scale.y=0.45; d.rotation.y=rnd()*TAU; g.add(d);
    }
  }
  return g;
}

function bastionGarden(P,rnd){
  const g=new THREE.Group();
  if(rnd()<0.5){
    /* A muster rack: spears and shields against a low wall. */
    const wall=meshOf(new THREE.BoxGeometry(0.9,0.32,0.2),mat(P.stone2,{rough:0.94}));
    wall.position.y=0.16; wall.rotation.y=rnd()*TAU; g.add(wall);
    const sn=meshOf(new THREE.BoxGeometry(0.92,0.07,0.22),mat(P.snow,{rough:1}),false,false);
    sn.position.y=0.34; sn.rotation.y=wall.rotation.y; g.add(sn);
    for(let i=0;i<3;i++){
      const sp=meshOf(new THREE.CylinderGeometry(0.02,0.02,0.8,4),mat(P.wood,{rough:1}));
      sp.position.set(lerp(-0.3,0.3,i/2),0.4,0.08);
      sp.rotation.set(0.18,wall.rotation.y,0.1); g.add(sp);
    }
  }else{
    for(let i=0;i<3;i++){
      const s=lerp(0.16,0.3,rnd());
      const b=meshOf(new THREE.BoxGeometry(s,s,s),mat(P.wood,{rough:0.96}));
      b.position.set((rnd()-0.5)*0.4,s/2,(rnd()-0.5)*0.4); b.rotation.y=rnd(); g.add(b);
      const sn=meshOf(new THREE.BoxGeometry(s*1.02,0.05,s*1.02),mat(P.snow,{rough:1}),false,false);
      sn.position.set(b.position.x,s+0.02,b.position.z); sn.rotation.y=b.rotation.y; g.add(sn);
    }
  }
  return g;
}

/* The bastion's landform: a battlemented wall on every terrace edge the island
   has reached, plus the coast itself. Fixed radii, so a wall built at L6 is the
   same wall at L12 — the district is walled to the water's edge from the moment
   it has an edge, which is why this realm reads at three articles. */
function buildRampart(P,prof,edgeR,y,seedn){
  const g=new THREE.Group();
  const rnd=rngOf(seedn);
  const n=Math.max(12,Math.round(edgeR*4.4));
  const gate=rnd()*TAU;
  for(let i=0;i<n;i++){
    const a=i/n*TAU, rr=radiusAt(prof,a)*edgeR;
    const d=Math.abs(((a-gate+Math.PI)%TAU+TAU)%TAU-Math.PI);
    if(d<0.22)continue;                      // leave a gap for the gate
    const seg=rr*TAU/n*1.2;
    const w=meshOf(new THREE.BoxGeometry(0.3,1.0,seg),
      mat(i%2?P.stone2:P.stone,{rough:0.94}));
    w.position.set(Math.cos(a)*rr,y+0.5,Math.sin(a)*rr); w.rotation.y=-a; g.add(w);
    if(i%2===0){
      const m=meshOf(new THREE.BoxGeometry(0.3,0.3,seg*0.5),mat(P.stone,{rough:0.94}));
      m.position.set(Math.cos(a)*rr,y+1.15,Math.sin(a)*rr); m.rotation.y=-a; g.add(m);
      const sn=meshOf(new THREE.BoxGeometry(0.32,0.07,seg*0.52),mat(P.snow,{rough:1}),false,false);
      sn.position.set(Math.cos(a)*rr,y+1.32,Math.sin(a)*rr); sn.rotation.y=-a; g.add(sn);
    }else{
      const sn=meshOf(new THREE.BoxGeometry(0.32,0.06,seg),mat(P.snow,{rough:1}),false,false);
      sn.position.set(Math.cos(a)*rr,y+1.02,Math.sin(a)*rr); sn.rotation.y=-a; g.add(sn);
    }
    if(i%9===4){
      const l=meshOf(new THREE.OctahedronGeometry(0.1),glowMat(P.ward,1.4),false,false);
      l.position.set(Math.cos(a)*rr*0.94,y+1.2,Math.sin(a)*rr*0.94); g.add(l);
    }
  }
  /* The gatehouse: two drum towers either side of the gap. */
  for(const s of [-1,1]){
    const a=gate+s*0.3, rr=radiusAt(prof,a)*edgeR;
    const t=meshOf(new THREE.CylinderGeometry(0.34,0.4,1.9,9),mat(P.stone,{rough:0.94}));
    t.position.set(Math.cos(a)*rr,y+0.95,Math.sin(a)*rr); g.add(t);
    const c=meshOf(new THREE.SphereGeometry(0.42,10,7,0,TAU,0,Math.PI/2),
      mat(P.stone2,{rough:0.9}));
    c.position.set(Math.cos(a)*rr,y+1.9,Math.sin(a)*rr); c.scale.y=0.8; g.add(c);
    const sn=meshOf(new THREE.SphereGeometry(0.43,10,7,0,TAU,0,Math.PI*0.34),
      mat(P.snow,{rough:1}));
    sn.position.set(Math.cos(a)*rr,y+1.91,Math.sin(a)*rr); sn.scale.y=0.85; g.add(sn);
  }
  const ar=radiusAt(prof,gate)*edgeR;
  const arch=meshOf(new THREE.TorusGeometry(0.34,0.13,6,12,Math.PI),
    mat(P.stone2,{rough:0.94}));
  arch.position.set(Math.cos(gate)*ar,y+0.7,Math.sin(gate)*ar);
  arch.rotation.y=-gate+Math.PI/2; g.add(arch);
  const door=meshOf(new THREE.CylinderGeometry(0.3,0.3,0.08,9,1,false,0,Math.PI),
    mat(P.ward,{emissive:P.ward,ei:1.0,rough:0.4,flat:false}),false,false);
  door.rotation.z=Math.PI/2; door.rotation.y=-gate;
  door.position.set(Math.cos(gate)*ar,y+0.55,Math.sin(gate)*ar); g.add(door);
  return g;
}

/* ================================================== THE ARTISAN'S QUARTER
   Reference: tall narrow stucco tower-houses in honey and cream, capped with
   rose domes and cones, an arcaded rotunda over a small fountain, a striped
   market awning, terracotta pots and clipped topiary, a wrought-iron lamp with
   scrollwork, white doves, and a soft blue afternoon.

   Everything here is ROUNDED. There is not a hard corner in the reference image,
   and that softness is the whole difference between this realm and the bastion,
   which is built from the same grey geometry with sharp edges. */
function quarterHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  /* Tall and narrow, not wide and low. The quarter's density is vertical — a row
     of squat cottages would read as any other village.

     Plan alternates between a squared townhouse with softened corners and a
     round tower. Every house being a cylinder made the district a bundle of
     identical honey tubes, and it left the realm's own tower — also a cylinder —
     with nothing to be different from. The box gets rounded corners rather than
     sharp ones because nothing in this reference has a hard edge on it. */
  const r=lerp(0.34,0.52,rnd())*scale, h=lerp(1.1,2.0,rnd())*scale;
  const wall=rnd()<0.5?P.stucco:(rnd()<0.5?P.stucco2:P.stucco3);
  const boxy=rnd()<0.55;
  const body=boxy
    ? meshOf(new THREE.BoxGeometry(r*1.7,h,r*1.5),mat(wall,{rough:0.92,flat:false}))
    : meshOf(new THREE.CylinderGeometry(r*0.94,r,h,9),mat(wall,{rough:0.92,flat:false}));
  body.position.y=h/2;
  if(boxy) body.rotation.y=(rnd()-0.5)*0.5;
  g.add(body);
  if(boxy){
    /* Corner rounds: a slim column at each angle, same colour as the wall, so
       the block reads as moulded plaster rather than as a crate. */
    for(let k=0;k<4;k++){
      const a=k/4*TAU+Math.PI/4;
      const c=meshOf(new THREE.CylinderGeometry(r*0.28,r*0.3,h,7),
        mat(wall,{rough:0.92,flat:false}));
      const lx=Math.cos(a)*r*0.85, lz=Math.sin(a)*r*0.75;
      c.position.set(lx*Math.cos(body.rotation.y)+lz*Math.sin(body.rotation.y),h/2,
                     -lx*Math.sin(body.rotation.y)+lz*Math.cos(body.rotation.y));
      g.add(c);
    }
  }
  /* Roof: a rose dome or a rose cone, both in the reference, never a gable. */
  if(rnd()<0.55){
    const dm=meshOf(new THREE.SphereGeometry(r*1.06,11,7,0,TAU,0,Math.PI/2),
      mat(rnd()<0.6?P.rose:P.rose2,{rough:0.78,flat:false}));
    dm.position.y=h; dm.scale.y=lerp(0.8,1.2,rnd()); g.add(dm);
  }else{
    const cn=meshOf(new THREE.ConeGeometry(r*1.14,lerp(0.5,0.9,rnd())*scale,10),
      mat(rnd()<0.6?P.rose:P.blush,{rough:0.78}));
    cn.position.y=h+cn.geometry.parameters.height/2; g.add(cn);
  }
  const eave=meshOf(new THREE.CylinderGeometry(r*1.14,r*1.08,0.08,10),
    mat(P.stucco3,{rough:0.9}));
  eave.position.y=h; g.add(eave);
  /* Arched windows with rose surrounds, stacked up the tower. */
  const wm=winMat(P,0.85);
  const floors=Math.max(1,Math.round(h/0.62)-1);
  for(let f=0;f<floors;f++){
    const a=rnd()*TAU, wy=0.45*scale+f*0.62*scale;
    if(wy>h-0.25)break;
    const w=meshOf(new THREE.CylinderGeometry(0.09*scale,0.09*scale,0.05,8,1,false,0,Math.PI),
      wm,false,false);
    w.rotation.z=Math.PI/2; w.rotation.y=-a+Math.PI/2;
    w.position.set(Math.cos(a)*(r+0.01),wy+0.06*scale,Math.sin(a)*(r+0.01)); g.add(w);
    const bx=meshOf(new THREE.BoxGeometry(0.17*scale,0.17*scale,0.04),wm,false,false);
    bx.rotation.y=-a+Math.PI/2;
    bx.position.set(Math.cos(a)*(r+0.01),wy-0.02*scale,Math.sin(a)*(r+0.01)); g.add(bx);
    const fr=meshOf(new THREE.TorusGeometry(0.115*scale,0.022,4,10,Math.PI),
      mat(P.rose,{rough:0.8}),false,false);
    fr.rotation.y=-a+Math.PI/2;
    fr.position.set(Math.cos(a)*(r+0.02),wy+0.06*scale,Math.sin(a)*(r+0.02)); g.add(fr);
    /* A flower box under one of them. */
    if(rnd()<0.4){
      const fb=meshOf(new THREE.BoxGeometry(0.2*scale,0.07*scale,0.09),
        mat(P.wood,{rough:0.95}),false,false);
      fb.rotation.y=-a+Math.PI/2;
      fb.position.set(Math.cos(a)*(r+0.05),wy-0.13*scale,Math.sin(a)*(r+0.05)); g.add(fb);
      const fl=meshOf(new THREE.IcosahedronGeometry(0.07*scale,0),
        mat(P.leaf,{rough:0.98}),false,false);
      fl.position.set(Math.cos(a)*(r+0.05),wy-0.07*scale,Math.sin(a)*(r+0.05)); g.add(fl);
    }
  }
  /* A rose door at the foot. */
  const da=rnd()*TAU;
  const door=meshOf(new THREE.CylinderGeometry(0.12*scale,0.12*scale,0.05,8,1,false,0,Math.PI),
    mat(P.rose2,{rough:0.85}),false,false);
  door.rotation.z=Math.PI/2; door.rotation.y=-da+Math.PI/2;
  door.position.set(Math.cos(da)*(r+0.01),0.26*scale,Math.sin(da)*(r+0.01)); g.add(door);
  const db=meshOf(new THREE.BoxGeometry(0.2*scale,0.28*scale,0.04),
    mat(P.rose2,{rough:0.85}),false,false);
  db.rotation.y=-da+Math.PI/2;
  db.position.set(Math.cos(da)*(r+0.01),0.14*scale,Math.sin(da)*(r+0.01)); g.add(db);
  return g;
}

function quarterTower(P,rnd,h,great){
  const g=new THREE.Group();
  let y=0, r=lerp(0.5,0.68,rnd());
  const segs=2+Math.floor(rnd()*2);
  const tp=taper();
  for(let i=0;i<segs;i++){
    const sh=h/segs*lerp(0.9,1.1,rnd()), rt=r*lerp(0.86,0.94,rnd());
    tp.add(y,y+sh,r,rt);
    g.add(meshOf(new THREE.CylinderGeometry(rt,r,sh,10),
      mat(i%2?P.stucco:P.stucco3,{rough:0.92,flat:false})).translateY(y+sh/2));
    const cor=meshOf(new THREE.CylinderGeometry(rt*1.14,rt*1.02,0.11,10),
      mat(P.stucco2,{rough:0.9}));
    cor.position.y=y+sh; g.add(cor);
    y+=sh; r=rt;
  }
  /* An open belfry under the dome — the reference's towers are all pierced near
     the top, and the gap is what keeps a tall stucco cylinder from reading as a
     grain silo. */
  const bh=0.55;
  for(let i=0;i<6;i++){
    const a=i/6*TAU;
    const col=meshOf(new THREE.CylinderGeometry(0.07,0.07,bh,7),
      mat(P.stucco3,{rough:0.9}));
    col.position.set(Math.cos(a)*r*0.86,y+bh/2,Math.sin(a)*r*0.86); g.add(col);
  }
  const bell=meshOf(new THREE.SphereGeometry(0.17,9,6,0,TAU,0,Math.PI/2),
    mat(P.metal,{metal:0.6,rough:0.4}));
  bell.position.y=y+bh*0.75; bell.rotation.x=Math.PI; g.add(bell);
  const plate=meshOf(new THREE.CylinderGeometry(r*1.02,r*0.96,0.1,10),
    mat(P.stucco2,{rough:0.9}));
  plate.position.y=y+bh; g.add(plate);
  const dome=meshOf(new THREE.SphereGeometry(r*1.02,12,8,0,TAU,0,Math.PI/2),
    mat(P.rose,{rough:0.76,flat:false}));
  dome.position.y=y+bh+0.05; dome.scale.y=1.15; g.add(dome);
  /* A finial on a spindle, resting on the dome. The old floating octahedron was
     a crystal hovering over a stucco roof, which belongs to another realm. */
  const spindle=meshOf(new THREE.CylinderGeometry(0.03,0.045,0.3,6),
    mat(P.metal,{metal:0.6,rough:0.4}));
  spindle.position.y=y+bh+r*1.15+0.15; g.add(spindle);
  const fin=meshOf(new THREE.SphereGeometry(0.11,9,7),
    mat(P.metal,{metal:0.65,rough:0.35,env:1.0}));
  fin.position.y=y+bh+r*1.15+0.36; g.add(fin);
  const spike=meshOf(new THREE.ConeGeometry(0.045,0.16,6),
    mat(P.metal,{metal:0.65,rough:0.35}),false,false);
  spike.position.y=y+bh+r*1.15+0.5; g.add(spike);
  const wm=winMat(P,0.85);
  for(let i=0;i<4;i++){
    const a=rnd()*TAU, wy=lerp(0.7,y-0.5,i/4+rnd()*0.1);
    const rr=tp.at(wy);
    const w=meshOf(new THREE.BoxGeometry(0.16,0.26,0.05),wm,false,false);
    w.position.set(Math.cos(a)*(rr+0.02),wy,Math.sin(a)*(rr+0.02));
    w.rotation.y=-a; g.add(w);
  }
  if(great) greatCrown(P,g,y+bh+r*1.05,r);
  return g;
}

function quarterHall(P,rnd){
  /* The arcaded rotunda over the square — the pavilion at the centre of the
     reference image, arches all the way round and a low dome on top. */
  const g=new THREE.Group();
  const r=lerp(1.2,1.6,rnd()), h=lerp(0.9,1.2,rnd());
  g.add(meshOf(new THREE.CylinderGeometry(r*1.16,r*1.24,0.18,16),
    mat(P.stone2,{rough:0.94})).translateY(0.09));
  const n=8;
  for(let i=0;i<n;i++){
    const a=i/n*TAU;
    const col=meshOf(new THREE.CylinderGeometry(0.11,0.13,h,9),
      mat(P.stucco3,{rough:0.9}));
    col.position.set(Math.cos(a)*r,0.18+h/2,Math.sin(a)*r); g.add(col);
    /* The arch spanning to the next column. A torus half, rotated to stand on
       the two capitals, is a passable arcade at this scale. */
    const mid=(i+0.5)/n*TAU, span=TAU*r/n*0.5;
    const arc=meshOf(new THREE.TorusGeometry(span,0.075,5,10,Math.PI),
      mat(P.stucco,{rough:0.9}));
    arc.position.set(Math.cos(mid)*r,0.18+h,Math.sin(mid)*r);
    arc.rotation.y=-mid+Math.PI/2; g.add(arc);
  }
  const arch=meshOf(new THREE.CylinderGeometry(r*1.1,r*1.06,0.16,16),
    mat(P.stucco2,{rough:0.9}));
  arch.position.y=0.18+h+0.08; g.add(arch);
  const dome=meshOf(new THREE.SphereGeometry(r*1.02,16,10,0,TAU,0,Math.PI/2),
    mat(rnd()<0.6?P.rose:P.blush,{rough:0.76,flat:false}));
  dome.position.y=0.18+h+0.14; dome.scale.y=0.66; g.add(dome);
  /* Ribs on the dome, in cream. */
  for(let i=0;i<10;i++){
    const a=i/10*TAU;
    const rib=meshOf(new THREE.TorusGeometry(r*1.03,0.035,4,10,Math.PI/2),
      mat(P.stucco3,{rough:0.85}),true,false);
    rib.position.y=0.18+h+0.14; rib.rotation.y=-a; rib.scale.y=0.66; g.add(rib);
  }
  const fin=meshOf(new THREE.SphereGeometry(0.13,9,7),mat(P.metal,{metal:0.6,rough:0.4}));
  fin.position.y=0.18+h+0.14+r*0.68; g.add(fin);
  const glow=meshOf(new THREE.CylinderGeometry(r*0.7,r*0.7,0.06,16),
    glowMat(P.warm,0.6),false,false);
  glow.position.y=0.3; g.add(glow);
  return g;
}

function quarterPlant(P,rnd){
  /* Potted topiary. Not a tree in the ground — every green thing in that image
     is in a terracotta pot, and that is the realm's whole relationship with
     nature: cultivated, placed, swept around. */
  const g=new THREE.Group();
  const pr=lerp(0.16,0.26,rnd()), ph=lerp(0.2,0.32,rnd());
  const pot=meshOf(new THREE.CylinderGeometry(pr,pr*0.74,ph,10),
    mat(P.cliff,{rough:0.92,flat:false}));
  pot.position.y=ph/2; g.add(pot);
  const rim=meshOf(new THREE.TorusGeometry(pr,0.03,5,12),mat(P.cliff2,{rough:0.9}),false,false);
  rim.rotation.x=Math.PI/2; rim.position.y=ph; g.add(rim);
  const n=1+Math.floor(rnd()*2);
  for(let i=0;i<n;i++){
    const br=lerp(0.2,0.32,rnd())*(1-i*0.22);
    const b=meshOf(new THREE.IcosahedronGeometry(br,1),
      mat(rnd()<0.5?P.leaf:P.leaf2,{rough:0.96,flat:false}));
    b.position.y=ph+br*0.9+i*br*1.3; g.add(b);
  }
  if(rnd()<0.35){
    for(let i=0;i<3;i++){
      const f=meshOf(new THREE.IcosahedronGeometry(0.05,0),
        mat(P.blush,{emissive:P.blush,ei:0.2,rough:0.7}),false,false);
      f.position.set((rnd()-0.5)*0.3,ph+lerp(0.2,0.45,rnd()),(rnd()-0.5)*0.3); g.add(f);
    }
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*0.9+sway)*0.018;};
  animated.push(g);
  return g;
}

function quarterFeature(P,rnd){
  /* Market goods: amphorae, crates of produce, a bench. The clutter is what
     makes the square read as a place people use. */
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.45){
    for(let i=0;i<2+Math.floor(rnd()*3);i++){
      const h=lerp(0.24,0.44,rnd()), r=h*lerp(0.3,0.42,rnd());
      const j=meshOf(new THREE.SphereGeometry(r,9,7),
        mat(rnd()<0.5?P.cliff:P.rose2,{rough:0.9,flat:false}));
      j.position.set((rnd()-0.5)*0.5,r*0.95,(rnd()-0.5)*0.5); j.scale.y=1.35; g.add(j);
      const nk=meshOf(new THREE.CylinderGeometry(r*0.34,r*0.44,h*0.3,8),
        mat(P.cliff2,{rough:0.9}),false,false);
      nk.position.set(j.position.x,r*1.9,j.position.z); g.add(nk);
    }
  }else if(style<0.78){
    for(let i=0;i<2;i++){
      const s=lerp(0.24,0.34,rnd());
      const c=meshOf(new THREE.BoxGeometry(s*1.4,s*0.8,s),mat(P.wood,{rough:0.95}));
      c.position.set((rnd()-0.5)*0.3,s*0.4+i*s*0.8,(rnd()-0.5)*0.3);
      c.rotation.y=rnd()*0.5; g.add(c);
      for(let k=0;k<3;k++){
        const f=meshOf(new THREE.SphereGeometry(0.055,6,5),
          mat(k%2?P.rose:P.leaf,{rough:0.85}),false,false);
        f.position.set(c.position.x+(rnd()-0.5)*s,c.position.y+s*0.45,
                       c.position.z+(rnd()-0.5)*s*0.6); g.add(f);
      }
    }
  }else{
    const bench=meshOf(new THREE.BoxGeometry(0.8,0.07,0.26),mat(P.wood,{rough:0.94}));
    bench.position.y=0.3; bench.rotation.y=rnd()*TAU; g.add(bench);
    for(const s of [-1,1]){
      const lg=meshOf(new THREE.BoxGeometry(0.07,0.3,0.22),mat(P.metal,{metal:0.4,rough:0.6}));
      lg.position.set(Math.cos(bench.rotation.y)*s*0.3,0.15,-Math.sin(bench.rotation.y)*s*0.3);
      lg.rotation.y=bench.rotation.y; g.add(lg);
    }
  }
  return g;
}

/* The quarter's landform: the SQUARE. A swept paved circle at a fixed spot with
   a fountain in it — the thing everything else in that image faces. */
function quarterSquare(P,prof,R){
  const g=new THREE.Group();
  const rnd=rngOf(hash2(P.seed,7700));
  const a=P.seed*0.41+0.7, sr=Math.min(2.9,R-0.7);
  if(sr<1.1) return g;
  const wr=radiusAt(prof,a)*1.5;
  const x=Math.cos(a)*wr, z=Math.sin(a)*wr, y=tierY(1.5)+0.17;
  const pave=meshOf(new THREE.CylinderGeometry(sr,sr,0.07,26),
    mat(P.stone,{rough:0.95}),false,true);
  pave.position.set(x,y,z); g.add(pave);
  /* A square is somewhere people stand, so nothing else may be placed on it —
     see the note by `claims` in buildIsland. */
  g.userData.claims=[{x,z,d:sr+0.3}];
  const ring=meshOf(new THREE.TorusGeometry(sr*0.98,0.07,5,30),
    mat(P.stone2,{rough:0.94}),false,true);
  ring.rotation.x=Math.PI/2; ring.position.set(x,y+0.03,z); g.add(ring);
  /* The fountain: a basin, a stem, an upper dish, and a jet. */
  const basin=meshOf(new THREE.CylinderGeometry(0.62,0.68,0.26,14),
    mat(P.stone2,{rough:0.92}));
  basin.position.set(x,y+0.13,z); g.add(basin);
  const water=meshOf(new THREE.CylinderGeometry(0.54,0.54,0.06,14),
    mat(P.water,{opacity:0.88,rough:0.12,flat:false,emissive:P.water,ei:0.18}),false,true);
  water.position.set(x,y+0.25,z); g.add(water);
  const stem=meshOf(new THREE.CylinderGeometry(0.1,0.14,0.42,9),mat(P.stucco3,{rough:0.9}));
  stem.position.set(x,y+0.47,z); g.add(stem);
  const dish=meshOf(new THREE.CylinderGeometry(0.3,0.18,0.1,12),mat(P.stucco3,{rough:0.9}));
  dish.position.set(x,y+0.7,z); g.add(dish);
  for(let i=0;i<5;i++){
    const d=meshOf(new THREE.SphereGeometry(0.05,6,5),
      mat(P.water,{opacity:0.7,flat:false,emissive:P.water,ei:0.3}),false,false);
    const off=i/5;
    d.userData.tick=t=>{
      const u=(t*0.7+off)%1;
      const aa=off*TAU;
      d.position.set(x+Math.cos(aa)*(0.1+u*0.34),y+0.78-u*u*0.5,z+Math.sin(aa)*(0.1+u*0.34));
      d.material.opacity=0.7*(1-u*0.7);
    };
    g.add(d); animated.push(d);
  }
  /* Doves on the paving, and a couple of pots around the rim. */
  for(let i=0;i<4;i++){
    const aa=i/4*TAU+rnd();
    const p=quarterPlant(P,rnd);
    p.position.set(x+Math.cos(aa)*sr*0.78,y,z+Math.sin(aa)*sr*0.78); g.add(p);
  }
  return g;
}

/* ============================================== signatures, realm by realm
   The single most important builder in the file: this is what makes a visitor
   say "oh, that one's the data district" without reading a label. It unlocks at
   L3, because identity should arrive before size does.

   Three per realm rather than one per district: forty bespoke monuments is a
   maintenance liability and, at this scale, forty near-identical ones. Three
   sharply different silhouettes per realm, assigned by subject, separates the
   districts a reader actually holds side by side. */
function realmSignature(P,rnd,sp){
  const g=new THREE.Group();
  const S=P.sig;

  /* ---------------------------------------------------------- arcane swarm */
  if(P.kit==='swarm'){
    if(S==='obelisk'){
      g.add(meshOf(new THREE.CylinderGeometry(1.3,1.55,0.24,12),mat(P.stone2,{rough:0.9})));
      g.add(meshOf(new THREE.CylinderGeometry(1.0,1.2,0.22,12),mat(P.stone,{rough:0.88}))
        .translateY(0.23));
      const h=4.6;
      const ob=meshOf(new THREE.CylinderGeometry(0.14,0.42,h,4),mat(P.stone,{rough:0.7}));
      ob.position.y=0.34+h/2; ob.rotation.y=Math.PI/4; g.add(ob);
      /* Glyph rings climbing the shaft, each turning at its own rate. */
      for(let i=0;i<3;i++){
        const y=0.9+i*1.3, rr=0.55-i*0.09;
        const ring=meshOf(new THREE.TorusGeometry(rr,0.045,5,22),
          glowMat(i%2?P.accent:P.accent2,1.5),false,false);
        ring.rotation.x=Math.PI/2; ring.position.y=y;
        const sp1=0.3-i*0.07;
        ring.userData.tick=t=>{ring.rotation.z=t*sp1; ring.rotation.x=Math.PI/2+Math.sin(t*0.4+i)*0.16;};
        g.add(ring); animated.push(ring);
      }
      const cap=meshOf(new THREE.OctahedronGeometry(0.42),glowMat(P.accent,2.1),false,false);
      cap.scale.y=1.9; cap.position.y=0.34+h+0.5;
      cap.userData.tick=t=>{cap.rotation.y=t*0.4; cap.position.y=0.34+h+0.5+Math.sin(t*0.9)*0.08;};
      g.add(cap); animated.push(cap);
      for(let i=0;i<6;i++){
        const a=i/6*TAU;
        const c=meshOf(new THREE.OctahedronGeometry(0.2),
          mat(P.crys,{emissive:P.crys,ei:0.6,rough:0.22}),false,false);
        c.scale.y=2.0; c.position.set(Math.cos(a)*1.28,0.5,Math.sin(a)*1.28); g.add(c);
      }
    }else if(S==='orrery'){
      g.add(meshOf(new THREE.CylinderGeometry(1.4,1.6,0.3,14),mat(P.stone2,{rough:0.9})));
      const drum=meshOf(new THREE.CylinderGeometry(0.8,0.95,1.5,12),mat(P.stone,{rough:0.8}));
      drum.position.y=1.05; g.add(drum);
      for(let i=0;i<6;i++){
        const a=i/6*TAU;
        const col=meshOf(new THREE.CylinderGeometry(0.09,0.09,1.4,7),mat(P.stone2,{rough:0.85}));
        col.position.set(Math.cos(a)*1.18,1.0,Math.sin(a)*1.18); g.add(col);
      }
      const core=meshOf(new THREE.IcosahedronGeometry(0.44,1),glowMat(P.accent,2.2),false,false);
      core.position.y=2.9; g.add(core);
      core.userData.tick=t=>{core.material.emissiveIntensity=2.0+Math.sin(t*1.3)*0.5;};
      animated.push(core);
      for(let i=0;i<4;i++){
        const RR=0.95+i*0.45;
        const ring=meshOf(new THREE.TorusGeometry(RR,0.045,6,36),
          mat(P.metal,{metal:0.7,rough:0.28,env:1.1}),false,false);
        const sp1=0.18-i*0.03, tilt=i*0.34;
        ring.userData.tick=t=>{ring.position.y=2.9;
          ring.rotation.set(Math.PI/2+Math.sin(t*0.15+i)*0.28,t*sp1,tilt);};
        g.add(ring); animated.push(ring);
        const b=meshOf(new THREE.SphereGeometry(0.14,8,7),
          glowMat(i%2?P.accent2:P.bloom,1.8),false,false);
        b.userData.tick=t=>{const w=t*(0.3+i*0.1)+i;
          b.position.set(Math.cos(w)*RR,2.9+Math.sin(w*0.7+i)*RR*0.4,Math.sin(w)*RR);};
        g.add(b); animated.push(b);
      }
    }else if(S==='roost'){
      /* Not a monument so much as a PERCH: the agents are the moving part and
         the marble is only what they come home to. Masts on a stepped plinth,
         a landing dish on each, and a swarm that never touches any of it. */
      g.add(meshOf(new THREE.CylinderGeometry(1.5,1.7,0.26,12),mat(P.stone2,{rough:0.9})));
      g.add(meshOf(new THREE.CylinderGeometry(1.15,1.35,0.22,12),mat(P.stone,{rough:0.88}))
        .translateY(0.24));
      for(let i=0;i<4;i++){
        const a=i/4*TAU+0.4, r=1.0, h=2.6+((i*0.37)%1)*1.4;
        const m=meshOf(new THREE.CylinderGeometry(0.09,0.15,h,7),mat(P.stone,{rough:0.72}));
        m.position.set(Math.cos(a)*r,0.34+h/2,Math.sin(a)*r); g.add(m);
        const dish=meshOf(new THREE.SphereGeometry(0.36,12,7,0,TAU,0,Math.PI/2),
          mat(P.stone2,{flat:false,rough:0.6}));
        dish.position.set(Math.cos(a)*r,0.34+h,Math.sin(a)*r);
        dish.rotation.set(-0.55,a,0); g.add(dish);
        const tip=meshOf(new THREE.OctahedronGeometry(0.13),glowMat(P.accent,2.0),false,false);
        tip.position.set(Math.cos(a)*r,0.34+h+0.2,Math.sin(a)*r); g.add(tip);
      }
      /* The swarm scales with the reading, because a busy district should look
         busy — and drones are the one thing here that can carry a count without
         the stone underneath having to move. */
      const swarm=clamp(8+sp.level*2,8,30);
      for(let i=0;i<swarm;i++){
        const d=meshOf(new THREE.TetrahedronGeometry(0.12),
          glowMat(i%3?P.accent:P.accent2,1.6),false,false);
        const rr=lerp(0.8,2.3,(i*0.41)%1), hh=lerp(1.2,3.6,(i*0.73)%1);
        const sp1=lerp(0.3,0.85,(i*0.29)%1), off=(i*1.7)%TAU;
        d.userData.tick=t=>{ const w=t*sp1+off;
          d.position.set(Math.cos(w)*rr,hh+Math.sin(t*1.6+off)*0.34,Math.sin(w)*rr);
          d.rotation.set(w,w*1.3,0); };
        g.add(d); animated.push(d);
      }
    }else if(S==='conduit'){
      /* Pipework in marble and gold. Infra is the one subject whose monument
         has to show something moving from A to B, so the arcs are plumbing and
         the light inside them is the traffic. */
      const core=meshOf(new THREE.CylinderGeometry(0.52,0.68,1.1,10),mat(P.stone,{rough:0.82}));
      core.position.y=0.55; g.add(core);
      g.add(meshOf(new THREE.CylinderGeometry(0.58,0.52,0.16,10),
        mat(P.metal,{metal:0.6,rough:0.35})).translateY(1.16));
      const cg=meshOf(new THREE.CylinderGeometry(0.42,0.42,0.1,10),
        glowMat(P.accent,2.0),false,false);
      cg.position.y=1.27; g.add(cg);
      matAnim(cg.material,(m,t)=>{ m.emissiveIntensity=1.5+Math.sin(t*2.4)*0.6; });
      for(let i=0;i<3;i++){
        const a=i/3*TAU+0.3, r=1.5, RR=1.36, yaw=-a+Math.PI/2;
        const pipe=meshOf(new THREE.TorusGeometry(RR,0.13,6,18,Math.PI),
          mat(P.stone2,{metal:0.3,rough:0.5}));
        pipe.position.set(Math.cos(a)*r,0.1,Math.sin(a)*r); pipe.rotation.y=yaw; g.add(pipe);
        /* Where the arc meets the ground, on both sides — an arch standing on
           nothing reads as a hoop somebody dropped. */
        for(const s2 of [-1,1]){
          const foot=meshOf(new THREE.CylinderGeometry(0.17,0.21,0.34,8),mat(P.stone,{rough:0.9}));
          foot.position.set(Math.cos(a)*r+s2*RR*Math.cos(yaw),0.17,
                            Math.sin(a)*r-s2*RR*Math.sin(yaw));
          g.add(foot);
        }
        for(let k=0;k<3;k++){
          const pulse=meshOf(new THREE.SphereGeometry(0.12,7,6),
            glowMat(P.accent2,2.0),false,false);
          pulse.userData.tick=t=>{
            const u=((t*0.4+k/3+i*0.2)%1)*Math.PI;
            const lx=Math.cos(u)*RR, ly=Math.sin(u)*RR;
            pulse.position.set(Math.cos(a)*r+lx*Math.cos(yaw),0.1+ly,
                               Math.sin(a)*r-lx*Math.sin(yaw));
          };
          g.add(pulse); animated.push(pulse);
        }
      }
    }else if(S==='wardring'){
      /* A ring of ward lanterns under a shell that is visibly holding
         something in. Safety is a containment shape, not a tall one — so this
         one stays low and closed while everything around it climbs. */
      const n=9, R=1.7;
      for(let i=0;i<n;i++){
        const a=i/n*TAU, h=1.25;
        const post=meshOf(new THREE.CylinderGeometry(0.08,0.12,h,7),mat(P.stone2,{rough:0.88}));
        post.position.set(Math.cos(a)*R,h/2,Math.sin(a)*R); g.add(post);
        const lan=meshOf(new THREE.OctahedronGeometry(0.19),glowMat(P.accent,1.9),false,false);
        lan.position.set(Math.cos(a)*R,h+0.18,Math.sin(a)*R);
        lan.userData.tick=t=>{ lan.position.y=h+0.18+Math.sin(t*1.2+i)*0.07;
          lan.material.emissiveIntensity=1.5+Math.sin(t*2+i*0.7)*0.5; };
        g.add(lan); animated.push(lan);
      }
      const shell=meshOf(new THREE.SphereGeometry(R*1.08,20,12,0,TAU,0,Math.PI/2),
        mat(P.crys,{emissive:P.crys,ei:0.5,opacity:0.14,flat:false,
          side:THREE.DoubleSide,rough:0.1}),false,false);
      shell.userData.tick=t=>{ shell.scale.setScalar(1+Math.sin(t*0.8)*0.03);
        shell.material.opacity=0.10+Math.sin(t*0.8)*0.05; };
      g.add(shell); animated.push(shell);
      const seal=meshOf(new THREE.RingGeometry(R*0.5,R*0.94,32),
        glowMat(P.accent2,0.9),false,false);
      seal.rotation.x=-Math.PI/2; seal.position.y=0.05;
      seal.userData.tick=t=>{ seal.rotation.z=t*0.15; };
      g.add(seal); animated.push(seal);
      const plinth=meshOf(new THREE.CylinderGeometry(R*0.42,R*0.5,0.3,12),
        mat(P.stone,{rough:0.9}));
      plinth.position.y=0.15; g.add(plinth);
    }else if(S==='coil'){
      /* THE SERPENT STEPS, and the one monument that is literally built out of
         the reading: step i sits at a fixed angle and a fixed height, so more
         articles lay MORE STEPS on the same staircase rather than restyling the
         one that is already there. */
      const steps=clamp(Math.round(8+sp.level*2.2),8,34);
      const ANG=0.46, RISE_=0.19, R0=0.7, R1=1.7;
      for(let i=0;i<steps;i++){
        const a=i*ANG, r=lerp(R0,R1,Math.min(1,i/22));
        const st=meshOf(boxG(0.62,0.14,0.34),mat(i%2?P.stone:P.stone2,{rough:0.86}));
        st.position.set(Math.cos(a)*r,0.12+i*RISE_,Math.sin(a)*r);
        st.rotation.y=-a; g.add(st);
        if(i%5===0){
          const sc=meshOf(new THREE.OctahedronGeometry(0.1),
            mat(P.crys,{emissive:P.crys,ei:0.8,rough:0.22}),false,false);
          sc.scale.y=1.8;
          sc.position.set(Math.cos(a)*r*1.16,0.28+i*RISE_,Math.sin(a)*r*1.16); g.add(sc);
        }
      }
      const H=0.12+steps*RISE_;
      /* A newel the stair actually winds around: without it the steps read as a
         helix of loose slabs hanging in the air. */
      const newel=meshOf(new THREE.CylinderGeometry(0.3,0.42,H,10),mat(P.stone,{rough:0.84}));
      newel.position.y=H/2; g.add(newel);
      const head=meshOf(new THREE.IcosahedronGeometry(0.34,0),
        mat(P.crys,{emissive:P.accent,ei:0.9,rough:0.24}),false,false);
      head.position.y=H+0.3; g.add(head);
      head.userData.tick=t=>{ head.rotation.y=t*0.4; head.position.y=H+0.3+Math.sin(t)*0.08; };
      animated.push(head);
    }else{   /* aqueduct */
      /* A curved run of arches carrying a lit channel. Reads instantly as
         "something flows through here", which is the point for data. */
      const n=6, rr=2.3;
      for(let i=0;i<n;i++){
        const a=i/n*Math.PI*1.15-0.5;
        const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
        const h=1.7+Math.sin(i*1.3)*0.18;
        for(const s of [-0.34,0.34]){
          const p=meshOf(new THREE.BoxGeometry(0.24,h,0.24),mat(P.stone,{rough:0.88}));
          p.position.set(x+Math.sin(a)*s,h/2,z-Math.cos(a)*s); p.rotation.y=-a; g.add(p);
        }
        const arc=meshOf(new THREE.TorusGeometry(0.34,0.1,5,10,Math.PI),
          mat(P.stone2,{rough:0.9}));
        arc.position.set(x,h,z); arc.rotation.y=-a+Math.PI/2; g.add(arc);
        const deck=meshOf(new THREE.BoxGeometry(0.5,0.22,1.0),mat(P.stone,{rough:0.88}));
        deck.position.set(x,h+0.35,z); deck.rotation.y=-a; g.add(deck);
        const ch=meshOf(new THREE.BoxGeometry(0.3,0.09,0.86),
          mat(P.water,{emissive:P.water,ei:0.7,flat:false,rough:0.15,opacity:0.9}),false,false);
        ch.position.set(x,h+0.5,z); ch.rotation.y=-a; g.add(ch);
      }
      for(let k=0;k<3;k++){
        const d=meshOf(new THREE.SphereGeometry(0.11,7,6),glowMat(P.accent,1.8),false,false);
        d.userData.tick=t=>{
          const u=(t*0.22+k/3)%1, a=u*Math.PI*1.15-0.5;
          d.position.set(Math.cos(a)*rr,2.25,Math.sin(a)*rr);
        };
        g.add(d); animated.push(d);
      }
    }
  }

  /* ------------------------------------------------------------ frameworks */
  else if(P.kit==='frame'){
    if(S==='loom'){
      /* A great upright loom, warp threads lit, shuttle running across. */
      const w=3.0, h=3.4;
      for(const s of [-1,1]){
        g.add(meshOf(new THREE.CylinderGeometry(0.17,0.22,h,7),mat(P.bark,{rough:0.96}))
          .translateX(s*w/2).translateY(h/2));
        g.add(meshOf(new THREE.BoxGeometry(0.5,0.2,0.9),mat(P.wood,{rough:0.94}))
          .translateX(s*w/2).translateY(0.1));
      }
      for(const y of [h*0.28,h]){
        const bar=meshOf(new THREE.CylinderGeometry(0.12,0.12,w+0.5,8),mat(P.wood,{rough:0.92}));
        bar.rotation.z=Math.PI/2; bar.position.y=y; g.add(bar);
      }
      const warpMat=glowMat(P.accent,1.1);
      for(let i=0;i<11;i++){
        const x=lerp(-w*0.44,w*0.44,i/10);
        const th=meshOf(new THREE.BoxGeometry(0.035,h*0.72,0.035),warpMat,false,false);
        th.position.set(x,h*0.64,0); g.add(th);
      }
      const shuttle=meshOf(new THREE.BoxGeometry(0.42,0.14,0.28),
        mat(P.accent2,{emissive:P.accent2,ei:0.7,rough:0.5}),false,false);
      shuttle.userData.tick=t=>{
        shuttle.position.set(Math.sin(t*0.8)*w*0.44,h*0.6+Math.sin(t*1.6)*0.05,0);
      };
      g.add(shuttle); animated.push(shuttle);
      /* Finished cloth rolled at the bottom. */
      const cloth=meshOf(new THREE.CylinderGeometry(0.3,0.3,w*0.9,10),
        mat(P.roof2,{rough:0.85}));
      cloth.rotation.z=Math.PI/2; cloth.position.y=h*0.28-0.34; g.add(cloth);
    }else if(S==='greenhouse'){
      /* A grand conservatory: the hall's language at monument size, with a
         raised stone terrace and a lantern pair. */
      const w=2.6, d=4.2, h=0.8;
      g.add(meshOf(new THREE.BoxGeometry(w+1.0,0.2,d+1.0),mat(P.stone,{rough:0.95}))
        .translateY(0.1));
      g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.stone2,{rough:0.94}))
        .translateY(0.2+h/2));
      const vault=meshOf(new THREE.CylinderGeometry(w/2,w/2,d,20,1,true,0,Math.PI),
        mat(P.glass,{opacity:0.42,rough:0.07,metal:0.12,flat:false,
          side:THREE.DoubleSide,env:1.3,emissive:P.glass,ei:0.14}),false,false);
      vault.rotation.z=Math.PI/2; vault.rotation.y=Math.PI/2; vault.position.y=0.2+h;
      g.add(vault);
      for(let i=0;i<=9;i++){
        const z=lerp(-d/2,d/2,i/9);
        const rib=meshOf(new THREE.TorusGeometry(w/2,0.055,5,16,Math.PI),
          mat(P.wood,{rough:0.9}));
        rib.position.set(0,0.2+h,z); g.add(rib);
      }
      for(const s of [-1,1]){
        const leaf=meshOf(new THREE.SphereGeometry(w*0.46,12,7,0,Math.PI),
          mat(P.canopy,{rough:0.92,flat:false,side:THREE.DoubleSide}),true,false);
        leaf.position.set(s*w*0.14,0.2+h+w/2*0.9,0);
        leaf.scale.set(1,0.32,d/w*1.02); leaf.rotation.z=s*0.42; g.add(leaf);
      }
      const glow=meshOf(new THREE.BoxGeometry(w*0.62,0.1,d*0.76),glowMat(P.warm,0.8),false,false);
      glow.position.y=0.34; g.add(glow);
      for(let i=0;i<8;i++){
        const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.2,0.42,rnd()),0),
          mat(rnd()<0.5?P.canopy2:P.moss,{rough:0.98}),false,false);
        b.position.set((rnd()-0.5)*w*0.5,0.4+lerp(0,0.6,rnd()),(rnd()-0.5)*d*0.76); g.add(b);
      }
    }else if(S==='wellspring'){
      /* A stepped fountain in the roots. Water in this realm is dew and
         seepage rather than plumbing, so the basin is rough stone with moss on
         it and the roots reach in over the kerb — a spring somebody built a rim
         around, not a civic fountain dropped in a wood. */
      const R=1.6;
      g.add(meshOf(new THREE.CylinderGeometry(R,R*0.9,0.5,16),mat(P.stone,{rough:0.94}))
        .translateY(0.25));
      g.add(meshOf(new THREE.CylinderGeometry(R*0.84,R*0.8,0.34,16),
        mat(P.stone2,{rough:0.94})).translateY(0.3));
      const lower=meshOf(new THREE.CircleGeometry(R*0.82,18),
        mat(P.water,{emissive:P.water,ei:0.4,rough:0.15,flat:false}),false,false);
      lower.rotation.x=-Math.PI/2; lower.position.y=0.47; g.add(lower);
      /* The vertical is what makes it read as a spring rather than a puddle
         with things in it. */
      g.add(meshOf(new THREE.CylinderGeometry(0.24,0.36,1.2,10),mat(P.stone,{rough:0.92}))
        .translateY(1.1));
      g.add(meshOf(new THREE.CylinderGeometry(0.82,0.42,0.32,14),mat(P.stone2,{rough:0.92}))
        .translateY(1.86));
      const upper=meshOf(new THREE.CircleGeometry(0.74,14),
        mat(P.water,{emissive:P.water,ei:0.5,rough:0.15,flat:false}),false,false);
      upper.rotation.x=-Math.PI/2; upper.position.y=2.0; g.add(upper);
      const finial=meshOf(new THREE.IcosahedronGeometry(0.24,1),
        glowMat(P.accent,1.8),false,false);
      finial.position.y=2.34; g.add(finial);
      finial.userData.tick=t=>{ finial.rotation.y=t*0.4;
        finial.material.emissiveIntensity=1.5+Math.sin(t*1.6)*0.4; };
      animated.push(finial);
      /* Four spouts arcing from the upper bowl into the lower one, and a ripple
         where each lands. Solid and small: a translucent jet and a water disc a
         tenth of a unit apart strobe as the depth buffer changes its mind. */
      for(let i=0;i<4;i++){
        const a=i/4*TAU+Math.PI/4;
        const jet=meshOf(new THREE.CylinderGeometry(0.05,0.07,0.95,6),
          mat(P.water,{emissive:P.water,ei:0.9,rough:0.15,flat:false}),false,false);
        jet.position.set(Math.cos(a)*0.8,1.55,Math.sin(a)*0.8);
        jet.rotation.set(Math.sin(a)*0.24,0,-Math.cos(a)*0.24); g.add(jet);
        const ripple=meshOf(new THREE.TorusGeometry(0.2,0.03,5,14),
          mat(P.water,{emissive:P.water,ei:0.8,opacity:0.7,rough:0.2}),false,false);
        ripple.rotation.x=-Math.PI/2;
        ripple.userData.tick=t=>{ const u=(t*0.6+i/4)%1;
          ripple.position.set(Math.cos(a)*0.98,0.5,Math.sin(a)*0.98);
          ripple.scale.setScalar(0.4+u*2.2); ripple.material.opacity=0.6*(1-u); };
        g.add(ripple); animated.push(ripple);
      }
      for(let i=0;i<5;i++){
        const a=i*2.399963229728653;
        const root=meshOf(new THREE.CylinderGeometry(0.1,0.2,1.8,6),mat(P.bark,{rough:0.96}));
        root.position.set(Math.cos(a)*R*1.24,0.78,Math.sin(a)*R*1.24);
        root.rotation.set(Math.sin(a)*0.5,0,-Math.cos(a)*0.5); g.add(root);
        const mo=meshOf(new THREE.IcosahedronGeometry(0.2,0),mat(P.moss,{rough:0.98}),false,false);
        mo.scale.y=0.45; mo.position.set(Math.cos(a)*R*1.02,0.52,Math.sin(a)*R*1.02); g.add(mo);
      }
    }else{   /* canopywalk */
      /* A ring of tall posts carrying a suspended walkway, lanterns hung under
         it — the rope bridges spiralling the reference's tree, made a monument. */
      const rr=2.5, n=7, deckY=2.6;
      for(let i=0;i<n;i++){
        const a=i/n*TAU;
        const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
        const ph=deckY+lerp(0.5,1.0,rnd());
        g.add(meshOf(new THREE.CylinderGeometry(0.14,0.22,ph,7),mat(P.bark,{rough:0.96}))
          .translateX(x).translateY(ph/2).translateZ(z));
        const a2=(i+1)/n*TAU;
        const x2=Math.cos(a2)*rr, z2=Math.sin(a2)*rr;
        const mid=(i+0.5)/n*TAU;
        const seg=meshOf(new THREE.BoxGeometry(Math.hypot(x2-x,z2-z)*1.04,0.12,0.7),
          mat(P.wood,{rough:0.92}));
        seg.position.set(Math.cos(mid)*rr*0.985,deckY,Math.sin(mid)*rr*0.985);
        seg.rotation.y=-mid+Math.PI/2; g.add(seg);
        const rail=meshOf(new THREE.BoxGeometry(Math.hypot(x2-x,z2-z)*1.04,0.05,0.05),
          mat(P.bark2,{rough:0.95}),true,false);
        rail.position.set(Math.cos(mid)*rr*1.28,deckY+0.36,Math.sin(mid)*rr*1.28);
        rail.rotation.y=-mid+Math.PI/2; g.add(rail);
        const lan=meshOf(new THREE.BoxGeometry(0.18,0.24,0.18),glowMat(P.warm,1.8),false,false);
        lan.position.set(Math.cos(mid)*rr,deckY-0.42,Math.sin(mid)*rr);
        const phz=i*0.9;
        lan.userData.tick=t=>{lan.material.emissiveIntensity=1.6+Math.sin(t*1.4+phz)*0.4;};
        g.add(lan); animated.push(lan);
      }
      /* And something worth walking to: a lit platform in the middle. */
      const plat=meshOf(new THREE.CylinderGeometry(0.95,0.85,0.16,10),mat(P.wood,{rough:0.92}));
      plat.position.y=deckY+0.4; g.add(plat);
      const post=meshOf(new THREE.CylinderGeometry(0.13,0.18,deckY+0.4,7),
        mat(P.bark,{rough:0.96}));
      post.position.y=(deckY+0.4)/2; g.add(post);
      for(let i=0;i<4;i++){
        const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.5,0.85,rnd()),1),
          mat(rnd()<0.5?P.canopy:P.canopy2,{rough:0.94,flat:false}));
        b.position.set((rnd()-0.5)*1.2,deckY+1.2+rnd()*0.5,(rnd()-0.5)*1.2);
        b.scale.y=0.72; g.add(b);
      }
    }
  }

  /* ---------------------------------------------------------- metal forges */
  else if(P.kit==='forge'){
    if(S==='bigwheel'){
      /* A great iron wheel turning in a brick housing, over a lava trough. */
      const hb=meshOf(new THREE.BoxGeometry(2.4,1.5,1.3),mat(P.brick,{rough:0.95}));
      hb.position.y=0.75; g.add(hb);
      const vault=meshOf(new THREE.CylinderGeometry(1.2,1.2,1.3,12,1,false,0,Math.PI),
        mat(P.iron,{metal:0.35,rough:0.6}));
      vault.rotation.z=Math.PI/2; vault.rotation.y=Math.PI/2; vault.position.y=1.5; g.add(vault);
      const wheel=new THREE.Group();
      const rim=meshOf(new THREE.TorusGeometry(1.5,0.12,7,26),
        mat(P.metal,{metal:0.55,rough:0.45}));
      wheel.add(rim);
      const rim2=meshOf(new THREE.TorusGeometry(1.28,0.07,6,24),
        mat(P.metal,{metal:0.55,rough:0.45}));
      wheel.add(rim2);
      for(let i=0;i<10;i++){
        const a=i/10*TAU;
        const sp1=meshOf(new THREE.BoxGeometry(0.1,3.0,0.1),
          mat(P.iron2,{metal:0.4,rough:0.55}),true,false);
        sp1.rotation.z=a; wheel.add(sp1);
        const bkt=meshOf(new THREE.BoxGeometry(0.3,0.22,0.5),
          mat(mixTok(P.lava,0x201018,0.5),{emissive:P.lava,ei:0.8,rough:0.55}),false,false);
        bkt.position.set(Math.cos(a)*1.5,Math.sin(a)*1.5,0); bkt.rotation.z=a; wheel.add(bkt);
      }
      wheel.position.set(0,1.7,0.95);
      wheel.userData.tick=t=>{wheel.rotation.z=-t*0.35;};
      g.add(wheel); animated.push(wheel);
      const trough=meshOf(new THREE.BoxGeometry(3.4,0.16,0.6),
        mat(mixTok(P.lava,0x18101C,0.5),{emissive:P.lava,ei:0.95,rough:0.55}),false,true);
      trough.position.set(0,0.14,0.95); g.add(trough);
      for(const s of [-1,1]){
        const st=meshOf(new THREE.CylinderGeometry(0.14,0.17,1.1,7),
          mat(P.metal,{metal:0.45,rough:0.5}));
        st.position.set(s*0.85,2.3,-0.4); g.add(st);
        forgeSmoke(P,g,s*0.85,2.9,-0.4,0.9);
      }
    }else if(S==='crucible'){
      /* A crucible on legs, tipped, pouring into a basin. The pour is the whole
         monument: a district about systems should be visibly RUNNING. */
      g.add(meshOf(new THREE.CylinderGeometry(1.5,1.7,0.3,12),mat(P.cliff,{rough:0.95})));
      const basin=meshOf(new THREE.CylinderGeometry(1.0,0.85,0.5,12),
        mat(P.iron,{metal:0.35,rough:0.6}));
      basin.position.y=0.55; g.add(basin);
      const pool=meshOf(new THREE.CylinderGeometry(0.86,0.86,0.1,12),
        mat(mixTok(P.lava,0x1A0E14,0.35),{emissive:P.lava,ei:1.0,rough:0.5}),false,false);
      pool.position.y=0.78;
      pool.userData.tick=t=>{pool.material.emissiveIntensity=0.9+Math.sin(t*0.9)*0.3;};
      g.add(pool); animated.push(pool);
      for(let i=0;i<3;i++){
        const a=i/3*TAU;
        g.add(beam(new THREE.Vector3(Math.cos(a)*1.15,0.2,Math.sin(a)*1.15),
          new THREE.Vector3(Math.cos(a)*0.55,2.5,Math.sin(a)*0.55),0.1,
          mat(P.metal,{metal:0.5,rough:0.5})));
      }
      const cru=meshOf(new THREE.CylinderGeometry(0.72,0.5,0.9,10),
        mat(P.iron2,{metal:0.4,rough:0.55}));
      cru.position.set(0.2,2.85,0); cru.rotation.z=-0.5; g.add(cru);
      const hoop=meshOf(new THREE.TorusGeometry(0.74,0.06,5,14),
        mat(P.metal,{metal:0.6,rough:0.4}));
      hoop.position.set(0.32,3.16,0); hoop.rotation.x=Math.PI/2; hoop.rotation.y=-0.5;
      hoop.rotation.z=-0.5; g.add(hoop);
      const stream=meshOf(new THREE.CylinderGeometry(0.09,0.14,2.1,6),
        mat(P.lavaHot,{emissive:P.lavaHot,ei:1.5,rough:0.3,flat:false,opacity:0.95}),false,false);
      stream.position.set(0.62,1.85,0); stream.rotation.z=0.06; g.add(stream);
      for(let k=0;k<4;k++){
        const sp1=meshOf(new THREE.IcosahedronGeometry(0.1,0),
          mat(P.lavaHot,{emissive:P.lavaHot,ei:1.6,rough:0.3,opacity:0.9}),false,false);
        sp1.userData.tick=t=>{
          const u=(t*0.9+k/4)%1;
          sp1.position.set(0.62+Math.sin(u*6+k)*0.2,0.85+u*0.5,Math.cos(u*5+k)*0.24);
          sp1.scale.setScalar(0.5+u*1.4);
          sp1.material.opacity=0.9*(1-u);
        };
        g.add(sp1); animated.push(sp1);
      }
    }else if(S==='anvilyard'){
      /* A ring of anvils struck in sequence around a live brazier. The forges'
         other two monuments are single machines; this one is a CREW, and the
         thing you read from across the plot is the hammers falling out of
         phase with each other. */
      const R=1.9, n=clamp(4+Math.floor(sp.level/2),4,8);
      g.add(meshOf(new THREE.CylinderGeometry(R*1.25,R*1.32,0.24,14),
        mat(P.deck2,{rough:0.95})).translateY(0.12));
      for(let i=0;i<n;i++){
        const a=i/n*TAU+0.3, x=Math.cos(a)*R, z=Math.sin(a)*R;
        const block=meshOf(new THREE.CylinderGeometry(0.24,0.3,0.5,7),mat(P.wood,{rough:0.96}));
        block.position.set(x,0.49,z); g.add(block);
        const anv=meshOf(boxG(0.62,0.2,0.28),mat(P.iron,{metal:0.55,rough:0.45}));
        anv.position.set(x,0.84,z); anv.rotation.y=-a; g.add(anv);
        const horn=meshOf(new THREE.ConeGeometry(0.11,0.3,6),mat(P.iron,{metal:0.55,rough:0.45}));
        horn.rotation.z=-Math.PI/2; horn.rotation.y=-a;
        horn.position.set(x+Math.cos(-a)*0.4,0.84,z-Math.sin(-a)*0.4); g.add(horn);
        /* Hammer and spark share one tick: the flash has to land on the blow,
           and two clocks drift. */
        const ham=meshOf(boxG(0.16,0.32,0.16),mat(P.metal,{metal:0.5,rough:0.5}));
        const spark=meshOf(new THREE.IcosahedronGeometry(0.16,0),
          glowMat(P.lavaHot,2.6),false,false);
        spark.position.set(x,0.98,z);
        const off=i/n;
        ham.userData.tick=t=>{
          const u=(t*0.7+off)%1;
          const drop=u<0.5?1-Math.pow(u*2,2):(u-0.5)*2;
          ham.position.set(x,1.1+drop*0.65,z);
          const hit=u<0.08?1-u/0.08:0;
          spark.scale.setScalar(0.2+hit*1.5);
          spark.material.emissiveIntensity=hit*3;
        };
        g.add(ham,spark); animated.push(ham);
      }
      const brz=meshOf(new THREE.CylinderGeometry(0.46,0.32,0.5,9),
        mat(P.iron2,{metal:0.5,rough:0.5}));
      brz.position.y=0.49; g.add(brz);
      const coals=meshOf(new THREE.CircleGeometry(0.4,10),glowMat(P.lava,2.2),false,false);
      coals.rotation.x=-Math.PI/2; coals.position.y=0.75; g.add(coals);
      matAnim(coals.material,(m,t)=>{ m.emissiveIntensity=1.8+Math.sin(t*2.1)*0.6; });
      smokePlume(g,0,0.9,0,0.8,P.smoke,0.3,3);
    }else{   /* pipeorgan */
      /* A stand of vertical pipes at graduated heights, venting. It is the one
         forge silhouette that is about SOUND, and it separates instantly from
         the wheel and the crucible at share-card size. */
      g.add(meshOf(new THREE.BoxGeometry(3.0,0.5,1.4),mat(P.brick2,{rough:0.95}))
        .translateY(0.25));
      const n=9;
      for(let i=0;i<n;i++){
        const u=Math.abs(i-(n-1)/2)/((n-1)/2);
        const h=lerp(4.2,1.7,u)*lerp(0.94,1.06,rnd());
        const r=lerp(0.2,0.12,u);
        const x=lerp(-1.3,1.3,i/(n-1));
        const pipe=meshOf(new THREE.CylinderGeometry(r,r,h,9),
          mat(i%2?P.metal:P.iron,{metal:0.6,rough:0.4,env:0.9}));
        pipe.position.set(x,0.5+h/2,0); g.add(pipe);
        const cap=meshOf(new THREE.CylinderGeometry(r*1.25,r*1.05,0.14,9),
          mat(P.metal,{metal:0.65,rough:0.35}));
        cap.position.set(x,0.5+h,0); g.add(cap);
        const mouth=meshOf(new THREE.BoxGeometry(r*1.3,0.16,0.05),
          glowMat(P.lava,1.4),false,false);
        mouth.position.set(x,0.9,r); g.add(mouth);
        if(i===2||i===n-3) forgeSmoke(P,g,x,0.5+h+0.2,0,0.5);
      }
      /* A brass manifold running along the base. */
      const man=meshOf(new THREE.CylinderGeometry(0.16,0.16,2.9,9),
        mat(P.metal,{metal:0.62,rough:0.38}));
      man.rotation.z=Math.PI/2; man.position.set(0,0.66,0.55); g.add(man);
    }
  }

  /* ------------------------------------------------------------- shipyards */
  else if(P.kit==='ship'){
    if(S==='drydock'){
      /* A hull in a timber cradle on a slipway, with staging around it. This is
         the reference image's centrepiece and it needs no explaining. */
      const dock=meshOf(new THREE.BoxGeometry(4.4,0.24,2.4),mat(P.deck2,{rough:0.95}));
      dock.position.y=0.12; g.add(dock);
      for(let i=0;i<7;i++){
        const x=lerp(-1.9,1.9,i/6);
        const sl=meshOf(new THREE.BoxGeometry(0.24,0.2,2.2),mat(P.wood,{rough:0.94}));
        sl.position.set(x,0.32,0); g.add(sl);
      }
      /* The hull: a stretched, flattened sphere with a keel and a deck line. */
      const hull=meshOf(new THREE.SphereGeometry(1.0,16,10),
        mat(P.stripe2,{rough:0.7,flat:false}));
      hull.scale.set(2.6,0.62,0.85); hull.position.y=1.05; g.add(hull);
      const upper=meshOf(new THREE.SphereGeometry(1.0,16,10,0,TAU,0,Math.PI/2),
        mat(P.hull,{rough:0.72,flat:false}));
      upper.scale.set(2.5,0.34,0.8); upper.position.y=1.24; g.add(upper);
      const deck=meshOf(new THREE.BoxGeometry(4.4,0.1,1.3),mat(P.wood,{rough:0.92}));
      deck.position.y=1.42; g.add(deck);
      const house=meshOf(new THREE.BoxGeometry(1.1,0.62,0.9),mat(P.hull,{rough:0.7}));
      house.position.set(-0.5,1.78,0); g.add(house);
      const wheelh=meshOf(new THREE.BoxGeometry(0.9,0.2,0.72),winMat(P,0.7),false,false);
      wheelh.position.set(-0.5,2.0,0); g.add(wheelh);
      const funnel=meshOf(new THREE.CylinderGeometry(0.19,0.21,0.6,9),
        mat(P.stripe,{rough:0.65}));
      funnel.position.set(-0.5,2.4,0); g.add(funnel);
      const mast=meshOf(new THREE.CylinderGeometry(0.06,0.08,2.0,6),mat(P.wood,{rough:0.9}));
      mast.position.set(0.9,2.4,0); g.add(mast);
      /* Staging: two lattice towers and a plank run between them. */
      for(const s of [-1,1]){
        for(let k=0;k<3;k++){
          const x=lerp(-1.7,1.7,k/2);
          g.add(beam(new THREE.Vector3(x,0.24,s*1.35),new THREE.Vector3(x,1.9,s*1.05),
            0.06,mat(P.lattice,{rough:0.8})));
        }
        const plank=meshOf(new THREE.BoxGeometry(3.6,0.09,0.42),mat(P.wood,{rough:0.92}));
        plank.position.set(0,1.55,s*1.2); g.add(plank);
      }
    }else if(S==='crane'){
      /* A full gantry: two lattice legs on rails, a boom across, a travelling
         trolley. The one shape in the realm that reads at any zoom. */
      const span=4.6, h=4.0;
      for(const s of [-1,1]){
        for(let i=0;i<2;i++){
          const z=(i-0.5)*1.2;
          g.add(beam(new THREE.Vector3(s*span/2+s*0.4,0,z),
                     new THREE.Vector3(s*span/2-s*0.2,h,z*0.5),0.1,
                     mat(P.lattice,{rough:0.78})));
        }
        for(let k=1;k<5;k++){
          const y=h*k/5;
          const br=meshOf(new THREE.BoxGeometry(0.07,0.07,1.2),
            mat(P.lattice,{rough:0.78}),true,false);
          br.position.set(s*lerp(span/2+0.4,span/2-0.2,k/5),y,0); g.add(br);
        }
        const rail=meshOf(new THREE.BoxGeometry(0.9,0.16,1.7),mat(P.rust,{rough:0.85}));
        rail.position.set(s*span/2+s*0.4,0.08,0); g.add(rail);
      }
      const boom=meshOf(new THREE.BoxGeometry(span+1.6,0.3,0.5),mat(P.lattice,{rough:0.78}));
      boom.position.y=h+0.15; g.add(boom);
      const truss=meshOf(new THREE.BoxGeometry(span+1.0,0.16,0.36),
        mat(P.rust,{rough:0.85}));
      truss.position.y=h+0.55; g.add(truss);
      for(let i=0;i<9;i++){
        const x=lerp(-span/2-0.4,span/2+0.4,i/8);
        g.add(beam(new THREE.Vector3(x,h+0.15,0),new THREE.Vector3(x+0.35,h+0.55,0),
          0.035,mat(P.lattice,{rough:0.78}),false));
      }
      const trolley=meshOf(new THREE.BoxGeometry(0.6,0.28,0.6),mat(P.stripe,{rough:0.65}));
      const cable=meshOf(new THREE.CylinderGeometry(0.025,0.025,1,4),
        mat(P.metal,{metal:0.5,rough:0.5}),false,false);
      const load=meshOf(new THREE.BoxGeometry(0.85,0.42,0.42),mat(0xC2453C,{rough:0.78}));
      trolley.userData.tick=t=>{
        const x=Math.sin(t*0.35)*span*0.42;
        const drop=1.9+Math.sin(t*0.55)*1.1;
        trolley.position.set(x,h-0.1,0);
        cable.scale.y=drop; cable.position.set(x,h-0.24-drop/2,0);
        load.position.set(x,h-0.24-drop,0);
      };
      g.add(trolley,cable,load); animated.push(trolley);
      const bl=meshOf(new THREE.SphereGeometry(0.1,7,6),glowMat(P.accent,1.8),false,false);
      bl.position.set(0,h+0.8,0);
      bl.userData.tick=t=>{bl.material.emissiveIntensity=0.9+Math.abs(Math.sin(t*1.7))*1.8;};
      g.add(bl); animated.push(bl);
    }else if(S==='containers'){
      /* A stacked yard with a reach truck working it. The drydock and the
         gantry are both one big frame; a yard is the opposite shape — low,
         repeated and colour-coded — which is what makes it tell apart from
         them at the size a plot is actually read. */
      /* ROWS, not a scatter. Laid on the sunflower like everything else in the
         file it came out as a flower of boxes, and a yard is the one shipyard
         shape whose whole meaning is ORDER: lanes squared off with aisles wide
         enough to work down. That is also what tells it apart from the
         drydock's single frame and the gantry's single rail at plot size. */
      const cols=[P.accent,P.accent2,P.roof2,P.bloom];
      const rows=3, per=4, pitch=1.14, lane=1.35;
      const W2=per*pitch/2+0.5, D2=rows*lane/2+0.5;
      g.add(meshOf(new THREE.BoxGeometry(W2*2,0.16,D2*2+1.6),mat(P.deck2,{rough:0.96}))
        .translateY(0.08));
      /* Painted lane markings, because an empty apron between the rows reads as
         a gap in the town rather than as somewhere a truck drives. */
      for(let r=0;r<=rows;r++){
        const z=(r-rows/2)*lane;
        g.add(meshOf(new THREE.BoxGeometry(W2*1.9,0.02,0.07),
          mat(P.warm,{rough:0.9}),false,false).translateY(0.17).translateZ(z));
      }
      const stacks=clamp(6+Math.floor(sp.level*0.6),6,rows*per);
      for(let n2=0;n2<stacks;n2++){
        const r=n2%rows, i=(n2/rows)|0;
        const x=(i-(per-1)/2)*pitch, z=(r-(rows-1)/2)*lane;
        const hgt=1+((((n2*0.53)%1)<0.45)?1:2);
        for(let k=0;k<hgt;k++){
          const col=cols[(n2+k)%cols.length];
          const c=meshOf(boxG(1.0,0.42,0.6),mat(col,{rough:0.8}));
          c.position.set(x,0.37+k*0.44,z); g.add(c);
          /* Corrugation: ribs a hair proud of the shell, which is the whole
             reason a box reads as a shipping container and not a brick. */
          for(let rb2=0;rb2<3;rb2++){
            const rb=meshOf(boxG(0.04,0.36,0.62),mat(col,{rough:0.9}),false,false);
            rb.position.set(x+lerp(-0.3,0.3,rb2/2),0.37+k*0.44,z); g.add(rb);
          }
        }
      }
      const mm=mat(P.metal,{metal:0.5,rough:0.5});
      const truck=new THREE.Group(); g.add(truck);
      truck.add(meshOf(boxG(0.8,0.42,0.5),mat(P.stripe,{rough:0.8}),false,false));
      truck.add(meshOf(boxG(0.1,1.6,0.1),mm,false,false).translateX(0.4).translateY(0.8));
      const fork=meshOf(boxG(0.5,0.07,0.44),mm,false,false);
      truck.add(fork);
      /* Down the aisle and back rather than round in a circle: a reach truck
         orbiting its own yard is a carousel. */
      truck.userData.tick=t=>{
        const u=Math.sin(t*0.35);
        truck.position.set(u*W2*0.8,0.37,D2+0.5);
        truck.rotation.y=u>=0?0:Math.PI;
        fork.position.set(0.55,0.2+Math.abs(Math.sin(t*0.6))*1.0,0);
      };
      animated.push(truck);
    }else{   /* lighthouse */
      const h=5.2;
      g.add(meshOf(new THREE.CylinderGeometry(1.2,1.45,0.4,14),mat(P.stone2,{rough:0.94})));
      /* Banded white and cyan, straight off the reference. */
      const bands=7;
      for(let i=0;i<bands;i++){
        const y=0.4+h*i/bands, bh=h/bands;
        const r0=lerp(0.72,0.4,i/bands), r1=lerp(0.72,0.4,(i+1)/bands);
        const seg=meshOf(new THREE.CylinderGeometry(r1,r0,bh,14),
          mat(i%2?P.stripe:P.hull,{rough:0.7}));
        seg.position.y=y+bh/2; g.add(seg);
      }
      const gal=meshOf(new THREE.CylinderGeometry(0.62,0.52,0.14,14),
        mat(P.hull,{rough:0.7}));
      gal.position.y=0.4+h; g.add(gal);
      for(let i=0;i<12;i++){
        const a=i/12*TAU;
        const p=meshOf(new THREE.CylinderGeometry(0.025,0.025,0.3,4),
          mat(P.metal,{metal:0.5,rough:0.45}),true,false);
        p.position.set(Math.cos(a)*0.56,0.4+h+0.2,Math.sin(a)*0.56); g.add(p);
      }
      const lamp=meshOf(new THREE.CylinderGeometry(0.34,0.34,0.55,12),
        mat(P.warm,{emissive:P.warm,ei:1.6,rough:0.25,flat:false,opacity:0.92}),false,false);
      lamp.position.y=0.4+h+0.45; g.add(lamp);
      const cap=meshOf(new THREE.ConeGeometry(0.46,0.42,12),mat(P.stripe2,{rough:0.65}));
      cap.position.y=0.4+h+0.93; g.add(cap);
      /* The beam. A long thin cone sweeping — cheap, and it is the whole reason
         to put a lighthouse on an observability district. */
      const beamM=new THREE.MeshStandardMaterial({color:P.warm,emissive:P.warm,
        emissiveIntensity:1.1,roughness:0.3,transparent:true,opacity:0.28,
        side:THREE.DoubleSide,depthWrite:false});
      const bm=meshOf(new THREE.ConeGeometry(0.55,7.0,10,1,true),beamM,false,false);
      /* Height is the GROUP's job. Setting it on the cone as well put the beam
         at twice the lantern's height — a light sweeping the sky with nothing
         under it, which is what you saw from across the harbour. */
      bm.rotation.z=Math.PI/2; bm.position.x=3.5;
      const bg=new THREE.Group(); bg.add(bm);
      bg.position.y=0.4+h+0.45;
      bg.userData.tick=t=>{bg.rotation.y=-t*0.5;};
      g.add(bg); animated.push(bg);
    }
  }

  /* --------------------------------------------------------------- bastion */
  else if(P.kit==='bastion'){
    if(S==='keep'){
      /* The inner keep, on its own walled mound: the fortress inside the
         fortress. Concentric is the realm's grammar, so the monument doubles it. */
      const mound=meshOf(new THREE.CylinderGeometry(2.3,2.6,0.5,16),
        mat(P.stone2,{rough:0.94}));
      mound.position.y=0.25; g.add(mound);
      const sn=meshOf(new THREE.CylinderGeometry(2.31,2.31,0.1,16),mat(P.snow,{rough:1}),
        false,true);
      sn.position.y=0.52; g.add(sn);
      for(let i=0;i<18;i++){
        const a=i/18*TAU;
        if(Math.abs(((a+Math.PI)%TAU)-Math.PI)<0.3)continue;
        const m=meshOf(new THREE.BoxGeometry(0.26,0.42,0.42),mat(P.stone,{rough:0.94}));
        m.position.set(Math.cos(a)*2.25,0.71,Math.sin(a)*2.25); m.rotation.y=-a; g.add(m);
      }
      const body=meshOf(new THREE.CylinderGeometry(1.05,1.2,2.6,10),
        mat(P.stone,{rough:0.94}));
      body.position.y=1.8; g.add(body);
      const cor=meshOf(new THREE.CylinderGeometry(1.4,1.15,0.26,10),
        mat(P.stone2,{rough:0.94}));
      cor.position.y=3.1; g.add(cor);
      for(let i=0;i<12;i++){
        const a=i/12*TAU;
        const m=meshOf(new THREE.BoxGeometry(0.22,0.36,0.2),mat(P.stone,{rough:0.94}));
        m.position.set(Math.cos(a)*1.32,3.4,Math.sin(a)*1.32); m.rotation.y=-a; g.add(m);
        const s=meshOf(new THREE.BoxGeometry(0.24,0.07,0.22),mat(P.snow,{rough:1}),false,false);
        s.position.set(Math.cos(a)*1.32,3.6,Math.sin(a)*1.32); s.rotation.y=-a; g.add(s);
      }
      const dome=meshOf(new THREE.SphereGeometry(1.15,14,9,0,TAU,0,Math.PI/2),
        mat(P.stone2,{rough:0.9}));
      dome.position.y=3.24; dome.scale.y=0.95; g.add(dome);
      const cap=meshOf(new THREE.SphereGeometry(1.16,14,9,0,TAU,0,Math.PI*0.32),
        mat(P.snow,{rough:1}));
      cap.position.y=3.26; cap.scale.y=1.0; g.add(cap);
      const orb=meshOf(new THREE.OctahedronGeometry(0.28),glowMat(P.accent,2.0),false,false);
      orb.position.y=4.7;
      orb.userData.tick=t=>{orb.rotation.y=t*0.4;
        orb.material.emissiveIntensity=1.7+Math.sin(t*1.2)*0.5;};
      g.add(orb); animated.push(orb);
      const sm=mat(P.ward,{emissive:P.ward,ei:1.5,rough:0.4,flat:false});
      for(let i=0;i<6;i++){
        const a=i/6*TAU+0.3;
        const s=meshOf(new THREE.BoxGeometry(0.1,0.34,0.05),sm,false,false);
        s.position.set(Math.cos(a)*1.14,1.9,Math.sin(a)*1.14); s.rotation.y=-a; g.add(s);
      }
    }else if(S==='vault'){
      /* A sealed vault door set into a stone face, with lock rings that turn. */
      const face=meshOf(new THREE.BoxGeometry(3.4,3.0,0.9),mat(P.stone,{rough:0.94}));
      face.position.y=1.5; g.add(face);
      const cap=meshOf(new THREE.BoxGeometry(3.5,0.18,1.0),mat(P.snow,{rough:1}),false,false);
      cap.position.y=3.05; g.add(cap);
      for(const s of [-1,1]){
        const bt=meshOf(new THREE.CylinderGeometry(0.4,0.46,3.3,9),mat(P.stone2,{rough:0.94}));
        bt.position.set(s*1.8,1.65,0); g.add(bt);
        const bc=meshOf(new THREE.SphereGeometry(0.48,10,7,0,TAU,0,Math.PI*0.4),
          mat(P.snow,{rough:1}));
        bc.position.set(s*1.8,3.3,0); bc.scale.y=0.8; g.add(bc);
      }
      const recess=meshOf(new THREE.CylinderGeometry(1.05,1.05,0.2,20),
        mat(P.stone2,{rough:0.92}),false,false);
      recess.rotation.x=Math.PI/2; recess.position.set(0,1.5,0.5); g.add(recess);
      const door=meshOf(new THREE.CylinderGeometry(0.92,0.92,0.24,20),
        mat(P.metal,{metal:0.6,rough:0.4,env:0.9}));
      door.rotation.x=Math.PI/2; door.position.set(0,1.5,0.62); g.add(door);
      for(let i=0;i<3;i++){
        const rr=0.78-i*0.24;
        const ring=meshOf(new THREE.TorusGeometry(rr,0.06,6,26),
          mat(P.ward,{emissive:P.ward,ei:1.3,rough:0.35,metal:0.3}),false,false);
        ring.position.set(0,1.5,0.76);
        const sp1=(i%2?1:-1)*(0.22-i*0.05);
        ring.userData.tick=t=>{ring.rotation.z=t*sp1;};
        g.add(ring); animated.push(ring);
        for(let k=0;k<6;k++){
          const a=k/6*TAU;
          const stud=meshOf(new THREE.BoxGeometry(0.1,0.16,0.1),
            mat(P.metal,{metal:0.65,rough:0.35}),false,false);
          stud.position.set(Math.cos(a)*rr,Math.sin(a)*rr,0);
          ring.add(stud);
        }
      }
      const core=meshOf(new THREE.OctahedronGeometry(0.22),glowMat(P.accent,2.1),false,false);
      core.position.set(0,1.5,0.82);
      core.userData.tick=t=>{core.rotation.z=t*0.6;
        core.material.emissiveIntensity=1.8+Math.sin(t*1.5)*0.6;};
      g.add(core); animated.push(core);
      for(const s of [-1,1]){
        const st=meshOf(new THREE.BoxGeometry(1.6,0.14,0.5),mat(P.stone2,{rough:0.94}),false,true);
        st.position.set(0,0.07+s*0+0.0,0.95+(s>0?0.3:0.0)); g.add(st);
      }
    }else{   /* watchfire */
      /* A beacon on a stepped platform: the realm's alarm, and the only thing in
         the bastion that is warm rather than cold. */
      for(let i=0;i<3;i++){
        const r=2.2-i*0.5;
        const st=meshOf(new THREE.CylinderGeometry(r,r+0.08,0.34,14),
          mat(i%2?P.stone:P.stone2,{rough:0.94}));
        st.position.y=0.17+i*0.34; g.add(st);
        const sn=meshOf(new THREE.CylinderGeometry(r+0.01,r+0.01,0.07,14),
          mat(P.snow,{rough:1}),false,true);
        sn.position.y=0.34+i*0.34; g.add(sn);
      }
      const col=meshOf(new THREE.CylinderGeometry(0.34,0.46,1.5,9),mat(P.stone,{rough:0.94}));
      col.position.y=1.77; g.add(col);
      const basket=meshOf(new THREE.CylinderGeometry(0.92,0.5,0.7,10,1,true),
        mat(P.metal,{metal:0.55,rough:0.5,side:THREE.DoubleSide}));
      basket.position.y=2.85; g.add(basket);
      for(let i=0;i<10;i++){
        const a=i/10*TAU;
        g.add(beam(new THREE.Vector3(Math.cos(a)*0.5,2.5,Math.sin(a)*0.5),
                   new THREE.Vector3(Math.cos(a)*0.92,3.2,Math.sin(a)*0.92),0.035,
                   mat(P.metal,{metal:0.6,rough:0.4}),false));
      }
      const fire=meshOf(new THREE.ConeGeometry(0.75,1.7,9),glowMat(P.warm,2.4),false,false);
      fire.position.y=3.5; g.add(fire);
      const fire2=meshOf(new THREE.ConeGeometry(0.45,2.3,8),glowMat(0xFFE08A,2.6),false,false);
      fire2.position.y=3.8; g.add(fire2);
      fire.userData.tick=t=>{
        fire.scale.set(1+Math.sin(t*5)*0.08,1+Math.sin(t*6.3)*0.16,1+Math.cos(t*5.4)*0.08);
        fire2.scale.set(1+Math.cos(t*7)*0.1,1+Math.sin(t*8.1)*0.2,1+Math.sin(t*6.6)*0.1);
        fire.material.emissiveIntensity=2.2+Math.sin(t*4.4)*0.5;
      };
      animated.push(fire);
      for(let k=0;k<6;k++){
        const e=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.warm,
          transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
        e.scale.setScalar(0.22);
        e.userData.tick=t=>{
          const u=(t*0.45+k/6)%1;
          e.position.set(Math.sin(u*7+k)*0.5,4.2+u*3.2,Math.cos(u*6+k)*0.5);
          e.material.opacity=0.5*(1-u);
        };
        g.add(e); animated.push(e);
      }
      /* Signal banners either side, in the district's colours. */
      for(const s of [-1,1]){
        const b=buildBanner(P,rnd,2.4);
        b.position.set(s*1.9,0.9,0); b.rotation.y=s>0?0:Math.PI; g.add(b);
      }
    }
  }

  /* ------------------------------------------------------ artisan's quarter */
  else{
    if(S==='clocktower'){
      /* The hour tower: honey stucco, a big white face, a rose dome. Straight
         off the reference and the realm's landmark. */
      const h=5.0, r=0.82;
      g.add(meshOf(new THREE.CylinderGeometry(r*1.24,r*1.4,0.36,12),
        mat(P.stone2,{rough:0.94})));
      const body=meshOf(new THREE.CylinderGeometry(r*0.88,r,h,12),
        mat(P.stucco,{rough:0.92,flat:false}));
      body.position.y=0.36+h/2; g.add(body);
      for(let i=0;i<3;i++){
        const b=meshOf(new THREE.CylinderGeometry(r*1.03,r*1.03,0.1,12),
          mat(P.stucco3,{rough:0.9}),false,false);
        b.position.y=0.36+h*(0.22+i*0.24); g.add(b);
      }
      /* The face: a white disc with a rose surround and hands that turn. */
      const fa=P.seed*0.3;
      const face=meshOf(new THREE.CylinderGeometry(0.56,0.56,0.1,24),
        mat(0xFFFBF0,{rough:0.7,flat:false}),false,false);
      face.rotation.z=Math.PI/2; face.rotation.y=-fa;
      face.position.set(Math.cos(fa)*r*0.88,0.36+h*0.78,Math.sin(fa)*r*0.88);
      g.add(face);
      const surround=meshOf(new THREE.TorusGeometry(0.6,0.08,6,24),mat(P.rose,{rough:0.8}));
      surround.position.copy(face.position); surround.rotation.y=-fa+Math.PI/2; g.add(surround);
      for(let i=0;i<12;i++){
        const a=i/12*TAU;
        const tk=meshOf(new THREE.BoxGeometry(0.05,0.1,0.03),mat(0x3A3038,{rough:0.7}),false,false);
        tk.position.set(face.position.x+Math.cos(fa+Math.PI/2)*Math.cos(a)*0.44*0+
          Math.sin(fa)*-Math.cos(a)*0.44,
          face.position.y+Math.sin(a)*0.44,
          face.position.z+Math.cos(fa)*Math.cos(a)*0.44);
        tk.rotation.set(0,-fa,a); g.add(tk);
      }
      for(const [len,rate,w] of [[0.38,0.06,0.05],[0.28,0.72,0.06]]){
        const hand=meshOf(new THREE.BoxGeometry(w,len,0.04),mat(0x3A3038,{rough:0.7}),false,false);
        hand.userData.tick=t=>{
          const a=-t*rate;
          hand.position.set(face.position.x+Math.sin(fa)*-Math.cos(a+Math.PI/2)*len*0.5,
            face.position.y+Math.sin(a+Math.PI/2)*len*0.5,
            face.position.z+Math.cos(fa)*Math.cos(a+Math.PI/2)*len*0.5);
          hand.rotation.set(0,-fa,a);
        };
        g.add(hand); animated.push(hand);
      }
      const eave=meshOf(new THREE.CylinderGeometry(r*1.3,r*1.05,0.14,12),
        mat(P.stucco3,{rough:0.9}));
      eave.position.y=0.36+h; g.add(eave);
      const bel=0.7;
      for(let i=0;i<6;i++){
        const a=i/6*TAU;
        const c=meshOf(new THREE.CylinderGeometry(0.075,0.075,bel,7),
          mat(P.stucco3,{rough:0.9}));
        c.position.set(Math.cos(a)*r*0.72,0.36+h+bel/2,Math.sin(a)*r*0.72); g.add(c);
      }
      const dome=meshOf(new THREE.SphereGeometry(r*1.06,14,9,0,TAU,0,Math.PI/2),
        mat(P.rose,{rough:0.76,flat:false}));
      dome.position.y=0.36+h+bel; dome.scale.y=1.25; g.add(dome);
      const fin=meshOf(new THREE.OctahedronGeometry(0.18),glowMat(P.accent,1.9),false,false);
      fin.scale.y=1.9; fin.position.y=0.36+h+bel+r*1.35+0.3;
      fin.userData.tick=t=>{fin.rotation.y=t*0.4;}; g.add(fin); animated.push(fin);
    }else if(S==='market'){
      /* A row of striped awnings over trestle tables. The realm's most
         recognisable everyday shape, at monument size. */
      const bays=3;
      for(let b=0;b<bays;b++){
        const x=lerp(-2.1,2.1,bays===1?0.5:b/(bays-1));
        const w=1.9, d=1.5;
        for(const [sx,sz] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]]){
          const p=meshOf(new THREE.CylinderGeometry(0.06,0.07,1.9,7),mat(P.wood,{rough:0.92}));
          p.position.set(x+sx,0.95,sz); g.add(p);
        }
        /* The awning: alternating rose and cream panels, sloping. */
        const panels=6;
        for(let i=0;i<panels;i++){
          const pw=w/panels;
          const pn=meshOf(new THREE.BoxGeometry(pw,0.06,d*1.3),
            mat(i%2?P.rose:P.stucco3,{rough:0.8}));
          pn.position.set(x-w/2+pw*(i+0.5),2.05,0.1);
          pn.rotation.x=-0.24; g.add(pn);
        }
        const scallop=meshOf(new THREE.BoxGeometry(w+0.1,0.16,0.06),
          mat(P.rose2,{rough:0.8}),false,false);
        scallop.position.set(x,1.94,d*0.75); g.add(scallop);
        const table=meshOf(new THREE.BoxGeometry(w*0.9,0.1,d*0.6),mat(P.wood,{rough:0.94}));
        table.position.set(x,0.85,0); g.add(table);
        const cloth=meshOf(new THREE.BoxGeometry(w*0.92,0.24,d*0.62),
          mat(P.stucco3,{rough:0.9}),false,false);
        cloth.position.set(x,0.72,0); g.add(cloth);
        for(let i=0;i<5;i++){
          const f=meshOf(new THREE.SphereGeometry(lerp(0.07,0.12,rnd()),7,6),
            mat([P.rose,P.leaf,P.stucco2,P.blush][i%4],{rough:0.85}),false,false);
          f.position.set(x+(rnd()-0.5)*w*0.7,0.98,(rnd()-0.5)*d*0.4); g.add(f);
        }
        const lan=meshOf(new THREE.BoxGeometry(0.16,0.2,0.16),glowMat(P.warm,1.7),false,false);
        lan.position.set(x+w/2,1.78,-d/2);
        const ph=b*1.1;
        lan.userData.tick=t=>{lan.material.emissiveIntensity=1.5+Math.sin(t*1.5+ph)*0.35;};
        g.add(lan); animated.push(lan);
      }
      for(let i=0;i<4;i++){
        const p=quarterPlant(P,rnd);
        p.position.set(lerp(-2.7,2.7,i/3),0,-1.5); g.add(p);
      }
      const b=buildBanner(P,rnd,2.6); b.position.set(-3.0,0,0.6); g.add(b);
    }else if(S==='library'){
      /* A reading rotunda: a colonnade under a rose-tiled dome. The quarter's
         other monuments are a tower and a row, so the one shape left that says
         "civic, and old" is a round one — and a dome in this realm's roof
         colour is the loudest thing it owns. */
      const R=1.9, h=2.0, n=12;
      g.add(meshOf(new THREE.CylinderGeometry(R*1.3,R*1.38,0.28,18),
        mat(P.stone,{rough:0.94})).translateY(0.14));
      for(let i=0;i<n;i++){
        const a=i/n*TAU;
        const c=meshOf(new THREE.CylinderGeometry(0.13,0.15,h,9),
          mat(P.stucco3,{rough:0.9,flat:false}));
        c.position.set(Math.cos(a)*R,0.28+h/2,Math.sin(a)*R); g.add(c);
      }
      g.add(meshOf(new THREE.CylinderGeometry(R*1.18,R*1.18,0.24,18),
        mat(P.stucco,{rough:0.9})).translateY(0.28+h+0.12));
      const dome=meshOf(new THREE.SphereGeometry(R*1.06,18,10,0,TAU,0,Math.PI/2),
        mat(P.rose,{rough:0.72,flat:false}));
      dome.position.y=0.28+h+0.2; dome.scale.y=0.72; g.add(dome);
      const lantern=meshOf(new THREE.CylinderGeometry(0.26,0.3,0.4,9),
        mat(P.stucco3,{rough:0.9}));
      lantern.position.y=0.28+h+0.2+R*0.74; g.add(lantern);
      const fin=meshOf(new THREE.IcosahedronGeometry(0.18,1),glowMat(P.accent,1.9),false,false);
      fin.position.y=0.28+h+0.2+R*0.74+0.42; g.add(fin);
      fin.userData.tick=t=>{ fin.rotation.y=t*0.4;
        fin.position.y=0.28+h+0.2+R*0.74+0.42+Math.sin(t*1.1)*0.05; };
      animated.push(fin);
      /* Stacks on the floor, and loose pages circling the reading level — the
         only motion, so it has to be the thing the eye lands on. */
      const stacks=clamp(3+Math.floor(sp.level/2),3,7);
      for(let i=0;i<stacks;i++){
        const a=i*2.399963229728653, rr=R*0.55;
        const sh=meshOf(boxG(0.9,1.0,0.28),mat(P.wood,{rough:0.95}));
        sh.position.set(Math.cos(a)*rr,0.78,Math.sin(a)*rr); sh.rotation.y=-a; g.add(sh);
        for(let k=0;k<3;k++){
          const b=meshOf(boxG(0.8,0.05,0.3),glowMat(k%2?P.accent:P.accent2,0.8),false,false);
          b.position.set(Math.cos(a)*rr,0.53+k*0.3,Math.sin(a)*rr); b.rotation.y=-a; g.add(b);
        }
      }
      for(let i=0;i<5;i++){
        const bk=meshOf(boxG(0.3,0.06,0.22),mat(P.blush,{rough:0.85}),false,false);
        const rr=R*0.78, off=i*1.25, sp2=0.3+i*0.05;
        bk.userData.tick=t=>{ const w=t*sp2+off;
          bk.position.set(Math.cos(w)*rr,1.6+Math.sin(t*1.2+off)*0.2,Math.sin(w)*rr);
          bk.rotation.set(0.3,w,Math.sin(t+off)*0.3); };
        g.add(bk); animated.push(bk);
      }
    }else{   /* workshop */
      /* The guild row: a long stucco hall with an arcade along the front, a
         chimney, and tools on racks. Craft, made a building. */
      const w=4.2, d=2.0, h=1.7;
      g.add(meshOf(new THREE.BoxGeometry(w,h,d),mat(P.stucco,{rough:0.92,flat:false}))
        .translateY(h/2));
      /* softRoof runs its ridge along +z, and this hall is long along x — so
         the spans are passed swapped and the whole roof turned a quarter. Passed
         unswapped it came out as one enormous pink lozenge lying across the
         district, which is what a gable looks like from the wrong side. */
      const roof=softRoof(d*1.2,w*1.12,1.3,P.rose,{rough:0.78,nu:12});
      roof.position.y=h; roof.rotation.y=Math.PI/2; g.add(roof);
      /* A ridge, and skylights lying IN the roof rather than dormers standing
         proud of it. The dormers were sized and placed against the wall line,
         not against the roof surface, so at z = 0.28d the roof is already
         1.13 high and the whole dormer — box, roof and window — sat buried
         inside it, showing as a lump of stucco poking through the tiles. A
         roof light is flat by definition and cannot make that mistake. */
      const ridge=meshOf(new THREE.BoxGeometry(w*1.12,0.12,0.2),
        mat(P.rose2,{rough:0.8}),true,false);
      ridge.position.y=h+1.28; g.add(ridge);
      for(const s of [-1,1]){
        for(let i=0;i<2;i++){
          const dx=s*w*(0.16+i*0.2);
          /* Sit each light ON the computed roof surface at its own z. */
          const zz=d*0.34, u=zz/(d*1.2/2);
          const ry=h+1.3*Math.pow(Math.max(0,1-u*u),0.58);
          const sk=meshOf(new THREE.BoxGeometry(0.42,0.05,0.5),
            winMat(P,0.85),false,false);
          sk.position.set(dx,ry+0.03,zz); sk.rotation.x=-0.5; g.add(sk);
          const frm=meshOf(new THREE.BoxGeometry(0.5,0.05,0.08),
            mat(P.stucco3,{rough:0.9}),false,false);
          frm.position.set(dx,ry+0.13,zz-0.18); frm.rotation.x=-0.5; g.add(frm);
        }
      }
      /* Two chimneys, which is what actually breaks a long roofline. */
      for(const s of [-1,1]){
        const ch=meshOf(new THREE.CylinderGeometry(0.13,0.16,0.85,7),
          mat(P.cliff,{rough:0.94}));
        ch.position.set(s*w*0.33,h+1.35,0); g.add(ch);
        const cap=meshOf(new THREE.CylinderGeometry(0.18,0.15,0.09,7),
          mat(P.stucco3,{rough:0.9}),false,false);
        cap.position.set(s*w*0.33,h+1.81,0); g.add(cap);
      }
      /* The arcade: five arches along the front. */
      for(let i=0;i<5;i++){
        const x=lerp(-w*0.4,w*0.4,i/4);
        const col=meshOf(new THREE.CylinderGeometry(0.1,0.12,1.3,9),
          mat(P.stucco3,{rough:0.9}));
        col.position.set(x,0.65,d/2+0.4); g.add(col);
        if(i<4){
          const mid=lerp(-w*0.4,w*0.4,(i+0.5)/4);
          const arc=meshOf(new THREE.TorusGeometry(w*0.8/4/2,0.075,5,10,Math.PI),
            mat(P.stucco2,{rough:0.9}));
          arc.position.set(mid,1.3,d/2+0.4); g.add(arc);
        }
      }
      const lintel=meshOf(new THREE.BoxGeometry(w*0.92,0.16,0.34),mat(P.stucco3,{rough:0.9}));
      lintel.position.set(0,1.52,d/2+0.4); g.add(lintel);
      const canopy=meshOf(new THREE.BoxGeometry(w*0.95,0.09,0.52),mat(P.rose2,{rough:0.8}));
      canopy.position.set(0,1.6,d/2+0.58); canopy.rotation.x=-0.2; g.add(canopy);
      const wm=winMat(P,0.9);
      for(let i=0;i<4;i++){
        const x=lerp(-w*0.34,w*0.34,i/3);
        const win=meshOf(new THREE.BoxGeometry(0.34,0.42,0.05),wm,false,false);
        win.position.set(x,0.85,-d/2-0.02); win.rotation.y=Math.PI; g.add(win);
      }
      const ch=meshOf(new THREE.CylinderGeometry(0.16,0.2,1.1,8),mat(P.cliff,{rough:0.94}));
      ch.position.set(-w*0.34,h+0.75,0); g.add(ch);
      smokePlume(g,-w*0.34,h+1.32,0,0.7,0xFFFFFF,0.24);
      /* A tool rack and an anvil outside — the craft, visible. */
      const rack=meshOf(new THREE.BoxGeometry(1.2,0.09,0.28),mat(P.wood,{rough:0.94}));
      rack.position.set(w*0.3,1.15,d/2+0.72); g.add(rack);
      for(let i=0;i<4;i++){
        const t=meshOf(new THREE.BoxGeometry(0.06,0.4,0.06),
          mat(P.metal,{metal:0.5,rough:0.5}),false,false);
        t.position.set(w*0.3+lerp(-0.45,0.45,i/3),0.92,d/2+0.72); g.add(t);
      }
      const anvil=meshOf(new THREE.BoxGeometry(0.5,0.22,0.24),
        mat(P.metal,{metal:0.55,rough:0.45}));
      anvil.position.set(-w*0.28,0.36,d/2+0.95); g.add(anvil);
      g.add(meshOf(new THREE.CylinderGeometry(0.13,0.17,0.26,8),mat(P.wood,{rough:0.95}))
        .translateX(-w*0.28).translateY(0.13).translateZ(d/2+0.95));
      for(let i=0;i<3;i++){
        const p=quarterPlant(P,rnd);
        p.position.set(lerp(-w*0.45,w*0.45,i/2),0,d/2+1.35); g.add(p);
      }
    }
  }
  return g;
}

/* ================================================ the late game, per realm
   What a district builds once it has run out of ground. One per realm, and no
   two are the same kind of structure — see GROWTH below for why. */

/* FRAMEWORKS — dwellings hung from the great tree. The realm's expansion is
   upward into something already there, which is the one move no other realm can
   make: nobody else has a tree. */
function frameCanopyPods(P,R,level){
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,7100));
  /* Same two curves the tree itself is built from, so the pods hang in its
     canopy at every level rather than beside it. */
  const t=(level-1)/11;
  const h=lerp(1.1,13.5,Math.pow(t,0.85));
  const canopyR=lerp(0.55,5.6,Math.pow(t,0.8));
  const n=Math.min(6,Math.max(2,Math.round(2+t*5)));
  for(let i=0;i<n;i++){
    const a=i*2.399963229728653+P.seed*0.17;
    const rr=canopyR*lerp(0.5,0.85,rnd());
    const top=h*lerp(0.72,0.95,rnd());
    const drop=lerp(1.1,2.2,rnd());
    const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
    /* Two ropes and a pod hanging between them. */
    for(const sd of [-1,1]){
      g.add(beam(new THREE.Vector3(x+Math.cos(a+1.57)*sd*0.28,top,
                                   z+Math.sin(a+1.57)*sd*0.28),
                 new THREE.Vector3(x+Math.cos(a+1.57)*sd*0.28,top-drop,
                                   z+Math.sin(a+1.57)*sd*0.28),
                 0.03,mat(P.bark2,{rough:1}),false));
    }
    const pod=new THREE.Group(); pod.position.set(x,top-drop,z); g.add(pod);
    const pr=lerp(0.55,0.85,rnd());
    const deck=meshOf(new THREE.CylinderGeometry(pr*1.15,pr*1.0,0.12,9),
      mat(P.wood,{rough:0.92}));
    pod.add(deck);
    const body=meshOf(new THREE.CylinderGeometry(pr*0.85,pr*0.95,lerp(0.6,0.9,rnd()),9),
      mat(P.wood,{rough:0.92}));
    body.position.y=body.geometry.parameters.height/2+0.06; pod.add(body);
    const rf=meshOf(new THREE.ConeGeometry(pr*1.25,lerp(0.45,0.7,rnd()),10),
      mat(rnd()<0.5?P.moss:P.moss2,{rough:0.9}));
    rf.position.y=body.geometry.parameters.height+0.06+
      rf.geometry.parameters.height/2; pod.add(rf);
    const w=meshOf(new THREE.CylinderGeometry(0.13,0.13,0.05,9),winMat(P,1.0),false,false);
    w.rotation.z=Math.PI/2; w.rotation.y=-a;
    w.position.set(Math.cos(a)*pr*0.9,body.geometry.parameters.height*0.55,
                   Math.sin(a)*pr*0.9);
    pod.add(w);
    /* Railing posts, and a rope ladder dropping off one side. */
    for(let k=0;k<7;k++){
      const aa=k/7*TAU;
      pod.add(meshOf(new THREE.CylinderGeometry(0.025,0.025,0.26,4),
        mat(P.bark2,{rough:0.95}),true,false)
        .translateX(Math.cos(aa)*pr*1.05).translateY(0.18)
        .translateZ(Math.sin(aa)*pr*1.05));
    }
    const ph=rnd()*TAU, sw=lerp(0.03,0.07,rnd());
    pod.userData.tick=tt=>{ pod.rotation.z=Math.sin(tt*0.55+ph)*sw;
      pod.rotation.x=Math.cos(tt*0.45+ph)*sw*0.7; };
    animated.push(pod);
  }
  return g;
}

/* METAL FORGES — a lava launder carried across the works on brick piers. The
   realm already moves melt along the ground; this is the same job done in the
   air, and it is plumbing rather than a walkway. */
function forgeAqueduct(P,prof,R){
  const g=new THREE.Group();
  /* Set across the river's bearing rather than along it, so the two read as a
     network instead of one line drawn twice. */
  const a=P.seed*0.77+1.3+Math.PI*0.62;
  /* Offset off the origin so the run misses the monument in the middle. */
  const EO=expandOffset(P);
  const ox=-Math.sin(a)*EO, oz=Math.cos(a)*EO;
  const half=Math.min(R-1.0,7.2);
  const dirx=Math.cos(a), dirz=Math.sin(a);
  const y=1.9;
  const brick=mat(P.brick,{rough:0.95}), brick2=mat(P.brick2,{rough:0.95});
  const steel=mat(P.metal,{metal:0.55,rough:0.45});
  const piers=Math.max(3,Math.round(half*2/2.4));
  for(let i=0;i<=piers;i++){
    const u=i/piers, d=lerp(-half,half,u);
    const px=dirx*d+ox, pz=dirz*d+oz;
    if(Math.hypot(px,pz)>R-0.7)continue;
    const gy=tierY(Math.hypot(px,pz))+0.16;
    /* A tapered pier with an arch springing to the next one. */
    const ph=y-gy;
    const pier=meshOf(new THREE.BoxGeometry(0.62,ph,0.5),i%2?brick:brick2);
    pier.position.set(px,gy+ph/2,pz); pier.rotation.y=-a; g.add(pier);
    const cap=meshOf(new THREE.BoxGeometry(0.82,0.16,0.66),brick2);
    cap.position.set(px,y-0.08,pz); cap.rotation.y=-a; g.add(cap);
    if(i<piers){
      const span=half*2/piers;
      const mid=lerp(-half,half,(i+0.5)/piers);
      const arch=meshOf(new THREE.TorusGeometry(span*0.42,0.14,5,12,Math.PI),brick);
      arch.position.set(dirx*mid+ox,y-0.2,dirz*mid+oz);
      arch.rotation.y=-a+Math.PI/2; g.add(arch);
    }
  }
  /* The trough on top, and the melt running through it. */
  const len=half*2;
  const trough=meshOf(new THREE.BoxGeometry(len,0.18,0.72),steel);
  trough.position.set(ox,y+0.09,oz); trough.rotation.y=-a; g.add(trough);
  for(const sd of [-1,1]){
    const wall=meshOf(new THREE.BoxGeometry(len,0.24,0.08),steel,true,false);
    wall.position.set(ox-dirz*sd*0.34,y+0.2,oz+dirx*sd*0.34);
    wall.rotation.y=-a; g.add(wall);
  }
  const melt=meshOf(new THREE.BoxGeometry(len*0.99,0.06,0.5),
    mat(P.lavaHot,{emissive:P.lavaHot,ei:1.7,rough:0.3,flat:false}),false,false);
  melt.position.set(ox,y+0.2,oz); melt.rotation.y=-a; g.add(melt);
  for(let k=0;k<5;k++){
    const fm=new THREE.MeshStandardMaterial({color:P.lava,emissive:P.lava,
      emissiveIntensity:1.9,roughness:0.3,transparent:true,opacity:0.9});
    const cell=meshOf(new THREE.BoxGeometry(0.7,0.07,0.4),fm,false,false);
    cell.rotation.y=-a;
    cell.userData.tick=t=>{
      const u=(t*0.16+k/5)%1, d=lerp(-half,half,u);
      cell.position.set(dirx*d+ox,y+0.24,dirz*d+oz);
      fm.opacity=0.9*Math.min(1,Math.sin(u*Math.PI)*2.4);
    };
    g.add(cell); animated.push(cell);
  }
  return g;
}

/* SHIPYARDS — a crane rail down the quay. Everything the realm builds late is
   plant, and plant runs on rails: it is long, low and horizontal, the opposite
   of a span. */
function shipGantryLine(P,prof,R){
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,7300));
  const a=P.seed*0.31+0.9;
  /* Offset off the origin so the run misses the monument in the middle. */
  const EO=expandOffset(P);
  const ox=-Math.sin(a)*EO, oz=Math.cos(a)*EO;
  const half=Math.min(R-1.4,6.4);
  const dirx=Math.cos(a), dirz=Math.sin(a);
  const steel=mat(P.metal,{metal:0.5,rough:0.45});
  const lattice=mat(P.lattice,{rough:0.78});
  const rail=mat(P.rust,{rough:0.85});
  const gy=()=>tierY(0.1)+0.16;
  /* Two rails, sleepers between them. */
  for(const sd of [-1,1]){
    const rl=meshOf(new THREE.BoxGeometry(half*2,0.12,0.18),rail);
    rl.position.set(ox-dirz*sd*1.5,gy()+0.06,oz+dirx*sd*1.5);
    rl.rotation.y=-a; g.add(rl);
  }
  const sleepers=Math.round(half*2/0.7);
  for(let i=0;i<sleepers;i++){
    const d=lerp(-half,half,(i+0.5)/sleepers);
    const sl=meshOf(new THREE.BoxGeometry(0.22,0.08,3.2),mat(P.wood,{rough:0.94}),false,true);
    sl.position.set(dirx*d+ox,gy()+0.02,dirz*d+oz); sl.rotation.y=-a; g.add(sl);
  }
  /* Two portal cranes straddling the rail, at fixed stations, each with a
     trolley that runs its own beam. */
  const stations=[-half*0.45,half*0.5];
  stations.forEach((d0,idx)=>{
    const cx=dirx*d0+ox, cz=dirz*d0+oz;
    if(Math.hypot(cx,cz)>R-1.2)return;
    const base=tierY(Math.hypot(cx,cz))+0.16;
    const hgt=lerp(3.2,4.2,rnd());
    for(const sd of [-1,1]){
      for(const fw of [-1,1]){
        const lx=cx-dirz*sd*1.5+dirx*fw*0.5, lz=cz+dirx*sd*1.5+dirz*fw*0.5;
        g.add(beam(new THREE.Vector3(lx,base,lz),
                   new THREE.Vector3(cx-dirz*sd*1.35,base+hgt,cz+dirx*sd*1.35),
                   0.08,lattice));
      }
      /* Bogie under each leg. */
      const bg=meshOf(new THREE.BoxGeometry(0.7,0.22,0.4),steel);
      bg.position.set(cx-dirz*sd*1.5,base+0.14,cz+dirx*sd*1.5);
      bg.rotation.y=-a; g.add(bg);
    }
    const beamTop=base+hgt;
    const portal=meshOf(new THREE.BoxGeometry(0.42,0.3,3.4),lattice);
    portal.position.set(cx,beamTop,cz); portal.rotation.y=-a; g.add(portal);
    const truss=meshOf(new THREE.BoxGeometry(0.3,0.16,3.0),rail);
    portal.rotation.y=-a;
    truss.position.set(cx,beamTop+0.36,cz); truss.rotation.y=-a; g.add(truss);
    for(let i=0;i<6;i++){
      const o=lerp(-1.5,1.5,i/5);
      g.add(beam(new THREE.Vector3(cx-dirz*o,beamTop+0.14,cz+dirx*o),
                 new THREE.Vector3(cx-dirz*(o+0.3),beamTop+0.36,cz+dirx*(o+0.3)),
                 0.03,lattice,false));
    }
    /* Trolley and load, running the portal beam. */
    const tr=meshOf(new THREE.BoxGeometry(0.5,0.24,0.5),mat(P.stripe,{rough:0.65}));
    const cab=meshOf(new THREE.CylinderGeometry(0.02,0.02,1,4),steel,false,false);
    const load=meshOf(new THREE.BoxGeometry(0.8,0.4,0.4),
      mat([0xC2453C,0x2E6FA8,0x2FA0A8][idx%3],{rough:0.78}));
    tr.userData.tick=t=>{
      const o=Math.sin(t*0.3+idx*2)*1.35;
      const drop=1.5+Math.sin(t*0.5+idx)*0.9;
      tr.position.set(cx-dirz*o,beamTop-0.14,cz+dirx*o);
      cab.scale.y=drop; cab.position.set(cx-dirz*o,beamTop-0.26-drop/2,cz+dirx*o);
      load.position.set(cx-dirz*o,beamTop-0.26-drop,cz+dirx*o);
      load.rotation.y=-a;
    };
    g.add(tr,cab,load); animated.push(tr);
  });
  /* Container stacks alongside the rail, at fixed stations. */
  const CON=[0xC2453C,0x2E6FA8,0x2FA0A8,0xC9A02E];
  for(let i=0;i<7;i++){
    const d=lerp(-half*0.9,half*0.9,i/6);
    const sd=i%2?1:-1;
    const bx=dirx*d+ox-dirz*sd*2.5, bz=dirz*d+oz+dirx*sd*2.5;
    if(Math.hypot(bx,bz)>R-0.9)continue;
    const by=tierY(Math.hypot(bx,bz))+0.16;
    const stack=1+Math.floor(rnd()*3);
    for(let k=0;k<stack;k++){
      const c=meshOf(new THREE.BoxGeometry(1.5,0.42,0.62),
        mat(CON[Math.floor(rnd()*CON.length)],{rough:0.78}));
      c.position.set(bx,by+0.21+k*0.42,bz);
      c.rotation.y=-a+(rnd()-0.5)*0.1; g.add(c);
    }
  }
  return g;
}

/* BASTION — a raised inner ward. The realm's grammar is concentric, so its late
   growth goes UP THE MIDDLE on a walled motte rather than out across the air. */
function bastionCitadel(P,prof,R){
  const g=new THREE.Group();
  const cr=Math.min(3.0,R*0.3);
  if(cr<1.2)return g;
  const base=tierY(0.1)+0.16, h=1.5;
  /* The motte: a battered drum of ashlar with snow on the crown. */
  const mound=meshOf(new THREE.CylinderGeometry(cr,cr*1.14,h,20),
    mat(P.stone,{rough:0.94}));
  mound.position.y=base+h/2; g.add(mound);
  for(let i=0;i<3;i++){
    const b=meshOf(new THREE.CylinderGeometry(cr*1.02,cr*1.02,0.08,20),
      mat(P.stone2,{rough:0.94}),false,false);
    b.position.y=base+h*(0.24+i*0.26); g.add(b);
  }
  const top=meshOf(new THREE.CylinderGeometry(cr*0.98,cr*0.98,0.12,20),
    mat(P.snow,{rough:1}),false,true);
  top.position.y=base+h+0.06; g.add(top);
  /* Crenellated ring around the ward, with a gap where the ramp arrives. */
  const gate=P.seed*0.4+1.1;
  const n=Math.round(TAU*cr/0.46);
  for(let i=0;i<n;i++){
    const a=i/n*TAU;
    const d=Math.abs(((a-gate+Math.PI)%TAU+TAU)%TAU-Math.PI);
    if(d<0.3)continue;
    const seg=meshOf(new THREE.BoxGeometry(0.22,0.44,cr*TAU/n*1.2),
      mat(i%2?P.stone:P.stone2,{rough:0.94}));
    seg.position.set(Math.cos(a)*cr*0.96,base+h+0.34,Math.sin(a)*cr*0.96);
    seg.rotation.y=-a; g.add(seg);
    if(i%2===0){
      const sn=meshOf(new THREE.BoxGeometry(0.24,0.07,cr*TAU/n*1.24),
        mat(P.snow,{rough:1}),false,false);
      sn.position.set(Math.cos(a)*cr*0.96,base+h+0.59,Math.sin(a)*cr*0.96);
      sn.rotation.y=-a; g.add(sn);
    }
  }
  /* The ramp up to the gap — a stepped stone approach with a low wall. */
  const steps=7;
  for(let i=0;i<steps;i++){
    const u=i/steps;
    const rr=cr*1.05+u*2.0;
    const st=meshOf(new THREE.BoxGeometry(1.3,0.2,0.62),mat(P.stone2,{rough:0.94}));
    st.position.set(Math.cos(gate)*rr,base+h+0.05-u*(h+0.05),Math.sin(gate)*rr);
    st.rotation.y=-gate; g.add(st);
    if(i%2===0){
      const sn=meshOf(new THREE.BoxGeometry(1.32,0.06,0.64),
        mat(P.snow,{rough:1}),false,false);
      sn.position.set(Math.cos(gate)*rr,base+h+0.18-u*(h+0.05),Math.sin(gate)*rr);
      sn.rotation.y=-gate; g.add(sn);
    }
  }
  /* Ward-braziers on the parapet. */
  for(let i=0;i<4;i++){
    const a=gate+Math.PI*0.5+i*Math.PI*0.33;
    const br=meshOf(new THREE.CylinderGeometry(0.13,0.09,0.18,7),
      mat(P.metal,{metal:0.45,rough:0.55}));
    br.position.set(Math.cos(a)*cr*0.82,base+h+0.3,Math.sin(a)*cr*0.82); g.add(br);
    const f=meshOf(new THREE.ConeGeometry(0.11,0.3,6),glowMat(P.warm,2.0),false,false);
    f.position.set(Math.cos(a)*cr*0.82,base+h+0.52,Math.sin(a)*cr*0.82);
    const ph=i*1.4;
    f.userData.tick=t=>{ f.scale.set(1,1+Math.sin(t*6+ph)*0.16,1); };
    g.add(f); animated.push(f);
  }
  return g;
}

/* ARTISAN'S QUARTER — a covered colonnade at STREET level. The realm's density
   is in its streets, so its late growth roofs one over rather than leaving the
   ground at all. */
function quarterArcadeRow(P,prof,R){
  const g=new THREE.Group();
  const a=P.seed*0.53+2.4;
  /* Offset off the origin so the run misses the monument in the middle. */
  const EO=expandOffset(P);
  const ox=-Math.sin(a)*EO, oz=Math.cos(a)*EO;
  /* A street, not a runway. Twelve units of continuous roof read as one pink
     plane lying across the district at this camera angle. */
  const half=Math.min(R-1.2,4.4);
  if(half<2)return g;
  const dirx=Math.cos(a), dirz=Math.sin(a);
  const bays=Math.max(3,Math.round(half*2/1.5));
  const wallM=mat(P.stucco,{rough:0.92,flat:false});
  const trimM=mat(P.stucco3,{rough:0.9});
  const h=1.5;
  for(let i=0;i<=bays;i++){
    const u=i/bays, d=lerp(-half,half,u);
    const px=dirx*d+ox, pz=dirz*d+oz;
    if(Math.hypot(px,pz)>R-0.8)continue;
    const gy=tierY(Math.hypot(px,pz))+0.16;
    for(const sd of [-1,1]){
      const cx=px-dirz*sd*1.05, cz=pz+dirx*sd*1.05;
      const col=meshOf(new THREE.CylinderGeometry(0.12,0.15,h,10),trimM);
      col.position.set(cx,gy+h/2,cz); g.add(col);
      const cap=meshOf(new THREE.BoxGeometry(0.34,0.1,0.34),wallM);
      cap.position.set(cx,gy+h,cz); cap.rotation.y=-a; g.add(cap);
      if(i<bays){
        const span=half*2/bays;
        const mid=lerp(-half,half,(i+0.5)/bays);
        const arc=meshOf(new THREE.TorusGeometry(span*0.42,0.085,5,12,Math.PI),wallM);
        arc.position.set(dirx*mid+ox-dirz*sd*1.05,gy+h,dirz*mid+oz+dirx*sd*1.05);
        arc.rotation.y=-a+Math.PI/2; g.add(arc);
      }
    }
  }
  /* Entablature and one long tiled roof over the whole run. */
  const len=half*2;
  const gy0=tierY(0.1)+0.16;
  for(const sd of [-1,1]){
    const ent=meshOf(new THREE.BoxGeometry(len,0.2,0.34),trimM);
    ent.position.set(ox-dirz*sd*1.05,gy0+h+0.32,oz+dirx*sd*1.05);
    ent.rotation.y=-a; g.add(ent);
  }
  /* Roofed bay by bay rather than in one piece, with a steeper pitch. The
     breaks and the extra rise are what stop it reading as a slab — a single
     continuous plane this long has no silhouette from above at all. */
  for(let i=0;i<bays;i++){
    const d=lerp(-half,half,(i+0.5)/bays);
    const bx=dirx*d+ox, bz=dirz*d+oz;
    if(Math.hypot(bx,bz)>R-0.8)continue;
    const rf=softRoof(2.3,half*2/bays*1.04,0.8,P.rose,{nu:9,nv:2,rough:0.78});
    rf.position.set(bx,gy0+h+0.44,bz); rf.rotation.y=-a+Math.PI/2; g.add(rf);
    const ridge=meshOf(new THREE.BoxGeometry(half*2/bays*1.06,0.09,0.14),
      mat(P.rose2,{rough:0.8}),true,false);
    ridge.position.set(bx,gy0+h+1.24,bz); ridge.rotation.y=-a; g.add(ridge);
  }
  /* Lanterns hung between the arches, and pots along the kerb. */
  for(let i=1;i<bays;i+=2){
    const d=lerp(-half,half,i/bays);
    const lx=dirx*d+ox, lz=dirz*d+oz;
    if(Math.hypot(lx,lz)>R-0.8)continue;
    const lan=meshOf(new THREE.CylinderGeometry(0.1,0.13,0.22,4),
      glowMat(P.warm,1.8),false,false);
    lan.rotation.y=Math.PI/4;
    lan.position.set(lx,gy0+h-0.06,lz); g.add(lan);
  }
  return g;
}

/* ------------------------------------------------------- how a realm grows
   Six realms were running the same growth script: the same three towers, the
   same seven decks braced off the rim, and the same three spans strung between
   the tower tops. Recolouring those is not diversity — at L12 every district in
   the world had the identical skeleton, and the eye reads skeleton before it
   reads material.

   So the LATE GAME is realm data now. Each realm has its own answer to "the
   district has run out of ground, what does it build instead", and no two
   answers are the same kind of structure:

     swarm    SPANS       causeways of floating slabs between the spires
     frame    CANOPY      dwellings hung from the great tree's boughs
     forge    AQUEDUCT    a lava launder on brick piers, crossing the works
     ship     GANTRY      a crane rail down the quay with travelling cranes
     bastion  CITADEL     a raised inner ward on a walled motte, with a ramp
     quarter  ARCADE      a covered colonnaded street at ground level

   Only the swarm builds anything that crosses open air, which is the point: it
   is the sky-garden, and a floating walkway means something there and nothing
   anywhere else. Tower counts and deck counts vary too, because "three towers"
   was as much a fingerprint as the bridges were. */
const GROWTH={
  /* towers: the cap at L12. decks: braced platforms per level, 1-12. */
  swarm:  {towers:5, expand:'spans',    decks:[0,0,0,0,0,0,0,2,3,5,6,7]},
  frame:  {towers:2, expand:'canopy',   decks:[0,0,0,0,0,0,0,1,2,3,4,5]},
  forge:  {towers:4, expand:'aqueduct', decks:[0,0,0,0,0,0,0,1,2,3,3,4]},
  ship:   {towers:3, expand:'gantry',   decks:[0,0,0,0,0,0,0,2,3,4,5,6]},
  bastion:{towers:6, expand:'citadel',  decks:[0,0,0,0,0,0,0,1,1,2,3,3]},
  quarter:{towers:3, expand:'arcade',   decks:[0,0,0,0,0,0,0,2,3,4,5,6]},
};

/* ----------------------------------------------------------------- registry
   One row per realm. `build()` reads only from here, so adding a seventh realm
   is a data change plus its builders — never a change to the growth machinery. */
const KITS={
  swarm:  {house:swarmHouse, tower:swarmTower, hall:swarmHall, plant:swarmPlant,
           feature:swarmFeature, garden:softGarden,
           lamp:(P,r)=>postLamp(P,r,'crystal'), fly:'bird', motes:true},
  frame:  {house:frameHouse, tower:frameTower, hall:frameHall, plant:framePlant,
           feature:frameFeature, garden:frameGarden,
           lamp:(P,r)=>postLamp(P,r,'timber'), fly:'butterfly', motes:true},
  forge:  {house:forgeHouse, tower:forgeTower, hall:forgeHall, plant:forgePlant,
           feature:forgeFeature, garden:forgeGarden,
           lamp:(P,r)=>postLamp(P,r,'cage'), fly:null, motes:true},
  ship:   {house:shipHouse, tower:shipTower, hall:shipHall, plant:shipPlant,
           feature:shipFeature, garden:shipGarden,
           lamp:(P,r)=>postLamp(P,r,'dock'), fly:'gull', motes:false},
  bastion:{house:bastionHouse, tower:bastionTower, hall:bastionHall, plant:bastionPlant,
           feature:bastionFeature, garden:bastionGarden,
           lamp:(P,r)=>postLamp(P,r,'brazier'), fly:'raven', motes:false},
  quarter:{house:quarterHouse, tower:quarterTower, hall:quarterHall, plant:quarterPlant,
           feature:quarterFeature, garden:quarterGarden,
           lamp:(P,r)=>postLamp(P,r,'scroll'), fly:'dove', motes:true},
};

/* The frameworks are the one realm whose landform claims the centre — the Great
   Tree stands there for the life of the plot — so their monument is placed off
   it, at a fixed bearing and radius like everything else. */
const SIG_AT={frame:{r:3.2,a:2.1}};

/* How much ground each monument actually covers. Everything used to claim a
   flat 2.4, which is roughly right for an obelisk and nowhere near right for a
   drydock with a hull in it (4.4 long), a gantry crane (4.6 span) or a market
   row (5.4 wide) — so houses, trees and lamps were placed straight through the
   biggest object in the district. Measured off each builder's own extents. */
const SIG_R={
  obelisk:1.8, orrery:1.9, aqueduct:3.0,
  roost:2.2,   conduit:2.2, wardring:2.1, coil:2.0,
  loom:2.0,    greenhouse:2.9, canopywalk:3.0, wellspring:2.2,
  bigwheel:2.6, crucible:2.0,  pipeorgan:2.0, anvilyard:2.6,
  drydock:3.1, crane:3.2,      lighthouse:1.6, containers:3.4,
  keep:2.8,    vault:2.4,      watchfire:2.6,
  clocktower:1.5, market:3.4,  workshop:3.0,  library:2.6,
};

/* And the same for the late-game structure: a footprint the town has to respect.
   Line-shaped ones (aqueduct, gantry, arcade) are claimed as a chain of discs
   along their run, and all three are pushed OFF the centre so they stop cutting
   through the monument standing there — the C/C++ aqueduct ran clean through
   the great wheel because both were centred on the origin. */
const EXPAND_W=1.7;        // half-width a line structure keeps clear
/* The offset cannot be a constant: it has to clear whatever monument is
   standing in the middle, and those run from a 1.5 clocktower to a 3.4 market
   row. A flat 3.4 still put the artisan's arcade through its own guild hall. */
const expandOffset=P=>Math.max(3.4,(SIG_R[P.sig]??2.4)+EXPAND_W+0.7);

/* ================================================================== build */
/* Lattice populations are module constants, not level-derived: the lattice has
   to be the SAME lattice at every level or slot 7 stops meaning slot 7.
   They are generous on purpose — a slot only becomes a building if it is inside
   the coast, under the fill threshold AND clear of everything already placed. */
const POP={cot:78,tree:130,feat:80,lamp:64,garden:80,rock:110,tuft:1400,flower:900};
const RISE=0.5;                            // how long new land takes to come up

/* A deck is pinned to the coastline of the level it was BUILT at and stays there
   while the island grows past it — old coast decks end up as balconies over the
   lower terraces, which is a better story than chasing the rim outward. */
function canBirthR(decks,i){
  for(let L=1;L<=12;L++) if(decks[L-1]>i) return spec(L).radius;
  return RMAX;
}


/* ############################################################################
   ############################  T H E   W O R L D  ###########################
   ############################################################################

   Everything above this line is the ART — the procedural vocabulary the concept
   bench locked, unchanged. Everything below is the WORLD: reading a real user's
   export, giving every district a plot, and letting you walk the whole thing.

   Four questions the lab never had to answer:

   1. WHERE DOES A DISTRICT GO?  Tangent circle packing in founding order —
      every new territory is placed against what is already on the map, pulled
      toward its own realm's centre of mass, and nothing already placed ever
      moves. That gives realms as quarters without fencing them off, and it
      makes the finished map ONE landmass: the whole thing is connected by
      construction, because every circle touches something.

      Nothing is reserved. A territory is exactly the district's current land
      plus a verge for its border, so a world with three small districts is a
      small, completely filled place rather than a mostly-blank board. The
      ground is a fine hex grid and every cell goes to whichever district it
      sits deepest inside; the union of owned cells IS the continent, and the
      borders are the cell edges where the owner changes.

   2. HOW DOES FORTY DISTRICTS' WORTH OF GEOMETRY RUN?  A finished district is
      ~1,200 meshes; forty of those is a slideshow, not a scene. So each one is
      merged by material the moment its build animation ends — ~30 draw calls
      instead of ~1,200 — and only the districts you are actually looking at
      keep their per-object motion.

   3. WHAT DO YOU READ AT WHICH ZOOM?  Labels are HTML and re-tier on a
      district's APPARENT size. Far out: realm names and the few districts that dominate.
      Leaning in: names, then level, then article counts, then heraldry. Every
      tie is broken by how much you read there, so the loud parts of the world
      are the parts that keep their names.

   4. WHAT DID IT LOOK LIKE THEN?  `growth` is an append-only log of articles
      per niche per day — enough to reconstruct every level of every district on
      every day. The replay walks it forward: districts are founded, land rises,
      levels tick over. Nothing is ever removed, because the data has no way to
      express removal.
   ########################################################################## */

const clock=new THREE.Clock();
const hexs=v=>'#'+v.toString(16).padStart(6,'0');
const fmt=n=>n.toLocaleString('en-US');
/* Half the userbase owns a district with exactly one article in it, so the
   plural is not a detail here — it is the median label. */
const arts=n=>fmt(n)+(n===1?' article':' articles');

/* --------------------------------------------------------- the ground grid */
/* Flat-top hexes, and SMALL ones: a cell is a unit of territory, not a plot.
   A district claims as many cells as its land actually needs, so there is no
   reserved emptiness anywhere on the map — which is the whole point. A world
   whose plots are sized for an L12 island is a mostly-blank board for everyone
   who is not a four-year veteran, and the people most likely to share a world
   are the ones who just made one. */
const HC  = 2.9;                        // cell circumradius
const DIRS=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];   // ordered by bearing
const hexXZ=(q,r)=>[1.5*HC*q, Math.sqrt(3)*HC*(r+q/2)];
const hexKey=(q,r)=>q+','+r;
const hexCorner=k=>[Math.cos(k*Math.PI/3)*HC, Math.sin(k*Math.PI/3)*HC];
/* World point -> the cell that contains it. Cube rounding, the standard trick;
   this is the whole of the picking system — no raycast, no colliders. */
function hexAt(x,z){
  const q=(2/3)*x/HC, r=(-x/3+Math.sqrt(3)/3*z)/HC;
  const cx=q, cz=r, cy=-cx-cz;
  let rx=Math.round(cx), ry=Math.round(cy), rz=Math.round(cz);
  const dx=Math.abs(rx-cx), dy=Math.abs(ry-cy), dz=Math.abs(rz-cz);
  if(dx>dy&&dx>dz) rx=-ry-rz; else if(dy>dz) ry=-rx-rz; else rz=-rx-ry;
  return [rx,rz];
}

/* A district's territory is its land plus a verge for the border to live in.
   It tracks the CURRENT level, so a district that has been read once owns one
   district's worth of ground and not an acre more. */
const TERR_PAD = 4.0;    // land + the verge the border and the open ground live in
const PACK     = 0.92;   // packed at 92% so territories overlap and the land connects
const terrR    = level=>spec(level).radius+TERR_PAD;
const LAND_TOP = 0;
const WATER_Y  = -0.9;   // the harbour realm's ground is a flooded basin

/* ====================================================================== data */
let W=null;                 // the loaded world model

/* ==================================================================== layout */
/* Tangent circle packing, in founding order, so it stays deterministic and
   append-only: the k-th district you found is placed against everything already
   on the map and nothing already on the map moves. Placement is scored on
   distance to its own realm's centre of mass first and the world's origin
   second, so realms come out as quarters without ever being fenced off — every
   new circle is tangent to something, which is what makes the finished map ONE
   landmass instead of six islands.

   Radii come from each district's FINAL level, so positions never shift as the
   replay runs; only the territory drawn around them grows. */
function packAt(placed,r,score){
  const cands=[];
  for(const a of placed){
    const d=a.r+r;
    for(let k=0;k<96;k++){ const th=k/96*TAU;
      cands.push([a.x+Math.cos(th)*d, a.y+Math.sin(th)*d]); }
  }
  for(let i=0;i<placed.length;i++) for(let j=i+1;j<placed.length;j++){
    const A=placed[i], B=placed[j];
    const dx=B.x-A.x, dy=B.y-A.y, dd=Math.hypot(dx,dy);
    const r1=A.r+r, r2=B.r+r;
    if(dd<1e-6||dd>r1+r2||dd<Math.abs(r1-r2))continue;
    const aa=(r1*r1-r2*r2+dd*dd)/(2*dd), hh=Math.sqrt(Math.max(0,r1*r1-aa*aa));
    const mx=A.x+aa*dx/dd, my=A.y+aa*dy/dd, ux=-dy/dd*hh, uy=dx/dd*hh;
    cands.push([mx+ux,my+uy],[mx-ux,my-uy]);
  }
  let best=null;
  for(const [x,y] of cands){
    let ok=true;
    for(const a of placed) if(Math.hypot(x-a.x,y-a.y)<a.r+r-1e-4){ ok=false; break; }
    if(!ok)continue;
    const sc=score(x,y);
    if(!best||sc<best.sc-1e-9) best={x,y,sc};
  }
  return best;
}

/* Group the districts into realms, in the order you first read each realm. */
function layout(w){
  const byRealm=new Map();
  for(const d of w.districts){
    d.rt=terrR(levelOf(d.articles));
    if(!byRealm.has(d.realm.id)) byRealm.set(d.realm.id,{realm:d.realm,list:[]});
    byRealm.get(d.realm.id).list.push(d);
  }
  w.quarters=[...byRealm.values()].sort((a,b)=>
    a.list[0].first<b.list[0].first?-1:a.list[0].first>b.list[0].first?1:0);
  for(const q of w.quarters){
    q.i=w.quarters.indexOf(q);
    q.total=q.list.reduce((s,d)=>s+d.articles,0);
    /* A realm wears its biggest district's accent: your Frameworks are
       JS-yellow because JS is what you actually read there. */
    q.top=[...q.list].sort((a,b)=>b.articles-a.articles)[0];
    q.P=paletteOf(q.realm,q.top.niche);
    q.level=0; q.shown=0;
  }
  layoutRealms(w);
  for(const q of w.quarters) layoutQuarter(q);
}

/* THE WORLD: realm islands, packed tangent in the order the realms were first
   read. An archipelago, not a continent — six landmasses is the only way six
   realms read as six PLACES, and the sky between them is what gives the world a
   silhouette you can take in at a glance. */
function layoutRealms(w){
  const placed=[];
  for(const q of w.quarters){
    q.rr=spec(Math.max(1,realmLevelOf(q.total))).radius+3.2;
    if(!placed.length){ q.x=0; q.z=0; placed.push({x:0,y:0,r:q.rr}); continue; }
    const best=packAt(placed,q.rr,(x,y)=>Math.hypot(x,y))||{x:0,y:0};
    q.x=best.x; q.z=best.y; placed.push({x:best.x,y:best.y,r:q.rr});
  }
  let mx=0,mz=0;
  for(const q of w.quarters){ mx+=q.x; mz+=q.z; }
  mx/=w.quarters.length; mz/=w.quarters.length;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const q of w.quarters){
    q.x-=mx; q.z-=mz;
    /* Bounds from the island itself, not the packing radius: the padding exists
       to keep islands apart, and framing to it leaves a ring of empty sky. */
    const R=spec(Math.max(1,realmLevelOf(q.total))).radius+3;
    x0=Math.min(x0,q.x-R); x1=Math.max(x1,q.x+R);
    z0=Math.min(z0,q.z-R); z1=Math.max(z1,q.z+R);
  }
  w.worldBounds={x0,x1,z0,z1};
  w.worldSpan=Math.max(x1-x0,z1-z0);
}

/* A REALM: its districts packed tangent inside it, in founding order, centred on
   the origin. This is the view where borders and district identity matter, so
   here the land is one connected ground with the plot lines inscribed on it. */
function layoutQuarter(q){
  const placed=[];
  for(const d of q.list){
    const r=d.rt*PACK;
    if(!placed.length){ d.x=0; d.z=0; placed.push({x:0,y:0,r}); continue; }
    const best=packAt(placed,r,(x,y)=>Math.hypot(x,y))||{x:0,y:0};
    d.x=best.x; d.z=best.y; placed.push({x:best.x,y:best.y,r});
  }
  let mx=0,mz=0;
  for(const d of q.list){ mx+=d.x; mz+=d.z; }
  mx/=q.list.length; mz/=q.list.length;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const d of q.list){
    d.x-=mx; d.z-=mz;
    x0=Math.min(x0,d.x-d.rt); x1=Math.max(x1,d.x+d.rt);
    z0=Math.min(z0,d.z-d.rt); z1=Math.max(z1,d.z+d.rt);
  }
  q.bounds={x0,x1,z0,z1};
  q.span=Math.max(x1-x0,z1-z0);
  q.medRt=q.list.map(d=>d.rt).sort((a,b)=>a-b)[Math.floor(q.list.length/2)];
}

/* ================================================================== the land */
/* One landmass, not forty plots. Every cell in reach of a district goes to the
   district whose territory it sits deepest inside (`|p-c| / r`, so a big
   district keeps a big share), and the union of those cells IS the continent.
   Because the packing leaves every territory tangent to another and the
   territories are drawn 10% wider than they were packed, the owned cells always
   touch — realms included. There is no gap to fall through and nothing is
   reserved. */
function ownership(){
  const live=(OPEN?OPEN.list:[]).filter(d=>d.built);
  if(!live.length) return {own:new Map(),cells:new Map()};
  for(const d of live) d.tr=terrR(d.level);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const d of live){ x0=Math.min(x0,d.x-d.tr); x1=Math.max(x1,d.x+d.tr);
                        z0=Math.min(z0,d.z-d.tr); z1=Math.max(z1,d.z+d.tr); }
  const own=new Map(), cells=new Map();
  for(const d of live) cells.set(d.i,[]);
  const q0=Math.floor(x0/(1.5*HC))-1, q1=Math.ceil(x1/(1.5*HC))+1;
  const rowH=Math.sqrt(3)*HC;
  const free=[];
  for(let q=q0;q<=q1;q++){
    const r0=Math.floor(z0/rowH-q/2)-1, r1=Math.ceil(z1/rowH-q/2)+1;
    for(let r=r0;r<=r1;r++){
      const [x,z]=hexXZ(q,r);
      let best=null,bw=Infinity;
      for(const d of live){
        const w2=Math.hypot(x-d.x,z-d.z)/d.tr;
        if(w2<bw){ bw=w2; best=d; }
      }
      if(bw<=1){ own.set(hexKey(q,r),best.i); cells.get(best.i).push([q,r,x,z]); }
      else free.push([q,r,x,z,best]);
    }
  }
  /* Three tangent territories can leave a pinhole between them. Anything the
     outside cannot reach is inside the continent, so it gets an owner rather
     than a window. */
  const freeSet=new Map(); free.forEach((c,i)=>freeSet.set(hexKey(c[0],c[1]),i));
  const seen=new Set(), stack=[];
  for(const c of free){
    if(c[0]===q0||c[0]===q1) { stack.push(hexKey(c[0],c[1])); }
  }
  for(const c of free){
    let edge=false;
    for(const [dq,dr] of DIRS)
      if(!freeSet.has(hexKey(c[0]+dq,c[1]+dr))&&!own.has(hexKey(c[0]+dq,c[1]+dr))) edge=true;
    if(edge) stack.push(hexKey(c[0],c[1]));
  }
  while(stack.length){
    const k=stack.pop(); if(seen.has(k))continue; seen.add(k);
    const [q,r]=k.split(',').map(Number);
    for(const [dq,dr] of DIRS){
      const nk=hexKey(q+dq,r+dr);
      if(freeSet.has(nk)&&!seen.has(nk)) stack.push(nk);
    }
  }
  for(const c of free){
    const k=hexKey(c[0],c[1]);
    if(seen.has(k))continue;
    own.set(k,c[4].i); cells.get(c[4].i).push([c[0],c[1],c[2],c[3]]);
  }
  return {own,cells};
}

/* Chain boundary edges into closed loops. Emitted corner-to-corner walking each
   cell counter-clockwise, so the loops come out CCW around the land. */
function chainLoops(edges){
  const K=(x,z)=>Math.round(x*64)+','+Math.round(z*64);
  const from=new Map();
  for(const e of edges){ const k=K(e[0],e[1]);
    if(!from.has(k))from.set(k,[]); from.get(k).push(e); }
  const used=new Set(), loops=[];
  for(const e0 of edges){
    if(used.has(e0))continue;
    const loop=[]; let e=e0;
    while(e&&!used.has(e)){
      used.add(e); loop.push([e[0],e[1]]);
      e=(from.get(K(e[2],e[3]))||[]).find(x=>!used.has(x));
    }
    if(loop.length>2) loops.push(loop);
  }
  return loops;
}

const landRoot=new THREE.Group();
/* The land is never merged — freeze/mergeStatic only ever runs on a district's
   town or a realm's island — so anything animated down here needs its own
   channel to be ticked from. */
let landTicks=[];
let landDirty=false, booting=true;
/* Bumped by everything that raises, hides or re-levels a place. The label
   solver reads those (a plate clears its own island, and the radius it clears
   comes off the level), and they can move without the day moving — the throttled
   realm refresh does exactly that. */
let worldVer=0;
function buildLand(){
  landDirty=false;
  landTicks=[];
  const t0=performance.now();
  /* Dispose by hand: disposeGroup rebuilds a Set of every cached material on
     every call, and the land is forty groups deep. */
  landRoot.traverse(o=>{ if(o.isMesh) o.geometry.dispose(); });
  landRoot.clear();
  const {own,cells}=ownership();
  W.own=own;
  if(!own.size)return;

  const outer=[];                       // continent edge, for the skirt
  const push=(arr,ax,ay,az,bx,by,bz,cx2,cy2,cz2)=>arr.push(ax,ay,az,bx,by,bz,cx2,cy2,cz2);

  for(const d of W.districts){
    const mine=cells.get(d.i); if(!mine||!mine.length)continue;
    const P=d.P, ship=P.kit==='ship';
    const capY=ship?WATER_Y-0.55:LAND_TOP;
    const cap=[], edge=[], realmEdge=[], wfoam=[];
    for(const [q,r,x,z] of mine){
      /* top face, as a fan of six triangles */
      for(let k=0;k<6;k++){
        const j=(k+1)%6, c1=hexCorner(k), c2=hexCorner(j);
        push(cap, x,capY,z, x+c2[0],capY,z+c2[1], x+c1[0],capY,z+c1[1]);
      }
      for(let k=0;k<6;k++){
        const nb=own.get(hexKey(q+DIRS[k][0],r+DIRS[k][1]));
        if(nb===d.i)continue;
        const j=(k+1)%6, c1=hexCorner(k), c2=hexCorner(j);
        const a=[x+c1[0],z+c1[1]], b=[x+c2[0],z+c2[1]];
        /* Inset toward the cell centre so the two sides of a border each draw
           their own half and the line reads as a shared boundary. */
        const ins=(pt,t)=>[pt[0]+(x-pt[0])*t, pt[1]+(z-pt[1])*t];
        const t0=0.07, t1=0.07+1.05/HC;
        const o1=ins(a,t0), o2=ins(b,t0), i1=ins(a,t1), i2=ins(b,t1);
        push(edge, o1[0],0,o1[1], i1[0],0,i1[1], i2[0],0,i2[1]);
        push(edge, o1[0],0,o1[1], i2[0],0,i2[1], o2[0],0,o2[1]);
        const other=nb===undefined?null:W.districts[nb];
        if(!other||other.realm!==d.realm){
          const s0=0.07+1.05/HC, s1=s0+1.30/HC;
          const p1=ins(a,s0), p2=ins(b,s0), r1=ins(a,s1), r2=ins(b,s1);
          push(realmEdge, p1[0],0,p1[1], r1[0],0,r1[1], r2[0],0,r2[1]);
          push(realmEdge, p1[0],0,p1[1], r2[0],0,r2[1], p2[0],0,p2[1]);
        }
        if(nb===undefined) outer.push([a[0],a[1],b[0],b[1]]);
        /* A band inset from the harbour's own boundary: this is the line where
           the basin stops, whether what stops it is the next district's land or
           open sky at the atoll's rim. */
        if(ship&&FX.water){
          const f0=ins(a,0.02), f1=ins(b,0.02);
          const g0=ins(a,0.02+0.9/HC), g1=ins(b,0.02+0.9/HC);
          push(wfoam, f0[0],0,f0[1], g0[0],0,g0[1], g1[0],0,g1[1]);
          push(wfoam, f0[0],0,f0[1], g1[0],0,g1[1], f1[0],0,f1[1]);
        }
      }
    }
    const g=new THREE.Group(); g.userData.district=d.i;
    const capCol=new THREE.Color(P.ground).lerp(new THREE.Color(P.accent),0.13).getHex();
    g.add(meshOf(flatUp(cap),mat(capCol,{rough:0.99}),false,true));
    if(ship){
      const wcap=[];
      /* Subdivided when the water is meant to move: one triangle per hex sixth
         has nothing between its corners to lift, so the whole basin would tilt
         in slabs instead of rippling. */
      const div=FX.water?3:1;
      for(const [q,r,x,z] of mine) for(let k=0;k<6;k++){
        const j=(k+1)%6, c1=hexCorner(k), c2=hexCorner(j);
        for(let a=0;a<div;a++) for(let b=0;b<div-a;b++){
          const P0=(u,v)=>[x+(c2[0]*u+c1[0]*v)/div, WATER_Y, z+(c2[1]*u+c1[1]*v)/div];
          push(wcap,...P0(a,b),...P0(a+1,b),...P0(a,b+1));
          if(a+b<div-1) push(wcap,...P0(a+1,b),...P0(a+1,b+1),...P0(a,b+1));
        }
      }
      const wg=flatUp(wcap); if(FX.vc) bakeVC(wg);
      const wm=new THREE.Mesh(wg,mat(P.water,{opacity:0.88,rough:0.12,
        metal:0.15,flat:!!FX.water,emissive:P.water,ei:0.18}));
      g.add(wm);
      if(FX.water){
        const wb=wg.attributes.position.array.slice();
        wm.userData.tick=t=>{
          const p=wg.attributes.position;
          for(let i=0;i<p.count;i++) p.setY(i,WATER_Y+waveY(wb[i*3],wb[i*3+2],t,0.10));
          p.needsUpdate=true;
        };
        landTicks.push(wm);
        /* Foam where the basin meets its own shore. */
        if(wfoam.length){
          const fm=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,
            opacity:0.3,depthWrite:false,side:THREE.DoubleSide});
          const fmesh=new THREE.Mesh(flatUp(wfoam),fm);
          fmesh.position.y=WATER_Y+0.035; fmesh.renderOrder=2; g.add(fmesh);
          fmesh.userData.tick=t=>{ fm.opacity=0.24+Math.sin(t*1.7)*0.10; };
          landTicks.push(fmesh);
        }
      }
    }
    const bm=new THREE.MeshBasicMaterial({color:P.accent,transparent:true,
      opacity:0.46,depthWrite:false});
    const bmesh=new THREE.Mesh(flatUp(edge),bm);
    bmesh.position.y=capY+0.05; bmesh.renderOrder=3; g.add(bmesh); d.borderMat=bm;
    if(realmEdge.length){
      const rm=new THREE.MeshBasicMaterial({color:d.realm.accent,transparent:true,
        opacity:0.72,depthWrite:false});
      const rmesh=new THREE.Mesh(flatUp(realmEdge),rm);
      rmesh.position.y=capY+0.045; rmesh.renderOrder=2; g.add(rmesh);
      d.realmBorderMat=rm;
    }
    landRoot.add(g);
  }

  /* The coast, and the mass hanging under it. The cliff row follows the cell
     edges exactly so it meets the ground with no seam; everything below is
     relaxed first, so the continent's underside is a landmass rather than a
     zig-zag of hexagons. */
  const loops=chainLoops(outer);
  /* Depth is per LOOP, not per world. Early in a replay the land is a handful
     of separate outposts, and a depth taken from the finished world's span hung
     an eighty-unit icicle under each five-unit island. */
  const cliff=[], root=[];
  const quad=(arr,A,ai,B,bi,aj,bj)=>{
    arr.push(A.p[ai][0],A.y,A.p[ai][1], B.p[bj][0],B.y,B.p[bj][1], B.p[bi][0],B.y,B.p[bi][1]);
    arr.push(A.p[ai][0],A.y,A.p[ai][1], A.p[aj][0],A.y,A.p[aj][1], B.p[bj][0],B.y,B.p[bj][1]);
  };
  for(const loop of loops){
    if(loop.length<6)continue;
    let cx=0,cz=0; for(const p of loop){ cx+=p[0]; cz+=p[1]; }
    cx/=loop.length; cz/=loop.length;
    let rad=0; for(const p of loop) rad=Math.max(rad,Math.hypot(p[0]-cx,p[1]-cz));
    const depth=clamp(rad*0.85,5,92);
    /* The cliff is a fixed human height — a fraction of the continent put a
       fourteen-unit wall of serrated hexagons around a world whose tallest
       tower is eight. Only the mass below it scales. */
    const CLIFF_H=Math.min(3.4,depth*0.5);
    const smooth2=relax(loop,7,0.55);
    const shape=(src,sc,y)=>({p:src.map(pt=>[cx+(pt[0]-cx)*sc, cz+(pt[1]-cz)*sc]),y});
    const R=[ shape(loop,1,0), shape(loop,0.997,-CLIFF_H),
              shape(smooth2,0.96,-CLIFF_H-depth*0.24),
              shape(smooth2,0.78,-CLIFF_H-depth*0.55),
              shape(smooth2,0.42,-CLIFF_H-depth*0.82),
              shape(smooth2,0.12,-CLIFF_H-depth) ];
    const n=loop.length;
    for(let i=0;i<R.length-1;i++){
      const A=R[i], B=R[i+1], arr=i<2?cliff:root;
      for(let k=0;k<n;k++) quad(arr,A,k,B,k,(k+1)%n,(k+1)%n);
    }
    const L=R[R.length-1];
    for(let k=0;k<n;k++){ const j=(k+1)%n;
      root.push(L.p[k][0],L.y,L.p[k][1], L.p[j][0],L.y,L.p[j][1], cx,-CLIFF_H-depth*1.2,cz); }
  }
  /* Two values, not one: a cliff under the turf and a darker root under that.
     Both come from the OPEN realm's own palette — a hardcoded sandstone cliff
     put the Bastion's snow fortress on a warm beige crag and undid half of what
     the realm's colours are for. */
  const RP=OPEN?OPEN.P:W.quarters[0].P;
  /* The coast and the mass under it: ground, so neither casts. Inside a realm
     the cliff is the outer wall of the whole continent — the only thing beyond
     it is sky, and the only thing its shadow ever landed on was itself. */
  if(cliff.length) landRoot.add(meshOf(flat(cliff),
    mat(mixTok(RP.cliff,RP.cliff2,0.35),{rough:0.96}),false,false));
  if(root.length) landRoot.add(meshOf(flat(root),
    mat(mixTok(RP.rock,T.pepper60,0.30),{rough:1}),false,false));
  paintBorders();
  landMs=performance.now()-t0;
}
let landMs=0;
/* Neighbour averaging, in place and without changing the point count, so a
   relaxed row still pairs up with the row above it. */
function relax(pts,k,amt){
  let a=pts.map(p=>[p[0],p[1]]);
  for(let it=0;it<k;it++){
    const n=a.length;
    a=a.map((p,i)=>{
      const b=a[(i-1+n)%n], c=a[(i+1)%n];
      return [p[0]+((b[0]+c[0])/2-p[0])*amt, p[1]+((b[1]+c[1])/2-p[1])*amt];
    });
  }
  return a;
}
/* Raw triangle soup -> a drawable geometry, normals computed. */
function flat(pos){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals();
  return g;
}
/* The same, for the ground: every one of those triangles faces straight up, so
   computing normals for a hundred thousand vertices is work with a known
   answer — and it was most of the cost of redrawing the land. */
function flatUp(pos){
  const g=new THREE.BufferGeometry();
  const n=new Float32Array(pos.length);
  for(let i=1;i<n.length;i+=3) n[i]=1;
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.BufferAttribute(n,3));
  return g;
}

/* =================================================================== islands */
/* `build()` from the lab, opened up. One function builds both scales:

     a DISTRICT — the lab island, minus its private keel and its private sea,
       because it stands on the realm's ground rather than alone in the sky;
     a REALM    — the same island built at the realm's own level, WITH its keel,
       carrying one signature monument per member district instead of one at
       the middle. The skyline of a realm is literally made of its districts:
       DATA ENG's aqueduct and PYTHON's serpent stair both stand on the Swarm.

   Everything else — the ring grid, the terraces, the realm's landform, its
   architectural kit, its liquid, its life — is the same code at both scales,
   which is the whole reason the world view can look as good as the lab does. */
function buildIsland(P,level,opt){
  const out=new THREE.Group();
  const sp=spec(level), R=sp.radius, K=KITS[P.kit];
  const prof=profile(P.seed,30,0.13);
  const nodes=[];
  const node=(o2,o3)=>nodes.push({obj:o2,mode:o3.mode,delay:o3.delay||0,done:false});
  const carry=opt.carry, prevR=carry?opt.prevR:0, prevKeys=carry?opt.prevKeys:new Set();
  const isNew=r=>r>prevR+1e-6;
  /* Boats ride whatever waterline this island has: the flooded ground under a
     harbour district, or the open sea under the whole realm. */
  SEA_Y=tierY(R-1e-6)+(opt.keel?-0.5:WATER_Y);
  /* Reset the smoke allowance for this island. Whatever asks first gets it —
     signature monument, then halls, then towers, then houses in placement
     order — which is also the order of importance, so the plumes land on the
     buildings worth looking at. */
  smokeBudget=P.kit==='forge'?9:5;

  const oldLand=new THREE.Group(), newLand=new THREE.Group();
  newLand.userData.key='newland'; out.add(oldLand,newLand);
  const landOf=r=>isNew(r)?newLand:oldLand;
  if(carry) node(newLand,{mode:'rise'});

  for(let j=0;j<sp.rings;j++) landOf((j+1)*RING_W).add(buildRing(P,prof,j));

  /* A realm floats; a district stands on the realm's ground and needs no keel. */
  if(opt.keel){
    /* THE UNDERSIDE IS REALM IDENTITY — crystal stalactites, wrapped roots,
       basalt columns, wet crag, icicles, a clay boulder. It hangs BELOW the
       island it belongs to, so everything it could ever shadow is another realm
       entirely, and it is the part that reads at share-card size. */
    const keel=KEELS[P.keel](P,prof,R,R*0.95+1.2,P.seed+1);
    keel.position.y=tierY(R-1e-6)-RING_T; keel.userData.key='keel'; out.add(keel);
    node(keel,{mode:carry&&prevKeys.has('keel')?'keep':'build',delay:0});

    /* A HARBOUR REALM GETS ITS OWN SEA. The harbour basins are cut into the
       deck at district scale; out here the realm is a lone island and its boats
       orbit at 1.12 to 1.34 of the radius reading SEA_Y for their waterline —
       which without this left them sailing in open sky, circling a rock.

       An annulus, not a disc: it follows the island's own wobbled profile so the
       shoreline sits against the actual coast rather than a circle that cuts
       through it, and the middle is left out because the island is standing in
       it. Outer radius clears the widest boat orbit with room to spare. */
    if(P.kit==='ship'){
      const R0=R*0.94, R1=R*1.22, sea=seaRing(prof,R0,R1,3);
      if(FX.vc) bakeVC(sea);
      const sm=new THREE.Mesh(sea,mat(P.water,{opacity:0.88,rough:0.12,metal:0.15,
        flat:!!FX.water,emissive:P.water,ei:0.18}));
      sm.position.y=SEA_Y; sm.userData.key='sea';
      /* Kept out of the merge: it is one of the few things in a realm that
         genuinely moves, and the wave is a vertex animation. */
      sm.userData.keep=true;
      /* ALWAYS animated, not gated behind FX.water — that switch decides whether
         water is faceted, not whether the sea is a still pond. A harbour realm
         with a motionless bay reads as glass.

         Three crossing swells, phased on WORLD x/z so the surface never tears
         at a seam, with t inside the sine so the crests move across the bay
         rather than bobbing in place. Under flat shading each facet catches the
         sun at a different angle as a crest passes under it, and THAT is what
         reads as flow — the vertical displacement is under two tenths of a unit.

         LONG and SLOW on purpose. Wavelengths of about four units on a bay four
         units wide put a whole crest inside every facet: the surface came out as
         small fast polygonal chop, which reads as a mesh glitching rather than
         as water. These are 15 to 30 units from crest to crest and drift at a
         fraction of that speed, so the facets change gradually and the whole bay
         swells instead of stuttering. Longer waves also mean less radial detail
         is needed, hence 3 bands. */
      const base=sea.attributes.position.array.slice();
      sm.userData.tick=t=>{
        const p=sea.attributes.position;
        for(let i=0;i<p.count;i++){
          const x=base[i*3], z=base[i*3+2];
          p.setY(i, Math.sin(x*0.42 - t*0.40)*0.155
                  + Math.sin(z*0.31 - t*0.29)*0.110
                  + Math.sin((x+z)*0.20 - t*0.19)*0.075);
        }
        p.needsUpdate=true;
        /* The facets re-catch the light on their own: under flat shading the
           shader takes the normal from screen-space derivatives and never reads
           the attribute, which is why the pond animates without this. Kept
           behind the flag so a smooth-shaded sea would still get normals, but at
           FX.water this was rebuilding 1600 of them a frame for nothing. */
        if(!FX.water) sea.computeVertexNormals();
      };
      animated.push(sm);
      out.add(sm);
      node(sm,{mode:carry&&prevKeys.has('sea')?'keep':'build',delay:0});
    }
  }

  /* ---- the realm's landform -------------------------------------------- */
  /* Terrain exists at L1; props do not. This is what makes a one-article plot
     say which world it is in before a single building is placed.

     BARE means nothing was built here — the unbuilt world is the six realms as
     ground waiting on somebody's reading. Rock, shards, roots, a lava vent and
     a harbour basin are the land; a ring-wall and a paved square are things
     somebody put up, so those two wait. */
  /* THE LANDFORM OWNS ITS GROUND, and has to say so. A form is built before
     anything is placed, so a basin, a lava vent, a paved square or a ring-wall
     is invisible to the placement below unless it hands its footprint over —
     which is how houses ended up standing in the harbour and inside the
     fortress walls. Two shapes: a disc, in `claims` on the group, and a RADIUS
     BAND for a wall, which is the honest shape for a thing that runs all the
     way round the island at a fixed radius. */
  const claims=[], bands=[];
  const form=g2=>{ if(g2.userData.claims) claims.push(...g2.userData.claims); return g2; };
  if(P.form==='shards'){
    const w=swarmShards(P,prof,R,sp); w.userData.key='form'; out.add(w);
    node(w,{mode:carry&&prevKeys.has('form')?'keep':'build',delay:0.3});
  }
  if(P.form==='lavavent'){
    const v=form(forgeVeins(P,prof,R,sp)); v.userData.key='form'; out.add(v);
    node(v,{mode:carry&&prevKeys.has('form')?'keep':'build',delay:0.3});
  }
  if(P.form==='basins'){
    const s=form(shipHarbour(P,prof,R)); s.userData.key='form'; out.add(s);
    node(s,{mode:carry&&prevKeys.has('form')?'keep':'build',delay:0.1});
  }
  if(P.form==='square'&&!opt.bare){
    const q=form(quarterSquare(P,prof,R)); q.userData.key='form'; out.add(q);
    node(q,{mode:carry&&prevKeys.has('form')?'keep':'build',delay:0.2});
  }
  if(P.form==='ramparts'&&!opt.bare){
    for(let k=0;k<TIER_R.length;k++){
      const b=TIER_R[k]; if(b>=R)continue;
      const key='ramp'+k;
      const w=buildRampart(P,prof,b,tierY(b-1e-6),hash2(P.seed,15000+k));
      w.userData.key=key; out.add(w); bands.push(b);
      node(w,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:isNew(b)?RISE:0.05});
    }
    /* And the coast gets the outermost wall — the district is walled to the
       water's edge, which is the whole point of a bastion. */
    const w=buildRampart(P,prof,R-0.15,tierY(R-1e-6),hash2(P.seed,15900));
    w.userData.key='rampC'; out.add(w); bands.push(R-0.15);
    node(w,{mode:'build',delay:RISE});
  }

  /* ---- placement ------------------------------------------------------- */
  const claimed=claims;
  const slotXZ=p=>{ const rr=radiusAt(prof,p.a)*p.r; return [Math.cos(p.a)*rr,Math.sin(p.a)*rr]; };
  const accept=(p,minD)=>{
    if(p.r>R-minD*0.6)return false;                    // must be on the island
    /* A wall is tested in the radial direction alone. Both the wall and the
       slot are placed at a radius scaled by the same profile, so "how far is
       this slot from that ring" is a subtraction rather than a search along it. */
    for(const b of bands) if(Math.abs(p.r-b)<0.45+minD*0.5)return false;
    const [x,z]=slotXZ(p);
    for(const c of claimed){ const dx=c.x-x,dz=c.z-z;
      if(dx*dx+dz*dz<(c.d+minD)*(c.d+minD))return false; }
    claimed.push({x,z,d:minD}); return true;
  };
  const put=(obj,p,key,extra)=>{
    const [x,z]=slotXZ(p);
    obj.position.set(x,tierY(p.r)+0.16,z); obj.userData.key=key; out.add(obj);
    node(obj,{mode:carry&&prevKeys.has(key)?'keep':'build',
              delay:(isNew(p.r)?RISE:0.05)+(extra||0)});
    return obj;
  };
  const placeN=(lat,count,minD,make)=>{ let n=0;
    for(const p of lat){ if(n>=count)break; if(!accept(p,minD))continue; make(p,n); n++; } };
  const placeF=(lat,minD,make)=>{ let n=0;
    for(const p of lat){ if(p.f>sp.fill)continue; if(!accept(p,minD))continue; make(p,n); n++; } };

  /* ---- the Great Tree (frameworks only) -------------------------------- */
  /* Placed before everything else so it claims the centre first, and claimed
     generously: buildings under the canopy are wanted, buildings inside the
     trunk are not. */
  if(P.form==='greattree'){
    const tr=greatTree(P,level);
    tr.position.set(0,0.16,0); tr.userData.key='tree'; tr.userData.keep=true; out.add(tr);
    /* It genuinely changes shape every level, so it is the one carried object
       that re-animates: it GROWS, which is exactly what it should look like. */
    node(tr,{mode:'build',delay:0.05});
    claimed.push({x:0,z:0,d:0.9+((level-1)/11)*2.4});
  }

  /* ---- the centrepiece ------------------------------------------------- */
  if(opt.signatures&&opt.signatures.length){
    /* The realm's skyline. The biggest district takes the middle; the rest sit
       on the lattice at a scale that tracks how much you have read there, so
       the silhouette of a realm is a ranking you can see from across the map.
       Where the landform already owns the centre — the frameworks' Great Tree —
       every monument goes on the lattice instead. */
    const put0=(sig,key,p)=>{
      const g=realmSignature(sig.P,rngOf(hash2(sig.P.seed,1)),spec(clamp(sig.level+2,3,12)));
      /* The forge wheel, the orrery, the watchfire: a realm's monuments are the
         one thing on it you can read at a glance, so they keep their motion
         through the merge. */
      g.userData.keep=true;
      g.scale.setScalar(clamp(0.46+sig.level*0.062,0.46,1.1));
      if(p) return put(g,p,key,0.04);
      g.position.set(0,0.16,0); g.userData.key=key; out.add(g);
      node(g,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:0});
      claimed.push({x:0,z:0,d:SIG_R[sig.P.sig]??2.4});
      return g;
    };
    let n=0;
    if(P.form!=='greattree') put0(opt.signatures[n++],'sig0',null);
    const lat=lattice(52,1.9,RMAX*0.78,hash2(P.seed,777));
    for(const p of lat){
      if(n>=opt.signatures.length)break;
      if(!accept(p,(SIG_R[opt.signatures[n].P.sig]??2.4)*0.9))continue;
      put0(opt.signatures[n],'sig'+n,p); n++;
    }
  }else if(sp.signature){
    const g=realmSignature(P,rngOf(hash2(P.seed,1)),sp);
    const at=SIG_AT[P.kit];
    if(at){
      /* Pulled in on a small island rather than falling back to the centre: the
         centre belongs to the Great Tree from L1, and a monument that stood
         there for two levels and then jumped aside would break the one rule the
         whole layout rests on. It only ever moves OUTWARD, and only until the
         island is big enough to hold it at its home radius. */
      const rr=Math.min(at.r,R*0.55);
      const wr=radiusAt(prof,at.a)*rr;
      g.position.set(Math.cos(at.a)*wr,tierY(rr)+0.16,Math.sin(at.a)*wr);
      g.rotation.y=-at.a+Math.PI/2;
      claimed.push({x:g.position.x,z:g.position.z,d:SIG_R[P.sig]??2.4});
    }else{
      g.position.set(0,0.16,0);
      claimed.push({x:0,z:0,d:SIG_R[P.sig]??2.4});
    }
    g.userData.key='sig'; g.userData.keep=true; out.add(g);
    node(g,{mode:carry&&prevKeys.has('sig')?'keep':'build',delay:0});
  }

  /* THE LODESTONE, at every level from one — see buildLodestone. Placed before
     the buildings so it claims its ground first, and claimed generously: the
     stone wants air around it, not a cottage against its shoulder.
     A founding marker marks a founding, and unbuilt ground has had none. */
  if(!opt.bare){
    const la=(P.seed%13)*0.4833+1.05, lp={r:1.34,a:la,f:0,i:-1};
    accept(lp,0.95);
    put(buildLodestone(P,rngOf(hash2(P.seed,3))),lp,'lode',0);
  }

  /* ---- reserve the late game's ground before anything else is placed ----
     The structure itself is built at the end, but the town is laid out here,
     and a chain of claims along its run is what stops houses, trees and lamps
     from being dropped inside a crane rail or under an aqueduct. Nothing that
     lives in the air needs one — the swarm's spans and the frameworks' pods
     have no footprint on the ground at all. */
  const GR=GROWTH[P.kit];
  if(sp.expand){
    if(GR.expand==='citadel'){
      claimed.push({x:0,z:0,d:Math.min(3.0,R*0.3)+0.9});
    }else if(GR.expand==='aqueduct'||GR.expand==='gantry'||GR.expand==='arcade'){
      const ba=GR.expand==='aqueduct'?P.seed*0.77+1.3+Math.PI*0.62
              :GR.expand==='gantry'  ?P.seed*0.31+0.9
              :                       P.seed*0.53+2.4;
      const lim=GR.expand==='gantry'?R-1.4:GR.expand==='arcade'?R-1.2:R-1.0;
      const half=Math.min(lim,GR.expand==='aqueduct'?7.2:GR.expand==='gantry'?6.4:6.0);
      const dx=Math.cos(ba), dz=Math.sin(ba);
      const cx=-Math.sin(ba)*expandOffset(P), cz=Math.cos(ba)*expandOffset(P);
      const w=GR.expand==='gantry'?EXPAND_W+1.4:EXPAND_W;   // the rail is wide
      const n=Math.max(3,Math.round(half*2/w));
      for(let i=0;i<=n;i++){
        const t2=lerp(-half,half,i/n);
        claimed.push({x:dx*t2+cx,z:dz*t2+cz,d:w});
      }
    }
  }

  /* ---- towers ---------------------------------------------------------- */
  /* Height is drawn per SLOT, not per level: a tower that silently grew taller
     every time you read something is a tower that never stops moving.
     Verticality is a one-time event — the great tower at L11. */
  const towerTops=[];
  /* Towers and halls are metres across, not centimetres. 1.2/1.5 was measured
     against the shaft and ignored everything bolted to it — jibs, buttresses,
     colonnades — so neighbours were laid down inside them. */
  placeN(lattice(46,0.6,RMAX*0.55,hash2(P.seed,20)),
    clamp(sp.towers,1,GR.towers),2.1,(p,i)=>{
    const rs=rngOf(hash2(P.seed,2000+p.i));
    const great=sp.great&&i===0;
    const h=lerp(5.0,7.8,rs())*(great?1.45:1);
    const s=put(K.tower(P,rs,h,great),p,'tw'+p.i,i*0.08);
    /* The great tower carries the realm's crown, and a crown that stops turning
       stops being magic and starts being a prop. It is also half again the size
       of its neighbours, so it takes a wider claim than the slot gave it. */
    if(great){ s.userData.keep=true; claimed.push({x:s.position.x,z:s.position.z,d:3.0}); }
    towerTops.push(new THREE.Vector3(s.position.x,s.position.y+h*0.8,s.position.z));
  });

  placeN(lattice(46,2.2,RMAX*0.6,hash2(P.seed,30)),sp.halls,2.4,
    (p,i)=>put(K.hall(P,rngOf(hash2(P.seed,3000+p.i))),p,'hl'+p.i,i*0.08));

  if(sp.arch) placeN(lattice(34,1.1,RMAX*0.92,hash2(P.seed,40)),1,1.5,p=>{
    const a=buildGate(P,rngOf(hash2(P.seed,4000+p.i)));
    a.rotation.y=-p.a+Math.PI/2;
    put(a,p,'ar'+p.i,0.05);
  });

  /* ---- the town -------------------------------------------------------- */
  if(sp.cottages) placeF(lattice(POP.cot,1.7,RMAX*0.95,hash2(P.seed,50)),0.95,(p,i)=>{
    const rc=rngOf(hash2(P.seed,5000+p.i));
    const c=K.house(P,rc);
    c.rotation.y=-p.a+Math.PI/2+(rc()-0.5)*0.7;
    put(c,p,'ct'+p.i,i*0.012);
  });

  if(sp.gardens) placeF(lattice(POP.garden,3.4,RMAX*0.97,hash2(P.seed,60)),0.30,
    (p,i)=>put(K.garden(P,rngOf(hash2(P.seed,6000+p.i))),p,'gd'+p.i,i*0.008));

  if(sp.lamps) placeF(lattice(POP.lamp,0.3,RMAX*0.97,hash2(P.seed,70)),0.24,
    (p,i)=>put(K.lamp(P,rngOf(hash2(P.seed,7000+p.i))),p,'lp'+p.i,i*0.008));

  if(sp.trees) placeF(lattice(POP.tree,5.1,RMAX*0.98,hash2(P.seed,80)),0.44,
    (p,i)=>put(K.plant(P,rngOf(hash2(P.seed,8000+p.i))),p,'pl'+p.i,i*0.01));

  /* The realm feature is a crate on the quay and a market stall in the old
     town — somebody's, not the land's. Bare ground keeps its rocks, its tufts
     and its flowers, and nothing that anybody had to put there. */
  if(!opt.bare) placeF(lattice(POP.feat,4.2,RMAX*0.98,hash2(P.seed,90)),0.38,
    (p,i)=>put(K.feature(P,rngOf(hash2(P.seed,9000+p.i))),p,'ft'+p.i,i*0.01));

  if(sp.banners) placeN(lattice(40,2.9,RMAX*0.7,hash2(P.seed,100)),
    Math.min(4,1+Math.floor(level/3)),0.4,
    (p,i)=>put(buildBanner(P,rngOf(hash2(P.seed,10000+p.i))),p,'bn'+p.i,i*0.05));

  /* ---- paving ---------------------------------------------------------- */
  /* Ring roads at the mid-radius of each terrace band, spokes on fixed bearings.
     All absolute, so paving laid at L4 is exactly where it was at L12 and the
     network only ever extends. */
  if(level>=4){
    const rP=rngOf(hash2(P.seed,140));
    const geo=boxG(0.52,0.07,0.42);
    const oldM=[],newM=[], o=new THREE.Object3D();
    const edges=[0,...TIER_R,RMAX];
    for(let b=0;b<edges.length-1;b++){
      const ring=(edges[b]+edges[b+1])/2;
      const n=Math.max(8,Math.round(TAU*ring/0.55));
      for(let k=0;k<n;k++){
        const a=k/n*TAU+rP()*0.05, rr=ring+(rP()-0.5)*0.22, sc=lerp(0.85,1.15,rP());
        if(rr>R-0.5)continue;
        const wr=radiusAt(prof,a)*rr;
        o.position.set(Math.cos(a)*wr,tierY(rr)+0.2,Math.sin(a)*wr);
        o.rotation.set(0,-a+(rP()-0.5)*0.2,0); o.scale.setScalar(sc);
        o.updateMatrix(); (isNew(rr)?newM:oldM).push(o.matrix.clone());
      }
    }
    for(let s=0;s<4;s++){
      const a=s/4*TAU+0.4;
      for(let k=0;k<Math.round(RMAX/0.5);k++){
        const rr=0.7+k*0.5, sc=lerp(0.85,1.1,rP()), jit=(rP()-0.5)*0.18;
        if(rr>R-0.5)continue;
        const wr=radiusAt(prof,a)*rr;
        o.position.set(Math.cos(a)*wr,tierY(rr)+0.2,Math.sin(a)*wr);
        o.rotation.set(0,-a+Math.PI/2+jit,0); o.scale.setScalar(sc);
        o.updateMatrix(); (isNew(rr)?newM:oldM).push(o.matrix.clone());
      }
    }
    const pave=mat(P.stone2,{rough:0.95});
    /* Instanced geometry never passes through meshOf, so it has to be baked
       here or it renders black under a vertexColors material. One bake serves
       every instance — the attribute is local to the geometry and the instance
       matrix only moves it. */
    if(FX.vc) bakeVC(geo);
    for(const [arr,parent] of [[oldM,oldLand],[newM,newLand]]){
      if(!arr.length)continue;
      const im=new THREE.InstancedMesh(geo,pave,arr.length);
      arr.forEach((m,i)=>im.setMatrixAt(i,m));
      im.instanceMatrix.needsUpdate=true; parent.add(im);
    }
  }

  /* ---- ground scatter -------------------------------------------------- */
  const scatter=(pop,geo,material,rot,seed,scaleFn,yOff)=>{
    if(FX.vc) bakeVC(geo);          // instanced — see the paving above
    const lat=lattice(pop,rot,RMAX*0.99,seed), rnd=rngOf(seed+7);
    const oldM=[],newM=[], o=new THREE.Object3D();
    for(const p of lat){
      /* Draw for EVERY slot before any gate, so a slot's look never depends on
         which other slots happen to be admitted at this level. */
      const s=scaleFn(rnd), sy=lerp(0.7,1.4,rnd()), ry=rnd()*TAU;
      if(p.f>sp.fill||p.r>R-0.4)continue;
      const wr=radiusAt(prof,p.a)*p.r;
      o.position.set(Math.cos(p.a)*wr,tierY(p.r)+0.16+(yOff||0),Math.sin(p.a)*wr);
      o.rotation.set(0,ry,0); o.scale.set(s,s*sy,s);
      o.updateMatrix(); (isNew(p.r)?newM:oldM).push(o.matrix.clone());
    }
    for(const [arr,parent] of [[oldM,oldLand],[newM,newLand]]){
      if(!arr.length)continue;
      const im=new THREE.InstancedMesh(geo,material,arr.length);
      arr.forEach((m,i)=>im.setMatrixAt(i,m));
      im.instanceMatrix.needsUpdate=true; parent.add(im);
    }
  };
  scatter(POP.rock,new THREE.DodecahedronGeometry(0.16,0),mat(P.rock,{rough:1}),
    1.4,hash2(P.seed,110),r=>lerp(0.5,1.6,r()));
  /* Ground cover, realm by realm: grass tufts in five realms, and in the forges
     slag chips lying flat, because nothing grows on a foundry deck. */
  if(P.kit==='forge'){
    scatter(POP.tuft,new THREE.DodecahedronGeometry(0.1,0),
      mat(mixTok(P.rock,0x000000,0.3),{rough:1}),
      2.7,hash2(P.seed,120),r=>lerp(0.5,1.3,r()));
  }else{
    /* Tufts take the FOLIAGE colour, not the ground: the swarm paves its inner
       terrace, and grass tufts inherited from the cap came out marble-white. */
    scatter(POP.tuft,new THREE.ConeGeometry(0.07,0.26,4),mat(P.foliage2,{rough:1}),
      2.7,hash2(P.seed,120),r=>lerp(0.6,1.5,r()));
  }
  scatter(POP.flower,new THREE.IcosahedronGeometry(0.05,0),
    mat(P.bloom,{emissive:P.bloom,ei:0.12,rough:0.8}),
    4.9,hash2(P.seed,130),r=>lerp(0.7,1.4,r()),0.05);

  /* ---- water ----------------------------------------------------------- */
  /* Pinned to a fixed spot in the second terrace band. It cascades down every
     terrace edge it meets and finally plumes off the coast — the cascades are at
     fixed radii and never move; only the coastal plume follows the rim, and
     water has no landmarks to give the movement away.

     The forges pour their molten channel out of the lava vent and the shipyards
     fill basins cut into the deck, so neither takes a pond on top of it. */
  if(sp.pond&&P.kit!=='forge'&&P.kit!=='ship'){
    /* Re-centred on the opening view and narrowed, so the waterworks lands in
       front wherever the seed falls. Still derived from the seed alone and NOT
       from the live camera: this is build-time geometry that carries across
       level changes by key, so a bearing that moved with the view would make a
       district's pond jump to the other side of its island the first time it
       was rebuilt after a rotation. */
    const ang=Math.PI*0.25+((P.seed%11)/10*2-1), pondR=5.4, pr=1.15;
    const wr=radiusAt(prof,ang)*pondR;
    const px=Math.cos(ang)*wr, pz=Math.sin(ang)*wr;
    const pond=buildPond(P,pr,tierY(pondR)+0.16);
    pond.position.set(px,0,pz); pond.userData.key='pond'; pond.userData.keep=true; out.add(pond);
    node(pond,{mode:carry&&prevKeys.has('pond')?'keep':'build',delay:isNew(pondR)?RISE:0.05});
    claimed.push({x:px,z:pz,d:pr+0.6});

    if(sp.falls){
      const edge=TIER_R.find(b=>b>pondR)??R;
      const ewr=radiusAt(prof,ang)*Math.min(edge,R-0.3);
      const dx=Math.cos(ang)*ewr-px, dz=Math.sin(ang)*ewr-pz, len=Math.hypot(dx,dz);
      const ch=meshOf(boxG(len,0.1,0.45),
        mat(P.water,{emissive:P.water,ei:(P.liquidGlow??0.5)*1.1,flat:false,
          rough:0.15,opacity:0.88}),false,true);
      ch.position.set(px+dx/2,tierY(pondR)+0.2,pz+dz/2);
      ch.rotation.y=-Math.atan2(dz,dx); ch.userData.key='chan'; out.add(ch);
      node(ch,{mode:carry&&prevKeys.has('chan')?'keep':'build',delay:0.05});

      for(let k=0;k<TIER_R.length;k++){
        const b=TIER_R[k]; if(b<pondR||b>=R)continue;
        const bwr=radiusAt(prof,ang)*b;
        const c=buildFalls(P,TIER_STEP+0.25);
        c.position.set(Math.cos(ang)*bwr,tierY(b-1e-6)+0.16,Math.sin(ang)*bwr);
        c.rotation.y=-ang+Math.PI/2; c.userData.key='casc'+k; c.userData.keep=true; out.add(c);
        node(c,{mode:carry&&prevKeys.has('casc'+k)?'keep':'build',delay:isNew(b)?RISE:0.05});
      }
    }
  }

  /* ---- off the rim: decks, bridges, hanging gardens -------------------- */
  /* All attached to this island and only this island — the finished world puts
     ~40 districts shoulder to shoulder, and nothing here crosses the plot. */
  for(let i=0;i<GR.decks[level-1];i++){
    const br=canBirthR(GR.decks,i);
    /* Golden-angle bearings, so no two decks ever end up on the same stretch of
       coast however many the level unlocks. */
    const a=i*2.399963229728653+(P.seed%13)*0.31;
    const wr=radiusAt(prof,a)*br;
    const rc=rngOf(hash2(P.seed,11000+i));
    /* The shipyards' pontoon sits on the water, not out in the air, so it is
       the one deck that is placed DOWN as well as out. */
    const drop=P.kit==='ship'?tierY(R-1e-6)-1.15:tierY(br-1e-6);
    const c=buildDeck(P,rc,K,{back:1.1,drop:1.5});
    c.position.set(Math.cos(a)*(wr+1.1),drop,Math.sin(a)*(wr+1.1));
    c.userData.y0=drop;
    if(c.userData.tick){ c.userData.keep=true; animated.push(c); }
    c.rotation.y=-a; c.userData.key='can'+i; out.add(c);
    node(c,{mode:carry&&prevKeys.has('can'+i)?'keep':'build',delay:isNew(br)?RISE:0.05});
  }

  /* ---- the late game, and it is a different building in every realm ---- */
  /* This used to be `bridges` for all six. See GROWTH for the argument; the
     short version is that the eye reads skeleton before material, and six
     districts with the same three spans strung between the same three towers
     were the same district six times over however they were painted. */
  if(sp.expand){
    const parts=[];
    if(GR.expand==='spans'){
      /* The only realm that crosses open air. */
      for(let i=0;i<towerTops.length-1;i++)
        parts.push(buildSkyBridge(P,towerTops[i],towerTops[i+1]));
    }else if(GR.expand==='canopy'){
      parts.push(frameCanopyPods(P,R,level));
    }else if(GR.expand==='aqueduct'){
      parts.push(forgeAqueduct(P,prof,R));
    }else if(GR.expand==='gantry'){
      parts.push(shipGantryLine(P,prof,R));
    }else if(GR.expand==='citadel'){
      parts.push(bastionCitadel(P,prof,R));
    }else{
      parts.push(quarterArcadeRow(P,prof,R));
    }
    parts.forEach((b,i)=>{
      const key='ex'+i;
      b.userData.key=key; b.userData.keep=true; out.add(b);
      node(b,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:RISE+0.1});
    });
  }

  if(sp.undercroft){
    for(let k=0;k<TIER_R.length;k++){
      const b=TIER_R[k]; if(b>=R)continue; const key='uc'+k;
      const u=buildUndercroft(P,rngOf(hash2(P.seed,13000+k)),prof,b,tierY(b-1e-6)-0.06);
      u.userData.key=key; out.add(u);
      node(u,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:isNew(b)?RISE:0.05});
    }
  }

  /* ---- life ------------------------------------------------------------ */
  /* Ambient life is expensive and only legible up close, so it is a privilege
     of the districts you are actually looking at. */
  if(opt.alive){
    if(K.motes){
      const m=buildMotes(P,sp.motes,R);
      m.userData.key='motes'; m.userData.keep=true; out.add(m);
      node(m,{mode:carry?'keep':'build',delay:0.5});
    }
    if(sp.life&&K.fly){
      const b=buildFlyers(P,sp.life,R,K.fly);
      /* 'birds' and not 'fly': the ride picks its target by this key, and
         renaming it is how you quietly delete a feature. */
      b.userData.key='birds'; b.userData.keep=true; out.add(b);
      node(b,{mode:carry&&prevKeys.has('birds')?'keep':'build',delay:0.6});
    }
  }

  const keys=new Set();
  for(const nd of nodes) if(nd.obj.userData.key) keys.add(nd.obj.userData.key);
  return {group:out,nodes,keys,radius:R,spec:sp};
}

/* ------------------------------------------------------------------ merging */
/* Once the build transition is over every transform is final, so anything that
   is not animated can be baked down to one mesh per material. That is the
   difference between a world you can fly around and a slideshow. */
function subGeom(geo,start,count){
  const g=new THREE.BufferGeometry();
  for(const name of Object.keys(geo.attributes)){
    const a=geo.attributes[name], it=a.itemSize;
    g.setAttribute(name,new THREE.BufferAttribute(a.array.slice(start*it,(start+count)*it),it));
  }
  return g;
}
function mergeStatic(root){
  root.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  /* Anything with a per-frame tick, and everything under it, has to stay. */
  const moving=new Set();
  root.traverse(o=>{ if((o.userData&&o.userData.tick)||(o.parent&&moving.has(o.parent))) moving.add(o); });

  const buckets=new Map(), doomed=[];
  const m4=new THREE.Matrix4();
  root.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||moving.has(o))return;
    const src=o.geometry;
    if(!src||!src.attributes||!src.attributes.position)return;
    /* Converting index state would cost more than the merge itself; bucket by
       it instead and let both kinds merge among their own. */
    const multi=Array.isArray(o.material)&&o.material.length>1;
    const geo=(multi&&src.index)?src.toNonIndexed():src.clone();
    geo.applyMatrix4(m4.multiplyMatrices(inv,o.matrixWorld));
    const mats=Array.isArray(o.material)?o.material:[o.material];
    const parts=(mats.length>1&&geo.groups.length)
      ? geo.groups.map(gr=>[mats[gr.materialIndex]||mats[0],subGeom(geo,gr.start,gr.count)])
      : [[mats[0],geo]];
    for(const [material,g] of parts){
      /* Shadow flags used to be part of this key, so that a builder asking for
         castShadow:false survived the merge. With no shadow map there is nothing
         to survive, and dropping them from the key lets more geometry land in
         the same bucket — which is fewer draw calls, not more. */
      const key=material.uuid+'|'+(g.index?'i':'n')
        +'|'+Object.keys(g.attributes).sort().join(',');
      if(!buckets.has(key)) buckets.set(key,{material,list:[]});
      buckets.get(key).list.push(g);
    }
    if(parts.length>1) geo.dispose();
    doomed.push(o);
  });
  for(const o of doomed){ o.geometry.dispose&&o.geometry.dispose(); o.removeFromParent(); }

  for(const {material,list} of buckets.values()){
    let g=null;
    try{ g=list.length>1?mergeGeometries(list,false):list[0]; }catch(e){ g=null; }
    if(!g){ for(const gg of list) root.add(meshOf(gg,material)); continue; }
    if(list.length>1) list.forEach(x=>x.dispose());
    root.add(new THREE.Mesh(g,material));
  }
  /* Drop the scaffolding the merge emptied out. A finished district leaves ~230
     childless groups behind, and every one of them is a matrix update a frame. */
  const prune=o=>{
    for(let i=o.children.length-1;i>=0;i--){
      const c=o.children[i]; prune(c);
      if(c.isGroup&&c.children.length===0) o.remove(c);
    }
  };
  prune(root);
}

/* ================================================================ the scene */
/* Two views, and they are two different MODELS rather than one model at two
   resolutions — which is the mistake the first version made. At world scale a
   district town is forty towns' worth of confetti and no silhouette; at realm
   scale a block of massing tells you nothing about what you read.

   WORLD  — realm islands only. Six places, each with its own landform, its own
            architecture, its own weather, and a skyline built from its
            districts' signature monuments.
   REALM  — one realm's ground, its districts standing on it as full towns with
            borders, levels and heraldry.

   You move between them explicitly: click a realm to enter, Esc to come back. */
const worldRoot=new THREE.Group();     // realm islands
const townRoot=new THREE.Group();      // district towns, inside the open realm
scene.add(worldRoot,landRoot,townRoot);
const active=[];                       // islands mid-transition
const queue=[];                        // rebuilds waiting for a frame
let hovered=null, selected=null;
let OPEN=null;                         // the realm you are inside, or null
let fade=1, fadeTo=1;                  // cross-fade between the two views

/* The town is lifted so its OUTERMOST ring sits flush with the ground: a
   waystone is a patch of turf, a sky court is a terraced hill three storeys
   above it. The land rising is the growth you can read from across the map. */
const baseYOf=(d,level)=>(d.P.kit==='ship'?WATER_Y+0.45:LAND_TOP)
  +tierOf(spec(level).radius-1e-6)*TIER_STEP;

function raise(d,level,animate){
  worldVer++;
  const carry=animate&&d.built;
  if(d.town) disposeGroup(d.town);
  const a0=animated.length;
  const r=buildIsland(d.P,level,{carry,prevR:d.builtR,prevKeys:d.keys,alive:true});
  d.animated=animated.splice(a0);
  d.town=r.group; d.nodes=r.nodes; d.keys=r.keys; d.builtR=r.radius;
  birdsDirty();
  d.level=level; d.built=true;
  d.baseY=baseYOf(d,level);
  d.town.position.set(d.x,d.baseY,d.z);
  townRoot.add(d.town);
  landDirty=true;                        // its territory just changed size

  const i=active.indexOf(d); if(i>=0)active.splice(i,1);
  if(animate){
    for(const nd of r.nodes){
      if(nd.mode==='build') nd.obj.scale.set(0.86,0.02,0.86);
      else if(nd.mode==='rise') nd.obj.position.y=-1.8;
    }
    d.t0=clock.getElapsedTime(); active.push(d);
  }else{
    for(const nd of r.nodes){ nd.obj.scale.set(1,1,1); if(nd.mode==='rise')nd.obj.position.y=0; }
    settle(d);
  }
}
/* Freeze what does not need to move and keep what does. Stripping EVERY tick
   was too blunt — it bought the draw calls back by killing the aliveness the
   world is supposed to have. Only the things marked `keep` (wisps, birds, water,
   falls) survive as their own objects; a swaying tree is not worth a draw call,
   a drifting wisp is. */
function freeze(root,animList){
  const keep=new Set();
  root.traverse(o=>{ if(o.userData&&(o.userData.keep||(o.parent&&keep.has(o.parent)))) keep.add(o); });
  root.traverse(o=>{ if(o.userData&&o.userData.tick&&!keep.has(o)) delete o.userData.tick; });
  mergeStatic(root);
  /* After the merge, not before — merging replaces the very objects whose
     layers would have been set. */
  markBloom(root);
  return animList.filter(o=>keep.has(o));
}
/* Every district stays alive, and now it also merges. Those are not the
   opposites I claimed they were.

   mergeStatic already leaves alone anything with a tick, and everything under
   it. So the question was never "motion or merging" — it was WHICH objects
   genuinely need to stay their own object, and the answer is only the ones
   whose TRANSFORM moves. A lantern that pulses does not: its material can be
   animated whether or not its mesh has been folded into a thousand others, and
   those now run off matTicks instead (see matAnim).

   What freeze() used to do, and this deliberately does not, is DELETE the ticks
   of everything not marked `keep` before merging. That is what made the old
   frozen districts static. Here the ticks stay, so the trees still sway and the
   orrery still turns — they simply cost a draw call each, which is the honest
   price for a transform that actually moves, paid only by the things that move. */
function settle(d){
  mergeStatic(d.town);
  /* After the merge, not before: merging replaces the objects whose layers
     would have been set, and markBloom is what moves sprites off layer 0 so the
     outline pass does not ring every wisp in ink. */
  markBloom(d.town);
  d.nodes=null;
}
function hideDistrict(d){
  worldVer++;
  if(HAND.x===d) handAbort();
  birdsDirty();
  if(d.town){ disposeGroup(d.town); d.town=null; }
  d.animated=[]; d.built=false; d.level=0; d.builtR=0; d.keys=null;
  d.borderMat=null; d.realmBorderMat=null; landDirty=true;
  const i=active.indexOf(d); if(i>=0)active.splice(i,1);
}
/* --------------------------------------------------------- the realm island */
/* A realm is the lab island built at the realm's own level, floating on its own
   keel, carrying one signature per district. Everything here is the locked art
   running at a different scale — no second art direction to maintain, which is
   why the world view can be as nice as the realm view. */
/* The ten districts an island carries a signature for, and that list as one
   comparable string. Both read the same districts in the same order, so a key
   that has not moved means an island that would be rebuilt identically. */
/* An UNBUILT world is the six realms as bare ground: the landform, the sky and
   the rock of each one, and nothing standing on any of it. The seed model gives
   every realm a single district so the layout has something to pack, and this
   is where that district stops being visible — no signature monuments, so what
   is on screen is the land itself waiting to be built on. */
const realmSigDistricts=q=>W&&W.unbuilt?[]:[...q.list].filter(d=>d.shown>0)
  .sort((a,b)=>b.shown-a.shown)
  .slice(0,10);
const realmSigKey=q=>realmSigDistricts(q)
  .map(d=>d.i+':'+(d.level||levelOf(d.shown))).join('|');
function raiseRealm(q,level,animate){
  worldVer++;
  const carry=animate&&q.island;
  if(q.island) disposeGroup(q.island);
  const sigs=realmSigDistricts(q)
    .map(d=>({P:d.P,level:d.level||levelOf(d.shown)}));
  q.sigKey=realmSigKey(q);
  const a0=animated.length;
  const r=buildIsland(q.P,level,{carry,prevR:q.builtR,prevKeys:q.keys,
    alive:true, keel:true, signatures:sigs, bare:!!(W&&W.unbuilt)});
  q.animated=animated.splice(a0);
  q.island=r.group; q.nodes=r.nodes; q.keys=r.keys; q.builtR=r.radius;
  birdsDirty();
  q.level=level;
  q.baseY=0;
  q.island.position.set(q.x,0,q.z);
  worldRoot.add(q.island);
  const i=active.indexOf(q); if(i>=0)active.splice(i,1);
  if(animate){
    for(const nd of r.nodes){
      if(nd.mode==='build') nd.obj.scale.set(0.86,0.02,0.86);
      else if(nd.mode==='rise') nd.obj.position.y=-1.8;
    }
    q.t0=clock.getElapsedTime(); active.push(q);
  }else{
    for(const nd of r.nodes){ nd.obj.scale.set(1,1,1); if(nd.mode==='rise')nd.obj.position.y=0; }
    settleRealm(q);
  }
}
function settleRealm(q){
  q.animated=freeze(q.island,q.animated);
  q.nodes=null;
}
function hideRealm(q){
  worldVer++;
  if(HAND.x===q) handAbort();
  birdsDirty();
  if(q.island){ disposeGroup(q.island); q.island=null; }
  q.animated=[]; q.level=0; q.builtR=0; q.keys=null;
  const i=active.indexOf(q); if(i>=0)active.splice(i,1);
}

/* ------------------------------------------------------------- enter / leave */
/* Which day the world view was last correct for. The replay only maintains the
   view you are standing in — inside a realm it advances districts, outside it
   advances islands — so walking out onto islands built for a day the scrubber
   has since left is a world that disagrees with its own counters. */
let worldDay=0;
function enterRealm(q){
  if(!q||OPEN===q)return;
  /* There is nothing inside an unbuilt realm. Walking into one would open a
     ground plan of the seed district nobody has read. */
  if(W.unbuilt)return;
  handAbort(); unpossess(); birdsDirty();
  worldDay=DAY;
  OPEN=q; selected=null; hovered=null;
  for(const d of W.districts) hideDistrict(d);
  for(const d of q.list){
    if(d.shown>0) raise(d,levelOf(d.shown),false);
  }
  buildLand();
  worldRoot.visible=false;
  landRoot.visible=townRoot.visible=true;
  fade=0; fadeTo=1;
  frameBounds(q.bounds);
  rootEl.classList.add('inrealm');
  updateHud(); renderRank(true); emitDistrict(); buildAir(); placeClouds();
}
function leaveRealm(){
  if(!OPEN)return;
  handAbort(); unpossess(); birdsDirty();
  for(const d of OPEN.list) hideDistrict(d);
  landRoot.clear(); OPEN=null; selected=null; hovered=null;
  worldRoot.visible=true;
  landRoot.visible=townRoot.visible=false;
  /* Bring the islands up to the day the scrubber is actually on. Land is
     rebuilt only where the level moved; where it did not, the skyline can still
     be stale — a district levelling up raises the monument its island carries —
     so those are marked and refreshed by the loop at its own pace. */
  if(worldDay!==DAY){
    for(const q of W.quarters){
      const L=realmLevelOf(q.shown);
      q.queued=0;
      if(L===0){ if(q.island) hideRealm(q); continue; }
      if(!q.island||q.level!==L) raiseRealm(q,L,false);
      else q.skyStale=true;
    }
    queue.length=0;
    worldDay=DAY;
  }
  fade=0; fadeTo=1;
  frameBounds(W.worldBounds);
  rootEl.classList.remove('inrealm');
  updateHud(); renderRank(true); emitDistrict(); buildAir(); placeClouds();
}

/* The sky, its eight palettes and its five hours, all in `sky.js` — the bench
   in the panel lists the same tables this paints from. */
const SKY={...DEFAULT_SKY};

/* Repainting a sky regenerates the PMREM environment, so it is guarded by a key
   rather than by a flag: the bench can set the same palette twice, or an hour
   it is already on, and neither should force a rebuild. */
let skyKey='';
/* ONE SKY, EVERYWHERE. A realm rig was tried — each concept image is lit as its
   own place, so entering a realm switched to that realm's weather — and it is
   the wrong trade for a world somebody DRESSED: the sky is the one channel the
   owner picked, and having it thrown away the moment a visitor walks into a
   realm makes the choice feel like a suggestion. It also broke the one thing a
   sky is for, which is holding the whole place together: flying out of the
   forges into the bastion re-graded the entire frame mid-flight.

   What the realms keep is their MATERIALS, which is where their identity
   actually lives — the rock, the roofs, the keel, the landform. What they lost
   is a private light rig, and the picker carries the difference: `ember` is the
   forges' dusk, `lilac` the swarm's day, `clear` the bastion's winter. Anyone
   who wants a realm's weather can put the whole world under it. */
function applySky(){
  const p=skyPalOf(SKY.pal), h=skyHourOf(SKY.hour);
  const key=p.id+'|'+h.id;
  if(key===skyKey)return; skyKey=key;
  const a=p.a, b=p.b;

  sun.position.set(h.sun[0],h.sun[1],h.sun[2]).normalize().multiplyScalar(100);
  sun.color.setHex(h.sunC); sun.intensity=h.sunI;
  fill.intensity=h.fillI;
  rim.intensity=h.rimI; rim.visible=!!FX.env;
  renderer.toneMappingExposure=h.exp;

  /* Mixed in the working space, like every other colour in this file — the
     tokens go in through THREE.Color and come back out through getHex, so an
     hour darkens a sky the same way mixTok softens a realm's stone. */
  const tintC=new THREE.Color(h.tint);
  const tone=(hex,k)=>new THREE.Color(hex).lerp(tintC,k).multiplyScalar(h.mul).getHex();
  const A=tone(a,h.ka), B=tone(b,h.kb);
  /* The haze is derived from the hour rather than listed per palette, because
     it is not a colour anybody picks — it is what the air is doing, and the air
     is doing the same thing over every palette at the same hour. Slightly under
     the zenith's pull so the band stays the brightest part of the sky at every
     hour, including the ones where "brightest" is not very bright. */
  const HZ=tone(0xFFFFFF,h.ka*0.9);
  hemi.color.setHex(A).lerp(new THREE.Color(0xFFFFFF),0.55);
  hemi.intensity=h.hemiI;
  paintSky(A,B,HZ);
  /* The banner is lit by the map in daylight and by its own emissive after
     dark, or it is unreadable at NIGHT — the hour where the crest matters most. */
  if(stdCloth) stdCloth.material.emissiveIntensity=clamp(1-h.sunI/2,0,0.8);
}
function skySet(next){
  if(!next)return;
  SKY.pal=next.pal||SKY.pal; SKY.hour=next.hour||SKY.hour;
  applySky();
}

/* ================================================================ the names
   The lab let you rename the world and every district in it, and kept those
   names in the browser. Naming is customisation, so it is out of this pass:
   a district is called what the taxonomy calls it until it comes back. */
const nameOf=d=>d.niche.label;

/* ============================================================= the standard
   The crest — the mark assembled out of the monuments you have raised and the
   accents of the districts you founded, flown on one banner over the biggest
   thing on screen — is the piece of this that TRAVELS, and it is also entirely
   a thing you arrange. It goes with the rest of the customisation for now, in
   one piece, so it can come back in one piece. */

/* ================================================================== camera */
/* Classic isometric navigation. The pitch is welded to the true iso angle, drag
   pans across the ground plane, the wheel zooms toward the cursor, and yaw only
   moves in 45° detents — so the world can never end up at a crooked angle. */
pitch=ISO_PITCH; yaw=Math.PI*0.25;
cam.near=-1400; cam.far=1800;
let zoomTarget=160, yawTarget=yaw, panning=false, rotating=false, lx=0, ly=0, moved=0;
const ZMIN=13, ZMAX=420;
const canvas=renderer.domElement;

/* placeCam moves the camera; three only rebuilds `matrixWorldInverse` inside
   render(). Anything that projects a point before the next render — the camera
   fit, and the whole label layer — has to refresh it by hand, or it is working
   against where the camera was one frame ago. That stale matrix was both the
   world opening at 40% of the screen and the offset between a label and the
   thing it points at. */
function syncCam(){
  placeCam();
  cam.updateMatrixWorld(true);
  cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
}
/* Scratch for the ray direction. The origin stays a fresh vector because it is
   what gets returned, and the wheel handler holds two results at once. */
const _gd=new THREE.Vector3();
function groundAt(cx,cy,planeY){
  /* Client coordinates in, so they come back to the container's own origin
     before they are anything but a number: `cx` is measured from the window
     and this box does not always start there. */
  const o=new THREE.Vector3(((cx-VX)/VW)*2-1, -((cy-VY)/VH)*2+1, -1)
    .unproject(cam);
  const dir=_gd.set(0,0,-1).applyQuaternion(cam.quaternion);
  if(Math.abs(dir.y)<1e-6)return null;
  return o.addScaledVector(dir,(planeY-o.y)/dir.y);
}
function clampTarget(){
  if(!W)return;
  const b=OPEN?OPEN.bounds:W.worldBounds, m=110;
  target.x=clamp(target.x,b.x0-m,b.x1+m);
  target.z=clamp(target.z,b.z0-m,b.z1+m);
}
/* ------------------------------------------------------------------ pinch
   Two fingers are the wheel. There is no other zoom on a phone: the gesture the
   browser would have handled is the one `touch-action:none` has to take away
   (without it a drag across the world is a drag on the page), and a world you
   can only pan across is a world whose far side you cannot reach.

   Live touches rather than a flag, because the interesting moments are the
   transitions — the second finger landing has to call off whatever the first
   one had started, and the second finger LIFTING has to hand the pan back to
   the one still on the glass without the world jumping to where the gesture
   began. */
const touches=new Map();
let pinchSpan=0;
function pinchStep(){
  const [a,b]=[...touches.values()];
  const span=Math.hypot(a.x-b.x,a.y-b.y);
  if(span<1||pinchSpan<1){ pinchSpan=span; return; }
  /* Toward the midpoint, exactly as the wheel zooms toward the cursor: pinching
     on a district that is off to one side should bring THAT district in. */
  const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
  const before=groundAt(cx,cy,0);
  zoomTarget=clamp(zoomTarget*(pinchSpan/span),ZMIN,ZMAX);
  zoom+=(zoomTarget-zoom)*0.6; syncCam();
  const after=groundAt(cx,cy,0);
  if(before&&after){ target.x+=before.x-after.x; target.z+=before.z-after.z; clampTarget(); }
  pinchSpan=span;
}

canvas.addEventListener('pointerdown',e=>{
  if(POV.bird)return;                    // the camera belongs to the bird
  if(e.pointerType==='touch') touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  canvas.setPointerCapture(e.pointerId);
  /* Nobody puts a second finger down to keep doing the same thing, so the pan,
     the click and any grip that was closing on a town are all called off. */
  if(touches.size>1){
    panning=rotating=false; pinchSpan=0; POV.aim=null;
    HAND.hold=0; HAND.armed=null;
    if(HAND.mode==='held') handRelease(clock.getElapsedTime());
    /* Past the click threshold for good: lifting out of a pinch must never
       land as a tap on whatever happened to be under the last finger. */
    moved=99;
    return;
  }
  rotating=e.shiftKey||e.button===2; panning=!rotating;
  lx=e.clientX; ly=e.clientY; moved=0; PX=e.clientX; PY=e.clientY;
  stageEl.className='world-stage grabbing';
  /* A press that stays put long enough stops being a click and becomes a grip.
     Armed here, fired from the frame loop — a timer racing the pointer stream
     is how you end up grabbing a town you already let go of. */
  if(!rotating) handArm(e.clientX,e.clientY,clock.getElapsedTime());
  /* What the reticle was on when you pressed. Captured here so the bird you
     aimed at is the bird you get, however far it flies before you let go. */
  POV.aim=rotating?null:POV.hover;
});
canvas.addEventListener('pointerup',e=>{
  if(POV.bird){ unpossess(); return; }
  const wasPinching=touches.size>1;
  touches.delete(e.pointerId);
  if(wasPinching){
    pinchSpan=0;
    /* The finger left on the glass takes the pan over from where IT is, not
       from where the first one went down half a screen ago. */
    const [rest]=[...touches.values()];
    if(rest){ panning=true; lx=rest.x; ly=rest.y; PX=rest.x; PY=rest.y; }
    return;
  }
  panning=rotating=false; stageEl.className='world-stage grab';
  PX=e.clientX; PY=e.clientY;
  if(HAND.mode==='held'){ handRelease(clock.getElapsedTime()); return; }
  HAND.hold=0; HAND.armed=null;
  if(moved<6) pick(e.clientX,e.clientY,true);
});
canvas.addEventListener('pointercancel',e=>{
  touches.delete(e.pointerId); pinchSpan=0;
  HAND.hold=0; HAND.armed=null;
  if(HAND.mode==='held') handRelease(clock.getElapsedTime()); });
canvas.addEventListener('pointermove',e=>{
  /* The pointer position is read FIRST and unconditionally: while you are
     riding, where the cursor sits is the only steering input there is, and an
     early return above this line silently froze the mouse look. */
  PX=e.clientX; PY=e.clientY;
  if(POV.bird)return;
  if(touches.has(e.pointerId)) touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size>1){ pinchStep(); return; }
  const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
  moved+=Math.abs(dx)+Math.abs(dy);
  /* Once the hand has it, the drag belongs to the town and not to the camera. */
  if(HAND.mode!=='idle') return;
  if(moved>6){ HAND.hold=0; POV.aim=null; }
  if(panning){
    const r=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
    const f=new THREE.Vector3(-Math.cos(yaw),0,-Math.sin(yaw));
    const k=zoom/VH*2;
    /* Both axes drag the LAND, not the camera: push the mouse down and the
       world follows it down. The forward axis had the opposite sign. */
    target.addScaledVector(r,-dx*k).addScaledVector(f,dy*k); clampTarget();
  }else if(rotating){ yawTarget-=dx*0.008; yaw=yawTarget; }
  else pick(e.clientX,e.clientY,false);
});
/* Double-click used to fly the camera onto a district. Two clicks on a town is
   now two slaps, and having the camera lunge in on the second one fought the
   thing it was meant to be rewarding. Navigation stays where it is explicit:
   the labels and the sidebar. */
canvas.addEventListener('contextmenu',e=>e.preventDefault());
/* On WINDOW, not on the canvas. The label layer is HTML sitting on top of the
   scene, and a label under the cursor swallowed the wheel event — which is the
   "sometimes zoom just stops working" bug. */
listen(window,'wheel',e=>{
  if(POV.bird){ e.preventDefault(); return; }
  if(e.target.closest&&e.target.closest('[data-world-overlay]'))return;
  e.preventDefault();
  /* Zoom toward the cursor. Without it, leaning into a district on the far side
     of the map means chasing it around with the pan. */
  const before=groundAt(e.clientX,e.clientY,0);
  /* Respect the magnitude, not just the sign — a trackpad flick and a mouse
     notch are very different amounts of "zoom", and one fixed step makes
     crossing a world this size take thirty scrolls. */
  zoomTarget=clamp(zoomTarget*Math.exp(clamp(e.deltaY,-320,320)*0.0022),ZMIN,ZMAX);
  zoom+=(zoomTarget-zoom)*0.6; syncCam();
  const after=groundAt(e.clientX,e.clientY,0);
  if(before&&after){ target.x+=before.x-after.x; target.z+=before.z-after.z; clampTarget(); }
},{passive:false});
/* A fit needs a viewport to fit INTO. Boot this page in a background tab and
   VW/VH are both 0; 0/0 is NaN, that NaN reaches the camera's
   aspect and the projection matrix goes NaN, and from then on nothing renders —
   permanently, because placeCam() re-derives from the same poisoned zoom, so no
   later resize can dig it out. A degenerate viewport therefore DEFERS the fit
   and the first real one performs it. */
let fitPending=null;
const reflow=()=>{
  /* FIRST, and before anything reads a dimension: everything below sizes
     itself off the box, so the box has to be true before any of it runs. */
  measure();
  /* Re-read the ratio, don't just re-read the size: dragging the window to a
     second monitor changes devicePixelRatio, and sizePost below picks the new
     one up for its buffers whether the canvas does or not. */
  renderer.setPixelRatio(dprCap());
  renderer.setSize(VW,VH); drawSpark();
  /* Safe despite sizePost's consts being declared further down: module
     evaluation is synchronous, so no resize can fire before they exist. */
  sizePost();
  if(fitPending&&VW>0&&VH>0){ const b=fitPending; fitPending=null; frameBounds(b); }
  else placeCam();
};
/* A drag-resize fires dozens of times a second and every one of those
   reallocates four render targets. The screen paints once a frame regardless,
   so the last size before a paint is the only one that was ever going to be
   seen. */
let resizeDirty=false;
const queueReflow=()=>{ resizeDirty=true; };
listen(window,'resize',queueReflow);
/* Restoring a background tab does not always fire resize, and this is exactly
   the case that boots at 0x0 — so the visibility flip has to reflow too. */
listen(document,'visibilitychange',()=>{ if(!document.hidden) queueReflow(); });
/* And the case neither of those catches: the WINDOW stays exactly the size it
   was and this box does not. A scrollbar appears, a modal puts a margin on
   every fixed layer on the page, a browser reserves a gutter — none of it is a
   resize event, and all of it moves the pixels the world is drawn into. This
   is also what makes the first fit reliable, since a container measured during
   the same frame it was mounted in has not always been laid out yet. */
const boxObserver=typeof ResizeObserver==='function'
  ? new ResizeObserver(queueReflow) : null;
if(boxObserver) boxObserver.observe(rootEl);

/* Fit the world to the part of the screen the UI is not standing on. Fitting to
   the window instead puts a third of a 40-district world behind the panel. */
const PAD={l:296,r:18,t:22,b:112};
/* The world view stacks its realm names upward on stems, so it needs real
   headroom reserved before the fit runs. */
const padT=()=>OPEN?PAD.t:96;
function frameWorld(){ frameBounds(OPEN?OPEN.bounds:W.worldBounds); }
function frameBounds(b){
  if(!(VW>0&&VH>0)){ fitPending=b; return; }
  target.set((b.x0+b.x1)/2, 6, (b.z0+b.z1)/2);
  zoom=1; syncCam();
  const aspect=VW/VH;
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
  const p=new THREE.Vector3();
  /* Sample the PLACES, not the corners of the rectangle around them. An
     isometric camera turns a bounding box into a diamond, and a roughly round
     cluster of islands leaves that diamond's four corners empty — a third of
     the screen spent on sky, which is why the world opened up so small. */
  const discs=OPEN
    ? OPEN.list.filter(d=>d.shown>0)
        .map(d=>[d.x,d.z,terrR(Math.max(1,d.level)),-4,d.baseY+3+d.level*0.9])
    : W.quarters.filter(q=>q.shown>0).map(q=>{
        const R=spec(Math.max(1,q.level)).radius;
        return [q.x,q.z,R+1.5,-R*0.85,R*0.7+4];
      });
  if(!discs.length) discs.push([(b.x0+b.x1)/2,(b.z0+b.z1)/2,20,-8,12]);
  for(const [cx,cz,R,lo,hi] of discs)
    for(let k=0;k<8;k++){
      const a2=k/8*TAU, x=cx+Math.cos(a2)*R, z=cz+Math.sin(a2)*R;
      for(const y of [lo,hi]){
        p.set(x,y,z).project(cam);
        const u=p.x*aspect, v=p.y;
        u0=Math.min(u0,u); u1=Math.max(u1,u); v0=Math.min(v0,v); v1=Math.max(v1,v);
      }
    }
  const availW=Math.max(120,VW-PAD.l-PAD.r);
  const availH=Math.max(120,VH-padT()-PAD.b);
  const z=Math.max((u1-u0)*VH/(2*availW),(v1-v0)*VH/(2*availH));
  zoomTarget=zoom=clamp(z,ZMIN,ZMAX);
  /* Recentre on the visible rectangle rather than on the window's middle. */
  const k=zoom/VH*2;
  const ou=k*(PAD.l+availW/2-VW/2), ov=k*(VH/2-padT()-availH/2);
  const R=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
  const F=new THREE.Vector3(-Math.cos(yaw),0,-Math.sin(yaw));
  const cu=(u0+u1)/2, cv=(v0+v1)/2;   // already world units: at zoom 1 the map is 1:1
  target.addScaledVector(R,cu-ou).addScaledVector(F,cv-ov);
  syncCam();
}
function flyTo(d){
  target.set(d.x,d.baseY||0,d.z);
  zoomTarget=clamp(spec(Math.max(d.level,4)).radius*2.4,ZMIN,ZMAX);
  clampTarget();
}
/* ================================================================= picking */
function pick(cx,cy,click){
  if(!W)return;
  /* Whether a bird is on offer is decided on HOVER, every move, and the reticle
     is the offer being made. Never re-decided on the click itself. */
  if(!click) setHover(POV.bird?null:birdAt(cx,cy));
  const p=groundAt(cx,cy,0);
  let hit=null;
  if(p&&OPEN&&W.own){
    const o=W.own.get(hexKey(...hexAt(p.x,p.z)));
    hit=o===undefined?null:W.districts[o];
  }else if(p&&!OPEN){
    /* At world scale an island is a disc, and the nearest one you are standing
       inside is the one you mean. */
    for(const q of W.quarters){
      if(q.shown<=0)continue;
      if(Math.hypot(p.x-q.x,p.z-q.z)<=spec(Math.max(1,q.level)).radius+3){ hit=q; break; }
    }
  }
  /* No hover card at either scale. Nothing follows the cursor now: `hovered` is
     still tracked, but the only thing it does is light the plot border under the
     pointer. The affordance the card used to carry — "click to walk in" — is
     already stated in the hint bar, permanently, where it does not have to
     appear over the world to be read. */
  if(hit!==hovered){ hovered=hit; paintBorders(); }
  if(click){
    /* Only the bird the reticle is already on. Re-testing the cursor here
       instead would let a bird that happened to fly under the pointer between
       press and release swallow a click aimed at a realm — which is exactly the
       failure this is built to make impossible. */
    const bird=POV.aim;
    POV.aim=null;
    if(bird&&bird[0].parent){ possess(bird[0],bird[1]); return; }
    if(!OPEN) { if(hit) enterRealm(hit); }
    else{
      /* Inside a realm a click on a town is a SLAP, full stop. It used to have
         to earn it by selecting first, which meant the one gesture people
         actually try on a town did nothing the first time. Selection still
         happens — it lights the plot border and syncs the sidebar — but it
         moves nothing, so the two never fight over the same click. */
      if(hit&&hit.built) slap(hit,clock.getElapsedTime());
      select(hit?hit.i:null);
    }
  }
}
/* Selection lights the district's plot border and syncs the sidebar. It used
   to do considerably more: the selected district was REBUILT — torn down and
   raised again — so that it could skip the merge and keep every one of its
   per-object ticks, and the one you clicked away from was rebuilt a second time
   to put it back. That rebuild is the visible lurch when you click a town, and
   it was buying ambient motion you have to be told is there to notice. The
   things worth animating — wisps, birds, water, the falls — are marked `keep`
   and survive the merge regardless, so nothing that reads is lost. */
function select(i){
  if(selected===i)return;
  selected=i;
  paintBorders(); renderRank(true); emitDistrict();
}
/* Which district is selected, by SLUG, so the overlay can ask the API what this
   reader upvoted in that niche. The slug is the one fact about a district only
   the engine holds: everything else the overlay has is a rank row, and a rank
   row is capped at fourteen while a realm can hold more than fourteen towns.
   Emitted from `select` and from both realm doors, which are the only three
   places `selected` moves. */
function emitDistrict(){
  const d=OPEN&&selected!==null?W.districts[selected]:null;
  emit({district:d?{slug:d.niche.id, name:nameOf(d),
                    color:hexs(d.niche.accent)}:null});
}
function paintBorders(){
  const on=VIEW.border&&!!OPEN;
  for(const d of W.districts){
    if(d.borderMat) d.borderMat.opacity=!on?0:(d.i===selected?1:d===hovered?0.8:0.46);
    if(d.realmBorderMat) d.realmBorderMat.opacity=on?0.72:0;
  }
}

/* ================================================================== labels */
/* The LOD rule, and the reason there is a label layer at all: at world zoom, a
   name per district is forty overlapping names, which is worse than none. So a
   label's tier AND its right to exist are decided by the plot's apparent size,
   with rank breaking every tie. */
const labelBox=$('labels'), leadBox=$('leads');
const SVG='http://www.w3.org/2000/svg';
function makeLead(col){
  const g=document.createElementNS(SVG,'g');
  const l=document.createElementNS(SVG,'line');
  l.setAttribute('stroke',col); l.setAttribute('stroke-opacity','0.75');
  const c=document.createElementNS(SVG,'circle');
  c.setAttribute('r','3.4'); c.setAttribute('fill',col);
  g.appendChild(l); g.appendChild(c); leadBox.appendChild(g);
  return {g,l,c};
}
function drawLead(lead,x1,y1,x2,y2){
  lead.g.style.display='';
  lead.l.setAttribute('x1',x1); lead.l.setAttribute('y1',y1);
  lead.l.setAttribute('x2',x2); lead.l.setAttribute('y2',y2);
  lead.c.setAttribute('cx',x1); lead.c.setAttribute('cy',y1);
}
const hideLead=l=>{ if(l) l.g.style.display='none'; };

/* Put a label OUT of the masses rather than above them. The direction is the
   one pointing away from the middle of everything on screen, so labels fan out
   around the world like a starburst and land on sky; if that spot is taken, the
   direction swings around before the distance grows. A leader line goes back to
   a dot on the ground at the middle of the place, so a label always says which
   thing it belongs to no matter where it ended up. */
/* `discs` is every OTHER place on screen — {x,y,r} in pixels. Without it the
   solver only avoided other LABEL PLATES, which is why the biggest, most central
   district put its plate 63px inside its neighbour: it is ranked first, so there
   were no plates to collide with yet and the very first candidate won by default.
   A label has to know about the ground, not just about other labels. */
/* `bias` charges a candidate for how far its bearing has swung off "straight out
   from the middle of everything", in pixels per degree. Districts pass 0 and keep
   pure shortest-leader placement, which is what the packing in a realm needs.
   Realms pass a real number, because at world scale the six names want to FAN —
   the old solver got that free by walking the bearings outward-first and taking
   the first fit, and scoring purely on leader length quietly threw it away. */
function placeOut(px,py,rx,ry,up,w,h,boxes,ox,oy,discs,self,bias=0){
  let dx=px-ox, dy=py-oy, m=Math.hypot(dx,dy);
  if(m<1)  { dx=0; dy=-1; } else { dx/=m; dy/=m; }
  /* Every edge comes off the overlay's own insets, top included. The lab bounded
     the top at a flat 8px because nothing was standing there; a phone puts the
     identity bar exactly where the tallest realm wants its name. */
  const onScreen=(x,y)=>
    !(x-w/2<PAD.l+6||x+w/2>VW-PAD.r-6
      ||y-h/2<PAD.t+6||y+h/2>VH-PAD.b-6);
  const hitsPlate=(x,y)=>{
    for(const b of boxes)
      if(Math.abs(b.x-x)*2<b.w+w+12 && Math.abs(b.y-y)*2<b.h+h+10) return true;
    return false;
  };
  /* How much empty ground is under this spot: the smallest gap from the plate's
     rectangle to any foreign disc. Negative means it is sitting ON someone. */
  const clearance=(x,y)=>{
    let worst=Infinity;
    if(discs) for(const c of discs){
      if(c.self===self) continue;
      const gx=Math.max(Math.abs(x-c.x)-w/2,0), gy=Math.max(Math.abs(y-c.y)-h/2,0);
      const g=Math.hypot(gx,gy)-c.r;
      if(g<worst) worst=g;
    }
    return worst;
  };
  /* ROTATION IS THE OUTER FALLBACK, NOT DISTANCE. Sweeping ext inside rot meant
     a blocked label was thrown 58px further out along the same bearing before
     the solver ever tried the free space 20° around, so .NET, GIT & VCS and
     PYTHON all ended up parked over their neighbours instead of tucked beside
     their own island. Every angle is tried at the tightest distance first; the
     radial extension only opens up once no angle fits at all. */
  let best=null, bestLead=Infinity;   // shortest leader that lands on empty ground
  let fall=null, fallSc=-Infinity;    // least-bad, for when nothing is clean at all
  for(const ext of [0,26,58]){
    for(const rot of [0,20,-20,42,-42,64,-64,90,-90,120,-120,150,-150,180]){
      const a=Math.atan2(dy,dx)+rot*Math.PI/180;
      const cs=Math.cos(a), sn=Math.sin(a);
      /* Clearance is the plate's OWN reach in the direction it is travelling —
         its support radius, not half its diagonal. Using the diagonal threw a
         250px-wide plate a hundred and thirty pixels out even when it was going
         straight up, which is how the Swarm and the Bastion ended up in orbit. */
      const pad=(Math.abs(cs)*w+Math.abs(sn)*h)/2+10;
      /* The mass reads as an ellipse on screen; the crown height only counts on
         the side the label is actually passing over. */
      const rr=1/Math.hypot(cs/Math.max(4,rx*0.86),sn/Math.max(4,ry*0.86))
               +(sn<0?up*0.34:0);
      const d=rr+pad+ext;
      const x=px+cs*d, y=py+sn*d;
      if(!onScreen(x,y)||hitsPlate(x,y)) continue;
      const clr=clearance(x,y);
      /* Among spots that land on empty ground, take the CLOSEST rather than the
         first found. First-fit walks the bearings in a fixed order, so it would
         happily accept a spot most of the way across the realm while a shorter
         one sat two bearings later in the list. */
      if(clr>=0){ const lead=Math.hypot(x-px,y-py)+bias*Math.abs(rot);
                  if(lead<bestLead){ bestLead=lead; best={x,y}; } continue; }
      /* Nothing clean yet — remember the least-bad. Distance is a mild tiebreak
         so a marginally emptier spot is not bought with a much longer leader. */
      const sc=clr-ext*0.15;
      if(sc>fallSc){ fallSc=sc; fall={x,y}; }
    }
  }
  /* HOME: the plate on the district's own crown, leader length zero. Every realm
     with more than a handful of districts has one in the middle, and for that one
     every bearing points across somebody else's rooftops — so the shortest honest
     placement is the patch of ground it is actually entitled to cover.
     It competes on distance rather than winning outright: charged 2.2x its own
     radius, it only beats an outward spot that is genuinely far. In the author's
     Frameworks realm that is exactly one district of eight — JS/TS, the biggest
     and the most hemmed in, whose nearest clean sky was 245px away. */
  const hx=px, hy=py-up*0.5;
  /* Home tolerates a little lap onto the neighbours, where an outward spot does
     not. A plate is WIDER than the district it names — 214px of label over an
     80px town — and districts are packed at 92%, so a plate at home always laps
     slightly whatever is beside it. Measured across the author's realms the lap
     is 8–24px against outward alternatives 100–227px away; holding home to a
     hard zero rejected it every time and shipped the long leader instead. */
  const homeOK=onScreen(hx,hy)&&!hitsPlate(hx,hy)&&clearance(hx,hy)>=-rx*0.35;
  /* Home does not compete when a bearing bias is in play. bestLead is carrying
     the bias penalty by then, so the two are no longer measured in the same
     units — and at world scale a plate sitting on the realm it names is the
     failure this whole path exists to avoid. It stays as a last resort below. */
  if(!bias&&homeOK&&rx*2.2<bestLead) return {x:hx,y:hy};
  if(best) return best;
  if(homeOK) return {x:hx,y:hy};
  return fall;
}

/* The rung a plate carries on its owner's own world: how far through its current
   level the plot is, as a bar, plus how many articles are left of it. `div`
   stretches the ladder for a realm (see REALM_DIV in ../ladder).

   The count goes ON the existing line rather than on a line of its own because
   the solver that places these plates works from fixed box sizes: every element
   that comes and goes is another size it has to be told about, and the two
   callers already have to widen their boxes for the text this returns.

   Returns the suffix and sets the bar, because the two are the same fact and
   splitting them across two calls is two chances to show one without the other.
   Empty and hidden when there is nothing to say: a stranger's world, bare
   ground, or a plot with nothing read into it yet. */
function rung(x,shown,div){
  if(!LVLPROG||W.unbuilt||shown<=0){ x.elPg.style.display='none'; return ''; }
  const p=levelProgress(shown,div);
  x.elPg.style.display='block';
  x.elPgI.style.width=(clamp(p.fraction,0,1)*100).toFixed(1)+'%';
  /* Nothing above L12: the bar sits full and the line says no more than the
     count it is already carrying. */
  return p.next?' · '+fmt(p.toNext)+' to L'+(p.level+1):'';
}

function buildLabels(){
  labelBox.querySelectorAll('.lb').forEach(e=>e.remove());
  leadBox.innerHTML='';
  for(const d of W.districts){
    const e=document.createElement('div');
    e.className='lb t1'; e.style.color=hexs(d.niche.accent);
    e.innerHTML='<div class="box"><div class="nm"></div><div class="mt"></div>'
               +'<div class="sb"></div><div class="pg"><i></i></div></div>'
               +'<div class="stem"></div><div class="pin"></div>';
    e.onclick=()=>{ select(d.i); flyTo(d); };
    e.onmouseenter=()=>{ hovered=d; paintBorders(); };
    e.onmouseleave=()=>{ hovered=null; paintBorders(); };
    labelBox.appendChild(e);
    d.el=e; d.elNm=e.querySelector('.nm'); d.elMt=e.querySelector('.mt');
    d.elBn=e.querySelector('.sb'); d.elPg=e.querySelector('.pg');
    d.elPgI=e.querySelector('.pg i'); d.lead=makeLead(hexs(d.niche.accent));
  }
  for(const g of W.quarters){
    const e=document.createElement('div');
    e.className='lb rl t2'; e.style.color=hexs(g.realm.accent);
    e.innerHTML=`<div class="box"><div class="nm">${g.realm.name}</div>`
               +`<div class="sb">${g.realm.theme}</div>`
               +`<div class="mt"></div><div class="pg"><i></i></div></div>`
               +`<div class="stem"></div><div class="pin"></div>`;
    e.onclick=()=>enterRealm(g);
    e.onmouseenter=()=>{ if(!OPEN)hovered=g; };
    e.onmouseleave=()=>{ if(!OPEN)hovered=null; };
    labelBox.appendChild(e);
    g.el=e; g.elS=e.querySelector('.mt'); g.elPg=e.querySelector('.pg');
    g.elPgI=e.querySelector('.pg i'); g.lead=makeLead(hexs(g.realm.accent));
  }
}
const _v=new THREE.Vector3();
function project(x,y,z){
  /* Same trap as the fit: labels are laid out right after placeCam(), before
     any render has refreshed the camera's inverse matrix. That one-frame-stale
     matrix is the offset between a label and the thing it points at. */
  _v.set(x,y,z).project(cam);
  return [(_v.x*0.5+0.5)*VW,(-_v.y*0.5+0.5)*VH,_v.z];
}
/* The solved layout is a pure function of these, and nothing else: the camera,
   the viewport, which view you are in, the day, and the version counter that
   covers every place raised, hidden or re-levelled. The easings converge to
   their targets exactly rather than asymptotically, so a camera that has come
   to rest produces a bit-identical key and the solve — tens of thousands of
   clearance tests, plus a transform written per label — is skipped outright. */
let labelKey='';
function layoutLabels(){
  if(!VIEW.labels){
    for(const d of W.districts){ d.el.style.opacity='0'; hideLead(d.lead); }
    for(const g of W.quarters){ g.el.style.opacity='0'; hideLead(g.lead); }
    labelKey='';
    return;
  }
  const key=[yaw,zoom,target.x,target.y,target.z,fade,VW,VH,
             OPEN?OPEN.realm.id:'',DAY,worldVer].join(',');
  if(key===labelKey)return;
  labelKey=key;
  const scale0=VH/(2*zoom);
  /* The middle of everything on screen — every label points away from it. */
  const shown=OPEN?OPEN.list.filter(d=>d.built):W.quarters.filter(q=>q.shown>0);
  let ox=0,oy=0;
  for(const x of shown){ const [a,b]=project(x.x,0,x.z); ox+=a; oy+=b; }
  if(shown.length){ ox/=shown.length; oy/=shown.length; } else { ox=VW/2; oy=VH/2; }
  /* WORLD view: realm names only, always, big — there are at most six of them
     and they are the entire read at this scale. */
  if(!OPEN){
    for(const d of W.districts){ d.el.style.opacity='0'; hideLead(d.lead); }
    /* And the realms nobody has founded yet. The loop below only visits the
       ones with something in them, so scrubbing back past a realm's first
       article used to leave its plate and its leader line on screen, still
       reading the count from the day you came from. */
    for(const g of W.quarters) if(g.shown<=0){
      g.el.style.opacity='0'; hideLead(g.lead);
    }
    /* Plate metrics are in PIXELS, so they do not shrink with the map — six
       250px plates on a 400px phone cannot be packed anywhere and the solver
       falls back to "least bad", which is six names in a heap. The narrow
       plates are the same component one size down; the CSS follows. */
    const wide=VW>=700;
    /* The rung line lengthens the count and adds a bar under it, and the solver
       works from fixed sizes rather than from measuring the DOM, so the box has
       to be told. Under-reserving here is plates overlapping the thing they name. */
    const rungOn=LVLPROG&&!W.unbuilt;
    const boxes0=[], w0=(wide?250:150)+(rungOn?54:0), h0=(wide?72:56)+(rungOn?7:0);
    const live0=[...W.quarters].filter(q=>q.shown>0).sort((a,b)=>b.shown-a.shown);
    /* The realms' own footprints, so the solver can see the ground it is about
       to cover. Without this the district fix reached the realm labels as a
       REGRESSION rather than not at all: placeOut treats a missing `discs` as
       infinite clearance, so every on-screen spot scored as clean ground, the
       solver collapsed to "shortest leader" — losing the push away from the
       middle that gave these labels their anchoring — and homeOK came out
       unconditionally true, which parked plates on the islands they name. */
    const discs0=live0.map(q=>{
      const [x,y]=project(q.x,0.4,q.z);
      return {x,y,r:spec(Math.max(1,q.level)).radius*scale0*0.86,self:q};
    });
    for(const g of live0){
      const R=spec(Math.max(1,g.level)).radius;
      const [px,py,pz]=project(g.x,0.4,g.z);
      if(pz<-1||pz>1){ g.el.style.opacity='0'; hideLead(g.lead); continue; }
      const rx=R*scale0, ry=R*scale0*0.82;
      const up=Math.max(0,py-project(g.x,R*0.85+6,g.z)[1]);
      /* Every realm you have read keeps its name, always. Six labels is not a
         decluttering problem, and a realm with no name reads as a place the map
         forgot — so if the solver runs out of room it still gets a spot. */
      const at=placeOut(px,py,rx,ry,up,w0,h0,boxes0,ox,oy,discs0,g,1.6)
               ||{x:px,y:py-rx-h0};
      boxes0.push({x:at.x,y:at.y,w:w0,h:h0});
      g.el.className='lb rl t2';
      g.el.style.transform=`translate(${at.x|0}px,${at.y|0}px) translate(-50%,-50%)`;
      g.el.style.opacity=String(fade);
      drawLead(g.lead,px,py,at.x,at.y);
      g.lead.g.style.opacity=String(fade);
      /* Name and subject, and no third line: an unbuilt realm has no count to
         show, and six labels all repeating the same instruction is the
         instruction shouted six times. The page asks once, on the world. */
      const txt=W.unbuilt?'':arts(g.shown)+rung(g,g.shown,REALM_DIV);
      if(g.elS.textContent!==txt) g.elS.textContent=txt;
    }
    return;
  }
  for(const g of W.quarters){ g.el.style.opacity='0'; hideLead(g.lead); }
  /* Pixels per world unit drives the whole ladder. The TIER is per district —
     a district four times the size earns its level and article count four times
     sooner, which is the same "the loud parts stay named" rule the budget
     applies — while the budget and the realm-label fade run off a typical
     district, so the ladder does not lurch when one giant is on screen. */
  const scale=scale0;
  const plotPx=OPEN.medRt*2*scale;
  const budget= plotPx<30?3 : plotPx<52?6 : plotPx<96?14 : plotPx<200?26 : 999;

  /* Realm labels are the far-zoom read and hand over to district names as you
     lean in. They claim their boxes FIRST, so the two systems never shout about
     the same patch of ground. */
  const boxes=[];
  const ranked=OPEN.list.filter(d=>d.built).sort((a,b)=>b.shown-a.shown);
  /* Every district's footprint on screen, projected once for the whole pass so
     the solver can see the ground it is about to cover. Same radius the labels
     clear — the land, not the territory. */
  const discs=ranked.map(d=>{
    const [x,y]=project(d.x,LAND_TOP+0.3,d.z);
    return {x,y,r:spec(Math.max(1,d.level)).radius*scale*0.86,self:d};
  });
  let used=0;
  for(const d of ranked){
    const e=d.el;
    const [px,py,pz]=project(d.x,LAND_TOP+0.3,d.z);
    /* NOTHING a pointer does changes a label any more — not hover, not click.
       A plate that swells, lights up or jumps the decluttering budget rewrites
       the map under the cursor, and on a map whose whole job is to be read that
       is a worse trade than the affordance was worth. The plates are now purely
       a function of where the districts are and how big they are on screen. */
    if(pz<-1||pz>1||used>=budget){
      e.style.opacity='0'; e.style.pointerEvents='none'; hideLead(d.lead); continue;
    }
    const dpx=terrR(d.level)*2*scale;
    /* Plates are opaque and cover the town underneath, so they are earned
       rather than given: a bare name until a district is genuinely big on
       screen. There used to be a third, larger tier for whichever district you
       had selected — that is gone with the rest of the pointer states, so size
       is now purely a function of how big the district is on screen. */
    const t=dpx<190?1:2;
    /* Same reservation the realm plates make, one scale down. Only the second
       tier carries a count, so only it grows. */
    const rungOn=LVLPROG&&!W.unbuilt&&t>=2;
    const w=t>=2?168+(rungOn?46:0):104, h=t>=2?58+(rungOn?7:0):32;
    /* Clear the LAND, not the territory. terrR is the district's plot — its
       island plus the verge the border and the open ground live in — and
       clearing that put every plate a further four world-units out, over the
       neighbour's ground, which is how .NET, GIT & VCS and PYTHON ended up
       parked on someone else's district. The realm labels above already clear
       spec().radius; this is the same rule one scale down. */
    const R=spec(Math.max(1,d.level)).radius;
    const rx=R*scale, ry=R*scale*0.82;
    const up=Math.max(0,py-project(d.x,d.baseY+2.4+d.level*0.8,d.z)[1]);
    const at=placeOut(px,py,rx,ry,up,w,h,boxes,ox,oy,discs,d);
    if(!at){ e.style.opacity='0'; e.style.pointerEvents='none'; hideLead(d.lead); continue; }
    boxes.push({x:at.x,y:at.y,w,h}); used++;

    e.className='lb t'+t;
    e.style.transform=`translate(${at.x|0}px,${at.y|0}px) translate(-50%,-50%)`;
    e.style.opacity=String(clamp((plotPx-12)/18,0.42,1)*fade);
    drawLead(d.lead,px,py,at.x,at.y);
    d.lead.g.style.opacity=String(0.8*fade);
    const nm=nameOf(d);
    if(d.elNm.textContent!==nm) d.elNm.textContent=nm;
    if(t>=2){
      const mt=arts(d.shown)+rung(d,d.shown,1);
      if(d.elMt.textContent!==mt) d.elMt.textContent=mt;
    }else{
      /* A bare name over the world hides its count in CSS, and the bar has to go
         with it — but `rung` writes display inline, and inline beats the class. */
      d.elPg.style.display='none';
    }
    /* The banner line only ever appeared on the third tier, which was the
       selected district's plate — so it goes with it. A district's heraldry is
       still on the district itself, which is where it was always doing the
       work; the plate only ever repeated it in words. */
  }
  for(const d of W.districts) if(!d.built||d.realm!==OPEN.realm){
    d.el.style.opacity='0'; hideLead(d.lead); }
}

/* ---------------------------------------------------- read pulses (replay) */
const fxPool=[];
for(let i=0;i<26;i++){
  const e=document.createElement('div'); e.className='fx'; e.style.opacity='0';
  labelBox.appendChild(e); fxPool.push({e,t:-1,d:null});
}
let fxNext=0;
/* Takes a district or a realm — at world scale the thing that just got read is
   a realm, and reaching for `.niche` on one threw on the first day of every
   world-level replay, which is why it went nowhere. */
function pulse(x,n){ say(x,'+'+n,x.niche?x.niche.accent:x.realm.accent); }
function layoutFx(t){
  for(const f of fxPool){
    if(f.t<0)continue;
    const u=(t-f.t)/1.6;
    if(u>=1){ f.e.style.opacity='0'; f.t=-1; continue; }
    const [sx,sy]=project(f.d.x,(f.d.baseY||0)+4+u*8,f.d.z);
    f.e.style.transform=`translate(${sx|0}px,${sy|0}px) translate(-50%,-100%)`;
    f.e.style.opacity=String((1-u)*0.95);
  }
}

/* ================================================================== replay */
let DAY=0, playing=false, speed=1, acc=0;
const DPS=30;                 // log-days per second at 1× — a whole history in ~50 s

/* Read the day's totals into the model, whichever view is standing. */
function readDay(t){
  for(const d of W.districts) d.shown=W.cum[t*W.nD+d.i];
  for(const q of W.quarters) q.shown=q.list.reduce((s,d)=>s+d.shown,0);
}
/* Jumping anywhere in time: rebuild only what differs from what is standing. */
function applyDay(t){
  /* Scrubbing the timeline rebuilds everything standing, so whatever the hand
     is holding is about to be disposed under it. */
  handAbort();
  DAY=t; readDay(t);
  if(OPEN){
    for(const d of W.districts){
      const L=d.realm===OPEN.realm?W.lvl[t*W.nD+d.i]:0;
      if(L===0){ if(d.built)hideDistrict(d); continue; }
      if(!d.built||d.level!==L) raise(d,L,false);
    }
    /* raise() and hideDistrict() are the only two things that move a border,
       and both raise the flag — so an unset flag means the land standing here
       is already the land this day wants. */
    if(landDirty) buildLand();
  }else{
    for(const q of W.quarters){
      const L=realmLevelOf(q.shown);
      q.skyStale=false; q.queued=0;
      if(L===0){ if(q.island)hideRealm(q); continue; }
      /* An island is a pure function of (plot, level, signatures), so one whose
         three inputs are unchanged would be rebuilt into the same pixels — and
         a rebuild is ~100ms. Dragging the scrubber a day at a time moves almost
         none of them, which is what made the drag unusable. */
      if(!q.island||q.level!==L||q.sigKey!==realmSigKey(q)) raiseRealm(q,L,false);
    }
  }
  queue.length=0;
  if(!OPEN) worldDay=t;
  updateHud(); renderRank(true); paintBorders();
}
/* Stepping forward during playback is the cheap path: only what changed is
   touched, and the rebuilds are queued so a burst of level-ups at 16× can never
   stall a frame. */
function step(t){
  const prev=DAY; DAY=t; readDay(t);
  if(OPEN){
    for(const d of OPEN.list){
      const L=W.lvl[t*W.nD+d.i];
      const dn=d.shown-W.cum[prev*W.nD+d.i];
      if(L===0)continue;
      if(!d.built){
        d.queued=L; queue.push(d);
        toast('FOUNDED',nameOf(d),d.niche.accent);
      }else if(L>(d.queued||d.level)){
        d.queued=L; if(!queue.includes(d)) queue.push(d);
        /* The number, not the rung's name. A ladder of twelve invented names is
           a second vocabulary to learn before the toast means anything, and
           "LEVEL 7" says the one thing the reader is actually being told. */
        toast('LEVEL '+L,nameOf(d),d.niche.accent);
      }
      if(dn>0&&d.built) pulse(d,dn);
    }
  }else{
    for(const q of W.quarters){
      const L=realmLevelOf(q.shown);
      const dn=q.shown-q.list.reduce((s,d)=>s+W.cum[prev*W.nD+d.i],0);
      if(L===0)continue;
      const pending=q.queued||0;
      if(!q.island&&!pending){
        q.queued=L; queue.push(q);
        toast('DISCOVERED',q.realm.name,q.realm.accent);
      }else if(q.island&&L>Math.max(pending,q.level)){
        q.queued=L; if(!queue.includes(q)) queue.push(q);
        toast('GREW',q.realm.name+' · '+arts(q.shown),q.realm.accent);
      }else{
        /* A district levelling up raises the monument it contributes, but
           rebuilding a whole realm island for it mid-playback is ~100 ms of
           work per realm — the stutter people saw. The skyline is refreshed
           when the replay stops instead. */
        if(q.island&&q.list.some(d=>d.shown>0&&W.lvl[t*W.nD+d.i]!==W.lvl[prev*W.nD+d.i]))
          q.skyStale=true;
      }
      if(dn>0&&q.island) pulse(q,dn);
    }
  }
  if(!OPEN) worldDay=t;
}
function toast(tag,text,color){
  const f=$('feed'), e=document.createElement('div');
  e.className='toast';
  e.innerHTML=`<span class="tag" style="color:${hexs(color)}">${tag}</span><b>${text}</b>`;
  f.prepend(e);
  while(f.children.length>7) f.lastChild.remove();
  setTimeout(()=>{ e.style.transition='opacity .5s'; e.style.opacity='0';
                   setTimeout(()=>e.remove(),520); },3400);
}

/* The counters, the ranking and the sparkline all used to write straight into
   the lab's panel. They push a state object at the overlay instead — same
   numbers, same throttles, and the one thing the engine still draws itself is
   the sparkline, because it is a canvas and the pixels are its own. */
function updateHud(){
  let founded=0,total=0;
  for(const d of W.districts){ if(d.shown>0)founded++; total+=d.shown; }
  const realms=W.quarters.filter(q=>q.shown>0).length;
  /* The one line here that points FORWARD. Everything else is a record of what
     has happened; this is the next thing that will, and it is the difference
     between a portrait and a thing you want to work on. Cheapest possible
     motivation: it is already true, it needs no new data, and at one article it
     says "two more and this becomes a Cairn" — a sentence nobody can read
     without knowing exactly what to do next. */
  let nx=null;
  for(const d of W.districts){
    if(d.shown<=0)continue;
    const L=levelOf(d.shown);
    if(L>=LEVELS.length)continue;
    const need=LEVELS[L].reads-d.shown;
    if(!nx||need<nx.need) nx={d,need,L};
  }
  emit({
    day:DAY, date:W.days[DAY],
    /* COUNT WHAT EXISTS, not what is missing. These used to read "4/40" and
       "4/6", which tells somebody who has just arrived that they own ten
       percent of a world — the same indictment the fixed 40-plot map was killed
       for, restated as a number. A world of four districts is a complete world
       of four districts. */
    /* Nothing has been read, so every one of these is zero — the seed district
       under each unbuilt realm is scaffolding for the layout, not a fact about
       anybody, and it must never reach a counter. */
    articles:W.unbuilt?0:total,
    districts:W.unbuilt?0:founded,
    realms:W.unbuilt?0:realms,
    open: OPEN?{ id:OPEN.realm.id,
                 name:OPEN.realm.name,
                 theme:OPEN.realm.theme,
                 districts:OPEN.list.filter(d=>d.shown>0).length,
                 articles:OPEN.shown }:null,
    next: nx&&!W.unbuilt?{ need:nx.need, name:nameOf(nx.d), level:nx.L+1,
               color:hexs(nx.d.niche.accent) }:null,
  });
  renderRank(false);
}
let rankT=0;
function renderRank(force){
  const now=performance.now(); if(!force&&now-rankT<220)return; rankT=now;
  /* The rail lists what is standing, and on an unbuilt world that is six pieces
     of ground. They come in taxonomy order rather than by size, because nothing
     here is bigger than anything else, and they carry a zero — which is what
     the rail reads to leave a row as a name with nothing after it. */
  if(W.unbuilt){
    emit({rank:W.quarters.map(q=>({
      key:q.realm.id, name:q.realm.name,
      level:0, reads:0, color:hexs(q.realm.accent), share:0, selected:false,
    }))});
    return;
  }
  const list=(OPEN?OPEN.list:W.quarters).filter(x=>x.shown>0)
    .sort((a,b)=>b.shown-a.shown).slice(0,OPEN?14:6);
  const max=list.length?list[0].shown:1;
  emit({rank:list.map(x=>({
    key: OPEN?x.niche.id:x.realm.id,
    name: OPEN?nameOf(x):x.realm.name,
    level: OPEN?(x.level||levelOf(x.shown)):Math.max(1,realmLevelOf(x.shown)),
    reads: x.shown,
    color: hexs(OPEN?x.niche.accent:x.realm.accent),
    share: Math.max(4,x.shown/max*100),
    selected: !!OPEN&&x.i===selected,
  }))});
}

/* Four years of reading at a glance, each day coloured by the realm that owned
   it — the scrubber needs to show you where the interesting parts are. The
   canvas belongs to the overlay, so it is handed in once and remembered. */
let sparkCanvas=null;
function drawSpark(c){
  if(c!==undefined) sparkCanvas=c;
  const el=sparkCanvas; if(!el)return;
  const w=el.width=Math.max(1,el.clientWidth*devicePixelRatio);
  const h=el.height=Math.max(1,el.clientHeight*devicePixelRatio);
  const g=el.getContext('2d'); g.clearRect(0,0,w,h);
  /* One day is not a history. The scrubber is on screen while the growth log is
     still on the wire, and a single bar pinned to its left edge reads as a
     world with one day in it rather than as one still loading. */
  if(!W||W.nT<2)return;
  /* Which realm owned each day does not depend on how wide the canvas is, and
     working it out is nT×nD — some fifty thousand steps on a four year history,
     which was being redone on every resize event. It is a property of the
     model, so it is computed once and kept on it. */
  if(!W.sparkCols){
    const cols=new Array(W.nT);
    for(let i=0;i<W.nT;i++){
      let best=null,bn=0;
      for(let d=0;d<W.nD;d++){
        const n=W.cum[i*W.nD+d]-(i?W.cum[(i-1)*W.nD+d]:0);
        if(n>bn){bn=n;best=W.districts[d].realm;}
      }
      cols[i]=best?hexs(best.accent):'#4B4E57';
    }
    W.sparkCols=cols;
    let mx=1; for(let i=0;i<W.nT;i++) mx=Math.max(mx,W.daily[i]);
    W.sparkMax=mx;
  }
  const cols=W.sparkCols, mx=W.sparkMax;
  const bw=clamp(w/W.nT,1,7*devicePixelRatio);
  g.globalAlpha=0.8;
  for(let i=0;i<W.nT;i++){
    const hgt=Math.pow(W.daily[i]/mx,0.55)*(h-3)+2;
    g.fillStyle=cols[i];
    g.fillRect(i*w/W.nT,h-hgt,bw,hgt);
  }
  g.globalAlpha=1;
}

/* ==================================================================== boot */
async function boot(model){
  /* `district` is cleared here and nowhere else in boot: a soft navigation from
     one world to another reuses this engine, and everything else the overlay
     reads is rewritten by the first frame of the new world. A selection is not
     (nothing selects a town on the way in), so without this the next world opens
     with the last one's district still named over the new reader's upvotes. */
  emit({status:'loading',progress:0.05,message:'Raising the land…',district:null});
  booting=true; booted=false;
  if(W){ for(const d of W.districts) hideDistrict(d);
         for(const q of W.quarters) hideRealm(q); }
  OPEN=null; selected=null; hovered=null;
  queue.length=0; active.length=0;
  rootEl.classList.remove('inrealm');
  W=model;
  /* Once, before anything is raised, so the land is lit right on its first
     frame. The key guard makes every call after this one free — the sky does
     not depend on the world, the day or the reader. */
  applySky();
  layout(W); buildLabels(); drawSpark();
  /* Off the districts, not off the day axis: the first build has one synthetic
     day on it and the real history lands later, and a span that read "1d" until
     it did would be wrong for the whole of the load and then jump. */
  const dayspan=(new Date(W.last)-new Date(W.first))/86400000+1;
  emit({ totalDays:W.nT, replayable:W.replayable,
         from:W.unbuilt?undefined:W.first, to:W.unbuilt?undefined:W.last,
         /* Nothing was read, so there is no first day and no span to report. */
         span: W.unbuilt||!(dayspan>=1)?undefined
             : dayspan<60?Math.round(dayspan)+'d'
             : dayspan<400?Math.round(dayspan/30.4)+'mo'
             : (dayspan/365.25).toFixed(1)+'y' });

  /* Build the finished WORLD first — six realms, not forty towns, so this is a
     second rather than the ten it used to be. */
  const t=W.nT-1;
  readDay(t);
  const order=W.quarters.filter(q=>q.shown>0).sort((a,b)=>b.shown-a.shown);
  let k=0;
  /* Chunked on a timer rather than on a frame: a background tab throttles
     requestAnimationFrame to about 1 Hz, and a world that only finishes loading
     while you are looking at it is not a world that finishes loading. */
  await new Promise((res,rej)=>{
    const chunk=()=>{
      if(disposed){ res(); return; }
      const t1=performance.now();
      try{
        while(k<order.length&&performance.now()-t1<130){
          const q=order[k++];
          raiseRealm(q,realmLevelOf(q.shown),false);
        }
      }catch(err){ rej(err); return; }
      emit({progress:0.1+0.9*k/order.length,
            message:'Raising the land… '+k+' of '+order.length+' realms'});
      if(k<order.length) setTimeout(chunk,0); else res();
    };
    setTimeout(chunk,0);
  });
  if(disposed)return;
  placeClouds();
  booting=false;
  worldRoot.visible=true; landRoot.visible=townRoot.visible=false;
  DAY=t; worldDay=t;
  updateHud(); renderRank(true); paintBorders();
  frameBounds(W.worldBounds);
  buildAir();
  booted=true;
  flushHistory();
  /* emit updates STATE synchronously and only defers the callback, so this tick
     already counts as uncurtained and paints a full frame into the canvas
     before React is told it can take the loading screen down. */
  emit({status:'ready',progress:1});
  tick();
}

/* ================================================================== history
   The world is raised off the districts alone — forty rows, and everything the
   layout needs. The growth log is the same world's whole history, tens of
   thousands of rows on a long reader, and it is only ever needed to REPLAY the
   place. So it is not waited for: it lands here afterwards and is folded in
   underneath a world that is already standing.

   Nothing is rebuilt. The synthetic day the world was raised on carries every
   district's lifetime total, which is exactly what the last day of a complete
   log adds up to — so the geometry the diff below asks for is the geometry
   already on screen, and this costs a `readDay` and a repaint of the HUD. */
let booted=false, pendingHistory=null;
function flushHistory(){
  const m=pendingHistory; pendingHistory=null;
  if(m) attachHistory(m);
}
function attachHistory(model){
  if(disposed)return false;
  if(!booted||booting){ pendingHistory=model; return true; }
  /* Someone else's world, or one whose districts moved under it. Either way the
     day axis about to be swapped in is not indexed the same way, and a `cum`
     read against the wrong column raises the wrong island. */
  if(!W||model.user!==W.user||model.nD!==W.nD)return false;
  for(let i=0;i<W.nD;i++)
    if(model.districts[i].slug!==W.districts[i].slug)return false;
  if(model.nT<2)return false;

  W.days=model.days; W.cum=model.cum; W.lvl=model.lvl; W.daily=model.daily;
  W.nT=model.nT; W.replayable=model.replayable;
  /* Both are memoised off the day axis that was just replaced. */
  W.sparkCols=null; W.sparkMax=0;
  drawSpark();
  emit({totalDays:W.nT, replayable:W.replayable});
  applyDay(W.nT-1);
  return true;
}

/* ================================================================ transport
   The lab wired these to its own buttons. They are the controller's surface
   now, and the overlay drives them — same behaviour, no DOM. */
const stop=()=>{ playing=false; emit({playing:false}); };
function togglePlay(){
  if(!W)return;
  playing=!playing;
  /* Pressing play at the end starts the history over rather than doing nothing,
     which is what everyone tries first. */
  if(playing&&DAY>=W.nT-1) applyDay(0);
  emit({playing});
}
/* A range input fires once per pixel of drag, and each of those used to run a
   full applyDay synchronously. Only the last value before a paint was ever
   going to be seen, so the day is recorded here and applied once, in the tick
   that is about to draw it. */
let pendingDay=-1;
function seekTo(t){
  if(!W)return;
  stop();
  const day=clamp(Math.round(t),0,W.nT-1);
  if(day===DAY&&pendingDay<0)return;
  pendingDay=day;
  /* The scrubber is a controlled input reading this back, so the day and its
     date go out at input rate. Only the world waits for the frame. */
  emit({day, date:W.days[day]});
}
function flushSeek(){
  if(pendingDay<0)return;
  const day=pendingDay; pendingDay=-1;
  if(day!==DAY) applyDay(day);
}


listen(window,'keydown',e=>{
  /* A world whose controls are single letters, and a panel you can now type
     into. Naming a district "SPACE CADET" otherwise replays the timeline twice,
     rotates the camera and rewinds to day one before the word is finished. */
  if(e.target&&(e.target.tagName==='INPUT'||e.target.isContentEditable)) return;
  /* Lowercased WHOLE, not just the single characters. Half-normalising leaves
     'Shift' arriving as 'Shift' while the key set holds 'shift', which is how
     dive silently did nothing while every other control worked. */
  const k=e.key.toLowerCase();
  /* Riding claims the keyboard, and it has to claim ESCAPE FIRST. An early
     return above the Escape branch is how the one key that gets you off the
     bird became the one key that did nothing. */
  if(POV.bird){
    if(k==='escape'){ unpossess(); return; }
    if(POVK.has(k)){
      e.preventDefault(); POV.keys.add(k);
      if(!POV.manual){ POV.manual=true;
        emit({riding:{...(STATE.riding||{}),manual:true}}); }
    }
    /* Space is the replay toggle everywhere else; up here the timeline is
       hidden and it is the only sensible key for "climb". */
    if(k===' ') e.preventDefault();
    return;
  }
  if(k===' '){ e.preventDefault(); togglePlay(); }
  if(k==='q') yawTarget-=Math.PI/4;
  if(k==='e') yawTarget+=Math.PI/4;
  if(k==='f'&&W) frameWorld();
  /* One press out. Deselecting first and only leaving on the second press is
     the kind of thing that reads as "back doesn't work". */
  if(k==='escape'){ if(OPEN){ select(null); leaveRealm(); } else select(null); }
});
listen(window,'keyup',e=>{ POV.keys.delete(e.key.toLowerCase()); });
/* Held keys are only true while the window has focus — alt-tab away mid-dive
   and the keyup never arrives, which leaves the bird flying into the void. */
listen(window,'blur',()=>POV.keys.clear());

/* A cloud sea under the whole archipelago — it is what tells the eye the land
   is floating rather than sitting on a black page. Its ticks are held apart
   from the districts' so they never get swept up in a merge. */
const clouds=buildClouds();
/* No high fliers any more — at world scale a cloud above the land is a white
   blob parked in front of a quarter, and they used to be generated and then
   filtered back out. Every cloud is sea now, so there is nothing to drop. */
scene.add(clouds);        // laid out by placeClouds() per view
const cloudTicks=animated.splice(0);

/* ==================================================== atmosphere (FX.air) */
/* One thing, down from four. This started as haze, motes, mist and falls, and
   three of them are gone:

     HAZE and MIST both softened things, and this world is read front-to-back —
     anything that blurs or washes the far side is taking legibility away from
     whichever districts happen to be standing there.
     FALLS were removed outright. They were never load-bearing: the archipelago
     already reads as floating from the cloud sea and the keels, and every
     version of them cost either legibility, world-consistency, or a hundred
     draw calls the air layer cannot merge away.

   MOTES are what is left — slow dust in the key light, the cheapest possible
   cue that the space between the islands is a medium and not a vacuum. One
   Points cloud, one draw call.

   NOTE this is not the same thing as the district cascades: those are built by
   buildFalls into the district itself at level 7 and up, they are geometry that
   matches the rest of the world, and they stay. */
const airRoot=new THREE.Group(); scene.add(airRoot);
let airTicks=[];

function clearAir(){
  airTicks=[];
  airRoot.traverse(o=>{
    if(o.isPoints||o.isMesh) o.geometry?.dispose?.();
    /* Only the materials this layer made itself — anything from the shared
       mat() cache belongs to the whole world. */
    if(o.material) (Array.isArray(o.material)?o.material:[o.material])
      .forEach(m=>{ if(m&&m.__air) m.dispose(); });
  });
  airRoot.clear();
}

function buildAir(){
  clearAir();
  if(!FX.air||!W){ airRoot.visible=false; return; }
  airRoot.visible=true;
  const b=OPEN?OPEN.bounds:W.worldBounds;
  const ext=Math.max(b.x1-b.x0,b.z1-b.z0,10);
  const cx=(b.x0+b.x1)/2, cz=(b.z0+b.z1)/2;

  /* ---- motes ---- */
  const n=Math.round(clamp(ext*7,140,520)), pos=new Float32Array(n*3), ph=[];
  for(let i=0;i<n;i++){
    const r=rngOf(9001+i);
    pos[i*3  ]=cx+(r()-0.5)*ext*1.5;
    pos[i*3+1]=(r()-0.35)*ext*0.55;
    pos[i*3+2]=cz+(r()-0.5)*ext*1.5;
    ph.push(r()*TAU);
  }
  const mg=new THREE.BufferGeometry();
  mg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  /* Size in PIXELS, attenuation off. Under an orthographic camera three skips
     the perspective divide entirely, so gl_PointSize is whatever `size` says —
     a world-unit figure here came out under one pixel and the motes were
     invisible at every zoom. */
  const mm=new THREE.PointsMaterial({map:glowTex,color:0xFFF1CE,
    size:2.6,transparent:true,opacity:0.42,
    depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:false});
  mm.__air=true;
  const motes=new THREE.Points(mg,mm);
  const base=pos.slice();
  motes.userData.tick=t=>{
    const a=mg.attributes.position;
    for(let i=0;i<n;i++){
      a.array[i*3  ]=base[i*3  ]+Math.sin(t*0.11+ph[i])*ext*0.02;
      a.array[i*3+1]=base[i*3+1]+Math.sin(t*0.07+ph[i]*1.7)*ext*0.015;
      a.array[i*3+2]=base[i*3+2]+Math.cos(t*0.09+ph[i]*0.6)*ext*0.02;
    }
    a.needsUpdate=true;
  };
  airRoot.add(motes); airTicks.push(motes);

}

/* ====================================================== post (FX.post etc.) */
/* Three effects over one composer. The ordering is the argument:

     RENDER → OUTLINE → BLOOM → GRADE

   outlines before bloom so a lit beacon glows OVER its own line rather than
   under it; grade last because it is the only pass that has any business
   touching the final values.

   A tilt-shift pass used to sit between bloom and grade. It went for the same
   reason the distance fog did: under an isometric camera the top of the frame
   IS the far distance, so blurring by screen height blurs by depth, and this
   world would rather be legible all the way back than look like a photograph
   of a model.

   TONE MAPPING STAYS WITH THE RENDERER, which took a wrong turn to find out.
   The obvious build has the scene render linear, tone mapping off, and the ACES
   fit done in the grade pass — but three does not tone map an sRGB texture
   BACKGROUND (WebGLBackground sets toneMapped=false when the transfer function
   is sRGB), so the sky reaches the screen straight while everything else goes
   through ACES. Doing the fit in the grade pass applies it to the sky as well,
   and ACES desaturates: switching post on visibly drained the pink out of the
   sky and nothing else, which is a strange enough symptom to chase for a while.

   So the renderer keeps ACES, the composer's target stays linear, and the chain
   receives exactly the values the direct path would have produced — background
   untouched, everything else fitted. The grade pass then only has to do the sRGB
   encode that rendering to the canvas would otherwise have done, which is also
   why it runs whenever ANY of the three switches is on: something has to. */
const BLOOM_LAYER=11;

const ACES_GLSL=`
vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(max(c,vec3(0.0)),vec3(0.41666))-0.055,
  step(vec3(0.0031308),c)); }`;

/* ---- grade · vignette · grain ---- */
const GradeShader={
  uniforms:{ tDiffuse:{value:null}, uOn:{value:1},
             /* Saturation back to neutral. A boost on top of a palette that is
                already this saturated is the other half of the cartoon read —
                the outlines draw the shapes, the extra chroma fills them in. */
             uVig:{value:0.17}, uGrain:{value:0.026}, uSat:{value:1.0},
             uLift:{value:0.05}, uAspect:{value:1}, uRes:{value:new THREE.Vector2()},
             uT:{value:0},
             /* The one place in the file where a user gets to write a shader.
                It is a RAMP, not a program: luminance is remapped through two
                colours and mixed back by an amount. That is a deliberately
                small hole to leave open — it cannot fail to compile, cannot
                cost a frame, and cannot produce an unreadable world, and it
                still spans ink-on-paper, cyanotype, riso and every duotone
                between them. Free-form GLSL would offer more and deliver a
                black screen and a console error. */
             uDuo:{value:0}, uDuoA:{value:new THREE.Color(0x272A32)},
             uDuoB:{value:new THREE.Color(0xF5F6FA)}, uWarm:{value:0} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uOn,uVig,uGrain,uSat,uLift,uAspect,uT;
    uniform float uDuo,uWarm; uniform vec3 uDuoA,uDuoB;
    uniform vec2 uRes; varying vec2 vUv;
    ${ACES_GLSL}
    float gHash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec3 c=texture2D(tDiffuse,vUv).rgb;
      if(uOn>0.5){
        /* Saturation and a cool lift in the darks only. The shadows in this
           world are lit by sky, and sky is blue — pulling them slightly further
           that way is the whole of the grade. */
        float l=dot(c,vec3(0.2126,0.7152,0.0722));
        c=mix(vec3(l),c,uSat);
        c+=vec3(0.16,0.20,0.34)*uLift*(1.0-smoothstep(0.0,0.55,l));
        /* Normalised so the corner is 1.0 whatever the window's shape —
           unnormalised, a wide window darkened its corners twice as hard as a
           tall one for the same setting. */
        vec2 d=vUv-0.5; d.x*=uAspect;
        float rr=dot(d,d)/(0.25*(1.0+uAspect*uAspect));
        c*=1.0-uVig*smoothstep(0.15,1.0,rr);
        /* The ramp. Luminance is gamma-bent before the lookup because a linear
           walk from shadow colour to highlight colour spends most of its length
           in the darks — a duotone built off raw luminance comes out as one
           flat mid-tone with a few white specks in it. */
        if(uDuo>0.0005){
          float dl=dot(c,vec3(0.2126,0.7152,0.0722));
          vec3 ramp=mix(uDuoA,uDuoB,clamp(pow(dl,0.72),0.0,1.0));
          c=mix(c,ramp*(0.28+dl*1.0),uDuo);
        }
        /* Temperature, both ways off a true neutral. Branching on the sign
           rather than mixing across one axis, because a single mix between a
           cool and a warm gain has no value at which it is exactly 1.0 — the
           slider's centre would tint. */
        c*=mix(vec3(1.0), uWarm>=0.0?vec3(1.12,1.00,0.86):vec3(0.88,0.97,1.16),
               abs(uWarm));
      }
      c=toSRGB(c);
      /* Grain last, in display space, so it stays even across the range instead
         of vanishing in the highlights. It is also what breaks up the banding
         in the sky, which is a 4x256 gradient stretched over the whole frame. */
      if(uOn>0.5) c+=(gHash(vUv*uRes+uT)-0.5)*uGrain;
      gl_FragColor=vec4(c,1.0);
    }`
};

/* ---- outlines from depth and normal discontinuity ---- */
/* The normal buffer is drawn with three's own MeshNormalMaterial as an override
   rather than a hand-written one, because the scatter and the paving are
   INSTANCED: a raw ShaderMaterial override does not apply instanceMatrix, and
   every rock in the world would stack up at the origin. Depth rides along in a
   DepthTexture on the same target. */
const normalRT=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
normalRT.depthTexture=new THREE.DepthTexture(1,1);
normalRT.depthTexture.type=THREE.UnsignedIntType;
const normalMat=new THREE.MeshNormalMaterial({flatShading:false});
const OutlineShader={
  uniforms:{ tDiffuse:{value:null}, tNormal:{value:null}, tDepth:{value:null},
             uRes:{value:new THREE.Vector2()}, uNear:{value:0}, uFar:{value:1},
             /* uDepth is in WORLD UNITS, which is the whole reason this pass
                looked broken at first: the orthographic camera spans near=-1400
                to far=1800, so a normalised depth threshold of a thousandth is
                three world units and a "small" one of 0.0016 fires on flat
                ground. 1.5 units catches a silhouette against the sky or a
                second island behind the first, and ignores the slope of a
                hillside receding under the camera. */
             /* Silhouettes, and only the hardest creases. At 0.70/0.45 the pass
                was finding every facet boundary on a low-poly surface and inking
                it, which is the line between "the shapes have edges" and "this
                is a cartoon" — a 30-sided island rim is 12 degrees a facet and
                should read as one curve, not thirty drawn ones. */
             uNorm:{value:0.86}, uDepth:{value:1.5}, uInk:{value:new THREE.Color(0x2A2438)},
             uStrength:{value:0.24}, uPersp:{value:0} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader:`
    uniform sampler2D tDiffuse,tNormal,tDepth; uniform vec2 uRes;
    uniform float uNear,uFar,uNorm,uDepth,uStrength,uPersp; uniform vec3 uInk;
    varying vec2 vUv;
    /* Both projections, because riding a bird swaps the camera out from under
       this pass. Orthographic depth is already linear across [near,far] and
       comes back in world units with one multiply; perspective depth needs its
       reciprocal undone first, or every edge in the bird view would ink at a
       distance that has nothing to do with uDepth's world units. */
    float lin(vec2 p){
      float z=texture2D(tDepth,p).x;
      if(uPersp>0.5) return (2.0*uNear*uFar)/(uFar+uNear-(z*2.0-1.0)*(uFar-uNear));
      return z*(uFar-uNear)+uNear;
    }
    void main(){
      vec4 base=texture2D(tDiffuse,vUv);
      vec2 tx=1.0/uRes;
      vec3 n0=texture2D(tNormal,vUv).xyz*2.0-1.0;
      float d0=lin(vUv), nd=0.0, dd=0.0;
      for(int i=0;i<4;i++){
        vec2 o=(i==0?vec2(1,0):i==1?vec2(-1,0):i==2?vec2(0,1):vec2(0,-1))*tx;
        nd=max(nd,1.0-dot(n0,texture2D(tNormal,vUv+o).xyz*2.0-1.0));
        dd=max(dd,abs(d0-lin(vUv+o)));
      }
      float e=max(smoothstep(uNorm,uNorm+0.35,nd),
                  smoothstep(uDepth,uDepth*3.0,dd));
      gl_FragColor=vec4(mix(base.rgb,uInk,e*uStrength),base.a);
    }`
};

const composer=new EffectComposer(renderer);
const renderPass=new RenderPass(scene,cam);
const outlinePass=new ShaderPass(OutlineShader);
const bloomAdd=new ShaderPass({
  uniforms:{ tDiffuse:{value:null}, tBloom:{value:null}, uAmt:{value:1.0} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader:`uniform sampler2D tDiffuse,tBloom; uniform float uAmt;
    varying vec2 vUv;
    void main(){ gl_FragColor=texture2D(tDiffuse,vUv)+texture2D(tBloom,vUv)*uAmt; }`
});
const gradePass=new ShaderPass(GradeShader);
gradePass.renderToScreen=true;
composer.addPass(renderPass);
composer.addPass(outlinePass);
composer.addPass(bloomAdd);
composer.addPass(gradePass);

/* A second, smaller chain that only ever sees the emissive layer. This is what
   the reverted attempt got wrong: UnrealBloomPass over the WHOLE frame turns a
   deliberately pale palette to mush, because almost everything in this world is
   bright. Restricted to a layer, the beacons and the orrery glow and the terrain
   is not even present to be bloomed. */
/* Not built at all on a handheld, where it would be six render targets of dead
   memory: UnrealBloomPass allocates its whole mip chain in its constructor, and
   a pass that never runs still holds every buffer it was born with. */
let bloomComposer=null, bloomPass=null, bloomRenderPass=null;
if(!LITE){
  bloomComposer=new EffectComposer(renderer);
  bloomComposer.renderToScreen=false;
  /* Threshold high on purpose: the layer already excludes the terrain, but a
     lamp post's warm stone is on that layer too and only the lamp should bloom. */
  /* Tuned at close zoom rather than at world scale, which is where it bites: the
     same lamp covers forty times the pixels when you walk into a realm, and a
     strength that read as a glow across the archipelago blew the roofs out. */
  bloomPass=new UnrealBloomPass(new THREE.Vector2(1,1),0.15,0.75,0.72);
  bloomRenderPass=new RenderPass(scene,cam);
  bloomComposer.addPass(bloomRenderPass);
  bloomComposer.addPass(bloomPass);
}

/* Point every pass at a different camera at once. Both chains have to move
   together — leave the bloom chain on the old camera and the glow arrives in
   the frame from a viewpoint the frame is no longer drawn from. */
function setView(c){
  view=c;
  renderPass.camera=c;
  if(bloomRenderPass) bloomRenderPass.camera=c;
  outlinePass.material.uniforms.uPersp.value=c.isPerspectiveCamera?1:0;
}

function sizePost(){
  const w=VW, h=VH, dpr=dprCap();
  composer.setSize(w,h); composer.setPixelRatio(dpr);
  if(bloomComposer){
    bloomComposer.setSize(Math.round(w/2),Math.round(h/2));
    bloomPass.setSize(Math.round(w/2),Math.round(h/2));
  }
  /* Left at its 1x1 birth size on a handheld: the outline pass is off there, so
     nothing ever samples it, and a full-viewport depth+normal target is one of
     the larger allocations on the page. */
  if(!LITE) normalRT.setSize(Math.round(w*dpr/2),Math.round(h*dpr/2));
  const rw=w*dpr, rh=h*dpr;
  gradePass.material.uniforms.uRes.value.set(rw,rh);
  gradePass.material.uniforms.uAspect.value=w/h;
  outlinePass.material.uniforms.uRes.value.set(normalRT.width,normalRT.height);
  camFP.aspect=w/Math.max(1,h); camFP.updateProjectionMatrix();
}
sizePost();

/* ================================================================= the look
   Presets and knobs live in `look.js`, which the bench in the panel reads too.
   The world starts on DIORAMA and is told about its owner's look once settings land. */
const LOOK={...lookFromPreset(DEFAULT_LOOK_ID)};

function lookPush(){
  const u=gradePass.material.uniforms;
  u.uSat.value=LOOK.sat; u.uLift.value=LOOK.lift; u.uVig.value=LOOK.vig;
  u.uGrain.value=LOOK.grain; u.uWarm.value=LOOK.warm; u.uDuo.value=LOOK.duo;
  u.uDuoA.value.setHex(LOOK.duoA); u.uDuoB.value.setHex(LOOK.duoB);
  outlinePass.material.uniforms.uStrength.value=LOOK.ol;
  outlinePass.material.uniforms.uInk.value.setHex(LOOK.ink);
  bloomAdd.material.uniforms.uAmt.value=LOOK.bl;
  /* An outline strength of zero still pays for a full normal-and-depth pass, so
     the switch follows the slider to the floor rather than leaving a pass
     rendering nothing. Same for the glow.

     On a handheld both are off whatever the look says, because each of them is
     a SECOND full pass over the scene every frame — the ink needs a normal and
     depth buffer, the glow needs the world again with everything that does not
     glow painted black, and the glow then blurs its result five times over. A
     phone drawing this world three times a frame is a phone drawing it at
     twelve. The GRADE stays: it is one fullscreen quad and it is the whole of
     what makes a look a look, so what the owner dressed their world in still
     arrives, just without the ink line and the halo. */
  FX.outline=!LITE && LOOK.ol>0.005 && LOOK.fx.outline!==false;
  FX.bloom  =!LITE && LOOK.bl>0.005 && LOOK.fx.bloom!==false;
  FX.post   =LOOK.fx.post!==false;
}
/* A WHOLE look, not a preset id — the panel already forks on the first knob
   move, so anything `next` doesn't carry stays at the preset it forked from. */
function lookSet(next){
  const base=lookFromPreset(next&&next.base?next.base:(next&&next.id)||DEFAULT_LOOK_ID);
  Object.assign(LOOK,base,next,{fx:{...base.fx,...(next&&next.fx)}});
  lookPush();
}
lookPush();

/* ============================================================= the standard
   What is on the shield is decided elsewhere (`crest.js` draws it, the API says
   what has been earned). This end owns one question only: where it stands. */
let CREST=null;
/* The cloth's own canvas, repainted only when the crest changes and kept
   separate from the panel's copy in `crest.js` — the two are different shapes. */
let _flagC=null, _flagT=null, _flagKey='';
function crestTex(){
  if(!CREST) return null;
  const key=CREST.charge+CREST.div+CREST.a+CREST.b;
  if(!_flagC){ _flagC=document.createElement('canvas');
               _flagC.width=192; _flagC.height=232;
               _flagT=new THREE.CanvasTexture(_flagC);
               _flagT.colorSpace=THREE.SRGBColorSpace;
               _flagT.anisotropy=4; }
  if(key!==_flagKey){ _flagKey=key;
    drawCrest(_flagC.getContext('2d'),192,232,CREST,true);
    _flagT.needsUpdate=true; }
  return _flagT;
}

/* One flag, on the highest ground of the biggest thing on screen. Lives at scene
   level rather than under a district, because a district is disposed and
   rebuilt on every level-up and the flag has nothing to do with any one of them. */
const stdRoot=new THREE.Group(); scene.add(stdRoot);
/* The banner hangs off a pivot, not the root, so the bar, its finials and the
   cloth turn together to face the camera — rotating the cloth alone sliced the
   billboarded plane through the pole's axis at every angle. */
const stdPivot=new THREE.Group();
const STD_POLE=13.2, STD_W=3.6, STD_H=4.35;
/* Far enough forward to clear the pole at its widest plus everything the wave
   can do, which is what the one-sided ripple below exists to bound. */
const STD_FWD=0.30;
let stdCloth=null, stdBase=null;
{
  const metal=mixTok(T.salt40,T.pepper10,0.42);
  const pole=meshOf(new THREE.CylinderGeometry(0.10,0.15,STD_POLE,7),
    mat(metal,{rough:0.45,metal:0.15}));
  pole.position.y=STD_POLE/2; stdRoot.add(pole);
  const fin=meshOf(new THREE.OctahedronGeometry(0.30),mat(T.cheese40,{rough:0.3}));
  fin.position.y=STD_POLE+0.18; stdRoot.add(fin);

  stdPivot.position.y=STD_POLE-0.35; stdRoot.add(stdPivot);
  const bar=meshOf(boxG(STD_W+0.55,0.15,0.15),mat(metal,{rough:0.45}));
  bar.position.z=STD_FWD*0.6; stdPivot.add(bar);
  for(const sx of [-1,1]){
    const k=meshOf(new THREE.OctahedronGeometry(0.17),mat(T.cheese40,{rough:0.3}));
    k.position.set(sx*(STD_W/2+0.32),0,STD_FWD*0.6); stdPivot.add(k);
  }
  /* Its own material, never the shared cache: that one is keyed by colour, and
     hanging a texture on it would put this crest on every surface sharing its hex. */
  const cm=new THREE.MeshStandardMaterial({roughness:0.88,
    side:THREE.DoubleSide,flatShading:false,
    emissive:0xFFFFFF,emissiveIntensity:0});
  stdCloth=new THREE.Mesh(new THREE.PlaneGeometry(STD_W,STD_H,10,7),cm);
  stdCloth.position.set(0,-0.12-STD_H/2,STD_FWD);
  stdPivot.add(stdCloth);
  stdBase=stdCloth.geometry.attributes.position.array.slice();
  stdRoot.visible=false;
}
/* Throttled rather than dirty-flagged: the target changes on level-ups, entering
   or leaving a realm and every scrubbed day — cheaper as one reduce twice a
   second than four call sites (and a fifth to forget). */
let stdT=0;
function placeStandard(t){
  if(t-stdT<0.45)return; stdT=t;
  /* No crest is not an empty shield: a world that has raised nothing has no
     mark, so it flies no pole either. */
  if(!W||!CREST||W.unbuilt){ stdRoot.visible=false; return; }
  const list=(OPEN?OPEN.list.filter(d=>d.shown>0&&d.built)
                 :W.quarters.filter(q=>q.shown>0&&q.island));
  if(!list.length){ stdRoot.visible=false; return; }
  let x=list[0]; for(const o of list) if(o.shown>x.shown) x=o;
  const R=OPEN?spec(Math.max(1,x.level||levelOf(x.shown))).radius:(x.builtR||6);
  /* A fixed world bearing, not a camera-relative one. 0.55 of the radius keeps
     it off the plateau's centre, where the signature monument already stands. */
  const a=2.15;
  stdRoot.position.set(x.x+Math.cos(a)*R*0.55,(x.baseY||0)+0.2,
                       x.z+Math.sin(a)*R*0.55);
  stdRoot.scale.setScalar(clamp(R/9,0.8,1.6));
  stdRoot.visible=true;
}
/* The cloth turns to face the camera, and only the cloth — the pole stays put,
   so what you see is a banner swinging on its bar rather than the world rotating. */
function stdWave(t){
  if(!stdRoot.visible)return;
  stdPivot.rotation.y=Math.PI/2-yaw;
  const p=stdCloth.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=stdBase[i*3], y=stdBase[i*3+1];
    /* Anchored along the top edge, loosest at the bottom corners, like cloth on
       a crossbar. BIASED FORWARD, never behind: the 0.19 bias keeps the cloth
       billowing out and back to flat instead of swinging through the pole. */
    const hang=(STD_H/2-y)/STD_H;
    p.setZ(i,(Math.sin(t*1.7+x*1.1+y*0.5)*0.13
             +Math.sin(t*2.9+x*2.3)*0.05+0.19)*hang);
  }
  p.needsUpdate=true;
}
function crestSet(c){
  CREST=c||null;
  const tex=crestTex();
  stdCloth.material.map=tex; stdCloth.material.emissiveMap=tex;
  stdCloth.material.needsUpdate=true;
  if(!CREST) stdRoot.visible=false;
}

/* Anything that glows joins the bloom layer. Driven off the material rather
   than a list, so a monument added later is included without being registered
   anywhere — and it has to run after mergeStatic, because the merge replaces
   the objects whose layers were set. */
const BLACK=new THREE.Color(0,0,0);
function markBloom(root){
  root.traverse(o=>{
    /* set(), not enable(): this MOVES the sprite off layer 0, which is what
       takes it out of the outline pass's normal buffer. An override material is
       opaque, so a wisp or a lamp glow — a transparent quad — was punching a
       full silhouette into the depth buffer and coming back ringed in ink, and
       a town at close zoom filled up with little outlined diamonds floating
       over it. The main render uses enableAll, so the sprite still draws. */
    if(o.isSprite){ o.layers.set(BLOOM_LAYER); return; }
    if(!o.isMesh) return;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    if(ms.some(m=>m&&m.emissive&&!m.emissive.equals(BLACK)&&(m.emissiveIntensity??1)>0))
      o.layers.enable(BLOOM_LAYER);
  });
}

/* --------------------------------------------------- masking for the bloom */
const darkMat=new THREE.MeshBasicMaterial({color:0x000000});
const _bloomLayer=new THREE.Layers(); _bloomLayer.set(BLOOM_LAYER);
const _swap=new Map(), _hid=[];
/* Transparent things are HIDDEN rather than blacked out. An override to opaque
   black turns the mist, the falls and a plot border into full-strength
   occluders — the same trap the outline pass hides airRoot for — and a sheet of
   near-invisible cloud would start swallowing the glow of everything behind it. */
function maskNode(o){
  if(!o.visible)return;
  if(o.isMesh){
    if(!_bloomLayer.test(o.layers)){
      const m=o.material, ms=Array.isArray(m)?m:[m];
      if(ms.some(x=>x&&x.transparent)){ o.visible=false; _hid.push(o); return; }
      _swap.set(o,m); o.material=darkMat;
    }
  }else if((o.isSprite||o.isPoints)&&!_bloomLayer.test(o.layers)){
    o.visible=false; _hid.push(o); return;
  }
  for(const c of o.children) maskNode(c);
}
function bloomMask(on){
  if(on){ maskNode(scene); return; }
  for(const [o,m] of _swap) o.material=m;
  _swap.clear();
  for(const o of _hid) o.visible=true;
  _hid.length=0;
}

const postOn=()=>FX.post||FX.bloom||FX.outline;
function drawFrame(t){
  if(!postOn()){ renderer.render(scene,view); return; }
  outlinePass.enabled=!!FX.outline;
  bloomAdd.enabled=!!FX.bloom;
  gradePass.material.uniforms.uOn.value=FX.post?1:0;
  gradePass.material.uniforms.uT.value=t*11.3;

  if(FX.outline){
    const bg=scene.background, ov=scene.overrideMaterial, air=airRoot.visible;
    scene.background=null; scene.overrideMaterial=normalMat;
    /* The air layer sits out of the normal buffer. An override material is
       opaque by definition, so the falls ribbons and the mist — which are
       almost entirely transparent — would punch full-strength silhouettes into
       the depth buffer and come back as hard rectangles ruled across the sky. */
    airRoot.visible=false;
    view.layers.set(0);           // sprites live off layer 0 — see markBloom
    renderer.setRenderTarget(normalRT);
    renderer.clear();
    renderer.render(scene,view);
    renderer.setRenderTarget(null);
    view.layers.enableAll();
    scene.background=bg; scene.overrideMaterial=ov; airRoot.visible=air;
    const u=outlinePass.material.uniforms;
    u.tNormal.value=normalRT.texture; u.tDepth.value=normalRT.depthTexture;
    u.uNear.value=view.near; u.uFar.value=view.far;
  }
  if(FX.bloom){
    const bg=scene.background;
    scene.background=null;                 // or the sky blooms as one flat sheet
    /* The whole scene, with everything that does not glow painted black —
       NOT just the emissive layer on its own. Rendering the layer alone leaves
       the bloom buffer with no occluders in it at all, so a lamp behind a wall
       is drawn as if the wall were not there, and `bloomAdd` then adds that
       glow over the finished frame with no depth test. The lamp shines through
       the wall.

       Under the isometric camera you are looking down on a shallow town and
       almost nothing is behind anything else, so this never showed. Ride a bird
       through the same town at roof height and half the district is suddenly
       behind something — which is where a scatter of pale blobs sitting on top
       of rooftops, hillside and sky came from.

       Black geometry costs nothing in the bloom (it is under any threshold) but
       it writes depth and paints over what is behind it, which is the entire
       point. colorWrite stays ON for exactly that reason: three sorts opaque
       front-to-back but does not guarantee it, and a depth-only occluder cannot
       erase a glow that was already drawn. */
    bloomMask(true);
    bloomComposer.render();
    bloomMask(false);
    scene.background=bg;
    bloomAdd.material.uniforms.tBloom.value=bloomComposer.renderTarget2.texture;
  }
  composer.render();
}

/* =================================================================== the hand
   Dungeon Keeper's hand, at the scale this world actually runs at: the smallest
   thing here worth picking up is a whole town. Press and HOLD on one and it
   comes off its plot and dangles under the cursor; let go and it slams back
   into its socket hard enough that the neighbours feel it; flick it and it
   leaves the world entirely.

   Nothing the hand does is allowed to outlive it. A town's position is where
   the land solver, the border solver and the label layer all independently
   agree it is, so a town that stayed where you dropped it would desync three
   systems at once for the sake of one joke. Hence the LEASH: you can drag it,
   you cannot rehome it. The world is yours to annoy, not to rearrange.

   Everything below writes only to a group's position/rotation/scale, never to
   its contents — so it costs nothing, survives the merge, and a rebuild wipes
   it clean by construction. */
let PX=0, PY=0;                              // last pointer position, in px
const accOf=x=>x.niche?x.niche.accent:x.realm.accent;

/* Effects live at scene level, clear of every root that gets merged or torn
   down. They also sit on the bloom layer rather than layer 0 — an additive
   quad in the outline pass's normal buffer comes back ringed in ink, which is
   the same trap the wisps fell into. */
const fxRoot=new THREE.Group(); scene.add(fxRoot);

/* ------------------------------------------------------------ shock rings */
const RINGS=[];
{
  const geo=new THREE.RingGeometry(0.84,1,48); geo.rotateX(-Math.PI/2);
  for(let i=0;i<10;i++){
    const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,
      depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const o=new THREE.Mesh(geo,m);
    o.visible=false; o.layers.set(BLOOM_LAYER); o.renderOrder=6;
    fxRoot.add(o); RINGS.push({o,m,t:-1,r0:1,r1:8,dur:0.7});
  }
}
let ringNext=0;
function ring(x,y,z,r0,r1,col,dur=0.7){
  const R=RINGS[ringNext++%RINGS.length];
  R.o.visible=true; R.o.position.set(x,y+0.06,z);
  R.m.color.setHex(col); R.t=clock.getElapsedTime();
  R.r0=r0; R.r1=r1; R.dur=dur;
}

/* ---------------------------------------------------------------- confetti */
const DEB=[];
const debGeo=new THREE.BoxGeometry(0.30,0.20,0.045);
function confetti(x,y,z,cols,n){
  for(let i=0;i<n;i++){
    const m=new THREE.MeshBasicMaterial({color:cols[i%cols.length],
      transparent:true,opacity:1,depthWrite:false});
    const o=new THREE.Mesh(debGeo,m);
    o.position.set(x,y,z); o.layers.set(BLOOM_LAYER); fxRoot.add(o);
    const a=Math.random()*TAU, s=2.2+Math.random()*4.2;
    DEB.push({o,m,vx:Math.cos(a)*s,vy:5.5+Math.random()*5,vz:Math.sin(a)*s,
      rx:(Math.random()-0.5)*10,rz:(Math.random()-0.5)*10,
      t0:clock.getElapsedTime(),life:2.6});
  }
}

/* ------------------------------------------------- things leaving the world */
const FALLING=[];

/* ------------------------------------------------ transient group transforms
   One list for every "something just happened to this town" wobble: the squash
   of a slap, the hop of a neighbour catching a shockwave, the sulk of a town
   that has been hit once too often. All of it decays back to identity, and the
   hand takes priority over any of it. */
const POKE=[];
function poke(g,{sq=0,tilt=0,hop=0,dur=0.55}={}){
  if(!g)return;
  /* A direction, not two independent amounts — rolling both axes separately
     lands near zero often enough that a third of the sulks did not visibly
     lean at all. */
  const a=Math.random()*TAU;
  POKE.push({g,t0:clock.getElapsedTime(),dur,sq,tilt,hop,y0:g.position.y,
    tx:Math.cos(a),tz:Math.sin(a)});
}

/* Floating text. The read pulse already had a pool and a layout pass for
   exactly this; the only thing it could not do was say anything but a number. */
function say(host,text,col){
  const f=fxPool[fxNext++%fxPool.length];
  f.d=host; f.t=clock.getElapsedTime();
  f.e.textContent=text; f.e.style.color=hexs(col);
}

/* --------------------------------------------------------------- the slap */
/* Slapping a Dungeon Keeper creature made it work faster and like you less.
   Both halves are here: every slap throws a read pulse, and the town gets
   progressively less polite about it until it stops working and throws its
   backlog at you. */
const YELP=['ow','hey','we’re working','stop that','this is our reading time',
            'the guild will hear of this','…','FINE. TAKE THE BACKLOG.'];
let taughtSlap=false, taughtHand=false;
const SLAP_WINDOW=4;                 // seconds of memory before it forgives you
function slap(d,t){
  if(!d.town||HAND.x===d)return;
  d.slaps=(t-(d.slapT||-99)<SLAP_WINDOW)?(d.slaps||0)+1:1;
  d.slapT=t;
  const n=d.slaps, col=accOf(d), R=spec(Math.max(1,d.level)).radius;
  /* From the sixth it stops springing straight back and sulks: it leans over
     and takes two seconds to decide to stand up again. */
  const sulk=n>=6;
  poke(d.town,{sq:Math.min(0.10+n*0.022,0.24),tilt:sulk?0.10:0,dur:sulk?1.9:0.5});
  ring(d.x,d.baseY,d.z,R*0.45,R*(1.0+n*0.06),col,0.5);
  say(d,YELP[Math.min(n,YELP.length)-1],col);
  /* They really do read faster when you do it — for the first few. After that
     they are too busy being offended. */
  if(n<=4) setTimeout(()=>{ if(d.town) say(d,'+1',col); },170);
  if(n>=8){
    confetti(d.x,d.baseY+2.2,d.z,[d.niche.accent,d.niche.accent2,d.realm.accent],22);
    d.slaps=0;
  }
  if(!taughtSlap){ taughtSlap=true;
    toast('SLAPPED',nameOf(d)+' reads faster when you do that',col); }
}

/* ------------------------------------------------------------- the hand */
const HOLD_MS=0.32;                  // long enough not to eat a click
const HAND={mode:'idle',x:null,g:null,hx:0,hy:0,hz:0,ax:0,az:0,ox:0,oz:0,
  vx:0,vz:0,pvx:0,pvz:0,ppx:0,ppy:0,lift:0,leash:0,rad:0,t0:0,
  hold:0,armed:null,sx:0,sz:0,sl:0,gone:null};

/* What the hand could take hold of here — which is not the same question pick()
   asks, because a district you can hover is not necessarily one that is
   standing. */
function handTargetAt(cx,cy){
  if(!W)return null;
  const p=groundAt(cx,cy,0); if(!p)return null;
  if(OPEN){
    if(!W.own)return null;
    const o=W.own.get(hexKey(...hexAt(p.x,p.z)));
    if(o===undefined)return null;
    const d=W.districts[o];
    return (d&&d.built&&d.town&&d.realm===OPEN.realm)?d:null;
  }
  for(const q of W.quarters){
    if(q.shown<=0||!q.island)continue;
    if(Math.hypot(p.x-q.x,p.z-q.z)<=spec(Math.max(1,q.level)).radius+3)return q;
  }
  return null;
}
function handArm(cx,cy,t){
  const x=handTargetAt(cx,cy);
  HAND.armed=x; HAND.hold=x?t:0;
}
function handGrab(t){
  const x=HAND.armed, g=x&&(OPEN?x.town:x.island);
  HAND.hold=0; HAND.armed=null;
  if(!g)return;
  const R=spec(Math.max(1,x.level)).radius;
  HAND.mode='held'; HAND.x=x; HAND.g=g; HAND.t0=t;
  HAND.hx=g.position.x; HAND.hy=g.position.y; HAND.hz=g.position.z;
  HAND.ox=HAND.oz=HAND.vx=HAND.vz=HAND.pvx=HAND.pvz=HAND.lift=0;
  HAND.ppx=PX; HAND.ppy=PY;
  HAND.rad=R;
  /* The leash has one hard requirement: from anywhere on the map you must be
     able to drag the thing clear of the ground it stands on, or the only way
     to lose a district is to flick it — and a district in the middle of a
     large realm could not be dragged off the land at all. So it is the
     distance to the far corner of whatever you are standing on, plus room to
     get past the rim. */
  const b=OPEN?OPEN.bounds:W.worldBounds;
  let far=0;
  for(const cx of [b.x0,b.x1]) for(const cz of [b.z0,b.z1])
    far=Math.max(far,Math.hypot(cx-x.x,cz-x.z));
  HAND.leash=Math.max(terrR(Math.max(1,x.level))+6, far+R+12);
  /* Where the cursor was on the object's own resting plane. Tracking a plane
     that moves with the lift glues the town under the cursor and hides the
     lift entirely; anchoring to a fixed plane lets it rise on screen and then
     follow the drag one for one. */
  const a=groundAt(PX,PY,HAND.hy);
  HAND.ax=a?a.x:HAND.hx; HAND.az=a?a.z:HAND.hz;
  panning=rotating=false;
  ring(HAND.hx,HAND.hy,HAND.hz,R*0.5,R*1.3,accOf(x),0.55);
  say(x,'oi',accOf(x));
  if(!taughtHand){ taughtHand=true;
    toast('THE HAND','let go gently to put it back · flick it to lose it',accOf(x)); }
}
/* Put everything back exactly as it was and forget the gesture. Used by every
   view change, because a hand still holding a town the view no longer contains
   is a group with a transform nobody owns. */
function handAbort(){
  if(HAND.g){
    HAND.g.position.set(HAND.hx,HAND.hy,HAND.hz);
    HAND.g.rotation.set(0,0,0); HAND.g.scale.set(1,1,1);
  }
  HAND.mode='idle'; HAND.x=null; HAND.g=null; HAND.hold=0; HAND.armed=null;
}
/* In SCREEN pixels a second, not world units: a flick is a thing the hand does,
   and it has to mean the same at world zoom and inside a town — where the same
   gesture covers a twentieth of the ground. */
const THROW_V=1100;
function handRelease(t){
  if(HAND.mode!=='held'){ HAND.hold=0; HAND.armed=null; return; }
  const speed=Math.hypot(HAND.pvx,HAND.pvz);
  /* Two ways to lose it, and they are the two that feel physical: fling it hard
     enough and it keeps going, or simply let go where there is no ground —
     which, on a map made of floating islands, is most of the map. */
  const p=groundAt(PX,PY,0);
  const overLand=!OPEN ? true
    : !!(p&&W.own&&W.own.get(hexKey(...hexAt(p.x,p.z)))!==undefined);
  if(speed>THROW_V||!overLand) handThrow(t,speed);
  else{ HAND.mode='home'; HAND.t0=t; HAND.sx=HAND.ox; HAND.sz=HAND.oz; HAND.sl=HAND.lift; }
}
/* It falls out of the world, and then the world puts it back. The land
   remembers where its districts go; you do not get to edit that by throwing
   one into the cloud sea. */
function handThrow(t,speed){
  const x=HAND.x, g=HAND.g, col=accOf(x);
  scene.add(g);                       // roots are identity, so the transform carries
  FALLING.push({o:g,anim:x.animated||[],t0:t,
    vx:HAND.vx*0.5,vy:4+Math.min(speed,3200)*0.0022,vz:HAND.vz*0.5,
    sx:(Math.random()-0.5)*2.4,sz:(Math.random()-0.5)*2.4});
  ring(HAND.hx,HAND.hy,HAND.hz,HAND.rad*0.4,HAND.rad*1.6,col,0.8);
  /* Reset the owner far enough that raise()/raiseRealm() rebuild from nothing.
     `built`/`island` are what decide `carry`, and carrying against a null key
     set is a throw inside buildIsland rather than a nice transition. */
  x.animated=[]; x.nodes=null; x.keys=null; x.builtR=0;
  if(OPEN){
    x.town=null; x.built=false; x.borderMat=null; x.realmBorderMat=null;
    landDirty=true;                   // its plot goes with it, and comes back
  }else x.island=null;
  say(x,'…',col);
  HAND.gone={x,open:OPEN,at:t+1.1};
  HAND.mode='idle'; HAND.x=null; HAND.g=null;
}

function handUpdate(t,dt){
  if(POV.bird&&HAND.mode!=='idle') handAbort();
  /* --- the hold that turns a click into a grab -------------------------- */
  if(HAND.mode==='idle'&&HAND.hold&&t-HAND.hold>HOLD_MS) handGrab(t);

  /* --- held: it follows the cursor on a leash, and it is not happy ------ */
  if(HAND.mode==='held'){
    const g=HAND.g;
    if(!g||(OPEN?HAND.x.town:HAND.x.island)!==g){ handAbort(); }
    else{
      HAND.lift+=(HAND.rad*1.5+1.2-HAND.lift)*Math.min(1,dt*7);
      const p=groundAt(PX,PY,HAND.hy);
      let tx=HAND.ox, tz=HAND.oz;
      if(p){
        const dx=p.x-HAND.ax, dz=p.z-HAND.az, L=Math.hypot(dx,dz);
        /* One for one with the cursor for most of the leash, then it stiffens
           and asymptotes rather than stopping dead. Easing the WHOLE range —
           which is what a bare tanh does — costs a quarter of the reach before
           you have pulled at all, and the reach is the point. */
        const soft=HAND.leash*0.75, room=HAND.leash-soft;
        const k=L<=soft?1:(soft+room*Math.tanh((L-soft)/room))/L;
        tx=dx*k; tz=dz*k;
      }
      const px=HAND.ox, pz=HAND.oz, k=Math.min(1,dt*10);
      HAND.ox+=(tx-HAND.ox)*k; HAND.oz+=(tz-HAND.oz)*k;
      if(dt>1e-4){
        HAND.vx=lerp(HAND.vx,(HAND.ox-px)/dt,0.4);
        HAND.vz=lerp(HAND.vz,(HAND.oz-pz)/dt,0.4);
        HAND.pvx=lerp(HAND.pvx,(PX-HAND.ppx)/dt,0.4);
        HAND.pvz=lerp(HAND.pvz,(PY-HAND.ppy)/dt,0.4);
      }
      HAND.ppx=PX; HAND.ppy=PY;
      const age=t-HAND.t0, sw=Math.min(1,age*3);
      g.position.set(HAND.hx+HAND.ox,HAND.hy+HAND.lift,HAND.hz+HAND.oz);
      /* Swing against the direction of travel and wobble on top of it. It
         pivots at its own foot, which is where a hand would be holding it. */
      g.rotation.x=clamp(HAND.vz*0.004,-0.30,0.30)+Math.sin(age*6.3)*0.028*sw;
      g.rotation.z=clamp(-HAND.vx*0.004,-0.30,0.30)+Math.cos(age*5.1)*0.028*sw;
      g.rotation.y=Math.sin(age*1.6)*0.05*sw;
      const s=1+0.06*Math.exp(-age*5);
      g.scale.set(1-(s-1)*0.6,s,1-(s-1)*0.6);
    }
  }

  /* --- coming home: it drops, it does not float ------------------------- */
  if(HAND.mode==='home'){
    const g=HAND.g, u=Math.min(1,(t-HAND.t0)/0.30);
    if(!g) HAND.mode='idle';
    else{
      const e=u*u;                          // accelerate into the socket
      g.position.set(HAND.hx+HAND.sx*(1-e),HAND.hy+HAND.sl*(1-e),HAND.hz+HAND.sz*(1-e));
      g.rotation.x*=1-u; g.rotation.z*=1-u; g.rotation.y*=1-u;
      g.scale.set(1,1,1);
      if(u>=1){
        const x=HAND.x, col=accOf(x), R=HAND.rad;
        g.position.set(HAND.hx,HAND.hy,HAND.hz); g.rotation.set(0,0,0);
        HAND.mode='idle'; HAND.x=null; HAND.g=null;
        poke(g,{sq:0.20,dur:0.6});
        ring(HAND.hx,HAND.hy,HAND.hz,R*0.5,R*2.6,col,0.75);
        /* The shockwave is the whole reason to drop it rather than throw it:
           the neighbours flinch, and the world stops being a diagram. */
        const near=OPEN?OPEN.list:W.quarters;
        for(const o of near){
          const og=OPEN?o.town:o.island;
          if(!og||o===x)continue;
          const dd=Math.hypot(o.x-x.x,o.z-x.z), reach=R*(OPEN?3.4:2.4);
          if(dd>reach)continue;
          const f=1-dd/reach;
          poke(og,{hop:(OPEN?0.55:2.4)*f,sq:0.05*f,dur:0.42});
        }
      }
    }
  }

  /* --- the rebuild after a throw ---------------------------------------- */
  if(HAND.gone&&t>=HAND.gone.at){
    const {x,open}=HAND.gone; HAND.gone=null;
    /* A realm island comes back wherever you are standing — walk into a
       different realm inside the second and a half it is falling and nothing
       else would ever put it back, leaving a hole in the archipelago. A
       district is the opposite: raising one into a realm you have left would
       hang a town in a root that leaveRealm has already finished cleaning, and
       entering the realm again rebuilds it anyway. */
    if(x.list){
      if(x.shown>0&&!x.island) raiseRealm(x,realmLevelOf(x.shown),!OPEN);
    }else if(open===OPEN&&OPEN&&OPEN.list.includes(x)&&x.shown>0){
      raise(x,levelOf(x.shown),true);
    }
    if(open===OPEN) say(x,'the land remembers',accOf(x));
  }

  /* --- transient pokes --------------------------------------------------- */
  for(let i=POKE.length-1;i>=0;i--){
    const p=POKE[i], u=(t-p.t0)/p.dur;
    if(u>=1||p.g===HAND.g||!p.g.parent){
      p.g.scale.set(1,1,1); p.g.rotation.x=p.g.rotation.z=0; p.g.position.y=p.y0;
      POKE.splice(i,1); continue;
    }
    const e=Math.exp(-u*4.5);
    if(p.sq){ const a=p.sq*Math.cos(u*TAU*2.4)*e; p.g.scale.set(1+a*0.55,1-a,1+a*0.55); }
    if(p.hop) p.g.position.y=p.y0+p.hop*Math.sin(u*Math.PI)*(1-u*0.35);
    if(p.tilt){ const a=p.tilt*Math.cos(u*TAU*0.85)*e; p.g.rotation.x=a*p.tx; p.g.rotation.z=a*p.tz; }
  }


  /* --- rings ------------------------------------------------------------- */
  for(const R of RINGS){
    if(R.t<0)continue;
    const u=(t-R.t)/R.dur;
    if(u>=1){ R.t=-1; R.o.visible=false; R.m.opacity=0; continue; }
    const r=lerp(R.r0,R.r1,smooth(u));
    R.o.scale.set(r,1,r); R.m.opacity=(1-u)*(1-u)*0.85;
  }

  /* --- confetti ----------------------------------------------------------- */
  for(let i=DEB.length-1;i>=0;i--){
    const d=DEB[i], age=t-d.t0;
    d.vy-=17*dt;
    d.o.position.x+=d.vx*dt; d.o.position.y+=d.vy*dt; d.o.position.z+=d.vz*dt;
    d.o.rotation.x+=d.rx*dt; d.o.rotation.z+=d.rz*dt;
    d.m.opacity=clamp(1-age/d.life,0,1);
    if(age>=d.life){ d.o.removeFromParent(); d.m.dispose(); DEB.splice(i,1); }
  }

  /* --- things still falling ----------------------------------------------- */
  for(let i=FALLING.length-1;i>=0;i--){
    const f=FALLING[i], age=t-f.t0;
    f.vy-=34*dt;
    f.o.position.x+=f.vx*dt; f.o.position.y+=f.vy*dt; f.o.position.z+=f.vz*dt;
    f.o.rotation.x+=f.sx*dt; f.o.rotation.z+=f.sz*dt;
    /* Shrinking is what sells the distance — falling alone just reads as
       sinking. It is gone from the eye long before it is gone from the list. */
    f.o.scale.setScalar(Math.max(0.02,1-age*0.52));
    /* Its birds keep flying all the way down. It costs nothing and it is the
       detail that makes the fall read as a place falling rather than a mesh. */
    for(const o of f.anim) o.userData.tick&&o.userData.tick(t);
    if(f.o.position.y<-150||age>3.2){ disposeGroup(f.o); FALLING.splice(i,1); }
  }

  /* A label belongs to a plot, not to a town, so it stays behind while the town
     is in the air — which reads as the label being wrong. Hide it instead. */
  if(HAND.x&&HAND.x.el){ HAND.x.el.style.opacity='0'; hideLead(HAND.x.lead); }
}

/* ============================================================ possess a bird
   Click a bird and you are riding it, and it takes you on a tour: once you are
   aboard it stops circling its own district and flies the whole realm, one
   place to the next, while you look around from its shoulder.

   Three things this has to get right, in order of how badly each one hurts:

   IT MUST NEVER STEAL A CLICK. A bird is a 30cm object on a map whose next
   smallest thing is a house, and the primary gesture in this app is clicking a
   realm to walk into it. So a bird is only clickable while it is genuinely
   under the cursor AND SAYS SO: hovering one puts a reticle on it and changes
   the cursor, and a click can only mount the bird that reticle is on. If you
   did not see the offer, you cannot have taken it.

   THE HEADING COMES FROM WHERE IT WENT, never from its rotation. Six realms
   build their flocks six different ways — doves that perch, drones that dart,
   gulls that bank — and the only thing all six agree on is that the bird ends
   up somewhere.

   IT KEEPS BEING A BIRD. The tour overwrites the position its own tick just
   wrote, and touches nothing else, so the wings go on flapping on whatever
   schedule its realm gave them. */
const POV={bird:null,host:null,aim:null,hover:null,t0:0,bank:0,
  route:null,u:0,speed:0,home:null,
  manual:false,keys:new Set(),yaw:0,
  lookX:0,lookY:0,tLookX:0,tLookY:0,
  dir:new THREE.Vector3(0,0,1),pos:new THREE.Vector3(),prev:new THREE.Vector3(),
  vel:new THREE.Vector3()};
/* The keys that mean "I'll fly it myself". Touching any of them takes the bird
   off its tour for good — you do not get handed back to the guide once you have
   taken the controls. */
const POVK=new Set(['w','a','s','d',' ','shift']);
const POV_MOVE=17;            // units a second under your own power
const POV_TURN=1.5;           // radians a second on the rudder
const _mv=new THREE.Vector3();
const _pw=new THREE.Vector3(), _pd=new THREE.Vector3(), _pt=new THREE.Vector3();

/* Every bird currently standing, with the place it belongs to. Found by walking
   for the flock's key rather than by tagging each bird at build time, so the six
   life builders stay untouched and a seventh needs no registration.

   Cached, because this now runs on every pointer move to drive the hover
   reticle and a full traverse of forty merged towns per mousemove is not a
   thing you do. Invalidated by whatever changes which towns are standing. */
let birdCache=null;
const birdsDirty=()=>{ birdCache=null; };
function liveBirds(){
  if(birdCache)return birdCache;
  const out=[];
  if(W) for(const x of (OPEN?OPEN.list:W.quarters)){
    const g=OPEN?x.town:x.island;
    if(!g)continue;
    g.traverse(o=>{ if(o.userData&&o.userData.key==='birds')
      for(const b of o.children) if(b.userData&&b.userData.tick) out.push([b,x]); });
  }
  return (birdCache=out);
}
/* Picked in SCREEN space against the bird's centre, not by raycast. A bird is
   three thin boxes seen from a hundred metres up; a ray through its actual
   geometry is a pixel-hunting exercise, and this is meant to be a thing you
   stumble into. Tight enough that it cannot cover a realm you were aiming at —
   the reticle is what makes a target this small fair. */
const BIRD_PX=18;
function birdAt(cx,cy){
  if(!W)return null;
  /* AT WORLD SCALE THE REALM WINS OUTRIGHT. Six islands and one gesture —
     click a realm to walk into it — and a flock orbiting out to 1.35 island
     radii puts a bird over the very disc you are aiming at. The reticle stops
     the click being a surprise; it does not stop the bird being in the way. So
     over an island there is no offer at all, and only the birds out on the open
     sky beyond the rim can be ridden. Exactly the same disc test pick() uses
     for realms, so the two can never both claim one pixel.

     Inside a realm the trade is reversed and birds stay live everywhere: down
     there a click on a town is a slap, and a slap can afford to lose. */
  if(!OPEN){
    const g=groundAt(cx,cy,0);
    if(g) for(const q of W.quarters){
      if(q.shown<=0)continue;
      if(Math.hypot(g.x-q.x,g.z-q.z)<=spec(Math.max(1,q.level)).radius+3) return null;
    }
  }
  let best=null,bestD=BIRD_PX;
  for(const e of liveBirds()){
    e[0].getWorldPosition(_pw);
    const [sx,sy,sz]=project(_pw.x,_pw.y,_pw.z);
    if(sz<-1||sz>1)continue;
    /* `project` returns pixels inside the container; `cx`/`cy` arrived from
       the window. One of them has to move before a distance between them
       means anything. */
    const d=Math.hypot(sx-(cx-VX),sy-(cy-VY));
    if(d<bestD){ bestD=d; best=e; }
  }
  return best;
}

/* --------------------------------------------------------------- the offer */
const reticle=$('reticle');
function setHover(e){
  const had=!!POV.hover;
  POV.hover=e;
  if(!e){ if(had){ reticle.style.opacity='0'; $('stage').classList.remove('ride'); } return; }
  $('stage').classList.add('ride');
  reticle.style.opacity='1';
}
function layoutReticle(){
  if(!POV.hover)return;
  const b=POV.hover[0];
  if(!b.parent){ setHover(null); return; }
  b.getWorldPosition(_pw);
  const [sx,sy]=project(_pw.x,_pw.y,_pw.z);
  /* No -50%: the element has no size, so its origin is the point itself and
     the ring is what gets centred on it. */
  reticle.style.transform=`translate(${sx|0}px,${sy|0}px)`;
}

let flashT=null;
function flash(){
  const f=$('flash');
  f.classList.add('on');
  clearTimeout(flashT);
  flashT=setTimeout(()=>f.classList.remove('on'),40);
}

/* ---------------------------------------------------------------- the tour */
/* Everywhere worth flying over, in a ring. Ordered by BEARING around the middle
   of the map rather than by rank or by index, so the route is a lap of the
   realm and not a zigzag across it — and closed, so the tour never ends. */
function tourRoute(){
  const live=(OPEN?OPEN.list:W.quarters).filter(x=>(OPEN?x.town:x.island));
  if(!live.length)return null;
  let cx=0,cz=0;
  for(const x of live){ cx+=x.x; cz+=x.z; }
  cx/=live.length; cz/=live.length;
  const ring=[...live].sort((a,b)=>
    Math.atan2(a.z-cz,a.x-cx)-Math.atan2(b.z-cz,b.x-cx));
  const pts=[];
  for(const x of ring){
    const R=spec(Math.max(1,x.level||1)).radius;
    /* Just off the rim and just over the roofline. A route through the middle
       of a town at spire height is a route through the spires; one high enough
       to clear everything is a map, and you can already read the map from
       outside. Skimming the outer edge is the one altitude where the place has
       a scale — you pass the towers rather than looking down on them. */
    const off=R*0.95+2;
    const a=Math.atan2(x.z-cz,x.x-cx);
    pts.push(new THREE.Vector3(x.x+Math.cos(a)*off,
                               (x.baseY||0)+R*0.5+4.5,
                               x.z+Math.sin(a)*off));
  }
  /* One waypoint is not a loop and two is a line you fly back and forth along;
     both come out as a degenerate curve, so pad them into a circle. */
  if(pts.length<3){
    const p=pts[0], r=Math.max(12,Math.hypot(p.x-cx,p.z-cz));
    pts.length=0;
    for(let i=0;i<5;i++){ const a=i/5*TAU;
      pts.push(new THREE.Vector3(cx+Math.cos(a)*r,p?p.y:12,cz+Math.sin(a)*r)); }
  }
  const curve=new THREE.CatmullRomCurve3(pts,true,'catmullrom',0.4);
  return {curve,len:curve.getLength()};
}

function possess(b,host){
  if(POV.bird)return;
  handAbort(); setHover(null);
  POV.bird=b; POV.host=host; POV.t0=clock.getElapsedTime(); POV.bank=0;
  POV.lookX=POV.lookY=POV.tLookX=POV.tLookY=0;
  /* Remember exactly where it was standing so putting it back is free. The bird
     stays parented where it is and the tour is written into its parent's space,
     which keeps it inside everything that already owns and disposes it. */
  POV.home=b.position.clone();
  POV.route=tourRoute();
  /* Sightseeing pace. The old orbit was ambient motion meant to be glanced at
     and this is travel, but travel you cannot look out of is a rollercoaster —
     about four seconds a district, which is long enough to read one. */
  POV.speed=OPEN?9:16;
  POV.manual=false; POV.keys.clear(); POV.yaw=0; POV.vel.set(0,0,0);
  b.getWorldPosition(POV.prev); POV.pos.copy(POV.prev);
  POV.dir.set(0,0,1);
  /* Start the lap at whatever point of the route it is already nearest, so the
     ride begins where the bird is instead of teleporting it across the realm. */
  POV.u=0;
  if(POV.route){
    let bestD=1e9;
    for(let i=0;i<=120;i++){
      const u=i/120, d=POV.route.curve.getPointAt(u).distanceToSquared(POV.prev);
      if(d<bestD){ bestD=d; POV.u=u; }
    }
  }
  setView(camFP);
  rootEl.classList.add('pov');
  emit({riding:{name:(host&&(host.niche?nameOf(host)
    :host.realm.name))||'—',manual:false}});
  panning=rotating=false;
  flash();
}
function unpossess(){
  setHover(null); POV.aim=null;
  if(!POV.bird)return;
  /* Give it its orbit back. Its own tick overwrites position every frame
     anyway, but leaving it parked at the far side of the realm for the one
     frame before that is a visible jump. */
  if(POV.home&&POV.bird.parent) POV.bird.position.copy(POV.home);
  POV.bird=null; POV.host=null; POV.route=null; POV.home=null;
  setView(cam);
  rootEl.classList.remove('pov');
  emit({riding:null});
  flash();
}

function povUpdate(t,dt){
  layoutReticle();
  if(!POV.bird)return;
  const b=POV.bird;
  /* Its district was rebuilt, thrown, or walked out of — the bird you were on
     no longer exists and the camera is riding a detached object. */
  if(!b.parent||!b.userData.tick){ unpossess(); return; }
  /* Living motion off would otherwise mean possessing a bird nailed to the sky.
     Whatever you are riding keeps flying regardless of the toggle. */
  if(!VIEW.life) b.userData.tick(t);

  /* Mouse look, from where the cursor SITS rather than how far it moved. No
     pointer lock to ask for, nothing to click first, and it self-centres — let
     go of the mouse in the middle of the screen and you are facing forward
     again. Read BEFORE the movement, because once you have taken the controls
     this is not a look any more, it is the stick. */
  POV.tLookX=clamp(((PX-VX)/Math.max(1,VW)-0.5)*2,-1,1)*0.95;
  POV.tLookY=clamp(((PY-VY)/Math.max(1,VH)-0.5)*2,-1,1)*0.45;
  const lk=Math.min(1,dt*5);
  POV.lookX+=(POV.tLookX-POV.lookX)*lk;
  POV.lookY+=(POV.tLookY-POV.lookY)*lk;

  /* Where it goes next. Either way this runs AFTER every tick in the frame, so
     it is the last word on the bird's position — and it writes position only,
     which is why the wings its own realm gave it go on flapping underneath. */
  if(POV.manual){
    /* Free flight, and nothing moves unless you move it. The tour is over the
       moment you touch a key — an autopilot you are also steering fights you
       for the same axis, and the bird drifting on its own while you line up a
       shot is the whole of that fight.

       A and D are the RUDDER: they turn the bird, and W and S run along
       whatever it is pointing at. That leaves the mouse doing the same job it
       does on the tour — looking around without steering — so you can watch a
       district go past off your left wing while still flying straight at the
       next one. Height stays on its own two keys rather than riding on the
       look, which is what makes W purely forward. */
    const K=POV.keys;
    const r=(K.has('d')?1:0)-(K.has('a')?1:0);
    POV.yaw+=r*POV_TURN*dt;
    const f=(K.has('w')?1:0)-(K.has('s')?1:0);
    const u=(K.has(' ')?1:0)-(K.has('shift')?1:0);
    _mv.set(Math.cos(POV.yaw)*f,u,Math.sin(POV.yaw)*f);
    if(_mv.lengthSq()>1e-6) _mv.normalize().multiplyScalar(POV_MOVE);
    /* Eased rather than switched, so letting go glides to a stop over a couple
       of wingbeats instead of hitting a wall in mid-air. */
    POV.vel.lerp(_mv,Math.min(1,dt*(_mv.lengthSq()>0?5:3.5)));
    _pt.copy(POV.pos).addScaledVector(POV.vel,dt);
    /* A ceiling and a floor, because there is nothing out there to stop you and
       a bird a thousand units under the map is a black screen with no way back
       but the one key you might not have found yet. */
    _pt.y=clamp(_pt.y,-26,110);
    POV.dir.set(Math.cos(POV.yaw),0,Math.sin(POV.yaw));
    POV.bank=lerp(POV.bank,r*0.30,Math.min(1,dt*5));
    b.parent.worldToLocal(_pt);
    b.position.copy(_pt); b.updateMatrixWorld(true);
    b.getWorldPosition(POV.pos);
    b.rotation.y=-POV.yaw+Math.PI/2;
  }else if(POV.route){
    const {curve,len}=POV.route;
    POV.u=(POV.u+POV.speed*dt/Math.max(1,len))%1;
    curve.getPointAt(POV.u,_pt);
    /* It is a bird, not a rail — but the camera is inside it now, so a bob that
       read as life from behind reads as a swell from in here. */
    _pt.y+=Math.sin(t*0.7)*0.32;
    b.parent.worldToLocal(_pt);
    b.position.copy(_pt); b.updateMatrixWorld(true);
    b.getWorldPosition(POV.pos);
    /* Flattened. A bird's forward is horizontal; its bob is not travel, and
       feeding a climb rate into the camera's axis makes the world heave once a
       second. The height is followed, the pitch is not. */
    _pd.set(POV.pos.x-POV.prev.x,0,POV.pos.z-POV.prev.z);
    if(_pd.lengthSq()>1e-9&&dt>1e-4){
      _pd.normalize();
      /* Signed turn against the heading we were holding, BEFORE it is updated —
         afterwards the two are nearly parallel and there is no turn left to
         read. Divided by dt so it is a turn RATE in radians a second: the raw
         per-frame cross product is proportional to the frame time, which banks
         twice as hard at 60fps as at 120 for the same flight path. */
      const rate=(POV.dir.x*_pd.z-POV.dir.z*_pd.x)/dt;
      POV.bank=lerp(POV.bank,clamp(rate*0.8,-0.34,0.34),Math.min(1,dt*4));
      POV.dir.lerp(_pd,Math.min(1,dt*7)).normalize();
      b.rotation.y=-Math.atan2(POV.dir.z,POV.dir.x)+Math.PI/2;
    }
    /* Whatever heading the tour left off on is the one manual control starts
       from, so taking the controls never snaps you round. */
    POV.yaw=Math.atan2(POV.dir.z,POV.dir.x);
  }else b.getWorldPosition(POV.pos);
  POV.prev.copy(POV.pos);

  /* Swoop in rather than cut, and land in FIRST person. The projection change
     cannot be eased — the flash covers that — but arriving from behind tells
     you what you have just become before it puts you inside it.

     The resting offset is FORWARD of the bird, not behind it: a quarter of a
     unit puts the camera past its own beak, so the body and both wings are
     behind the near plane and you are looking out of the bird rather than at
     it. Anything behind it and you are flying a camera drone. */
  const e=smooth(clamp((t-POV.t0)/0.75,0,1));
  const back=lerp(5.2,-0.25,e), up=lerp(2.6,0.05,e);
  camFP.up.set(0,1,0);
  camFP.position.set(POV.pos.x-POV.dir.x*back,
                     POV.pos.y+up+Math.sin(t*5.5)*0.010*e,
                     POV.pos.z-POV.dir.z*back);
  /* Look along the flight heading turned by the mouse — the position stays
     locked to the flight, so you keep going where the bird is going. */
  /* One rule for both modes, now that the rudder owns the heading in each: look
     along wherever the bird is pointing, turned by the free look. Nosed down
     about sixteen degrees at rest — dead level from above a town puts the
     horizon at the bottom of the frame and three quarters of the screen is
     empty sky, and you are flying over a world you should be able to see
     without being told to aim at it. */
  const head=Math.atan2(POV.dir.z,POV.dir.x)+POV.lookX*e;
  camFP.lookAt(POV.pos.x+Math.cos(head)*9,
               POV.pos.y-2.6-POV.lookY*e*9,
               POV.pos.z+Math.sin(head)*9);
  camFP.rotateZ(POV.bank*e);
  camFP.updateMatrixWorld(true);
  camFP.matrixWorldInverse.copy(camFP.matrixWorld).invert();
}

/* ===================================================================== loop */
let last=0, lastSky=0, raf=0;
function frame(){ raf=requestAnimationFrame(frame); tick(); }
/* Split out from frame() so one can be run without scheduling the next — a
   hidden tab pauses rAF, and the only way to step the world in that state is to
   have a tick that does not re-queue itself. */
function tick(){
  if(disposed)return;
  const t=clock.getElapsedTime(), dt=Math.min(0.05,t-last); last=t;
  /* The overlay covers the whole canvas with an opaque surface for as long as
     this is loading, and a frame costs three passes over the scene plus a label
     solve. Painting them under it is what was stealing time from the chunked
     build the progress bar is reporting on. boot() draws one real frame the
     moment it flips to ready, so nothing is ever revealed unpainted. */
  const curtained=STATE.status==='loading';
  if(resizeDirty){ resizeDirty=false; reflow(); }

  if(W){
    /* Before anything reads DAY this frame, and before the land rebuild below,
       so a scrubbed day is fully standing by the time this frame draws. */
    flushSeek();
    if(playing){
      acc+=dt*DPS*speed;
      let stepped=false;
      while(acc>=1&&DAY<W.nT-1){ acc-=1; step(DAY+1); stepped=true; }
      /* Once for the frame, not once per day crossed. At 16x a frame can cross
         two dozen days, and only the last one is ever drawn or emitted — the
         per-day work inside step (toasts, pulses, level-up queueing) stays
         where it is, because those are events rather than a state to paint. */
      if(stepped) updateHud();
      if(DAY>=W.nT-1) stop();
    }
    /* A realm's LAND only changes ten times over a whole history, but the
       monuments standing on it change constantly — and refreshing a realm costs
       ~100ms, so doing it per level-up stutters and doing it only on pause left
       the world visibly frozen while the numbers climbed. So: at most one realm
       refresh every 0.4s, oldest first, playing or not. */
    if(!OPEN&&!queue.length&&!active.length&&t-lastSky>0.4){
      const q=W.quarters.find(x=>x.skyStale&&x.island&&HAND.x!==x);
      if(q){ q.skyStale=false; lastSky=t; raiseRealm(q,realmLevelOf(q.shown),playing); }
    }
    /* Queued rebuilds, two a frame — one level-up is ~40 ms of work and a burst
       of them at 16× would otherwise land in a single frame. */
    for(let n=0;n<2&&queue.length;n++){
      const it=queue.shift(); const L=it.queued; it.queued=0;
      if(!L)continue;
      /* Rebuilding what the hand is holding would dispose the group mid-swing.
         It waits its turn; you cannot hold a town for long enough to matter. */
      if(HAND.x===it){ it.queued=L; queue.push(it); continue; }
      if(it.list) raiseRealm(it,L,true);
      else if(L!==it.level) raise(it,L,true);
    }
    /* The transition: everything already standing keeps its exact transform,
       and only the delta animates — new land RISES, new structure BUILDS. */
    for(let i=active.length-1;i>=0;i--){
      const d=active[i], age=t-d.t0; let live=false;
      for(const nd of d.nodes||[]){
        if(nd.done)continue;
        live=true;
        if(nd.mode==='rise'){
          const u=clamp(age/RISE,0,1);
          nd.obj.position.y=lerp(-1.8,0,smooth(u));
          if(u>=1){ nd.obj.position.y=0; nd.done=true; }
        }else if(nd.mode==='build'){
          const u=clamp((age-nd.delay)/0.5,0,1), e2=smooth(u);
          nd.obj.scale.set(lerp(0.86,1,Math.min(1,e2*1.6)),
                           Math.max(0.02,e2*(1+0.1*(1-e2))),
                           lerp(0.86,1,Math.min(1,e2*1.6)));
          if(u>=1){ nd.obj.scale.set(1,1,1); nd.done=true; }
        }else nd.done=true;
      }
      /* A realm island and a district town both land in `active`, and they
         freeze differently. Calling the district version on a realm threw on
         every frame — which stopped the rest of the loop dead (labels, camera,
         the queue drain) and left the island in `active` forever, so the list
         grew with every rebuild the replay queued. */
      if(!live||age>2.6){
        try{ if(d.list) settleRealm(d); else settle(d); }
        catch(err){ console.error('settle failed',err); }
        active.splice(i,1);
      }
    }
    /* Founding a district and levelling one up both move a border, so the land
       is rebuilt — but at most once a frame, because a burst of level-ups at
       16x would otherwise redraw the continent a dozen times in one tick. */
    if(landDirty&&!booting) buildLand();
    if(VIEW.life){
      for(const [m,fn] of matTicks) fn(m,t);
      for(const o of airTicks) o.userData.tick(t);
      for(const o of landTicks) o.userData.tick(t);
      for(const o of cloudTicks) o.userData.tick(t);
      const live=OPEN?OPEN.list:W.quarters;
      for(const x of live) if(x.animated)
        for(const o of x.animated) o.userData.tick&&o.userData.tick(t);
    }
    fade+=(fadeTo-fade)*Math.min(1,dt*4.5);
    yaw+=(yawTarget-yaw)*Math.min(1,dt*9);
    zoom+=(zoomTarget-zoom)*Math.min(1,dt*6);
    syncCam();
    /* The label layer reads the world from outside it and is hidden while you
       are inside it, so there is no reason to solve it forty times a second. */
    /* Whenever the solver is skipped for a reason other than "nothing moved",
       the cached key is dropped: the labels were hidden by the ride or covered
       by the curtain, and coming back to an unchanged camera must still re-solve
       rather than leave them where they were left. */
    if(!POV.bird&&!curtained){ layoutLabels(); layoutFx(t); }
    else labelKey='';
    placeStandard(t); stdWave(t);
    /* After the labels, because it has the last word on the label of whatever
       it is holding. */
    handUpdate(t,dt);
    /* Last: the birds have already moved this frame, and the camera rides
       whatever position they ended up at. */
    povUpdate(t,dt);
  }
  if(!curtained) drawFrame(t);
}

placeCam(); frame();

/* =============================================================== controller
   Everything the page is allowed to do. Deliberately small: the world is a
   record, so nothing here can change what is in it — only where you are
   standing and which day you are standing on. */
function focus(key){
  if(!W)return;
  if(OPEN){
    const d=OPEN.list.find(x=>x.niche.id===key);
    if(d){ select(d.i); flyTo(d); }
    return;
  }
  const q=W.quarters.find(x=>x.realm.id===key);
  if(q) enterRealm(q);
}

function dispose(){
  if(disposed)return;
  disposed=true;
  cancelAnimationFrame(raf);
  if(boxObserver) boxObserver.disconnect();
  for(const [target,type,fn,opts] of listeners) target.removeEventListener(type,fn,opts);
  listeners.length=0;
  if(W){ for(const d of W.districts) hideDistrict(d);
         for(const q of W.quarters) hideRealm(q); }
  landRoot.clear();
  /* The context, not just the objects on it. A page that mounts a world, leaves
     and comes back holds two contexts otherwise, and browsers cap them low
     enough that the third one silently refuses to render. */
  try{ renderer.dispose(); renderer.forceContextLoss(); }catch(e){ /* already gone */ }
  rootEl.remove();
}

return {
  /* `model` comes from buildWorld — the page owns the fetching, this owns the
     drawing, and the boundary between them is one plain object. */
  load: model=>boot(model),
  /* The same `model`, rebuilt once the growth log is in. Safe to call before the
     world has finished standing up — it is held and folded in at the end. */
  attachHistory,
  play: ()=>{ if(!playing) togglePlay(); },
  pause: ()=>{ if(playing) togglePlay(); },
  toggle: togglePlay,
  seek: seekTo,
  toStart: ()=>seekTo(0),
  toEnd: ()=>{ if(W) seekTo(W.nT-1); },
  setSpeed: s=>{ speed=s; emit({speed:s}); },
  focus,
  /* Drops the selection without leaving the realm: closing the district's feed
     has to take the plot's lit border with it, or the world still says a town
     is open after the panel reading it has gone. */
  deselect: ()=>{ if(W) select(null); },
  leaveRealm,
  frameWorld: ()=>{ if(W) frameWorld(); },
  attachSpark: c=>drawSpark(c),
  /* A bare render for the share card: the whole world, framed for a picture
     rather than for the panel, with none of the DOM the overlay projects.

     Three things here are load-bearing. The read is SYNCHRONOUS because the
     drawing buffer is not preserved — an async toBlob comes back empty, and
     preserving the buffer would tax every frame every viewer draws to serve a
     capture that happens once. The whole thing is one task, so the browser
     never paints the hero framing and the reader does not see the camera jump
     and come back. And it frames worldBounds rather than frameWorld() so the
     card shows the place, not whichever realm the reader happens to be inside. */
  capture: quality=>{
    if(!W||!booted) return '';
    const pad0={...PAD}, tgt0=target.clone(), zoom0=zoom;
    /* No rail to dodge here, and extra room at the foot so the card's scrim
       falls on sky instead of eating the districts. */
    Object.assign(PAD,{l:44,r:44,t:44,b:150});
    frameBounds(W.worldBounds);
    drawFrame(performance.now());
    const url=renderer.domElement.toDataURL('image/jpeg',quality??0.85);
    Object.assign(PAD,pad0); target.copy(tgt0); zoom=zoom0; syncCam();
    drawFrame(performance.now());
    return url;
  },
  /* The overlay stands on the world, so the camera fit has to know where. */
  setPadding: p=>{ Object.assign(PAD,p); if(W) frameWorld(); },
  /* Look and crest are the owner's, not the viewer's, so every visitor is shown them too. */
  setLook: lookSet,
  setCrest: crestSet,
  setSky: skySet,
  /* The rung lines are the owner's own business, so unlike the look and the
     crest this one IS about the viewer. Read live by the label pass, which runs
     every frame, so there is nothing to rebuild and nothing to invalidate. */
  setLevelProgress: on=>{ LVLPROG=!!on; },
  setViewFlags: v=>{ Object.assign(VIEW,v);
    if(W){ paintBorders();
           clouds.visible=VIEW.sky;
           scene.background=VIEW.sky?skyTex:new THREE.Color(0x0F1218); } },
  dispose,
};
}

