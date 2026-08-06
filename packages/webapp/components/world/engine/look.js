/* Six graded presets and the seven knobs that fork one, verbatim from devcraft
   `world-lab.html` (`fx` as booleans, the shape the API stores). Its own module
   so both the renderer's passes and the panel's bench list the same table.
   A look is a property of the world, not the viewer: the owner's grade is what
   every visitor sees it through. */

export const LOOK_DEFS=[
  {id:'diorama', n:'DIORAMA', sw:[0x272A32,0xF5F6FA],
   d:'The file\'s own art direction: soft ink on every silhouette, a warm key, and nothing pushed.',
   fx:{post:true,bloom:true,outline:true},
   sat:1.00, lift:0.05, vig:0.17, grain:0.026, warm:0.00, duo:0.00,
   duoA:0x272A32, duoB:0xF5F6FA, ink:0x2A2438, ol:0.24, bl:1.00},
  {id:'ink', n:'INK', sw:[0x1E2229,0xEBEEF5],
   d:'Illustrated rather than lit. Lines carry the shapes and the colour steps back behind them.',
   fx:{post:true,bloom:true,outline:true},
   sat:0.74, lift:0.04, vig:0.26, grain:0.050, warm:-0.08, duo:0.00,
   duoA:0x1E2229, duoB:0xEBEEF5, ink:0x1E2229, ol:0.78, bl:0.55},
  {id:'sun', n:'SUNPRINT', sw:[0x713015,0xFFF3B7],
   d:'No lines at all, and the glow let off its leash — an overexposed afternoon.',
   fx:{post:true,bloom:true,outline:false},
   sat:1.12, lift:0.03, vig:0.10, grain:0.018, warm:0.50, duo:0.00,
   duoA:0x713015, duoB:0xFFF3B7, ink:0x2A2438, ol:0.24, bl:1.90},
  {id:'blue', n:'BLUEPRINT', sw:[0x0B42C1,0xEBEEF5],
   d:'A cyanotype of your own world. The ramp does the colour, the outlines do the drawing.',
   fx:{post:true,bloom:true,outline:true},
   sat:0.30, lift:0.02, vig:0.20, grain:0.030, warm:-0.20, duo:0.82,
   duoA:0x0B42C1, duoB:0xEBEEF5, ink:0x00A0AB, ol:0.82, bl:0.50},
  {id:'riso', n:'RISO', sw:[0xCB3160,0xFFE877],
   d:'Two inks and visible tooth. The one look that reads as printed rather than rendered.',
   fx:{post:true,bloom:true,outline:true},
   sat:0.92, lift:0.03, vig:0.14, grain:0.085, warm:0.18, duo:0.58,
   duoA:0xCB3160, duoB:0xFFE877, ink:0xA51A14, ol:0.34, bl:1.10},
  {id:'storm', n:'STORM', sw:[0x1E2229,0xBAC4DA],
   d:'Cold, closed in, and heavily cornered.',
   fx:{post:true,bloom:true,outline:true},
   sat:0.82, lift:0.07, vig:0.44, grain:0.055, warm:-0.45, duo:0.30,
   duoA:0x1E2229, duoB:0xBAC4DA, ink:0x0F1218, ol:0.30, bl:1.25},
];

/* Kept to seven on purpose: each one should change the whole frame at a glance. */
export const LOOK_KNOBS=[
  {k:'ol',    n:'Outline', min:0,    max:1,    step:0.02},
  {k:'bl',    n:'Glow',    min:0,    max:2.6,  step:0.05},
  {k:'duo',   n:'Duotone', min:0,    max:1,    step:0.02},
  {k:'warm',  n:'Warmth',  min:-1,   max:1,    step:0.02},
  {k:'sat',   n:'Colour',  min:0,    max:1.6,  step:0.02},
  {k:'grain', n:'Grain',   min:0,    max:0.12, step:0.002},
  {k:'vig',   n:'Corners', min:0,    max:0.6,  step:0.01},
];

/** What a preset becomes the moment a knob moves. Never a `base`. */
export const LOOK_FORKED_ID='mine';

export const lookPreset=id=>LOOK_DEFS.find(l=>l.id===id)||LOOK_DEFS[0];

/* Percent for anything that reads as an amount, three decimals for grain, which
   lives entirely inside the first two. */
export const fmtKnob=(k,v)=>k==='grain'?v.toFixed(3).slice(1)
  :k==='bl'||k==='sat'?v.toFixed(2)
  :`${Math.round(v*100)}`;

/**
 * A look as it is stored: every knob, both duotone inks, the ink colour and the
 * three passes, plus which preset it was forked from.
 *
 * `name` stays empty — a look of your own is just the knobs, never a thing to
 * christen. `base` records which preset a fork started from; nothing reads it
 * yet, but it can't be recovered afterwards.
 */
export const lookFromPreset=id=>{
  const src=lookPreset(id);
  return {
    id:src.id, base:src.id, mine:false, name:'',
    ol:src.ol, bl:src.bl, duo:src.duo, warm:src.warm, sat:src.sat,
    grain:src.grain, vig:src.vig, lift:src.lift,
    duoA:src.duoA, duoB:src.duoB, ink:src.ink,
    fx:{...src.fx},
  };
};

export const DEFAULT_LOOK_ID=LOOK_DEFS[0].id;

/* Any knob turns the preset into a look of your own; not a mode you enter. */
export const forkLook=(look,patch)=>({
  ...look, ...patch,
  ...(look.mine?null:{id:LOOK_FORKED_ID, base:look.id, mine:true}),
});
