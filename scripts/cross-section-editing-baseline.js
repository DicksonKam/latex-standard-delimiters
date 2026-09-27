// Small released-build reproduction, intentionally fails before the fix.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable only');if(window.lsdRuntimeChecksRunning)throw Error('Other tests running');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[];let second;const wait=ms=>new Promise(r=>setTimeout(r,ms));const digits=dom=>[...dom.querySelectorAll('.lsd-math mjx-mn mjx-c')].map(c=>{const m=c.className.match(/mjx-c([0-9A-F]+)/i);return m?String.fromCodePoint(parseInt(m[1],16)):'';}).join('');
 try{
  await app.vault.adapter.write('CrossSectionBaseline.md','Before\n\n\\[321+\n\n4\\].\n\nAfter\n');await wait(50);await leaf.setViewState({type:'markdown',state:{file:'CrossSectionBaseline.md',mode:'source',source:false}});const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});
  second=app.workspace.getLeaf('split','vertical');await second.setViewState({type:'markdown',state:{file:'CrossSectionBaseline.md',mode:'preview'}});await wait(300);
  const check=(name,expected)=>results.push({name,passed:digits(second.view.previewMode.containerEl)===expected,expected,actual:digits(second.view.previewMode.containerEl),source:cm.state.doc.toString(),html:second.view.previewMode.containerEl.innerHTML.slice(-9000)});
  check('Initial','3214');
  let pos=cm.state.doc.toString().indexOf('4\\]');cm.dispatch({changes:{from:pos,to:pos+1,insert:'5'},selection:{anchor:0},userEvent:'input.type'});await wait(1600);check('Closing paragraph edit','3215');
  pos=cm.state.doc.toString().indexOf('321');cm.dispatch({changes:{from:pos,to:pos+3,insert:'654'},selection:{anchor:0},userEvent:'input.type'});await wait(1600);check('Opening paragraph edit','6545');
 }finally{if(second)second.detach();await leaf.setViewState(original);fs.writeFileSync(root+'/cross-section-baseline-report.json',JSON.stringify({version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),timestamp:new Date().toISOString(),passed:results.every(r=>r.passed),results},null,2));window.lsdRuntimeChecksRunning=false;console.log('CROSS_SECTION_BASELINE_DONE');}
})();
