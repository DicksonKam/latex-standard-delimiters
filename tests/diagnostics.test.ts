import assert from 'node:assert/strict';
import test from 'node:test';
import { diagnoseEquation } from '../src/diagnostics';

test('diagnosis distinguishes recognized exact TeX from delimiter loss', () => {
  const source = '\\[\n\\begin{pmatrix}a\\\\b\\end{pmatrix}\n\\]';
  const valid = diagnoseEquation(source, 0, source.length);
  assert.equal(valid.equations.length, 1);
  assert.equal(valid.equations[0].source, '\n\\begin{pmatrix}a\\\\b\\end{pmatrix}\n');
  assert.equal(valid.repair, undefined);
  for (const broken of [source.replace('\\[', '['), source.replace('\\]', ']'), source.replace('\\[', '[').replace('\\]', ']')]) {
    const diagnosis = diagnoseEquation(broken, 0, broken.length);
    assert.equal(diagnosis.equations.length, 0);
    assert.equal(diagnosis.repair?.replacement, source);
    assert.equal(broken.includes('a\\\\b'), true);
  }
});
test('a caret in recognized math diagnoses the whole equation', () => {
  const text = 'Before \\(x_1\\) after';
  const d = diagnoseEquation(text, 10, 10);
  assert.equal(d.original, '\\(x_1\\)');
  assert.equal(d.equations.length, 1);
});
test('repair preserves quote prefixes, CRLF, whitespace and interior bytes', () => {
  const broken = '> [\r\n> \\boxed{x_1 + y}\r\n> ]';
  const d = diagnoseEquation(broken, 0, broken.length);
  assert.equal(d.repair?.replacement, '> \\[\r\n> \\boxed{x_1 + y}\r\n> \\]');
  assert.equal(d.repair?.equations[0].source, '\r\n\\boxed{x_1 + y}\r\n');
});
test('no guessing inside code, comments, frontmatter or native dollar math', () => {
  const block = '[\n\\boxed{x}\n]';
  for (const [prefix, suffix] of [
    ['\x60\x60\x60latex\n', '\n\x60\x60\x60'], ['---\nfield: |\n', '\n---'],
    ['<!--\n', '\n-->'], ['<pre>\n', '\n</pre>'],
    ['$$\n', '\n$$'], ['~~~\n', '\n']
  ]) {
    const text = prefix + block + suffix;
    assert.equal(diagnoseEquation(text, prefix.length, prefix.length + block.length).repair, undefined, prefix);
  }
});
test('ordinary brackets, escaped examples, partial and multiple blocks stay unchanged', () => {
  for (const source of ['[link](url)', '[\nordinary prose\n]', '\\\\[\n\\boxed{x}\n\\\\]', '[\n\\boxed{x}\n]\n[\n\\boxed{y}\n]', '- [\n  \\boxed{x}\n  ]']) {
    assert.equal(diagnoseEquation(source, 0, source.length).repair, undefined, source);
  }
  const source = '\\[\\boxed{x}\\]';
  assert.equal(diagnoseEquation(source, 3, 8).repair, undefined);
});
test('row-break damage is diagnosed separately and never silently rewritten', () => {
  const source = '[\n\\begin{pmatrix}\na\\\nb\n\\end{pmatrix}\n]';
  const d = diagnoseEquation(source, 0, source.length);
  assert.equal(d.warnings.length, 1);
  assert.equal(d.repair?.replacement, source.replace('[', '\\[').replace(/\]$/, '\\]'));
});
test('empty and excessively large selections do not propose repairs', () => {
  assert.equal(diagnoseEquation('', 0, 0).repair, undefined);
  assert.equal(diagnoseEquation(' '.repeat(100_001)+'x', 0, 100_002).repair, undefined);
});
test('whole-line selections preserve surrounding blank lines and reject prose prefixes', () => {
  const block = '[\n\\boxed{x}\n]';
  const padded = '\n \r\n' + block + '\n\n';
  assert.equal(diagnoseEquation(padded, 0, padded.length).repair?.replacement, '\n \r\n\\[\n\\boxed{x}\n\\]\n\n');
  const note = 'Before\n' + block + '\nAfter';
  assert.equal(diagnoseEquation(note, 7, 8 + block.length).repair?.replacement, '\\[\n\\boxed{x}\n\\]\n');
  const prefixed = 'Prose ' + block;
  assert.equal(diagnoseEquation(prefixed, 6, prefixed.length).repair, undefined);
  const suffixed = block + ' prose';
  assert.equal(diagnoseEquation(suffixed, 0, block.length).repair, undefined);
});

test('leading bracket ambiguity is warned without modifying recognized math', () => {
  const source = '\\[\n\\begin{aligned}\n[\\mathbf r]_{\\mathrm{cyl}} &= x\n\\end{aligned}\n\\]';
  const d = diagnoseEquation(source, 0, source.length);
  assert.equal(d.equations.length, 1);
  assert.match(d.warnings.join(' '), /optional alignment argument/);
  assert.equal(d.original, source);
  assert.equal(d.repair, undefined);
  const quote = '> [!NOTE] Matrix\n' + source.split('\n').map(line => '> '+line).join('\n');
  const match = quote.indexOf('\\[');
  assert.match(diagnoseEquation(quote, match, quote.length).warnings.join(' '), /optional alignment argument/);
  const bare = source.replace('\\[', '[').replace('\\]', ']');
  assert.match(diagnoseEquation(bare, 0, bare.length).warnings.join(' '), /optional alignment argument/);
});
test('grouping, alignment options, TeX comments and literal examples avoid false warnings', () => {
  for (const source of [
    '\\begin{aligned}{[\\mathbf r]}_c &= x\\end{aligned}',
    '\\begin{aligned}[t][\\mathbf r]_c &= x\\end{aligned}',
    '\\begin{aligned}[b][\\mathbf r]_c &= x\\end{aligned}',
    '\\begin{gathered}[c]x\\end{gathered}',
    '\\begin{aligned}[]x\\end{aligned}',
    '% \\begin{aligned}[\\mathbf r]\nx',
    '\\\\begin{aligned}[\\mathbf r]'
  ]) {
    const block = '\\[' + source + '\\]';
    assert.equal(diagnoseEquation(block, 0, block.length).warnings.length, 0, source);
  }
  const code = '\x60\x60\x60\n\\[\\begin{aligned}[\\mathbf r]x\\end{aligned}\\]\n\x60\x60\x60';
  assert.equal(diagnoseEquation(code, 0, code.length).warnings.length, 0);
});
