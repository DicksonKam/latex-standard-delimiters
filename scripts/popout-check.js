(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),main=app.workspace.activeLeaf,results=[],check=(name,passed)=>results.push({name,passed});let leaf;
 const wait=()=>new Promise(r=>setTimeout(r,350));
 try{
  leaf=app.workspace.openPopoutLeaf({size:{width:600,height:700}});
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});await wait();
  const view=leaf.view.editor.cm,before=view.state.doc.toString();
  check('Popout uses separate document',view.dom.ownerDocument!==document);
  check('Popout renders standard delimiter math',view.dom.querySelectorAll('.lsd-math mjx-math').length>=3);
  view.dispatch({selection:{anchor:before.indexOf('\\(')+2}});await wait();
  const preview=view.dom.querySelector('.lsd-editing-preview');
  check('Popout has editing preview',!!preview?.querySelector('mjx-math'));
  check('Popout preview belongs to its document',preview?.ownerDocument===view.dom.ownerDocument);
  check('Popout source command color visible',!!view.dom.querySelector('.lsd-token-command'));
  view.dispatch({selection:{anchor:0}});await wait();
  check('Popout clears inactive editing preview',!view.dom.querySelector('.lsd-editing-preview'));
  check('Popout source unchanged',view.state.doc.toString()===before);
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'preview'}});await wait();
  check('Popout reading view renders math',leaf.view.containerEl.querySelectorAll('.lsd-math mjx-math').length>=3);
 }finally{if(leaf)leaf.detach();app.workspace.setActiveLeaf(main,{focus:false});}
 const report={timestamp:new Date().toISOString(),scope:'Actual desktop popout; not mobile simulation',mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/popout-report.json',JSON.stringify(report,null,2));console.log('POPOUT',results.filter(x=>!x.passed));
})();
