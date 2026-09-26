(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,plugin=app.plugins.plugins['latex-standard-delimiters'];
 const oldMode=plugin.renderingMode,oldPreview=plugin.editingPreviews,results=[],check=(name,passed)=>results.push({name,passed}),wait=()=>new Promise(r=>setTimeout(r,150));
 await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
 const view=leaf.view.editor.cm,before=view.state.doc.toString(),anchor=before.indexOf('\\(')+2;
 try{
  plugin.renderingMode='automatic';plugin.editingPreviews=true;await plugin.saveColors();view.dispatch({selection:{anchor}});await wait();
  check('Preview exists before composition',!!view.dom.querySelector('.lsd-editing-preview'));
  view.contentDOM.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:''}));await wait();
  check('Composition suppresses active preview',!view.dom.querySelector('.lsd-editing-preview'));
  check('Composition suppresses literal replacement markers',!view.dom.querySelector('.lsd-math-source-marker'));
  check('Composition retains source colors',!!view.dom.querySelector('.lsd-token-command'));
  view.contentDOM.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:''}));await wait();
  check('Preview resumes after composition',!!view.dom.querySelector('.lsd-editing-preview'));
  view.contentDOM.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));view.contentDOM.dispatchEvent(new FocusEvent('blur'));await wait();
  check('Blur during uncommitted composition keeps preview suppressed',!view.dom.querySelector('.lsd-editing-preview'));
  view.contentDOM.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:''}));await wait();
  check('Composition is committed before changing editor modes',!view.composing);
  plugin.renderingMode='off';await plugin.saveColors();await wait();
  check('Off removes editor math decorations',!view.dom.querySelector('.lsd-editing-preview,.lsd-token-command,.lsd-math'));
  check('Off status explains user choice',plugin.renderingStatus.includes('your choice'));
  const saved=JSON.parse(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/data.json','utf8'));
  check('Rendering choice persists',saved.renderingMode==='off');
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'preview'}});await wait();
  check('Off does not render reading standard delimiters',!leaf.view.containerEl.querySelector('.lsd-math'));
  plugin.renderingMode='automatic';await plugin.saveColors();await wait();
  check('Automatic resumes reading math',!!leaf.view.containerEl.querySelector('.lsd-math'));
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});await wait();
  check('Source exact after composition and ownership changes',leaf.view.editor.cm.state.doc.toString()===before);
 }finally{plugin.renderingMode=oldMode;plugin.editingPreviews=oldPreview;await plugin.saveColors();await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),scope:'Synthetic desktop composition lifecycle and actual rendering ownership settings; not OS IME certification',mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};
 fs.writeFileSync(root+'/composition-ownership-report.json',JSON.stringify(report,null,2));console.log('COMPOSITION OWNERSHIP',results.filter(x=>!x.passed));
})();
