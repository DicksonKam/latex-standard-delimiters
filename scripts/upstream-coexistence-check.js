(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),config=root+'/.obsidian/community-plugins.json',original=fs.readFileSync(config,'utf8'),leaf=app.workspace.activeLeaf;
 const before=fs.readFileSync(root+'/Navigation.md','utf8'),results=[],check=(name,passed)=>results.push({name,passed}),wait=()=>new Promise(r=>setTimeout(r,250));
 let upstreamNavigationReadingCount;
 const ours=app.plugins.plugins['latex-standard-delimiters'],oldMode=ours.renderingMode;
 try{
  await app.plugins.loadManifests();ours.renderingMode='automatic';await ours.saveColors();
  fs.writeFileSync(config,JSON.stringify([...new Set([...JSON.parse(original),'latex-delimiter-renderer'])]));await ours.refreshRenderingStatus();
  await app.plugins.enablePlugin('latex-delimiter-renderer');await wait();
  check('Actual upstream 1.0.4 loads',app.plugins.plugins['latex-delimiter-renderer']?.manifest.version==='1.0.4');
  for(const mode of ['source','preview']){
   await leaf.setViewState({type:'markdown',state:{file:'Upstream.md',mode,source:false}});await wait();
   if(mode==='source'){leaf.view.editor.cm.dispatch({selection:{anchor:0}});await wait();}
   check(mode+': upstream renders both equations',leaf.view.containerEl.querySelector(mode==='source'?'.cm-editor':'.markdown-preview-view').querySelectorAll('.latex-delimiter-renderer mjx-container').length===2);
   check(mode+': ours stays paused',!leaf.view.containerEl.querySelector('.lsd-math,.lsd-editing-preview'));
  }
  await leaf.setViewState({type:'markdown',state:{file:'Navigation.md',mode:'preview'}});await wait();
  upstreamNavigationReadingCount=leaf.view.containerEl.querySelector('.markdown-preview-view').querySelectorAll('.latex-delimiter-renderer mjx-container').length;
  check('Status identifies known renderer conflict',ours.renderingStatus.includes('Paused'));
  await leaf.setViewState({type:'markdown',state:{file:'Navigation.md',mode:'source',source:false}});await wait();
  const view=leaf.view.editor.cm;view.dispatch({selection:{anchor:before.indexOf('\\[')+4}});await wait();
  check('Upstream edit has no competing source markers',!view.dom.querySelector('.lsd-math-source-marker'));
  check('Source unchanged with upstream editing',view.state.doc.toString()===before);
  await app.plugins.disablePlugin('latex-delimiter-renderer');fs.writeFileSync(config,original);await ours.refreshRenderingStatus();
  view.dispatch({selection:{anchor:0}});await wait();
  check('Ours resumes both equations after handoff',view.dom.querySelectorAll('.lsd-math mjx-container').length===2);
  check('No upstream widgets remain after handoff',!view.dom.querySelector('.latex-delimiter-renderer'));
  check('Upstream plugin preferences never written',!fs.existsSync(root+'/.obsidian/plugins/latex-delimiter-renderer/data.json'));
  check('Note bytes preserved',fs.readFileSync(root+'/Navigation.md','utf8')===before);
 }finally{await app.plugins.disablePlugin('latex-delimiter-renderer');fs.writeFileSync(config,original);ours.renderingMode=oldMode;await ours.saveColors();await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),upstreamVersion:'1.0.4',upstreamBuild:'Local build of original upstream source in work/upstream',observations:{navigationReadingEquationCount:upstreamNavigationReadingCount},mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/upstream-coexistence-report.json',JSON.stringify(report,null,2));console.log('UPSTREAM COEXISTENCE',results.filter(x=>!x.passed));
})();
