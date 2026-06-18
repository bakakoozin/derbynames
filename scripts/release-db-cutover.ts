import "dotenv/config";
import { execSync } from "node:child_process";

function runCommand(command: string) {
  console.log(`\n$ ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
}

function requireCutoverFlag() {
  if (process.env.RELEASE_DB_CUTOVER !== "1") {
    throw new Error(
      "Cutover bloque: definir RELEASE_DB_CUTOVER=1 pour confirmer la suppression irreversible des colonnes legacy",
    );
  }
}

function runOptionalBackup() {
  const backupCommand = process.env.DB_BACKUP_COMMAND?.trim();
  if (!backupCommand) {
    console.warn("Aucun backup automatique configure (DB_BACKUP_COMMAND vide)");
    console.warn("Recommande: executer un dump manuel avant le cutover");
    return;
  }

  runCommand(backupCommand);
}

async function run() {
  requireCutoverFlag();

  runCommand("pnpm release:code-preflight");
  runOptionalBackup();
  runCommand("pnpm db:verify-actions");
  runCommand("pnpm db:push");
  runCommand("pnpm db:verify-actions");

  console.log("\nCutover DB termine: OK");
}

run().catch((error) => {
  console.error("\nEchec cutover DB", error);
  process.exit(1);
});
