#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { vault, item, validateCli, version } from "@1password/op-js";

const userVault = process.env.OP_VAULT;

const server = new McpServer({
  name: "basic-mcp-server",
  version: "1.0.0",
});

// List version of `op`
server.registerTool(
  "op-version",
  {
    title: "1Passwordd CLI Version",
    description: "List version of `op`",
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `\`op\` version: ${version()}`,
        },
      ],
    };
  }
);

// List items in vault
server.registerTool(
  "list-items",
  {
    title: "List Items",
    description: "List items in a 1Password vault",
  },
  async () => {
    if (!vault) {
      return {
        content: [
          {
            type: "text",
            text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
          },
        ],
      };
    }

    validateCli();

    const items = item.list({ vault: userVault });

    return {
      content: [
        {
          type: "text",
          text: `There are ${items.length} items in the "${userVault}" vault`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("1Password MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
