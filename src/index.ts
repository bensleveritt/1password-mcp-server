#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "basic-mcp-server",
  version: "1.0.0",
});

// Simple hello tool - no external dependencies
server.registerTool(
  "say-hello",
  {
    title: "Say Hello",
    description: "Returns a greeting message",
    inputSchema: {
      name: z.string().describe("Name to greet")
    },
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}! This is working.`,
        },
      ],
    };
  }
);

// Simple math tool - no external dependencies  
server.registerTool(
  "add-numbers",
  {
    title: "Add Numbers",
    description: "Adds two numbers together",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number")
    },
  },
  async ({ a, b }) => {
    return {
      content: [
        {
          type: "text",
          text: `${a} + ${b} = ${a + b}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Basic MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
