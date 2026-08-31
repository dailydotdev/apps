/**
 * One local world project, synchronized as transactions.
 *
 * `<realm>.js` exports any number of realm-wide family builders. Those builders
 * are compiled for all three level tiers and reused by every district in the
 * realm and by its zoomed-out island. A `<district>-<family>.js` default export
 * is an optional district override.
 *
 * The event stream carries manifests and small patches, never a replay burst.
 * A reconnect fetches one gzip-compressed snapshot and the browser installs it
 * in one engine transaction. File events are settled as a project batch and
 * content hashes make generators that touch unchanged files free.
 */

import { createServer } from "node:http";
import { watch } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { basename, extname, resolve } from "node:path";
import {
  FAMILY_KINDS,
  hashSource,
  REALMS,
  runBuilder,
  runRealmBuilder,
} from "@dailydotdev/world-kit";
import { loadModule } from "./load.js";
import { printReport } from "./report.js";

const SETTLE_MS = 220;
const PROTOCOL_VERSION = 2;

const allowedOrigin = (origin) => {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const daily =
      url.hostname === "daily.dev" || url.hostname.endsWith(".daily.dev");
    return ["http:", "https:"].includes(url.protocol) && (local || daily)
      ? url.origin
      : null;
  } catch {
    return null;
  }
};

const corsFor = (req) => {
  const origin = allowedOrigin(req.headers.origin);
  return {
    ...(origin ? { "access-control-allow-origin": origin } : null),
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-private-network": "true",
    vary: "Origin",
  };
};

const json = (req, res, status, body) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...corsFor(req),
  });
  res.end(JSON.stringify(body));
};

const compressedJson = (req, res, body) => {
  const zipped = gzipSync(JSON.stringify(body));
  res.writeHead(200, {
    "content-type": "application/json",
    "content-encoding": "gzip",
    "content-length": zipped.length,
    "cache-control": "no-store",
    ...corsFor(req),
  });
  res.end(zipped);
};

const exists = (file) =>
  access(file).then(
    () => true,
    () => false
  );

const keyOf = ({ scope, realm, niche, family }) =>
  `${scope}:${scope === "realm" ? realm : niche}:${family}`;

const targetForOverride = (file, targets) => {
  const stem = basename(file, extname(file));
  const family = FAMILY_KINDS.find((kind) => stem.endsWith(`-${kind}`));
  if (!family) return null;

  const niche = stem.slice(0, -(family.length + 1));
  const district = targets.find((target) => target.niche === niche);
  if (!district) {
    return { error: `${basename(file)} names an unknown district "${niche}"` };
  }
  if (!district.families.includes(family)) {
    return {
      error: `${family} is not unlocked in ${niche} at level ${district.level}`,
    };
  }

  return { scope: "district", ...district, family };
};

const realmForFile = (file) => {
  const stem = basename(file, extname(file));
  return REALMS.includes(stem) ? stem : null;
};

const frameFor = (report, target) => {
  const payload = report.ok
    ? report.scope === "realm"
      ? { tiers: report.tiers }
      : { variants: report.variants }
    : null;

  return {
    scope: target.scope,
    realm: target.realm,
    niche: target.niche ?? null,
    family: target.family,
    opsVersion: report.opsVersion ?? 1,
    level: report.level ?? target.level ?? null,
    sourceHash: report.sourceHash ?? null,
    payloadHash: payload ? hashSource(JSON.stringify(payload)) : null,
    budget: report.budget ?? null,
    usage: report.usage ?? null,
    warnings: report.warnings ?? [],
    errors: report.errors ?? [],
    ...(payload ? { payload } : null),
  };
};

const withoutPayload = ({ payload: _payload, ...report }) => report;

export async function startDev({ directory, port, targets, user }) {
  const clients = new Set();
  const builders = new Map();
  const removedTargets = new Map();
  const fileHashes = new Map();
  let version = 0;

  const send = (res, event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  const broadcast = (event) => {
    for (const res of clients) send(res, event);
  };
  const snapshot = () => ({
    protocol: PROTOCOL_VERSION,
    user,
    version,
    entries: [...builders.values()].flatMap(({ good }) =>
      good ? [good] : []
    ),
    reports: [...builders.values()].map(({ status }) => status),
    removals: [...removedTargets.values()],
  });
  const readyFrame = () => ({
    type: "ready",
    protocol: PROTOCOL_VERSION,
    user,
    version,
    builders: snapshot().entries.length,
  });

  const removeFile = (file) => {
    const removals = [];
    for (const [key, builder] of builders) {
      if (builder.file !== file) continue;
      builders.delete(key);
      if (builder.good) {
        removals.push(builder.target);
        removedTargets.set(key, builder.target);
      }
    }
    fileHashes.delete(file);
    return removals;
  };

  const install = (file, target, report) => {
    const frame = frameFor(report, target);
    const key = keyOf(target);
    const previous = builders.get(key);
    if (report.ok) removedTargets.delete(key);
    const status = withoutPayload(frame);
    builders.set(key, {
      file,
      target,
      status,
      good: report.ok ? frame : previous?.good,
    });
    printReport(report, { json: false, file });

    return {
      upsert:
        report.ok && frame.payloadHash !== previous?.good?.payloadHash
          ? frame
          : null,
      report: status,
    };
  };

  const rebuildFile = async (file, why) => {
    if (!(await exists(file))) {
      return { upserts: [], removals: removeFile(file), reports: [] };
    }

    const source = await readFile(file, "utf8");
    const sourceHash = hashSource(source);
    if (fileHashes.get(file) === sourceHash) {
      return { upserts: [], removals: [], reports: [] };
    }

    const realm = realmForFile(file);
    const override = realm ? null : targetForOverride(file, targets);
    if (!realm && !override) {
      return { upserts: [], removals: [], reports: [] };
    }
    if (override?.error) {
      process.stderr.write(`FAIL  ${why}: ${file}\n${override.error}\n\n`);
      return { upserts: [], removals: [], reports: [] };
    }

    const loaded = await loadModule(file, source);
    const upserts = [];
    const reports = [];
    const removals = [];

    if (loaded.error) {
      const message = String(loaded.error.message || loaded.error).split(
        "\n"
      )[0];
      const owned = [...builders.values()].filter(
        (builder) => builder.file === file
      );
      /* A file that has never built still gets a failure report — a broken
         file that reports nothing reads as "waiting" everywhere. Its exports
         are unknowable before it evaluates, so the failure is pinned to one
         well-known family. */
      const failed = owned.length
        ? owned.map((builder) => builder.target)
        : [
            override ?? {
              scope: "realm",
              realm,
              niche: null,
              family: "house",
              level: null,
            },
          ];
      for (const target of failed) {
        const result = install(file, target, {
          ok: false,
          sourceHash,
          realm: target.realm,
          niche: target.niche ?? null,
          family: target.family,
          level: target.level ?? null,
          errors: [message],
          warnings: [],
        });
        reports.push(result.report);
      }
      /* The hash is NOT cached on failure: re-saving the same broken content
         must report again, not vanish into the unchanged-file skip. */
      return { upserts, removals, reports };
    }
    fileHashes.set(file, sourceHash);

    if (realm) {
      const before = [...builders.entries()].filter(
        ([, builder]) => builder.file === file
      );
      const exported = FAMILY_KINDS.filter(
        (family) => typeof loaded.module[family] === "function"
      );
      const removedFamilies = before.filter(
        ([, builder]) => !exported.includes(builder.target.family)
      );
      for (const [key, builder] of removedFamilies) {
        builders.delete(key);
        if (builder.good) {
          removals.push(builder.target);
          removedTargets.set(key, builder.target);
        }
      }

      for (const family of exported) {
        const target = {
          scope: "realm",
          realm,
          niche: null,
          family,
          level: null,
        };
        const report = runRealmBuilder(loaded.module[family], {
          realm,
          family,
          source,
        });
        const result = install(file, target, report);
        if (result.upsert) upserts.push(result.upsert);
        reports.push(result.report);
      }

      if (!exported.length) {
        process.stderr.write(
          `FAIL  ${why}: ${file}\nExport at least one family: ${FAMILY_KINDS.join(
            ", "
          )}\n\n`
        );
      }
    } else {
      const report = runBuilder(loaded.module.default, {
        ...override,
        source,
      });
      const result = install(file, override, report);
      if (result.upsert) upserts.push(result.upsert);
      reports.push(result.report);
    }

    return { upserts, removals, reports };
  };

  const flush = async (files, why) => {
    const upserts = [];
    const removals = [];
    const reports = [];
    for (const file of files) {
      const result = await rebuildFile(file, why);
      upserts.push(...result.upserts);
      removals.push(...result.removals);
      reports.push(...result.reports);
    }
    if (!upserts.length && !removals.length && !reports.length) return;
    version += 1;
    broadcast({ type: "patch", version, upserts, removals, reports });
  };

  const initial = await readdir(directory, { withFileTypes: true });
  for (const entry of initial) {
    if (!entry.isFile() || extname(entry.name) !== ".js") continue;
    await rebuildFile(resolve(directory, entry.name), "start");
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.headers.origin && !allowedOrigin(req.headers.origin)) {
      return json(req, res, 403, { error: "origin is not allowed" });
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, corsFor(req));
      return res.end();
    }

    if (url.pathname === "/") {
      return json(req, res, 200, {
        status: "The daily.dev world page connects automatically.",
        protocol: PROTOCOL_VERSION,
        user,
        directory,
        builders: readyFrame().builders,
        version,
      });
    }

    if (url.pathname === "/context") {
      return json(req, res, 200, {
        protocol: PROTOCOL_VERSION,
        user,
        directory,
        version,
        builders: snapshot().entries.map((entry) => ({
          scope: entry.scope,
          realm: entry.realm,
          niche: entry.niche,
          family: entry.family,
          sourceHash: entry.sourceHash,
          payloadHash: entry.payloadHash,
        })),
      });
    }

    if (url.pathname === "/snapshot") {
      return compressedJson(req, res, snapshot());
    }

    if (url.pathname === "/events") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        ...corsFor(req),
      });
      res.write(": connected\n\n");
      clients.add(res);
      send(res, readyFrame());
      req.on("close", () => clients.delete(res));
      return undefined;
    }

    return json(req, res, 404, { error: "not found" });
  });

  await new Promise((done) => server.listen(port, "127.0.0.1", done));

  const pending = new Set();
  let timer;
  watch(directory, (_event, name) => {
    if (!name || extname(name.toString()) !== ".js") return;
    pending.add(resolve(directory, name.toString()));
    clearTimeout(timer);
    timer = setTimeout(() => {
      const files = [...pending];
      pending.clear();
      flush(files, "change").catch((error) =>
        process.stderr.write(`${error.stack ?? error}\n`)
      );
    }, SETTLE_MS);
  });

  return { directory, port };
}
