(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,oldVim=app.vault.getConfig('vimMode'),results=[];
 const check=(name,passed,detail='')=>results.push({name,passed,detail}),wait=()=>new Promise(r=>setTimeout(r,250));let before;
 try{
  app.vault.setConfig('vimMode',true);app.workspace.updateOptions();
  await leaf.setViewState({type:'markdown',state:{file:'Navigation.md',mode:'source',source:false}});await wait();
  const view=leaf.view.editor.cm;before=view.state.doc.toString();view.contentDOM.focus();
  const key=async(key,code,keyCode)=>{view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key,code,keyCode,which:keyCode,bubbles:true,cancelable:true}));await wait();};
  await key('Escape','Escape',27);view.dispatch({selection:{anchor:0}});await wait();
  check('Vim mode enabled in disposable vault',app.vault.getConfig('vimMode')===true);
  await key('j','KeyJ',74);
  const first=before.indexOf('\\['),end=before.indexOf('\\]',first)+2;
  check('Vim j enters display source',view.state.selection.main.head>=first&&view.state.selection.main.head<=end,String(view.state.selection.main.head));
  check('Vim navigation reveals source text',Array.from(view.dom.querySelectorAll('.cm-line')).some(el=>el.textContent.includes('mathbf')));
  view.dispatch({selection:{anchor:before.indexOf('Below')}});await wait();await key('k','KeyK',75);
  check('Vim k enters preceding display source',view.state.selection.main.head>=first&&view.state.selection.main.head<=end,String(view.state.selection.main.head));
  view.dispatch({selection:{anchor:0}});await wait();await key('2','Digit2',50);await key('j','KeyJ',74);
  check('Vim counted motion retains logical lines',view.state.doc.lineAt(view.state.selection.main.head).number===3,String(view.state.selection.main.head));
  check('Vim normal mode suppresses editing previews',!view.dom.querySelector('.lsd-editing-preview'));
  await key('i','KeyI',73);await key('ArrowDown','ArrowDown',40);await key('Escape','Escape',27);
  check('Vim insert/normal transition preserves source',view.state.doc.toString()===before);
 }finally{app.vault.setConfig('vimMode',oldVim);app.workspace.updateOptions();await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),scope:'Built-in Vim key handling with synthetic keyboard events; manual keyboard check still recommended',mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/vim-report.json',JSON.stringify(report,null,2));console.log('VIM CHECK',results.filter(x=>!x.passed));
})();
