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
import { z } from "zod";

const OP_VAULT = process.env.OP_VAULT;

const server = new McpServer({
  name: "1password-secure-notes-mcp",
  version: "1.1.0",
  description:
    "1Password MCP Server for secure note management. Maintains note names across conversations for consistency. Use descriptive note names and reference them by the same name throughout the session.",
});

// List version of `op`
server.registerTool(
  "op-version",
  {
    title: "1Password CLI Version",
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

// List notes in vault
server.registerTool(
  "list-secure-notes",
  {
    title: "List secure notes",
    description: "List secure notes in a 1Password vault",
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
          text: `There are ${
            items.length
          } secure notes in the "${OP_VAULT}" vault: \n\n- ${items
            .map((item) => item.title)
            .join("\n- ")}`,
        },
      ],
    };
  }
);

// Get secure note
server.registerTool(
  "get-secure-note",
  {
    title: "Get secure note",
    description:
      "Get a secure note from a 1Password vault. IMPORTANT: Remember the note name used here and reference it consistently throughout the conversation.",
    inputSchema: {
      noteName: z
        .string()
        .describe(
          "Name of the secure note to retrieve. Use the same name consistently throughout the conversation."
        ),
    },
  },
  async ({ noteName }) => {
    if (!OP_VAULT) {
      return {
        content: [
          {
            type: "text",
            text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
          },
        ],
      };
    }

    if (!noteName) {
      return {
        content: [
          {
            type: "text",
            text: "Note name is required. Please specify the name of the secure note to retrieve.",
          },
        ],
      };
    }

    validateCli();

    try {
      const note = item.get(noteName, {
        vault: OP_VAULT,
        fields: { label: ["notesPlain"] },
      }) as ValueField;

      return {
        content: [
          {
            type: "text",
            text: `Retrieved secure note "${noteName}":\n\n${note.value}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve secure note "${noteName}": ${
              error instanceof Error ? error.message : String(error)
            }. Note may not exist - consider creating it first.`,
          },
        ],
      };
    }
  }
);

// Create secure note
server.registerTool(
  "create-secure-note",
  {
    title: "Create Secure Note",
    description:
      "Create a new secure note in a 1Password vault. IMPORTANT: Remember the note name used here for future references in this conversation.",
    inputSchema: {
      noteName: z
        .string()
        .describe(
          "Name for the new secure note. Use descriptive names and remember this name for future operations."
        ),
      content: z.string().describe("Initial content for the secure note."),
    },
  },
  async ({ noteName, content }) => {
    if (!OP_VAULT) {
      return {
        content: [
          {
            type: "text",
            text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
          },
        ],
      };
    }

    if (!noteName || !content) {
      return {
        content: [
          {
            type: "text",
            text: "Both note name and content are required to create a secure note.",
          },
        ],
      };
    }

    validateCli();

    try {
      // Create a new secure note
      item.create([["notesPlain", "concealed", content]], {
        category: "Secure Note",
        title: noteName,
        vault: OP_VAULT,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully created secure note "${noteName}" in vault "${OP_VAULT}". Remember to use this exact name ("${noteName}") for future operations on this note.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to create secure note "${noteName}": ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

// Edit secure note
server.registerTool(
  "edit-secure-note",
  {
    title: "Edit Secure Note",
    description:
      "Edit the content of an existing secure note in a 1Password vault. Use the same note name that was used when creating or previously referencing the note.",
    inputSchema: {
      noteName: z
        .string()
        .describe(
          "Name of the secure note to edit. Must match the name used when creating the note."
        ),
      content: z
        .string()
        .describe(
          "New content for the secure note. This will replace the existing content."
        ),
    },
  },
  async ({ noteName, content }) => {
    if (!OP_VAULT) {
      return {
        content: [
          {
            type: "text",
            text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
          },
        ],
      };
    }

    if (!noteName || !content) {
      return {
        content: [
          {
            type: "text",
            text: "Both note name and content are required to edit the secure note.",
          },
        ],
      };
    }

    validateCli();

    try {
      // Edit the secure note with new content
      item.edit(noteName, [["notesPlain", "concealed", content]], {
        vault: OP_VAULT,
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully updated secure note "${noteName}" in vault "${OP_VAULT}".`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to edit secure note "${noteName}": ${
              error instanceof Error ? error.message : String(error)
            }. Note may not exist - consider creating it first.`,
          },
        ],
      };
    }
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
