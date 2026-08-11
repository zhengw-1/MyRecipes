# My Recipes – iPhone PWA

A phone-first personal recipe tracker that stores recipes and uploaded photos locally on the device using IndexedDB.

## Features
- Categories: All, Breakfast, Main Food, Noodles, Rice, Dessert, Favorites
- Search
- Add, edit, delete, and favorite recipes
- Cover photo + multiple extra photos
- Ingredients and numbered steps
- Cook time and servings
- Offline app shell after first successful load
- Installable as an iPhone Home Screen web app

## GitHub Pages
1. Upload the files in this folder to the root of a GitHub repository.
2. In GitHub: Settings → Pages → Deploy from a branch → `main` → `/(root)`.
3. Open the published `github.io` URL in Safari on your iPhone.
4. Use Share → Add to Home Screen, and enable Open as Web App if shown.

## Updating the app
Upload the newer files using the same names to the same repository. GitHub Pages keeps the same URL. The service worker uses a network-first strategy so newer files can replace cached app-shell files when online.

## Important local-storage note
Your recipes/photos are stored only in IndexedDB on that iPhone/browser installation. They do not sync to other devices. Clearing Safari website data or removing site data may delete recipes. Updating the app files does not intentionally clear the IndexedDB database.
