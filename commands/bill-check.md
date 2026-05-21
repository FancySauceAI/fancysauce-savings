---
description: Estimate the impact of the 2026-06-15 Agent SDK billing change on the user's actual Claude Code usage history
---

This command is interactive — it walks the user through three steps.

## Step 1: ask which plan they're on (two-step funnel)

AskUserQuestion caps options at 4 per question, so use a two-step funnel.

**Question 1 — Plan family** (exactly 4 options):

- **Pro** → `--plan pro`, no Q2 needed
- **Max** → ask Q2A below
- **Team** → ask Q2B below
- **Enterprise** → ask Q2C below

**Question 2 (2 options each):**

- Q2A (Max): **Max 5x** = `max-5x` · **Max 20x** = `max-20x`
- Q2B (Team): **Team Standard** = `team-std` · **Team Premium** = `team-prem`
- Q2C (Enterprise): **Usage-based** = `ent-usage` · **Premium seat** = `ent-seat`

When the user picks an Enterprise tier, mention briefly in the narrative
that those credits are public estimates — their actual contract may differ.

If the user already passed `--plan` (or any other flags) as positional
arguments to the slash command, honor those and skip the prompts. The
multi-tier "show all" view isn't offered in the funnel by design — a
user who wants it can invoke the slash command or bin without `--plan`.

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
