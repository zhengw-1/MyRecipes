# Recipe Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, locally stored recipe PWA for iPhone that can be deployed to GitHub Pages and installed to the Home Screen.

**Architecture:** A static HTML/CSS/JavaScript PWA with small focused modules. IndexedDB stores recipe records and image data; the service worker caches only the app shell so app updates can roll forward without clearing user recipes.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, IndexedDB, Service Worker, Web App Manifest.

## Global Constraints
- Phone-only; no cloud sync or accounts.
- Milk-white + pastel-purple visual theme, solid colors only, no gradients.
- Static hosting compatible with GitHub Pages.
- User recipes and uploaded photos persist in IndexedDB.
- Standalone PWA behavior on iPhone Home Screen.

---

### Task 1: App shell and responsive visual system
**Files:** Create `index.html`, `styles.css`, `app.js`.
**Produces:** Mobile library/detail/form views with accessible controls and shared CSS tokens.
- [ ] Build semantic app shell with header, search, filters, recipe grid, detail dialog/view, and editor form.
- [ ] Add mobile-first milk-white/pastel-purple styling with no gradients.
- [ ] Verify at 390x844 and 430x932 viewport sizes.

### Task 2: IndexedDB storage
**Files:** Create `db.js`; modify `app.js`.
**Produces:** `getAllRecipes()`, `getRecipe(id)`, `saveRecipe(recipe)`, `deleteRecipe(id)`.
- [ ] Implement versioned IndexedDB database `recipeTrackerDB`, store `recipes`, keyPath `id`.
- [ ] Store image Data URLs inside recipe objects for simple local persistence.
- [ ] Verify CRUD behavior from browser runtime.

### Task 3: Recipe library interactions
**Files:** Modify `app.js`.
**Consumes:** DB CRUD functions.
**Produces:** Search, category filters, favorites, empty states, recipe-card rendering.
- [ ] Render recipes from IndexedDB.
- [ ] Filter by title, category, and favorites.
- [ ] Toggle favorite state and persist it.
- [ ] Open recipe detail from a card.

### Task 4: Add/Edit/Delete recipe workflow
**Files:** Modify `app.js`, `index.html`, `styles.css`.
**Consumes:** DB CRUD functions.
**Produces:** Valid recipe records with dynamic ingredients, steps, and photos.
- [ ] Add/remove ingredient rows.
- [ ] Add/remove step rows.
- [ ] Preview uploaded cover/gallery images.
- [ ] Save new and edited recipes.
- [ ] Delete recipes with confirmation.

### Task 5: PWA installability and offline shell
**Files:** Create `manifest.json`, `service-worker.js`, `icons/icon-192.png`, `icons/icon-512.png`.
**Produces:** Standalone installable PWA shell.
- [ ] Add manifest with standalone display and theme/background colors.
- [ ] Register service worker.
- [ ] Cache app shell using a versioned cache; do not cache IndexedDB user data.
- [ ] Generate simple pastel-purple recipe-book icons.

### Task 6: Verification and packaging
**Files:** Create `README.md`; create zip archive.
- [ ] Run HTML/link sanity checks.
- [ ] Serve locally and smoke-test key routes/interactions in a headless browser if available.
- [ ] Verify manifest and service-worker files resolve.
- [ ] Package all deployable files at repository root into `RecipeTracker_iPhone_PWA.zip`.
