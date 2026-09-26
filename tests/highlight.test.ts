import assert from 'node:assert/strict';
import test from 'node:test';
import { mathTokens, matchingBraces } from '../src/highlight';

test('commands, escaped punctuation and comments do not become braces', () => {
  const text = '\\frac{12.5}{x_2} + \\{ % ignored { 3\n';
  const tokens = mathTokens(text, 8);
  assert.equal(tokens.filter(t => t.kind === 'command').length, 2);
  assert.equal(tokens.filter(t => t.kind === 'brace').length, 4);
  assert.equal(tokens.filter(t => t.kind === 'number').length, 2);
  for (const token of tokens) assert.ok(token.to > token.from && token.from >= 8);
});
test('matches nested braces and excludes escaped braces / comments', () => {
  assert.deepEqual(matchingBraces('{x_{2}}', 0), [0, 6]);
  assert.deepEqual(matchingBraces('{x_{2}}', 4), [3, 5]);
  assert.deepEqual(matchingBraces('\\{x\\}', 1), []);
  assert.deepEqual(matchingBraces('% { ignored', 2), []);
  assert.deepEqual(matchingBraces('{x', 0), [0]);
});

test('scalable asymmetric and invisible delimiters are valid', () => {
  assert.deepEqual(matchingBraces(String.raw`\left( x \right.`, 5), []);
  const source = String.raw`\left( x \right]`;
  assert.deepEqual(matchingBraces(source, 5), [5,source.length-1]);
  assert.deepEqual(matchingBraces(String.raw`\left. x \right)`, 15), []);
});
