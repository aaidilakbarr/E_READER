# Nusa Reader — MVP Scope

**Status:** Draft v1  
**Product type:** Local-first EPUB reader  
**Initial platform:** Web app, with a planned Windows desktop version  
**Working name:** Nusa Reader

## 1. MVP objective

Deliver a usable, polished reader that lets a person import an EPUB file, read it in the app, customize the reading presentation, and resume from the last saved position.

The MVP prioritizes reliable EPUB rendering and reading comfort over advanced library management or social/cloud features.

## 2. Target users

- People who already own EPUB files and want a clean reading experience.
- Readers who prefer local storage and do not want to create an account.
- Users who want to adjust typography, spacing, and reading theme.

## 3. In scope

### Library
- Import `.epub` files from the user's device.
- Read basic metadata when available: title, author, publisher, language, identifier, and cover.
- Display imported books in a library grid.
- Show a sensible fallback title/cover when metadata is missing.
- Search the local library by title or author.
- Remove a book from the library, with confirmation.
- Open a book from the library.

### Reading experience
- Render EPUB content using epub.js.
- Display text, headings, images, links, and chapter structure supported by the source EPUB.
- Navigate to previous/next page or spread, where supported by the renderer.
- Open the table of contents and navigate to a chapter.
- Offer light, dark, and sepia themes.
- Adjust font size, font family, line spacing, and reading area width.
- Toggle reader controls to reduce distraction.
- Save and restore the reading location.
- Provide loading, empty, unsupported-file, and error states.

### Local persistence
- Store imported book bytes and metadata in IndexedDB in the web version.
- Store reading location and reading preferences locally.
- Avoid sending book content to a remote server.
- Handle missing, corrupt, or unreadable stored records without crashing the app.

### Quality
- Responsive layout for desktop and tablet-sized browser windows.
- Keyboard navigation for core reader actions where feasible.
- Basic accessibility: semantic controls, visible focus, labels, and adequate contrast.
- Tests for core storage and reader-state logic.

## 4. Out of scope for MVP

- User accounts and authentication.
- Cloud sync or cross-device sync.
- Online book store or book discovery.
- DRM circumvention or support promises for DRM-protected files.
- PDF, MOBI, AZW, comic archive, or audiobook support.
- AI summaries, chat with book, translation, or text-to-speech.
- Highlights, annotations, and exportable notes beyond basic bookmarks if time is limited.
- Multi-user library sharing.
- Full fixed-layout EPUB compatibility guarantee.

## 5. User stories and acceptance criteria

### Import a book
**As a reader,** I can select an EPUB file and add it to my library.

Acceptance criteria:
- The import control accepts `.epub` files.
- Invalid or unreadable files show a useful error message.
- Valid files are stored locally and appear in the library.
- Duplicate imports are handled predictably; do not create accidental duplicates without a clear rule.
- Missing metadata does not prevent import if the EPUB can still be rendered.

### Read a book
**As a reader,** I can open an imported book and read its content.

Acceptance criteria:
- The reader displays the book's content rather than raw XML or extracted plain text.
- The table of contents is available when the EPUB provides one.
- Previous/next navigation works and does not leave multiple stale reader instances behind.
- Closing and reopening a book restores its last known reading location when available.

### Customize reading
**As a reader,** I can tune the reading view to my preference.

Acceptance criteria:
- Theme, font size, font family, line spacing, and reading width update the reading view.
- Preferences persist across reloads.
- The interface remains usable at common desktop widths and at a narrower viewport.

### Manage the library
**As a reader,** I can find and remove books.

Acceptance criteria:
- Search filters by title and author.
- Removing a book requires confirmation.
- Removing a book also removes its associated progress and metadata from local storage.

## 6. Suggested MVP screens

1. **Library:** app navigation, import action, search, book grid, empty state.
2. **Reader:** book content, chapter navigation, reading toolbar, settings panel.
3. **Settings (lightweight):** appearance and reading defaults.
4. **Error/empty states:** no books, import failure, missing metadata, unreadable file.

## 7. Definition of done

The MVP is ready for initial use when:
- A user can import, open, read, close, and reopen a valid EPUB.
- Progress and reading preferences survive a browser reload.
- The app handles a corrupt/unsupported EPUB without crashing.
- The library and reader have consistent responsive styling.
- Core flows have been manually tested against several EPUB samples with different structures.
- `npm run build` succeeds and the test suite passes.
- Known compatibility limitations are documented.

## 8. Suggested test corpus

Use legally obtained test EPUBs that include:
- A simple reflowable novel.
- A book with a table of contents.
- A book with embedded images.
- A book with custom fonts or complex CSS.
- A book with incomplete metadata.
- A deliberately invalid or corrupt EPUB.

Do not use DRM removal or bypass as part of testing.
