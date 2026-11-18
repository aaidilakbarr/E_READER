# Agent Instructions — Nusa Reader

These instructions apply to coding agents working in this repository.

## 1. Product context

Nusa Reader is a modern, minimalist, local-first EPUB reader. The first target is a React + TypeScript web app. A Windows desktop package using Tauri 2 is planned after the web reading experience is stable.

Read these documents before substantial changes:
- `PRD.md` — product requirements and UX direction.
- `MVP.md` — release scope and acceptance criteria.
- `TECHSTACK.md` — architecture, technology decisions, data model, and security.
- `DEVELOPMENT.md` — setup, milestones, testing, and workflow.

If documents conflict, prioritize the explicit user request, then `PRD.md` for product intent, `MVP.md` for release scope, and `TECHSTACK.md` for implementation decisions. Update the documents when an intentional decision changes.

## 2. Core rules

1. Keep the MVP focused on opening and reading EPUB files.
2. Do not add accounts, a backend, cloud sync, AI features, or other formats unless explicitly requested.
3. Keep the web app local-first. Do not upload EPUB files, book text, or reading history.
4. Use TypeScript and maintain clear, typed interfaces.
5. Keep UI components separate from EPUB engine and storage implementation details.
6. Put platform-specific file operations behind service interfaces.
7. Prefer small, testable changes over broad rewrites.
8. Do not claim a feature is implemented or tested unless it actually is.
9. Do not silently remove existing functionality to make a build pass.
10. Ask a concise question if a product decision is genuinely blocking; otherwise use the least surprising option consistent with the docs.

## 3. Design system and UX

- Aim for a calm, premium, minimalist reading experience.
- Use CSS variables for theme tokens and reader preferences.
- Keep book content as the visual focus in reader mode.
- Use generous whitespace and restrained borders/shadows.
- Keep motion subtle and respect reduced-motion preferences.
- Support light, dark, and sepia reading themes.
- Provide useful loading, empty, and error states.
- Use semantic HTML, accessible labels, keyboard focus indicators, and adequate contrast.
- Avoid decorative UI that competes with the text.

## 4. EPUB and security rules

- Treat every EPUB file and its contents as untrusted.
- Never execute scripts embedded in EPUB content.
- Do not inject raw EPUB markup into the parent application DOM without appropriate renderer isolation and sanitization.
- Validate input defensively; do not rely solely on extension or MIME type.
- Handle missing metadata and malformed files gracefully.
- Do not promise universal support for DRM-protected or fixed-layout EPUBs.
- Manage the EPUB renderer lifecycle carefully: prevent duplicate instances, unsubscribe listeners, and release resources on unmount.
- Revoke object URLs when no longer needed.
- Validate external links and open them deliberately.
- Do not broaden Tauri file-system permissions beyond the exact feature requirements.

## 5. Storage rules

- Use IndexedDB for web storage of EPUB binary data and related local records; do not store full EPUB bytes in `localStorage`.
- Version the database schema and provide migrations for future changes.
- Store progress by stable book ID and EPUB location/CFI where supported, not only by a page number.
- Debounce frequent progress writes.
- Handle quota and storage errors with visible feedback.
- Remove associated progress when a book is deleted.
- Never store secrets; do not add analytics or telemetry without explicit approval.

## 6. Code quality

- Keep components focused and reasonably small.
- Use clear names and avoid unnecessary abstraction.
- Keep React effects and EPUB instance lifecycles predictable.
- Avoid reinitializing the EPUB rendition on every state change.
- Prefer typed service contracts and dependency boundaries.
- Avoid `any` unless there is a documented reason and a narrow boundary.
- Do not add dependencies when a small existing utility is sufficient.
- Follow the formatting and linting conventions already present in the repository.
- Do not invent package scripts; inspect `package.json` before using them.

## 7. Testing and verification

For each change:
1. Inspect relevant files and current project conventions.
2. Identify the acceptance criteria affected.
3. Implement the smallest coherent change.
4. Add or update tests for meaningful behavior.
5. Run relevant tests and a production build when available.
6. Report what was changed, what was tested, and any remaining limitation.

Core flows to protect:
- Import a valid EPUB.
- Handle invalid/corrupt EPUB.
- Render book content and navigate chapters.
- Save and restore progress.
- Persist reader preferences.
- Search and remove a library item.
- Handle storage failures without crashing.

Never say tests passed if they were not run. If an environment limitation prevents a test, state that clearly.

## 8. Git and scope

- Do not overwrite unrelated user changes.
- Do not reset, force-push, or delete branches unless explicitly instructed.
- Do not commit generated binaries, personal EPUB files, or local reading data.
- Keep commits and changes scoped to the requested task.
- Update relevant documentation when architecture, behavior, or setup changes.

## 9. Expected response format for coding tasks

When reporting completed work, summarize:
- **Implemented:** concrete changes.
- **Verification:** commands/tests actually run and their results.
- **Limitations:** known issues or untested behavior.
- **Next step:** one practical follow-up.

Be concise and factual. Do not report a planned feature as complete.
