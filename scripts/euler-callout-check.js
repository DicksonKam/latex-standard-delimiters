// Actual Obsidian checks for the reported Euler callout examples; TestVault only.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable runtime TestVault only');
 const file='EulerCallouts.md',before=fs.readFileSync(root+'/'+file,'utf8'),leaf=app.workspace.activeLeaf,results=[],samples=[];
 const check=(name,passed,detail='')=>results.push({name,passed:Boolean(passed),detail});
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 for(let trial=0;trial<4;trial++){
  await leaf.setViewState({type:'markdown',state:{file:'Containers.md',mode:'source',source:false}});await delay(100);
  const start=performance.now();await leaf.setViewState({type:'markdown',state:{file,mode:'source',source:false}});const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});
  let outsideMs=null,calloutMs=null;
  while(performance.now()-start<3500){
   if(outsideMs===null&&cm.dom.querySelector('.lsd-math mjx-container'))outsideMs=performance.now()-start;
   if(cm.dom.querySelectorAll('.callout-content .lsd-math mjx-container').length===2){calloutMs=performance.now()-start;break;}await delay(10);
  }
  samples.push({trial,outsideMs,calloutMs});
  check('Live Preview renders aligned-underbrace and align callouts '+trial,calloutMs!==null,JSON.stringify(samples.at(-1)));
  check('No MathJax errors in complex callouts '+trial,!cm.dom.querySelector('.callout-content mjx-merror'));
  check('Callout mounting has no two-second polling wait '+trial,calloutMs!==null&&calloutMs<750,JSON.stringify(samples.at(-1)));
  check('Source unchanged '+trial,cm.state.doc.toString()===before);
 }
 await leaf.setViewState({type:'markdown',state:{file,mode:'preview'}});await delay(600);
 check('Reading View renders all three complex equations',leaf.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-container').length===3,String(leaf.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-container').length));
 check('Reading View has no MathJax error',!leaf.view.previewMode.containerEl.querySelector('mjx-merror'));
 check('Fixture bytes remain unchanged',fs.readFileSync(root+'/'+file,'utf8')===before);
 const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Actual Obsidian Euler aligned/underbrace and align callouts, four warm mounts and Reading View; times include note opening and Markdown/MathJax work on this machine.',samples,results};fs.writeFileSync(root+'/euler-callout-report.json',JSON.stringify(report,null,2));console.log('EULER_CALLOUT',report);
})();
