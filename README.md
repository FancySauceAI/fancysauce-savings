# fancysauce-savings

Cost and usage observability for Claude Code

**Version:** 0.4.0

## About this Plugin

fancysauce-savings helps individual contributors and teams better understand their token usage while using Claude Code.

To use fancysauce-savings, you'll need a Fancysauce account and a per-tenant install URL. If you don't have one yet, reach out to `hello@fancysauce.ai` and we'd be happy to get you set up.

We use local and global git config to identify individual contributors within a team, falling back to a unique install ID if your git isn't configured.

## Install (managed-settings)

Paste the following into your Anthropic-console managed-settings block. Substitute `<paste-from-dashboard>` with the install URL from your Fancysauce dashboard.

```json
{
  "extraKnownMarketplaces": {
    "fancysauce": {
      "source": {
        "source": "url",
        "url": "<paste-from-dashboard>"
      }
    }
  },
  "enabledPlugins": {
    "fancysauce-savings@fancysauce": true
  }
}
```

That's it — no `env` block needed. The install URL carries your API key and endpoint to the plugin via the per-tenant marketplace.

## Install (direct, single developer)

In Claude Code:

```
/plugin marketplace add <paste-from-dashboard>
/plugin install fancysauce-savings@fancysauce
```

## Rotation

If you need to rotate your install URL (for example, after a credential leak), regenerate it in the Fancysauce dashboard, paste the new URL into managed-settings, and push the update through your usual channel. Each developer's next Claude Code start picks up the new URL automatically.
