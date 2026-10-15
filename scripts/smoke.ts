import { createServer } from "node:net";
const listener = createServer();
await new Promise<void>((resolve, reject) => listener.once("error", reject).listen(0, "127.0.0.1", resolve));
const address = listener.address();
if (!address || typeof address === "string") throw new Error("Could not allocate a smoke-test port");
const port = String(address.port);
await new Promise<void>((resolve) => listener.close(() => resolve()));
const server = Bun.spawn(["node", "node_modules/next/dist/bin/next", "start", "-p", port], {
  stdout: "inherit",
  stderr: "inherit",
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("Production server exited early");
    try {
      ready = (await fetch(`http://localhost:${port}`)).ok;
    } catch {
      // The server may still be starting.
    }
    if (ready) break;
    await Bun.sleep(500);
  }
  if (!ready) throw new Error("Production server did not become ready");
  for (const [path, status, text] of [
    ["/", 200, "Learn Git"],
    ["/docs/getting-started/introduction", 200, "Git"],
    ["/docs/essential-commands/git-status", 200, "git status"],
    ["/git-cheatsheet.pdf", 200, "%PDF"],
    ["/does-not-exist", 404, "404"],
  ] as const) {
    const response = await fetch(`http://localhost:${port}${path}`);
    if (response.status !== status || !(await response.text()).includes(text)) {
      throw new Error(`Smoke check failed: ${path} (HTTP ${response.status})`);
    }
    console.log(`Smoke check passed: ${path}`);
  }
} finally {
  server.kill();
  await server.exited;
}
export {};
