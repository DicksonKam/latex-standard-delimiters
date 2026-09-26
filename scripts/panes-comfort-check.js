(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),first=app.workspace.activeLeaf,results=[],check=(name,passed,detail='')=>results.push({name,passed,detail}),wait=()=>new Promise(r=>setTimeout(r,250));
 const before=fs.readFileSync(root+'/Comfort.md','utf8');let second;
 try{
  await first.setViewState({type:'markdown',state:{file:'Comfort.md',mode:'source',source:false}});await wait();
  const v1=first.view.editor.cm;v1.dispatch({selection:{anchor:before.indexOf('\\[')+2}});await wait();
  second=app.workspace.getLeaf('split','vertical');await second.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});await wait();
  const v2=second.view.editor.cm,source2=v2.state.doc.toString();v2.dispatch({selection:{anchor:source2.indexOf('\\(')+2}});await wait();
  check('Two panes keep independent editing previews',!!v1.dom.querySelector('.lsd-editing-preview')&&!!v2.dom.querySelector('.lsd-editing-preview'));
  const preview=v1.dom.querySelector('.lsd-editing-preview');
  check('Long equation overflows inside preview',preview.scrollWidth>preview.clientWidth,`${preview.scrollWidth}/${preview.clientWidth}`);
  check('Long preview uses local horizontal scrolling',getComputedStyle(preview).overflowX==='auto');
  preview.scrollLeft=80;check('Preview can scroll horizontally',preview.scrollLeft>0);
  check('Long preview remains within pane',preview.getBoundingClientRect().width<=v1.dom.getBoundingClientRect().width+1);
  const anchor=v1.state.selection.main.head;
  preview.scrollLeft=120;check('Scrolling preview preserves caret and source',v1.state.selection.main.head===anchor&&v1.state.doc.toString()===before);
  v2.dispatch({selection:{anchor:0}});await wait();
  check('Leaving second equation keeps first preview',!v2.dom.querySelector('.lsd-editing-preview')&&!!v1.dom.querySelector('.lsd-editing-preview'));
  check('Math elements use own CSS namespace',!!v1.dom.querySelector('.lsd-math')&&!v1.dom.querySelector('.latex-delimiter-renderer'));
  const bad=before.indexOf('\\(',before.indexOf('Below'));
  v1.dispatch({selection:{anchor:bad+2}});await wait();
  check('Malformed preview shows MathJax error',!!v1.dom.querySelector('.lsd-editing-preview mjx-merror'));
  for(let i=0;i<3;i++){await app.plugins.disablePlugin('latex-standard-delimiters');await app.plugins.enablePlugin('latex-standard-delimiters');await wait();}
  check('Repeated reload leaves one active preview',v1.dom.querySelectorAll('.lsd-editing-preview').length===1);
  check('Both panes retain exact note source',v1.state.doc.toString()===before&&v2.state.doc.toString()===source2);
 }finally{if(second)second.detach();await first.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});app.workspace.setActiveLeaf(first,{focus:false});}
 const report={timestamp:new Date().toISOString(),mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/panes-comfort-report.json',JSON.stringify(report,null,2));console.log('PANES COMFORT',results.filter(x=>!x.passed));
})();
