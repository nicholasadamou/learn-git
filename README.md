# Learn Git

[![CI](https://github.com/smeltery/learn-git/actions/workflows/ci.yml/badge.svg)](https://github.com/smeltery/learn-git/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/smeltery/learn-git)](https://github.com/smeltery/learn-git/releases)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?logo=tailwindcss&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=white)
[![Flox](https://img.shields.io/badge/dev_environment-Flox-7b61ff)](https://flox.dev)
[![License](https://img.shields.io/badge/license-PolyForm_Shield_1.0.0-blue)](LICENSE)

Learn Git is a beginner-friendly guide to Git, with searchable lessons,
copyable commands, a downloadable cheat sheet, and light and dark themes.
Built with Next.js, TypeScript, Tailwind CSS, and MDX.

![Learn Git preview](learn-git.gif)

## Run locally

Install [Flox](https://flox.dev/docs/install-flox/), then:

```sh
git clone https://github.com/smeltery/learn-git.git
cd learn-git
flox activate
bun run dev
```

Open <http://localhost:3000>. Activation installs locked dependencies and
pre-commit hooks; `bun run ci` runs the checks and production build used by CI.

## Documentation

Start with the [documentation index](docs/README.md):
[using the guide](docs/using-the-guide.md), [local setup](docs/development.md),
[writing lessons](docs/content.md), [architecture](docs/architecture.md),
and [deployment and releases](docs/deployment.md).

## License

[PolyForm Shield License 1.0.0](LICENSE).
