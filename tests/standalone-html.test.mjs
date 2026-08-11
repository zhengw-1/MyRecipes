import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('index.html contains its interactive app logic inline for direct-file preview', () => {
  assert.equal(/<script\s+type=["']module["']\s+src=/i.test(html), false, 'must not rely on an external ES module');
  assert.match(html, /id=["']addRecipeBtn["']/);
  assert.match(html, /addRecipeBtn['"]\)\.addEventListener|\$\(['"]addRecipeBtn['"]\)\.addEventListener/);
});
