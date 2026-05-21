---
description: Estimate the impact of the 2026-06-15 Agent SDK billing change on the user's actual Claude Code usage history
---

This command is interactive — it walks the user through three steps.

## Step 1: ask which plan they're on

Before running anything, ask which Claude plan the user is on so the
output focuses on their specific tier. Use AskUserQuestion (or the
equivalent) with these options, mapping each to a `--plan` value:

- **Pro** → `pro`
- **Max 5x** → `max-5x`
- **Max 20x** → `max-20x`
- **Team (Standard)** → `team-std`
- **Team (Premium)** → `team-prem`
- **Enterprise (usage-based)** → `ent-usage`
- **Enterprise (Premium seat)** → `ent-seat`
- **Skip / show all tiers** → omit `--plan`

If the user already passed `--plan` (or any other flags) as positional
arguments to the slash command, honor those and skip the prompt.

## Step 2: run the analyzer

Run via the Bash tool:

```
node ${CLAUDE_PLUGIN_ROOT}/dist/personal/bin/bill-check.mjs --plan <id>
```

Other accepted flags (pass through if the user provided them):

- `--since YYYY-MM-DD` — narrow the analysis to sessions starting on
  or after the date
- `--json` — structured output instead of markdown

## Step 3: lead with the verdict

After running:

1. **Lead with the bottom-line verdict** the script produces, restated
   in your voice with the user's specific monthly + yearly dollar
   figures. Frame it as either a **problem** (programmatic burn close
   to or over their credit) or an **opportunity** (light SDK use means
   the new credit is effectively free headroom).
2. **Then show the script's markdown output verbatim** so the user can
   audit the numbers.
3. **Offer follow-ups** — `--since` to tighten the window, re-running
   with a different `--plan` to compare tiers, `--json` for structured
   slicing.

Don't just paste the output. The user is trying to understand impact,
not read a data dump.
