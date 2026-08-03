import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }     from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WORLD_CSS } from './styles';
import {
  LEVELS,
  levelOf,
  mixTok,
  NICHE_OF,
  paletteOf,
  realmLevelOf,
  REALM_OF,
  REALMS,
  T,
} from './taxonomy';

/* ============================================================================
   DEVCRAFT — the world your reading built.

   This is devcraft's `world-lab.html` renderer, near enough verbatim, wrapped in
   a factory so a page can mount one and take it down again. What changed on the
   way in, and nothing else did:

     - the world comes from the API (`buildWorld`, its own module) rather than
       from a sharded static export;
     - the lab's left panel, its timeline and its boot screen are React now. The
       engine keeps only the DOM that has to be positioned by projecting a world
       point to a pixel — labels, leader lines, the ride reticle, the toast feed
       — and pushes everything else out through `onState`;
     - the customisation benches are gone for this pass: no sky palette, no
       names, no crest, no look presets, no FX switches. Defaults only.

   One engine per page. Every accumulator the art builders share lives inside
   this closure, so two of them would not collide — but two WebGL contexts over
   one world would, and there is only ever one world on a page.
   ========================================================================== */
export function createWorldEngine(options) {
const { container, onState } = options;

/* ============================================================================
   ARCANE LAB — concept bench for the personal world, rendered procedurally in 3D.

   What this file is arguing, against the earlier iterations:

   1. A district is NOT one building that gets taller. It is a PLACE that gets
      bigger, busier and better tended. Land area is the attention channel —
      "the more I read, the more land, the more life". Height is a supporting
      voice, not the melody.
   2. Twelve levels, not five. The five-level ladder in world-procedural.html
      saturates hard on real data (a four-year veteran reads a wall of 23
      citadels), so the top of the ladder carries no information. Twelve log
      steps span 1 → 2,000+ articles and keep separating people all the way up.
   3. Not morbid. The old arcane realm was a night-purple crystal graveyard.
      This one is a sunlit sky-garden: warm ivory stone, mint terraces, teal
      water, and purple reserved for the magic itself. Growth should look like
      somewhere you'd want to live.
   4. Everything is generated from (niche, level) — no models, no textures, no
      network. Two knobs, and the whole place re-composes.

   Nothing here writes to the shipped renderers; it is a standalone bench.
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
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
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
  const a=innerWidth/innerHeight;
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
const sunDir=new THREE.Vector3(0.36,0.87,0.23), _sd=new THREE.Vector3();
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
/* The underside: two lofted rings tapering to a point. This is what sells
   "floating" — a flat-bottomed island reads as a table. */
function underside(prof, radius, depth, seed){
  const rnd=rngOf(seed), n=prof.length, pos=[];
  const ring=(scale,y,jit)=>{
    const a=[];
    for(let i=0;i<n;i++){
      const ang=i/n*TAU, r=prof[i]*radius*scale*(1+(rnd()-0.5)*jit);
      a.push([Math.cos(ang)*r,y,Math.sin(ang)*r]);
    }
    return a;
  };
  const r0=ring(1,0,0), r1=ring(0.66,-depth*0.42,0.28), r2=ring(0.3,-depth*0.76,0.4);
  const apex=[(rnd()-0.5)*radius*0.15,-depth,(rnd()-0.5)*radius*0.15];
  const quad=(A,B)=>{ for(let i=0;i<n;i++){ const j=(i+1)%n;
    pos.push(...A[i],...B[i],...B[j], ...A[i],...B[j],...A[j]); } };
  quad(r0,r1); quad(r1,r2);
  for(let i=0;i<n;i++){ const j=(i+1)%n; pos.push(...r2[i],...apex,...r2[j]); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals(); return g;
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
const world=new THREE.Group(); scene.add(world);
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
let stage=null;             // current district group
let stats={};
/* Carried across rebuilds so a level change can be a transition rather than a
   fresh start: key → world position of every prop in the outgoing build. */
let prevKeys=new Set(), prevRadius=0, prevNicheId=null;
/* Flat list of everything the current build wants animated, with its mode.
   Kept separately from the scene graph because "new land" nests its own
   paving and scatter, and the transition still has to reach all of it. */
const nodes=[];
const node=(obj,opt)=>{ nodes.push({obj,mode:opt.mode,delay:opt.delay||0,
  from0:opt.from0??0,done:false}); };
let framed=false;           // camera is framed once, never per level

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

/* ---- spec(level): every number the builder needs, derived from one knob ---- */
function spec(level){
  const t=(level-1)/11;
  const radius=snapR(2.4+11.6*Math.pow(t,1.05));   // 2.7 → 14.4 on the ring grid
  return {
    level, radius,
    rings:  Math.round(radius/RING_W),
    tiers:  tierOf(radius-1e-6)+1,
    /* These are UNLOCK GATES, not counts. How many of a family exist is decided
       by how much of its lattice falls inside the current coast and under the
       fill threshold — and since both of those only ever open further, growth
       can only add. No building is moved or evicted to make room for the next. */
    /* FRONT-LOADED, and the reason is the measured distribution rather than
       taste. p50 is 2 articles and p90 is 12, so for ninety percent of readers
       every district in the world is L1-L3 — and with the first roof gated at
       L4 that meant ninety percent of readers never saw a building at all. The
       jump from landscape to town was real and it was behind a wall almost
       nobody reaches.
       The THRESHOLDS are untouched: land area still means what it meant, and
       nobody's world just got bigger. What moved is which pieces of the
       vocabulary unlock when — a roof at L2, identity and heraldry at L3,
       hedges at L4. The top of the ladder is exactly as it was. */
    cottages: level<2?0:1,
    spires:   level<6?0:clamp(Math.round((level-4)/2),1,5),
    domes:    level<6?0:level<10?1:2,
    trees:    level<2?0:1,
    crystals: 1,
    lamps:    level<2?0:1,
    hedges:   level<4?0:1,
    rocks:    1,
    flowers:  1,
    tufts:    1,
    /* Density infill: a well-read district is denser per acre, not just wider.
       Monotone by construction. */
    /* Opens faster over the first few rungs than it used to. Unlocking a
       cottage at L2 achieves nothing if the density gate then refuses to place
       one — the lattice slot has to be under the threshold as well as inside
       the coast, and at the old curve L2 sat at 0.556 on an island with barely
       a slot to spare. Still monotone, still 1.0 at the top. */
    fill:     clamp(0.58+level*0.038,0.58,1),
    pond:     level>=5,
    falls:    level>=7,
    /* No neighbouring islets. The finished world stands ~40 of these side by
       side, and every stray satellite is either a collision with the next
       district or a hole in the map — a district has to be ONE piece of land.
       So past L7 it grows off its own rim and under its own keel instead:
       cantilever decks, sky bridges, an undercroft, and finally a Great Spire.
       Same job as the archipelago — break the silhouette out of a lump — with
       nothing that can wander into a neighbour's plot. */
    cantilevers: [0,0,0,0,0,0,0,2,3,5,6,7][level-1],
    bridges:  level>=9,
    undercroft: level<10?0:Math.round(radius*1.1),
    greatSpire: level>=11,
    orrery:   level>=10,
    arch:     level>=3,
    signature: level>=3,
    banners:  level>=3,
    birds:    level>=6?Math.min(3+level,14):0,
    wisps:    3+level*3,
  };
}

/* --------------------------------------------------------------- terraces */
/* One ring of land. Geometry depends only on j — never on the island's current
   size — so ring 5 built at L4 is the identical mesh at L12 and simply stays
   put. The plateau is the high ground and each ring beyond a boundary steps
   DOWN, so growth adds coastline at lower elevations and never lifts the
   centre (which would drag the whole town up with it). */
function buildRing(P,prof,j){
  const r1=(j+1)*RING_W, r0=j*RING_W;
  const y=tierY(r1-1e-6)+j*0.002;   // hair of offset: no coplanar deck tops
  const shape=polyShape(prof,r1);
  /* Holes overlap the neighbour slightly so the shared wall is never coplanar. */
  if(j>0) shape.holes.push(polyHole(prof,r0-0.06));
  const geo=new THREE.ExtrudeGeometry(shape,
    {depth:RING_T,bevelEnabled:false,curveSegments:1});
  geo.rotateX(-Math.PI/2); geo.translate(0,y-RING_T,0); geo.computeVertexNormals();
  /* Group 0 is the caps, group 1 the walls: grass on top, stone in the cliff. */
  const cap=new THREE.Color(tierOf(r1-1e-6)===0?P.ground2:P.ground)
    .lerp(new THREE.Color(0xFFFFFF),Math.max(0,3-tierOf(r1-1e-6))*0.045);
  if(FX.vc) bakeVC(geo);
  const m=new THREE.Mesh(geo,[mat(cap.getHex(),{rough:0.98}),
    mat(j%2?P.cliff:P.cliffDark,{rough:0.95})]);
  return m;
}

/* ------------------------------------------------------------- structures */
function buildCottage(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.55,rnd())*scale, d=lerp(0.95,1.45,rnd())*scale;
  const h=lerp(0.85,1.25,rnd())*scale;
  const wall=rnd()<0.5?P.stone:P.stone2;
  g.add(meshOf(boxG(w,h,d),mat(wall,{rough:0.9}))
    .translateY(h/2));
  /* Half the houses get a second storey, offset and rotated — the cheapest way
     to stop a row of cottages reading as a row of boxes. */
  let roofY=h, rw=w, rd=d;
  if(rnd()<0.45){
    const h2=h*0.7, w2=w*0.78, d2=d*0.78;
    const up=meshOf(boxG(w2,h2,d2),mat(P.wood,{rough:0.88}));
    up.position.set((rnd()-0.5)*0.16,h+h2/2,(rnd()-0.5)*0.16);
    up.rotation.y=(rnd()-0.5)*0.4; g.add(up);
    roofY=h+h2; rw=w2; rd=d2;
  }
  const rr=Math.max(rw,rd)*0.72, rh=lerp(0.42,0.72,rnd())*scale;
  const roof=meshOf(new THREE.ConeGeometry(rr,rh,4),
    mat(rnd()<0.6?P.roof:P.roof2,{rough:0.75}));
  roof.rotation.y=Math.PI/4; roof.position.y=roofY+rh/2; g.add(roof);
  const fin=meshOf(new THREE.OctahedronGeometry(0.09*scale),glowMat(P.accent,1.6));
  fin.position.y=roofY+rh+0.08; g.add(fin);
  /* Lit windows: emissive, and pushed proud of the wall so they never z-fight. */
  const wm=glowMat(0xFFE9B8,0.9);
  for(let i=0;i<2+Math.floor(rnd()*3);i++){
    const side=Math.floor(rnd()*4), sw=0.2*scale, sh=0.26*scale;
    const win=meshOf(boxG(sw,sh,0.06),wm,false,false);
    const off=(rnd()-0.5)*0.5;
    if(side===0)win.position.set(off,h*0.55,d/2+0.01);
    else if(side===1){win.position.set(off,h*0.55,-d/2-0.01);win.rotation.y=Math.PI;}
    else if(side===2){win.position.set(w/2+0.01,h*0.55,off);win.rotation.y=Math.PI/2;}
    else {win.position.set(-w/2-0.01,h*0.55,off);win.rotation.y=-Math.PI/2;}
    g.add(win);
  }
  if(rnd()<0.4){
    const ch=meshOf(boxG(0.2,0.6,0.2)
      .translate(0,0.3,0),mat(P.cliffDark));
    ch.position.set(w*0.28,h,d*0.2); g.add(ch);
    /* Smoke: three puffs on a slow rising loop. Chimneys with no smoke look
       abandoned, and this district must never look abandoned. */
    for(let k=0;k<3;k++){
      const p=meshOf(new THREE.IcosahedronGeometry(0.11,0),
        mat(0xFFFFFF,{opacity:0.45,flat:false,rough:1}),false,false);
      p.position.set(w*0.28,h+0.6,d*0.2);
      p.userData.tick=(t)=>{
        const u=((t*0.28+k/3)%1);
        p.position.y=h+0.6+u*1.5;
        p.position.x=w*0.28+Math.sin(u*4+k)*0.12;
        p.scale.setScalar(0.5+u*1.6);
        p.material.opacity=0.4*(1-u);
      };
      g.add(p); animated.push(p);
    }
  }
  return g;
}

function buildSpire(P,rnd,h,great){
  const g=new THREE.Group();
  const segs=3+Math.floor(rnd()*3);
  let y=0, r=lerp(0.42,0.62,rnd());
  for(let i=0;i<segs;i++){
    const sh=h/segs*lerp(0.85,1.15,rnd()), rt=r*lerp(0.74,0.9,rnd());
    const s=meshOf(new THREE.CylinderGeometry(rt,r,sh,8),
      mat(i%2?P.stone:P.stone2,{rough:0.85}));
    s.position.y=y+sh/2; g.add(s);
    const band=meshOf(new THREE.CylinderGeometry(rt*1.14,rt*1.14,0.1,8),
      mat(P.metal,{metal:0.55,rough:0.35}));
    band.position.y=y+sh; g.add(band);
    /* One rune band per spire, and it turns — the vertical is where a district
       gets to say "there is power here" without going dark to do it. */
    if(i===segs-2){
      const rune=meshOf(new THREE.TorusGeometry(rt*1.5,0.045,6,20),glowMat(P.accent,1.8),false,false);
      rune.rotation.x=Math.PI/2; rune.position.y=y+sh*0.5;
      rune.userData.tick=t=>{rune.rotation.z=t*0.5;};
      g.add(rune); animated.push(rune);
    }
    y+=sh; r=rt;
  }
  const balc=meshOf(new THREE.CylinderGeometry(r*1.7,r*1.5,0.16,8),mat(P.stone2));
  balc.position.y=y-0.1; g.add(balc);
  const rh=lerp(1.0,1.7,rnd());
  const roof=meshOf(new THREE.ConeGeometry(r*1.5,rh,8),mat(P.roof,{rough:0.7}));
  roof.position.y=y+rh/2; g.add(roof);
  const cr=meshOf(new THREE.OctahedronGeometry(0.26),glowMat(P.accent,2.0));
  cr.position.y=y+rh+0.42; cr.scale.y=1.7;
  cr.userData.tick=t=>{cr.rotation.y=t*0.6;cr.position.y=y+rh+0.42+Math.sin(t*1.3)*0.09;};
  g.add(cr); animated.push(cr);
  const halo=meshOf(new THREE.TorusGeometry(0.55,0.035,6,24),glowMat(P.accent2,1.6),false,false);
  halo.position.y=y+rh+0.42;
  halo.userData.tick=t=>{halo.rotation.x=Math.PI/2+Math.sin(t*0.4)*0.5;halo.rotation.z=t*0.8;};
  g.add(halo); animated.push(halo);
  const win=glowMat(0xFFE9B8,0.85);
  for(let i=0;i<4;i++){
    const w=meshOf(boxG(0.16,0.3,0.05),win,false,false);
    const a=rnd()*TAU, wy=lerp(0.6,h-0.6,i/4+rnd()*0.12);
    w.position.set(Math.cos(a)*r*1.06,wy,Math.sin(a)*r*1.06);
    w.rotation.y=-a+Math.PI/2; g.add(w);
  }
  /* The Great Spire. Once a district can no longer widen, it needs ONE element
     that still says "bigger" at silhouette scale — a beacon crown that reads
     from across the map, and the flag the whole district flies. */
  if(great){
    const bh=y+rh+1.1;
    const beacon=meshOf(new THREE.IcosahedronGeometry(0.4,1),glowMat(P.accent,2.4),false,false);
    beacon.position.y=bh; g.add(beacon);
    const cage=meshOf(new THREE.TorusGeometry(0.62,0.05,6,20),
      mat(P.metal,{metal:0.7,rough:0.25,env:1.1}),false,false);
    cage.position.y=bh; g.add(cage);
    const cage2=cage.clone(); cage2.position.y=bh; g.add(cage2);
    cage.userData.tick=t=>{cage.rotation.set(t*0.4,0,0);};
    cage2.userData.tick=t=>{cage2.rotation.set(0,0,t*0.33);};
    animated.push(cage,cage2);
    beacon.userData.tick=t=>{
      beacon.material.emissiveIntensity=2.0+Math.sin(t*1.4)*0.7;
      beacon.scale.setScalar(1+Math.sin(t*1.4)*0.05);
    };
    animated.push(beacon);
    /* Light spilling down the shaft, so the beacon lights the tower it's on. */
    for(let k=0;k<3;k++){
      /* Own material, not a cached one — these fade per frame, and mutating a
         shared material would fade every other glow in the district with them. */
      const rm=new THREE.MeshStandardMaterial({color:P.accent2,emissive:P.accent2,
        emissiveIntensity:1.4,roughness:0.3,transparent:true,opacity:1});
      const ring=meshOf(new THREE.TorusGeometry(r*1.3,0.03,5,18),rm,false,false);
      ring.rotation.x=Math.PI/2;
      ring.userData.tick=t=>{
        const u=(t*0.3+k/3)%1;
        ring.position.y=lerp(bh-0.6,0.4,u);
        ring.scale.setScalar(lerp(0.8,1.5,u));
        rm.opacity=1-u;
      };
      g.add(ring); animated.push(ring);
    }
  }
  return g;
}

function buildDome(P,rnd){
  const g=new THREE.Group();
  const r=lerp(1.0,1.5,rnd()), h=lerp(0.7,1.1,rnd());
  g.add(meshOf(new THREE.CylinderGeometry(r,r*1.06,h,12),mat(P.stone)).translateY(h/2));
  const band=meshOf(new THREE.CylinderGeometry(r*1.06,r*1.06,0.1,12),
    mat(P.metal,{metal:0.5,rough:0.35}));
  band.position.y=h; g.add(band);
  const dome=meshOf(new THREE.SphereGeometry(r*0.98,14,8,0,TAU,0,Math.PI/2),
    mat(P.roof,{rough:0.6,flat:false}));
  dome.position.y=h; g.add(dome);
  const top=meshOf(new THREE.OctahedronGeometry(0.2),glowMat(P.accent,1.8));
  top.position.y=h+r*0.98+0.18;
  top.userData.tick=t=>{top.rotation.y=t*0.5;}; g.add(top); animated.push(top);
  for(let i=0;i<6;i++){
    const a=i/6*TAU;
    const col=meshOf(new THREE.CylinderGeometry(0.09,0.09,h*0.95,6),mat(P.stone2));
    col.position.set(Math.cos(a)*r*1.1,h*0.475,Math.sin(a)*r*1.1); g.add(col);
  }
  const arc=meshOf(new THREE.RingGeometry(r*0.3,r*0.42,20),
    glowMat(P.accent2,1.1),false,false);
  arc.rotation.x=-Math.PI/2; arc.position.y=h+0.02; g.add(arc);
  return g;
}

function buildArch(P,rnd){
  const g=new THREE.Group();
  const w=lerp(1.5,2.2,rnd()), h=lerp(1.6,2.4,rnd());
  for(const s of [-1,1]){
    const p=meshOf(new THREE.CylinderGeometry(0.16,0.2,h,6),mat(P.stone));
    p.position.set(s*w/2,h/2,0); g.add(p);
  }
  const top=meshOf(new THREE.TorusGeometry(w/2,0.15,6,16,Math.PI),mat(P.stone2));
  top.position.y=h; g.add(top);
  const key=meshOf(new THREE.OctahedronGeometry(0.19),glowMat(P.accent,1.7));
  key.position.y=h+w/2*0.1+0.2;
  key.userData.tick=t=>{key.rotation.z=t*0.7;key.position.y=h+0.3+Math.sin(t*1.6)*0.05;};
  g.add(key); animated.push(key);
  return g;
}

function buildTree(P,rnd){
  const g=new THREE.Group();
  const h=lerp(0.7,1.5,rnd());
  g.add(meshOf(new THREE.CylinderGeometry(0.07,0.11,h,5),mat(P.wood)).translateY(h/2));
  const n=2+Math.floor(rnd()*2);
  for(let i=0;i<n;i++){
    const r=lerp(0.4,0.62,rnd())*(1-i*0.18);
    const b=meshOf(new THREE.IcosahedronGeometry(r,0),
      mat(rnd()<0.5?P.foliage:P.foliage2,{rough:0.95}));
    b.position.set((rnd()-0.5)*0.3,h+i*0.32,(rnd()-0.5)*0.3);
    b.rotation.set(rnd()*3,rnd()*3,rnd()*3); g.add(b);
  }
  /* Blossom lights. Purple magic living in the plants, not just in the towers —
     this is most of what keeps the realm from reading as a mineral wasteland. */
  if(rnd()<0.5){
    for(let i=0;i<3;i++){
      const b=meshOf(new THREE.SphereGeometry(0.07,6,5),glowMat(P.bloom,1.3),false,false);
      b.position.set((rnd()-0.5)*0.8,h+rnd()*0.6,(rnd()-0.5)*0.8); g.add(b);
    }
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*0.8+sway)*0.035;};
  animated.push(g);
  return g;
}

function buildCrystal(P,rnd){
  const g=new THREE.Group();
  const n=2+Math.floor(rnd()*4);
  for(let i=0;i<n;i++){
    const h=lerp(0.35,1.5,rnd()), w=lerp(0.13,0.3,rnd());
    const c=meshOf(new THREE.OctahedronGeometry(1,0),
      mat(rnd()<0.6?P.accent:P.accent2,{emissive:rnd()<0.6?P.accent:P.accent2,
        ei:0.55,rough:0.25,flat:true,opacity:0.92}));
    c.scale.set(w,h,w);
    c.position.set((rnd()-0.5)*0.6,h*0.55,(rnd()-0.5)*0.6);
    c.rotation.set((rnd()-0.5)*0.3,rnd()*3,(rnd()-0.5)*0.3);
    g.add(c);
  }
  const ph=rnd()*TAU;
  g.userData.tick=t=>{
    const p=0.55+Math.sin(t*1.1+ph)*0.35;
    g.children.forEach(c=>c.material.emissiveIntensity=p);
  };
  animated.push(g);
  return g;
}

/* ---------------------------------------------------------- the lodestone */
/* The founding marker, and the only object in this file placed at EVERY level
   from one. Reading a single article gets you this.

   It exists because L1 was not keeping its own promise. The ladder copy says a
   waystone is "a single lodestone on bare rock" and what stood there was three
   interchangeable crystals, a rock and some grass — landscape, not a marker
   somebody left. That matters more than any other level in the file: ~46% of
   all districts are L1, and for the median reader this IS the product.

   It sits OFF CENTRE, at a fixed offset and a fixed bearing, for the whole life
   of the plot. Centred would have been the obvious call and it is the wrong
   one: the middle is where the signature monument rises at L3, and a founding
   stone that had to shuffle aside to make room would break the one rule the
   layout is built on. Off centre from the start, the monument simply grows up
   beside it — and at L12 there is still a small old stone standing on the
   oldest ground in the district, which is the whole point of never moving
   anything. */
function buildLodestone(P,rnd){
  const g=new THREE.Group();
  /* A footing, a kerb and paving. The stone alone reads as a rock that happened
     to be there; it is the DRESSED ground around it that says somebody set it
     up on purpose, and that reading is the entire job at L1. */
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
    const pv=meshOf(boxG(0.44,0.07,0.32),mat(P.stone2,{rough:0.98}),false,true);
    pv.position.set(Math.cos(a)*d,0.04,Math.sin(a)*d);
    pv.rotation.y=rnd()*TAU; g.add(pv);
  }
  /* The stone itself: a five-sided tapered prism, flattened on one axis so it
     is a SLAB rather than a post, and leaned a few degrees. Standing perfectly
     upright it read as a bollard. */
  const h=1.52+rnd()*0.26;
  const st=new THREE.Group();
  const slab=meshOf(new THREE.CylinderGeometry(0.185,0.30,h,5),mat(P.stone,{rough:0.9}));
  slab.scale.z=0.52; slab.position.y=h/2; st.add(slab);
  /* Two carved courses, the upper one lit. The band is what makes it a marked
     stone instead of a menhir, and it is also the district accent arriving at
     L1 — the only colour on the plot that is about the SUBJECT rather than
     about the realm. */
  const band=meshOf(new THREE.CylinderGeometry(0.212,0.222,0.10,5),
    glowMat(P.accent,1.35),false,false);
  band.scale.z=0.56; band.position.y=h*0.74; st.add(band);
  const band2=meshOf(new THREE.CylinderGeometry(0.238,0.248,0.06,5),
    mat(P.stone2,{rough:0.92}),false,false);
  band2.scale.z=0.56; band2.position.y=h*0.50; st.add(band2);
  st.position.y=0.16; st.rotation.set(0.05,rnd()*TAU,-0.05); g.add(st);
  /* The shard. It is the one thing moving on an L1 plot, and at L1 nothing else
     in the district has a tick at all — which is the difference between a world
     that is small and a world that is asleep. Costs one draw call: mergeStatic
     leaves anything with a tick alone, and this is one object per district. */
  const c=meshOf(new THREE.OctahedronGeometry(0.25),glowMat(P.bloom||P.accent,1.9),
    false,false);
  c.scale.y=1.5;
  const cy=h+0.60;
  c.position.y=cy;
  c.userData.tick=t=>{ c.rotation.y=t*0.5; c.position.y=cy+Math.sin(t*1.15)*0.08; };
  g.add(c); animated.push(c);
  return g;
}

function buildLamp(P,rnd){
  const g=new THREE.Group();
  const h=lerp(0.9,1.4,rnd());
  g.add(meshOf(new THREE.CylinderGeometry(0.045,0.07,h,6),mat(P.cliffDark))
    .translateY(h/2));
  const orb=meshOf(new THREE.IcosahedronGeometry(0.14,1),glowMat(0xFFE3A0,2.0),false,false);
  orb.position.y=h+0.18; g.add(orb);
  /* Halo kept small and dim. Additive sprites STACK: a dozen lamps clustered on
     the inner terrace summed into one blown-out white blob over the middle of
     the district, which read as a lens flare rather than as lamplight. */
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.accent,
    transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.scale.setScalar(0.6); s.position.y=h+0.18; g.add(s);
  const ph=rnd()*TAU;
  g.userData.tick=t=>{
    orb.position.y=h+0.18+Math.sin(t*1.4+ph)*0.06;
    s.position.y=orb.position.y;
    s.material.opacity=0.18+Math.sin(t*2+ph)*0.06;
  };
  animated.push(g);
  return g;
}

function buildHedge(P,rnd){
  const g=new THREE.Group();
  const style=rnd();
  if(style<0.45){
    const l=lerp(0.8,1.8,rnd());
    const b=meshOf(boxG(l,0.34,0.3),mat(P.foliage,{rough:0.98}));
    b.position.y=0.17; b.rotation.y=rnd()*TAU; g.add(b);
  }else if(style<0.8){
    const r=lerp(0.24,0.4,rnd());
    const b=meshOf(new THREE.IcosahedronGeometry(r,1),mat(P.foliage2,{rough:0.98}));
    b.position.y=r*0.9; g.add(b);
    g.add(meshOf(new THREE.CylinderGeometry(0.05,0.05,r,5),mat(P.wood))
      .translateY(r*0.4));
  }else{
    /* Flower bed — a ring of blossom dots around a low planter. */
    const r=lerp(0.3,0.5,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(r,r*0.9,0.16,8),mat(P.cliffDark))
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

function buildBanner(P,rnd,h=1.9){
  const g=new THREE.Group();
  g.add(meshOf(new THREE.CylinderGeometry(0.05,0.05,h,5),mat(P.wood)).translateY(h/2));
  const w=0.5,hh=0.85;
  const cloth=meshOf(new THREE.PlaneGeometry(w,hh,6,4),
    mat(rnd()<0.5?P.roof:P.accent,{side:THREE.DoubleSide,flat:false,rough:0.85}),true,false);
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

/* ------------------------------------------------------ signature per niche */
/* The single most important builder in the file: this is what makes a visitor
   say "oh, that one's the data district" without reading a label. It unlocks at
   L3 — identity should arrive before size does. */
function buildSignature(P,rnd,sp){
  const g=new THREE.Group();
  /* Fixed scale, and every element positioned from its own index alone. Both
     matter for the same reason: the monument is the first thing built and the
     last thing that should ever shift, so growth here can only mean "another
     one appears", never "they all rearrange to make room". */
  const s=1.2, GA=2.399963229728653;
  switch(P.sig){

  case 'obelisk': { // LLMS — glyph stelae and a drift of open books
    const n=clamp(2+Math.floor(sp.level/2),2,7);
    for(let i=0;i<n;i++){
      const a=i*GA+rnd()*0.3, r=lerp(0.9,1.9,rnd())*s;
      const h=lerp(1.4,3.2,rnd())*s;
      const ob=meshOf(boxG(0.28*s,h,0.28*s),mat(P.stone));
      ob.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);
      ob.rotation.y=rnd()*TAU; g.add(ob);
      for(let k=0;k<3;k++){
        const gl=meshOf(boxG(0.31*s,0.05,0.31*s),
          glowMat(P.accent,1.5),false,false);
        gl.position.set(ob.position.x,h*(0.25+k*0.25),ob.position.z);
        gl.rotation.y=ob.rotation.y; g.add(gl);
      }
      const bk=meshOf(boxG(0.3*s,0.06*s,0.22*s),mat(P.bloom),false,false);
      const by=h+0.5;
      bk.userData.tick=t=>{
        const w=t*0.35+i;
        bk.position.set(Math.cos(a)*r+Math.cos(w)*0.5,by+Math.sin(t*1.2+i)*0.15,
          Math.sin(a)*r+Math.sin(w)*0.5);
        bk.rotation.set(0.3,w,Math.sin(t+i)*0.3);
      };
      g.add(bk); animated.push(bk);
    }
    break; }

  case 'roost': { // AGENTS — antenna masts with a live swarm of little drones
    const masts=clamp(2+Math.floor(sp.level/2.5),2,6);
    for(let i=0;i<masts;i++){
      const a=i*GA, r=lerp(0.7,1.6,rnd())*s, h=lerp(1.6,2.8,rnd())*s;
      const m=meshOf(new THREE.CylinderGeometry(0.06,0.11,h,6),mat(P.stone2));
      m.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r); g.add(m);
      const dish=meshOf(new THREE.SphereGeometry(0.26*s,10,6,0,TAU,0,Math.PI/2),
        mat(P.roof,{flat:false}));
      dish.position.set(m.position.x,h,m.position.z);
      dish.rotation.set(-0.6,rnd()*TAU,0); g.add(dish);
      const tip=meshOf(new THREE.SphereGeometry(0.08,6,5),glowMat(P.accent,2),false,false);
      tip.position.set(m.position.x,h+0.12,m.position.z); g.add(tip);
    }
    const swarm=clamp(6+sp.level*2,6,34);
    for(let i=0;i<swarm;i++){
      const d=meshOf(new THREE.TetrahedronGeometry(0.11*s),glowMat(P.accent,1.5),false,false);
      const rr=lerp(0.6,2.4,rnd())*s, hh=lerp(1.0,3.0,rnd())*s;
      const sp1=lerp(0.3,0.9,rnd()), off=rnd()*TAU;
      d.userData.tick=t=>{
        const w=t*sp1+off;
        d.position.set(Math.cos(w)*rr,hh+Math.sin(t*1.6+off)*0.35,Math.sin(w)*rr);
        d.rotation.set(w,w*1.3,0);
      };
      g.add(d); animated.push(d);
    }
    break; }

  case 'conduit': { // AI INFRA — pipe arcs with light pulsing through them
    const arcs=clamp(2+Math.floor(sp.level/2.5),2,6);
    for(let i=0;i<arcs;i++){
      const a=i*GA+0.2, r=lerp(1.0,2.0,rnd())*s, h=lerp(1.2,2.2,rnd())*s;
      const pipe=meshOf(new THREE.TorusGeometry(h*0.6,0.11*s,6,14,Math.PI),
        mat(P.stone2,{metal:0.35,rough:0.5}));
      pipe.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
      pipe.rotation.y=-a; g.add(pipe);
      for(let k=0;k<3;k++){
        const pulse=meshOf(new THREE.SphereGeometry(0.13*s,7,6),glowMat(P.accent,2),false,false);
        pulse.userData.tick=t=>{
          const u=((t*0.45+k/3+i*0.2)%1)*Math.PI;
          const lx=Math.cos(u)*h*0.6, ly=Math.sin(u)*h*0.6;
          pulse.position.set(Math.cos(a)*r+Math.cos(-a+Math.PI/2)*0,ly,Math.sin(a)*r);
          pulse.position.x=Math.cos(a)*r+lx*Math.cos(-a);
          pulse.position.z=Math.sin(a)*r-lx*Math.sin(-a);
        };
        g.add(pulse); animated.push(pulse);
      }
    }
    const core=meshOf(new THREE.CylinderGeometry(0.34*s,0.44*s,0.9*s,8),
      mat(P.stone,{metal:0.3}));
    core.position.y=0.45*s; g.add(core);
    const cg=meshOf(new THREE.CylinderGeometry(0.3*s,0.3*s,0.2,8),glowMat(P.accent,2),false,false);
    cg.position.y=0.95*s;
    matAnim(cg.material,(m,t)=>{ m.emissiveIntensity=1.4+Math.sin(t*3)*0.7; });
    g.add(cg);
    break; }

  case 'orrery': { // ML & DS — nested rings turning around a lit core
    const ped=meshOf(new THREE.CylinderGeometry(0.5*s,0.72*s,0.8*s,8),mat(P.stone));
    ped.position.y=0.4*s; g.add(ped);
    const core=meshOf(new THREE.IcosahedronGeometry(0.34*s,1),glowMat(P.accent,2.2),false,false);
    core.position.y=1.5*s; g.add(core);
    for(let i=0;i<3;i++){
      const R=(0.75+i*0.42)*s;
      const ring=meshOf(new THREE.TorusGeometry(R,0.035*s,6,32),
        mat(P.metal,{metal:0.7,rough:0.28}),false,false);
      ring.position.y=1.5*s;
      const ax=(i+1)*0.6, sp1=0.5-i*0.12;
      ring.userData.tick=t=>{ring.rotation.set(Math.PI/2+Math.sin(t*0.2+i)*ax*0.4,t*sp1,i*0.7);};
      g.add(ring); animated.push(ring);
      const bead=meshOf(new THREE.SphereGeometry(0.1*s,7,6),
        glowMat(i%2?P.accent2:P.bloom,1.8),false,false);
      bead.userData.tick=t=>{
        const w=t*(0.6+i*0.25);
        bead.position.set(Math.cos(w)*R,1.5*s+Math.sin(w)*R*Math.sin(i*1.1)*0.5,Math.sin(w)*R);
      };
      g.add(bead); animated.push(bead);
    }
    break; }

  case 'aqueduct': { // DATA ENG — an arched span with glowing flow on top
    const span=lerp(3,5,rnd())*s, py=lerp(1.4,2.1,rnd())*s;
    const n=Math.max(3,Math.round(span/1.1));
    const rot=rnd()*TAU; g.rotation.y=rot;
    for(let i=0;i<n;i++){
      const x=lerp(-span/2,span/2,i/(n-1));
      const p=meshOf(boxG(0.22*s,py,0.3*s),mat(P.stone));
      p.position.set(x,py/2,0); g.add(p);
      if(i<n-1){
        const arc=meshOf(new THREE.TorusGeometry(span/(n-1)/2,0.08*s,6,12,Math.PI),
          mat(P.stone2));
        arc.position.set(x+span/(n-1)/2,py,0); g.add(arc);
      }
    }
    const ch=meshOf(boxG(span+0.3,0.22*s,0.44*s),mat(P.stone2));
    ch.position.y=py+0.11*s; g.add(ch);
    const flow=meshOf(boxG(span+0.2,0.06,0.3*s),
      mat(P.liquid,{emissive:P.liquid,ei:1.1,rough:0.2,flat:false}),false,false);
    flow.position.y=py+0.2*s; g.add(flow);
    for(let k=0;k<5;k++){
      const d=meshOf(new THREE.SphereGeometry(0.09*s,6,5),glowMat(P.accent,1.7),false,false);
      d.userData.tick=t=>{
        const u=(t*0.35+k/5)%1;
        d.position.set(lerp(-span/2,span/2,u),py+0.26*s,0);
      };
      g.add(d); animated.push(d);
    }
    break; }

  case 'wardring': { // AI SAFETY — a lantern ring under a protective shell
    const n=9, R=lerp(1.3,2.0,rnd())*s;   // fixed: a growing ring re-spaces every post
    for(let i=0;i<n;i++){
      const a=i/n*TAU, h=lerp(1.0,1.5,rnd())*s;
      const post=meshOf(new THREE.CylinderGeometry(0.07,0.1,h,6),mat(P.stone2));
      post.position.set(Math.cos(a)*R,h/2,Math.sin(a)*R); g.add(post);
      const lan=meshOf(new THREE.OctahedronGeometry(0.17*s),glowMat(P.accent,1.9),false,false);
      lan.position.set(Math.cos(a)*R,h+0.16,Math.sin(a)*R);
      lan.userData.tick=t=>{lan.position.y=h+0.16+Math.sin(t*1.2+i)*0.07;
        lan.material.emissiveIntensity=1.5+Math.sin(t*2+i*0.7)*0.5;};
      g.add(lan); animated.push(lan);
    }
    const shell=meshOf(new THREE.SphereGeometry(R*1.05,20,12,0,TAU,0,Math.PI/2),
      mat(P.accent,{emissive:P.accent,ei:0.5,opacity:0.13,flat:false,
        side:THREE.DoubleSide,rough:0.1}),false,false);
    shell.userData.tick=t=>{shell.scale.setScalar(1+Math.sin(t*0.8)*0.03);
      shell.material.opacity=0.10+Math.sin(t*0.8)*0.05;};
    g.add(shell); animated.push(shell);
    const seal=meshOf(new THREE.RingGeometry(R*0.5,R*0.92,32),
      glowMat(P.accent2,0.9),false,false);
    seal.rotation.x=-Math.PI/2; seal.position.y=0.04;
    seal.userData.tick=t=>{seal.rotation.z=t*0.15;};
    g.add(seal); animated.push(seal);
    break; }

  case 'coil': { // PYTHON — a coiling stair that climbs as the reading does
    /* Step i is at a fixed angle and a fixed height, so more reading lays MORE
       STEPS on the same staircase. The old form derived each step from i/steps,
       which meant every step slid whenever another was added. */
    const steps=clamp(Math.round(6+sp.level*2.4),8,36);
    const ANG=0.46, RISE_=0.17, R0=0.62*s, R1=1.5*s;
    for(let i=0;i<steps;i++){
      const a=i*ANG, r=lerp(R0,R1,Math.min(1,i/22));
      const st=meshOf(boxG(0.5*s,0.13,0.28*s),
        mat(i%2?P.stone:P.stone2));
      st.position.set(Math.cos(a)*r,0.1+i*RISE_,Math.sin(a)*r);
      st.rotation.y=-a; g.add(st);
      if(i%5===0){
        const sc=meshOf(new THREE.SphereGeometry(0.08,6,5),
          glowMat(P.accent,1.4),false,false);
        sc.position.set(Math.cos(a)*r*1.12,0.24+i*RISE_,Math.sin(a)*r*1.12); g.add(sc);
      }
    }
    const H=0.1+steps*RISE_;
    const head=meshOf(new THREE.IcosahedronGeometry(0.3*s,0),
      mat(P.roof,{emissive:P.accent,ei:0.4}));
    head.position.y=H+0.25; g.add(head);
    head.userData.tick=t=>{head.rotation.y=t*0.4;head.position.y=H+0.25+Math.sin(t)*0.08;};
    animated.push(head);
    break; }
  }
  return g;
}

/* ------------------------------------------------------------------ water */
/* A disc built as concentric rings rather than a triangle fan (FX.water).
   CircleGeometry is a fan, so every triangle owns the centre vertex — displace
   that and the whole surface hinges around one point, and flat-shade it and you
   get a pinwheel. Rings give the wave something to break into facets against,
   which is the entire look: low-poly water is faceted water. */
function waterDisc(radius,seg,rings){
  const pos=[], p=(r,a)=>[Math.cos(a)*r,0,Math.sin(a)*r];
  for(let ri=0;ri<rings;ri++){
    const r0=radius*ri/rings, r1=radius*(ri+1)/rings;
    for(let s=0;s<seg;s++){
      const a0=s/seg*TAU, a1=(s+1)/seg*TAU;
      const A=p(r0,a0),B=p(r1,a0),C=p(r1,a1),D=p(r0,a1);
      if(ri===0) pos.push(...A,...B,...C);          // centre: no inner edge
      else pos.push(...A,...B,...C, ...A,...C,...D);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals(); return g;
}
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
     past the rim at the wide ones. See shipLife. */
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
  const seg=22;
  const geo=FX.water?waterDisc(radius,seg,3)
                    :(()=>{ const c=new THREE.CircleGeometry(radius,seg);
                            c.rotateX(-Math.PI/2); return c; })();
  if(FX.vc) bakeVC(geo);
  const water=new THREE.Mesh(geo,mat(P.liquid,{opacity:0.86,rough:0.14,metal:0.1,
    flat:!!FX.water,emissive:P.liquid,ei:P.liquidGlow??0.16}));
  water.position.y=y+0.06;
  const base=geo.attributes.position.array.slice();
  const amp=FX.water?0.11:0.1;
  water.userData.tick=t=>{
    const p=water.geometry.attributes.position;
    for(let i=0;i<p.count;i++)
      p.setY(i,waveY(base[i*3],base[i*3+2],t,amp));
    p.needsUpdate=true;
  };
  g.add(water); animated.push(water);
  /* The foam line. Water meeting land is the one place everybody knows what it
     should look like, and a hard edge between two flat colours is the one thing
     it never looks like. Same argument as contact occlusion, at the shore. */
  if(FX.water){
    const fg=new THREE.RingGeometry(radius*0.88,radius*1.04,seg);
    fg.rotateX(-Math.PI/2);
    const fm=new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,
      opacity:0.34,depthWrite:false});
    const foam=new THREE.Mesh(fg,fm);
    foam.position.y=y+0.085; foam.renderOrder=2;
    foam.userData.tick=t=>{
      const k=1+Math.sin(t*1.6)*0.014;
      foam.scale.set(k,1,k);
      fm.opacity=0.30+Math.sin(t*1.6)*0.11;
    };
    g.add(foam); animated.push(foam);
  }
  /* Stone kerb, sunk slightly so the water edge never shows a seam. */
  const rim=meshOf(new THREE.TorusGeometry(radius*1.0,0.13,6,28),mat(P.stone2));
  rim.rotation.x=Math.PI/2; rim.position.y=y+0.06; g.add(rim);
  for(let i=0;i<5;i++){
    const l=meshOf(new THREE.SphereGeometry(0.13,7,6),glowMat(P.bloom,1.2),false,false);
    const a=i/5*TAU, rr=radius*0.62;
    l.userData.tick=t=>{
      const w=a+t*0.12;
      l.position.set(Math.cos(w)*rr,y+0.14+Math.sin(t*1.4+i)*0.03,Math.sin(w)*rr);
    };
    g.add(l); animated.push(l);
  }
  return g;
}

function buildFalls(P,drop){
  const g=new THREE.Group();
  const w=0.9;
  /* Two crossed sheets: a single plane vanished to a line every time the camera
     swung round to face it edge-on, which on a freely-rotating iso view is a
     quarter of all headings. */
  const sheetMat=mat(P.liquid,{opacity:0.42,flat:false,rough:0.1,
    emissive:P.liquid,ei:P.liquidGlow??0.3,side:THREE.DoubleSide});
  for(const rot of [0,Math.PI/2]){
    const sheet=meshOf(new THREE.PlaneGeometry(w,drop),sheetMat,false,false);
    sheet.position.y=-drop/2; sheet.rotation.y=rot; g.add(sheet);
  }
  /* The plume widens and dissolves on the way down instead of running to a
     hard stop — a hard-ended ribbon reads as a laser, not water. */
  for(let i=0;i<4;i++){
    const u=(i+1)/4;
    const puff=meshOf(new THREE.IcosahedronGeometry(0.3+u*0.55,0),
      mat(0xFFFFFF,{opacity:0.22*(1-u*0.7),flat:false}),false,false);
    puff.position.y=-drop*u; puff.scale.y=0.7; g.add(puff);
  }
  /* Streaks: cheap, and they carry the eye downward better than any shader
     trick at this scale. */
  for(let i=0;i<7;i++){
    const st=meshOf(boxG(0.07,0.5,0.03),
      glowMat(0xFFFFFF,0.7),false,false);
    st.material.transparent=true; st.material.opacity=0.75;
    const off=i/7, xo=(i/7-0.5)*w*0.8;
    st.userData.tick=t=>{
      const u=(t*0.55+off)%1;
      st.position.set(xo,-u*drop,0.02);
      st.scale.y=0.6+u*1.4;
      st.material.opacity=0.75*(1-u*0.8);
    };
    g.add(st); animated.push(st);
  }
  for(let i=0;i<4;i++){
    const m=meshOf(new THREE.IcosahedronGeometry(0.3,0),
      mat(0xFFFFFF,{opacity:0.3,flat:false}),false,false);
    m.userData.tick=t=>{
      const u=(t*0.3+i/4)%1;
      m.position.set((Math.sin(t+i)*0.2),-drop*(0.55+u*0.45),0);
      m.scale.setScalar(0.6+u*1.5); m.material.opacity=0.3*(1-u);
    };
    g.add(m); animated.push(m);
  }
  return g;
}

/* ------------------------------------------- building off the rim, and life */
/* A cylinder from a to b — struts, sky-bridge posts, hanging vines. */
function beam(a,b,r,material,cast=true){
  const dir=new THREE.Vector3().subVectors(b,a), len=dir.length();
  const m=meshOf(new THREE.CylinderGeometry(r,r,len,6),material,cast,false);
  m.position.copy(a).addScaledVector(dir,0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  return m;
}

/* Cantilever deck: the district has run out of ground, so it braces a platform
   out past its own cliff. Local +x points away from the island. */
function buildCantilever(P,rnd,sp,anchor){
  const g=new THREE.Group();
  const w=lerp(2.0,3.2,rnd()), d=lerp(1.5,2.4,rnd());
  g.add(meshOf(boxG(w,0.3,d),mat(P.stone2)));
  g.add(meshOf(boxG(w-0.34,0.12,d-0.34),mat(P.ground2,{rough:0.98}))
    .translateY(0.2));
  /* Struts land on the CLIFF FACE — the vertical wall of the base terrace, at
     local x = -anchor.back — not out in the air below it. Aiming them at a
     fixed depth left them stopping short of the keel, which tapers inward fast,
     and the deck read as floating next to the island rather than braced on it. */
  const strutMat=mat(P.wood,{rough:0.9});
  for(const s of [-1,1]){
    g.add(beam(new THREE.Vector3(w*0.3,-0.15,s*d*0.32),
               new THREE.Vector3(-anchor.back,-anchor.drop,s*d*0.2),0.09,strutMat));
  }
  g.add(beam(new THREE.Vector3(0,-0.15,0),
             new THREE.Vector3(-anchor.back,-anchor.drop*0.55,0),0.11,strutMat));
  /* Railing on the three outward sides — the island side stays open. */
  const railMat=mat(P.stone,{rough:0.9});
  const posts=[];
  for(let i=0;i<=4;i++) posts.push([w/2-0.1, -d/2+0.1+i*(d-0.2)/4]);
  for(let i=1;i<4;i++) posts.push([w/2-0.1-i*(w*0.45)/4, -d/2+0.1],[w/2-0.1-i*(w*0.45)/4, d/2-0.1]);
  for(const [px,pz] of posts){
    const p=meshOf(new THREE.CylinderGeometry(0.05,0.05,0.42,5),railMat);
    p.position.set(px,0.36,pz); g.add(p);
  }
  const pick=rnd();
  if(pick<0.4){
    /* Pavilion — four posts and a cone roof. Reads at silhouette scale. */
    const ph=lerp(1.0,1.4,rnd()), pr=Math.min(w,d)*0.42;
    for(let i=0;i<4;i++){
      const a=i/4*TAU+Math.PI/4;
      const p=meshOf(new THREE.CylinderGeometry(0.07,0.07,ph,6),mat(P.wood));
      p.position.set(Math.cos(a)*pr,0.2+ph/2,Math.sin(a)*pr); g.add(p);
    }
    const roof=meshOf(new THREE.ConeGeometry(pr*1.6,0.7,6),mat(P.roof,{rough:0.75}));
    roof.position.y=0.2+ph+0.35; g.add(roof);
    const fin=meshOf(new THREE.OctahedronGeometry(0.12),glowMat(P.accent,1.6),false,false);
    fin.position.y=0.2+ph+0.78;
    fin.userData.tick=t=>{fin.rotation.y=t*0.5;}; g.add(fin); animated.push(fin);
  }else if(pick<0.72){
    const c=buildCottage(P,rnd,0.78); c.position.set(-w*0.1,0.26,0);
    c.rotation.y=rnd()*0.5-0.25; g.add(c);
  }else{
    for(let i=0;i<3;i++){
      const h=buildHedge(P,rnd);
      h.position.set(lerp(-w*0.3,w*0.3,rnd()),0.26,lerp(-d*0.3,d*0.3,rnd())); g.add(h);
    }
  }
  const l=buildLamp(P,rnd); l.position.set(w*0.32,0.26,d*0.32); l.scale.setScalar(0.8);
  g.add(l);
  return g;
}

/* Sky bridge between two towers. The other half of what the islets used to do:
   it puts something in the air, above the roofline, that the eye can read as
   structure rather than as terrain. */
function buildSkyBridge(P,a,b){
  const g=new THREE.Group();
  const flat=new THREE.Vector3(b.x-a.x,0,b.z-a.z), span=flat.length();
  const rise=clamp(span*0.12,0.4,1.4), n=Math.max(6,Math.round(span/0.7));
  const deck=mat(P.stone2,{rough:0.9});
  const yaw=-Math.atan2(b.z-a.z,b.x-a.x);
  for(let i=0;i<n;i++){
    const u=(i+0.5)/n;
    const p=new THREE.Vector3().lerpVectors(a,b,u);
    p.y+=Math.sin(u*Math.PI)*rise;
    const seg=meshOf(boxG(span/n*1.12,0.13,0.62),deck);
    seg.position.copy(p); seg.rotation.y=yaw; g.add(seg);
    if(i%3===1){
      for(const s of [-1,1]){
        const post=meshOf(new THREE.CylinderGeometry(0.04,0.04,0.36,5),deck);
        post.position.set(p.x+Math.sin(-yaw)*s*0.28,p.y+0.24,p.z+Math.cos(-yaw)*s*0.28);
        g.add(post);
      }
    }
  }
  /* A light walking the span — the bridge is in use, not a ruin. */
  for(let k=0;k<2;k++){
    const l=meshOf(new THREE.SphereGeometry(0.1,7,6),glowMat(P.accent,1.7),false,false);
    l.userData.tick=t=>{
      const u=(t*0.16+k*0.5)%1;
      l.position.lerpVectors(a,b,u); l.position.y+=Math.sin(u*Math.PI)*rise+0.28;
    };
    g.add(l); animated.push(l);
  }
  return g;
}

/* Undercroft: lanterns and hanging gardens slung under a terrace lip. Growth
   going DOWN, which the terraces alone can never show.

   Hung from the TERRACE boundaries rather than from the coast, because the
   boundaries are at fixed radii and the coast is not — a coast-hung garden
   would have to jump outward every time the island grew, which is exactly the
   teleporting this pass is getting rid of. */
function buildUndercroft(P,rnd,prof,edgeR,y){
  const g=new THREE.Group();
  const n=Math.max(5,Math.round(edgeR*1.3));
  for(let i=0;i<n;i++){
    const a=(i/n)*TAU+rnd()*0.25;
    /* Hung just OUTSIDE the lip so they show against the cliff face — tucked
       inside it they sit under the terrace above and are never seen. */
    const r=radiusAt(prof,a)*edgeR*lerp(1.0,1.07,rnd());
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    /* Short drops, visible cords. Long thin ones read as lollipops hanging in
       space — the eye loses the cord and the pod stops looking attached to
       anything, which is the opposite of the point. */
    const drop=lerp(0.3,0.78,rnd());   // must clear the terrace below
    g.add(beam(new THREE.Vector3(x,y,z),new THREE.Vector3(x,y-drop,z),0.05,
      mat(P.wood,{rough:1}),false));
    if(rnd()<0.5){
      const lan=meshOf(new THREE.OctahedronGeometry(0.15),glowMat(P.accent,1.6),false,false);
      lan.position.set(x,y-drop-0.12,z);
      const ph=rnd()*TAU;
      lan.userData.tick=t=>{
        lan.position.y=y-drop-0.12+Math.sin(t*0.9+ph)*0.06;
        lan.material.emissiveIntensity=1.3+Math.sin(t*1.6+ph)*0.4;
      };
      g.add(lan); animated.push(lan);
    }else{
      /* A planter box with the greenery spilling over it, rather than a bare
         sphere on a string — the box is what says "someone built this". */
      const pr=lerp(0.42,0.72,rnd());
      const box=meshOf(new THREE.CylinderGeometry(pr,pr*0.82,0.28,7),
        mat(P.wood,{rough:0.95}));
      box.position.set(x,y-drop-0.14,z); g.add(box);
      for(let k=0;k<3;k++){
        const leaf=meshOf(new THREE.IcosahedronGeometry(pr*lerp(0.55,0.85,rnd()),0),
          mat(rnd()<0.5?P.foliage:P.foliage2,{rough:0.98}));
        leaf.position.set(x+(rnd()-0.5)*pr,y-drop+0.02,z+(rnd()-0.5)*pr);
        leaf.scale.y=0.62; g.add(leaf);
      }
      for(let k=0;k<2;k++){
        const f=meshOf(new THREE.IcosahedronGeometry(0.08,0),
          mat(P.bloom,{emissive:P.bloom,ei:0.3}),false,false);
        f.position.set(x+(rnd()-0.5)*pr*1.4,y-drop+0.14,z+(rnd()-0.5)*pr*1.4); g.add(f);
      }
    }
  }
  return g;
}

function buildWisps(P,n,radius){
  const g=new THREE.Group();
  const rnd=rngOf(hash2(P.seed,777));
  for(let i=0;i<n;i++){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,
      color:rnd()<0.5?P.accent:P.bloom,transparent:true,opacity:0.3,
      depthWrite:false,blending:THREE.AdditiveBlending}));
    const sc=lerp(0.2,0.42,rnd()); s.scale.setScalar(sc);
    /* Ellipse, not a Lissajous, and never tighter than 0.45R. The mismatched
       frequencies used to walk every wisp through the middle of the district;
       thirty additive sprites taking turns over one spot is a searchlight. */
    const r1=lerp(0.45,1.05,rnd())*radius, r2=lerp(0.45,1.05,rnd())*radius;
    const y0=lerp(0.9,4.5,rnd()), sp1=lerp(0.12,0.4,rnd()), off=rnd()*TAU;
    const wob=lerp(0.3,1.1,rnd()), dir=rnd()<0.5?1:-1;
    s.userData.tick=t=>{
      const w=t*sp1*dir+off;
      s.position.set(Math.cos(w)*r1,y0+Math.sin(t*0.7+off)*wob,Math.sin(w)*r2);
      s.material.opacity=0.2+Math.sin(t*1.7+off)*0.12;
    };
    g.add(s); animated.push(s);
  }
  return g;
}

function buildBirds(P,n,radius){
  const g=new THREE.Group();
  const rnd=rngOf(hash2(P.seed,888));
  const bodyMat=mat(0xFFFFFF,{rough:0.7});
  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const wl=meshOf(boxG(0.34,0.03,0.11),bodyMat,false,false);
    const wr=wl.clone();
    wl.position.x=-0.17; wr.position.x=0.17;
    b.add(wl,wr);
    b.add(meshOf(boxG(0.1,0.06,0.2),bodyMat,false,false));
    const R=lerp(0.7,1.35,rnd())*radius, y=lerp(2.5,7,rnd());
    const sp1=lerp(0.1,0.25,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU;
    const flap=lerp(4,7,rnd());
    b.userData.tick=t=>{
      const w=t*sp1+off;
      b.position.set(Math.cos(w)*R,y+Math.sin(t*0.5+off)*0.5,Math.sin(w)*R);
      b.rotation.y=-w+Math.PI/2;
      const f=Math.sin(t*flap+off)*0.5;
      wl.rotation.z=f; wr.rotation.z=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* The Arcane Swarm's crown: nested rings turning around a lit core. */
function buildOrrery(P){
  const g=new THREE.Group();
  const core=meshOf(new THREE.IcosahedronGeometry(0.5,1),glowMat(P.accent,2.2),false,false);
  g.add(core);
  for(let i=0;i<4;i++){
    const RR=1.1+i*0.5;
    const ring=meshOf(new THREE.TorusGeometry(RR,0.05,6,40),
      mat(P.metal,{metal:0.75,rough:0.25,env:1.1}),false,false);
    /* Tilt clamped short of edge-on: a ring that flattens to a line stops
       reading as a ring and the orrery turns into scribbles. */
    const sp1=0.16-i*0.03, tilt=i*0.32;
    ring.userData.tick=t=>{ring.rotation.set(Math.PI/2+Math.sin(t*0.15+i)*0.28,t*sp1,tilt);};
    g.add(ring); animated.push(ring);
    const b=meshOf(new THREE.SphereGeometry(0.16,8,7),
      glowMat(i%2?P.accent2:P.bloom,1.8),false,false);
    b.userData.tick=t=>{const w=t*(0.3+i*0.1)+i;
      b.position.set(Math.cos(w)*RR,Math.sin(w*0.7+i)*RR*0.4,Math.sin(w)*RR);};
    g.add(b); animated.push(b);
  }
  g.userData.tick=t=>{g.rotation.y=t*0.06;}; animated.push(g);
  return g;
}

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

/* ============================================================== realm kits */
/* Everything above this line is the Arcane Swarm's vocabulary. What follows is
   the same set of jobs — house, tower, hall, gate, plant, feature, deck,
   bridge, liquid, crown, life — answered in five other architectural languages.

   The realms have to be un-confusable at silhouette scale, so the differences
   are structural, not chromatic: a gabled timber cabin under a leaf canopy, a
   brick furnace with a smoke plume, a corrugated shed beside stacked
   containers, a battlemented barbican, a narrow shuttered townhouse. Recolour
   any one of them and you still know which realm you are standing in — which
   is principle 6 (never encode identity by colour alone) taken seriously. */

/* ---------------------------------------------------------- shared pieces */
/* Small parts that every realm needs and none of them needs to disagree about.
   `style` keeps one implementation honest across six vocabularies. */
function postLamp(P,rnd,style){
  const g=new THREE.Group(), h=lerp(0.9,1.4,rnd());
  const postMat=style==='iron'?mat(P.metal,{metal:0.5,rough:0.5})
              : style==='timber'?mat(P.wood,{rough:0.95})
              : mat(P.cliffDark,{rough:0.9});
  g.add(meshOf(new THREE.CylinderGeometry(0.05,0.075,h,6),postMat).translateY(h/2));
  if(style==='iron'||style==='stone'){           // a little cross-arm
    const arm=meshOf(boxG(0.3,0.05,0.05),postMat);
    arm.position.set(0.12,h-0.05,0); g.add(arm);
  }
  const shade=style==='timber'
    ? meshOf(new THREE.ConeGeometry(0.19,0.2,6),mat(P.roof,{rough:0.8}))
    : meshOf(new THREE.ConeGeometry(0.17,0.18,4),mat(P.metal,{metal:0.4,rough:0.5}));
  shade.position.set(style==='iron'?0.24:0,h+0.16,0); g.add(shade);
  const orb=meshOf(new THREE.IcosahedronGeometry(0.12,1),glowMat(P.bloom,2.0),false,false);
  orb.position.set(style==='iron'?0.24:0,h+0.02,0); g.add(orb);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.accent,
    transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.scale.setScalar(0.6); s.position.copy(orb.position); g.add(s);
  const ph=rnd()*TAU;
  matAnim(s.material,(m,t)=>{ m.opacity=0.18+Math.sin(t*2+ph)*0.06; });
  matAnim(orb.material,(m,t)=>{ m.emissiveIntensity=1.8+Math.sin(t*1.8+ph)*0.4; });
  return g;
}

/* Plants. Realms disagree about what grows, and that disagreement is doing a
   lot of the "which realm is this" work all by itself. */
function realmPlant(P,rnd,kind){
  const g=new THREE.Group();
  if(kind==='conifer'){                                   // bastion — dark, upright
    const h=lerp(1.2,2.4,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.06,0.1,h*0.45,5),mat(P.wood)).translateY(h*0.22));
    for(let i=0;i<3;i++){
      const r=lerp(0.42,0.6,rnd())*(1-i*0.24);
      const c=meshOf(new THREE.ConeGeometry(r,h*0.42,6),
        mat(i%2?P.foliage:P.foliage2,{rough:0.98}));
      c.position.y=h*0.4+i*h*0.24; g.add(c);
    }
  }else if(kind==='broadleaf'){                           // frame — wide, layered
    const h=lerp(1.0,2.0,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.09,0.15,h,6),mat(P.wood)).translateY(h/2));
    for(let i=0;i<3;i++){
      const r=lerp(0.6,0.95,rnd())*(1-i*0.16);
      const b=meshOf(new THREE.IcosahedronGeometry(r,0),
        mat(i%2?P.foliage:P.foliage2,{rough:0.98}));
      b.position.set((rnd()-0.5)*0.4,h+i*0.34,(rnd()-0.5)*0.4);
      b.scale.y=0.66; b.rotation.set(rnd()*3,rnd()*3,rnd()*3); g.add(b);
    }
    for(let i=0;i<3;i++){
      const f=meshOf(new THREE.IcosahedronGeometry(0.08,0),glowMat(P.bloom,0.9),false,false);
      f.position.set((rnd()-0.5)*1.2,h+rnd()*0.7,(rnd()-0.5)*1.2); g.add(f);
    }
  }else if(kind==='charred'){                             // forge — nothing grows here
    const h=lerp(0.5,1.1,rnd());
    const s=meshOf(new THREE.CylinderGeometry(0.07,0.13,h,5),mat(P.rock,{rough:1}));
    s.rotation.z=(rnd()-0.5)*0.4; s.position.y=h/2; g.add(s);
    for(let i=0;i<2;i++){
      const b=meshOf(new THREE.CylinderGeometry(0.03,0.05,h*0.4,4),mat(P.rock,{rough:1}));
      b.position.set((rnd()-0.5)*0.3,h*0.8,(rnd()-0.5)*0.3);
      b.rotation.set((rnd()-0.5)*1.2,0,(rnd()-0.5)*1.2); g.add(b);
    }
    const e=meshOf(new THREE.IcosahedronGeometry(0.07,0),glowMat(P.accent,1.6),false,false);
    e.position.set(0,0.06,0); g.add(e);
  }else if(kind==='harbour'){       // ship — a wind-bent shrub in a planter
    /* Was a pole with a yard-arm across it, which at iso scale read as a
       crucifix planted forty times over a harbour town. Greenery instead: it
       carries the same "something grows here" job and gives the pale sand and
       the white sheds a third value to sit between. */
    const box=meshOf(boxG(0.56,0.3,0.56),mat(P.wood,{rough:0.95}));
    box.position.y=0.15; g.add(box);
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const corner=meshOf(boxG(0.08,0.34,0.08),
        mat(P.stone2,{rough:0.9}),false,false);
      corner.position.set(sx*0.26,0.17,sz*0.26); g.add(corner);
    }
    const lean=(rnd()-0.5)*0.5;                 // everything here leans downwind
    const h=lerp(0.7,1.2,rnd());
    const tr=meshOf(new THREE.CylinderGeometry(0.05,0.08,h,5),mat(P.wood));
    tr.position.set(Math.sin(lean)*h*0.3,0.3+h/2,0); tr.rotation.z=-lean; g.add(tr);
    for(let i=0;i<3;i++){
      const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.24,0.4,rnd()),0),
        mat(i%2?P.foliage:P.foliage2,{rough:0.98}));
      b.position.set(Math.sin(lean)*h*0.7+(rnd()-0.5)*0.3,0.3+h+i*0.16,(rnd()-0.5)*0.3);
      b.scale.y=0.6; g.add(b);
    }
  }else{                                                  // quarter — clipped street tree
    const h=lerp(1.0,1.7,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.07,0.1,h,6),mat(P.wood)).translateY(h/2));
    const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.5,0.7,rnd()),1),
      mat(rnd()<0.5?P.foliage:P.foliage2,{rough:0.98}));
    b.position.y=h+0.32; b.scale.y=0.82; g.add(b);
    const box=meshOf(new THREE.CylinderGeometry(0.3,0.26,0.22,8),mat(P.stone2));
    box.position.y=0.11; g.add(box);
  }
  const sway=rnd()*TAU;
  g.userData.tick=t=>{g.rotation.z=Math.sin(t*0.8+sway)*0.03;};
  animated.push(g);
  return g;
}

/* The scatter "feature" — the arcane realm's crystal cluster, retold. */
function realmFeature(P,rnd,kind){
  const g=new THREE.Group();
  if(kind==='mushroom'){                                  // frame
    const n=2+Math.floor(rnd()*4);
    for(let i=0;i<n;i++){
      const h=lerp(0.2,0.5,rnd()), r=lerp(0.14,0.28,rnd());
      const st=meshOf(new THREE.CylinderGeometry(r*0.3,r*0.36,h,6),mat(P.stone));
      st.position.set((rnd()-0.5)*0.5,h/2,(rnd()-0.5)*0.5); g.add(st);
      const cap=meshOf(new THREE.SphereGeometry(r,8,5,0,TAU,0,Math.PI/2),
        mat(P.accent,{emissive:P.accent,ei:0.45,rough:0.6,flat:false}));
      cap.position.set(st.position.x,h,st.position.z); cap.scale.y=0.7; g.add(cap);
    }
  }else if(kind==='ore'){                                 // forge — a molten seep
    const pool=meshOf(new THREE.CircleGeometry(lerp(0.35,0.6,rnd()),10),
      mat(P.liquid,{emissive:P.liquid,ei:1.4,rough:0.3,flat:false}),false,false);
    pool.rotation.x=-Math.PI/2; pool.position.y=0.03; g.add(pool);
    for(let i=0;i<3;i++){
      const r=meshOf(new THREE.DodecahedronGeometry(lerp(0.14,0.26,rnd()),0),
        mat(P.rock,{rough:1}));
      const a=rnd()*TAU; r.position.set(Math.cos(a)*0.5,0.1,Math.sin(a)*0.5);
      r.rotation.set(rnd()*3,rnd()*3,rnd()*3); g.add(r);
    }
    const ph=rnd()*TAU;
    matAnim(pool.material,(m,t)=>{ m.emissiveIntensity=1.1+Math.sin(t*1.4+ph)*0.45; });
  }else if(kind==='crate'){                               // ship — a container stack
    const n=1+Math.floor(rnd()*3);
    const cols=[P.accent,P.accent2,P.roof2,P.bloom];
    for(let i=0;i<n;i++){
      const w=lerp(0.5,0.8,rnd());
      const b=meshOf(boxG(w,0.34,w*0.6),
        mat(cols[Math.floor(rnd()*cols.length)],{rough:0.8}));
      b.position.set((rnd()-0.5)*0.16,0.17+i*0.36,(rnd()-0.5)*0.16);
      b.rotation.y=(rnd()-0.5)*0.3; g.add(b);
    }
  }else if(kind==='brazier'){                             // bastion — a watch-fire
    const h=lerp(0.5,0.8,rnd());
    g.add(meshOf(new THREE.CylinderGeometry(0.1,0.16,h,6),mat(P.metal,{metal:0.5,rough:0.5}))
      .translateY(h/2));
    const bowl=meshOf(new THREE.CylinderGeometry(0.26,0.14,0.2,8),
      mat(P.metal,{metal:0.5,rough:0.5}));
    bowl.position.y=h+0.1; g.add(bowl);
    for(let i=0;i<3;i++){
      const f=meshOf(new THREE.ConeGeometry(0.13,0.34,5),glowMat(P.accent,2.0),false,false);
      f.position.y=h+0.3; const ph=rnd()*TAU;
      f.userData.tick=t=>{
        f.scale.set(1+Math.sin(t*5+ph)*0.2,1+Math.sin(t*6+ph)*0.28,1);
        f.position.y=h+0.3+Math.sin(t*4+ph)*0.04;
      };
      g.add(f); animated.push(f);
    }
  }else if(kind==='stall'){                               // quarter — a market stall
    const w=lerp(0.7,1.0,rnd()), d=w*0.7;
    g.add(meshOf(boxG(w,0.4,d),mat(P.wood,{rough:0.95})).translateY(0.2));
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const p=meshOf(new THREE.CylinderGeometry(0.03,0.03,0.75,4),mat(P.wood));
      p.position.set(sx*w*0.45,0.38,sz*d*0.45); g.add(p);
    }
    /* Striped awning — two colours, and the stripe is what says "market". */
    for(let i=0;i<5;i++){
      const st=meshOf(boxG(w*1.15/5,0.05,d*1.25),
        mat(i%2?P.accent:P.stone,{rough:0.85}));
      st.position.set(lerp(-w*0.5,w*0.5,i/4),0.78,0); g.add(st);
    }
    for(let i=0;i<3;i++){
      const it=meshOf(new THREE.IcosahedronGeometry(0.09,0),glowMat(P.bloom,0.8),false,false);
      it.position.set((rnd()-0.5)*w*0.7,0.46,(rnd()-0.5)*d*0.6); g.add(it);
    }
  }else{                                                  // swarm — crystal cluster
    return buildCrystal(P,rnd);
  }
  return g;
}

/* Ground dressing between the buildings. */
function realmGarden(P,rnd,kind){
  const g=new THREE.Group(), r=rnd();
  if(kind==='scrap'){                                     // forge
    if(r<0.5){
      for(let i=0;i<4;i++){
        const b=meshOf(boxG(lerp(0.14,0.3,rnd()),0.12,lerp(0.14,0.3,rnd())),
          mat(P.metal,{metal:0.4,rough:0.7}));
        b.position.set((rnd()-0.5)*0.5,0.06+i*0.1,(rnd()-0.5)*0.5);
        b.rotation.y=rnd()*TAU; g.add(b);
      }
    }else{
      const a=meshOf(boxG(0.46,0.14,0.2),mat(P.metal,{metal:0.5,rough:0.55}));
      a.position.y=0.31; g.add(a);
      g.add(meshOf(new THREE.CylinderGeometry(0.1,0.14,0.24,6),mat(P.wood)).translateY(0.12));
      a.rotation.y=rnd()*TAU;
    }
  }else if(kind==='dock'){                                // ship
    if(r<0.45){
      for(let i=0;i<3;i++){
        const b=meshOf(new THREE.CylinderGeometry(0.16,0.18,0.22,10),mat(P.wood,{rough:0.9}));
        b.position.set((rnd()-0.5)*0.4,0.11+i*0.23,(rnd()-0.5)*0.4); g.add(b);
      }
    }else if(r<0.8){
      const bol=meshOf(new THREE.CylinderGeometry(0.1,0.13,0.34,8),
        mat(P.metal,{metal:0.5,rough:0.6}));
      bol.position.y=0.17; g.add(bol);
      const cap=meshOf(new THREE.SphereGeometry(0.11,8,6),mat(P.metal,{metal:0.5,rough:0.6}));
      cap.position.y=0.36; g.add(cap);
    }else{
      const n=meshOf(new THREE.TorusGeometry(0.22,0.06,5,12),mat(P.wood,{rough:0.95}));
      n.rotation.x=-Math.PI/2; n.position.y=0.06; g.add(n);
    }
  }else if(kind==='muster'){                               // bastion
    if(r<0.5){
      for(let i=0;i<3;i++){
        const s=meshOf(new THREE.CylinderGeometry(0.02,0.02,0.9,4),mat(P.wood));
        s.position.set((i-1)*0.1,0.45,0); s.rotation.z=(i-1)*0.12; g.add(s);
        const tip=meshOf(new THREE.ConeGeometry(0.05,0.16,4),mat(P.metal,{metal:0.6,rough:0.4}));
        tip.position.set((i-1)*0.1-((i-1)*0.06),0.96,0); g.add(tip);
      }
    }else{
      const sh=meshOf(new THREE.CylinderGeometry(0.24,0.24,0.06,7),mat(P.roof2,{rough:0.8}));
      sh.rotation.set(Math.PI/2,0,rnd()*TAU); sh.position.set(0,0.3,0); g.add(sh);
      const boss=meshOf(new THREE.SphereGeometry(0.07,7,6),mat(P.metal,{metal:0.6,rough:0.4}));
      boss.position.set(0,0.3,0.05); g.add(boss);
      g.add(meshOf(new THREE.CylinderGeometry(0.03,0.03,0.34,4),mat(P.wood)).translateY(0.17));
    }
  }else{                                                   // swarm / frame / quarter
    return buildHedge(P,rnd);
  }
  return g;
}

/* ------------------------------------------------------- THE FRAMEWORKS ---
   A living canopy. Timber, thatch and leaf; nothing is cut square. */
/* A gable roof as two slanted panels meeting at a ridge. Built from explicit
   angles because the 3-sided-cylinder trick needed two composed Euler rotations
   and came out as a tent as often as a roof. */
function gableRoof(w,d,rise,m,ridge){
  const g=new THREE.Group();
  const slope=Math.hypot(d/2,rise), ang=Math.atan2(rise,d/2);
  for(const s of [-1,1]){
    const pan=meshOf(boxG(w,0.1,slope),m);
    pan.rotation.x=s*ang; pan.position.set(0,rise/2,s*d/4);
    g.add(pan);
  }
  if(ridge){
    const r=meshOf(boxG(w*1.02,0.09,0.12),ridge,false,false);
    r.position.y=rise; g.add(r);
  }
  return g;
}

function frameHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(0.9,1.3,rnd())*scale, h=lerp(0.8,1.15,rnd())*scale;
  g.add(meshOf(boxG(w,h,d),mat(P.stone,{rough:0.92})).translateY(h/2));
  /* Timber framing on the long faces — the single detail that reads "built of
     wood" at any distance. */
  const bm=mat(P.wood,{rough:0.95});
  for(const s of [1,-1]){
    const post=meshOf(boxG(0.09,h,0.06),bm,false,false);
    post.position.set(s*w*0.42,h/2,d/2+0.01); g.add(post);
    const post2=post.clone(); post2.position.z=-d/2-0.01; g.add(post2);
    const br=meshOf(boxG(0.07,h*1.1,0.05),bm,false,false);
    br.position.set(0,h/2,s*d/2+s*0.01); br.rotation.z=0.5*s; g.add(br);
  }
  const rail=meshOf(boxG(w,0.08,0.06),bm,false,false);
  rail.position.set(0,h*0.6,d/2+0.01); g.add(rail);
  /* Gabled thatch: a prism, not a cone. Gables are the frame realm's signature
     roofline and the clearest break from the arcane cones. */
  const rh=lerp(0.45,0.7,rnd())*scale;
  const roof=gableRoof(w*1.16,d*1.2,rh,mat(rnd()<0.6?P.roof:P.roof2,{rough:0.95}),
    mat(P.wood,{rough:0.95}));
  roof.position.y=h; g.add(roof);
  const wm=glowMat(P.bloom,0.85);
  for(let i=0;i<2+Math.floor(rnd()*2);i++){
    const win=meshOf(new THREE.CylinderGeometry(0.11*scale,0.11*scale,0.05,8),wm,false,false);
    win.rotation.x=Math.PI/2;
    const side=rnd()<0.5?1:-1;
    win.position.set((rnd()-0.5)*w*0.5,h*0.55,side*(d/2+0.02)); g.add(win);
  }
  if(rnd()<0.5){                       // a little deck on stilts
    const dk=meshOf(boxG(w*0.7,0.08,0.5),mat(P.wood,{rough:0.95}));
    dk.position.set(0,h*0.28,d*0.68); g.add(dk);
    for(const s of [-1,1]){
      const st=meshOf(new THREE.CylinderGeometry(0.04,0.04,h*0.28,4),bm);
      st.position.set(s*w*0.28,h*0.14,d*0.85); g.add(st);
    }
  }
  return g;
}
function frameTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* A living trunk with a spiral of platforms — the tower IS a tree. */
  const trunk=meshOf(new THREE.CylinderGeometry(0.3,0.62,h,8),mat(P.wood,{rough:0.96}));
  trunk.position.y=h/2; g.add(trunk);
  for(let i=0;i<4;i++){                 // root buttresses
    const a=i/4*TAU+0.4;
    const r=meshOf(new THREE.ConeGeometry(0.2,h*0.3,5),mat(P.wood,{rough:0.96}));
    r.position.set(Math.cos(a)*0.5,h*0.14,Math.sin(a)*0.5);
    r.rotation.set(Math.cos(a)*0.3,0,-Math.sin(a)*0.3); g.add(r);
  }
  const rings=Math.max(2,Math.round(h/2.2));
  for(let i=0;i<rings;i++){
    const y=h*(0.32+i*0.62/rings), rr=lerp(0.95,0.65,i/rings);
    const plat=meshOf(new THREE.CylinderGeometry(rr,rr,0.12,10),mat(P.stone,{rough:0.9}));
    plat.position.y=y; g.add(plat);
    const rail=meshOf(new THREE.TorusGeometry(rr,0.035,5,14),mat(P.wood));
    rail.rotation.x=Math.PI/2; rail.position.y=y+0.2; g.add(rail);
    const hut=meshOf(boxG(0.5,0.42,0.44),mat(P.stone2,{rough:0.92}));
    const a=i*2.4; hut.position.set(Math.cos(a)*rr*0.45,y+0.27,Math.sin(a)*rr*0.45);
    hut.rotation.y=-a; g.add(hut);
    const hr=meshOf(new THREE.ConeGeometry(0.42,0.3,4),mat(P.roof,{rough:0.9}));
    hr.rotation.y=Math.PI/4; hr.position.set(hut.position.x,y+0.62,hut.position.z); g.add(hr);
    const w=meshOf(new THREE.SphereGeometry(0.07,7,6),glowMat(P.bloom,1.2),false,false);
    w.position.set(hut.position.x*1.3,y+0.3,hut.position.z*1.3); g.add(w);
  }
  /* Leaf crown: stacked canopy discs, the realm's answer to a spire roof. */
  for(let i=0;i<4;i++){
    const r=lerp(1.5,0.5,i/3)*(great?1.35:1);
    const c=meshOf(new THREE.IcosahedronGeometry(r,1),
      mat(i%2?P.foliage:P.foliage2,{rough:0.98}));
    c.position.y=h+i*0.62; c.scale.y=0.5; g.add(c);
  }
  if(great){
    const seed=meshOf(new THREE.IcosahedronGeometry(0.55,1),glowMat(P.accent,2.2),false,false);
    seed.position.y=h+2.9; g.add(seed);
    seed.userData.tick=t=>{seed.material.emissiveIntensity=1.9+Math.sin(t*1.3)*0.7;
      seed.position.y=h+2.9+Math.sin(t*0.8)*0.14;};
    animated.push(seed);
    for(let k=0;k<8;k++){                // spores drifting off the crown
      const sp=meshOf(new THREE.IcosahedronGeometry(0.08,0),glowMat(P.bloom,1.5),false,false);
      const rr=lerp(0.8,2.2,rnd()), y0=h+lerp(0.5,2.6,rnd()), off=rnd()*TAU, sd=lerp(0.15,0.4,rnd());
      sp.userData.tick=t=>{const w=t*sd+off;
        sp.position.set(Math.cos(w)*rr,y0+Math.sin(t*0.6+off)*0.5,Math.sin(w)*rr);};
      g.add(sp); animated.push(sp);
    }
  }
  return g;
}
function frameHall(P,rnd){
  const g=new THREE.Group();
  /* A greenhouse: timber frame, glowing glass, a leaf roof over the top. */
  const w=lerp(2.0,2.8,rnd()), d=w*0.72, h=lerp(0.9,1.2,rnd());
  /* Glazing, not a ghost. Half-height masonry walls carry the building and the
     glass sits above them as solid panes — at 0.5 opacity the whole hall read
     as a transparent smear with furniture floating inside it. */
  const glass=mat(P.bloom,{emissive:P.bloom,ei:0.35,opacity:0.92,rough:0.2,flat:false});
  const plinth=meshOf(boxG(w,h*0.45,d),mat(P.stone,{rough:0.92}));
  plinth.position.y=h*0.225; g.add(plinth);
  g.add(meshOf(boxG(w*0.98,h*0.58,d*0.98),glass,false,false)
    .translateY(h*0.74));
  const bm=mat(P.wood,{rough:0.95});
  for(let i=0;i<5;i++){
    const rib=meshOf(boxG(0.07,h+0.6,0.07),bm);
    rib.position.set(lerp(-w/2,w/2,i/4),(h+0.6)/2,d/2); g.add(rib);
    const rib2=rib.clone(); rib2.position.z=-d/2; g.add(rib2);
  }
  const roof=gableRoof(w,d*1.1,d*0.45,mat(P.roof,{rough:0.9}));
  roof.position.y=h; g.add(roof);
  for(let i=0;i<4;i++){
    const b=meshOf(new THREE.IcosahedronGeometry(lerp(0.3,0.5,rnd()),0),
      mat(P.foliage,{rough:0.98}));
    b.position.set(lerp(-w*0.35,w*0.35,i/3),h+d*0.42,(rnd()-0.5)*d*0.4);
    b.scale.y=0.6; g.add(b);
  }
  return g;
}
function frameLife(P,n,R){
  /* Butterflies: two flapping wings on a wandering path. Reads completely
     differently from the swarm's circling birds even at a glance. */
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,888));
  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const m=mat(rnd()<0.5?P.accent:P.bloom,{side:THREE.DoubleSide,rough:0.8,
      emissive:P.bloom,ei:0.3});
    const wl=meshOf(new THREE.PlaneGeometry(0.3,0.22),m,false,false);
    const wr=wl.clone(); wl.position.x=-0.15; wr.position.x=0.15;
    b.add(wl,wr);
    const rr=lerp(0.35,1.0,rnd())*R, y=lerp(1.2,4.5,rnd());
    const sp=lerp(0.1,0.28,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU, flap=lerp(7,12,rnd());
    b.userData.tick=t=>{
      const w=t*sp+off;
      b.position.set(Math.cos(w)*rr,y+Math.sin(t*1.3+off)*0.7,Math.sin(w*1.2+off)*rr);
      b.rotation.y=-w; b.rotation.z=Math.sin(t*0.9+off)*0.3;
      const f=Math.sin(t*flap+off)*0.9;
      wl.rotation.y=f; wr.rotation.y=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* --------------------------------------------------------- THE METAL FORGES
   A volcanic mesa. Brick, iron and molten metal — and warm, because a forge at
   dusk is a cosy place and this world is not allowed to be grim. */
function forgeHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(0.9,1.3,rnd())*scale, h=lerp(0.8,1.2,rnd())*scale;
  g.add(meshOf(boxG(w,h,d),mat(P.stone,{rough:0.95})).translateY(h/2));
  /* A shed roof — one flat plane at a slight pitch. No gables, no cones: the
     forge realm is corrugated iron and it should never be mistaken for a
     cottage. */
  const roof=meshOf(boxG(w*1.16,0.1,d*1.16),
    mat(rnd()<0.6?P.roof:P.roof2,{metal:0.35,rough:0.55}));
  roof.position.y=h+0.06; roof.rotation.z=0.09; g.add(roof);
  for(let i=0;i<4;i++){                 // corrugation
    const rib=meshOf(boxG(w*1.16,0.04,0.05),
      mat(P.roof2,{metal:0.4,rough:0.5}),false,false);
    rib.position.set(0,h+0.12,lerp(-d*0.45,d*0.45,i/3)); rib.rotation.z=0.09; g.add(rib);
  }
  /* The furnace mouth: the light source that makes this realm warm. */
  const mouth=meshOf(boxG(w*0.42,h*0.42,0.06),
    glowMat(P.liquid,2.2),false,false);
  mouth.position.set(0,h*0.3,d/2+0.02); g.add(mouth);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.liquid,
    transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending}));
  gl.scale.setScalar(1.5); gl.position.set(0,h*0.3,d/2+0.14); g.add(gl);
  const ph=rnd()*TAU;
  mouth.userData.tick=t=>{
    const f=1.7+Math.sin(t*3.1+ph)*0.5+Math.sin(t*7.3+ph)*0.2;
    mouth.material.emissiveIntensity=f; gl.material.opacity=0.24+f*0.06;
  };
  animated.push(mouth);
  /* Chimney on every house, but a PLUME on only one in three. Fifty houses
     each venting four puffs turned the mesa into fog and buried the buildings
     it was supposed to be characterising. */
  /* Shorter and in the wall material. Full-height stacks in near-black turned
     fifty houses into a picket fence of poles. */
  const chh=h*0.7;
  const ch=meshOf(new THREE.CylinderGeometry(0.16*scale,0.2*scale,chh,6),
    mat(P.stone2,{rough:0.95}));
  ch.position.set(-w*0.3,h+chh/2,-d*0.24); g.add(ch);
  const cap=meshOf(new THREE.CylinderGeometry(0.24*scale,0.2*scale,0.1,6),
    mat(P.metal,{metal:0.5,rough:0.6}));
  cap.position.set(-w*0.3,h+chh,-d*0.24); g.add(cap);
  if(rnd()<0.34) for(let k=0;k<2;k++){
    const p=meshOf(new THREE.IcosahedronGeometry(0.13,0),
      mat(P.rock,{opacity:0.24,flat:false,rough:1}),false,false);
    p.userData.tick=t=>{
      const u=((t*0.22+k/2)%1);
      p.position.set(-w*0.3+Math.sin(u*4+k)*0.18,h+chh+0.1+u*1.7,-d*0.24);
      p.scale.setScalar(0.5+u*1.4); p.material.opacity=0.2*(1-u);
    };
    g.add(p); animated.push(p);
  }
  /* Sparks stay — they are small, bright and read as work rather than as haze. */
  for(let k=0;k<2;k++){
    const s=meshOf(new THREE.IcosahedronGeometry(0.045,0),glowMat(P.accent,2.4),false,false);
    const off=rnd(), sx=(rnd()-0.5)*w*0.5;
    s.userData.tick=t=>{
      const u=((t*0.55+off+k*0.33)%1);
      s.position.set(sx+Math.sin(u*7+k)*0.14,h*0.35+u*1.7,d/2+0.1);
      s.material.emissiveIntensity=2.4*(1-u);
    };
    g.add(s); animated.push(s);
  }
  return g;
}
function forgeTower(P,rnd,h,great){
  const g=new THREE.Group();
  /* A blast furnace: fat brick base, iron bands, a flared crown, and smoke. */
  const rb=0.75, rt=0.42;
  const segs=3+Math.floor(rnd()*2);
  let y=0, r=rb;
  for(let i=0;i<segs;i++){
    const sh=h/segs, nr=lerp(rb,rt,(i+1)/segs);
    const s=meshOf(new THREE.CylinderGeometry(nr,r,sh,10),
      mat(i%2?P.stone:P.cliff,{rough:0.95}));
    s.position.y=y+sh/2; g.add(s);
    const band=meshOf(new THREE.CylinderGeometry(nr*1.1,nr*1.1,0.14,10),
      mat(P.metal,{metal:0.6,rough:0.5}));
    band.position.y=y+sh; g.add(band);
    for(let k=0;k<6;k++){                // rivets
      const a=k/6*TAU;
      const rv=meshOf(new THREE.SphereGeometry(0.045,5,4),
        mat(P.metal,{metal:0.6,rough:0.45}),false,false);
      rv.position.set(Math.cos(a)*nr*1.11,y+sh,Math.sin(a)*nr*1.11); g.add(rv);
    }
    /* Tap-holes glowing through the brick. */
    if(i<segs-1){
      const t1=meshOf(boxG(0.22,0.3,0.06),glowMat(P.liquid,2.0),false,false);
      const a=rnd()*TAU;
      t1.position.set(Math.cos(a)*nr*1.02,y+sh*0.5,Math.sin(a)*nr*1.02);
      t1.rotation.y=-a+Math.PI/2; g.add(t1);
    }
    y+=sh; r=nr;
  }
  const crown=meshOf(new THREE.CylinderGeometry(rt*1.6,rt*1.05,0.4,10),
    mat(P.metal,{metal:0.55,rough:0.5}));
  crown.position.y=y+0.2; g.add(crown);
  const stack=meshOf(new THREE.CylinderGeometry(rt*0.6,rt*0.75,great?2.4:1.3,8),
    mat(P.cliffDark,{rough:0.95}));
  stack.position.y=y+0.4+(great?1.2:0.65); g.add(stack);
  const top=y+0.4+(great?2.4:1.3);
  for(let k=0;k<3;k++){
    const p=meshOf(new THREE.IcosahedronGeometry(0.36,0),
      mat(P.rock,{opacity:0.26,flat:false,rough:1}),false,false);
    p.userData.tick=t=>{
      const u=((t*0.14+k/3)%1);
      p.position.set(Math.sin(u*3+k)*0.6,top+u*4.6,Math.cos(u*2+k)*0.45);
      p.scale.setScalar(0.7+u*2.0); p.material.opacity=0.24*(1-u);
    };
    g.add(p); animated.push(p);
  }
  if(great){
    const beacon=meshOf(new THREE.IcosahedronGeometry(0.42,1),glowMat(P.liquid,2.6),false,false);
    beacon.position.y=top+0.4; g.add(beacon);
    matAnim(beacon.material,(m,t)=>{ m.emissiveIntensity=2.1+Math.sin(t*1.6)*0.8; });
  }
  return g;
}
function forgeHall(P,rnd){
  /* A foundry shed: barrel vault, roof vents, molten light inside. */
  const g=new THREE.Group();
  const w=lerp(2.4,3.4,rnd()), d=w*0.62, h=lerp(0.7,1.0,rnd());
  g.add(meshOf(boxG(w,h,d),mat(P.stone,{rough:0.95})).translateY(h/2));
  const vault=meshOf(new THREE.CylinderGeometry(d*0.52,d*0.52,w,12,1,false,0,Math.PI),
    mat(P.roof,{metal:0.35,rough:0.6}));
  vault.rotation.z=Math.PI/2; vault.position.y=h; g.add(vault);
  for(let i=0;i<3;i++){
    const v=meshOf(boxG(0.3,0.22,0.3),mat(P.metal,{metal:0.5,rough:0.55}));
    v.position.set(lerp(-w*0.3,w*0.3,i/2),h+d*0.5,0); g.add(v);
    const hot=meshOf(boxG(0.2,0.05,0.2),glowMat(P.liquid,1.8),false,false);
    hot.position.set(v.position.x,h+d*0.5+0.12,0); g.add(hot);
  }
  const door=meshOf(boxG(w*0.3,h*0.7,0.06),glowMat(P.liquid,2.0),false,false);
  door.position.set(0,h*0.35,d/2+0.02); g.add(door);
  const ph=rnd()*TAU;
  matAnim(door.material,(m,t)=>{ m.emissiveIntensity=1.6+Math.sin(t*2.4+ph)*0.5; });
  return g;
}
function forgeLife(P,n,R){
  /* Embers rising off the mesa — no birds would live here, and the upward
     drift is the opposite motion to every other realm's circling. */
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,888));
  for(let i=0;i<n*3;i++){
    const e=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,
      color:rnd()<0.6?P.liquid:P.accent,transparent:true,opacity:0.6,
      depthWrite:false,blending:THREE.AdditiveBlending}));
    e.scale.setScalar(lerp(0.12,0.3,rnd()));
    const rr=lerp(0.2,1.0,rnd())*R, a=rnd()*TAU, sp=lerp(0.06,0.16,rnd()), off=rnd();
    e.userData.tick=t=>{
      const u=((t*sp+off)%1);
      e.position.set(Math.cos(a+u*0.6)*rr,-0.5+u*11,Math.sin(a+u*0.6)*rr);
      e.material.opacity=0.55*(1-u)*(u<0.1?u*10:1);
    };
    g.add(e); animated.push(e);
  }
  return g;
}

/* ----------------------------------------------------------- THE SHIPYARDS
   A harbour atoll. Sheds, cranes, containers — and open water at the rim. */
function shipHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.3,2.0,rnd())*scale, d=lerp(0.85,1.15,rnd())*scale, h=lerp(0.7,1.0,rnd())*scale;
  g.add(meshOf(boxG(w,h,d),mat(P.stone,{rough:0.9})).translateY(h/2));
  /* A painted base course. White sheds on pale sand had no edge at all; a dark
     skirt gives every building a foot the eye can find. */
  const skirt=meshOf(boxG(w*1.03,h*0.26,d*1.03),
    mat(P.roof,{rough:0.85}));
  skirt.position.y=h*0.13; g.add(skirt);
  /* Warehouse proportions: long, low, shallow-pitched. */
  /* Shallow pitch and a wide overhang — warehouse, not cottage. */
  const rh=0.3*scale;
  const roof=gableRoof(w*1.02,d*1.12,rh,
    mat(rnd()<0.6?P.roof:P.roof2,{metal:0.3,rough:0.6}));
  roof.position.y=h; g.add(roof);
  /* Banded cladding — the horizontal stripe reads "shed" instantly. */
  for(let i=0;i<3;i++){
    const band=meshOf(boxG(w*1.01,0.05,d*1.01),
      mat(P.stone2,{rough:0.85}),false,false);
    band.position.y=h*(0.25+i*0.28); g.add(band);
  }
  const door=meshOf(boxG(w*0.36,h*0.72,0.05),
    mat(P.accent,{rough:0.8}),false,false);
  door.position.set(w*0.14,h*0.36,d/2+0.02); g.add(door);
  const wm=glowMat(P.bloom,0.85);
  for(let i=0;i<3;i++){
    const win=meshOf(boxG(0.16*scale,0.14*scale,0.05),wm,false,false);
    win.position.set(lerp(-w*0.4,-w*0.05,i/2),h*0.68,d/2+0.02); g.add(win);
  }
  if(rnd()<0.5){                                  // containers alongside
    for(let i=0;i<1+Math.floor(rnd()*2);i++){
      const c=meshOf(boxG(0.62,0.3,0.36),
        mat(rnd()<0.5?P.accent2:P.roof2,{rough:0.8}));
      c.position.set(-w*0.2+(rnd()-0.5)*0.3,0.15+i*0.32,-d*0.75);
      c.rotation.y=(rnd()-0.5)*0.2; g.add(c);
    }
  }
  return g;
}
function shipTower(P,rnd,h,great){
  const g=new THREE.Group();
  if(great){
    /* Lighthouse — banded taper, gallery, and a beam that actually sweeps. */
    const segs=4;
    for(let i=0;i<segs;i++){
      const y0=h*i/segs, sh=h/segs;
      const r0=lerp(0.62,0.3,i/segs), r1=lerp(0.62,0.3,(i+1)/segs);
      const s=meshOf(new THREE.CylinderGeometry(r1,r0,sh,12),
        mat(i%2?P.stone:P.accent,{rough:0.85}));
      s.position.y=y0+sh/2; g.add(s);
    }
    const gal=meshOf(new THREE.CylinderGeometry(0.52,0.44,0.14,12),
      mat(P.metal,{metal:0.5,rough:0.5}));
    gal.position.y=h; g.add(gal);
    const rail=meshOf(new THREE.TorusGeometry(0.5,0.03,5,16),mat(P.metal,{metal:0.5,rough:0.5}));
    rail.rotation.x=Math.PI/2; rail.position.y=h+0.2; g.add(rail);
    const lamp=meshOf(new THREE.CylinderGeometry(0.3,0.3,0.5,10),
      mat(P.bloom,{emissive:P.bloom,ei:1.6,opacity:0.75,flat:false,rough:0.1}),false,false);
    lamp.position.y=h+0.4; g.add(lamp);
    const cap=meshOf(new THREE.ConeGeometry(0.4,0.4,10),mat(P.roof,{metal:0.4,rough:0.5}));
    cap.position.y=h+0.85; g.add(cap);
    /* The sweep: a long flat wedge of light turning once every few seconds. */
    const beam=meshOf(new THREE.ConeGeometry(0.55,7,4,1,true),
      mat(P.bloom,{emissive:P.bloom,ei:1.2,opacity:0.16,flat:false,
        side:THREE.DoubleSide,rough:0.1}),false,false);
    beam.rotation.z=Math.PI/2; beam.position.y=h+0.4;
    const holder=new THREE.Group(); holder.position.y=h+0.4;
    beam.position.set(3.5,0,0); holder.add(beam); g.add(holder);
    holder.userData.tick=t=>{holder.rotation.y=t*0.5;};
    animated.push(holder);
  }else{
    /* Gantry crane — lattice mast, slewing jib, counterweight. */
    const mm=mat(P.metal,{metal:0.5,rough:0.55});
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const leg=meshOf(new THREE.CylinderGeometry(0.05,0.06,h,5),mm);
      leg.position.set(sx*0.24,h/2,sz*0.24);
      leg.rotation.set(sz*0.03,0,-sx*0.03); g.add(leg);
    }
    for(let i=1;i<Math.round(h/0.7);i++){
      const y=i*0.7;
      for(const ax of [0,1]){
        const b=meshOf(boxG(ax?0.52:0.06,0.05,ax?0.06:0.52),mm,false,false);
        b.position.set(0,y,0); g.add(b);
      }
      const d1=meshOf(boxG(0.72,0.04,0.04),mm,false,false);
      d1.position.set(0,y-0.35,0.24); d1.rotation.z=0.75*(i%2?1:-1); g.add(d1);
    }
    const slew=new THREE.Group(); slew.position.y=h; g.add(slew);
    const jib=meshOf(boxG(3.4,0.12,0.18),mm);
    jib.position.set(1.1,0.1,0); slew.add(jib);
    const cw=meshOf(boxG(0.5,0.42,0.42),mat(P.roof,{rough:0.8}));
    cw.position.set(-0.85,0.05,0); slew.add(cw);
    const cab=meshOf(boxG(0.36,0.3,0.32),mat(P.accent,{rough:0.8}));
    cab.position.set(0.3,-0.12,0); slew.add(cab);
    for(let i=0;i<3;i++){                      // stay cables
      const c=meshOf(new THREE.CylinderGeometry(0.015,0.015,1.5,4),mm,false,false);
      c.position.set(0.5+i*0.7,0.42-i*0.05,0);
      c.rotation.z=Math.PI/2-0.5+i*0.12; slew.add(c);
    }
    const hook=meshOf(boxG(0.12,0.2,0.12),mm,false,false);
    const line=meshOf(new THREE.CylinderGeometry(0.012,0.012,1,4),mm,false,false);
    slew.add(hook,line);
    const off=rnd()*TAU, hx=lerp(1.2,2.6,rnd());
    slew.userData.tick=t=>{
      slew.rotation.y=Math.sin(t*0.12+off)*1.1;
      const drop=1.4+Math.sin(t*0.5+off)*0.9;
      hook.position.set(hx,0.1-drop,0);
      line.position.set(hx,0.1-drop/2,0); line.scale.y=drop;
    };
    animated.push(slew);
    const bl=meshOf(new THREE.SphereGeometry(0.09,7,6),glowMat(P.accent,1.8),false,false);
    bl.position.y=h+0.2; g.add(bl);
    matAnim(bl.material,(m,t)=>{ m.emissiveIntensity=(Math.sin(t*3)>0)?2.2:0.3; });
  }
  return g;
}
function shipHall(P,rnd){
  /* A boat shed with a hull under repair inside it. */
  const g=new THREE.Group();
  const w=lerp(2.6,3.4,rnd()), d=w*0.6, h=lerp(0.8,1.05,rnd());
  const vault=meshOf(new THREE.CylinderGeometry(d*0.55,d*0.55,w,14,1,false,0,Math.PI),
    mat(P.roof,{metal:0.3,rough:0.6}));
  vault.rotation.z=Math.PI/2; vault.position.y=h; g.add(vault);
  for(const s of [-1,1]){
    const wall=meshOf(boxG(w,h,0.12),mat(P.stone,{rough:0.9}));
    wall.position.set(0,h/2,s*d*0.5); g.add(wall);
  }
  const hull=meshOf(new THREE.CylinderGeometry(0.3,0.42,w*0.6,7,1,false,0,Math.PI),
    mat(P.accent,{rough:0.8}));
  hull.rotation.z=Math.PI/2; hull.rotation.x=Math.PI; hull.position.y=h*0.55; g.add(hull);
  for(let i=0;i<3;i++){
    const cr=meshOf(boxG(0.12,h*0.5,0.5),mat(P.wood,{rough:0.95}));
    cr.position.set(lerp(-w*0.22,w*0.22,i/2),h*0.25,0); g.add(cr);
  }
  const lamp=meshOf(new THREE.SphereGeometry(0.12,8,6),glowMat(P.bloom,1.4),false,false);
  lamp.position.set(0,h*0.9,0); g.add(lamp);
  return g;
}
function shipLife(P,n,R,prof){
  /* Little boats working the water, and gulls above them. */
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,888));
  for(let i=0;i<Math.max(3,Math.round(n*0.5));i++){
    const b=new THREE.Group();
    const hull=meshOf(new THREE.CylinderGeometry(0.14,0.2,0.62,6,1,false,0,Math.PI),
      mat(rnd()<0.5?P.accent:P.roof2,{rough:0.85}));
    hull.rotation.z=Math.PI/2; hull.rotation.x=Math.PI; b.add(hull);
    const mast=meshOf(new THREE.CylinderGeometry(0.018,0.018,0.5,4),mat(P.wood));
    mast.position.y=0.25; b.add(mast);
    const sail=meshOf(new THREE.PlaneGeometry(0.3,0.34),
      mat(P.stone,{side:THREE.DoubleSide,rough:0.9}),false,false);
    sail.position.set(0.06,0.28,0); b.add(sail);
    /* The lane between the shore and the open edge of the bay, as a FRACTION
       of the coast rather than an absolute radius — the sea ring follows the
       island's wobbled profile, so a boat on a plain circle would run aground at
       the narrow bearings and sail off the far edge at the wide ones. Given the
       profile it tracks the coastline instead, which is what a boat working a
       harbour would do anyway. */
    const fr=lerp(1.04,1.15,rnd()), sp=lerp(0.05,0.12,rnd())*(rnd()<0.5?1:-1);
    const off=rnd()*TAU;
    b.userData.tick=t=>{
      const w=t*sp+off;
      const rr=(prof?radiusAt(prof,w):1)*R*fr;
      b.position.set(Math.cos(w)*rr,SEA_Y+0.1+Math.sin(t*1.6+off)*0.06,Math.sin(w)*rr);
      b.rotation.y=-w+Math.PI/2; b.rotation.z=Math.sin(t*1.3+off)*0.08;
    };
    g.add(b); animated.push(b);
  }
  const bodyMat=mat(T.salt0,{rough:0.7});
  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const wl=meshOf(boxG(0.36,0.03,0.1),bodyMat,false,false);
    const wr=wl.clone(); wl.position.x=-0.18; wr.position.x=0.18; b.add(wl,wr);
    b.add(meshOf(boxG(0.1,0.06,0.2),bodyMat,false,false));
    const rr=lerp(0.7,1.3,rnd())*R, y=lerp(2.5,6,rnd());
    const sp=lerp(0.1,0.22,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU, flap=lerp(3,5,rnd());
    b.userData.tick=t=>{
      const w=t*sp+off;
      b.position.set(Math.cos(w)*rr,y+Math.sin(t*0.5+off)*0.6,Math.sin(w)*rr);
      b.rotation.y=-w+Math.PI/2;
      const f=Math.sin(t*flap+off)*0.42; wl.rotation.z=f; wr.rotation.z=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* -------------------------------------------------------------- THE BASTION
   A walled crag. Every terrace edge is a rampart; nothing is open. */
function bastionHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  const w=lerp(1.0,1.5,rnd())*scale, d=lerp(0.9,1.3,rnd())*scale, h=lerp(0.8,1.2,rnd())*scale;
  g.add(meshOf(boxG(w,h,d),mat(P.stone,{rough:0.94})).translateY(h/2));
  /* A course line and a plinth: masonry, not plaster. */
  const plinth=meshOf(boxG(w*1.08,0.16,d*1.08),mat(P.stone2,{rough:0.94}));
  plinth.position.y=0.08; g.add(plinth);
  const course=meshOf(boxG(w*1.03,0.06,d*1.03),
    mat(P.stone2,{rough:0.94}),false,false);
  course.position.y=h*0.62; g.add(course);
  /* Steep slate hip roof — tall and severe, the opposite of the frame gable. */
  const rh=lerp(0.7,1.0,rnd())*scale;
  const roof=meshOf(new THREE.ConeGeometry(Math.max(w,d)*0.78,rh,4),
    mat(rnd()<0.6?P.roof:P.roof2,{rough:0.65,metal:0.15}));
  roof.rotation.y=Math.PI/4; roof.position.y=h+rh/2; g.add(roof);
  /* Arrow slits, not windows. Thin, tall, and only a few. */
  const sm=glowMat(P.bloom,1.0);
  for(let i=0;i<2;i++){
    const sl=meshOf(boxG(0.06,0.34,0.05),sm,false,false);
    sl.position.set(lerp(-w*0.25,w*0.25,i),h*0.55,d/2+0.02); g.add(sl);
  }
  if(rnd()<0.45){                    // a corner turret
    const th=h*0.7;
    const tw=meshOf(new THREE.CylinderGeometry(0.22*scale,0.24*scale,h+th,8),
      mat(P.stone2,{rough:0.94}));
    tw.position.set(w*0.45,(h+th)/2,d*0.42); g.add(tw);
    const tc=meshOf(new THREE.ConeGeometry(0.3*scale,0.45,8),mat(P.roof,{rough:0.65}));
    tc.position.set(w*0.45,h+th+0.22,d*0.42); g.add(tc);
  }
  return g;
}
function bastionTower(P,rnd,h,great){
  const g=new THREE.Group();
  const r=great?0.85:0.62;
  const segs=3;
  for(let i=0;i<segs;i++){
    const sh=h/segs, rr=r*lerp(1.06,0.94,i/segs);
    const s=meshOf(new THREE.CylinderGeometry(rr*0.97,rr,sh,10),
      mat(i%2?P.stone:P.stone2,{rough:0.94}));
    s.position.y=sh*i+sh/2; g.add(s);
  }
  /* Machicolations: a corbelled overhang under the parapet. This one detail is
     what makes a round tower read as a FORTRESS tower and not a wizard's. */
  const cor=meshOf(new THREE.CylinderGeometry(r*1.28,r*1.0,0.3,12),mat(P.stone2,{rough:0.94}));
  cor.position.y=h; g.add(cor);
  const nCor=14;
  for(let i=0;i<nCor;i++){
    const a=i/nCor*TAU;
    const b=meshOf(boxG(0.1,0.22,0.24),mat(P.stone,{rough:0.94}),false,false);
    b.position.set(Math.cos(a)*r*1.14,h-0.16,Math.sin(a)*r*1.14); b.rotation.y=-a; g.add(b);
  }
  /* Battlements — merlons with gaps. Reused on the ramparts too. */
  const nM=Math.round(r*18);
  for(let i=0;i<nM;i++){
    const a=i/nM*TAU;
    const m=meshOf(boxG(0.22,0.34,0.18),mat(P.stone2,{rough:0.94}));
    m.position.set(Math.cos(a)*r*1.22,h+0.32,Math.sin(a)*r*1.22); m.rotation.y=-a; g.add(m);
  }
  const roof=meshOf(new THREE.ConeGeometry(r*1.05,great?2.0:1.4,10),
    mat(P.roof,{rough:0.65,metal:0.15}));
  roof.position.y=h+0.5+(great?1.0:0.7); g.add(roof);
  const flag=meshOf(new THREE.CylinderGeometry(0.03,0.03,0.8,4),mat(P.metal,{metal:0.5}));
  flag.position.y=h+0.5+(great?2.4:1.8); g.add(flag);
  const cloth=meshOf(new THREE.PlaneGeometry(0.44,0.3,5,3),
    mat(P.accent,{side:THREE.DoubleSide,flat:false,rough:0.85}),true,false);
  cloth.position.set(0.22,h+0.5+(great?2.62:2.02),0); g.add(cloth);
  const base=cloth.geometry.attributes.position.array.slice(), ph=rnd()*TAU;
  cloth.userData.tick=t=>{
    const p=cloth.geometry.attributes.position;
    for(let i=0;i<p.count;i++)
      p.setZ(i,Math.sin(t*3.4+ph+base[i*3]*6)*0.07*(base[i*3]/0.44+0.5));
    p.needsUpdate=true;
  };
  animated.push(cloth);
  if(great){
    const beacon=meshOf(new THREE.IcosahedronGeometry(0.4,1),glowMat(P.accent,2.4),false,false);
    beacon.position.y=h+0.5+2.0; g.add(beacon);
    /* A warning sweep rather than a soft glow — this realm watches. */
    const sweep=meshOf(new THREE.ConeGeometry(0.5,6,4,1,true),
      mat(P.accent,{emissive:P.accent,ei:1.2,opacity:0.14,flat:false,
        side:THREE.DoubleSide,rough:0.1}),false,false);
    const hold=new THREE.Group(); hold.position.y=h+0.5+2.0;
    sweep.rotation.z=Math.PI/2; sweep.position.set(3,0,0); hold.add(sweep); g.add(hold);
    hold.userData.tick=t=>{hold.rotation.y=-t*0.42;};
    matAnim(beacon.material,(m,t)=>{ m.emissiveIntensity=2.0+Math.sin(t*2.2)*0.7; });
    animated.push(hold);
  }
  return g;
}
function bastionHall(P,rnd){
  /* The keep: a square block with four corner turrets. Blunt on purpose. */
  const g=new THREE.Group();
  const w=lerp(2.0,2.6,rnd()), h=lerp(1.6,2.2,rnd());
  g.add(meshOf(boxG(w,h,w*0.86),mat(P.stone,{rough:0.94})).translateY(h/2));
  const nM=Math.round(w*4);
  for(let e=0;e<4;e++){
    for(let i=0;i<nM;i++){
      const u=(i+0.5)/nM-0.5;
      const m=meshOf(boxG(0.2,0.3,0.16),mat(P.stone2,{rough:0.94}));
      const x=e<2?u*w:(e===2?w/2:-w/2), z=e<2?(e?w*0.43:-w*0.43):u*w*0.86;
      m.position.set(x,h+0.15,z); g.add(m);
    }
  }
  for(const sx of [-1,1]) for(const sz of [-1,1]){
    const th=h*1.25;
    const t=meshOf(new THREE.CylinderGeometry(0.3,0.34,th,8),mat(P.stone2,{rough:0.94}));
    t.position.set(sx*w*0.48,th/2,sz*w*0.42); g.add(t);
    const c=meshOf(new THREE.ConeGeometry(0.42,0.6,8),mat(P.roof,{rough:0.65}));
    c.position.set(sx*w*0.48,th+0.3,sz*w*0.42); g.add(c);
  }
  const gate=meshOf(boxG(w*0.26,h*0.5,0.08),mat(P.wood,{rough:0.9}));
  gate.position.set(0,h*0.25,w*0.44); g.add(gate);
  const glow=meshOf(boxG(w*0.2,h*0.3,0.05),glowMat(P.bloom,1.0),false,false);
  glow.position.set(0,h*0.62,w*0.44); g.add(glow);
  return g;
}
function bastionLife(P,n,R){
  /* Patrol lanterns walking the wall line, and ravens over the crag. */
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,888));
  for(let i=0;i<Math.max(3,Math.round(n*0.6));i++){
    const l=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:P.accent,
      transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
    l.scale.setScalar(0.5);
    const tier=Math.floor(rnd()*3);
    const rr=(TIER_R[tier]??R)*0.98, y=-tier*TIER_STEP+0.6;
    const sp=lerp(0.05,0.11,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU;
    l.userData.tick=t=>{
      const w=t*sp+off;
      l.position.set(Math.cos(w)*rr,y+Math.sin(t*3+off)*0.05,Math.sin(w)*rr);
      l.material.opacity=0.4+Math.sin(t*2+off)*0.12;
    };
    g.add(l); animated.push(l);
  }
  const bodyMat=mat(P.rock,{rough:0.8});
  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const wl=meshOf(boxG(0.3,0.03,0.1),bodyMat,false,false);
    const wr=wl.clone(); wl.position.x=-0.15; wr.position.x=0.15; b.add(wl,wr);
    b.add(meshOf(boxG(0.09,0.06,0.18),bodyMat,false,false));
    const rr=lerp(0.6,1.2,rnd())*R, y=lerp(3,7,rnd());
    const sp=lerp(0.12,0.26,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU, flap=lerp(5,8,rnd());
    b.userData.tick=t=>{
      const w=t*sp+off;
      b.position.set(Math.cos(w)*rr,y+Math.sin(t*0.7+off)*0.7,Math.sin(w)*rr);
      b.rotation.y=-w+Math.PI/2;
      const f=Math.sin(t*flap+off)*0.6; wl.rotation.z=f; wr.rotation.z=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* ----------------------------------------------------- THE ARTISAN'S QUARTER
   A warm old town. Narrow, tall, shuttered, and packed shoulder to shoulder. */
function quarterHouse(P,rnd,scale=1){
  const g=new THREE.Group();
  /* Narrow and tall — the proportion IS the realm. A quarter house is always
     deeper than it is wide and always has one more storey than you expect. */
  const w=lerp(0.8,1.1,rnd())*scale, d=lerp(1.0,1.4,rnd())*scale;
  const storeys=2+Math.floor(rnd()*2);
  const sh=lerp(0.62,0.8,rnd())*scale;
  const h=storeys*sh;
  const wall=rnd()<0.5?P.stone:P.stone2;
  g.add(meshOf(boxG(w,h,d),mat(wall,{rough:0.92})).translateY(h/2));
  const bm=mat(P.wood,{rough:0.95});
  for(let i=1;i<storeys;i++){          // floor bands, jettied slightly
    const band=meshOf(boxG(w*1.06,0.09,d*1.06),bm,false,false);
    band.position.y=i*sh; g.add(band);
  }
  /* Steep front gable with a hoist beam — the trading-house silhouette. */
  const rh=lerp(0.6,0.85,rnd())*scale;
  const roof=gableRoof(d*1.08,w*1.1,rh,mat(rnd()<0.6?P.roof:P.roof2,{rough:0.72}));
  roof.rotation.y=Math.PI/2; roof.position.y=h; g.add(roof);
  const hoist=meshOf(boxG(0.06,0.06,0.36),bm,false,false);
  hoist.position.set(0,h+rh*0.7,d*0.5+0.12); g.add(hoist);
  /* Shuttered windows in a regular grid — the "someone lives here" signal. */
  const wm=glowMat(P.bloom,0.95);
  const shut=mat(P.roof2,{rough:0.85});
  for(let s=0;s<storeys;s++) for(let i=0;i<2;i++){
    const y=s*sh+sh*0.55, x=lerp(-w*0.24,w*0.24,i);
    const win=meshOf(boxG(0.19*scale,0.26*scale,0.05),wm,false,false);
    win.position.set(x,y,d/2+0.02); g.add(win);
    for(const sx of [-1,1]){
      const sl=meshOf(boxG(0.07*scale,0.28*scale,0.04),shut,false,false);
      sl.position.set(x+sx*0.15*scale,y,d/2+0.03); g.add(sl);
    }
  }
  if(rnd()<0.55){                     // shopfront awning
    for(let i=0;i<4;i++){
      const st=meshOf(boxG(w*1.2/4,0.05,0.42),
        mat(i%2?P.accent:P.stone,{rough:0.85}),false,false);
      st.position.set(lerp(-w*0.45,w*0.45,i/3),sh*0.86,d/2+0.2);
      st.rotation.x=-0.28; g.add(st);
    }
  }
  if(rnd()<0.5){
    const ch=meshOf(boxG(0.2*scale,0.7,0.2*scale),mat(P.cliffDark));
    ch.position.set(w*0.24,h+rh*0.5,-d*0.2); g.add(ch);
    for(let k=0;k<3;k++){
      const p=meshOf(new THREE.IcosahedronGeometry(0.11,0),
        mat(T.salt0,{opacity:0.4,flat:false,rough:1}),false,false);
      p.userData.tick=t=>{
        const u=((t*0.26+k/3)%1);
        p.position.set(w*0.24+Math.sin(u*4+k)*0.13,h+rh*0.9+u*1.5,-d*0.2);
        p.scale.setScalar(0.5+u*1.7); p.material.opacity=0.36*(1-u);
      };
      g.add(p); animated.push(p);
    }
  }
  return g;
}
function quarterTower(P,rnd,h,great){
  /* A clock tower — square shaft, open belfry, a face with moving hands. */
  const g=new THREE.Group();
  const w=great?1.0:0.78;
  const shaft=meshOf(boxG(w,h,w),mat(P.stone,{rough:0.92}));
  shaft.position.y=h/2; g.add(shaft);
  for(let i=1;i<Math.round(h/1.4);i++){
    const band=meshOf(boxG(w*1.06,0.08,w*1.06),
      mat(P.stone2,{rough:0.92}),false,false);
    band.position.y=i*1.4; g.add(band);
  }
  /* The clock face, and hands that actually sweep. */
  const faceY=h*0.82;
  for(const [dx,dz,ry] of [[0,w/2+0.03,0],[w/2+0.03,0,Math.PI/2]]){
    const face=meshOf(new THREE.CylinderGeometry(w*0.34,w*0.34,0.05,16),
      mat(P.bloom,{emissive:P.bloom,ei:0.8,rough:0.4}),false,false);
    face.rotation.set(Math.PI/2,0,0); face.rotation.y=ry;
    face.position.set(dx,faceY,dz); g.add(face);
    const rim=meshOf(new THREE.TorusGeometry(w*0.34,0.035,5,16),
      mat(P.metal,{metal:0.6,rough:0.4}),false,false);
    rim.rotation.y=ry; rim.position.set(dx,faceY,dz); g.add(rim);
    for(const [len,speed,thick] of [[w*0.26,0.05,0.035],[w*0.18,0.6,0.045]]){
      const hand=meshOf(boxG(thick,len,0.03),
        mat(P.cliffDark,{rough:0.7}),false,false);
      const piv=new THREE.Group(); piv.position.set(dx,faceY,dz); piv.rotation.y=ry;
      hand.position.y=len/2; piv.add(hand); g.add(piv);
      piv.userData.tick=t=>{hand.parent.rotation.z=-t*speed;};
      animated.push(piv);
    }
  }
  /* Open belfry with a bell that swings. */
  const by=h+0.35;
  for(const sx of [-1,1]) for(const sz of [-1,1]){
    const c=meshOf(new THREE.CylinderGeometry(0.07,0.07,0.7,6),mat(P.stone2,{rough:0.92}));
    c.position.set(sx*w*0.4,by,sz*w*0.4); g.add(c);
  }
  const floor=meshOf(boxG(w*1.12,0.12,w*1.12),mat(P.stone2,{rough:0.92}));
  floor.position.y=by-0.35; g.add(floor);
  const bell=meshOf(new THREE.CylinderGeometry(0.1,0.24,0.3,8),
    mat(P.metal,{metal:0.7,rough:0.35,env:1.1}));
  bell.position.y=by+0.05; g.add(bell);
  bell.userData.tick=t=>{bell.rotation.z=Math.sin(t*1.5)*0.16;};
  animated.push(bell);
  const rh=great?1.5:1.0;
  const roof=meshOf(new THREE.ConeGeometry(w*0.86,rh,4),mat(P.roof,{rough:0.72}));
  roof.rotation.y=Math.PI/4; roof.position.y=by+0.35+rh/2; g.add(roof);
  const vane=meshOf(boxG(0.3,0.03,0.03),mat(P.metal,{metal:0.6,rough:0.4}));
  vane.position.y=by+0.35+rh+0.18; g.add(vane);
  vane.userData.tick=t=>{vane.rotation.y=Math.sin(t*0.3)*1.2;};
  animated.push(vane);
  if(great){
    const lantern=meshOf(new THREE.IcosahedronGeometry(0.34,1),glowMat(P.accent,2.2),false,false);
    lantern.position.y=by+0.35+rh+0.55; g.add(lantern);
    matAnim(lantern.material,(m,t)=>{ m.emissiveIntensity=1.9+Math.sin(t*1.4)*0.6; });
  }
  return g;
}
function quarterHall(P,rnd){
  /* A covered market: colonnade, tiled roof, cupola. */
  const g=new THREE.Group();
  const w=lerp(2.4,3.2,rnd()), d=w*0.62, h=lerp(0.9,1.2,rnd());
  const floor=meshOf(boxG(w,0.2,d),mat(P.stone2,{rough:0.92}));
  floor.position.y=0.1; g.add(floor);
  const n=5;
  for(let i=0;i<n;i++) for(const sz of [-1,1]){
    const c=meshOf(new THREE.CylinderGeometry(0.1,0.12,h,8),mat(P.stone,{rough:0.92}));
    c.position.set(lerp(-w*0.42,w*0.42,i/(n-1)),h/2+0.2,sz*d*0.4); g.add(c);
    const cap=meshOf(boxG(0.26,0.1,0.26),mat(P.stone,{rough:0.92}),false,false);
    cap.position.set(c.position.x,h+0.2,c.position.z); g.add(cap);
  }
  const roof=gableRoof(w*1.05,d*1.1,d*0.42,mat(P.roof,{rough:0.72}));
  roof.position.y=h+0.2; g.add(roof);
  const cup=meshOf(new THREE.CylinderGeometry(0.3,0.34,0.4,8),mat(P.stone,{rough:0.92}));
  cup.position.y=h+0.2+d*0.5; g.add(cup);
  const dome=meshOf(new THREE.SphereGeometry(0.34,10,7,0,TAU,0,Math.PI/2),
    mat(P.roof2,{rough:0.6,flat:false}));
  dome.position.y=h+0.4+d*0.5; g.add(dome);
  const fin=meshOf(new THREE.SphereGeometry(0.1,7,6),glowMat(P.accent,1.6),false,false);
  fin.position.y=h+0.78+d*0.5; g.add(fin);
  /* Bunting between the columns — cheap, and it does more for "festival" than
     any amount of geometry. */
  for(let i=0;i<n-1;i++){
    for(let k=0;k<4;k++){
      const f=meshOf(new THREE.ConeGeometry(0.06,0.14,3),
        mat(k%2?P.accent:P.accent2,{rough:0.85}),false,false);
      const x=lerp(lerp(-w*0.42,w*0.42,i/(n-1)),lerp(-w*0.42,w*0.42,(i+1)/(n-1)),(k+0.5)/4);
      const sag=Math.sin((k+0.5)/4*Math.PI)*0.14;
      f.position.set(x,h+0.14-sag,d*0.42); f.rotation.x=Math.PI; g.add(f);
      const ph=i+k;
      f.userData.tick=t=>{f.position.y=h+0.14-sag+Math.sin(t*2+ph)*0.02;};
      animated.push(f);
    }
  }
  return g;
}
function quarterLife(P,n,R){
  /* Doves — tight, fast circles low over the rooftops, and they land. */
  const g=new THREE.Group(), rnd=rngOf(hash2(P.seed,888));
  const bodyMat=mat(T.salt0,{rough:0.75});
  for(let i=0;i<n;i++){
    const b=new THREE.Group();
    const wl=meshOf(boxG(0.26,0.03,0.09),bodyMat,false,false);
    const wr=wl.clone(); wl.position.x=-0.13; wr.position.x=0.13; b.add(wl,wr);
    b.add(meshOf(boxG(0.08,0.06,0.16),bodyMat,false,false));
    const rr=lerp(0.4,1.0,rnd())*R, y=lerp(1.6,4,rnd());
    const sp=lerp(0.18,0.36,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU, flap=lerp(8,13,rnd());
    b.userData.tick=t=>{
      /* Perch for a beat, then take off again — makes a small town feel busy
         without adding a single extra bird. */
      const cyc=(t*0.09+off)%1, perched=cyc<0.3;
      const w=t*sp+off;
      b.position.set(Math.cos(w)*rr,perched?y-1.1:y+Math.sin(t*0.9+off)*0.5,Math.sin(w)*rr);
      b.rotation.y=-w+Math.PI/2;
      const f=perched?Math.sin(t*2+off)*0.06:Math.sin(t*flap+off)*0.55;
      wl.rotation.z=f; wr.rotation.z=-f;
    };
    g.add(b); animated.push(b);
  }
  return g;
}

/* ------------------------------------------------------- arcane land dressing
   The Arcane Swarm was reading as a pleasant hill town with purple roofs. What
   was missing is that magic should be IN THE GROUND, not just on the roofs: a
   ward inscribed on the plateau, ley-light running along the terrace edges, and
   shards of the island that never quite fell. All of it on fixed absolute
   radii, so none of it moves when the land grows. */
function arcaneWards(P,prof,R,sp){
  const g=new THREE.Group();

  /* The great ward: concentric glyph rings cut into the plateau, turning
     against each other at a speed you only notice if you watch. */
  const ringMat=()=>new THREE.MeshStandardMaterial({color:P.accent,emissive:P.accent,
    emissiveIntensity:1.9,roughness:0.25,transparent:true,opacity:0.85});
  for(let i=0;i<3;i++){
    const rr=0.95+i*0.5;          // inside the monument's own clearing
    const m=ringMat();
    const ring=meshOf(new THREE.RingGeometry(rr,rr+0.07,48),m,false,false);
    ring.rotation.x=-Math.PI/2; ring.position.y=0.18+i*0.002; g.add(ring);
    const n=6+i*3;
    for(let k=0;k<n;k++){
      const a=k/n*TAU;
      const glyph=meshOf(boxG(0.1,0.02,0.26),m,false,false);
      glyph.position.set(Math.cos(a)*(rr+0.22),0.185+i*0.002,Math.sin(a)*(rr+0.22));
      glyph.rotation.y=-a; g.add(glyph);
    }
    const spd=(i%2?-1:1)*(0.05-i*0.012);
    const holder=new THREE.Group();
    matAnim(m,(mm,t)=>{ mm.emissiveIntensity=0.85+Math.sin(t*0.9+i)*0.35; });
    g.add(holder);
    ring.userData.tick=t=>{ ring.rotation.z=t*spd; };
    animated.push(ring);
  }

  /* Ley light along every terrace edge the island has reached — the terraces
     stop being landscaping and start being circuitry.

     KEPT DIM ON PURPOSE. These ran at emissive 2.4 on the palest accent in the
     realm, which is several times over the bloom threshold — and the bloom is
     composited over the finished frame with no depth test, so the halo of a
     circuit at the back of the island washed straight over every roof standing
     in front of it. A tube 5cm across was erasing half a town. Nothing was
     wrong with the geometry: at an intensity that stays near the threshold the
     same lines read exactly as intended, as light inlaid in the ground, and
     the district behind them is legible again.

     The rule this realm has to live by, since it is the only one that runs
     emissive geometry THROUGH a town rather than parking it on a lamp post:
     a long light source must not also be a bright one. */
  for(let k=0;k<TIER_R.length;k++){
    const b=TIER_R[k]; if(b>=R)continue;
    const m=new THREE.MeshStandardMaterial({color:P.accent2,emissive:P.accent2,
      emissiveIntensity:0.55,roughness:0.2,transparent:true,opacity:0.8});
    const pts=[];
    const n=prof.length*2;
    for(let i=0;i<=n;i++){
      const a=i/n*TAU, rr=radiusAt(prof,a)*b*0.985;
      pts.push(new THREE.Vector3(Math.cos(a)*rr,tierY(b-1e-6)+0.27,Math.sin(a)*rr));
    }
    const line=meshOf(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),
      n,0.055,5,true),m,false,false);
    g.add(line);
    for(let q=0;q<3;q++){                 // a pulse running the circuit
      /* Dimmed with the line it runs on — three dozen of these across a realm
         were the other half of the wash. */
      const bead=meshOf(new THREE.SphereGeometry(0.13,8,7),glowMat(P.accent,0.9),false,false);
      bead.userData.tick=t=>{
        const u=((t*0.07+q/3+k*0.2)%1), a=u*TAU;
        const rr=radiusAt(prof,a)*b*0.985;
        bead.position.set(Math.cos(a)*rr,tierY(b-1e-6)+0.31,Math.sin(a)*rr);
      };
      g.add(bead); animated.push(bead);
    }
  }

  /* Shards of the island that never finished falling. Slow, heavy, and they
     turn — the clearest "this place does not obey gravity" signal available
     that costs almost nothing. */
  const rnd=rngOf(hash2(P.seed,17000));
  const n=clamp(3+Math.floor(sp.level*0.8),3,12);
  for(let i=0;i<n;i++){
    const shard=new THREE.Group();
    const size=lerp(0.4,1.1,rnd());
    const rock=meshOf(new THREE.DodecahedronGeometry(size,0),mat(P.rock,{rough:0.95}));
    rock.scale.y=lerp(0.5,0.9,rnd()); shard.add(rock);
    const cap=meshOf(new THREE.DodecahedronGeometry(size*0.92,0),
      mat(P.ground2,{rough:0.98}),false,false);
    cap.scale.y=0.3; cap.position.y=size*0.3; shard.add(cap);
    if(rnd()<0.6){
      const c=meshOf(new THREE.OctahedronGeometry(size*0.34),
        mat(P.accent,{emissive:P.accent,ei:0.9,rough:0.25,opacity:0.94}),false,false);
      c.scale.y=1.7; c.position.y=size*0.75; shard.add(c);
    }
    const rr=lerp(0.55,1.15,rnd())*R, y=lerp(-2.5,5.5,rnd());
    const spd=lerp(0.012,0.035,rnd())*(rnd()<0.5?1:-1), off=rnd()*TAU;
    const bob=lerp(0.2,0.6,rnd()), spin=lerp(0.05,0.16,rnd());
    shard.userData.tick=t=>{
      const w=t*spd+off;
      shard.position.set(Math.cos(w)*rr,y+Math.sin(t*0.35+off)*bob,Math.sin(w)*rr);
      shard.rotation.y=t*spin+off; shard.rotation.z=Math.sin(t*0.2+off)*0.12;
    };
    g.add(shard); animated.push(shard);
  }
  return g;
}

/* ------------------------------------------------- signatures, realm by realm
   The signature is the single most important object in a district: it is what
   makes a visitor say "oh, that one's the database one" without reading a
   label, and it unlocks at L3 so identity arrives before size does. Every one
   of them places its parts from the part's own index, never from the current
   count, so levelling up adds a piece instead of rearranging the set. */
function realmSignature(P,rnd,sp){
  const g=new THREE.Group(), s=1.2, GA=2.399963229728653;
  switch(P.sig){

  /* ---- THE FRAMEWORKS ------------------------------------------------- */
  case 'loom': {            // js_ts, css_design — a great spindle, wound as you read
    /* REPLACES the upright weaving frame, and then replaced a braided mast that
       was tried first. Both failures are worth keeping written down because
       they are the same failure: the frame was a rectangle of evenly spaced
       bars standing on a plane, which at world zoom is not a monument but a
       broken-image placeholder — and the braid, four helices crossing round an
       axis, was solid in principle and read as SCAFFOLDING in practice. At low
       poly and small scale an open lattice is noise. It only looked right in a
       narrow band of radius and rise, which is another way of saying it was
       going to look wrong on somebody's world.

       A spindle cannot degenerate, because it is solid at every size.

       And it earns its keep on the growth rule rather than on the shape. The
       SHAFT IS FULL HEIGHT FROM L3 — the same call the file already makes about
       spires, that verticality is a one-time event — so what your reading adds
       is THREAD, wound further up a spindle that was always this tall. A
       half-wound spindle and a full one are legible against each other at a
       glance, and neither one ever moved to make room for the other. */
    const H=5.6*s, y0=0.42*s;
    const bm=mat(P.wood,{rough:0.95});
    g.add(meshOf(new THREE.CylinderGeometry(s*0.86,s*0.98,y0,9),
      mat(P.stone,{rough:0.92})).translateY(y0/2));
    g.add(meshOf(new THREE.CylinderGeometry(0.10*s,0.13*s,H,7),bm)
      .translateY(y0+H/2));
    /* The whorl, and the point above it. Both sit on the SHAFT's top, which is
       fixed — so unlike a cap on the thread they never have to move. */
    g.add(meshOf(new THREE.CylinderGeometry(0.40*s,0.34*s,0.10*s,9),
      mat(P.metal,{metal:0.45,rough:0.4})).translateY(y0+H*0.94));
    g.add(meshOf(new THREE.ConeGeometry(0.11*s,0.42*s,7),
      mat(P.metal,{metal:0.45,rough:0.4})).translateY(y0+H+0.16*s));
    /* Thread. Many thin rings rather than a few fat ones — a short stack of
       tall coloured drums reads as a kebab, and it is the RING COUNT that makes
       the eye call it wound rather than stacked. Radius is a function of i and
       never of m, so winding on more thread cannot re-taper what is already
       there; it is the cop shape a real spindle builds, fattest at the base. */
    const m=clamp(4+sp.level*2,4,28), rh=H*0.030;
    const wf=[P.accent,P.accent2,P.bloom,P.roof2];
    for(let i=0;i<m;i++){
      const band=(i/3)|0, col=wf[band%4];
      const r=s*(0.62-0.26*clamp(i/28,0,1))+((i%2)?0.008*s:0);
      /* One band in four is lit, not all of them. The frame this replaced had
         every thread glowing and read as a lightbox at night; a single lit
         course through the wind is the same idea at a tenth the strength. */
      const mt=(band%4===2)?glowMat(col,1.15):mat(col,{rough:0.86});
      g.add(meshOf(new THREE.CylinderGeometry(r,r,rh*0.94,12),mt,
        band%4!==2,band%4!==2).translateY(y0+0.06*s+i*rh));
    }
    /* The shuttle works at the top of the wind, which is where the work
       actually is — so it climbs the spindle as the district grows without
       being told the level. */
    const shuttle=meshOf(boxG(0.34*s,0.10*s,0.14*s),
      mat(P.metal,{metal:0.5,rough:0.4}));
    const topY=y0+0.06*s+m*rh, topR=s*(0.62-0.26*clamp(m/28,0,1))+0.20*s;
    shuttle.userData.tick=t=>{
      const a=t*0.5;
      shuttle.position.set(Math.cos(a)*topR,topY+Math.sin(t*1.3)*0.09*s,
                           Math.sin(a)*topR);
      shuttle.rotation.y=-a;
    };
    g.add(shuttle); animated.push(shuttle);
    break; }

  case 'canopywalk': {      // android, ios — a ring walk around the great trunk
    const R=2.0*s;
    const bm=mat(P.wood,{rough:0.95});
    const n=clamp(8+sp.level,8,22);
    for(let i=0;i<n;i++){
      const a=i/22*TAU;
      const pl=meshOf(boxG(0.62,0.1,0.44),mat(P.stone,{rough:0.9}));
      pl.position.set(Math.cos(a)*R,1.5+Math.sin(a*2)*0.28,Math.sin(a)*R);
      pl.rotation.y=-a; g.add(pl);
      const post=meshOf(new THREE.CylinderGeometry(0.05,0.06,1.5,5),bm);
      post.position.set(Math.cos(a)*R,0.75,Math.sin(a)*R); g.add(post);
      const rail=meshOf(boxG(0.62,0.05,0.05),bm,false,false);
      rail.position.set(Math.cos(a)*R*1.12,1.85+Math.sin(a*2)*0.28,Math.sin(a)*R*1.12);
      rail.rotation.y=-a; g.add(rail);
      if(i%4===0){
        const l=meshOf(new THREE.SphereGeometry(0.1,7,6),glowMat(P.bloom,1.6),false,false);
        l.position.set(Math.cos(a)*R,2.05+Math.sin(a*2)*0.28,Math.sin(a)*R); g.add(l);
      }
    }
    for(let i=0;i<3;i++){
      const c=meshOf(new THREE.IcosahedronGeometry(1.5-i*0.35,1),
        mat(i%2?P.foliage:P.foliage2,{rough:0.98}));
      c.position.y=2.4+i*0.55; c.scale.y=0.45; g.add(c);
    }
    g.add(meshOf(new THREE.CylinderGeometry(0.34,0.6,2.5,8),mat(P.wood,{rough:0.96}))
      .translateY(1.25));
    break; }

  case 'greenhouse': {      // jvm, dotnet — rows of glowing seedbeds under glass
    const w=3.2*s, d=2.0*s, h=1.3*s;
    const glass=mat(P.bloom,{emissive:P.bloom,ei:0.32,opacity:0.93,rough:0.2,flat:false});
    const plinth=meshOf(boxG(w,h*0.4,d),mat(P.stone,{rough:0.92}));
    plinth.position.y=h*0.2; g.add(plinth);
    g.add(meshOf(boxG(w*0.98,h*0.62,d*0.98),glass,false,false)
      .translateY(h*0.71));
    const roof=gableRoof(w,d*1.06,d*0.42,glass);
    roof.position.y=h; g.add(roof);
    const bm=mat(P.wood,{rough:0.95});
    for(let i=0;i<5;i++){
      const rib=meshOf(boxG(0.06,h+d*0.55,0.06),bm);
      rib.position.set(lerp(-w/2,w/2,i/4),(h+d*0.55)/2,0); g.add(rib);
    }
    const rows=clamp(2+Math.floor(sp.level/3),2,4);
    for(let r=0;r<rows;r++){
      const z=lerp(-d*0.3,d*0.3,rows>1?r/(rows-1):0.5);
      const bed=meshOf(boxG(w*0.86,0.2,0.34),mat(P.stone2,{rough:0.9}));
      bed.position.set(0,0.1,z); g.add(bed);
      for(let i=0;i<7;i++){
        const sp2=meshOf(new THREE.ConeGeometry(0.08,0.3,5),
          glowMat(i%2?P.accent:P.accent2,1.2),false,false);
        sp2.position.set(lerp(-w*0.38,w*0.38,i/6),0.34,z);
        const ph=i+r;
        sp2.userData.tick=t=>{sp2.scale.y=1+Math.sin(t*1.4+ph)*0.14;};
        g.add(sp2); animated.push(sp2);
      }
    }
    break; }

  case 'wellspring': {      // php, ruby — a tiered fountain at the roots
    /* Rebuilt as a stepped fountain. The first version stacked a water disc, a
       ring of lily pads and a translucent jet within a tenth of a unit of each
       other, so the whole thing strobed as the depth buffer changed its mind. */
    const R=1.6*s;
    const kerb=meshOf(new THREE.CylinderGeometry(R,R*0.9,0.5,16),mat(P.stone,{rough:0.9}));
    kerb.position.y=0.25; g.add(kerb);
    const inner=meshOf(new THREE.CylinderGeometry(R*0.84,R*0.8,0.34,16),
      mat(P.stone2,{rough:0.9}));
    inner.position.y=0.3; g.add(inner);
    const lower=meshOf(new THREE.CircleGeometry(R*0.82,18),
      mat(P.liquid,{emissive:P.liquid,ei:0.4,rough:0.15,flat:false}),false,false);
    lower.rotation.x=-Math.PI/2; lower.position.y=0.47; g.add(lower);
    /* Pedestal and upper bowl — the vertical is what makes it read as a
       fountain rather than as a puddle with things in it. */
    const ped=meshOf(new THREE.CylinderGeometry(0.22*s,0.34*s,1.1*s,10),
      mat(P.stone,{rough:0.9}));
    ped.position.y=0.5+0.55*s; g.add(ped);
    const bowl=meshOf(new THREE.CylinderGeometry(0.8*s,0.4*s,0.32,14),
      mat(P.stone2,{rough:0.9}));
    bowl.position.y=0.5+1.1*s+0.16; g.add(bowl);
    const upper=meshOf(new THREE.CircleGeometry(0.72*s,14),
      mat(P.liquid,{emissive:P.liquid,ei:0.5,rough:0.15,flat:false}),false,false);
    upper.rotation.x=-Math.PI/2; upper.position.y=0.5+1.1*s+0.3; g.add(upper);
    const finial=meshOf(new THREE.IcosahedronGeometry(0.22*s,1),
      glowMat(P.accent,1.8),false,false);
    finial.position.y=0.5+1.1*s+0.62; g.add(finial);
    finial.userData.tick=t=>{finial.rotation.y=t*0.4;
      finial.material.emissiveIntensity=1.5+Math.sin(t*1.6)*0.4;};
    animated.push(finial);
    /* Four spouts arcing from the upper bowl into the lower one. Solid, small
       and well clear of every other surface. */
    for(let i=0;i<4;i++){
      const a=i/4*TAU+Math.PI/4;
      const sp2=meshOf(new THREE.CylinderGeometry(0.05,0.07,0.9*s,6),
        mat(P.liquid,{emissive:P.liquid,ei:0.9,rough:0.15,flat:false}),false,false);
      sp2.position.set(Math.cos(a)*0.78*s,0.5+1.1*s-0.3,Math.sin(a)*0.78*s);
      sp2.rotation.set(Math.sin(a)*0.24,0,-Math.cos(a)*0.24); g.add(sp2);
      const ripple=meshOf(new THREE.TorusGeometry(0.2,0.03,5,14),
        mat(P.liquid,{emissive:P.liquid,ei:0.8,transparent:true,opacity:0.7,rough:0.2}),
        false,false);
      ripple.rotation.x=-Math.PI/2;
      ripple.userData.tick=t=>{
        const u=((t*0.6+i/4)%1);
        ripple.position.set(Math.cos(a)*0.95*s,0.5,Math.sin(a)*0.95*s);
        ripple.scale.setScalar(0.4+u*2.2); ripple.material.opacity=0.6*(1-u);
      };
      g.add(ripple); animated.push(ripple);
    }
    /* Roots reaching in from outside, so it still belongs to a canopy realm. */
    for(let i=0;i<4;i++){
      const a=i*GA;
      const root=meshOf(new THREE.CylinderGeometry(0.1,0.18,1.7,6),mat(P.wood,{rough:0.96}));
      root.position.set(Math.cos(a)*R*1.2,0.75,Math.sin(a)*R*1.2);
      root.rotation.set(Math.sin(a)*0.45,0,-Math.cos(a)*0.45); g.add(root);
    }
    break; }

  /* ---- THE METAL FORGES ------------------------------------------------ */
  case 'bigwheel': {        // c_cpp, rust — a great wheel driven by molten flow
    const R=2.1*s;
    const mm=mat(P.metal,{metal:0.65,rough:0.4,env:1.1});
    const wheel=new THREE.Group(); wheel.position.y=R*0.9; g.add(wheel);
    wheel.add(meshOf(new THREE.TorusGeometry(R,0.1,7,26),mm,false,false));
    wheel.add(meshOf(new THREE.TorusGeometry(R*0.72,0.07,6,22),mm,false,false));
    const blades=12;
    for(let i=0;i<blades;i++){
      const a=i/blades*TAU;
      const sp2=meshOf(boxG(0.07,R*0.9,0.07),mm,false,false);
      sp2.position.set(Math.cos(a)*R*0.5,Math.sin(a)*R*0.5,0); sp2.rotation.z=a+Math.PI/2;
      wheel.add(sp2);
      const bl=meshOf(boxG(0.16,0.5,0.5),mat(P.stone,{rough:0.9}),false,false);
      bl.position.set(Math.cos(a)*R*0.92,Math.sin(a)*R*0.92,0); bl.rotation.z=a;
      wheel.add(bl);
      const hot=meshOf(boxG(0.1,0.34,0.34),glowMat(P.liquid,1.6),false,false);
      hot.position.set(Math.cos(a)*R*0.9,Math.sin(a)*R*0.9,0.2); hot.rotation.z=a;
      wheel.add(hot);
    }
    wheel.add(meshOf(new THREE.CylinderGeometry(0.2,0.2,0.6,10),mm,false,false)
      .rotateX(Math.PI/2));
    wheel.userData.tick=t=>{wheel.rotation.z=-t*0.3;};
    animated.push(wheel);
    for(const sx of [-1,1]){
      const fr=meshOf(boxG(0.24,R*1.9,0.24),mat(P.stone,{rough:0.92}));
      fr.position.set(sx*0.45,R*0.95,0); g.add(fr);
    }
    /* The race the wheel runs in — molten, and it lights the whole monument. */
    const race=meshOf(boxG(R*2.6,0.16,0.7),
      mat(P.liquid,{emissive:P.liquid,ei:1.8,rough:0.25,flat:false}),false,false);
    race.position.y=0.14; g.add(race);
    for(let k=0;k<5;k++){
      const d=meshOf(new THREE.SphereGeometry(0.12,7,6),glowMat(P.accent,2.2),false,false);
      d.userData.tick=t=>{
        const u=(t*0.4+k/5)%1;
        d.position.set(lerp(-R*1.3,R*1.3,u),0.26,0);
      };
      g.add(d); animated.push(d);
    }
    break; }

  case 'anvilyard': {       // linux_os — a ring of anvils, struck in sequence
    const R=1.9*s;
    const n=clamp(4+Math.floor(sp.level/2),4,9);
    for(let i=0;i<n;i++){
      const a=i*GA;
      const block=meshOf(new THREE.CylinderGeometry(0.24,0.3,0.5,7),mat(P.wood,{rough:0.96}));
      block.position.set(Math.cos(a)*R,0.25,Math.sin(a)*R); g.add(block);
      const anv=meshOf(boxG(0.62,0.2,0.28),
        mat(P.metal,{metal:0.6,rough:0.45}));
      anv.position.set(Math.cos(a)*R,0.6,Math.sin(a)*R); anv.rotation.y=-a; g.add(anv);
      const horn=meshOf(new THREE.ConeGeometry(0.11,0.3,6),
        mat(P.metal,{metal:0.6,rough:0.45}));
      horn.rotation.z=-Math.PI/2; horn.position.set(Math.cos(a)*R+Math.cos(-a)*0.4,0.6,
        Math.sin(a)*R-Math.sin(-a)*0.4); horn.rotation.y=-a; g.add(horn);
      /* A hammer that falls, and a spark burst on the beat. */
      const ham=meshOf(boxG(0.16,0.3,0.16),
        mat(P.metal,{metal:0.6,rough:0.45}));
      const spark=meshOf(new THREE.IcosahedronGeometry(0.16,0),glowMat(P.accent,2.6),false,false);
      spark.position.set(Math.cos(a)*R,0.74,Math.sin(a)*R);
      const off=i/n;
      ham.userData.tick=t=>{
        const u=((t*0.7+off)%1);
        const drop=u<0.5?1-Math.pow(u*2,2):(u-0.5)*2;
        ham.position.set(Math.cos(a)*R,0.86+drop*0.65,Math.sin(a)*R);
        const hit=u<0.08?1-u/0.08:0;
        spark.scale.setScalar(0.2+hit*1.5);
        spark.material.emissiveIntensity=hit*3;
      };
      g.add(ham,spark); animated.push(ham);
    }
    const brz=meshOf(new THREE.CylinderGeometry(0.4,0.28,0.4,9),
      mat(P.metal,{metal:0.55,rough:0.5}));
    brz.position.y=0.2; g.add(brz);
    const coals=meshOf(new THREE.CircleGeometry(0.36,10),glowMat(P.liquid,2.2),false,false);
    coals.rotation.x=-Math.PI/2; coals.position.y=0.41; g.add(coals);
    matAnim(coals.material,(m,t)=>{ m.emissiveIntensity=1.8+Math.sin(t*2.1)*0.6; });
    break; }

  case 'crucible': {        // embedded, gamedev — a crucible pouring on gimbals
    const R=1.3*s;
    for(const sx of [-1,1]){
      const col=meshOf(boxG(0.26,2.3,0.26),mat(P.stone,{rough:0.92}));
      col.position.set(sx*R,1.15,0); g.add(col);
    }
    const yoke=meshOf(boxG(R*2.2,0.16,0.2),
      mat(P.metal,{metal:0.6,rough:0.45}));
    yoke.position.y=2.3; g.add(yoke);
    const pot=new THREE.Group(); pot.position.y=1.85; g.add(pot);
    pot.add(meshOf(new THREE.CylinderGeometry(0.62,0.44,0.8,10),
      mat(P.metal,{metal:0.5,rough:0.55}),false,false));
    const melt=meshOf(new THREE.CircleGeometry(0.56,12),glowMat(P.liquid,2.4),false,false);
    melt.rotation.x=-Math.PI/2; melt.position.y=0.32; pot.add(melt);
    pot.userData.tick=t=>{
      const c=(t*0.22)%1;
      pot.rotation.z=c<0.5?0:-Math.sin((c-0.5)*Math.PI*2)*0.85;
    };
    animated.push(pot);
    /* The pour: a molten stream that only exists while the pot is tipped. */
    const pour=meshOf(new THREE.CylinderGeometry(0.09,0.14,1.5,7),
      mat(P.liquid,{emissive:P.liquid,ei:2.2,opacity:0.85,flat:false}),false,false);
    pour.position.set(-0.75,1.1,0); g.add(pour);
    const mould=meshOf(boxG(0.9,0.3,0.7),mat(P.stone2,{rough:0.92}));
    mould.position.set(-0.75,0.15,0); g.add(mould);
    const ingot=meshOf(boxG(0.7,0.14,0.5),glowMat(P.liquid,1.6),false,false);
    ingot.position.set(-0.75,0.34,0); g.add(ingot);
    pour.userData.tick=t=>{
      const c=(t*0.22)%1, on=c>0.55&&c<0.9;
      pour.visible=on; ingot.material.emissiveIntensity=on?2.0:0.5+Math.sin(t)*0.2;
    };
    animated.push(pour);
    break; }

  case 'pipeorgan': {       // niche_langs — a bank of pipes venting steam
    const n=clamp(5+sp.level,5,16);
    const mm=mat(P.metal,{metal:0.6,rough:0.4,env:1.1});
    for(let i=0;i<16;i++){
      if(i>=n)break;
      const x=(i-7.5)*0.32*s;
      const h=(1.2+((i*0.37)%1)*2.2)*s;
      const pipe=meshOf(new THREE.CylinderGeometry(0.13*s,0.13*s,h,8),mm);
      pipe.position.set(x,h/2,0); g.add(pipe);
      const cap=meshOf(new THREE.CylinderGeometry(0.17*s,0.14*s,0.12,8),mm,false,false);
      cap.position.set(x,h,0); g.add(cap);
      const glow=meshOf(new THREE.CylinderGeometry(0.1*s,0.1*s,0.1,8),
        glowMat(P.accent,1.6),false,false);
      glow.position.set(x,0.24,0); g.add(glow);
      for(let k=0;k<1;k++){
        const st=meshOf(new THREE.IcosahedronGeometry(0.16,0),
          mat(P.rock,{opacity:0.26,flat:false,rough:1}),false,false);
        st.userData.tick=t=>{
          const u=((t*0.3+k*0.5+i*0.13)%1);
          st.position.set(x,h+0.2+u*1.6,0);
          st.scale.setScalar(0.5+u*1.6); st.material.opacity=0.3*(1-u);
        };
        g.add(st); animated.push(st);
      }
    }
    const base=meshOf(boxG(5.4*s,0.4,0.9*s),mat(P.stone,{rough:0.92}));
    base.position.y=0.2; g.add(base);
    break; }

  /* ---- THE SHIPYARDS --------------------------------------------------- */
  case 'drydock': {         // k8s, cloud — a hull in a cradle, under scaffold
    const L=4.4*s, W=1.5*s;
    const dock=meshOf(boxG(L+0.8,0.5,W+1.0),mat(P.stone,{rough:0.9}));
    dock.position.y=-0.15; g.add(dock);
    const basin=meshOf(boxG(L+0.2,0.1,W+0.4),
      mat(P.liquid,{emissive:P.liquid,ei:0.35,opacity:0.7,flat:false,rough:0.12}),false,false);
    basin.position.y=0.06; g.add(basin);
    const hull=meshOf(new THREE.CylinderGeometry(W*0.42,W*0.55,L,9,1,false,0,Math.PI),
      mat(P.accent,{rough:0.8}));
    hull.rotation.z=Math.PI/2; hull.rotation.x=Math.PI; hull.position.y=W*0.6; g.add(hull);
    const deck=meshOf(boxG(L*0.96,0.12,W*1.02),mat(P.stone2,{rough:0.88}));
    deck.position.y=W*0.6; g.add(deck);
    const house=meshOf(boxG(L*0.2,0.5,W*0.7),mat(P.stone,{rough:0.9}));
    house.position.set(-L*0.28,W*0.6+0.31,0); g.add(house);
    const funnel=meshOf(new THREE.CylinderGeometry(0.16,0.19,0.5,8),mat(P.roof,{rough:0.8}));
    funnel.position.set(-L*0.28,W*0.6+0.8,0); g.add(funnel);
    const mm=mat(P.metal,{metal:0.5,rough:0.55});
    const bays=clamp(2+Math.floor(sp.level/3),2,6);
    for(let i=0;i<bays;i++){
      const x=lerp(-L*0.42,L*0.42,bays>1?i/(bays-1):0.5);
      for(const sz of [-1,1]){
        const leg=meshOf(new THREE.CylinderGeometry(0.05,0.05,W*1.5,5),mm);
        leg.position.set(x,W*0.75,sz*W*0.75); g.add(leg);
      }
      const beam2=meshOf(boxG(0.06,0.06,W*1.6),mm,false,false);
      beam2.position.set(x,W*1.5,0); g.add(beam2);
      const l=meshOf(new THREE.SphereGeometry(0.08,6,5),glowMat(P.bloom,1.5),false,false);
      l.position.set(x,W*1.45,W*0.75); g.add(l);
    }
    for(let k=0;k<4;k++){          // welding flashes along the hull
      const f=meshOf(new THREE.IcosahedronGeometry(0.14,0),glowMat(P.bloom,3),false,false);
      const x=lerp(-L*0.4,L*0.4,(k*0.31)%1), z=(k%2?1:-1)*W*0.5;
      f.position.set(x,W*0.35,z);
      f.userData.tick=t=>{
        const u=((t*0.9+k*0.37)%1);
        const on=u<0.12?1-u/0.12:0;
        f.scale.setScalar(0.2+on*1.6); f.material.emissiveIntensity=on*3.4;
      };
      g.add(f); animated.push(f);
    }
    break; }

  case 'crane': {           // ci_devex, distributed_arch — a straddle gantry
    const span=4.2*s, h=3.0*s;
    const mm=mat(P.metal,{metal:0.55,rough:0.5});
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const leg=meshOf(new THREE.CylinderGeometry(0.09,0.11,h,6),mm);
      leg.position.set(sx*span/2,h/2,sz*0.6); g.add(leg);
      const foot=meshOf(boxG(0.4,0.16,0.5),mat(P.roof,{rough:0.8}));
      foot.position.set(sx*span/2,0.08,sz*0.6); g.add(foot);
    }
    for(const sz of [-1,1]){
      const beam2=meshOf(boxG(span+0.6,0.2,0.16),mm);
      beam2.position.set(0,h,sz*0.6); g.add(beam2);
    }
    for(let i=0;i<7;i++){          // lattice web
      const x=lerp(-span/2,span/2,i/6);
      const d=meshOf(boxG(0.06,0.06,1.3),mm,false,false);
      d.position.set(x,h,0); g.add(d);
    }
    const trolley=new THREE.Group(); trolley.position.y=h-0.2; g.add(trolley);
    trolley.add(meshOf(boxG(0.5,0.24,0.9),mm,false,false));
    const line=meshOf(new THREE.CylinderGeometry(0.02,0.02,1,4),mm,false,false);
    const box=meshOf(boxG(0.8,0.42,0.5),
      mat(P.accent,{rough:0.8}));
    trolley.add(line,box);
    trolley.userData.tick=t=>{
      trolley.position.x=Math.sin(t*0.35)*span*0.42;
      const drop=1.1+Math.sin(t*0.7)*0.8;
      line.position.y=-drop/2; line.scale.y=drop;
      box.position.y=-drop-0.2;
    };
    animated.push(trolley);
    /* Rows of stacked boxes waiting under the gantry — the yard reads as busy
       and the colours give the district a second identity channel. */
    const rows=clamp(2+Math.floor(sp.level/2.5),2,7);
    const cols=[P.accent,P.accent2,P.roof2,P.bloom];
    for(let i=0;i<rows;i++){
      for(let k=0;k<1+(i%2);k++){
        const c=meshOf(boxG(0.8,0.4,0.5),
          mat(cols[(i+k)%cols.length],{rough:0.8}));
        c.position.set(lerp(-span*0.38,span*0.38,rows>1?i/(rows-1):0.5),0.2+k*0.42,-1.2);
        g.add(c);
      }
    }
    break; }

  case 'lighthouse': {      // observability, selfhost — a beacon on a mole
    const h=4.2*s;
    const mole=meshOf(new THREE.CylinderGeometry(1.1,1.3,0.5,12),mat(P.stone,{rough:0.9}));
    mole.position.y=0.25; g.add(mole);
    for(let i=0;i<4;i++){
      const y0=0.5+h*i/4, sh=h/4;
      const r0=lerp(0.5,0.26,i/4), r1=lerp(0.5,0.26,(i+1)/4);
      const seg=meshOf(new THREE.CylinderGeometry(r1,r0,sh,12),
        mat(i%2?P.stone2:P.accent,{rough:0.86}));
      seg.position.y=y0+sh/2; g.add(seg);
    }
    const gal=meshOf(new THREE.CylinderGeometry(0.44,0.36,0.12,12),
      mat(P.metal,{metal:0.5,rough:0.5}));
    gal.position.y=0.5+h; g.add(gal);
    const lamp=meshOf(new THREE.CylinderGeometry(0.26,0.26,0.44,10),
      mat(P.bloom,{emissive:P.bloom,ei:1.8,opacity:0.8,flat:false,rough:0.1}),false,false);
    lamp.position.y=0.5+h+0.3; g.add(lamp);
    const cap=meshOf(new THREE.ConeGeometry(0.36,0.36,10),mat(P.roof,{metal:0.4,rough:0.5}));
    cap.position.y=0.5+h+0.7; g.add(cap);
    const hold=new THREE.Group(); hold.position.y=0.5+h+0.3; g.add(hold);
    const beam=meshOf(new THREE.ConeGeometry(0.5,8,4,1,true),
      mat(P.bloom,{emissive:P.bloom,ei:1.2,opacity:0.15,flat:false,
        side:THREE.DoubleSide,rough:0.1}),false,false);
    beam.rotation.z=Math.PI/2; beam.position.set(4,0,0); hold.add(beam);
    hold.userData.tick=t=>{hold.rotation.y=t*0.55;}; animated.push(hold);
    const n=clamp(2+Math.floor(sp.level/3),2,6);
    for(let i=0;i<n;i++){                 // buoys bobbing around the mole
      const a=i*GA, rr=1.7+((i*0.41)%1)*0.9;
      const b=meshOf(new THREE.ConeGeometry(0.16,0.4,7),mat(P.accent2,{rough:0.8}));
      const l=meshOf(new THREE.SphereGeometry(0.08,6,5),glowMat(P.accent2,1.8),false,false);
      b.position.set(Math.cos(a)*rr,0.2,Math.sin(a)*rr);
      l.position.set(Math.cos(a)*rr,0.44,Math.sin(a)*rr);
      const ph=i;
      b.userData.tick=t=>{
        const y=0.2+Math.sin(t*1.4+ph)*0.07;
        b.position.y=y; l.position.y=y+0.24;
        b.rotation.z=Math.sin(t*1.1+ph)*0.14;
        l.material.emissiveIntensity=(Math.sin(t*2+ph)>0.4)?2.2:0.3;
      };
      g.add(b,l); animated.push(b);
    }
    break; }

  case 'containers': {      // go, databases — a stacked yard with a reach truck
    const cols=[P.accent,P.accent2,P.roof2,P.bloom];
    const stacks=clamp(4+sp.level,4,16);
    for(let i=0;i<16;i++){
      if(i>=stacks)break;
      const a=i*GA, rr=Math.sqrt((i+0.5)/16)*2.3*s;
      const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
      const hgt=1+((i*0.53)%1<0.5?1:2);
      for(let k=0;k<hgt;k++){
        const c=meshOf(boxG(1.0,0.42,0.6),
          mat(cols[(i+k)%cols.length],{rough:0.8}));
        c.position.set(x,0.21+k*0.44,z); c.rotation.y=-a+((i%2)?Math.PI/2:0);
        g.add(c);
        for(let r=0;r<3;r++){        // corrugation ribs
          const rb=meshOf(boxG(0.04,0.36,0.62),
            mat(cols[(i+k)%cols.length],{rough:0.9}),false,false);
          rb.position.set(x+Math.cos(c.rotation.y)*lerp(-0.3,0.3,r/2),
            0.21+k*0.44,z-Math.sin(c.rotation.y)*lerp(-0.3,0.3,r/2));
          rb.rotation.y=c.rotation.y; g.add(rb);
        }
      }
    }
    const mm=mat(P.metal,{metal:0.5,rough:0.5});
    const truck=new THREE.Group(); g.add(truck);
    truck.add(meshOf(boxG(0.8,0.42,0.5),mat(P.roof,{rough:0.8}),false,false));
    const mast=meshOf(boxG(0.1,1.6,0.1),mm,false,false);
    mast.position.set(0.4,0.8,0); truck.add(mast);
    const fork=meshOf(boxG(0.5,0.07,0.44),mm,false,false);
    truck.add(fork);
    truck.userData.tick=t=>{
      const w=t*0.25;
      truck.position.set(Math.cos(w)*3.0*s,0.2,Math.sin(w)*3.0*s);
      truck.rotation.y=-w+Math.PI/2;
      fork.position.set(0.55,0.2+Math.abs(Math.sin(t*0.6))*1.0,0);
    };
    animated.push(truck);
    break; }

  /* ---- THE BASTION ----------------------------------------------------- */
  case 'keep': {            // sec_appsec — the inner keep behind its own wall
    const kw=2.0*s, kh=3.2*s;
    g.add(meshOf(boxG(kw,kh,kw*0.9),mat(P.stone,{rough:0.94}))
      .translateY(kh/2));
    for(let e=0;e<4;e++) for(let i=0;i<5;i++){
      const u=(i+0.5)/5-0.5;
      const m=meshOf(boxG(0.22,0.32,0.18),mat(P.stone2,{rough:0.94}));
      const x=e<2?u*kw:(e===2?kw/2:-kw/2), z=e<2?(e?kw*0.45:-kw*0.45):u*kw*0.9;
      m.position.set(x,kh+0.16,z); g.add(m);
    }
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const th=kh*1.2;
      const t=meshOf(new THREE.CylinderGeometry(0.28,0.32,th,8),mat(P.stone2,{rough:0.94}));
      t.position.set(sx*kw*0.5,th/2,sz*kw*0.45); g.add(t);
      const c=meshOf(new THREE.ConeGeometry(0.42,0.66,8),mat(P.roof,{rough:0.65}));
      c.position.set(sx*kw*0.5,th+0.33,sz*kw*0.45); g.add(c);
      const l=meshOf(new THREE.SphereGeometry(0.08,6,5),glowMat(P.accent,1.6),false,false);
      l.position.set(sx*kw*0.5,th-0.3,sz*kw*0.45+sz*0.3); g.add(l);
    }
    /* A curtain wall ring with a gatehouse, so the keep reads as defended. */
    const R=2.9*s, n=Math.round(R*7);
    for(let i=0;i<n;i++){
      const a=i/n*TAU;
      if(Math.abs(((a+Math.PI)%TAU)-Math.PI)<0.34)continue;   // the gate gap
      const w=meshOf(boxG(0.3,0.9,R*TAU/n*1.15),mat(P.stone2,{rough:0.94}));
      w.position.set(Math.cos(a)*R,0.45,Math.sin(a)*R); w.rotation.y=-a; g.add(w);
      if(i%2===0){
        const m=meshOf(boxG(0.28,0.26,0.22),mat(P.stone,{rough:0.94}));
        m.position.set(Math.cos(a)*R,1.03,Math.sin(a)*R); m.rotation.y=-a; g.add(m);
      }
    }
    for(const s2 of [-1,1]){
      const t=meshOf(new THREE.CylinderGeometry(0.32,0.36,1.6,8),mat(P.stone,{rough:0.94}));
      const a=s2*0.42;
      t.position.set(Math.cos(a)*R,0.8,Math.sin(a)*R); g.add(t);
      const c=meshOf(new THREE.ConeGeometry(0.44,0.5,8),mat(P.roof,{rough:0.65}));
      c.position.set(Math.cos(a)*R,1.85,Math.sin(a)*R); g.add(c);
    }
    break; }

  case 'vault': {           // sec_crypto — a vault door with turning tumblers
    const R=1.9*s;
    const frame=meshOf(new THREE.CylinderGeometry(R*1.15,R*1.15,0.5,20),
      mat(P.stone,{rough:0.92}));
    frame.rotation.x=Math.PI/2; frame.position.y=R*0.95; g.add(frame);
    const door=meshOf(new THREE.CylinderGeometry(R,R,0.3,20),
      mat(P.metal,{metal:0.7,rough:0.3,env:1.1}));
    door.rotation.x=Math.PI/2; door.position.set(0,R*0.95,0.2); g.add(door);
    for(let i=0;i<3;i++){
      const rr=R*(0.78-i*0.22);
      const ring=meshOf(new THREE.TorusGeometry(rr,0.06,6,24),
        mat(P.metal,{metal:0.7,rough:0.3,env:1.1}),false,false);
      ring.position.set(0,R*0.95,0.38);
      const sp2=(i%2?-1:1)*(0.3-i*0.07);
      ring.userData.tick=t=>{ring.rotation.z=t*sp2;};
      g.add(ring); animated.push(ring);
      for(let k=0;k<6;k++){
        const a=k/6*TAU;
        const pin=meshOf(boxG(0.1,0.22,0.1),glowMat(P.accent,1.4),false,false);
        pin.position.set(Math.cos(a)*rr,R*0.95+Math.sin(a)*rr,0.42);
        const sp3=sp2;
        pin.userData.tick=t=>{
          const w=a+t*sp3;
          pin.position.set(Math.cos(w)*rr,R*0.95+Math.sin(w)*rr,0.42);
        };
        g.add(pin); animated.push(pin);
      }
    }
    const hub=meshOf(new THREE.CylinderGeometry(0.26,0.26,0.5,10),
      mat(P.metal,{metal:0.7,rough:0.3,env:1.1}));
    hub.rotation.x=Math.PI/2; hub.position.set(0,R*0.95,0.5); g.add(hub);
    for(let i=0;i<4;i++){
      const a=i/4*TAU+Math.PI/4;
      const spoke=meshOf(boxG(0.6,0.1,0.1),
        mat(P.metal,{metal:0.7,rough:0.3}),false,false);
      spoke.position.set(Math.cos(a)*0.3,R*0.95+Math.sin(a)*0.3,0.62);
      spoke.rotation.z=a; g.add(spoke);
    }
    const step=meshOf(boxG(R*2.6,0.3,1.2),mat(P.stone2,{rough:0.92}));
    step.position.set(0,0.15,0.9); g.add(step);
    break; }

  case 'watchfire': {       // sec_threats — a signal fire on a ring of posts
    const R=2.2*s;
    const n=clamp(4+Math.floor(sp.level/2),4,9);
    for(let i=0;i<n;i++){
      const a=i*GA;
      const post=meshOf(new THREE.CylinderGeometry(0.14,0.18,1.5,7),mat(P.stone2,{rough:0.94}));
      post.position.set(Math.cos(a)*R,0.75,Math.sin(a)*R); g.add(post);
      const bowl=meshOf(new THREE.CylinderGeometry(0.3,0.16,0.24,8),
        mat(P.metal,{metal:0.55,rough:0.5}));
      bowl.position.set(Math.cos(a)*R,1.6,Math.sin(a)*R); g.add(bowl);
      for(let k=0;k<2;k++){
        const f=meshOf(new THREE.ConeGeometry(0.16,0.42,5),glowMat(P.accent,2.2),false,false);
        f.position.set(Math.cos(a)*R,1.9,Math.sin(a)*R);
        const ph=i*0.7+k;
        f.userData.tick=t=>{
          f.scale.set(1+Math.sin(t*6+ph)*0.22,1+Math.sin(t*7+ph)*0.3,1);
          f.position.y=1.9+Math.sin(t*5+ph)*0.05;
        };
        g.add(f); animated.push(f);
      }
    }
    const pyre=meshOf(new THREE.CylinderGeometry(0.7,0.95,0.8,9),mat(P.stone,{rough:0.94}));
    pyre.position.y=0.4; g.add(pyre);
    for(let i=0;i<5;i++){
      const log=meshOf(new THREE.CylinderGeometry(0.09,0.09,1.3,6),mat(P.wood,{rough:0.96}));
      const a=i/5*TAU;
      log.position.set(Math.cos(a)*0.22,1.2,Math.sin(a)*0.22);
      log.rotation.set(Math.cos(a)*0.42,0,-Math.sin(a)*0.42); g.add(log);
    }
    for(let k=0;k<4;k++){
      const f=meshOf(new THREE.ConeGeometry(0.4,1.2,6),glowMat(P.accent2,2.4),false,false);
      f.position.y=1.6;
      f.userData.tick=t=>{
        f.scale.set(1+Math.sin(t*4+k)*0.2,1+Math.sin(t*5+k*1.3)*0.28,1);
        f.rotation.y=t*0.4+k;
        f.material.emissiveIntensity=2.0+Math.sin(t*6+k)*0.7;
      };
      g.add(f); animated.push(f);
    }
    for(let k=0;k<6;k++){          // sparks off the pyre
      const s2=meshOf(new THREE.IcosahedronGeometry(0.06,0),glowMat(P.accent,2.4),false,false);
      s2.userData.tick=t=>{
        const u=((t*0.4+k/6)%1);
        s2.position.set(Math.sin(u*6+k)*0.5,1.8+u*3.4,Math.cos(u*5+k)*0.5);
        s2.material.emissiveIntensity=2.4*(1-u);
      };
      g.add(s2); animated.push(s2);
    }
    break; }

  /* ---- THE ARTISAN'S QUARTER ------------------------------------------- */
  case 'clocktower': {      // career, eng_mgmt — the hour tower on its plinth
    const t=quarterTower(P,rnd,4.6*s,true);
    g.add(t);
    const plinth=meshOf(boxG(2.2*s,0.4,2.2*s),mat(P.stone2,{rough:0.92}));
    plinth.position.y=0.2; g.add(plinth);
    t.position.y=0.4;
    for(let i=0;i<4;i++){
      const a=i/4*TAU+Math.PI/4;
      const b=meshOf(boxG(0.7,0.2,0.3),mat(P.wood,{rough:0.95}));
      b.position.set(Math.cos(a)*1.5*s,0.5,Math.sin(a)*1.5*s); b.rotation.y=-a; g.add(b);
      const l=postLamp(P,rnd,'iron');
      l.position.set(Math.cos(a)*2.1*s,0.4,Math.sin(a)*2.1*s); g.add(l);
    }
    break; }

  case 'market': {          // industry_news, other — a square of striped stalls
    const R=2.2*s;
    const floor=meshOf(new THREE.CylinderGeometry(R*1.15,R*1.15,0.16,16),
      mat(P.stone2,{rough:0.92}));
    floor.position.y=0.08; g.add(floor);
    const n=clamp(3+Math.floor(sp.level/1.5),3,10);
    for(let i=0;i<n;i++){
      const a=i*GA, rr=Math.sqrt((i+0.5)/10)*R;
      const st=realmFeature(P,rngOf(hash2(P.seed,4400+i)),'stall');
      st.position.set(Math.cos(a)*rr,0.16,Math.sin(a)*rr);
      st.rotation.y=-a; st.scale.setScalar(1.15); g.add(st);
    }
    /* A well at the centre, because every market square has one. */
    const well=meshOf(new THREE.CylinderGeometry(0.5,0.55,0.5,12),mat(P.stone,{rough:0.92}));
    well.position.y=0.4; g.add(well);
    const water=meshOf(new THREE.CircleGeometry(0.44,12),
      mat(P.liquid,{emissive:P.liquid,ei:0.5,opacity:0.85,flat:false}),false,false);
    water.rotation.x=-Math.PI/2; water.position.y=0.58; g.add(water);
    for(const sx of [-1,1]){
      const p=meshOf(new THREE.CylinderGeometry(0.05,0.05,1.2,5),mat(P.wood));
      p.position.set(sx*0.42,1.05,0); g.add(p);
    }
    const roof=meshOf(new THREE.ConeGeometry(0.75,0.45,4),mat(P.roof,{rough:0.75}));
    roof.rotation.y=Math.PI/4; roof.position.y=1.85; g.add(roof);
    const bucket=meshOf(new THREE.CylinderGeometry(0.11,0.13,0.2,7),mat(P.wood));
    g.add(bucket);
    bucket.userData.tick=t=>{bucket.position.y=1.0+Math.sin(t*0.5)*0.35;};
    animated.push(bucket);
    break; }

  case 'workshop': {        // devtools, software_craft — an open craft yard
    const w=3.2*s, d=2.2*s, h=1.4*s;
    const floor=meshOf(boxG(w,0.16,d),mat(P.stone2,{rough:0.92}));
    floor.position.y=0.08; g.add(floor);
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      const p=meshOf(new THREE.CylinderGeometry(0.09,0.11,h,7),mat(P.wood,{rough:0.95}));
      p.position.set(sx*w*0.44,h/2,sz*d*0.42); g.add(p);
    }
    const roof=gableRoof(w*1.1,d*1.1,d*0.42,mat(P.roof,{rough:0.75}));
    roof.position.y=h; g.add(roof);
    /* A grindstone that turns, and a bench of tools that catch the light. */
    const stand=meshOf(boxG(0.7,0.5,0.5),mat(P.wood,{rough:0.95}));
    stand.position.set(-w*0.26,0.35,0); g.add(stand);
    const stone=meshOf(new THREE.CylinderGeometry(0.42,0.42,0.16,16),
      mat(P.cliffDark,{rough:0.9}));
    stone.rotation.x=Math.PI/2; stone.position.set(-w*0.26,0.78,0.2); g.add(stone);
    stone.userData.tick=t=>{stone.rotation.y=t*2.2;};
    animated.push(stone);
    const spark=meshOf(new THREE.IcosahedronGeometry(0.12,0),glowMat(P.accent,2.4),false,false);
    spark.position.set(-w*0.26,0.98,0.3); g.add(spark);
    spark.userData.tick=t=>{
      const u=(t*1.4)%1, on=u<0.3?1-u/0.3:0;
      spark.scale.setScalar(0.2+on*1.4); spark.material.emissiveIntensity=on*3;
    };
    animated.push(spark);
    const bench=meshOf(boxG(w*0.5,0.14,0.6),mat(P.wood,{rough:0.95}));
    bench.position.set(w*0.2,0.68,0); g.add(bench);
    for(const sx of [-1,1]){
      const l=meshOf(boxG(0.1,0.6,0.1),mat(P.wood,{rough:0.95}));
      l.position.set(w*0.2+sx*w*0.2,0.3,0); g.add(l);
    }
    const tools=clamp(3+sp.level,3,10);
    for(let i=0;i<tools;i++){
      const tl=meshOf(boxG(0.06,0.34,0.06),
        mat(i%2?P.metal:P.accent,{metal:0.5,rough:0.45}),false,false);
      tl.position.set(w*0.2+((i*0.37)%1-0.5)*w*0.45,0.92,-0.22);
      tl.rotation.z=((i*0.61)%1-0.5)*0.4; g.add(tl);
    }
    const lamp=meshOf(new THREE.SphereGeometry(0.14,8,7),glowMat(P.bloom,1.8),false,false);
    lamp.position.set(0,h-0.2,0); g.add(lamp);
    break; }

  case 'library': {         // cs_fundamentals, git_vcs — a reading rotunda
    const R=1.9*s, h=1.9*s;
    const n=12;
    for(let i=0;i<n;i++){
      const a=i/n*TAU;
      const c=meshOf(new THREE.CylinderGeometry(0.12,0.14,h,8),mat(P.stone,{rough:0.9}));
      c.position.set(Math.cos(a)*R,h/2,Math.sin(a)*R); g.add(c);
    }
    const ring=meshOf(new THREE.CylinderGeometry(R*1.18,R*1.18,0.24,18),
      mat(P.stone2,{rough:0.9}));
    ring.position.y=h+0.12; g.add(ring);
    const dome=meshOf(new THREE.SphereGeometry(R*1.05,18,10,0,TAU,0,Math.PI/2),
      mat(P.roof,{rough:0.65,flat:false}));
    dome.position.y=h+0.2; dome.scale.y=0.72; g.add(dome);
    const fin=meshOf(new THREE.IcosahedronGeometry(0.2,1),glowMat(P.accent,1.9),false,false);
    fin.position.y=h+0.2+R*0.78; g.add(fin);
    fin.userData.tick=t=>{fin.rotation.y=t*0.4;
      fin.position.y=h+0.2+R*0.78+Math.sin(t*1.1)*0.05;};
    animated.push(fin);
    /* Stacks inside, and books circling the reading floor. */
    const stacks=clamp(3+Math.floor(sp.level/2),3,8);
    for(let i=0;i<stacks;i++){
      const a=i*GA, rr=R*0.55;
      const sh=meshOf(boxG(0.9,1.0,0.28),mat(P.wood,{rough:0.95}));
      sh.position.set(Math.cos(a)*rr,0.5,Math.sin(a)*rr); sh.rotation.y=-a; g.add(sh);
      for(let k=0;k<3;k++){
        const b=meshOf(boxG(0.8,0.05,0.3),
          glowMat(k%2?P.accent:P.accent2,0.8),false,false);
        b.position.set(Math.cos(a)*rr,0.25+k*0.3,Math.sin(a)*rr); b.rotation.y=-a; g.add(b);
      }
    }
    for(let i=0;i<5;i++){
      const bk=meshOf(boxG(0.3,0.06,0.22),mat(P.bloom),false,false);
      const rr=R*0.75, off=i*1.25, sp2=0.3+i*0.05;
      bk.userData.tick=t=>{
        const w=t*sp2+off;
        bk.position.set(Math.cos(w)*rr,h*0.72+Math.sin(t*1.2+off)*0.2,Math.sin(w)*rr);
        bk.rotation.set(0.3,w,Math.sin(t+off)*0.3);
      };
      g.add(bk); animated.push(bk);
    }
    break; }

  default: return buildSignature(P,rnd,sp);      // the Arcane Swarm's seven
  }
  return g;
}

/* ------------------------------------------------------ realm land features
   Two realms don't just decorate their land differently — they change what the
   edge of the island IS. Both are built from the same absolute radii as
   everything else, so they never move. */

/* THE SHIPYARDS: open water outside the coast, and the island sits in it. */
let SEA_Y=-2.3;   // set per build: just under the current coast
/* THE SHIPYARDS' sea is NOT drawn here. In the lab a district is an island
   floating alone, so its water is a ring around its own coast; in the world the
   district stands on a plot, and a ring at the island's coastline is a ring
   drawn inside the thing it is supposed to surround. The harbour realm floods
   its own GROUND instead — see buildLand(). SEA_Y still exists because the realm's
   boats read it to know where the waterline is. */

/* THE BASTION: a battlemented rampart on every terrace edge the island has
   reached. Fixed radii, so a wall built at L6 is the same wall at L12. */
/* A curtain wall, not a fence. The old rampart was 0.3 thick and 1.0 tall, which
   at any zoom read as a low kerb around the town — and "walled crag" is the
   Bastion's whole landform. This one has a battered base, a wall-walk you can
   see people are meant to stand on, merlons on the outer face only, drum towers
   at intervals with conical caps and pennants, and a brazier burning on every
   third tower. Fire on snow is the realm's one piece of spectacle. */
function bastionFlame(P,scale=1){
  const g=new THREE.Group();
  const bowl=meshOf(new THREE.CylinderGeometry(0.17*scale,0.11*scale,0.16*scale,8),
    mat(P.metal,{rough:0.6,metal:0.4}));
  bowl.position.y=0.08*scale; g.add(bowl);
  const fm=new THREE.MeshStandardMaterial({color:T.bun10,emissive:T.bun40,
    emissiveIntensity:2.6,flatShading:true,transparent:true,opacity:0.92,roughness:0.3});
  const fl=meshOf(new THREE.ConeGeometry(0.15*scale,0.42*scale,6),fm,false,false);
  fl.position.y=0.34*scale; g.add(fl);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:T.bun20,
    transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.scale.setScalar(1.5*scale); halo.position.y=0.36*scale; g.add(halo);
  const ph=(P.seed%23)*0.41;
  g.userData.tick=t=>{
    const f=0.82+Math.sin(t*7.3+ph)*0.13+Math.sin(t*11.1+ph)*0.07;
    fl.scale.set(1,f,1); fl.rotation.y=t*1.1;
    fm.emissiveIntensity=2.2+f*0.9;
    halo.material.opacity=0.36+f*0.2;
  };
  g.userData.keep=true; animated.push(g);
  return g;
}
function bastionWallTower(P,h,brazier){
  const g=new THREE.Group();
  const r=0.46;
  g.add(meshOf(new THREE.CylinderGeometry(r,r*1.16,h,10),mat(P.stone,{rough:0.94})));
  const cor=meshOf(new THREE.CylinderGeometry(r*1.3,r*1.02,0.24,12),mat(P.stone2,{rough:0.94}));
  cor.position.y=h/2; g.add(cor);
  for(let i=0;i<9;i++){
    const a=i/9*TAU;
    const m=meshOf(boxG(0.2,0.3,0.16),mat(P.stone2,{rough:0.94}));
    m.position.set(Math.cos(a)*r*1.2,h/2+0.28,Math.sin(a)*r*1.2); m.rotation.y=-a; g.add(m);
  }
  if(brazier){ const f=bastionFlame(P,1.1); f.position.y=h/2+0.42; g.add(f); }
  else{
    const c=meshOf(new THREE.ConeGeometry(r*1.34,0.9,10),mat(P.roof,{rough:0.62,metal:0.15}));
    c.position.y=h/2+0.75; g.add(c);
    const pole=meshOf(new THREE.CylinderGeometry(0.025,0.025,0.6,4),mat(P.metal,{metal:0.5}));
    pole.position.y=h/2+1.45; g.add(pole);
    const cloth=meshOf(new THREE.PlaneGeometry(0.3,0.2,4,2),
      mat(P.accent,{side:THREE.DoubleSide,flat:false,rough:0.85}),true,false);
    cloth.position.set(0.15,h/2+1.6,0); g.add(cloth);
    const base=cloth.geometry.attributes.position.array.slice(), ph=(P.seed%17)*0.37;
    cloth.userData.tick=t=>{
      const q=cloth.geometry.attributes.position;
      for(let i=0;i<q.count;i++)
        q.setZ(i,Math.sin(t*3.6+ph+base[i*3]*7)*0.05*(base[i*3]/0.3+0.5));
      q.needsUpdate=true;
    };
    cloth.userData.keep=true; animated.push(cloth);
  }
  g.position.y=h/2;
  return g;
}
/* Siege engines in the muster yards. A fortress with no artillery in it is a
   town with thick walls; a trebuchet says what the place is FOR, and it reads
   at a glance because nothing else in the world has that silhouette. */
function bastionSiege(P,rnd){
  const g=new THREE.Group();
  const timber=mat(P.wood,{rough:0.92}), iron=mat(P.metal,{metal:0.5,rough:0.55});
  const s=lerp(0.85,1.15,rnd());
  /* the sled */
  const sled=meshOf(boxG(1.5*s,0.16*s,0.9*s),timber);
  sled.position.y=0.1*s; g.add(sled);
  for(const sx of [-1,1]) for(const sz of [-1,1]){
    const w=meshOf(new THREE.CylinderGeometry(0.15*s,0.15*s,0.09*s,10),iron);
    w.rotation.x=Math.PI/2;
    w.position.set(sx*0.55*s,0.14*s,sz*0.44*s); g.add(w);
  }
  /* the A-frame */
  for(const sz of [-1,1]) for(const sx of [-1,1]){
    const leg=meshOf(boxG(0.1*s,1.5*s,0.1*s),timber);
    leg.position.set(sx*0.42*s,0.9*s,sz*0.36*s);
    leg.rotation.z=-sx*0.28; g.add(leg);
  }
  const axle=meshOf(new THREE.CylinderGeometry(0.06*s,0.06*s,0.95*s,8),iron);
  axle.rotation.x=Math.PI/2; axle.position.y=1.6*s; g.add(axle);
  /* the arm, pivoted — it rocks, slowly, as if being wound */
  const arm=new THREE.Group(); arm.position.y=1.6*s;
  const beam=meshOf(boxG(0.11*s,2.6*s,0.11*s),timber);
  beam.position.y=0.55*s; arm.add(beam);
  const cw=meshOf(boxG(0.5*s,0.5*s,0.42*s),mat(P.stone2,{rough:0.95}));
  cw.position.y=-0.85*s; arm.add(cw);
  const sling=meshOf(new THREE.CylinderGeometry(0.02*s,0.02*s,0.7*s,4),iron);
  sling.position.set(0,1.95*s,0.2*s); sling.rotation.x=0.5; arm.add(sling);
  const shot=meshOf(new THREE.DodecahedronGeometry(0.13*s,0),mat(P.rock,{rough:1}));
  shot.position.set(0,1.68*s,0.5*s); arm.add(shot);
  arm.rotation.x=-0.85;
  g.add(arm);
  const ph=rnd()*TAU;
  arm.userData.tick=t=>{ arm.rotation.x=-0.85+Math.sin(t*0.32+ph)*0.1; };
  arm.userData.keep=true; animated.push(arm);
  /* a rack of shot beside it */
  for(let i=0;i<3;i++){
    const b=meshOf(new THREE.DodecahedronGeometry(0.13*s,0),mat(P.rock,{rough:1}));
    b.position.set(0.95*s,0.13*s+(i===2?0.2*s:0),(i-1)*0.26*s*(i===2?0:1)); g.add(b);
  }
  return g;
}

/* ------------------------------------------------- molten ground (forge) */
/* The Metal Forges own LAVA in the art direction and had none until the pond
   arrived at L5, so a reader whose first article was Rust got a brown mud
   pancake with brown pebbles on it. Bastion is the proof of the fix: its
   ramparts are part of the LANDFORM, so the realm is legible at three articles
   without a single building on the plot. Terrain exists at L1; props do not.

   Veins are cut on a fixed set of bearings from index alone, and each one is
   drawn only as far out as the island currently reaches — so growth extends the
   cracks it already has and opens new ones outward, and none of them ever
   moves. Same rule as everything else here. */
function forgeVeins(P,prof,R,sp){
  const g=new THREE.Group();
  /* The crust is DARK and the emissive is what glows. First pass set both the
     colour and the emissive to the molten orange at 1.6 and the cracks came
     back cream — an emissive that bright pushes every channel past one and ACES
     hands back near-white, which reads as spilled plaster. Molten rock is a
     dark surface with light coming out of it. */
  const m=new THREE.MeshStandardMaterial({color:mixTok(P.liquid,T.pepper90,0.52),
    emissive:P.liquid,emissiveIntensity:0.80,roughness:0.55});
  matAnim(m,(mm,t)=>{ mm.emissiveIntensity=0.80*(0.74+Math.sin(t*0.7)*0.26); });

  /* One vent, at a fixed bearing, and the cracks run OUT OF IT. The first pass
     had seven veins all starting at the island's centre at the same radius,
     which is a sunburst — a pattern nothing geological makes. Lava comes from
     somewhere. */
  const va=P.seed*0.77+1.3, vr=0.95, vrr=radiusAt(prof,va);
  const vx=Math.cos(va)*vr*vrr, vz=Math.sin(va)*vr*vrr, vy=tierY(vr)+0.175;

  /* Segments OVERLAP rather than abut. Laid end to end with a hair of gap they
     read as a dotted line of planks; overlapped they read as one crack that
     changes direction. */
  const crack=(x0,z0,a0,steps,w0)=>{
    let x=x0, z=z0, a=a0;
    for(let k=0;k<steps;k++){
      const len=lerp(0.55,0.95,((k*13+steps*7)%10)/10);
      a+=Math.sin(k*1.9+steps)*0.34;
      const w=Math.max(0.045,w0*(1-k/steps*0.65));
      const seg=meshOf(boxG(len,0.03,w),m,false,false);
      const nx=x+Math.cos(a)*len*0.5, nz=z+Math.sin(a)*len*0.5;
      const rr=Math.hypot(nx,nz);
      if(rr>R-0.30)break;
      seg.position.set(nx,tierY(rr)+0.175,nz); seg.rotation.y=-a;
      g.add(seg);
      x+=Math.cos(a)*len*0.78; z+=Math.sin(a)*len*0.78;   // 0.78, so they lap
    }
  };
  for(let i=0;i<4;i++) crack(vx,vz,i*1.57+P.seed*0.2,7,0.155);
  /* And a few short fissures with no visible source, so the ground reads as
     cracked rather than as plumbing. Fixed bearings from index alone. */
  for(let i=0;i<3;i++){
    const a=i*2.39996+P.seed*0.61, r=1.9+i*0.9;
    if(r>R-0.6)break;
    const rr=radiusAt(prof,a);
    crack(Math.cos(a)*r*rr,Math.sin(a)*r*rr,a+1.1,3,0.10);
  }

  const pool=meshOf(new THREE.CylinderGeometry(0.44,0.36,0.08,13),m,false,false);
  pool.position.set(vx,vy+0.01,vz); g.add(pool);
  const lip=meshOf(new THREE.TorusGeometry(0.48,0.10,4,14),
    mat(P.rock,{rough:1}),false,true);
  lip.rotation.x=Math.PI/2; lip.position.set(vx,vy,vz); g.add(lip);
  return g;
}

function buildRampart(P,prof,edgeR,y,seedn){
  const g=new THREE.Group();
  const rnd=rngOf(seedn);
  const n=Math.max(14,Math.round(edgeR*4.4));
  const gate=rnd()*TAU;
  const H=1.9, TH=0.5;                        // wall height and thickness
  const stoneA=mat(P.stone,{rough:0.94}), stoneB=mat(P.stone2,{rough:0.94});
  for(let i=0;i<n;i++){
    const a=i/n*TAU, rr=radiusAt(prof,a)*edgeR;
    const d=Math.abs(((a-gate+Math.PI)%TAU+TAU)%TAU-Math.PI);
    if(d<0.26)continue;                       // the gate gap
    const len=rr*TAU/n*1.16;
    const cs=Math.cos(a), sn=Math.sin(a);
    /* battered base — a wall that widens as it goes down reads as heavy */
    const base=meshOf(boxG(TH*1.5,0.5,len),stoneB);
    base.position.set(cs*rr,y+0.25,sn*rr); base.rotation.y=-a; g.add(base);
    const seg=meshOf(boxG(TH,H,len),i%2?stoneA:stoneB);
    seg.position.set(cs*rr,y+0.5+H/2,sn*rr); seg.rotation.y=-a; g.add(seg);
    /* the walk: a lip proud of the inner face, so the top reads as a surface */
    const walk=meshOf(boxG(TH*1.36,0.14,len),stoneB);
    walk.position.set(cs*(rr-0.06),y+0.5+H,sn*(rr-0.06)); walk.rotation.y=-a; g.add(walk);
    /* merlons on the OUTER edge only — a parapet you shelter behind */
    for(let k=0;k<2;k++){
      const u=(k+0.5)/2-0.5;
      const m=meshOf(boxG(TH*0.62,0.4,len*0.36),stoneA);
      m.position.set(cs*(rr+TH*0.34)-sn*u*len, y+0.5+H+0.27, sn*(rr+TH*0.34)+cs*u*len);
      m.rotation.y=-a; g.add(m);
    }
    if(i%6===3){                              // an arrow slit in the wall face
      const sl=meshOf(boxG(0.05,0.4,0.07),glowMat(P.bloom,0.9),false,false);
      sl.position.set(cs*(rr+TH*0.5),y+1.3,sn*(rr+TH*0.5)); sl.rotation.y=-a; g.add(sl);
    }
  }
  /* Drum towers around the circuit, every third one burning. */
  const nT=Math.max(4,Math.round(edgeR/2.1));
  for(let i=0;i<nT;i++){
    const a=gate+Math.PI*2*(i+0.5)/nT;
    const dd=Math.abs(((a-gate+Math.PI)%TAU+TAU)%TAU-Math.PI);
    if(dd<0.34)continue;
    const rr=radiusAt(prof,a)*edgeR;
    const t=bastionWallTower(P,H+0.9,i%3===0);
    t.position.set(Math.cos(a)*rr,y+0.5,Math.sin(a)*rr);
    g.add(t);
  }
  /* The gatehouse: twin drums, a portcullis, and braziers either side of it. */
  for(const sgn of [-1,1]){
    const a=gate+sgn*0.34, rr=radiusAt(prof,a)*edgeR;
    const t=bastionWallTower(P,H+1.5,false);
    t.position.set(Math.cos(a)*rr,y+0.5,Math.sin(a)*rr); g.add(t);
    const f=bastionFlame(P,1.0);
    f.position.set(Math.cos(a)*(rr-0.9),y+0.62,Math.sin(a)*(rr-0.9)); g.add(f);
  }
  const ar=radiusAt(prof,gate)*edgeR;
  const gx=Math.cos(gate)*ar, gz=Math.sin(gate)*ar;
  const lintel=meshOf(boxG(TH*1.3,0.42,1.5),stoneB);
  lintel.position.set(gx,y+2.1,gz); lintel.rotation.y=-gate; g.add(lintel);
  const arch=meshOf(new THREE.TorusGeometry(0.62,0.16,6,14,Math.PI),stoneB);
  arch.position.set(gx,y+1.1,gz); arch.rotation.y=-gate+Math.PI/2; g.add(arch);
  const grid=new THREE.Group();
  for(let k=0;k<5;k++){
    const b=meshOf(boxG(0.05,1.0,0.05),mat(P.metal,{metal:0.55,rough:0.5}));
    b.position.set(0,0.5,(k/4-0.5)*0.9); grid.add(b);
  }
  grid.position.set(gx,y+0.55,gz); grid.rotation.y=-gate; g.add(grid);
  return g;
}

/* ----------------------------------------------------------------- registry
   One row per realm. `build()` reads only from here, so adding a seventh realm
   is a data change plus its builders — never a change to the growth machinery. */
const KITS={
  swarm:{ house:buildCottage, tower:buildSpire, hall:buildDome, crown:buildOrrery,
          plant:(P,r)=>buildTree(P,r), feature:(P,r)=>realmFeature(P,r,'crystal'),
          garden:(P,r)=>realmGarden(P,r,'hedge'), lamp:(P,r)=>postLamp(P,r,'stone'),
          life:(P,n,R)=>buildBirds(P,n,R), motes:true },
  frame:{ crown:null, house:frameHouse, tower:frameTower, hall:frameHall, 
          plant:(P,r)=>realmPlant(P,r,'broadleaf'), feature:(P,r)=>realmFeature(P,r,'mushroom'),
          garden:(P,r)=>realmGarden(P,r,'hedge'), lamp:(P,r)=>postLamp(P,r,'timber'),
          life:frameLife, motes:true },
  forge:{ crown:null, house:forgeHouse, tower:forgeTower, hall:forgeHall, 
          plant:(P,r)=>realmPlant(P,r,'charred'), feature:(P,r)=>realmFeature(P,r,'ore'),
          garden:(P,r)=>realmGarden(P,r,'scrap'), lamp:(P,r)=>postLamp(P,r,'iron'),
          life:forgeLife, motes:false },
  ship:{  crown:null, house:shipHouse, tower:shipTower, hall:shipHall, 
          plant:(P,r)=>realmPlant(P,r,'harbour'), feature:(P,r)=>realmFeature(P,r,'crate'),
          garden:(P,r)=>realmGarden(P,r,'dock'), lamp:(P,r)=>postLamp(P,r,'iron'),
          life:shipLife, motes:false },
  bastion:{crown:null, house:bastionHouse, tower:bastionTower, hall:bastionHall, 
          plant:(P,r)=>realmPlant(P,r,'conifer'),
          feature:(P,r)=>r()<0.3?bastionSiege(P,r):realmFeature(P,r,'brazier'),
          garden:(P,r)=>realmGarden(P,r,'muster'), lamp:(P,r)=>postLamp(P,r,'iron'),
          life:bastionLife, motes:false },
  quarter:{crown:null, house:quarterHouse, tower:quarterTower, hall:quarterHall, 
          plant:(P,r)=>realmPlant(P,r,'street'), feature:(P,r)=>realmFeature(P,r,'stall'),
          garden:(P,r)=>realmGarden(P,r,'hedge'), lamp:(P,r)=>postLamp(P,r,'iron'),
          life:quarterLife, motes:true },
};

/* ================================================================== build */
/* Lattice populations are module constants, not level-derived: the lattice has
   to be the SAME lattice at every level or slot 7 stops meaning slot 7. */
/* Populations are generous on purpose. A slot only becomes a building if it is
   inside the coast, under the fill threshold AND clear of everything already
   placed — three gates, so the lattice has to offer far more candidates than
   the target count or a mid-size island comes out with one crystal on it. */
const POP={cot:78,tree:130,cry:80,lamp:64,hedge:80,rock:110,tuft:1400,flower:900};
const CAN=[0,0,0,0,0,0,0,2,3,5,6,7];      // cantilever decks per level
const RISE=0.5;                            // how long new land takes to come up

/* A deck is pinned to the coastline of the level it was BUILT at, and stays
   there while the island grows past it — the old coast decks end up as
   balconies over the lower terraces, which is a better story than having them
   chase the rim outward every level. */
function canBirthR(i){
  for(let L=1;L<=12;L++) if(CAN[L-1]>i) return spec(L).radius;
  return RMAX;
}


/* ############################################################################
   ############################  T H E   W O R L D  ###########################
   ############################################################################

   Everything above this line is the ART — the same procedural vocabulary the
   Arcane Lab locked, unchanged. Everything below is the WORLD: reading a real
   user's export, giving every district a plot, and letting you walk the whole
   thing.

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
const HIN = HC*Math.sqrt(3)/2;          // inradius
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
      const wm=new THREE.Mesh(wg,mat(P.liquid,{opacity:0.88,rough:0.12,
        metal:0.15,flat:!!FX.water,emissive:P.liquid,ei:0.18}));
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
    mat(mixTok(RP.cliff,RP.cliffDark,0.35),{rough:0.96}),false,false));
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

  const oldLand=new THREE.Group(), newLand=new THREE.Group();
  newLand.userData.key='newland'; out.add(oldLand,newLand);
  const landOf=r=>isNew(r)?newLand:oldLand;
  if(carry) node(newLand,{mode:'rise'});

  for(let j=0;j<sp.rings;j++) landOf((j+1)*RING_W).add(buildRing(P,prof,j));

  /* A realm floats; a district stands on the realm's ground and needs no keel. */
  if(opt.keel){
    /* Nor the keel. It hangs BELOW the island it belongs to, so everything it
       could ever shadow is another realm entirely — which is exactly the
       island-on-island shadowing this change exists to stop. */
    const keel=meshOf(underside(prof,R,R*0.95+1.2,P.seed+1),mat(P.rock,{rough:0.92}),false,false);
    keel.position.y=tierY(R-1e-6)-RING_T; keel.userData.key='keel'; out.add(keel);
    node(keel,{mode:carry&&prevKeys.has('keel')?'keep':'build',delay:0});

    /* A HARBOUR REALM GETS ITS OWN SEA. The note by shipLife explains why the
       water is not drawn at district scale — a ring at the coastline would be
       drawn inside the plot it is meant to surround, so the realm floods its own
       ground in buildLand() instead. But that only covers the realm view. Out
       here the realm is a lone island, and its boats orbit at 1.12 to 1.34 of
       the radius reading SEA_Y for their waterline — which left them sailing in
       open sky, circling a rock.

       An annulus, not a disc: it follows the island's own wobbled profile so the
       shoreline sits against the actual coast rather than a circle that cuts
       through it, and the middle is left out because the island is standing in
       it. Outer radius clears the widest boat orbit with room to spare. */
    if(P.kit==='ship'){
      const R0=R*0.94, R1=R*1.22, sea=seaRing(prof,R0,R1,3);
      if(FX.vc) bakeVC(sea);
      const sm=new THREE.Mesh(sea,mat(P.liquid,{opacity:0.88,rough:0.12,metal:0.15,
        flat:!!FX.water,emissive:P.liquid,ei:0.18}));
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

         LONG and SLOW on purpose. The first version had wavelengths of about
         four units on a bay four units wide, which put a whole crest inside
         every facet: the surface came out as small fast polygonal chop, which
         reads as a mesh glitching rather than as water. These are 15 to 30 units
         from crest to crest and drift at a fraction of the old speed, so the
         facets change gradually and the whole bay swells instead of stuttering.
         Longer waves also mean less radial detail is needed, hence 3 bands. */
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
           the attribute, which is why the pond above animates without this.
           Kept behind the flag so a smooth-shaded sea would still get normals,
           but at FX.water this was rebuilding 1600 of them a frame for nothing. */
        if(!FX.water) sea.computeVertexNormals();
      };
      animated.push(sm);
      out.add(sm);
      node(sm,{mode:carry&&prevKeys.has('sea')?'keep':'build',delay:0});
    }
  }

  if(P.kit==='swarm'){
    const wd=arcaneWards(P,prof,R,sp); wd.userData.key='wards'; out.add(wd);
    node(wd,{mode:carry&&prevKeys.has('wards')?'keep':'build',delay:0.3});
  }
  /* Rebuilt rather than kept, unlike the wards: the veins reach as far as the
     coast does, so a level that adds land adds crack. */
  if(P.kit==='forge'){
    const lv=forgeVeins(P,prof,R,sp); lv.userData.key='veins'; out.add(lv);
    node(lv,{mode:carry&&prevKeys.has('veins')?'keep':'build',delay:0.3});
  }
  if(P.kit==='bastion'){
    for(let k=0;k<TIER_R.length;k++){
      const b=TIER_R[k]; if(b>=R)continue; const key='ramp'+k;
      const w=buildRampart(P,prof,b,tierY(b-1e-6),hash2(P.seed,15000+k));
      w.userData.key=key; out.add(w);
      node(w,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:isNew(b)?RISE:0.05});
    }
    const w=buildRampart(P,prof,R-0.15,tierY(R-1e-6),hash2(P.seed,15900));
    w.userData.key='rampC'; out.add(w); node(w,{mode:'build',delay:RISE});
  }

  for(let k=0;k<TIER_R.length;k++){
    const b=TIER_R[k]; if(b>=R)break;
    const a=(P.seed%7)*0.9+k*2.1, rr=radiusAt(prof,a)*b;
    const g=new THREE.Group(); g.userData.key='stair'+k;
    for(let s=0;s<4;s++){
      const st=meshOf(boxG(1.0,0.16,0.44),mat(P.stone2));
      st.position.set(Math.cos(a)*(rr+s*0.42),tierY(b-1e-6)-(s+1)*0.2,Math.sin(a)*(rr+s*0.42));
      st.rotation.y=-a; g.add(st);
    }
    out.add(g);
    node(g,{mode:carry&&prevKeys.has(g.userData.key)?'keep':'build',delay:isNew(b)?RISE:0.05});
  }

  const claimed=[];
  const slotXZ=p=>{ const rr=radiusAt(prof,p.a)*p.r; return [Math.cos(p.a)*rr,Math.sin(p.a)*rr]; };
  const accept=(p,minD)=>{
    if(p.r>R-minD*0.6)return false;
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

  if(opt.signatures&&opt.signatures.length){
    /* The realm's skyline. The biggest district takes the middle; the rest sit
       on the lattice at a scale that tracks how much you have read there, so
       the silhouette of a realm is a ranking you can see from across the map. */
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
      claimed.push({x:0,z:0,d:2.8});
      return g;
    };
    put0(opt.signatures[0],'sig0',null);
    const lat=lattice(52,1.9,RMAX*0.78,hash2(P.seed,777));
    let n=1;
    for(const p of lat){
      if(n>=opt.signatures.length)break;
      if(!accept(p,2.5))continue;
      put0(opt.signatures[n],'sig'+n,p); n++;
    }
  }else if(sp.signature){
    const g=realmSignature(P,rngOf(hash2(P.seed,1)),sp);
    g.position.set(0,0.16,0); g.userData.key='sig'; g.userData.keep=true; out.add(g);
    node(g,{mode:carry&&prevKeys.has('sig')?'keep':'build',delay:0});
    claimed.push({x:0,z:0,d:2.0});
  }
  /* THE LODESTONE, at every level from one — see buildLodestone. It replaces a
     placeholder "core" that existed only at L1 and L2 and was then thrown away
     when the signature arrived, which is the one thing the layout is not
     allowed to do: a founding marker that stops existing once you have read
     eight articles is not a founding marker. Placed before the buildings so it
     claims its ground first, and claimed generously — the stone wants air
     around it, not a cottage against its shoulder. */
  {
    const la=(P.seed%13)*0.4833+1.05, lp={r:1.34,a:la,f:0,i:-1};
    accept(lp,0.95);
    put(buildLodestone(P,rngOf(hash2(P.seed,3))),lp,'lode',0);
  }

  const spireTops=[];
  placeN(lattice(46,0.6,RMAX*0.55,hash2(P.seed,20)),sp.spires,1.1,(p,i)=>{
    const rs=rngOf(hash2(P.seed,2000+p.i));
    const great=sp.greatSpire&&i===0;
    const h=lerp(5.4,8.4,rs())*(great?1.5:1);
    const s=put(K.tower(P,rs,h,great),p,'sp'+p.i,i*0.08);
    spireTops.push(new THREE.Vector3(s.position.x,s.position.y+h*0.82,s.position.z));
  });
  placeN(lattice(46,2.2,RMAX*0.6,hash2(P.seed,30)),sp.domes,1.35,
    (p,i)=>put(K.hall(P,rngOf(hash2(P.seed,3000+p.i))),p,'dm'+p.i,i*0.08));
  if(sp.arch) placeN(lattice(34,1.1,RMAX*0.92,hash2(P.seed,40)),1,1.0,p=>{
    const a=buildArch(P,rngOf(hash2(P.seed,4000+p.i))); a.rotation.y=-p.a+Math.PI/2;
    put(a,p,'ar'+p.i,0.05);
  });
  if(sp.cottages) placeF(lattice(POP.cot,1.7,RMAX*0.95,hash2(P.seed,50)),0.78,(p,i)=>{
    const rc=rngOf(hash2(P.seed,5000+p.i)); const c=K.house(P,rc);
    c.rotation.y=-p.a+Math.PI/2+(rc()-0.5)*0.7; put(c,p,'ct'+p.i,i*0.012);
  });
  if(sp.hedges) placeF(lattice(POP.hedge,3.4,RMAX*0.97,hash2(P.seed,60)),0.30,
    (p,i)=>put(K.garden(P,rngOf(hash2(P.seed,6000+p.i))),p,'hg'+p.i,i*0.008));
  if(sp.lamps) placeF(lattice(POP.lamp,0.3,RMAX*0.97,hash2(P.seed,70)),0.24,
    (p,i)=>put(K.lamp(P,rngOf(hash2(P.seed,7000+p.i))),p,'lp'+p.i,i*0.008));
  if(sp.trees) placeF(lattice(POP.tree,5.1,RMAX*0.98,hash2(P.seed,80)),0.44,
    (p,i)=>put(K.plant(P,rngOf(hash2(P.seed,8000+p.i))),p,'tr'+p.i,i*0.01));
  placeF(lattice(POP.cry,4.2,RMAX*0.98,hash2(P.seed,90)),0.38,
    (p,i)=>put(K.feature(P,rngOf(hash2(P.seed,9000+p.i))),p,'cr'+p.i,i*0.01));
  if(sp.banners) placeN(lattice(40,2.9,RMAX*0.7,hash2(P.seed,100)),
    Math.min(4,1+Math.floor(level/3)),0.4,
    (p,i)=>put(buildBanner(P,rngOf(hash2(P.seed,10000+p.i))),p,'bn'+p.i,i*0.05));

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

  const scatter=(pop,geo,material,rot,seed,scaleFn,yOff)=>{
    if(FX.vc) bakeVC(geo);          // instanced — see the paving above
    const lat=lattice(pop,rot,RMAX*0.99,seed), rnd=rngOf(seed+7);
    const oldM=[],newM=[], o=new THREE.Object3D();
    for(const p of lat){
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
  scatter(POP.tuft,new THREE.ConeGeometry(0.07,0.26,4),mat(P.ground2,{rough:1}),
    2.7,hash2(P.seed,120),r=>lerp(0.6,1.5,r()));
  if(sp.flowers) scatter(POP.flower,new THREE.IcosahedronGeometry(0.05,0),
    mat(P.bloom,{emissive:P.bloom,ei:0.12,rough:0.8}),
    4.9,hash2(P.seed,130),r=>lerp(0.7,1.4,r()),0.05);

  if(sp.pond){
    /* The pond, its channel and the cascades stepping down to the rim all hang
       off this one bearing, and it used to sweep 115 to 441 degrees — which,
       against a camera that starts at 45, is almost exactly the half of the
       island you cannot see. The whole waterworks was being built round the
       back by default.

       Re-centred on the opening view and narrowed to +/-57 degrees, so it lands
       in front wherever the seed falls. Still derived from the seed alone and
       NOT from the live camera: this is build-time geometry that carries across
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
        mat(P.liquid,{emissive:P.liquid,ei:(P.liquidGlow??0.5)*1.1,flat:false,rough:0.15,opacity:0.85}),
        false,true);
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

  for(let i=0;i<CAN[level-1];i++){
    const br=canBirthR(i);
    const a=i*2.399963229728653+(P.seed%13)*0.31;
    const wr=radiusAt(prof,a)*br;
    const c=buildCantilever(P,rngOf(hash2(P.seed,11000+i)),sp,{back:1.1,drop:1.5});
    c.position.set(Math.cos(a)*(wr+1.1),tierY(br-1e-6),Math.sin(a)*(wr+1.1));
    c.rotation.y=-a; c.userData.key='can'+i; out.add(c);
    node(c,{mode:carry&&prevKeys.has('can'+i)?'keep':'build',delay:isNew(br)?RISE:0.05});
  }
  if(sp.bridges&&spireTops.length>1){
    for(let i=0;i<spireTops.length-1;i++){
      const key='br'+i, b=buildSkyBridge(P,spireTops[i],spireTops[i+1]);
      b.userData.key=key; out.add(b);
      node(b,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:RISE+0.1});
    }
  }
  if(sp.undercroft){
    for(let k=0;k<TIER_R.length;k++){
      const b=TIER_R[k]; if(b>=R)continue; const key='uc'+k;
      const u=buildUndercroft(P,rngOf(hash2(P.seed,13000+k)),prof,b,tierY(b-1e-6)-0.06);
      u.userData.key=key; out.add(u);
      node(u,{mode:carry&&prevKeys.has(key)?'keep':'build',delay:isNew(b)?RISE:0.05});
    }
  }
  if(sp.orrery&&K.crown){
    /* The one thing in the world that hovers unsupported. If it stops turning
       it stops being magic and starts being a prop. */
    const g=K.crown(P); g.position.set(0,12.4,0);
    g.userData.key='crown'; g.userData.keep=true; out.add(g);
    node(g,{mode:carry&&prevKeys.has('crown')?'keep':'build',delay:RISE+0.2});
  }
  /* Ambient life is expensive and only legible up close, so it is a privilege
     of the districts you are actually looking at. */
  if(opt.alive){
    if(K.motes){ const w=buildWisps(P,sp.wisps,R);
      w.userData.key='wisps'; w.userData.keep=true; out.add(w);
      node(w,{mode:carry?'keep':'build',delay:0.5}); }
    if(sp.birds){ const b=K.life(P,sp.birds,R,prof);
      b.userData.key='birds'; b.userData.keep=true; out.add(b);
      node(b,{mode:carry&&prevKeys.has('birds')?'keep':'build',delay:0.6}); }
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
/* Everything the two views agree on: what is on screen right now. */
const shownList=()=>OPEN?OPEN.list.filter(d=>d.shown>0):W.quarters.filter(q=>q.shown>0);

/* --------------------------------------------------------- the realm island */
/* A realm is the lab island built at the realm's own level, floating on its own
   keel, carrying one signature per district. Everything here is the locked art
   running at a different scale — no second art direction to maintain, which is
   why the world view can be as nice as the realm view. */
/* The ten districts an island carries a signature for, and that list as one
   comparable string. Both read the same districts in the same order, so a key
   that has not moved means an island that would be rebuilt identically. */
const realmSigDistricts=q=>[...q.list].filter(d=>d.shown>0)
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
    alive:true, keel:true, signatures:sigs});
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
  updateHud(); renderRank(true); buildAir(); placeClouds();
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
  updateHud(); renderRank(true); buildAir(); placeClouds();
}

/* ================================================================== the sky */
/* The sky USED to be a readout: whichever realm you had been reading lately
   owned it, ranked never blended. It was the file's answer to "where does
   recency live", and as a piece of information design it worked.

   It is not that any more, and the reason is worth writing down. The sky is the
   single biggest thing on screen and the only channel that survives at
   share-card size — which makes it simultaneously the best readout in the world
   and the thing that decides what this page LOOKS like. Those two claims cannot
   both be honoured, and the readout is the one that loses: the same fact is
   already carried, permanently and unfakeably, by which quarters of the map are
   large. Recency was the weakest thing the sky could have been spending itself
   on, and paying for it in a world whose colour changed per reader — and
   changed again under them the moment the growth log landed — was paying twice.

   So the sky is fixed. One palette, one hour, the same for everybody. Note what
   is NOT on offer: land, level, density, monuments. Those are the portrait.

   Two axes rather than a list, because two axes is what makes a sky feel FOUND
   instead of picked: eight palettes and five hours is forty skies. That is a
   customisation feature and it is out of this pass — the list stays because it
   costs nothing and it is what the feature comes back as. */
const SKY_PAL=[
  {id:'brand',   n:'BRAND DUSK', a:mixTok(T.onion20,T.salt10,0.24), b:T.cheese10},
  {id:'clear',   n:'CLEAR DAY',  a:mixTok(T.water10,T.salt10,0.16), b:T.salt0},
  {id:'blossom', n:'BLOSSOM',    a:mixTok(T.bacon10,T.salt10,0.28), b:T.cheese10},
  {id:'ember',   n:'EMBER',      a:mixTok(T.onion90,T.bun40,0.22),  b:T.bun20},
  {id:'seaglass',n:'SEAGLASS',   a:mixTok(T.blue40,T.salt10,0.32),  b:T.lettuce10},
  {id:'orchid',  n:'ORCHID',     a:mixTok(T.cabbage40,T.salt10,0.18),b:T.bacon10},
  {id:'harvest', n:'HARVEST',    a:mixTok(T.cheese40,T.salt10,0.12), b:T.bun10},
  {id:'slate',   n:'SLATE',      a:mixTok(T.pepper10,T.salt50,0.44), b:T.salt40},
];
/* The hour moves the sun and nothing else moves with it, which is the whole
   reason it can be given away for free: the sun is placed once and never
   animated, so re-aiming it costs one environment repaint and zero per-frame
   work. `tint`/`ka`/`kb`/`mul` are how an hour reaches the SKY as well as the
   light — a palette dragged toward one colour and scaled down. Without it,
   night is a bright noon sky with the lamps turned up, which reads as an
   eclipse rather than an evening.
   DAY is the file's original lighting rig to the decimal, so it is the default
   and nothing about the locked art direction moves unless somebody asks. */
const SKY_HOUR=[
  {id:'dawn', n:'DAWN',  sun:[0.9,0.42,0.55],  sunC:0xFFD9C8, sunI:1.5,
   hemiI:0.30, fillI:0.72, rimI:0.52, exp:0.90, tint:0xFF879F, ka:0.24, kb:0.34, mul:0.94},
  {id:'day',  n:'DAY',   sun:[0.62,1.5,0.4],   sunC:0xFFF3B7, sunI:2.0,
   hemiI:0.30, fillI:0.80, rimI:0.40, exp:0.93, tint:0xFFFFFF, ka:0.00, kb:0.00, mul:1.00},
  {id:'gold', n:'GOLDEN',sun:[-0.35,0.55,0.86],sunC:0xFFE24C, sunI:2.1,
   hemiI:0.26, fillI:0.70, rimI:0.58, exp:0.96, tint:0xFFAB81, ka:0.30, kb:0.26, mul:0.97},
  {id:'dusk', n:'DUSK',  sun:[-0.85,0.26,-0.3],sunC:0xFFAB81, sunI:1.15,
   hemiI:0.24, fillI:0.66, rimI:0.66, exp:0.86, tint:0x6B56DD, ka:0.42, kb:0.22, mul:0.84},
  /* The one that repays the whole feature. Everything emissive in this world —
     lamps, beacons, the orrery, lit windows, the ley lines — is already on the
     bloom layer and already sized for daylight, so dropping the key by 4x hands
     the frame to them without a single new light being added. It is also the
     best share card the file can produce, which is not a coincidence: a world
     at night is a world whose ONLY bright parts are the parts you built. */
  {id:'night',n:'NIGHT', sun:[-0.5,0.34,-0.62],sunC:0x9FB6FF, sunI:0.50,
   hemiI:0.15, fillI:0.40, rimI:0.60, exp:0.80, tint:0x141A2E, ka:0.72, kb:0.46, mul:0.58},
];
const SKY={pal:'brand',hour:'day'};
const skyPalOf=id=>SKY_PAL.find(p=>p.id===id)||SKY_PAL[0];
const skyHourOf=id=>SKY_HOUR.find(h=>h.id===id)||SKY_HOUR[1];

/* Repainting a sky regenerates the PMREM environment, so it is guarded by a key
   rather than by a flag. Nothing moves the key while a world is up any more, so
   this now runs exactly once per load. */
let skyKey='';
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
  const o=new THREE.Vector3((cx/innerWidth)*2-1, -(cy/innerHeight)*2+1, -1)
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
canvas.addEventListener('pointerdown',e=>{
  if(POV.bird)return;                    // the camera belongs to the bird
  rotating=e.shiftKey||e.button===2; panning=!rotating;
  lx=e.clientX; ly=e.clientY; moved=0; PX=e.clientX; PY=e.clientY;
  canvas.setPointerCapture(e.pointerId); stageEl.className='world-stage grabbing';
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
  panning=rotating=false; stageEl.className='world-stage grab';
  PX=e.clientX; PY=e.clientY;
  if(HAND.mode==='held'){ handRelease(clock.getElapsedTime()); return; }
  HAND.hold=0; HAND.armed=null;
  if(moved<6) pick(e.clientX,e.clientY,true);
});
canvas.addEventListener('pointercancel',()=>{ HAND.hold=0; HAND.armed=null;
  if(HAND.mode==='held') handRelease(clock.getElapsedTime()); });
canvas.addEventListener('pointermove',e=>{
  /* The pointer position is read FIRST and unconditionally: while you are
     riding, where the cursor sits is the only steering input there is, and an
     early return above this line silently froze the mouse look. */
  PX=e.clientX; PY=e.clientY;
  if(POV.bird)return;
  const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
  moved+=Math.abs(dx)+Math.abs(dy);
  /* Once the hand has it, the drag belongs to the town and not to the camera. */
  if(HAND.mode!=='idle') return;
  if(moved>6){ HAND.hold=0; POV.aim=null; }
  if(panning){
    const r=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
    const f=new THREE.Vector3(-Math.cos(yaw),0,-Math.sin(yaw));
    const k=zoom/innerHeight*2;
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
   innerWidth/innerHeight are both 0; 0/0 is NaN, that NaN reaches the camera's
   aspect and the projection matrix goes NaN, and from then on nothing renders —
   permanently, because placeCam() re-derives from the same poisoned zoom, so no
   later resize can dig it out. A degenerate viewport therefore DEFERS the fit
   and the first real one performs it. */
let fitPending=null;
const reflow=()=>{
  /* Re-read the ratio, don't just re-read the size: dragging the window to a
     second monitor changes devicePixelRatio, and sizePost below picks the new
     one up for its buffers whether the canvas does or not. */
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight); drawSpark();
  /* Safe despite sizePost's consts being declared further down: module
     evaluation is synchronous, so no resize can fire before they exist. */
  sizePost();
  if(fitPending&&innerWidth>0&&innerHeight>0){ const b=fitPending; fitPending=null; frameBounds(b); }
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

/* Fit the world to the part of the screen the UI is not standing on. Fitting to
   the window instead puts a third of a 40-district world behind the panel. */
const PAD={l:296,r:18,t:22,b:112};
/* The world view stacks its realm names upward on stems, so it needs real
   headroom reserved before the fit runs. */
const padT=()=>OPEN?PAD.t:96;
function frameWorld(){ frameBounds(OPEN?OPEN.bounds:W.worldBounds); }
function frameBounds(b){
  if(!(innerWidth>0&&innerHeight>0)){ fitPending=b; return; }
  target.set((b.x0+b.x1)/2, 6, (b.z0+b.z1)/2);
  zoom=1; syncCam();
  const aspect=innerWidth/innerHeight;
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
  const availW=Math.max(120,innerWidth-PAD.l-PAD.r);
  const availH=Math.max(120,innerHeight-padT()-PAD.b);
  const z=Math.max((u1-u0)*innerHeight/(2*availW),(v1-v0)*innerHeight/(2*availH));
  zoomTarget=zoom=clamp(z,ZMIN,ZMAX);
  /* Recentre on the visible rectangle rather than on the window's middle. */
  const k=zoom/innerHeight*2;
  const ou=k*(PAD.l+availW/2-innerWidth/2), ov=k*(innerHeight/2-padT()-availH/2);
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
  paintBorders(); renderRank(true);
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
    !(x-w/2<PAD.l+6||x+w/2>innerWidth-PAD.r-6
      ||y-h/2<PAD.t+6||y+h/2>innerHeight-PAD.b-6);
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

function buildLabels(){
  labelBox.querySelectorAll('.lb').forEach(e=>e.remove());
  leadBox.innerHTML='';
  for(const d of W.districts){
    const e=document.createElement('div');
    e.className='lb t1'; e.style.color=hexs(d.niche.accent);
    e.innerHTML='<div class="box"><div class="nm"></div><div class="mt"></div>'
               +'<div class="sb"></div></div><div class="stem"></div><div class="pin"></div>';
    e.onclick=()=>{ select(d.i); flyTo(d); };
    e.onmouseenter=()=>{ hovered=d; paintBorders(); };
    e.onmouseleave=()=>{ hovered=null; paintBorders(); };
    labelBox.appendChild(e);
    d.el=e; d.elNm=e.querySelector('.nm'); d.elMt=e.querySelector('.mt');
    d.elBn=e.querySelector('.sb'); d.lead=makeLead(hexs(d.niche.accent));
  }
  for(const g of W.quarters){
    const e=document.createElement('div');
    e.className='lb rl t2'; e.style.color=hexs(g.realm.accent);
    e.innerHTML=`<div class="box"><div class="nm">${g.realm.name.replace(/^THE /,'')}</div>`
               +`<div class="sb">${g.realm.theme.toUpperCase()}</div>`
               +`<div class="mt"></div></div>`
               +`<div class="stem"></div><div class="pin"></div>`;
    e.onclick=()=>enterRealm(g);
    e.onmouseenter=()=>{ if(!OPEN)hovered=g; };
    e.onmouseleave=()=>{ if(!OPEN)hovered=null; };
    labelBox.appendChild(e);
    g.el=e; g.elS=e.querySelector('.mt'); g.lead=makeLead(hexs(g.realm.accent));
  }
}
const _v=new THREE.Vector3();
function project(x,y,z){
  /* Same trap as the fit: labels are laid out right after placeCam(), before
     any render has refreshed the camera's inverse matrix. That one-frame-stale
     matrix is the offset between a label and the thing it points at. */
  _v.set(x,y,z).project(cam);
  return [(_v.x*0.5+0.5)*innerWidth,(-_v.y*0.5+0.5)*innerHeight,_v.z];
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
  const key=[yaw,zoom,target.x,target.y,target.z,fade,innerWidth,innerHeight,
             OPEN?OPEN.realm.id:'',DAY,worldVer].join(',');
  if(key===labelKey)return;
  labelKey=key;
  const scale0=innerHeight/(2*zoom);
  /* The middle of everything on screen — every label points away from it. */
  const shown=OPEN?OPEN.list.filter(d=>d.built):W.quarters.filter(q=>q.shown>0);
  let ox=0,oy=0;
  for(const x of shown){ const [a,b]=project(x.x,0,x.z); ox+=a; oy+=b; }
  if(shown.length){ ox/=shown.length; oy/=shown.length; } else { ox=innerWidth/2; oy=innerHeight/2; }
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
    const wide=innerWidth>=700;
    const boxes0=[], w0=wide?250:150, h0=wide?72:56;
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
      const txt=arts(g.shown);
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
    const w=t>=2?168:104, h=t>=2?58:32;
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
      const mt=arts(d.shown);
      if(d.elMt.textContent!==mt) d.elMt.textContent=mt;
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
        toast('LEVEL '+L,nameOf(d)+' → '+LEVELS[L-1].n,d.niche.accent);
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
        toast('DISCOVERED',q.realm.name.replace(/^THE /,''),q.realm.accent);
      }else if(q.island&&L>Math.max(pending,q.level)){
        q.queued=L; if(!queue.includes(q)) queue.push(q);
        toast('GREW',q.realm.name.replace(/^THE /,'')+' · '+arts(q.shown),q.realm.accent);
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
    articles:total, districts:founded, realms,
    open: OPEN?{ id:OPEN.realm.id,
                 name:OPEN.realm.name.replace(/^THE /,''),
                 theme:OPEN.realm.theme,
                 districts:OPEN.list.filter(d=>d.shown>0).length,
                 articles:OPEN.shown }:null,
    next: nx?{ need:nx.need, name:nameOf(nx.d), level:LEVELS[nx.L].n,
               color:hexs(nx.d.niche.accent) }:null,
  });
  renderRank(false);
}
let rankT=0;
function renderRank(force){
  const now=performance.now(); if(!force&&now-rankT<220)return; rankT=now;
  const list=(OPEN?OPEN.list:W.quarters).filter(x=>x.shown>0)
    .sort((a,b)=>b.shown-a.shown).slice(0,OPEN?14:6);
  const max=list.length?list[0].shown:1;
  emit({rank:list.map(x=>({
    key: OPEN?x.niche.id:x.realm.id,
    name: OPEN?nameOf(x):x.realm.name.replace(/^THE /,''),
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
  emit({status:'loading',progress:0.05,message:'Raising the land…'});
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
         from:W.first, to:W.last,
         span: !(dayspan>=1)?undefined
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
const bloomComposer=new EffectComposer(renderer);
bloomComposer.renderToScreen=false;
/* Threshold high on purpose: the layer already excludes the terrain, but a lamp
   post's warm stone is on that layer too and only the lamp should bloom. */
/* Tuned at close zoom rather than at world scale, which is where it bites: the
   same lamp covers forty times the pixels when you walk into a realm, and a
   strength that read as a glow across the archipelago blew the roofs out. */
const bloomPass=new UnrealBloomPass(new THREE.Vector2(1,1),0.15,0.75,0.72);
const bloomRenderPass=new RenderPass(scene,cam);
bloomComposer.addPass(bloomRenderPass);
bloomComposer.addPass(bloomPass);

/* Point every pass at a different camera at once. Both chains have to move
   together — leave the bloom chain on the old camera and the glow arrives in
   the frame from a viewpoint the frame is no longer drawn from. */
function setView(c){
  view=c;
  renderPass.camera=c; bloomRenderPass.camera=c;
  outlinePass.material.uniforms.uPersp.value=c.isPerspectiveCamera?1:0;
}

function sizePost(){
  const w=innerWidth, h=innerHeight, dpr=Math.min(devicePixelRatio,2);
  composer.setSize(w,h); composer.setPixelRatio(dpr);
  bloomComposer.setSize(Math.round(w/2),Math.round(h/2));
  normalRT.setSize(Math.round(w*dpr/2),Math.round(h*dpr/2));
  bloomPass.setSize(Math.round(w/2),Math.round(h/2));
  const rw=w*dpr, rh=h*dpr;
  gradePass.material.uniforms.uRes.value.set(rw,rh);
  gradePass.material.uniforms.uAspect.value=w/h;
  outlinePass.material.uniforms.uRes.value.set(normalRT.width,normalRT.height);
  camFP.aspect=w/Math.max(1,h); camFP.updateProjectionMatrix();
}
sizePost();

/* ================================================================= the look
   The lab offered six graded looks and seven knobs, forked into "mine" the
   moment you moved one. That is customisation and it is out of this pass, so
   what is left is DIORAMA — the file's own art direction — pushed once into the
   passes. The rest of the presets stay listed because they cost nothing and
   they are what the feature comes back as. */
const LOOK_DEFS=[
  {id:'diorama', n:'DIORAMA',
   d:'The file\'s own art direction: soft ink on every silhouette, a warm key, and nothing pushed.',
   fx:{post:1,bloom:1,outline:1},
   sat:1.00, lift:0.05, vig:0.17, grain:0.026, warm:0.00, duo:0.00,
   duoA:0x272A32, duoB:0xF5F6FA, ink:0x2A2438, ol:0.24, bl:1.00},
  {id:'ink', n:'INK',
   d:'Illustrated rather than lit. Lines carry the shapes and the colour steps back behind them.',
   fx:{post:1,bloom:1,outline:1},
   sat:0.74, lift:0.04, vig:0.26, grain:0.050, warm:-0.08, duo:0.00,
   duoA:0x1E2229, duoB:0xEBEEF5, ink:0x1E2229, ol:0.78, bl:0.55},
  {id:'sun', n:'SUNPRINT',
   d:'No lines at all, and the glow let off its leash — an overexposed afternoon.',
   fx:{post:1,bloom:1,outline:0},
   sat:1.12, lift:0.03, vig:0.10, grain:0.018, warm:0.50, duo:0.00,
   duoA:0x713015, duoB:0xFFF3B7, ink:0x2A2438, ol:0.24, bl:1.90},
  {id:'blue', n:'BLUEPRINT',
   d:'A cyanotype of your own world. The ramp does the colour, the outlines do the drawing.',
   fx:{post:1,bloom:1,outline:1},
   sat:0.30, lift:0.02, vig:0.20, grain:0.030, warm:-0.20, duo:0.82,
   duoA:0x0B42C1, duoB:0xEBEEF5, ink:0x00A0AB, ol:0.82, bl:0.50},
  {id:'riso', n:'RISO',
   d:'Two inks and visible tooth. The one look that reads as printed rather than rendered.',
   fx:{post:1,bloom:1,outline:1},
   sat:0.92, lift:0.03, vig:0.14, grain:0.085, warm:0.18, duo:0.58,
   duoA:0xCB3160, duoB:0xFFE877, ink:0xA51A14, ol:0.34, bl:1.10},
  {id:'storm', n:'STORM',
   d:'Cold, closed in, and heavily cornered. Pairs with NIGHT and with nothing else.',
   fx:{post:1,bloom:1,outline:1},
   sat:0.82, lift:0.07, vig:0.44, grain:0.055, warm:-0.45, duo:0.30,
   duoA:0x1E2229, duoB:0xBAC4DA, ink:0x0F1218, ol:0.30, bl:1.25},
];
const LOOK={...LOOK_DEFS[0]};

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
     rendering nothing. Same for the glow. */
  FX.outline=LOOK.ol>0.005 && LOOK.fx.outline!==0;
  FX.bloom  =LOOK.bl>0.005 && LOOK.fx.bloom!==0;
  FX.post   =LOOK.fx.post!==0;
}
function lookSet(id){
  const src=LOOK_DEFS.find(l=>l.id===id); if(!src)return;
  Object.assign(LOOK,src); lookPush();
}
lookPush();

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
const YELP=['ow','hey','we are working','stop that','this is our reading time',
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
    const d=Math.hypot(sx-cx,sy-cy);
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
    :host.realm.name.replace(/^THE /,'')))||'—',manual:false}});
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
  POV.tLookX=clamp((PX/Math.max(1,innerWidth)-0.5)*2,-1,1)*0.95;
  POV.tLookY=clamp((PY/Math.max(1,innerHeight)-0.5)*2,-1,1)*0.45;
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
  leaveRealm,
  frameWorld: ()=>{ if(W) frameWorld(); },
  attachSpark: c=>drawSpark(c),
  /* The overlay stands on the world, so the camera fit has to know where. */
  setPadding: p=>{ Object.assign(PAD,p); if(W) frameWorld(); },
  setLook: lookSet,
  setViewFlags: v=>{ Object.assign(VIEW,v);
    if(W){ paintBorders();
           clouds.visible=VIEW.sky;
           scene.background=VIEW.sky?skyTex:new THREE.Color(0x0F1218); } },
  dispose,
};
}

