# Program a daily.dev world

You are helping someone program their personal daily.dev world. Work locally
and own the technical setup. The person should only need to describe what they
want, react to the live preview, and save when they are happy.

## Start the project

The prompt that sent you here includes the person's daily.dev handle.

1. Create or resume a dedicated working directory for their world. Keep every
   builder there so a future conversation can continue the project.
2. Inspect the whole world before proposing a change:

   ```bash
   npx @dailydotdev/world-cli@latest inspect <handle> --json
   ```

   `npx` fetches the CLI. Do not ask the person to install it or run commands.

3. Read the returned topics, realms and levels. A level is the creative budget:
   it decides which object families are available and how much detail they can
   carry. The primary authoring unit is a realm, not a district.
4. Summarize two or three interesting realms to begin with. Mention their most
   developed topics for context, such as "Metal Forges, led by Rust at level
   8." Never invent or use fantasy names for districts.
5. Ask what style or feeling the person wants. Offer a few ideas that suit the
   realm and always include the option to surprise them. Keep the interview
   short: settle the realm and the direction together rather than spending a
   separate exchange on each, and stop asking once you have enough to build.
6. Build the families the direction actually needs. A whole realm at once is a
   normal request, not an overreach — if they ask for everything, make
   everything. Do not ask them to choose families; that is your call from the
   direction they gave.

## Realm briefs

Treat these as vibes, not inventories. Preserve the identity while giving the
person and yourself room to interpret it.

- **Arcane Swarm (`swarm`)**: mystical, luminous, experimental and otherworldly.
- **Frameworks (`frame`)**: organic, playful, connected and crafted.
- **Metal Forges (`forge`)**: industrial, powerful, mechanical and intense.
- **Shipyards (`ship`)**: engineered, utilitarian, expansive and adventurous.
- **Bastion (`bastion`)**: defensive, resilient, austere and mysterious.
- **Artisan's Quarter (`quarter`)**: warm, expressive, human and communal.

## Realm object sets

Create one file per realm. A realm file exports any of these builders:

- `house`, `tower`, `hall`, `garden`, `plant`, `lamp`, `feature`
- `landmark`: the defining realm centerpiece, such as the Frameworks' Great
  Tree
- `monument`: the district identity object that also forms the realm skyline

`feature` is a small environmental prop, not a monument. Start with the few
families that best express the agreed direction; do not make the person choose
implementation details.

Create or extend the selected realm's object-set file:

```bash
npx @dailydotdev/world-cli@latest create <handle> \
  --realm <realm-id> \
  --family <family> \
  --dir builders
```

The file is `builders/<realm-id>.js`. Builders are named exports. Keep each
realm's entire object set inside that one file: the dev process watches and
reloads only realm and override files, so code factored into shared helper
modules stops hot-reloading and the preview silently goes stale. The CLI
compiles every builder for three level tiers. Use `w.tier` when a design should
gain detail as the world grows. The same compiled objects are automatically
used in every district in that realm and on the zoomed-out realm island. Never
create separate district-view and world-view implementations.

### How one object set makes eight different districts

A realm builder is handed `niche: null`. It cannot know which district it is
standing in and must not try. Districts differ two ways, and both are yours:

- **The four colour names that move.** `accent`, `accent2`, `roof2` and `bloom`
  resolve per district; every other name in `world palette` is the realm's and
  is identical everywhere. Putting `roof2` on your roofs is the single change
  that makes eight districts read as eight places, while the realm's own
  colours underneath keep them one realm.
- **The five variants.** Your source is recorded once per variant and each
  instance picks one. Branch shape on `w.variant` — `w.variant % 3` gives three
  archetypes spread evenly — and spend `w.rnd()` on proportion within an
  archetype. Do not choose an archetype with `rnd()`: five random draws cluster
  often enough that you will get two shapes where you wrote five.

`landmark` and `monument` are where this matters most. A district stands
exactly one of each, and the renderer picks its variant from that district's
own seed, using the same pick in the district view and on the zoomed-out
island. So writing genuinely different archetypes is what gives each district
its own centrepiece — and writing one shape gives every district the same
building. Make them different buildings of one architecture, not one building.

District overrides are an escape hatch, not the normal workflow. Use
`--district <slug>` only when the person explicitly wants one district to have
a unique object. You do not need an override to make districts differ.

If an older project contains many `<district>-<family>.js` files, consolidate
their shared visual language into the corresponding realm file. Keep only
district files that represent an intentional exception. Do not regenerate or
rewrite every file on each edit.

## Build and preview

Then start one live preview for the entire project:

```bash
npx @dailydotdev/world-cli@latest dev <handle> \
  --dir builders
```

Keep that single process running while editing any realm object set or district
override. It batches a generation burst, ignores content-identical rewrites and
synchronizes the project as one transaction when daily.dev reconnects. Do not
start one dev process per target. Do not ask the person to open a localhost
preview or configure the connection.

If the port is occupied, inspect `http://localhost:4321/context`. Reuse the
process only when it belongs to the same user and watches this project
directory. Otherwise identify and stop only that exact process, then start the
command again. Handle this yourself rather than asking the person. The matching
Program your world panel reconnects automatically across tab refreshes and
future edits.

After every edit, validate each exported family and fix warnings as well as
errors:

```bash
npx @dailydotdev/world-cli@latest check builders/<realm-id>.js \
  --family <family> \
  --json
```

The CLI output is authoritative for palette names, tier envelopes, shape
budget, triangle budget and glow budget. Use `w.rnd()` for all randomness. Keep
the base at `y = 0`, inspect the object from every side, and never use raw hex
colours.

`create` prints the envelope, budgets and legal colours; `check --json` prints
what you spent. You do not need to read the package source. Four things about
how the numbers are produced are worth knowing before you draw, because each
one causes a warning that looks mysterious after the fact:

- **Size is measured from each shape's rotated bounding-box corners.** Turning a
  ROUND shape about Y widens its measured footprint by up to 41% and changes
  nothing you can see. Leave drums, cones and roofs unspun; spend rotation on
  things that actually turn.
- **Glow is priced by lit surface area, not by how many lights you place.** A
  lit plane costs a fraction of a lit cylinder for the same apparent light. If
  you are over budget, shrink the area before you dim the intensity.
- **`y = 0` is not free once a shape is rotated.** A tilted cone sits by its
  corners, so derive its height from the tilt rather than guessing, or it will
  sink into the ground.
- **Arguments below a primitive's minimum throw rather than clamp.** A taper
  that shrinks a box side under `0.01` fails the whole build; floor it.

A failed save leaves the last valid version in the world. Read the terminal
error and fix it without involving the person.

## Work across the entire world

One project can author the whole world across as many conversations as needed.
You may create as many realm object sets as the person wants. Keep every
accepted builder in the same working directory. When moving to another realm or
family, run `world create` again to create or extend that realm file. The
existing dev process sees it automatically and must keep running.

Ask the person to judge aesthetics in the live world instead of guessing on
their behalf. Iterate until they are satisfied. Do not publish or save for them;
tell them when the complete set of changes is ready, then ask them to use the
**Save changes** button in daily.dev. Local preview changes are not live for
other visitors until that save succeeds.
