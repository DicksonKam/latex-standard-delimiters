import assert from 'node:assert/strict';
import test from 'node:test';
import { findMathInMarkdown as parse, tableCellSources } from '../src/parser';

test('inline and multiline display matches retain exact offsets', () => {
  const text = 'A \\(\\frac{1}{2}\\) B\n\\[\nx_1+x_2\n\\]';
  assert.deepEqual(parse(text).map(m => [m.source,m.display]), [['\\frac{1}{2}',false],['\nx_1+x_2\n',true]]);
  for (const m of parse(text)) assert.equal(text.slice(m.from+2,m.to-2),m.source);
});
test('escaped, empty, incomplete and multiline inline equations stay literal', () => {
  assert.deepEqual(parse('\\\\(no\\) \\(\\) \\(a\nb\\) \\[never closed'), []);
});
test('skips fenced code including long fences, callouts and unclosed fences', () => {
  const text = '````tex\n```\n\\(code\\)\n````\n> ```\n> \\(quote code\\)\n> ```\n\\(yes\\)\n~~~\n\\[no\\]';
  assert.deepEqual(parse(text).map(m=>m.source), ['yes']);
});
test('skips equal-length inline code spans including multiline spans', () => {
  assert.deepEqual(parse('``a ` \\(no\\)\nb`` \\(yes\\)').map(m=>m.source),['yes']);
  assert.deepEqual(parse('`\\[no\\]` \\[yes\\]').map(m=>m.source),['yes']);
});
test('skips native dollar math, frontmatter, HTML code and comments', () => {
  const text = '---\nx: \\(no\\)\n---\n$\\text{\\(no\\)}$ $$\\[no\\]$$\n<!-- \\(no\\) --> <code>\\(no\\)</code> \\(yes\\)';
  assert.deepEqual(parse(text).map(m=>m.source),['yes']);
});
test('currency does not hide subsequent delimiter math', () => {
  assert.deepEqual(parse('cost $5 and \\(x\\), then $10').map(m=>m.source),['x']);
});
test('indented code remains source; malformed math cannot span a fenced code block', () => {
  assert.deepEqual(parse('    \\(code\\)\n\\[\n```\nnot math\n```\n\\]'),[]);
});
test('latex backticks within math are preserved as math contents', () => {
  assert.deepEqual(parse('\\(x`+1\\)').map(m=>m.source),['x`+1']);
});

test('display math supports indented LaTeX content', () => {
  assert.deepEqual(parse('\\[\n    \\frac{1}{2}\n\\]').map(m=>m.source),['\n    \\frac{1}{2}\n']);
});

test('fenced code nested in list items remains literal', () => {
  const markdown = '- ```tex\n  \\(no\\)\n  ```\n\\(yes\\)\n1. ~~~\n   \\[no\\]\n   ~~~';
  assert.deepEqual(parse(markdown).map(m=>m.source), ['yes']);
});

test('display closes outside TeX comments; escaped percent is literal', () => {
  const text = String.raw`\[x % \] is commented out
 + y\]`;
  assert.equal(parse(text)[0]?.source, 'x % \\] is commented out\n + y');
  assert.equal(parse(String.raw`\(x\%+y\)`)[0]?.source, String.raw`x\%+y`);
  assert.deepEqual(parse(String.raw`\(x % closing \)`), []);
});
test('incomplete opener does not swallow a following complete formula', () => {
  assert.deepEqual(parse(String.raw`\[unfinished \[valid\]`).map(m=>m.source), ['valid']);
  assert.deepEqual(parse('\\(unfinished\n\\(valid\\)').map(m=>m.source), ['valid']);
});
test('inline math in tables, lists and callouts keeps source offsets', () => {
  const text = String.raw`| cell \(x_1\) |
- \(y\)
> [!note] \(z\)`;
  assert.deepEqual(parse(text).map(m=>m.source), ['x_1','y','z']);
  for (const match of parse(text)) assert.equal(text.slice(match.from+2,match.to-2),match.source);
});

test('table cell source preserves escaped and code pipes', () => {
  const source=String.raw`| plain (x), math \(x\) | a\|b | ` + "`a|b` |";
  assert.deepEqual(tableCellSources(source).map(c=>source.slice(c.from,c.to).trim()), [String.raw`plain (x), math \(x\)`,String.raw`a\|b`,'`a|b`']);
  assert.equal(tableCellSources('header | second').length,2);
});

test('long backslash runs and protected-region-heavy notes recover correctly', () => {
  const text='\\'.repeat(100_000)+String.raw`a \(valid\)`;
  assert.deepEqual(parse(text).map(m=>m.source),['valid']);
  const blocks=Array.from({length:1000},()=>"`"+String.raw`\(code\)`+"` "+String.raw`\(math\)`+'\n').join('');
  assert.equal(parse(blocks).length,1000);
});

test('blockquote rule at note start is not YAML frontmatter', () => {
  assert.deepEqual(parse('> ---\n> \\(x\\)').map(m=>m.source),['x']);
});
