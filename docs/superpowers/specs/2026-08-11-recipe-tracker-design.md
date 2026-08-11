# Recipe Tracker Mobile PWA Design

## Goal
Build a phone-first personal recipe tracker that can be hosted on GitHub Pages and installed on an iPhone Home Screen as a standalone web app.

## Visual Design
- Milk-white base background.
- Pastel purple primary accent.
- Solid colors only; no gradients.
- Clean hierarchy, generous whitespace, rounded cards, and large food photography.
- Optimized for iPhone-sized screens.

## Navigation
- Home/library with search and category filters: All, Breakfast, Main Food, Noodles, Rice, Dessert.
- Favorites filter.
- Add Recipe action.
- Recipe detail view.
- Add/Edit Recipe form.

## Recipe Data
Each recipe supports:
- title
- category
- cover photo
- optional cooking time
- optional servings
- ingredient list
- numbered step list
- extra photo gallery
- favorite state
- created/updated timestamps

## Behaviors
- Add, edit, delete, and favorite recipes.
- Add/remove ingredients and steps dynamically.
- Upload a cover photo and multiple gallery photos.
- Search by recipe title and filter by category/favorites.
- Store all recipe data and uploaded images locally on the phone in IndexedDB.
- Updates to app files via GitHub Pages must not intentionally clear recipe storage.

## PWA
- `index.html`, `manifest.json`, `service-worker.js`, icons.
- Standalone display mode.
- Cache app shell for offline opening after first load.
- Repository-root friendly for GitHub Pages project URLs.

## Constraints
- Phone-only; no cloud sync or accounts.
- No external JavaScript frameworks or build step.
- Must work as static files on GitHub Pages.
