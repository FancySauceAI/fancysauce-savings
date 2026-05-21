---
description: Estimate the impact of Anthropic's 2026-06-15 Agent SDK billing change on the user's actual Claude Code usage history
---

The user is asking **"how does the June 15 Agent SDK billing change
affect me?"** Don't just run the script and dump output — walk the
user through it in three steps:

## Step 1: ask which plan they're on

Before running anything, ask the user which Claude plan they're on so
the output focuses on their specific tier. Use AskUserQuestion (or the
equivalent) with these exact options:

- **Pro** — Individual Pro plan
- **Max 5x** — Individual Max 5x plan
- **Max 20x** — Individual Max 20x plan
- **Team (Standard)** — Standard seat on a Team plan
- **Team (Premium)** — Premium seat on a Team plan
- **Enterprise (usage-based)** — Enterprise plan, usage-based billing
- **Enterprise (Premium seat)** — Enterprise plan, Premium seat
- **Skip / show all tiers** — User doesn't know or wants the full comparison

Map their answer to the corresponding `--plan` flag value:
`pro`, `max-5x`, `max-20x`, `team-std`, `team-prem`, `ent-usage`,
`ent-seat`. If they pick "Skip / show all tiers", run the script with
no `--plan` flag.

## Step 2: run the analyzer

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/personal/bin/bill-check.mjs --plan <id>
```

(omit `--plan` for the show-all case.)

The script reads the user's local CC transcripts, breaks usage down by
invocation entrypoint (Interactive, Headless `-p`, Agent SDK, etc.),
and emits a "Programmatic usage impact" section with their selected
tier's headroom math + a coarse bottom-line verdict.

## Step 3: lead with the verdict, then show the data

After the script returns:

1. **Open with the verdict line.** The script's `bottomLine` is the
   centerpiece — restate it in your own voice, with the user's specific
   monthly and yearly dollar figures.
2. **Frame as problem or opportunity.** The change cuts two ways:
   - **Problem signal**: programmatic burn close to or over their
     tier's credit — call out the dollar shortfall in both monthly and
     yearly terms.
   - **Opportunity signal**: heavy interactive usage but low
     programmatic burn means the new credit is effectively unused
     headroom — there's room to shift automation work to scripts or the
     SDK without it counting against plan-normal limits.
3. **Then show the script's markdown output verbatim** so the user can
   audit the table and numbers.
4. **Offer next steps.** Sensible follow-ups: `--since YYYY-MM-DD` to
   narrow to a more recent window, `--json` for structured output,
   re-running with a different `--plan` to compare tiers.

## Context for the narrative

Anthropic announced on 2026-05-13 that starting **2026-06-15**,
programmatic usage (Agent SDK + `claude -p`) will no longer count
against Pro/Max/Team/Enterprise plan-normal limits. Each user gets a
separate monthly Agent SDK credit (Pro USD 20/mo, Max 5x USD 100/mo,
Max 20x USD 200/mo, Team Standard USD 20/mo, Team Premium USD 100/mo,
Enterprise estimated USD 20/USD 200 per month). The credit is billed
at full API rates, doesn't roll over, and can't be pooled across team
members.

**Interactive Claude Code (the terminal CLI) is unaffected** — that
usage continues to run on plan-normal limits. The script bucket-sorts
entrypoints accordingly: `cli` and other non-SDK entrypoints stay in
the "interactive" bucket; `sdk-cli`, `sdk-py`, `sdk-ts` are the
"programmatic" bucket the new credit applies to.

## If pricing.json looks stale

The script will flag any models without pricing entries in a footer.
If the user sees that footer, mention it and suggest filing an issue
to refresh `pricing.json` — old retired models in their history will
otherwise show zero cost.
