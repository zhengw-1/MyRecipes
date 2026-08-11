import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesRecipeFilter, createRecipeRecord } from '../recipe-utils.mjs';

test('matchesRecipeFilter filters by search text and category', () => {
  const recipe = { title: 'Creamy Garlic Pasta', category: 'Noodles', favorite: false };
  assert.equal(matchesRecipeFilter(recipe, { search: 'garlic', category: 'Noodles' }), true);
  assert.equal(matchesRecipeFilter(recipe, { search: 'cake', category: 'Noodles' }), false);
  assert.equal(matchesRecipeFilter(recipe, { search: '', category: 'Dessert' }), false);
});

test('matchesRecipeFilter supports favorites mode', () => {
  const favorite = { title: 'Pancakes', category: 'Breakfast', favorite: true };
  const normal = { title: 'Toast', category: 'Breakfast', favorite: false };
  assert.equal(matchesRecipeFilter(favorite, { search: '', category: 'Favorites' }), true);
  assert.equal(matchesRecipeFilter(normal, { search: '', category: 'Favorites' }), false);
});

test('createRecipeRecord trims values and removes empty ingredients and steps', () => {
  const recipe = createRecipeRecord({
    title: '  Miso Soup  ',
    category: 'Main Food',
    cookTime: ' 20 min ',
    servings: ' 2 ',
    ingredients: [' miso ', ' ', 'tofu'],
    steps: [' boil water ', '', ' add miso '],
    favorite: false,
    coverImage: '',
    galleryImages: []
  }, 'abc');

  assert.equal(recipe.id, 'abc');
  assert.equal(recipe.title, 'Miso Soup');
  assert.deepEqual(recipe.ingredients, ['miso', 'tofu']);
  assert.deepEqual(recipe.steps, ['boil water', 'add miso']);
});
