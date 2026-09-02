# @dailydotdev/world-cli

Author the objects in your [daily.dev world](https://daily.dev/world).

Your reading decides how big a district is, which objects stand in it and how
many. This decides what they look like.

The Customize your world panel on daily.dev provides a prompt for a local coding
agent. The agent reads the webapp-hosted instructions, installs this CLI through
`npx`, inspects the whole world and operates the live preview for the reader.

## Commands

|                                       |                                                    |
| ------------------------------------- | -------------------------------------------------- |
| `world inspect <handle>`              | list every realm, topic, level and unlocked family |
| `world create <handle>`               | add a family to a realm object set                  |
| `world dev <handle>`                  | live-reload the entire project into your world     |
| `world check <file>`                  | validate a builder, non-zero exit if it fails      |
| `world palette --realm forge`         | the colour names a realm allows                    |

`dev` identifies the project by the daily.dev user it was started for. The
matching Program your world panel reconnects automatically across refreshes and
future edits. It watches every `<realm>.js` object set and optional
`<district>-<family>.js` override under `--dir`. It batches generator bursts,
ignores content-identical rewrites and restores a reconnecting tab with one
compressed project snapshot.

## Writing a builder

```js
export function house(w) {
  const h = 0.7 + w.rnd() * 0.3;
  w.cyl(0.42, 0.5, h, 10)
    .mat("brick", { rough: 0.9 })
    .at(0, h / 2, 0);
  w.cone(0.56, 0.4, 10)
    .mat("iron")
    .at(0, h + 0.2, 0);
  w.box(0.2, 0.24, 0.06).glow("lavaHot", 1.8).at(0, 0.22, 0.45);
}

export function landmark(w) {
  const h = 2 + w.tier * 1.5;
  w.cyl(0.4, 0.8, h, 8).mat("iron").at(0, h / 2, 0);
  w.sphere(1.2 + w.tier * 0.4, 10, 7)
    .glow("accent", 1.2)
    .at(0, h, 0);
}
```

Shapes are `box`, `cyl`, `sphere`, `cone`, `torus`, `octa`, `plane`. Chain
`.mat(name, opts)`, `.glow(name, intensity)`, `.at()`, `.rot()`, `.scale()`.

Three rules carry the rest:

- **One object set serves a realm.** Its districts and zoomed-out island reuse
  the same builders, palettes and seeded variants. `w.tier` expresses growth.
- **Colours are names, not hex.** Each destination resolves them through its
  own palette.
- **You do not set the size.** What you draw is fitted into an envelope your
  reading earned. Build at a natural scale, keep the base at `y = 0`.
- **`w.rnd()` is the only randomness.** The file is run once per seed and the
  results compared, so `Math.random` is rejected rather than tolerated.

## Working with an agent

The agent guide is deployed with the webapp at `/app/world-agent.md`, so its
conversation and workflow can change with the UI without publishing a new CLI.
The CLI remains authoritative for the executable contract. `check --json`
carries the numbers; `sourceHash` tells the agent whether a report belongs to
the file it just wrote.

## How it works

Your source runs locally against a recorder that logs calls instead of building
geometry. Each realm family is compiled into three level tiers with five seeded
variants. Only those recorded ops reach the daily.dev tab, where the shipped
renderer installs the project in one transaction and replays it through its own
materials. Nobody visiting your world executes a line of your code.
