import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { findMathInMarkdown } from '../src/parser';
import { mathPresentation } from '../src/presentation';

const fixtures: Array<{name: string; tex: string}> = JSON.parse(
  fs.readFileSync(new URL('./fixtures/matrix-formulas.json', import.meta.url), 'utf8')
);
for (const {name, tex} of fixtures) {
  test(name + ': exact TeX survives Markdown container projection', () => {
    const block = '\\[' + tex + '\\]';
    for (const source of [
      block,
      '> [!NOTE] Matrix\n' + block.split('\n').map(line => '> ' + line).join('\n'),
      '- ' + block.split('\n').map((line, index) => index ? '  ' + line : line).join('\n')
    ]) {
      const matches = findMathInMarkdown(source);
      assert.equal(matches.length, 1);
      assert.equal(mathPresentation(source, matches[0]).source, tex);
    }
    // Unescaped brackets are ordinary Markdown, even around TeX-looking prose.
    assert.equal(findMathInMarkdown('[' + tex + ']').length, 0);
    // Row-spacing brackets after a TeX row break are not a new display opener.
    const spaced = tex.replaceAll('\\\\', '\\\\[4pt]');
    const matches = findMathInMarkdown('\\[' + spaced + '\\]');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].source, spaced);
  });
}
