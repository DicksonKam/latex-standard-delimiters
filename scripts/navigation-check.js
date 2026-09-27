// Run only through Obsidian DevTools in the disposable TestVault.
(async () => {
  if (app.vault.getName() !== 'TestVault') throw new Error('TestVault only');
  const fs = require('node:fs');
  const root = app.vault.adapter.getBasePath();
  const before = fs.readFileSync(root + '/Navigation.md', 'utf8');
  const leaf = app.workspace.activeLeaf;
  await leaf.setViewState({type:'markdown',state:{file:'Navigation.md',mode:'source',source:false}});
  const wait = () => new Promise(resolve => setTimeout(resolve,150));
  await wait();
  const view = leaf.view.editor.cm;
  const results=[];
  const check=(name,passed,detail='')=>results.push({name,passed,detail});
  for(const [opening,closing] of [[before.indexOf('\\['),before.indexOf('\\]')+2],[before.lastIndexOf('\\['),before.lastIndexOf('\\]')+2]]) {
    for(const [key,anchor] of [['ArrowDown',opening-1],['ArrowUp',closing+1]]) {
      view.dispatch({selection:{anchor}}); await wait();
      view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true})); await wait();
      const head=view.state.selection.main.head;
      check(key+' enters display at '+opening,head>opening&&head<closing,JSON.stringify({anchor,head,opening,closing}));
    }
  }
  const opening=before.indexOf('\\['),closing=before.indexOf('\\]')+2;
  const expected=before.split('\n')[1];
  for(let anchor=opening+1;anchor<closing;anchor++) {
    view.dispatch({selection:{anchor}}); await wait();
    const actual=[...view.dom.querySelectorAll('.cm-line')].find(el=>el.textContent.includes('mathbf'))?.textContent;
    check('Exact source at caret '+anchor,actual===expected,actual);
  }
  for(const [key,anchor,expected] of [['ArrowRight',opening-1,opening],['ArrowLeft',closing+1,closing]]) {
    view.dispatch({selection:{anchor}});await wait();
    view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));await wait();
    check(key+' enters at formula boundary',view.state.selection.main.head===expected,JSON.stringify({anchor,head:view.state.selection.main.head,expected}));
  }
  view.dispatch({selection:{anchor:closing+1}});await wait();
  view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',shiftKey:true,bubbles:true,cancelable:true}));await wait();
  check('Shift-Up selects without collapsing anchor',!view.state.selection.main.empty&&view.state.selection.main.anchor===closing+1);
  check('Selection does not add editing previews',!view.dom.querySelector('.lsd-editing-preview'));
  view.dispatch({selection:{anchor:0}});await wait();
  check('Rendered equations restored',view.dom.querySelectorAll('.lsd-math-block').length===2);
  check('Document unchanged',view.state.doc.toString()===before&&fs.readFileSync(root+'/Navigation.md','utf8')===before);
  fs.writeFileSync(root+'/navigation-report.json',JSON.stringify({version:JSON.parse(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/manifest.json','utf8')).version,results},null,2));
  console.log('NAVIGATION',results.filter(x=>!x.passed));
})();
