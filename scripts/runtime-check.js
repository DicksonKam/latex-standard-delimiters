// Developer-only integration checks. Run inside Obsidian's developer console
// with this plugin enabled in the supplied disposable TestVault. Never ship
// this script as plugin startup code. It deliberately refuses other vaults.
(async () => {
  if (app.vault.getName() !== 'TestVault') throw new Error('Run only in TestVault');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = app.vault.adapter.getBasePath();
  const sourcePath = path.join(root, 'Examples.md');
  const before = fs.readFileSync(sourcePath, 'utf8');
  const report = { pluginVersion: '0.3.0', timestamp: new Date().toISOString(), mainJsSha256: require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root, '.obsidian/plugins/latex-standard-delimiters/main.js'))).digest('hex'), tests: [] };
  const assert = (name, condition, detail = '') => {
    report.tests.push({ name, passed: Boolean(condition), detail });
  };
  const settle = async (condition = () => true) => {
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 125));
      if (condition()) return;
    }
  };
  const leaf = app.workspace.activeLeaf;
  const plugin = app.plugins.plugins['latex-standard-delimiters'];
  const originalColors = { ...plugin.colors };
  const state = (mode, source) => leaf.setViewState({ type: 'markdown', state: { file: 'Examples.md', mode, source } });
  const colorsOf = (rootEl, kind) => [...rootEl.querySelectorAll('.lsd-token-' + kind)].map(el => ({ text: el.textContent, color: getComputedStyle(el).color }));
  try {
    await state('source', false); await settle();
    let view = leaf.view.editor.cm;
    view.dispatch({ selection: { anchor: 0 } }); await settle();
    let rootEl = leaf.view.containerEl.querySelector('.cm-editor');
    const inline = [...rootEl.querySelectorAll('.lsd-math-inline')];
    assert('Live Preview renders all three inline examples visibly', inline.length === 3 && inline.every(el => el.querySelector('mjx-container') && el.getBoundingClientRect().width > 0), `count=${inline.length}`);
    assert('Live Preview renders multiline display math', rootEl.querySelectorAll('.lsd-math-block mjx-container').length === 1);
    assert('Native dollar math coexists', rootEl.querySelectorAll('mjx-container').length >= 5);
    assert('Code spans and fences remain literal', rootEl.textContent.includes('\\(\\frac{1}{2}\\)') && rootEl.textContent.includes('\\['));
    inline[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); await settle();
    view = leaf.view.editor.cm;
    const start = before.indexOf('\\(');
    assert('Clicking equation reveals source and moves caret inside', view.state.selection.main.head === start + 2 && [...rootEl.querySelectorAll('.cm-line')].some(el=>el.textContent === before.split('\n')[2]), JSON.stringify({caret:view.state.selection.main.head,start,visible:rootEl.querySelector('.cm-line:nth-child(3)')?.textContent}));
    const kinds = ['command', 'brace', 'number', 'operator', 'delimiter'];
    assert('All requested token categories are highlighted', kinds.every(kind => colorsOf(rootEl, kind).length > 0), JSON.stringify(kinds.map(kind=>[kind,colorsOf(rootEl,kind)])));
    assert('Token categories use distinct visible colors', new Set(kinds.map(kind => colorsOf(rootEl, kind)[0]?.color)).size === kinds.length);
    const brace = before.indexOf('{12}');
    view.dispatch({ selection: { anchor: brace } }); await settle();
    assert('Matching braces highlight as a pair', rootEl.querySelectorAll('.lsd-brace-match').length === 2);
    const selectedEnd = before.indexOf('\\)', start) + 2;
    view.dispatch({ selection: { anchor: start, head: selectedEnd } }); await settle();
    assert('Selecting a formula exposes exact original source', [...rootEl.querySelectorAll('.cm-line')].some(el=>el.textContent === before.split('\n')[2]) && view.state.sliceDoc(start, selectedEnd) === before.slice(start, selectedEnd));
    plugin.colors.command = '#12ab34'; await plugin.saveColors(); await settle();
    view = leaf.view.editor.cm; view.dispatch({ selection: { anchor: start + 3 } }); await settle();
    assert('Custom command color applies without reload', colorsOf(rootEl, 'command').every(token => token.color === 'rgb(18, 171, 52)'));
    const saved = await plugin.loadData();
    assert('Custom color is saved in plugin settings', saved.colors.command === '#12ab34');
    plugin.colors = originalColors; await plugin.saveColors(); await settle();
    view = leaf.view.editor.cm;
    view.dispatch({ selection: { anchor: 0 } }); await settle();
    assert('Leaving the equation rerenders it', rootEl.querySelectorAll('.lsd-math-inline').length === 3);
    // Exercise a real edit and restore it; the scanner must update on document changes.
    view.dispatch({ selection: { anchor: start + 3 } });
    view.dispatch({ changes: { from: brace + 1, to: brace + 3, insert: '24' } }); await settle();
    assert('Editing math updates colored source', view.state.doc.toString().includes('\\frac{24}') && colorsOf(rootEl, 'number').some(token => token.text === '24'));
    view.dispatch({ changes: { from: brace + 1, to: brace + 3, insert: '12' } }); await settle();
    assert('Restoring the edit retains the original document', view.state.doc.toString() === before);
    await state('source', true); await settle();
    rootEl = leaf.view.containerEl.querySelector('.cm-editor');
    assert('Source mode shows raw delimiters and no plugin widgets', rootEl.querySelectorAll('.lsd-math').length === 0 && leaf.view.editor.getValue() === before);
    await state('preview', false); await settle(() => leaf.view.containerEl.querySelector('.markdown-preview-view')?.querySelectorAll('.lsd-math-inline mjx-container').length === 3);
    rootEl = leaf.view.containerEl.querySelector('.markdown-preview-view');
    assert('Reading View renders inline and escaped-brace examples', rootEl.querySelectorAll('.lsd-math-inline mjx-container').length === 3);
    assert('Reading View renders multiline display math', rootEl.querySelectorAll('.lsd-math-block mjx-container').length === 1);
    assert('Reading View leaves inline and fenced code literal', rootEl.querySelector('code')?.textContent === '\\(\\frac{1}{2}\\)' && [...rootEl.querySelectorAll('pre code')].some(el => el.textContent.includes('\\[')));
    leaf.view.previewMode.rerender(true); await settle(() => rootEl.querySelectorAll('.lsd-math-inline mjx-container').length === 3);
    assert('Reading View rerender is idempotent', rootEl.querySelectorAll('.lsd-math-inline mjx-container').length === 3);
    assert('Rendering and settings leave Markdown bytes unchanged', fs.readFileSync(sourcePath, 'utf8') === before);
    const edgeBefore = fs.readFileSync(path.join(root, 'EdgeCases.md'), 'utf8');
    await leaf.setViewState({ type: 'markdown', state: { file: 'EdgeCases.md', mode: 'preview', source: false } });
    await settle(() => leaf.view.containerEl.querySelector('.markdown-preview-view')?.querySelectorAll('.lsd-math-inline').length === 5);
    rootEl = leaf.view.containerEl.querySelector('.markdown-preview-view');
    const plainParagraph = [...rootEl.querySelectorAll('p')].find(el => el.textContent.startsWith('Plain'));
    assert('Reading View distinguishes literal parentheses beside identical math', plainParagraph?.querySelectorAll('.lsd-math-inline').length === 1 && plainParagraph.textContent.includes('Plain (x) then ') && plainParagraph.textContent.includes(' then plain (x).'));
    assert('Code span identical to math is preserved', [...rootEl.querySelectorAll('code')].some(el => el.textContent === '\\(x\\)'));
    assert('Reading View renders math inside links', rootEl.querySelector('a[href="https://example.com"] .lsd-math-inline') !== null);
    assert('Reading View preserves italic prose outside math', [...rootEl.querySelectorAll('em')].some(el=>el.textContent === 'italic prose'));
    assert('Reading View renders indented multiline aligned math', rootEl.querySelectorAll('.lsd-math-block mjx-container').length === 1);
    await leaf.setViewState({ type: 'markdown', state: { file: 'EdgeCases.md', mode: 'source', source: false } }); await settle();
    rootEl = leaf.view.containerEl.querySelector('.cm-editor');
    view = leaf.view.editor.cm;
    view.dispatch({ selection: { anchor: 0 } }); await settle();
    assert('Live Preview renders indented multiline aligned math', rootEl.querySelectorAll('.lsd-math-block mjx-container').length === 1);
    const escapeStart = edgeBefore.indexOf('\\(\\left');
    view.dispatch({ selection: { anchor: escapeStart + 3 } }); await settle();
    assert('Escaped braces reveal exact source while editing', [...rootEl.querySelectorAll('.cm-line')].some(el=>el.textContent === edgeBefore.split('\n')[6]));
    assert('Edge case note bytes remain unchanged', fs.readFileSync(path.join(root, 'EdgeCases.md'), 'utf8') === edgeBefore);

  } catch (error) { assert('Integration runner completed without exception', false, String(error.stack ?? error)); }
  finally {
    plugin.colors = originalColors; await plugin.saveColors();
    await state('source', false);
  }
  report.passed = report.tests.every(test => test.passed);
  fs.writeFileSync(path.join(root, 'runtime-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  return report;
})();
