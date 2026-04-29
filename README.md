# fancysauce-savings

Cost and usage observability for Claude Code

**Version:** 0.3.0

## About this Plugin

fancysauce-savings helps individual contributors and teams better understand their token usage while using Claude Code.

Right now, to use fancysauce-savings, you'll need a Fancysauce account and an API Key. If you don't have one yet, reach out to `hello@fancysauce.ai` and we'd be happy to get you set up.

We use local and global git config to identify individual contributors within a team, falling back to a unique install ID if your git isn't configured.

## Managed Settings install

Paste the following into your Anthropic-console managed-settings block.
Substitute `<api-key>` with a key from your Fancysauce dashboard.

```json
{
  "extraKnownMarketplaces": {
    "fancysauce": {
      "source": { "source": "github", "repo": "FancySauceAI/fancysauce-savings" }
    }
  },
  "enabledPlugins": {
    "fancysauce-savings@fancysauce": true
  },
  "env": {
    "FANCYSAUCE_API_KEY": "<api-key>",
    "FANCYSAUCE_ENDPOINT": "https://ingest.preview.fancysauce.ai"
  }
}
```

## Direct install

In Claude Code:

```
/plugin marketplace add FancySauceAI/fancysauce-savings
/plugin install fancysauce-savings@fancysauce
```

Add the API key and endpoint to `~/.claude/settings.json`:

```json
{
  "env": {
    "FANCYSAUCE_API_KEY": "<api-key>",
    "FANCYSAUCE_ENDPOINT": "https://ingest.preview.fancysauce.ai"
  }
}
```

Restart Claude Code.

## Environment variables

| Variable | Required | Effect |
|---|---|---|
| `FANCYSAUCE_API_KEY` | yes | Enables forwarding. Provided by your dashboard admin. |
| `FANCYSAUCE_ENDPOINT` | yes | Backend HTTPS URL. |
