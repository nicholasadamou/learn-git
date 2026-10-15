const groups = [
  { name: "application", patterns: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.ts", "lib/**/*.ts"], limit: 4000 },
  { name: "automation", patterns: ["scripts/**/*.ts"], limit: 100 },
];
for (const { name, patterns, limit } of groups) {
  let lines = 0;
  for (const pattern of patterns) {
    for await (const file of new Bun.Glob(pattern).scan(".")) {
      lines += (await Bun.file(file).text()).split("\n").filter((line) => line.trim()).length;
    }
  }
  console.log(`${name}: ${lines}/${limit} nonblank lines`);
  if (lines > limit) throw new Error(`${name} exceeds its LOC budget; simplify before adding code`);
}

export {};
