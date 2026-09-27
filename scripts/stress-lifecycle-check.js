// Repeated asynchronous lifecycle races and burst edits, disposable TestVault only.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning)throw Error('Other tests running');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),wait=ms=>new Promise(r=>setTimeout(r,ms)),results=[],errors=[],samples=[];
 const check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});const capture=e=>errors.push(String(e.message??e.reason));window.addEventListener('error',capture);window.addEventListener('unhandledrejection',capture);
 const text=String.raw`Stress lifecycle

> [!note] literal (z), math \(z\)
> \[\begin{aligned}
> x_1 &= \underbrace{a}_{\text{even}} + \underbrace{b}_{\text{odd}} \\
> y_2 &= c
> \end{aligned}\]

Edit \(\frac{x_1}{y_2}+z\).

| Header |
| --- |
| Plain (x_1), math \(x_1\) |

After
`;const paths=['Examples.md','EulerCallouts.md','Containers.md'];const before=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(root+'/'+p,'utf8')]));
 try{
  await app.vault.adapter.write('StressLifecycle.md',text);await wait(30);
  for(let round=0;round<30;round++){
   await leaf.setViewState({type:'markdown',state:{file:'StressLifecycle.md',mode:'source',source:false}});leaf.view.editor.cm.dispatch({selection:{anchor:0}});
   await leaf.setViewState({type:'markdown',state:{file:'StressLifecycle.md',mode:'preview'}});
   if(round%3===0){await app.plugins.disablePlugin('latex-standard-delimiters');await app.plugins.enablePlugin('latex-standard-delimiters');}
   await leaf.setViewState({type:'markdown',state:{file:'EulerCallouts.md',mode:'source',source:false}});
   await leaf.setViewState({type:'markdown',state:{file:'StressLifecycle.md',mode:'source',source:false}});const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});await wait(120);
   check('Race '+round+' renders exactly four equations',cm.dom.querySelectorAll('.lsd-math mjx-container').length===4,cm.dom.querySelectorAll('.lsd-math mjx-container').length);
   check('Race '+round+' literal title/table preserved',cm.dom.textContent.includes('literal (z), math')&&cm.dom.textContent.includes('Plain (x_1), math'));
   check('Race '+round+' source unchanged',cm.state.doc.toString()===text&&fs.readFileSync(root+'/StressLifecycle.md','utf8')===text);
   samples.push({round,ownedEmbedded:app.plugins.plugins['latex-standard-delimiters'].embeddedChildren.size});
  }
  const cm=leaf.view.editor.cm,anchor=text.indexOf('\\frac')+5;cm.dispatch({selection:{anchor}});await wait(100);
  for(let batch=0;batch<20;batch++){
   const start=performance.now();
   for(let edit=0;edit<25;edit++){
    cm.dispatch({changes:{from:anchor,insert:'q'},userEvent:'input.type'});
    cm.dispatch({changes:{from:anchor,to:anchor+1,insert:''},userEvent:'input.type'});
   }
   await wait(30);check('Burst '+batch+' exact source',cm.state.doc.toString()===text);
   check('Burst '+batch+' one valid active preview',cm.dom.querySelectorAll('.lsd-editing-preview mjx-container').length===1&&!cm.dom.querySelector('.lsd-editing-preview mjx-merror'));samples.push({batch,dispatches:50,including30msWait:performance.now()-start});
  }
  cm.dispatch({selection:{anchor:0}});await wait(100);await app.plugins.disablePlugin('latex-standard-delimiters');await wait(100);
  check('Unload removes owned editor math',!cm.dom.querySelector('.lsd-math,.lsd-editing-preview,.lsd-token-command'));
  await app.plugins.enablePlugin('latex-standard-delimiters');await wait(200);
  check('Reload renders exactly four equations',cm.dom.querySelectorAll('.lsd-math mjx-container').length===4);
  for(const [p,body]of Object.entries(before))check(p+' source unchanged',fs.readFileSync(root+'/'+p,'utf8')===body);
  check('No uncaught lifecycle errors',errors.length===0,errors);
 }finally{
  if(!app.plugins.plugins['latex-standard-delimiters'])await app.plugins.enablePlugin('latex-standard-delimiters');
  if(leaf.view.editor?.cm&&leaf.view.file?.path==='StressLifecycle.md'&&leaf.view.editor.cm.state.doc.toString()!==text)leaf.view.editor.cm.dispatch({changes:{from:0,to:leaf.view.editor.cm.state.doc.length,insert:text}});
  await leaf.setViewState(original);window.removeEventListener('error',capture);window.removeEventListener('unhandledrejection',capture);window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'30 rapid view/note switching rounds with 10 unload/reload races; 1000 edit dispatches in 20 bursts; exact counts, literal lookalikes, source restoration and uncaught error capture. Synthetic editor dispatches, not real keyboard/IME.',results,samples,errors};fs.writeFileSync(root+'/stress-lifecycle-report.json',JSON.stringify(report,null,2));console.log('STRESS_LIFECYCLE',results.filter(x=>!x.passed));
 }
})();
