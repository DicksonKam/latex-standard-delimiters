import assert from 'node:assert/strict';
import test from 'node:test';
import { findMathInMarkdown } from '../src/parser';
import { mathPresentation, containerReplacementRanges } from '../src/presentation';

function project(text: string) {
  const match = findMathInMarkdown(text)[0];
  assert.ok(match);
  const result = mathPresentation(text, match);
  for (const segment of result.segments) {
    assert.equal(text.slice(segment.from, segment.to), result.source.slice(segment.sourceFrom, segment.sourceFrom + segment.to - segment.from));
  }
  return result;
}

test('callout prefixes are removed only from projected TeX, with exact source mapping', () => {
  const text = '> [!note]\n> \\[\n> x_1 + y\n> \\]';
  const result = project(text);
  assert.equal(result.source, '\nx_1 + y\n');
  assert.equal(result.container, 'quote');
  assert.equal(result.standalone, true);
  assert.equal(text, '> [!note]\n> \\[\n> x_1 + y\n> \\]');
});

test('list continuation indentation is stripped without consuming TeX indentation', () => {
  assert.equal(project('- \\[\n    x+y\n  \\]').source, '\n  x+y\n');
  assert.equal(project('12. \\[\n    x+y\n    \\]').source, '\nx+y\n');
});

test('nested quote and quoted list projections preserve TeX relations and comments', () => {
  assert.equal(project('> > \\[\n> > x > y % comment\n> > \\]').source, '\nx > y % comment\n');
  assert.equal(project('> - \\[\n>   x+y\n>   \\]').source, '\nx+y\n');
});

test('container boundaries fail closed instead of stripping ordinary following text', () => {
  assert.equal(project('> \\[\nx+y\n\\]').standalone, false);
  assert.equal(project('- \\[\nx+y\n\\]').standalone, false);
  assert.equal(project('text \\[\nx+y\n\\]').standalone, false);
});

test('plain and inline math retain exact TeX text', () => {
  assert.equal(project('\\[\n    x>y\n\\]').source, '\n    x>y\n');
  assert.equal(project('> inline \\(x>y\\)').source, 'x>y');
  assert.equal(project('> inline \\(x>y\\)').standalone, false);
});

test('container replacements leave quote/list markers and all line boundaries intact', () => {
  for (const text of ['> \\[\n> x+y\n> \\]', '- \\[\n  x+y\n  \\]', '> - \\[\n>   x+y\n>   \\]']) {
    const match = findMathInMarkdown(text)[0];
    const ranges = containerReplacementRanges(text, match);
    assert.ok(ranges.length >= 3);
    for (const range of ranges) assert.equal(text.slice(range.from, range.to).includes('\n'), false);
    const visible = [...ranges].reverse().reduce((value, range) => value.slice(0, range.from) + value.slice(range.to), text);
    assert.equal(visible, text.startsWith('> -') ? '> - \n>   \n>   ' : text.startsWith('>') ? '> \n> \n> ' : '- \n  \n  ');
  }
});

test('display equations on list continuation lines retain their owning indentation', () => {
  assert.equal(project('- Explanation\n\n  \\[\n  x+y\n  \\]').container, 'list');
  assert.equal(project('- Explanation\n\n  \\[\n  x+y\n  \\]').source, '\nx+y\n');
  assert.equal(project('12. Explanation\n\n    \\[\n    x+y\n    \\]').source, '\nx+y\n');
  assert.equal(project('> - Explanation\n>   \\[\n>   x+y\n>   \\]').source, '\nx+y\n');
});
