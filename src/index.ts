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
import {
  vaultNotSpecified,
  noteNameRequired,
  noteMayNotExist,
  success,
  contentRequired,
  errorResponse,
} from "./responses.js";

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
    if (!vault) return vaultNotSpecified();

    validateCli();

    const items = item.list({ vault: OP_VAULT });

    return success(
      `There are ${
        items.length
      } secure notes in the "${OP_VAULT}" vault: \n\n- ${items
        .map((item) => item.title)
        .join("\n- ")}`
    );
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
    if (!OP_VAULT) return vaultNotSpecified();

    if (!noteName) return noteNameRequired("get");

    validateCli();

    try {
      const note = item.get(noteName, {
        vault: OP_VAULT,
        fields: { label: ["notesPlain"] },
      }) as ValueField;

      return success(`Retrieved secure note "${noteName}":\n\n${note.value}`);
    } catch (error) {
      return noteMayNotExist();
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
    if (!OP_VAULT) return vaultNotSpecified();
    if (!noteName) return noteNameRequired("create");
    if (!content) return contentRequired("create");

    validateCli();

    try {
      // Create a new secure note
      item.create([["notesPlain", "concealed", content]], {
        category: "Secure Note",
        title: noteName,
        vault: OP_VAULT,
      });

      return success(
        `Successfully created secure note "${noteName}" in vault "${OP_VAULT}". Remember to use this exact name ("${noteName}") for future operations on this note.`
      );
    } catch (error) {
      return errorResponse("create", error as unknown as Error);
    }
  }
);

// Append to secure note
server.registerTool(
  "append-secure-note",
  {
    title: "Append to Secure Note",
    description:
      "Append content to an existing secure note in a 1Password vault. The new content will be added to the end of the existing content.",
    inputSchema: {
      noteName: z
        .string()
        .describe(
          "Name of the secure note to append to. Must match the name used when creating the note."
        ),
      content: z
        .string()
        .describe(
          "Content to append to the secure note. This will be added to the existing content."
        ),
    },
  },
  async ({ noteName, content }) => {
    if (!OP_VAULT) return vaultNotSpecified();
    if (!noteName) return noteNameRequired("append");
    if (!content) return contentRequired("append");

    validateCli();

    try {
      // First get the existing content
      const existingNote = item.get(noteName, {
        vault: OP_VAULT,
        fields: { label: ["notesPlain"] },
      }) as ValueField;

      // Append new content to existing content
      const updatedContent = existingNote.value + "\n" + content;

      // Update the note with combined content
      item.edit(noteName, [["notesPlain", "concealed", updatedContent]], {
        vault: OP_VAULT,
      });

      return success(
        `Successfully appended content to secure note "${noteName}" in vault "${OP_VAULT}".`
      );
    } catch (error) {
      return errorResponse("append", error as unknown as Error);
    }
  }
);

// Update secure note
server.registerTool(
  "update-secure-note",
  {
    title: "Update Secure Note",
    description:
      "Update the content of an existing secure note in a 1Password vault. This will replace all existing content with the new content.",
    inputSchema: {
      noteName: z
        .string()
        .describe(
          "Name of the secure note to update. Must match the name used when creating the note."
        ),
      content: z
        .string()
        .describe(
          "New content for the secure note. This will replace all existing content."
        ),
    },
  },
  async ({ noteName, content }) => {
    if (!OP_VAULT) return vaultNotSpecified();
    if (!noteName) return noteNameRequired("update");
    if (!content) return contentRequired("update");

    validateCli();

    try {
      // Update the secure note with new content (replaces existing)
      item.edit(noteName, [["notesPlain", "concealed", content]], {
        vault: OP_VAULT,
      });

      return success(
        `Successfully updated secure note "${noteName}" in vault "${OP_VAULT}".`
      );
    } catch (error) {
      return errorResponse("update", error as unknown as Error);
    }
  }
);

// Archive secure note
server.registerTool(
  "archive-secure-note",
  {
    title: "Archive secure note",
    description: "Archive a secure note in a 1Password vault",
    inputSchema: {
      noteName: z.string().describe("Name of the secure note to archive."),
    },
  },
  async ({ noteName }) => {
    if (!OP_VAULT) return vaultNotSpecified();
    if (!noteName) return noteNameRequired("archive");

    validateCli();

    try {
      // Archive the secure note
      item.delete(noteName, { vault: OP_VAULT, archive: true });

      return success(
        `Successfully archived secure note "${noteName}" in vault "${OP_VAULT}".`
      );
    } catch (error) {
      return errorResponse("archive", error as unknown as Error);
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
