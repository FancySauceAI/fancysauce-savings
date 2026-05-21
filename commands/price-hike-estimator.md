---
description: Estimate the impact of the 2026-06-15 Agent SDK billing change on the user's actual Claude Code usage history
---

Run `${CLAUDE_PLUGIN_ROOT}/dist/personal/bin/price-hike-estimator.mjs` via
the Bash tool. The binary accepts:

- `--since YYYY-MM-DD` — narrow the analysis to sessions starting on or
  after the date
- `--plan <tier>` — focus the impact section on a single plan tier
  (`pro`, `max-5x`, `max-20x`, `team-std`, `team-prem`, `ent-usage`,
  `ent-seat`)
- `--json` — structured output instead of markdown

Pass through any flags the user provides. After running:

1. **Lead with the bottom-line verdict** the script produces, elaborated
   in 1–2 sentences with the user's specific numbers. Frame it as either
   a **problem** (programmatic burn close to or over their credit) or an
   **opportunity** (light SDK use means the new credit is effectively
   free headroom to shift automation work onto). If usage is zero, say
   the change is a non-event for them.
2. **Then show the script's markdown output verbatim** so the user can
   audit.
3. **Offer follow-ups** — `--since` to tighten the window, `--plan` to
   focus on their tier, `--json` for structured slicing.

Don't just paste the output. The user is trying to understand impact,
not read a data dump.
