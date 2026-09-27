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


test('Euler aligned callout preserves underbrace subscripts and TeX row breaks', () => {
  const text = String.raw`> [!NOTE] Title
> \[\begin{aligned}
> e^{i \theta} &= \underbrace{\cosh(i\theta)}_{\text{even}} + \underbrace{\sinh(i\theta)}_{\text{odd}} \\
> &= \cos \theta + i \sin \theta
> \end{aligned}\]`;
  const result = project(text);
  assert.equal(result.source, text.split('\n').slice(1).map(line => line.slice(2)).join('\n').slice(2, -2));
  assert.equal(result.standalone, true);
  assert.ok(result.source.includes(String.raw`}_{\text{even}}`));
  assert.ok(result.source.includes(String.raw`\\`));
});

test('multiline plain displays retain surrounding prose, punctuation and line breaks', () => {
  for (const [text, remaining] of [
    [String.raw`Given \[818+
2\] then continue.`, 'Given \n then continue.'],
    [String.raw`\[818+
2\].`, '\n.'],
    [String.raw`  \[818+
2\]  `, '  \n  ']
  ]) {
    const match = findMathInMarkdown(text)[0];
    const presentation = mathPresentation(text, match);
    assert.equal(presentation.source, '818+\n2');
    const ranges = containerReplacementRanges(text, match, presentation);
    assert.equal(ranges.length, 2);
    for (const range of ranges) assert.ok(!text.slice(range.from, range.to).includes('\n'));
    assert.equal([...ranges].reverse().reduce((value, range) => value.slice(0, range.from) + value.slice(range.to), text), remaining);
  }
});

test('quoted multiline displays beside prose project only validated container prefixes', () => {
  const text = String.raw`> Given \[818+
> 2\] then continue.`;
  const result = project(text);
  assert.equal(result.source, '818+\n2');
  assert.equal(result.standalone, false);
  assert.equal(result.projected, true);
  const match = findMathInMarkdown(text)[0];
  const remaining = [...containerReplacementRanges(text, match, result)].reverse().reduce((value, range) => value.slice(0, range.from) + value.slice(range.to), text);
  assert.equal(remaining, '> Given \n>  then continue.');
  const invalid = String.raw`> Given \[818+
2\] then continue.`;
  const broken = project(invalid);
  assert.equal(broken.source, '818+\n2');
  assert.equal(broken.projected, false);
  assert.deepEqual(containerReplacementRanges(invalid, findMathInMarkdown(invalid)[0], broken), []);
});
