# Nusa Reader — Product Requirements Document

**Version:** 1.0 draft  
**Status:** Proposed  
**Working name:** Nusa Reader

## 1. Product summary

Nusa Reader is a modern, minimalist EPUB reading application. The first release is a local-first web application, designed so the core reading experience can later be packaged as a Windows desktop application.

The product is intended to make books easy to import and comfortable to read. It should feel calm and premium, with typography and book content taking priority over interface chrome.

## 2. Problem statement

Readers who already have EPUB files may want a lightweight reader that:
- Opens files directly from their device.
- Preserves the book's semantic structure and embedded media as well as the rendering engine allows.
- Offers comfortable typography and themes.
- Remembers where they stopped reading.
- Does not require an account or remote upload for basic reading.

## 3. Product vision

Provide a focused personal reading space that works locally, feels refined, and can evolve from a browser app into a desktop app without rebuilding the reading experience from scratch.

## 4. Goals

1. Make importing and opening a valid EPUB straightforward.
2. Provide a comfortable, distraction-reduced reading interface.
3. Persist the user's local library, reading position, and preferences.
4. Establish a modular codebase that can support a Tauri desktop shell later.
5. Keep book content on the user's device in the initial release.

## 5. Non-goals

- Building an online bookstore or content subscription service.
- Hosting or sharing user books.
- Circumventing DRM.
- Guaranteeing pixel-perfect rendering for every EPUB.
- Supporting formats other than EPUB in the initial release.
- Building cloud sync, accounts, AI reading features, or social functionality in the MVP.

## 6. Personas

### Personal EPUB reader
Owns EPUB files, wants to open them quickly, and prefers a clean interface.

### Comfort-focused reader
Reads for long sessions and values font size, line spacing, reading width, and warm/dark themes.

### Desktop-first reader
Wants a library that persists locally and may later prefer an installed Windows application.

## 7. Primary user journeys

### Journey A: First use
1. User opens Nusa Reader.
2. User sees a welcoming empty library and an import action.
3. User selects an EPUB file.
4. App validates and reads the file, then stores it locally.
5. Book appears in the library.

### Journey B: Read and resume
1. User opens a book.
2. Reader renders the book and its available navigation.
3. User changes typography or theme.
4. App saves the current location and preferences.
5. User returns later and resumes at the saved location.

### Journey C: Find and remove a book
1. User searches by title or author.
2. User opens a result or selects remove.
3. App asks for confirmation before removal.
4. App removes the local book record and related progress.

## 8. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Import `.epub` files from the local device | Must |
| FR-02 | Extract available EPUB metadata and cover | Must |
| FR-03 | Display imported books in a library grid | Must |
| FR-04 | Render EPUB content through an EPUB rendering engine | Must |
| FR-05 | Navigate previous/next and use the table of contents when available | Must |
| FR-06 | Change theme, font size, font family, line spacing, and reading width | Must |
| FR-07 | Persist imported books locally | Must |
| FR-08 | Persist and restore reading location | Must |
| FR-09 | Search library by title and author | Should |
| FR-10 | Remove books and associated local progress | Must |
| FR-11 | Show clear loading, empty, and error states | Must |
| FR-12 | Keyboard support for common reader actions | Should |
| FR-13 | Basic bookmarks | Could; include only if core scope remains stable |

## 9. Non-functional requirements

### Performance
- Keep library interactions responsive for a reasonable personal library.
- Avoid unnecessary EPUB re-parsing and reader remounts.
- Release reader resources and event listeners when leaving a book.
- Provide visible loading feedback for large books.

### Privacy and storage
- The MVP should not upload EPUB content to a backend.
- Store book data using browser-local storage APIs appropriate for binary files.
- Explain that clearing browser site data may delete the local library.
- Avoid logging book text or personal reading history.

### Security
- Treat EPUB content, markup, CSS, links, and metadata as untrusted input.
- Do not inject EPUB markup into the parent application's DOM without the renderer's isolation/sanitization mechanisms.
- Do not execute scripts found inside EPUB files.
- Avoid granting unnecessary file-system or network permissions.
- Validate file type and size defensively; MIME type alone is not sufficient validation.

### Accessibility
- Use semantic buttons and form controls.
- Ensure controls have accessible names and visible keyboard focus.
- Maintain readable contrast in all themes.
- Do not communicate state through color alone.

### Compatibility
- Target current stable desktop versions of Chromium-based browsers and Firefox where supported by the selected dependencies.
- Test Safari separately before claiming support.
- Plan the desktop package for Windows first.
- DRM-protected files and some fixed-layout EPUBs may not be supported.

## 10. UX and visual direction

### Principles
- Calm, refined, minimal, book-first.
- Use a warm neutral background for the library and reading surface.
- Use strong typography hierarchy and generous whitespace.
- Keep the reading column centered with a controlled maximum width.
- Hide secondary controls when the user enters focused reading mode.
- Prefer subtle borders and restrained shadows over heavy cards or gradients.

### Initial design tokens (provisional)
- Background: warm ivory.
- Surface: white or slightly warmer neutral.
- Primary text: charcoal.
- Secondary text: muted gray.
- Accent: subdued sage or muted olive.
- Radius: medium, consistent.
- Motion: brief and subtle; respect reduced-motion preferences.

Final colors and fonts should be defined as CSS variables so themes can evolve without component rewrites.

## 11. Information architecture

- **Library**
  - Search
  - Import book
  - Book grid
  - Empty state
- **Reader**
  - Reading surface
  - Table of contents
  - Previous/next navigation
  - Typography and theme controls
  - Progress indicator
- **Preferences**
  - Default theme
  - Default typography and spacing

## 12. Data model (conceptual)

### BookRecord
- `id`: stable internal identifier.
- `title`: display title.
- `authors`: list of authors if available.
- `publisher`: optional.
- `language`: optional.
- `identifier`: optional EPUB identifier.
- `coverBlob`: optional cover image data.
- `fileBlob`: original EPUB bytes.
- `importedAt`: timestamp.
- `lastOpenedAt`: optional timestamp.

### ReadingProgress
- `bookId`: reference to BookRecord.
- `cfi`: EPUB location string when supported.
- `updatedAt`: timestamp.

### ReaderPreferences
- `theme`: light, dark, or sepia.
- `fontFamily`: selected font.
- `fontSize`: numeric value with documented bounds.
- `lineHeight`: numeric value with documented bounds.
- `contentWidth`: numeric value with documented bounds.

The actual schema should be versioned to allow future migrations.

## 13. Success metrics

For the MVP, use functional quality gates rather than analytics:
- Successful import and opening of valid test EPUBs.
- Successful restore of reading location after reload.
- No uncaught errors during primary user journeys.
- Production build completes successfully.
- Manual test corpus covers basic text, table of contents, images, missing metadata, and invalid files.

Do not add analytics or telemetry without an explicit product decision.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| EPUB rendering differs by book | Maintain a varied test corpus and document limitations |
| Browser storage quota is exceeded | Catch storage errors and explain recovery options |
| Browser data clearing removes books | Clearly communicate local-only storage behavior |
| Malicious EPUB content | Treat all book content as untrusted and avoid script execution |
| Web and desktop file APIs differ | Isolate platform-specific operations behind a storage/file adapter |
| Scope expands too early | Keep AI, cloud sync, accounts, and non-EPUB formats out of MVP |

## 15. Release criteria

Release an MVP build only after the Definition of Done in `MVP.md` is met, the primary journeys are tested, storage failure states are handled, and known EPUB limitations are documented.
