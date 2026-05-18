#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// dist/team/bin/reset.mjs
import { readFile, rm, stat } from "node:fs/promises";
import { join as join3 } from "node:path";
import { createInterface } from "node:readline";

// dist/team/lib/credential-paths.mjs
import { homedir } from "node:os";
import { posix, win32 } from "node:path";
function credentialPaths() {
  if (process.platform === "win32") {
    const programData = process.env.PROGRAMDATA ?? "C:\\ProgramData";
    const appData = process.env.APPDATA ?? win32.join(homedir(), "AppData", "Roaming");
    return {
      system: win32.join(programData, "fancysauce", "credentials.json"),
      user: win32.join(appData, "fancysauce", "credentials.json")
    };
  }
  return {
    system: "/etc/fancysauce/credentials.json",
    user: posix.join(process.env.HOME ?? homedir(), ".config", "fancysauce", "credentials.json")
  };
}

// dist/team/lib/config.mjs
import { join } from "node:path";
import { homedir as homedir2 } from "node:os";
var DEFAULT_LOGIN_STATE_DIR = join(homedir2(), ".config", "fancysauce");
function parseCredentialPathsEnv() {
  if (process.env.VITEST !== "true")
    return null;
  const raw = process.env.FANCYSAUCE_CREDENTIAL_PATHS;
  if (!raw)
    return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    return null;
  const o = parsed;
  if (typeof o.system !== "string" || typeof o.user !== "string")
    return null;
  if (o.login_state_dir !== void 0 && typeof o.login_state_dir !== "string")
    return null;
  return {
    system: o.system,
    user: o.user,
    ...typeof o.login_state_dir === "string" ? { login_state_dir: o.login_state_dir } : {}
  };
}

// dist/team/lib/data-dir.mjs
import { readFileSync } from "node:fs";
import { join as join2, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir as homedir3 } from "node:os";
function resolveDataDir(opts = {}) {
  if (opts.override)
    return opts.override;
  if (process.env.CLAUDE_PLUGIN_DATA)
    return process.env.CLAUDE_PLUGIN_DATA;
  const home = opts.homeDir ?? homedir3();
  const root = trimTrailingSlash(opts.pluginRoot ?? defaultPluginRoot());
  const fromRegistry = deriveFromRegistry(root, home);
  if (fromRegistry !== null)
    return fromRegistry;
  const fromMarketplaces = deriveFromMarketplaces(root, home);
  if (fromMarketplaces !== null)
    return fromMarketplaces;
  return join2(home, ".claude-plugin-data");
}
function defaultPluginRoot() {
  const here = dirname(fileURLToPath(import.meta.url));
  return join2(here, "..", "..", "..");
}
function trimTrailingSlash(p) {
  return p.endsWith("/") ? p.slice(0, -1) : p;
}
function deriveFromRegistry(root, home) {
  try {
    const regPath = join2(home, ".claude", "plugins", "installed_plugins.json");
    const reg = JSON.parse(readFileSync(regPath, "utf8"));
    const plugins = reg?.plugins;
    if (typeof plugins !== "object" || plugins === null)
      return null;
    for (const [key, entries] of Object.entries(plugins)) {
      if (!Array.isArray(entries))
        continue;
      for (const entry of entries) {
        const installPath = entry.installPath;
        if (typeof installPath !== "string")
          continue;
        if (trimTrailingSlash(installPath) !== root)
          continue;
        const at = key.lastIndexOf("@");
        if (at <= 0 || at >= key.length - 1)
          continue;
        const plugin = key.slice(0, at);
        const alias = key.slice(at + 1);
        return join2(home, ".claude", "plugins", "data", `${plugin}-${alias}`);
      }
    }
  } catch {
  }
  return null;
}
function deriveFromMarketplaces(root, home) {
  try {
    const kmPath = join2(home, ".claude", "plugins", "known_marketplaces.json");
    const km = JSON.parse(readFileSync(kmPath, "utf8"));
    let alias = null;
    for (const [k, v] of Object.entries(km)) {
      const installLocation = v.installLocation;
      if (typeof installLocation === "string" && trimTrailingSlash(installLocation) === root) {
        alias = k;
        break;
      }
    }
    if (alias === null)
      return null;
    const manifest = JSON.parse(readFileSync(join2(root, ".claude-plugin", "marketplace.json"), "utf8"));
    const plugin = manifest.plugins?.[0]?.name;
    if (typeof plugin !== "string" || plugin.length === 0)
      return null;
    return join2(home, ".claude", "plugins", "data", `${plugin}-${alias}`);
  } catch {
    return null;
  }
}

// dist/team/bin/reset.mjs
function parseArgs(argv) {
  return {
    all: argv.includes("--all"),
    queueOnly: argv.includes("--queue-only"),
    noConfirm: argv.includes("--no-confirm")
  };
}
async function isBackfillActive(stateDir) {
  try {
    const pidStr = await readFile(join3(stateDir, "backfill.pid"), "utf8");
    const pid = Number(pidStr.trim());
    if (!Number.isFinite(pid) || pid <= 0)
      return null;
    try {
      process.kill(pid, 0);
      return pid;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}
async function prompt(question, expected) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim() === expected);
    });
  });
}
async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const dataDir = resolveDataDir();
  const stateDir = join3(dataDir, "state");
  const activePid = await isBackfillActive(stateDir);
  if (activePid !== null) {
    process.stderr.write(`backfill in progress (pid ${activePid}); stop it with kill ${activePid} first.
`);
    return 1;
  }
  if (!args.noConfirm) {
    process.stderr.write("This will delete fancysauce data. Type 'wipe' to confirm: ");
    const ok = await prompt("", "wipe");
    if (!ok) {
      process.stderr.write("aborted.\n");
      return 1;
    }
  }
  if (args.queueOnly) {
    await rm(join3(dataDir, "outbound"), { recursive: true, force: true });
    process.stderr.write("queue and cursors removed.\n");
    return 0;
  }
  await rm(join3(dataDir, "sessions"), { recursive: true, force: true });
  await rm(join3(dataDir, "session-index.json"), { force: true });
  await rm(join3(dataDir, "outbound"), { recursive: true, force: true });
  await rm(stateDir, { recursive: true, force: true });
  if (args.all) {
    await rm(join3(dataDir, "install.json"), { force: true });
    const envPaths = parseCredentialPathsEnv();
    const paths = envPaths ? { system: envPaths.system, user: envPaths.user } : credentialPaths();
    await rm(paths.user, { force: true });
    process.stderr.write("all data wiped (including install.json and credential file).\n");
    const systemExists = await stat(paths.system).then(() => true).catch(() => false);
    if (systemExists) {
      process.stderr.write(`note: a managed credential remains at ${paths.system}. --all cannot remove it (insufficient permissions). The plugin will continue using it.
`);
    }
  } else {
    process.stderr.write("data wiped (install.json and credential preserved).\n");
  }
  return 0;
}
var isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  void main().then((code) => process.exit(code));
}
export {
  main
};
