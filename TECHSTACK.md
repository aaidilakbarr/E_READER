# Nusa Reader — Technical Stack and Architecture

**Version:** 1.0 draft  
**Architecture style:** Client-side, local-first, modular frontend

## 1. Technology decisions

| Layer | Technology | Purpose |
|---|---|---|
| Language | TypeScript | Type safety across application modules |
| UI | React | Component-based interface |
| Build/dev server | Vite | Local development and production builds |
| EPUB rendering | epub.js | EPUB parsing/rendering and navigation APIs |
| Styling | CSS Modules or plain CSS with variables | Controlled visual system and reader themes |
| Local persistence | IndexedDB, through a small storage adapter | Store EPUB bytes, metadata, and progress |
| Unit/component tests | Vitest and React Testing Library | Test core logic and UI behavior |
| Browser automation | Playwright (recommended) | Test import and reading journeys |
| Desktop shell (later) | Tauri 2 | Package the web UI as a Windows desktop app |
| Desktop native integration (later) | Tauri plugins/capabilities as needed | Carefully scoped file-system and OS integration |

Use current stable compatible versions when creating the project. Commit the lockfile and avoid floating dependency versions in production.

## 2. Why this stack

- React and TypeScript allow the library and reader to be developed as separate features.
- Vite offers a straightforward development/build workflow.
- epub.js avoids building a custom EPUB rendering engine from scratch.
- IndexedDB supports binary file storage in the browser, unlike `localStorage`, which is not appropriate for EPUB file bytes.
- Tauri can later package the frontend as a desktop application while keeping most UI and reader logic shared.

## 3. Architecture overview

```text
React UI
  ├── Library feature
  │    ├── LibraryPage
  │    ├── BookCard
  │    └── ImportBookButton
  ├── Reader feature
  │    ├── ReaderPage
  │    ├── EpubViewer
  │    ├── ReaderToolbar
  │    └── ReaderSettings
  └── Application services
       ├── epubService
       ├── libraryService
       ├── progressService
       └── storage adapter
              └── IndexedDB (web)
                  └── future desktop storage adapter
```

The UI should depend on service interfaces rather than directly on browser storage or Tauri APIs. This makes platform-specific changes easier.

## 4. Proposed directory structure

```text
nusa-reader/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── AppSidebar.tsx
│   │   ├── BookCard.tsx
│   │   ├── EmptyLibrary.tsx
│   │   ├── ImportBookButton.tsx
│   │   └── ReaderToolbar.tsx
│   ├── features/
│   │   ├── library/
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── libraryService.ts
│   │   │   └── library.types.ts
│   │   ├── reader/
│   │   │   ├── ReaderPage.tsx
│   │   │   ├── EpubViewer.tsx
│   │   │   ├── ReaderSettings.tsx
│   │   │   ├── readerService.ts
│   │   │   └── reader.types.ts
│   │   └── bookmarks/
│   │       └── bookmarkService.ts
│   ├── services/
│   │   ├── epubService.ts
│   │   ├── progressService.ts
│   │   └── storage/
│   │       ├── storage.types.ts
│   │       ├── indexedDbStorage.ts
│   │       └── storageFactory.ts
│   ├── hooks/
│   │   ├── useEpub.ts
│   │   └── useReadingProgress.ts
│   ├── types/
│   │   └── book.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── globals.css
│   │   └── reader.css
│   ├── test/
│   └── main.tsx
├── tests/
│   └── e2e/
├── src-tauri/                 # Add when desktop packaging starts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Do not create every file as an empty placeholder at project initialization. Add modules as the relevant feature is implemented.

## 5. Core interfaces (illustrative)

```ts
export interface BookRecord {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  language?: string;
  identifier?: string;
  coverBlob?: Blob;
  fileBlob: Blob;
  importedAt: number;
  lastOpenedAt?: number;
}

export interface ReadingProgress {
  bookId: string;
  cfi: string;
  updatedAt: number;
}

export interface ReaderPreferences {
  theme: "light" | "dark" | "sepia";
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
}

export interface BookStorage {
  listBooks(): Promise<BookRecord[]>;
  getBook(id: string): Promise<BookRecord | undefined>;
  saveBook(book: BookRecord): Promise<void>;
  deleteBook(id: string): Promise<void>;
  getProgress(bookId: string): Promise<ReadingProgress | undefined>;
  saveProgress(progress: ReadingProgress): Promise<void>;
}
```

These interfaces are starting points. Refine them against the selected epub.js version and actual storage implementation. Avoid leaking `IDBDatabase`, Tauri types, or epub.js internals into UI components.

## 6. EPUB lifecycle

1. User selects a file.
2. Validate extension, file size policy, and basic readability. Do not rely only on the MIME type.
3. Create an EPUB instance from the file bytes.
4. Read metadata and cover where available.
5. Store the original file and extracted metadata in IndexedDB.
6. When opening a book, create a reader instance and render into a dedicated container.
7. Restore the saved EPUB CFI/location if valid.
8. Listen for location changes and debounce progress writes.
9. On reader unmount, remove event listeners and destroy/release the EPUB instance and rendition resources as supported by the library.
10. Revoke any object URLs created by the app when they are no longer needed.

Avoid repeatedly creating a rendition during ordinary React re-renders. Keep its lifecycle controlled by a hook or service.

## 7. Storage design

Use IndexedDB object stores such as:
- `books`: metadata and EPUB `Blob`/binary data.
- `progress`: location and last-updated timestamp, keyed by book ID.
- `preferences`: reader defaults and UI preferences.

A schema version and migration path are required. Treat quota errors and private-browsing restrictions as recoverable states where possible. The app must explain that clearing site data may remove the library.

For desktop, implement a separate adapter only after deciding whether files should be copied into app-managed storage or referenced from user-selected paths. Do not assume browser IndexedDB behavior is identical across desktop packaging.

## 8. Security considerations

- Treat EPUB contents as untrusted.
- Do not execute scripts embedded in a book.
- Keep rendering within the isolation/sanitization boundaries provided by the EPUB renderer.
- Do not blindly inject raw book HTML into the top-level application document.
- Validate internal and external navigation; open external links deliberately.
- Limit file sizes or warn on unusually large files.
- Do not upload book files or content to a server in the MVP.
- For Tauri, configure minimal capabilities and permissions; do not grant broad file-system access without need.

## 9. Testing strategy

### Unit tests
- Metadata normalization and fallback values.
- Storage CRUD and migration logic.
- Progress save/restore and invalid location fallback.
- Preference validation and bounds.

### Integration tests
- Import a valid EPUB.
- Load metadata and cover.
- Open a book and navigate.
- Change preferences and persist them.
- Delete a book and related progress.
- Handle invalid/corrupt files and storage quota failures.

### End-to-end tests
- Empty library → import → open → navigate → reload → resume.
- Search → open book.
- Remove book → confirm removal.

Use legal, non-DRM sample EPUB files for tests.

## 10. Build and runtime requirements

Recommended scripts:
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:e2e` (after Playwright setup)

The exact script names depend on the generated Vite project. Keep TypeScript strict mode enabled where practical and fix warnings rather than suppressing them indiscriminately.
