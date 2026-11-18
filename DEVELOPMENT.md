# Nusa Reader — Development Guide

## 1. Development principles

- Build the smallest working vertical slice first: import one EPUB, render it, navigate, and restore progress.
- Keep the library and reader separate.
- Keep platform-specific file access behind a storage/service interface.
- Prefer small, reviewable changes.
- Do not add backend services unless a confirmed requirement needs them.
- Keep dependencies and their versions documented in the lockfile.
- Test each core flow manually as well as with automated tests.

## 2. Prerequisites

Install:
- Node.js LTS compatible with the current Vite release.
- npm (or another package manager, chosen once for the project).
- Git.
- A modern browser for testing.

For desktop packaging later:
- Rust toolchain and platform-specific Tauri prerequisites.
- Windows build tools as required by the Tauri version and target environment.

Check the official Vite, epub.js, and Tauri documentation for version-specific setup instructions before installing.

## 3. Initial project setup

Create the React + TypeScript project with Vite:

```bash
npm create vite@latest nusa-reader -- --template react-ts
cd nusa-reader
npm install
```

Install the EPUB renderer:

```bash
npm install epubjs
```

Install test dependencies when ready:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Optionally add Playwright for end-to-end tests:

```bash
npm install -D @playwright/test
npx playwright install
```

Run the development server:

```bash
npm run dev
```

Verify the generated scripts in `package.json`; they may need to be added or adjusted for testing.

## 4. Recommended implementation order

### Milestone 1 — App shell and visual foundation
- Create route/layout structure.
- Add CSS variables for colors, typography, spacing, radii, and shadows.
- Build the library empty state and responsive book grid.
- Create loading, empty, and error components.
- Confirm keyboard focus and basic contrast.

**Exit criteria:** the library shell is usable and visually consistent without EPUB logic.

### Milestone 2 — EPUB proof of concept
- Add a file picker that accepts `.epub`.
- Validate and load a test EPUB with epub.js.
- Render it inside a dedicated reader container.
- Add previous/next controls and table-of-contents navigation.
- Handle load errors and cleanup on navigation away.

**Exit criteria:** a valid sample EPUB opens and can be read without stale reader instances or uncaught errors.

### Milestone 3 — Local library persistence
- Define `BookRecord` and storage interfaces.
- Implement IndexedDB stores and schema versioning.
- Save original file bytes and metadata.
- Reload library records after browser refresh.
- Add duplicate-import behavior and remove-book confirmation.

**Exit criteria:** imported books remain available after reload under normal browser storage conditions.

### Milestone 4 — Reading comfort and progress
- Add theme, font, line-height, and reading-width controls.
- Persist preferences.
- Save EPUB CFI/location with debouncing.
- Restore location on reopen and recover gracefully if a location is invalid.
- Ensure the reader does not recreate itself on every preference/state update unnecessarily.

**Exit criteria:** preferences persist and a user can resume a book after reload.

### Milestone 5 — QA and stabilization
- Test several structurally different EPUBs.
- Test invalid files, missing metadata, and large books.
- Test keyboard navigation and narrow viewport behavior.
- Check object URL cleanup, event listener cleanup, and storage failure handling.
- Run build and test scripts.

**Exit criteria:** MVP acceptance criteria in `MVP.md` are satisfied.

### Milestone 6 — Desktop packaging
- Add Tauri 2 after the web MVP is stable.
- Decide how desktop books are stored: imported into app-managed storage or opened from selected paths.
- Add only the necessary file-system capabilities.
- Test the packaged app on Windows.
- Document installer/build steps.

**Exit criteria:** the app launches as a desktop application and core reading flows work in the packaged environment.

## 5. Git workflow

Suggested branches:
- `main`: stable, buildable code.
- `feat/library-ui`
- `feat/epub-renderer`
- `feat/local-storage`
- `feat/reading-progress`
- `feat/reader-settings`
- `feat/tauri-desktop`

Use descriptive commits, for example:
- `feat: add EPUB import and rendering`
- `feat: persist reading progress`
- `fix: clean up rendition on reader unmount`
- `test: cover library storage operations`

Avoid committing user books, personal reading data, generated build output, or secrets.

## 6. Pull request / change checklist

Before considering a change complete:
- [ ] The change matches `MVP.md` and `PRD.md`.
- [ ] Types are explicit and TypeScript errors are resolved.
- [ ] Loading, empty, and error states are covered where relevant.
- [ ] Event listeners, object URLs, and EPUB resources are cleaned up.
- [ ] Local book content is not sent to remote services.
- [ ] Tests are added or updated.
- [ ] `npm run build` passes.
- [ ] Documentation is updated if behavior or setup changed.
- [ ] No unrelated files or formatting churn are included.

## 7. Debugging guidance

### EPUB renders blank
- Inspect browser console and network/resource errors.
- Confirm the reader container has a non-zero size.
- Confirm the EPUB file can be opened by the selected renderer.
- Check whether the file is corrupt or DRM-protected.

### Progress does not restore
- Confirm the renderer emits a valid location/CFI.
- Confirm progress writes finish before navigating away when practical.
- Validate that the saved CFI belongs to the same book.
- Fall back to the start of the book when restoration fails.

### Book disappears after refresh
- Check IndexedDB availability and quota errors.
- Confirm the file bytes are stored, not only a temporary object URL.
- Explain that clearing site data may remove local books.

### Styles do not apply
- Check whether styles are being applied to the EPUB rendition or only the parent app.
- Test the EPUB's own CSS interactions.
- Avoid assuming the parent application's CSS automatically styles content inside the rendition.

## 8. Release checklist

- [ ] Clean install works.
- [ ] Production build succeeds.
- [ ] Core acceptance tests pass.
- [ ] Test EPUB corpus passes with known limitations recorded.
- [ ] Local storage behavior and deletion are verified.
- [ ] No book content is uploaded.
- [ ] Known issues and setup instructions are documented.
- [ ] Desktop packaging is tested separately before claiming desktop support.
