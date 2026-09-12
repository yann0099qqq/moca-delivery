import { spawn } from "node:child_process";

const incoming = process.argv.slice(2);
const args = ["node_modules/next/dist/bin/next", "dev"];
for (let index = 0; index < incoming.length; index += 1) {
  const value = incoming[index];
  if (value === "--strictPort") continue;
  args.push(value === "--host" ? "--hostname" : value);
}

const child = spawn(process.execPath, args, { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
