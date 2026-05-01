# Changelog

All public releases of `fancysauce-savings`. Most recent first.

## v0.4.2 — 2026-04-30

### Fixes

- fix(release): drop `dist/team/hooks/hooks.json` from the published artifact. It was a build-time copy not used by the runtime (the bundled `collect.mjs` is what fires; the JSON next to it isn't read), but Claude Code's plugin display picked it up and rendered it as a stray `[object Object]` entry alongside the marketplace's hook events.

## v0.4.1 — 2026-04-30

### Fixes

- fix(release): drop `.claude-plugin/plugin.json` from the published artifact. v0.4.0 shipped a metadata-only plugin.json which Claude Code rejects under `strict: false` with "conflicting manifests: both plugin.json and marketplace entry specify components" — even though the plugin.json declared zero components. Empirically verified against Claude Code 2.1.123. The marketplace entry's `name` and `version` carry plugin identity now.

## v0.4.0 — 2026-04-30

### Features

- feat(team): per-tenant URL marketplace install flow — eliminates the managed-settings `env` block by serving a per-tenant `marketplace.json` from the dashboard backend with the API key + endpoint inlined into the hook command args. See [`docs/plans/2026-04-29-per-tenant-url-marketplace-design.md`](https://github.com/FancySauceAI/fancytab/blob/main/docs/plans/2026-04-29-per-tenant-url-marketplace-design.md).
- feat(team): `loadConfig` reads `--api-key` / `--endpoint` from argv (env vars remain as a fallback for backward compatibility).

### Build

- build(release): drop `hooks/hooks.json` and `.claude-plugin/marketplace.json` from the published artifact; the URL marketplace declares hooks inline with `strict: false`.

### Documentation

- docs(release): rewrite README install instructions for the URL-marketplace flow.

## v0.3.0 — 2026-04-28

### Features

- feat(team): v1 implementation + release tooling for v0.3.0 publish (#17)
- feat: automate marketplace branch publishing
- feat: point marketplace source at release branch
- feat: add marketplace.json and extend plugin.json metadata
- feat: forwarder gains jitter, Retry-After, and opt-in gzip
- feat: width-aware statusline with countdown rate limits
- feat: per-file monotonic seq in RawOtlpWriter
- feat: leader/follower roles in server bootstrap
- feat: leader election via atomic lockfile with stale-PID recovery
- feat: config file-watcher wakes forward worker on destination change
- feat: wire forward worker into server; remove standalone otlp-forwarder
- feat: forward worker lifecycle with wake coalescing and safety timer
- feat: forward worker sweep with watermark + backoff
- feat: forward-state with per-destination × per-stream watermarks
- feat: retention eviction for raw-OTLP (30-day default)
- feat: gzip raw-OTLP files on day rotation and startup recovery
- feat: durable-ack on OTLP inbound via raw-OTLP writer
- feat: raw-OTLP writer with UTC day rotation
- feat: raw-OTLP capture line format
- feat: protobuf OTLP inbound via content-type dispatch
- feat: OTLP protobuf decode adapter via bufbuild/protobuf
- feat: countdown clock, usage label, and per-session status tracking
- feat: register Node.js status line in plugin settings, remove bash script
- feat: add main status line entry point
- feat: add layout engine to assemble status line segments
- feat: add status line segment functions
- feat: add segment functions for statusline display units
- feat: add velocity cache for rate tracking across invocations
- feat: add statusline types, ANSI color utility, and config loader
- feat: add cost apportioner sink
- feat: retro skill dispatches Haiku subagent with summary data
- feat: add context tracker stateful transform
- feat: register file activity transform in session-manager and dispatcher
- feat: add cache expiry stateful transform
- feat: add file activity stateless transform
- feat: add StatefulTransformDefinition type and runStatefulPipeline
- feat: wire OTLP forwarder into HTTP listener
- feat: add OTLP forwarder for downstream destinations
- feat: add config loader for otel.forward destinations
- feat: register MCP server in plugin manifest
- feat: MCP server entry point wires all channels
- feat: session manager coordinates in-memory event processing
- feat: OTLP JSON mapper converts logs to api.request events
- feat: HTTP listener for OTLP JSON reception
- feat: Unix socket listener for hook event reception
- feat: MCP stdio handler for zero-tool server
- feat: hook dispatcher tries MCP bridge before fallback
- feat: bridge client for hook-to-MCP-server forwarding
- feat: build verification and plugin structure complete
- feat: skills and status line script
- feat: hook dispatcher wires event mapper, pipeline, and sinks
- feat: session index updater maintains cross-session index
- feat: summary updater sink with gap detection and self-healing
- feat: collector manages session state and JSONL event log
- feat: context transform tracks files entering context window
- feat: cache transform extracts cache efficiency snapshots
- feat: cost transform annotates API requests with derived metrics
- feat: model transform tracks model observations
- feat: git transform detects commits, pushes, branches, PRs
- feat: transform pipeline with middleware chain and sequence numbering
- feat: event mapper converts hook input to FancysauceEvent
- feat: type definitions and test fixtures
- feat: project scaffolding with TypeScript, Vitest, and plugin manifest

### Fixes

- fix(test): build before vitest run so e2e dist artifact exists
- fix: replace fs.watch with fs.watchFile polling for rename resilience
- fix: bootId + /health probe defeats PID-reuse in leader election
- fix: serialize ForwardState.persist to avoid tmp-file races
- fix: compound (ts, seq) watermark prevents same-ms data loss
- fix: use single stdout write for multi-line status line
- fix: add process error handlers and crash log to MCP server
- fix: deduplicate ForwardDestination type, extract bodyText variable
- fix: resolve existing ESLint violations
- fix: status line shows clock time for cache expiry, I/O tokens
- fix: status line cache countdown and hit rate display
- fix: cache hit rate formula, status line data dir discovery
- fix: cache hit rate uses total input as denominator
- fix: handle stringValue for numeric OTLP attributes
- fix: OTLP attribute names match Claude Code's actual format
- fix: single-source sequencing for OTel events, version bump to 0.2.0
- fix: guard BigInt conversion, explicit callback error handling
- fix: replace setTimeout with listen callback in bridge test
- fix: bridge review — clear timeout on success, remove fake timeout test
- fix: plugin hook registration — auto-discover, valid event names, node prefix
- fix: add shebang and node prefix so hook scripts execute correctly
- fix: dispatcher review — fileURLToPath guard, error-safe state
- fix: typecheck errors, unused import, gap detection comment
- fix: context transform deep-copies largest_file in coalesce
- fix: git transform review — add derived_from, git switch detection, extra tests
- fix: event mapper review — remove dead branch, forward hook fields, add tests

### Documentation

- docs: mark PR2 as no-op — PR1 already deletes pre-team-v1 code
- docs: team v1 release implementation plan
- docs: team v1 release design — distribution and iteration
- docs: team v1 Phase 3 implementation plan (M5 transcript-tail + M6 orchestrator)
- docs: team v1 Phase 2 implementation plan (M2 capture + M3 persistence + M4 identity)
- docs: team v1 Phase 1 implementation plan (M0 spike + M1 scaffold)
- docs: team v1 Milestone B design + OTLP ingest contract
- docs: team-deployment vision and architecture for v1
- docs: statusline width-aware rendering and countdown design
- docs: phase A.0 review fixes plan
- docs: update backlog and design with A.0 outcomes
- docs: split Task 4 into 4a/4b/4c using @bufbuild/protobuf
- docs: multi-session spike findings — leader election required
- docs: phase A.0 foundation implementation plan
- docs: phase A marketplace onboarding design
- docs: add OTLP forwarding implementation plan
- docs: add pre-commit hooks implementation plan
