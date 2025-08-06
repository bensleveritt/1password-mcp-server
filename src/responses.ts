import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type Action = "create" | "get" | "append" | "update" | "archive";

export function vaultNotSpecified(): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: "Vault hasn't been specified. To use this tool, set the OP_VAULT environment variable.",
      },
    ],
  };
}

export function noteNameRequired(action: Action): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: `Note name is required to ${action} the secure note.`,
      },
    ],
  };
}

export function noteMayNotExist(): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: "Note may not exist - consider creating it first.",
      },
    ],
  };
}

export function contentRequired(action: Action): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: `Content is required to ${action} the secure note.`,
      },
    ],
  };
}

export function success(text: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

export function errorResponse(
  action: Action,
  error: Error | string
): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: `Failed to ${action} secure note: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ],
  };
}
