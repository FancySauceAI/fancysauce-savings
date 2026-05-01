# fancysauce-savings

Cost and usage observability for Claude Code

**Version:** 0.4.2

## About this Plugin

fancysauce-savings helps individual contributors and teams better understand their token usage while using Claude Code.

To use fancysauce-savings through managed settings, you'll need a Fancysauce account and a per-tenant install URL that you'll configure in the dashboard.

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

## Install (direct, single developer)

In Claude Code:

```
/plugin marketplace add <paste-from-dashboard>
/plugin install fancysauce-savings@fancysauce
```
