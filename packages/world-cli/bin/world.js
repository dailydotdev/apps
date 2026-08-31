#!/usr/bin/env node
/**
 * `world` — author objects for your daily.dev world.
 *
 * Four commands on purpose.
 *
 *   inspect the whole world as topic names, levels and available families so a
 *           coding agent can conduct the creative conversation before it
 *           chooses an implementation target.
 *
 *   check   pure validation. No browser, no GPU, sub-second, exits non-zero on
 *           failure. This is the inner loop, because an agent is reliable at
 *           "run a command, read stdout" and unreliable at watching for a file
 *           to change underneath it.
 *
 *   create  adds one family to a realm object set, or an explicit district
 *           override when that exception is requested.
 *
 *   dev     watches the entire project and streams every valid builder into the
 *           browser. The renderer stays in the page: it is the only renderer, so what the
 *           reader sees is what everyone else would see, and there is no second
 *           pipeline to drift.
 *
 * There is no account auth anywhere in here. A world is public unless its owner
 * hid it. The local preview identifies the public user it was started for, and
 * the page only connects when that identity matches the world being viewed.
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  budgetOf,
  FAMILIES,
  FAMILY_KINDS,
  paletteKeys,
  REALMS,
  realmOf,
  rolesOf,
  runBuilder,
  runRealmBuilder,
  unlockedFamilies,
} from "@dailydotdev/world-kit";
import { fetchWorld, realmLevelOf } from "../src/world.js";
import { loadModule } from "../src/load.js";
import { printReport } from "../src/report.js";
import { startDev } from "../src/dev.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_API = process.env.WORLD_API ?? "https://api.daily.dev/graphql";

const REALM_NAMES = {
  swarm: "Arcane Swarm",
  frame: "Frameworks",
  forge: "Metal Forges",
  ship: "Shipyards",
  bastion: "Bastion",
  quarter: "Artisan's Quarter",
};

const args = process.argv.slice(2);
const command = args[0];

const flag = (name, dflt = undefined) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return dflt;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
};
const positional = args.slice(1).filter((a, i, all) => {
  if (a.startsWith("--")) return false;
  const prev = all[i - 1];
  return !prev?.startsWith("--");
});

const die = (message) => {
  process.stderr.write(`${message}\n`);
  process.exit(1);
};

const exists = (p) =>
  access(p).then(
    () => true,
    () => false
  );

/** Resolve which district and family we are authoring for, against the real world. */
async function resolveTarget(handle, { district, family }) {
  const { user, districts } = await fetchWorld(handle, { api: DEFAULT_API });
  if (!districts.length) {
    die(
      `${user.name}'s world is empty or private. A private world returns nothing to an anonymous reader, which is what this is.`
    );
  }
  const target = district
    ? districts.find((d) => d.niche === district)
    : districts[0];
  if (!target) {
    die(
      `No district "${district}" in this world. Try one of: ${districts
        .slice(0, 12)
        .map((d) => d.niche)
        .join(", ")}`
    );
  }
  const realm = realmOf(target.niche);
  if (!realm) die(`"${target.niche}" is not a district the renderer knows.`);

  const open = unlockedFamilies(target.level);
  const fam =
    family ?? (open.includes("house") ? "house" : open[open.length - 1]);
  if (!FAMILY_KINDS.includes(fam))
    die(`Unknown family "${fam}". Available: ${FAMILY_KINDS.join(", ")}`);
  if (!open.includes(fam)) {
    die(
      `"${fam}" is not unlocked in ${target.niche} at level ${
        target.level
      }. Unlocked here: ${open.join(", ")}`
    );
  }
  return { user, realm, ...target, family: fam, districts };
}

async function builderSource(realm, family) {
  /* Filled in with the REALM's own material names. A starting file that says
     `stone` is a starting file that fails to validate in the forges, and the
     first thing anyone sees should not be an error about a colour they did not
     choose. */
  const roles = rolesOf(realm);
  return (
    await readFile(join(HERE, "..", "templates", "object.js"), "utf8")
  )
    .replace(/__WALL__/g, roles.wall)
    .replace(/__ROOF__/g, roles.roof)
    .replace(/__TRIM__/g, roles.trim)
    .replace(/__REALM__/g, realm)
    .replace(/__FAMILY__/g, family)
    .replace(/__NAME__/g, FAMILIES[family].name);
}

async function resolveRealmTarget(handle, { realm, district, family }) {
  const resolved = await resolveTarget(handle, {
    district,
    family: district ? family : undefined,
  });
  if (district) return { ...resolved, scope: "district" };

  const selectedRealm = realm ?? resolved.realm;
  if (!REALMS.includes(selectedRealm)) {
    die(`Unknown realm "${selectedRealm}". Available: ${REALMS.join(", ")}`);
  }
  const realmDistricts = resolved.districts.filter(
    (item) => realmOf(item.niche) === selectedRealm
  );
  if (!realmDistricts.length) {
    die(`This world has no districts in ${REALM_NAMES[selectedRealm]}.`);
  }
  const level = realmLevelOf(
    realmDistricts.reduce((total, item) => total + item.reads, 0)
  );
  const open = unlockedFamilies(level);
  const selectedFamily = family ?? (open.includes("house") ? "house" : open.at(-1));
  if (!FAMILY_KINDS.includes(selectedFamily)) {
    die(`Unknown family "${selectedFamily}". Available: ${FAMILY_KINDS.join(", ")}`);
  }
  if (!open.includes(selectedFamily)) {
    die(
      `"${selectedFamily}" is not unlocked in ${REALM_NAMES[selectedRealm]} at realm level ${level}. Unlocked here: ${open.join(", ")}`
    );
  }

  return {
    ...resolved,
    scope: "realm",
    realm: selectedRealm,
    niche: null,
    level,
    family: selectedFamily,
    realmDistricts,
  };
}

async function scaffoldRealm(file, realm, family) {
  const addition = await builderSource(realm, family);
  if (!(await exists(file))) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, addition);
    return "created";
  }

  const source = await readFile(file, "utf8");
  if (new RegExp(`export\\s+function\\s+${family}\\b`).test(source)) {
    return "already exports this family";
  }
  await writeFile(file, `${source.trimEnd()}\n\n${addition}`);
  return "added family";
}

async function scaffoldOverride(file, realm, family) {
  if (await exists(file)) return "already exists";
  const source = (await builderSource(realm, family)).replace(
    `export function ${family}`,
    "export default function build"
  );
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, source);
  return "created";
}

async function runInspect() {
  const handle = positional[0] ?? process.env.WORLD_USER;
  if (!handle) die("Usage: world inspect <handle> [--json]");

  const { user, districts } = await fetchWorld(handle, { api: DEFAULT_API });
  if (!districts.length) {
    die(
      `${user.name}'s world is empty or private. A private world returns nothing to an anonymous reader, which is what this is.`
    );
  }

  const realms = [];
  for (const district of districts) {
    const realm = realmOf(district.niche);
    if (!realm) continue;
    let group = realms.find(({ id }) => id === realm);
    if (!group) {
      group = { id: realm, name: REALM_NAMES[realm], districts: [] };
      realms.push(group);
    }
    group.districts.push({
      topic: district.topic,
      slug: district.niche,
      level: district.level,
      reads: district.reads,
      families: unlockedFamilies(district.level),
    });
  }

  realms.forEach((realm) => {
    realm.reads = realm.districts.reduce(
      (total, district) => total + district.reads,
      0
    );
    realm.level = realmLevelOf(realm.reads);
    realm.families = unlockedFamilies(realm.level);
  });

  const result = {
    user: { id: user.id, handle: user.username, name: user.name },
    realms,
  };

  if (flag("json")) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${user.name}'s world\n`);
  realms.forEach((realm) => {
    process.stdout.write(`\n${realm.name}  realm level ${realm.level}\n`);
    realm.districts.forEach((district) => {
      process.stdout.write(`  ${district.topic}  level ${district.level}\n`);
    });
  });
}

async function runCheck() {
  const file = resolve(positional[0] ?? "frame.js");
  const handle = flag("user") ?? process.env.WORLD_USER;
  const asJson = !!flag("json");
  const fileRealm = REALMS.includes(basename(file, extname(file)))
    ? basename(file, extname(file))
    : null;

  const loaded = await loadModule(file);
  if (loaded.error) {
    const report = {
      ok: false,
      realm: fileRealm ?? flag("realm") ?? "frame",
      niche: flag("district") ?? null,
      family: flag("family") ?? "unknown",
      level: null,
      errors: [String(loaded.error.message || loaded.error).split("\n")[0]],
      warnings: [],
    };
    printReport(report, { json: asJson, file });
    process.exit(1);
  }

  if (fileRealm) {
    const family =
      flag("family") ??
      FAMILY_KINDS.find((kind) => typeof loaded.module[kind] === "function");
    if (!family || typeof loaded.module[family] !== "function") {
      die(
        `${file} does not export ${family ?? "a known family"}. Available: ${FAMILY_KINDS.join(", ")}`
      );
    }
    const report = runRealmBuilder(loaded.module[family], {
      realm: fileRealm,
      family,
      source: loaded.source,
    });
    printReport(report, { json: asJson, file });
    process.exit(report.ok ? 0 : 1);
  }

  let ctx;
  if (handle) {
    const t = await resolveTarget(handle, {
      district: flag("district"),
      family: flag("family"),
    });
    ctx = { realm: t.realm, niche: t.niche, family: t.family, level: t.level };
  } else {
    /* Offline: the district still has to be named, because realm decides which
       colours exist and level decides how much room there is. */
    ctx = {
      realm: flag("realm") ?? "frame",
      niche: flag("district") ?? "js_ts",
      family: flag("family") ?? "house",
      level: Number(flag("level") ?? 8),
    };
  }

  const report = runBuilder(loaded.module.default, {
    ...ctx,
    source: loaded.source,
  });

  printReport(report, { json: asJson, file });
  process.exit(report.ok ? 0 : 1);
}

async function runCreate() {
  const handle = positional[0] ?? process.env.WORLD_USER;
  if (!handle) {
    die(
      "Usage: world create <handle> [--realm forge] [--family house] [--dir builders]"
    );
  }

  const t = await resolveRealmTarget(handle, {
    realm: flag("realm"),
    district: flag("district"),
    family: flag("family"),
  });
  const directory = resolve(flag("dir") ?? "builders");
  const defaultName =
    t.scope === "realm"
      ? `${t.realm}.js`
      : `${t.niche}-${t.family}.js`;
  const file = resolve(flag("file") ?? join(directory, defaultName));
  const result =
    t.scope === "realm"
      ? await scaffoldRealm(file, t.realm, t.family)
      : await scaffoldOverride(file, t.realm, t.family);
  const budget = budgetOf(t.family, t.level);

  process.stdout.write(
    [
      "",
      t.scope === "realm"
        ? `  realm      ${REALM_NAMES[t.realm]}, ${t.realmDistricts.length} districts`
        : `  override   ${t.niche} (${t.realm}), level ${t.level}, ${t.reads} reads`,
      `  family     ${t.family}, tier ${
        budget.tier
      }, envelope ${budget.envelope.join(" x ")}`,
      `  budget     ${budget.maxOps} shapes, ${budget.maxTriangles} triangles, ${budget.maxGlow} glow`,
      `  file       ${file}  (${result})`,
      `  colours    ${paletteKeys(t.realm).join(", ")}`,
      "",
    ].join("\n")
  );
}

async function runDev() {
  const handle = positional[0] ?? process.env.WORLD_USER;
  if (!handle) die("Usage: world dev <handle> [--dir builders]");

  const { user, districts } = await fetchWorld(handle, { api: DEFAULT_API });
  if (!districts.length) {
    die(
      `${user.name}'s world is empty or private. A private world returns nothing to an anonymous reader, which is what this is.`
    );
  }

  const directory = resolve(flag("dir") ?? "builders");
  await mkdir(directory, { recursive: true });
  const port = Number(flag("port") ?? 4321);
  const targets = districts
    .map((district) => ({
      ...district,
      realm: realmOf(district.niche),
      families: unlockedFamilies(district.level),
    }))
    .filter((district) => !!district.realm);

  await startDev({
    directory,
    port,
    user,
    targets,
  });

  process.stdout.write(
    [
      "",
      `  ${user.name}'s world`,
      `  project    ${directory}`,
      `  districts  ${targets.length} available across realm object sets`,
      `  user       @${user.username ?? handle}`,
      "",
      "  daily.dev connects automatically while Program your world is open.",
      "  Changed realm object sets are synchronized as one transaction. Ctrl-C to stop.",
      "  The owner publishes the reviewed preview with Save changes in daily.dev.",
      "",
    ].join("\n")
  );
}

async function runPalette() {
  const realm = flag("realm") ?? "frame";
  process.stdout.write(`${paletteKeys(realm).join("\n")}\n`);
}

const HELP = `
  world inspect <handle> inspect every realm, topic, level and available family
  world create <handle>  add a family to a realm object set
  world dev <handle>     live-reload the entire project into your world
  world check <file>     validate one exported family, exit non-zero if it fails
  world palette          list the colour names a realm allows

  --realm <id>           realm object set (default: realm of your biggest district)
  --district <slug>      create an optional district override instead
  --family <name>        house, tower, hall, garden, plant, lamp, feature,
                         landmark, monument
  --file <path>          object-set or override file
  --dir <path>           local world project builders (default: builders)
  --level <n>            check offline against a rung, without a handle
  --json                 machine-readable report
  --port <n>             dev server port (default 4321)
`;

const main = {
  inspect: runInspect,
  create: runCreate,
  dev: runDev,
  check: runCheck,
  palette: runPalette,
}[command];
if (!main) {
  process.stdout.write(`${HELP}\n`);
  process.exit(command ? 1 : 0);
}
main().catch((error) => die(error.stack ?? String(error)));
