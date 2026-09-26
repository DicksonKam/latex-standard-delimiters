(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,before=fs.readFileSync(root+'/Large.md','utf8'),results=[],check=(name,passed)=>results.push({name,passed});
 await leaf.setViewState({type:'markdown',state:{file:'Large.md',mode:'source',source:false}});await new Promise(r=>setTimeout(r,250));
 const view=leaf.view.editor.cm,anchor=before.indexOf('\\(')+2,samples=[];
 try{
  view.dispatch({selection:{anchor}});await new Promise(r=>setTimeout(r,250));
  check('Large-note active math preview renders',!!view.dom.querySelector('.lsd-editing-preview mjx-math'));
  for(let i=0;i<20;i++){
   let start=performance.now();view.dispatch({changes:{from:anchor,insert:'z'}});samples.push(performance.now()-start);
   start=performance.now();view.dispatch({changes:{from:anchor,to:anchor+1,insert:''}});samples.push(performance.now()-start);
  }
  await new Promise(r=>setTimeout(r,250));
  check('Repeated edits restore exact source',view.state.doc.toString()===before);
  check('Repeated edits leave one preview',view.dom.querySelectorAll('.lsd-editing-preview').length===1);
  check('Preview has no MathJax error after edits',!view.dom.querySelector('.lsd-editing-preview mjx-merror'));
 }finally{if(view.state.doc.toString()!==before)view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),characters:before.length,equations:1000,editDispatchSamples:samples.length,meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,maxMs:Math.max(...samples),scope:'Synchronous insertion/deletion dispatch including decoration computation and viewport DOM updates; not end-to-end keyboard or full-document typesetting latency',mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};
 fs.writeFileSync(root+'/edit-performance-report.json',JSON.stringify(report,null,2));console.log('EDIT PERFORMANCE',report);
})();
