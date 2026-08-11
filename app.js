import { CATEGORIES, matchesRecipeFilter, createRecipeRecord } from './recipe-utils.mjs';
import { getAllRecipes, getRecipe, saveRecipe, deleteRecipe } from './db.js';

const state = {
  recipes: [],
  category: 'All',
  search: '',
  currentRecipeId: null,
  coverImage: '',
  galleryImages: []
};

const $ = (id) => document.getElementById(id);
const views = ['libraryView', 'detailView', 'editorView'];

function showView(id) {
  views.forEach(viewId => {
    const element = $(viewId);
    const active = viewId === id;
    element.classList.toggle('active-view', active);
    element.setAttribute('aria-hidden', String(!active));
  });
  window.scrollTo(0, 0);
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function renderCategories() {
  $('categoryStrip').innerHTML = CATEGORIES.map(category => `
    <button class="category-chip ${category === state.category ? 'active' : ''}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>
  `).join('');
}

function filteredRecipes() {
  return state.recipes.filter(recipe => matchesRecipeFilter(recipe, { search: state.search, category: state.category }));
}

function renderLibrary() {
  renderCategories();
  const recipes = filteredRecipes();
  $('sectionTitle').textContent = state.category === 'All' ? 'All Recipes' : state.category;
  $('recipeCount').textContent = `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`;
  $('emptyState').hidden = recipes.length !== 0;
  $('recipeGrid').hidden = recipes.length === 0;

  $('recipeGrid').innerHTML = recipes.map(recipe => `
    <article class="recipe-card" data-open-recipe="${recipe.id}">
      <div class="recipe-card-image">
        ${recipe.coverImage ? `<img src="${recipe.coverImage}" alt="${escapeHTML(recipe.title)}">` : '<div class="recipe-card-placeholder">♨</div>'}
        <button class="favorite-badge" data-favorite="${recipe.id}" aria-label="${recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}">${recipe.favorite ? '♥' : '♡'}</button>
      </div>
      <div class="recipe-card-copy">
        <h3>${escapeHTML(recipe.title)}</h3>
        <p>${escapeHTML(recipe.category)}</p>
      </div>
    </article>
  `).join('');
}

async function refreshRecipes() {
  state.recipes = await getAllRecipes();
  renderLibrary();
}

function renderDetail(recipe) {
  const ingredients = recipe.ingredients.length
    ? `<ul class="ingredient-list">${recipe.ingredients.map(item => `<li><span class="ingredient-dot"></span><span>${escapeHTML(item)}</span></li>`).join('')}</ul>`
    : '<p class="muted-copy">No ingredients added.</p>';

  const steps = recipe.steps.length
    ? `<ol class="step-list">${recipe.steps.map((step, index) => `<li><span class="step-number">${index + 1}</span><span>${escapeHTML(step)}</span></li>`).join('')}</ol>`
    : '<p class="muted-copy">No steps added.</p>';

  const meta = [
    recipe.cookTime ? `<span class="meta-pill">◷ ${escapeHTML(recipe.cookTime)}</span>` : '',
    recipe.servings ? `<span class="meta-pill">♙ ${escapeHTML(recipe.servings)} ${/serv/i.test(recipe.servings) ? '' : 'servings'}</span>` : ''
  ].join('');

  $('detailContent').innerHTML = `
    <div class="detail-hero ${recipe.coverImage ? '' : 'placeholder'}">
      ${recipe.coverImage ? `<img src="${recipe.coverImage}" alt="${escapeHTML(recipe.title)}">` : '♨'}
    </div>
    <header class="detail-header">
      <h1>${escapeHTML(recipe.title)}</h1>
      <div class="meta-row">
        <span class="category-pill">${escapeHTML(recipe.category)}</span>
        ${meta}
      </div>
    </header>
    <section class="detail-section"><h2>Ingredients</h2>${ingredients}</section>
    <section class="detail-section"><h2>Steps</h2>${steps}</section>
    ${recipe.galleryImages.length ? `<section class="detail-section"><h2>Photos</h2><div class="photo-gallery">${recipe.galleryImages.map((src, i) => `<img src="${src}" alt="${escapeHTML(recipe.title)} extra photo ${i + 1}">`).join('')}</div></section>` : ''}
  `;
  $('detailFavoriteBtn').textContent = recipe.favorite ? '♥' : '♡';
}

async function openRecipe(id) {
  const recipe = await getRecipe(id);
  if (!recipe) return;
  state.currentRecipeId = id;
  renderDetail(recipe);
  showView('detailView');
}

function addRepeatRow(containerId, value = '', type = 'ingredient') {
  const fragment = $('repeatRowTemplate').content.cloneNode(true);
  const row = fragment.querySelector('.repeat-row');
  const textarea = row.querySelector('textarea');
  textarea.value = value;
  textarea.placeholder = type === 'ingredient' ? 'e.g. 2 eggs' : 'Describe this step';
  textarea.dataset.type = type;
  row.querySelector('.remove-row').addEventListener('click', () => {
    row.remove();
    renumberRows(containerId);
  });
  textarea.addEventListener('input', () => autoResize(textarea));
  $(containerId).appendChild(fragment);
  renumberRows(containerId);
  autoResize(textarea);
}

function renumberRows(containerId) {
  [...$(containerId).querySelectorAll('.repeat-row')].forEach((row, index) => {
    row.querySelector('.row-number').textContent = index + 1;
  });
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 45), 180)}px`;
}

function resetEditor() {
  $('recipeForm').reset();
  $('recipeId').value = '';
  state.currentRecipeId = null;
  state.coverImage = '';
  state.galleryImages = [];
  $('coverPreview').hidden = true;
  $('coverPreview').removeAttribute('src');
  $('coverPlaceholder').hidden = false;
  $('ingredientsEditor').innerHTML = '';
  $('stepsEditor').innerHTML = '';
  $('galleryEditor').innerHTML = '';
  addRepeatRow('ingredientsEditor', '', 'ingredient');
  addRepeatRow('stepsEditor', '', 'step');
  $('deleteRecipeBtn').hidden = true;
  $('editorTitle').textContent = 'Add Recipe';
}

async function openEditor(recipeId = null) {
  resetEditor();
  if (recipeId) {
    const recipe = await getRecipe(recipeId);
    if (!recipe) return;
    state.currentRecipeId = recipeId;
    $('recipeId').value = recipeId;
    $('titleInput').value = recipe.title;
    $('categoryInput').value = recipe.category;
    $('cookTimeInput').value = recipe.cookTime || '';
    $('servingsInput').value = recipe.servings || '';
    state.coverImage = recipe.coverImage || '';
    state.galleryImages = [...(recipe.galleryImages || [])];
    if (state.coverImage) {
      $('coverPreview').src = state.coverImage;
      $('coverPreview').hidden = false;
      $('coverPlaceholder').hidden = true;
    }
    $('ingredientsEditor').innerHTML = '';
    $('stepsEditor').innerHTML = '';
    (recipe.ingredients.length ? recipe.ingredients : ['']).forEach(value => addRepeatRow('ingredientsEditor', value, 'ingredient'));
    (recipe.steps.length ? recipe.steps : ['']).forEach(value => addRepeatRow('stepsEditor', value, 'step'));
    renderGalleryEditor();
    $('deleteRecipeBtn').hidden = false;
    $('editorTitle').textContent = 'Edit Recipe';
  }
  showView('editorView');
}

function renderGalleryEditor() {
  $('galleryEditor').innerHTML = state.galleryImages.map((src, index) => `
    <div class="gallery-thumb">
      <img src="${src}" alt="Extra recipe photo ${index + 1}">
      <button type="button" data-remove-photo="${index}" aria-label="Remove photo">×</button>
    </div>
  `).join('');
}

function valuesFromRows(containerId) {
  return [...$(containerId).querySelectorAll('textarea')].map(textarea => textarea.value);
}

async function resizeImageFile(file, maxSize = 1600, quality = 0.82) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', quality);
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function saveCurrentRecipe() {
  if (!$('titleInput').reportValidity()) return;
  const existing = state.currentRecipeId ? await getRecipe(state.currentRecipeId) : null;
  const recipe = createRecipeRecord({
    ...existing,
    title: $('titleInput').value,
    category: $('categoryInput').value,
    cookTime: $('cookTimeInput').value,
    servings: $('servingsInput').value,
    ingredients: valuesFromRows('ingredientsEditor'),
    steps: valuesFromRows('stepsEditor'),
    coverImage: state.coverImage,
    galleryImages: state.galleryImages,
    favorite: existing?.favorite || false,
    createdAt: existing?.createdAt
  }, state.currentRecipeId || crypto.randomUUID());

  await saveRecipe(recipe);
  state.currentRecipeId = recipe.id;
  await refreshRecipes();
  renderDetail(recipe);
  showView('detailView');
  showToast('Recipe saved');
}

async function toggleFavorite(id) {
  const recipe = await getRecipe(id);
  if (!recipe) return;
  recipe.favorite = !recipe.favorite;
  recipe.updatedAt = new Date().toISOString();
  await saveRecipe(recipe);
  await refreshRecipes();
  if (state.currentRecipeId === id && $('detailView').classList.contains('active-view')) renderDetail(recipe);
}

$('categoryStrip').addEventListener('click', event => {
  const chip = event.target.closest('[data-category]');
  if (!chip) return;
  state.category = chip.dataset.category;
  renderLibrary();
});

$('searchInput').addEventListener('input', event => {
  state.search = event.target.value;
  renderLibrary();
});

$('recipeGrid').addEventListener('click', event => {
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) {
    event.stopPropagation();
    toggleFavorite(favorite.dataset.favorite).catch(console.error);
    return;
  }
  const card = event.target.closest('[data-open-recipe]');
  if (card) openRecipe(card.dataset.openRecipe).catch(console.error);
});

$('galleryEditor').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-photo]');
  if (!button) return;
  state.galleryImages.splice(Number(button.dataset.removePhoto), 1);
  renderGalleryEditor();
});

$('coverInput').addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    state.coverImage = await resizeImageFile(file);
    $('coverPreview').src = state.coverImage;
    $('coverPreview').hidden = false;
    $('coverPlaceholder').hidden = true;
  } catch (error) { showToast(error.message); }
});

$('galleryInput').addEventListener('change', async event => {
  const files = [...(event.target.files || [])].slice(0, Math.max(0, 12 - state.galleryImages.length));
  for (const file of files) {
    try { state.galleryImages.push(await resizeImageFile(file, 1400, 0.78)); }
    catch (error) { showToast(error.message); }
  }
  renderGalleryEditor();
  event.target.value = '';
});

$('addRecipeBtn').addEventListener('click', () => openEditor());
$('emptyAddBtn').addEventListener('click', () => openEditor());
$('backBtn').addEventListener('click', () => { showView('libraryView'); state.currentRecipeId = null; });
$('editRecipeBtn').addEventListener('click', () => openEditor(state.currentRecipeId));
$('cancelEditBtn').addEventListener('click', async () => {
  if (state.currentRecipeId) await openRecipe(state.currentRecipeId);
  else showView('libraryView');
});
$('saveRecipeBtn').addEventListener('click', () => saveCurrentRecipe().catch(error => { console.error(error); showToast('Could not save recipe'); }));
$('addIngredientBtn').addEventListener('click', () => addRepeatRow('ingredientsEditor', '', 'ingredient'));
$('addStepBtn').addEventListener('click', () => addRepeatRow('stepsEditor', '', 'step'));
$('detailFavoriteBtn').addEventListener('click', () => toggleFavorite(state.currentRecipeId).catch(console.error));
$('deleteRecipeBtn').addEventListener('click', async () => {
  if (!state.currentRecipeId) return;
  if (!confirm('Delete this recipe? This cannot be undone.')) return;
  await deleteRecipe(state.currentRecipeId);
  state.currentRecipeId = null;
  await refreshRecipes();
  showView('libraryView');
  showToast('Recipe deleted');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.error));
}

refreshRecipes().catch(error => {
  console.error(error);
  $('emptyState').hidden = false;
  $('emptyState').querySelector('h3').textContent = 'Storage could not open';
  $('emptyState').querySelector('p').textContent = 'Try closing and reopening the app.';
});
