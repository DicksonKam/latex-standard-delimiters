(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,results=[],check=(name,passed)=>results.push({name,passed});
 const before=fs.readFileSync(root+'/Typing.md','utf8');const wait=()=>new Promise(r=>setTimeout(r,250));
 // The test copy has cache disabled and a loopback-only package endpoint.
 // Startup still downloads the public TeX Live package index.
 // This exercises coexistence, not full TeX/PDF compilation.
 try{
  await leaf.setViewState({type:'markdown',state:{file:'Typing.md',mode:'source',source:false}});
  await app.plugins.loadManifests();await app.plugins.enablePlugin('swiftlatex-render');await wait();
  const swift=app.plugins.plugins['swiftlatex-render'];
  check('SwiftLaTeX 0.6.0 loads',swift?.manifest.version==='0.6.0');
  check('SwiftLaTeX embedded engine is ready',swift?.pdfEngine?.isReady()===true);
  for(const mode of ['source','preview']){
   await leaf.setViewState({type:'markdown',state:{file:'Typing.md',mode,source:false}});await wait();
   if(mode==='source'){leaf.view.editor.cm.dispatch({selection:{anchor:0}});await wait();}
   const container=leaf.view.containerEl.querySelector(mode==='source'?'.cm-editor':'.markdown-preview-view');
   check(mode+': our standard math renders with SwiftLaTeX enabled',!!container.querySelector('.lsd-math mjx-math'));
   check(mode+': no MathJax error',!container.querySelector('mjx-merror'));
  }
  await leaf.setViewState({type:'markdown',state:{file:'Typing.md',mode:'source',source:false}});await wait();const view=leaf.view.editor.cm;
  view.dispatch({selection:{anchor:before.indexOf('\\(')+2}});await wait();
  check('Editing preview coexists with SwiftLaTeX',!!view.dom.querySelector('.lsd-editing-preview mjx-math'));
  check('Note source unchanged',view.state.doc.toString()===before&&fs.readFileSync(root+'/Typing.md','utf8')===before);
 }finally{await app.plugins.disablePlugin('swiftlatex-render');await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),scope:'Engine initialization and standard math coexistence with loopback package endpoint (startup downloads public TeX Live index); TeX/PDF/SVG compilation not tested',mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/swift-coexistence-report.json',JSON.stringify(report,null,2));console.log('SWIFT COEXISTENCE',results.filter(x=>!x.passed));
})();
