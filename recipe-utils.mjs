export const CATEGORIES = ['All', 'Breakfast', 'Main Food', 'Noodles', 'Rice', 'Dessert', 'Favorites'];

export function matchesRecipeFilter(recipe, { search = '', category = 'All' } = {}) {
  const query = search.trim().toLowerCase();
  const titleMatches = !query || (recipe.title || '').toLowerCase().includes(query);
  const categoryMatches = category === 'All'
    || (category === 'Favorites' ? Boolean(recipe.favorite) : recipe.category === category);
  return titleMatches && categoryMatches;
}

export function createRecipeRecord(input, id = crypto.randomUUID()) {
  const now = new Date().toISOString();
  const cleanList = (items = []) => items.map(item => String(item).trim()).filter(Boolean);
  return {
    id,
    title: String(input.title || '').trim(),
    category: String(input.category || 'Main Food').trim(),
    cookTime: String(input.cookTime || '').trim(),
    servings: String(input.servings || '').trim(),
    ingredients: cleanList(input.ingredients),
    steps: cleanList(input.steps),
    coverImage: input.coverImage || '',
    galleryImages: Array.isArray(input.galleryImages) ? input.galleryImages.filter(Boolean) : [],
    favorite: Boolean(input.favorite),
    createdAt: input.createdAt || now,
    updatedAt: now
  };
}
