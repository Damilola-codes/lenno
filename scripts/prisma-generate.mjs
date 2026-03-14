import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const npxBin = "npx";
const extraArgs = process.argv.slice(2);
const maxAttempts = Number(process.env.PRISMA_GENERATE_RETRIES || 5);
const baseDelayMs = Number(process.env.PRISMA_GENERATE_RETRY_DELAY_MS || 900);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableFailure = (output) =>
  /(EPERM|EBUSY|operation not permitted|resource busy|rename)/i.test(output);

const runPrismaGenerate = () =>
  spawnSync(npxBin, ["prisma", "generate", ...extraArgs], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: "pipe",
    shell: isWindows,
  });

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = runPrismaGenerate();
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const output = `${stdout}\n${stderr}`;

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  if (result.status === 0) {
    process.exit(0);
  }

  const canRetry = isRetryableFailure(output) && attempt < maxAttempts;
  if (!canRetry) {
    if (result.error) {
      console.error("Prisma generate failed:", result.error.message);
    }
    process.exit(result.status || 1);
  }

  const waitMs = baseDelayMs * attempt;
  console.warn(
    `Prisma generate hit a file-lock issue (attempt ${attempt}/${maxAttempts}). Retrying in ${waitMs}ms...`,
  );
  await sleep(waitMs);
}

process.exit(1);
