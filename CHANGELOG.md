# Changelog

All public releases of `fancysauce-savings`. Most recent first.

## v0.4.4 — 2026-05-10

### Security

- **API key removed from `node` argv** (F-02 narrowed). The rendered hook command now passes the key via an environment-variable prefix (`FANCYSAUCE_API_KEY=… node …`) rather than `--api-key …`. The shell process that interprets the rendered command still has the key in its own `argv` for the hook's lifetime; full closure (key written to a file at install time, read by the hook) is tracked as a follow-up.

### Privacy

- **Git email no longer collected** (F-03). Identity is `install_id`-only. Existing tenants will see a one-time identity rotation; `repo_url_hash` continues to scope events to a project. Schema bumped to `1.0.5` (covers the `FANCYSAUCE_TEAM`/`FANCYSAUCE_DISCLOSURE_NOTIFICATION` removal, the new `stop_reason` attribute, and the `tool_call.complete` field corrections below).

### Features

- **`api.request` carries `stop_reason`.** When a turn finalizes (`end_turn`, `tool_use`, `max_tokens`, `refusal`, `stop_sequence`), the assistant message's `stop_reason` is forwarded as a string attribute on `api.request`. Per-message; absent when not set. Lets the server distinguish finalized rows via `WHERE stop_reason IS NOT NULL` instead of denormalized heuristics.

### Fixes

- **`tool_call.complete` `success` and `duration_ms` are now correct.** Through 0.4.3, every `tool_call.complete` shipped `success=false` and `duration_ms=0` because the event-mapper never extracted these fields and the content-filter silently defaulted them. The mapper now stamps `success=true` for `PostToolUse` (failures route to `PostToolUseFailure → tool_call.failed`, which never carried these fields). `duration_ms` is dropped from the wire — CC's `PostToolUse` payload doesn't carry it, and the server can derive it more accurately from the `(tool_call.start.timestamp_ns, tool_call.complete.timestamp_ns)` pair joined on `correlation_id`.

### Breaking

- **Removed runtime env-var knobs.** `FANCYSAUCE_SHIP_REPO_URL`, `FANCYSAUCE_IMPORT_HISTORY`, `FANCYSAUCE_IMPORT_HISTORY_SINCE`, `FANCYSAUCE_ENDPOINT`, `FANCYSAUCE_TEAM`, and `FANCYSAUCE_DISCLOSURE_NOTIFICATION` are no longer honored. The only env var the hook reads is `FANCYSAUCE_API_KEY`. Build-time `--endpoint <url>` (passed to `package-plugin.mjs`) is the supported path for non-default ingest URLs. Tenants who set any of the removed env vars will see no warning — they are silently ignored under the closed-schema policy.

### Build

- **Production ingest endpoint is `https://ingest.preview.fancysauce.ai`.** A short-lived intermediate commit on `feat/v0.4.4-audit-response` shipped `https://ingest.fancysauce.ai`; the final v0.4.4 artifact ships the preview URL. Cross-file consistency tests now guard against future drift between `config.mts`, `package-plugin.mjs`, and `publish-dist.mjs`.

### Backend coordination required

- After publish, the dist repo's root `plugin.sha` file (`https://raw.githubusercontent.com/FancySauceAI/fancysauce-savings/<ref>/plugin.sha`) contains the 40-hex source SHA the artifact was built from.
- Dashboard renderer must fetch this and render `plugin_sha` into per-tenant marketplace.json.
- Plugin `source` block now requires both `ref` (human-readable tag) and `sha` (40-hex cryptographic pin).

## v0.4.3 — 2026-05-05

### Fixes

- fix(team): backoff invalidation on config change. Previously, when the backend changed the rendered marketplace's `--endpoint` or `--api-key`, an existing accumulated backoff (e.g., `transientAttempts: 20` → next retry hours away) would keep applying to the new config. Events queued against the old endpoint stayed stranded for hours after the fix was deployed. The forwarder now stamps the (api_key, endpoint) fingerprint on `backoff.json` and on each flush:
  - **API key change** → drop queued events (different tenant) + reset backoff.
  - **Endpoint change only** → retain queued events (same tenant, new ingest URL) + reset backoff so retries re-engage immediately against the new endpoint.
  - **No change** → no-op.

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
