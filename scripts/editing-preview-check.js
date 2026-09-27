(async()=>{
  if(app.vault.getName()!=='TestVault') throw new Error('TestVault only');
  const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf;
  const before=fs.readFileSync(root+'/Examples.md','utf8');
  const results=[],check=(name,passed,detail='')=>results.push({name,passed,detail});
  const wait=async()=>{for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,100));if(leaf.view.containerEl.querySelector('.lsd-editing-preview mjx-math')) return;}};
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
  const view=leaf.view.editor.cm;
  const inline=before.indexOf('\\('), display=before.indexOf('\\[');
  try {
    for(const [name,anchor] of [['inline',inline+2],['display',display+2]]){
      view.dispatch({selection:{anchor}});await wait();
      check(name+' preview shown while source visible',Boolean(view.dom.querySelector('.lsd-editing-preview mjx-container'))&&[...view.dom.querySelectorAll('.cm-line')].some(el=>el.textContent.includes(name==='inline'?'\\(\\frac':'\\[')));
    }
    const number=before.indexOf('12');
    view.dispatch({selection:{anchor:inline+2}});await wait();
    view.dispatch({changes:{from:number,to:number+2,insert:'37'}});await wait();
    check('Preview updates as inline source changes',Boolean(view.dom.querySelector('.lsd-editing-preview mjx-mfrac mjx-num .mjx-c33') && view.dom.querySelector('.lsd-editing-preview mjx-mfrac mjx-num .mjx-c37')));
    view.dispatch({changes:{from:number,to:number+2,insert:'12'}});await wait();
    const letter=before.indexOf('{E}')+1;
    view.dispatch({selection:{anchor:display+3}});await wait();
    view.dispatch({changes:{from:letter,to:letter+1,insert:'F'}});await wait();
    check('Preview updates as display source changes',Boolean(view.dom.querySelector('.lsd-editing-preview .mjx-c1D405')));
    view.dispatch({changes:{from:letter,to:letter+1,insert:'E'}});await wait();
    view.dispatch({selection:{anchor:0}});await new Promise(r=>setTimeout(r,150));
    check('Editing preview disappears outside formula',!view.dom.querySelector('.lsd-editing-preview'));
    check('Restored source exact',view.state.doc.toString()===before);
    await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:true}});
    check('Source mode has no editing previews',!leaf.view.containerEl.querySelector('.cm-editor .lsd-editing-preview'));
  } finally {
    if(view.state.doc.toString()!==before) view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});
    await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
  }
  fs.writeFileSync(root+'/editing-preview-report.json',JSON.stringify({version:JSON.parse(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/manifest.json','utf8')).version,results},null,2));
  console.log('EDITING PREVIEW',results.filter(x=>!x.passed));
})();
