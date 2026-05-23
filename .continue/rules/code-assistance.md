---
name: "Code Assistance Rules"
description:
  Guides how the agent should interpret and assist with code editing, debugging, or feature creation across the monorepo.
---

### Guiding Principles:
- Always check the nearest `app/` or `package/` folder for architectural context before suggesting imports.
- For Next.js apps, prefer `next/link` and `next/navigation` for routing.
- Do **not** import precompiled Bootstrap CSS (e.g., `core.css`). SCSS + Bootstrap are compiled internally.
- Follow the UI conventions:
  - Shared UI components in `packages/ui`
  - App-specific UI components in `app/[app-name]/components`
- When adding new dependencies, prefer lightweight, tree-shakeable libraries.
- Ensure new code adheres to existing linting and formatting rules.
- When editing shared packages, avoid breaking exports consumed across multiple apps.
- Look for existing utilities and hooks in:
  - `packages/hooks`
  - `packages/utils`
- Prefer composition > duplication. Always check for reusable abstractions before creating new components.
- All code must be TypeScript with strict mode enabled.
- Public interfaces, props, util functions must include comments when logic is non-trivial.

## Response Format:
When responding, follow this structure:

### For Code Implementation or Debugging:
Follow this structure:

**Problem Summary**
Briefly restate what is being solved.

**Improved Code**
Provide complete, ready-to-paste code — not diffs.
do not include imports.
ignore irrelant parts of the code, but make sure where they fit is clear.


**Explanation**
State what was changed and why in clear, practical terms.

**Suggestions (Optional)**
Only include if the improvement is meaningful and actionable.

### For Conceptual Chat or General Questions:
If the user is asking for an explanation, a comparison, or general advice (e.g., "What is the difference between..."), provide a clear, conversational answer. You do not need to follow the rigid block structure above for these types of questions.

## Style Notes
- 2-space indentation
- Prefer declarative logic
- Only provide suggestions that apply to *this* codebase, not theory
