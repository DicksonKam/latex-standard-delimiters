// Large native callout DOM and rendering latency; work/TestVault only.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');if(window.lsdRuntimeChecksRunning)throw Error('Other tests active');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],samples=[],wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(name,p,detail)=>results.push({name,passed:Boolean(p),detail});
 try{
  for(const count of [25,100,250])for(const mode of ['source','preview']){
   await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
   const text='Stress volume\n\n> [!note] Many equations\n'+Array.from({length:count},(_,i)=>'> Equation '+i+String.raw`: \(x_{`+i+String.raw`}+\underbrace{a}_{\text{even}}\).`).join('\n')+'\n\nAfter\n';await app.vault.adapter.write('StressVolume.md',text);await wait(30);
   const start=performance.now();await leaf.setViewState({type:'markdown',state:{file:'StressVolume.md',mode,source:false}});if(mode==='source')leaf.view.editor.cm.dispatch({selection:{anchor:0}});
   const dom=mode==='source'?leaf.view.editor.cm.dom:leaf.view.previewMode.containerEl;
   while(performance.now()-start<15000&&dom.querySelectorAll('.lsd-math mjx-container').length!==count)await wait(20);
   const elapsed=performance.now()-start,actual=dom.querySelectorAll('.lsd-math mjx-container').length;samples.push({count,mode,elapsedMs:elapsed,actual});
   check(count+'/'+mode+' avoids quadratic delay',elapsed<2500,{elapsedMs:elapsed});
   check(count+'/'+mode+' count',actual===count,{actual});check(count+'/'+mode+' no MathJax error',!dom.querySelector('mjx-merror'));
   check(count+'/'+mode+' exact source',fs.readFileSync(root+'/StressVolume.md','utf8')===text);
  }
 }finally{
  await leaf.setViewState(original);window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Single large native callout with 25, 100 and 250 inline underbrace equations, Live Preview and Reading View. End-to-end warm mount/typesetting wall time, not typing latency.',results,samples};fs.writeFileSync(root+'/stress-volume-report.json',JSON.stringify(report,null,2));console.log('STRESS_VOLUME',report);
 }
})();
