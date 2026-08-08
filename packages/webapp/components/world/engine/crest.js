/* Lifted from devcraft `world-lab.html`'s crest bench. Its own module, touching
   nothing but a 2D canvas context, so the engine's banner and React's panel/chip
   row draw off one emitter instead of two SVG copies drifting apart.
   Charge and tincture only come from monuments unlocked / districts founded
   (per `userWorldEntitlements`); division is free geometry. */

/* Paths are written in a 100-unit box centred on the origin, filled EVEN-ODD so
   a ring can be two circles and a dot-in-ring three, with no winding to track. */
const _c=(x,y,r)=>`M${x-r},${y}a${r},${r} 0 1 0 ${r*2},0a${r},${r} 0 1 0 ${-r*2},0Z`;
const _r=(x,y,w,h)=>`M${x-w/2},${y-h/2}h${w}v${h}h${-w}Z`;
/* One glyph per signature in REALMS, deliberately blunt: a crest is read at
   22px in a chip and at share-card size, and interior detail is a smudge at both. */
export const CHARGES={
  obelisk:   {n:'OBELISK',   d:`M0,-46 L11,-33 L8,42 L-8,42 L-11,-33 Z`},
  roost:     {n:'ROOST',     d:`${_r(0,2,8,88)}${_r(0,-28,52,8)}${_r(0,-6,40,8)}${_r(0,16,28,8)}`},
  conduit:   {n:'CONDUIT',   d:`M-42,28 A42,42 0 0 1 42,28 L30,28 A30,30 0 0 0 -30,28 Z M-18,28 A18,18 0 0 1 18,28 L8,28 A8,8 0 0 0 -8,28 Z${_r(0,38,92,10)}`},
  orrery:    {n:'ORRERY',    d:`${_c(0,0,42)}${_c(0,0,32)}${_c(0,0,13)}`},
  aqueduct:  {n:'AQUEDUCT',  d:`${_r(0,-30,88,14)}M-40,44 L-40,-16 L-14,-16 L-14,44 L-24,44 L-24,-4 L-30,-4 L-30,44 Z M14,44 L14,-16 L40,-16 L40,44 L30,44 L30,-4 L24,-4 L24,44 Z`},
  wardring:  {n:'WARD RING', d:`${_c(0,0,44)}${_c(0,0,34)}M0,-22 L20,-12 L20,10 L0,26 L-20,10 L-20,-12 Z`},
  coil:      {n:'SERPENT STEPS', d:`M-44,44 L-44,18 L-17,18 L-17,-8 L10,-8 L10,-34 L44,-34 L44,44 Z`},
  /* An upright frame with the warp strung down it. It was a SPINDLE, which is
     what the monument used to be; the monument is a loom now, and a charge that
     draws the wrong building is worse than a plain one.
     Beams span BETWEEN the posts and the threads stop short of both: two solids
     that overlap under even-odd cut a hole through each other, which at 22px
     reads as a broken glyph rather than as a joint. */
  loom:      {n:'GREAT LOOM',
              d:`${_r(-34,0,11,92)}${_r(34,0,11,92)}`
               +`${_r(0,-34,57,11)}${_r(0,31,57,13)}`
               +`${_r(-18,-1,5,50)}${_r(-6,-1,5,50)}${_r(6,-1,5,50)}${_r(18,-1,5,50)}`},
  canopywalk:{n:'CANOPY',    d:`${_r(-34,10,12,72)}${_r(34,10,12,72)}${_r(0,-12,80,10)}${_r(0,10,80,6)}`},
  greenhouse:{n:'GREENHOUSE',d:`M0,-44 L44,-8 L44,44 L-44,44 L-44,-8 Z M0,-26 L28,-2 L28,30 L-28,30 L-28,-2 Z${_r(0,14,8,32)}`},
  wellspring:{n:'WELLSPRING',d:`M-40,4 L40,4 L32,44 L-32,44 Z${_r(0,-26,10,44)}${_c(0,-38,12)}`},
  bigwheel:  {n:'GREAT WHEEL',d:`${_c(0,0,44)}${_c(0,0,33)}${_c(0,0,11)}${_r(0,0,8,66)}${_r(0,0,66,8)}M-27,-33 L-21,-39 L27,33 L21,39 Z M27,-33 L33,-27 L-21,39 L-27,33 Z`},
  anvilyard: {n:'ANVIL',     d:`M-46,-21 L-24,-31 L34,-31 L34,-12 L14,-12 L14,12 L30,12 L30,31 L-30,31 L-30,12 L-14,12 L-14,-12 L-24,-12 Z`},
  crucible:  {n:'CRUCIBLE',  d:`M-30,-24 L30,-24 L20,32 L-20,32 Z${_r(0,40,60,10)}${_r(0,-32,44,10)}`},
  pipeorgan: {n:'PIPES',     d:`${_r(-26,6,16,76)}${_r(0,-2,16,92)}${_r(26,10,16,68)}`},
  watchfire: {n:'WATCHFIRE', d:`M0,-44 C22,-18 26,0 12,20 C22,4 6,-4 0,-16 C-6,-4 -22,4 -12,20 C-26,0 -22,-18 0,-44 Z${_r(0,36,56,14)}`},
  drydock:   {n:'DRY DOCK',  d:`M-44,-6 L44,-6 L28,30 L-28,30 Z${_r(0,-30,8,48)}${_r(0,40,72,8)}`},
  crane:     {n:'CRANE',     d:`${_r(-24,4,14,88)}M-34,-46 L44,-46 L44,-34 L-34,-34 Z${_r(38,-16,7,36)}${_r(38,6,20,14)}`},
  containers:{n:'CONTAINERS',d:`${_r(-22,-26,40,26)}${_r(22,-26,40,26)}${_r(0,4,84,26)}${_r(-22,34,40,26)}${_r(22,34,40,26)}`},
  lighthouse:{n:'LIGHTHOUSE',d:`M-16,-34 L16,-34 L26,38 L-26,38 Z${_r(0,-42,30,10)}M-46,-24 L-26,-30 L-26,-18 Z M46,-24 L26,-30 L26,-18 Z`},
  keep:      {n:'KEEP',      d:`M-34,-34 L-22,-34 L-22,-24 L-6,-24 L-6,-34 L6,-34 L6,-24 L22,-24 L22,-34 L34,-34 L34,42 L-34,42 Z${_r(0,20,18,30)}`},
  library:   {n:'LIBRARY',   d:`M-42,-30 L-4,-22 L-4,34 L-42,26 Z M42,-30 L4,-22 L4,34 L42,26 Z`},
  vault:     {n:'VAULT',     d:`${_c(0,0,44)}${_c(0,0,32)}${_c(0,0,10)}${_r(0,0,6,84)}${_r(0,0,84,6)}`},
  workshop:  {n:'WORKSHOP',  d:`M-41,-31 L-31,-41 L41,31 L31,41 Z M31,-41 L41,-31 L-31,41 L-41,31 Z`},
  market:    {n:'MARKET',    d:`M-46,-24 L46,-24 L34,4 L-34,4 Z${_r(-24,24,10,44)}${_r(24,24,10,44)}${_r(0,42,60,8)}`},
  clocktower:{n:'CLOCK',     d:`M0,-48 L30,-25 L-30,-25 Z${_r(0,10,46,70)}${_c(0,-4,16)}${_c(0,-4,8)}`},
};

/* Six ways to cut a field. Each returns the region painted in the SECOND
   tincture, over a field already filled with the first. */
export const DIVISIONS=[
  {id:'plain',   n:'PLAIN',     f:null},
  {id:'pale',    n:'PER PALE',  f:(x,w,h)=>`M0,-${h} h${w} v${h*2} h-${w} Z`},
  {id:'fess',    n:'PER FESS',  f:(x,w,h)=>`M-${w},0 h${w*2} v${h} h-${w*2} Z`},
  {id:'bend',    n:'PER BEND',  f:(x,w,h)=>`M-${w},-${h} L${w},-${h} L-${w},${h} Z`},
  {id:'chevron', n:'CHEVRON',   f:(x,w,h)=>`M0,-${h*0.2} L${w},${h} L-${w},${h} Z`},
  {id:'quarter', n:'QUARTERLY', f:(x,w,h)=>`M0,-${h} h${w} v${h} h-${w} Z M-${w},0 h${w} v${h} h-${w} Z`},
];

export const hexs=v=>'#'+v.toString(16).padStart(6,'0');

/* The charge takes whichever of salt or pepper stands furthest from the field,
   computed off the integer rather than a THREE.Color since this module is
   imported by React and three.js would be a lot to pull in for a luminance. */
const _lum=hex=>((hex>>16&255)*0.2126+(hex>>8&255)*0.7152+(hex&255)*0.0722)/255;

/* ONE renderer, to a canvas, and the panel uses its data URL as a background
   image. */
export const SHIELD=(w,h)=>{
  /* A heater shield, drawn as a path so it can clip the field and be stroked
     afterwards for the bordure. */
  const p=new Path2D();
  p.moveTo(-w/2,-h/2); p.lineTo(w/2,-h/2); p.lineTo(w/2,-h*0.06);
  p.bezierCurveTo(w/2,h*0.30, w*0.26,h*0.44, 0,h/2);
  p.bezierCurveTo(-w*0.26,h*0.44, -w/2,h*0.30, -w/2,-h*0.06);
  p.closePath(); return p;
};
/* BANNER pulls the same field to a rectangle rather than a shield shape: a
   shield-shaped mesh needs alpha, and an alpha-tested plane comes back from the
   outline pass ringed as a full rectangle anyway. */
export function drawCrest(g,W_,H_,c,banner){
  g.clearRect(0,0,W_,H_);
  g.save(); g.translate(W_/2,H_/2);
  const w=banner?W_:W_*0.88, h=banner?H_:H_*0.88;
  const sh=banner?null:SHIELD(w,h);
  g.save(); if(sh) g.clip(sh,'evenodd');
  g.fillStyle=hexs(c.a); g.fillRect(-W_,-H_,W_*2,H_*2);
  const div=DIVISIONS.find(d=>d.id===c.div)||DIVISIONS[0];
  if(div.f){ g.fillStyle=hexs(c.b); g.fill(new Path2D(div.f(0,W_,H_)),'evenodd'); }
  g.restore();
  /* The charge sits on the field at 62% of the shield's width, which keeps it
     clear of the bordure and clear of the point. */
  const ch=CHARGES[c.charge]||CHARGES.obelisk;
  const s=w*(banner?0.66:0.62)/100;
  /* Averaged over both tinctures: under QUARTERLY the charge crosses all four
     quarters, so there is no single colour it is sitting on. */
  const L=div.f?(_lum(c.a)+_lum(c.b))/2:_lum(c.a);
  g.fillStyle=L>0.34?'#0F1218':'#FFFFFF';
  g.save(); g.translate(0,banner?0:-h*0.02); g.scale(s,s);
  g.fill(new Path2D(ch.d),'evenodd');
  g.restore();
  /* A bordure in the charge's own colour, so the mark reads as one object
     against a bright sky and against a dark panel without a second setting. */
  g.lineWidth=Math.max(1.5,w*0.045); g.strokeStyle=g.fillStyle;
  g.globalAlpha=0.55;
  if(sh) g.stroke(sh);
  else { const i=g.lineWidth; g.strokeRect(-W_/2+i/2,-H_/2+i/2,W_-i,H_-i); }
  g.globalAlpha=1;
  g.restore();
}

/* Cached by the crest's own contents. `null` on the server and anywhere without
   a canvas: the mark is chrome, so a page that cannot draw it renders without it. */
let _crestC=null, _crestKey='', _crestURL='';
export function crestDataUrl(c){
  if(!c||typeof document==='undefined') return '';
  const key=c.charge+c.div+c.a+c.b;
  if(key===_crestKey) return _crestURL;
  if(!_crestC){ _crestC=document.createElement('canvas');
                _crestC.width=176; _crestC.height=208; }
  const g=_crestC.getContext('2d');
  if(!g) return '';
  _crestKey=key;
  drawCrest(g,176,208,c);
  return _crestURL=_crestC.toDataURL();
}
