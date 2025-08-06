// OP CLI wrapper

import { execSync } from "node:child_process";

/**
 * Checks if the given vault exists and the user has access to it.
 * @param vault name of the vault
 * @returns true if the vault exists and the user has access, false otherwise
 */
export function checkVaultAccess(vault: string) {
  try {
    execSync(`op vault get "${vault}"`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
