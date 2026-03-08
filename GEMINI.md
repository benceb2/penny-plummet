# GEMINI.md

## Project Management & Workflow
- **Linear First:** All tasks, bugs, and feature requests MUST be tracked on Linear. 
- **Task Status:** Update the status of Linear issues (e.g., 'In Progress', 'Done') as you work on them.
- **Commit Reference:** When committing changes (if requested), include the Linear issue key (e.g., BEN-123) in the commit message.

## UI/UX Standards (Mobile-First)
- **Visual Hierarchy:** Every screen must have one clear "protagonist." Avoid uniform element weights.
- **Premium Aesthetics:** Prefer solid backgrounds, bold typography, and generous whitespace (e.g., `--space-section: 112px`).
- **Mobile Fluidity:** Use drawers, slide-ups, and fluid layouts instead of manual toggles or rigid Bootstrap grids.
- **Accessibility:** Maintain WCAG 2.1 AA compliance. Run `npm run test:a11y` after any UI changes.

## Development Mandates
- **Vue Composition API:** Strict adherence (No Options API).
- **Styling:** Use CSS variables for tokens. Prioritize the new "Premium" design system over generic Bootstrap defaults.
- **Testing:** New features require both unit/integration tests and a11y specs.
