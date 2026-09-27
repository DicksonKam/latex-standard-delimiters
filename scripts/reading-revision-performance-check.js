// Actual host refresh cost and scroll stability for a cross-section note.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning)throw Error('Other tests active');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],samples=[];let pane;
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});
 const digits=()=>[...pane.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-mn mjx-c')].map(c=>{const m=c.className.match(/mjx-c([0-9A-F]+)/i);return m?String.fromCodePoint(parseInt(m[1],16)):'';}).join('');
 let text='Before\n\n\\[321+\n\n4\\].\n\n'+Array.from({length:200},(_,i)=>'Paragraph '+i+' '+('ordinary prose '.repeat(20))).join('\n\n')+'\n\nAfter\n';
 const settle=async(expected)=>{const start=performance.now();while(digits()!==expected&&performance.now()-start<2200)await wait(20);return digits()===expected;};
 try{
  await app.vault.adapter.write('ReadingRevisionPerformance.md',text);await wait(50);
  await leaf.setViewState({type:'markdown',state:{file:'ReadingRevisionPerformance.md',mode:'source',source:false}});const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});
  pane=app.workspace.getLeaf('split','vertical');await pane.setViewState({type:'markdown',state:{file:'ReadingRevisionPerformance.md',mode:'preview'}});
  check('Initial equation on large note',await settle('3214'));
  for(const digit of ['5','6','7','8','9','4']){
   const at=text.indexOf(text.match(/(\d)\\\]\./)[1]+'\\]'),start=performance.now();text=text.slice(0,at)+digit+text.slice(at+1);
   cm.dispatch({changes:{from:at,to:at+1,insert:digit},selection:{anchor:0},userEvent:'input.type'});
   const correct=await settle('321'+digit),ms=performance.now()-start;samples.push(ms);
   check('Warm revision '+digit+' is current',correct,{ms,digits:digits(),scroll:pane.view.previewMode.getScroll(),...(correct?{}:{html:pane.view.previewMode.containerEl.innerHTML.slice(0,14000)})});check('Warm revision '+digit+' within 1800ms',ms<1800,{ms});await wait(120);
  }
  pane.view.previewMode.applyScroll(80);await wait(300);const before=pane.view.previewMode.getScroll();
  const at=text.indexOf('4\\]');text=text.slice(0,at)+'5'+text.slice(at+1);
  cm.dispatch({changes:{from:at,to:at+1,insert:'5'},selection:{anchor:0},userEvent:'input.type'});const queued=app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.get(pane.view)?.scroll;await wait(500);
  const after=pane.view.previewMode.getScroll();check('Refresh preserves Reading View scroll position',Math.abs(after-before)<2,{before,after,queued});
  pane.view.previewMode.applyScroll(0);check('Returning to top renders newest offscreen edit',await settle('3215'));
  for(let round=1;round<=3;round++){
   pane.view.previewMode.applyScroll(80);await wait(250);
   pane.view.previewMode.applyScroll(0);check('Cached equation survives remount '+round,await settle('3215'));
  }
  check('Editor source remains exact',cm.state.doc.toString()===text);
  const saveStart=performance.now();while(fs.readFileSync(root+'/ReadingRevisionPerformance.md','utf8')!==text&&performance.now()-saveStart<2200)await wait(50);
  check('Disk source remains exact',fs.readFileSync(root+'/ReadingRevisionPerformance.md','utf8')===text);
 }catch(error){check('Harness completed',false,String(error.stack??error));}
 finally{
  if(pane)pane.detach();try{await leaf.setViewState(original);}finally{
   window.lsdRuntimeChecksRunning=false;
   const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Visible Reading View refresh after synthetic editor changes on a 200-paragraph note; scroll stability and return from offscreen. Not OS input latency.',characters:text.length,meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,maxMs:Math.max(...samples),passed:results.every(r=>r.passed),results};
   fs.writeFileSync(root+'/reading-revision-performance-report.json',JSON.stringify(report,null,2));console.log('READING_REVISION_PERFORMANCE_DONE',report.passed);
  }
 }
})();
