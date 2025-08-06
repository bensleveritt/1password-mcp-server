#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { connect, validateCli, version } from "@1password/op-js";

const vault = process.env.OP_VAULT;

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

// // List items in vault
// server.registerTool(
//   "list-items",
//   {
//     title: "List Items",
//     description: "List items in a 1Password vault",
//   },
//   async () => {
//     if (!vault) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
//           },
//         ],
//       };
//     }

//     validateCli();

//     const hasAccess = connect;
//     if (!hasAccess) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: `You don't have access to the vault "${vault}".`,
//           },
//         ],
//       };
//     }

//     return {
//       content: [
//         {
//           type: "text",
//           text: `Items in vault "${vault}"`,
//         },
//       ],
//     };
//   }
// );

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("1Password MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
