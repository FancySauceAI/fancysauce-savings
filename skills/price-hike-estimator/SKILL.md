---
description: Estimate the impact of Anthropic's 2026-06-15 Agent SDK billing change on the user's actual Claude Code usage history
---

Run the analyzer:

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/personal/bin/price-hike-estimator.mjs
```

The script reads the user's local CC transcripts, breaks usage down by
invocation entrypoint, and (when timestamps are present) emits a "Plan
impact" section with per-tier headroom math and a coarse bottom-line
verdict.

## Your job: lead with the verdict

The user is trying to answer **"how does the June 15 change affect me?"**
Don't paste the table and stop. Read the script's output and lead with
a tailored interpretation:

1. **Start with the verdict line.** The script computes a `bottomLine` —
   use it as your opening sentence and elaborate in 1–2 sentences with
   the user's specific numbers.

2. **Frame as problem or opportunity.** The change cuts two ways:
   - **Problem signal**: programmatic burn close to or over their tier's
     credit. Call out which tier(s) won't cover and by how much.
   - **Opportunity signal**: heavy interactive usage but low programmatic
     burn means the new credit is effectively "free room" — there's
     headroom to shift automation work to SDK without it counting
     against plan-normal limits.

3. **Then show the table verbatim.** After the narrative paragraph,
   include the script's markdown output so the user can audit the
   numbers.

4. **Offer next steps.** Sensible follow-ups:
   - `--since YYYY-MM-DD` to narrow to a more representative recent
     window (avoids skewing by old patterns).
   - `--plan <tier>` to focus the impact section on the user's actual
     plan tier (valid: pro, max-5x, max-20x, team-std, team-prem,
     ent-usage, ent-seat).
   - `--json` for structured output if the user wants to slice the data
     themselves.

## Context for the narrative

Anthropic announced on 2026-05-13 that starting **2026-06-15**, Agent
SDK and `claude -p` usage will no longer count against Pro/Max/Team/
Enterprise plan-normal limits. Each user gets a separate monthly Agent
SDK credit (Pro USD 20/mo, Max 5x USD 100/mo, Max 20x USD 200/mo,
Team Standard USD 20/mo, Team Premium USD 100/mo, Enterprise estimated
USD 20/USD 200 per month). The credit is billed at
full API rates, doesn't roll over, and can't be pooled.

**Interactive Claude Code (the terminal CLI) is unaffected** — that
usage continues to run on plan-normal limits. The script bucket-sorts
entrypoints accordingly: `cli` and other non-SDK entrypoints stay in the
"interactive" bucket; `sdk-cli`, `sdk-py`, `sdk-ts` are the agentic
bucket the new credit applies to.

## If pricing.json looks stale

The script will flag any models without pricing entries in a footer.
If the user sees that footer, mention it and suggest filing an issue to
refresh `pricing.json` — old retired models in their history will
otherwise show zero cost.
