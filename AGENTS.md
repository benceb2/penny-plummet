# Agent Guidelines

## Goals
- Optimize for correctness and maintainable reasoning.
- Prefer clarity over cleverness.

## Architecture and Style
- Use Vue Composition API only. Avoid Options API.
- Prefer Bootstrap classes; keep custom CSS to a minimum.
- Keep i18n up to date. Do not hardcode user-facing strings in templates.

## Testing
- If files under `src/` change, run relevant tests.
- Use existing scripts in `package.json`:
  - `npm run test` (Vitest)
  - `npm run test:a11y` (Playwright + axe)
  - `npm run type-check`
  - `npm run lint`
- Ensure any new UI is covered by a11y tests.

## Workflow
- Use the project’s existing tooling and scripts.
- Ask when requirements are ambiguous or when changes could be high-impact.
- This repo expects the Node version from `.nvmrc`. If tests/lint/a11y fail with Node version errors, run `nvm use` (or your local script that does so).
