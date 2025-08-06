#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  vault,
  item,
  validateCli,
  version,
  ValueField,
} from "@1password/op-js";

const OP_VAULT = process.env.OP_VAULT;
const OP_NOTE_NAME = "Private Chat Note";

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
  "list-vault-items",
  {
    title: "List Vault Items",
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

    const items = item.list({ vault: OP_VAULT });

    return {
      content: [
        {
          type: "text",
          text: `There are ${items.length} items in the "${OP_VAULT}" vault`,
        },
      ],
    };
  }
);

// Get secure note
server.registerTool(
  "get-secure-note",
  {
    title: "Get Secure Note",
    description: "Get a secure note from a 1Password vault",
  },
  async () => {
    if (!OP_VAULT || !OP_NOTE_NAME) {
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

    const note = item.get(OP_NOTE_NAME, {
      vault: OP_VAULT,
      fields: { label: ["notesPlain"] },
    }) as ValueField;

    return {
      content: [
        {
          type: "text",
          text: note.value,
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
