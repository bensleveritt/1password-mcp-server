# 1Password MCP Server

A prototype MCP server to access secure notes in 1Password.

## Scope

1Password is a deeply trusted store of personal and enterprise secrets, and the highest priority is preserving that trust. Therefore the scope is completely locked to just named vaults and secure notes.

## Build

```bash
pnpm install

pnpm build
```

## Inspector

Once built, the MCP Inspector can be run to test and check the server.

NB: The inspector will serve the server, so it's not necessary to run it first.
