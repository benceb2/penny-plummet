# Contributing

Thanks for taking an interest in Penny Plummet. Bug reports, ideas and pull requests are all welcome.

## Before you start

- For anything larger than a small fix, open an issue first so the approach can be agreed before you spend time on it.
- Have a look through the open issues to avoid duplicating work.

## Local setup

The project expects the Node version in `.nvmrc` (Node 20).

```sh
nvm use
npm install
npm run dev
```

The a11y tests need Playwright's Chromium once: `npx playwright install --with-deps chromium`. The screenshot tests need Docker.

## Conventions

The conventions in [AGENTS.md](AGENTS.md) apply to everyone, not only to coding agents. The ones that come up most:

- Vue Composition API only.
- Prefer Bootstrap classes and keep custom CSS to a minimum.
- No hardcoded user-facing strings. Add every message to both `src/locales/en` and `src/locales/hu`; a parity test in the unit suite fails if the two trees drift apart.
- New UI needs accessibility coverage, either in `tests/a11y` or in a component test with `vitest-axe`.

## Checks

Run these before opening a pull request. CI runs the same set.

```sh
npm run type-check
npm run lint
npm test
npm run test:a11y
npm run test:screenshots
```

### Screenshot baselines

Visual regression baselines live in `tests/screenshots/__screenshots__` and are rendered inside the official Playwright container so that local runs match CI. Always run them through `npm run test:screenshots`; a bare `npx playwright test` on macOS uses different fonts and reports every screenshot as changed.

If your change intentionally alters how a screen looks:

1. Run `npm run test:screenshots` and check that only the screens you touched fail.
2. Run `npm run test:screenshots:update` to re-render the failing baselines.
3. Review the updated PNGs in the diff before committing them.

## Pull requests

- Branch from `master` and keep each PR to one change.
- Describe what changed and how you tested it. Screenshots help for UI changes.
- CI needs to be green before a PR is merged.
