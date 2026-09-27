// Incremental Reading View regressions. Do not reopen the note between edits.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto');
 const root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning)throw Error('Other tests running');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],errors=[],panes=[];
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const capture=e=>errors.push(String(e.message??e.reason));
 window.addEventListener('error',capture);window.addEventListener('unhandledrejection',capture);
 const check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});
 // Compare the native MathJax tree, including operators, command glyphs and
 // fraction/script/underbrace structure. IDs and layout-dependent styles vary
 // by pane, and are intentionally excluded. This is more than numeric identity.
 const signature=node=>node?JSON.stringify((function tree(n){return [n.tagName,n.getAttribute('class')??'',...Array.from(n.children).map(tree)];})(node)):null;
 const signatures=view=>Array.from(view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-math')).map(signature);
 const reference=async(tex)=>{
  if(tex===null)return [];
  const host=document.createElement('div');host.style.display='none';document.body.appendChild(host);
  try{for(const entry of Array.isArray(tex)?tex:[{tex,display:true}])host.appendChild(await window.MathJax.tex2chtmlPromise(entry.tex,{display:entry.display}));return [...host.querySelectorAll('mjx-math')].map(signature);}finally{host.remove();}
 };
 let cm,current='Before\n\n\\[321+\n\n4\\].\n\nAfter\n';
 const verify=async(name,tex)=>{
  const expected=await reference(tex),started=performance.now();let actual;
  do{await wait(50);actual=panes.map(p=>signatures(p.view));}while(performance.now()-started<2200&&actual.some(a=>JSON.stringify(a)!==JSON.stringify(expected)));
  for(let i=0;i<panes.length;i++)check(name+' pane '+i,JSON.stringify(actual[i])===JSON.stringify(expected),{expected,actual:actual[i],settleMs:performance.now()-started,...(JSON.stringify(actual[i])!==JSON.stringify(expected)?{html:panes[i].view.previewMode.containerEl.innerHTML.slice(-16000)}:{})});
  check(name+' editor source',cm.state.doc.toString()===current,{actual:cm.state.doc.toString(),expected:current});
  // Wait for the host's normal autosave; tests never rewrite the edited source.
  const saveStarted=performance.now();while(fs.readFileSync(root+'/CrossSectionEditing.md','utf8')!==current&&performance.now()-saveStarted<2200)await wait(50);
  check(name+' disk source',fs.readFileSync(root+'/CrossSectionEditing.md','utf8')===current,{actual:fs.readFileSync(root+'/CrossSectionEditing.md','utf8'),expected:current});
  for(let i=0;i<panes.length;i++){
   const dom=panes[i].view.previewMode.containerEl;
   check(name+' surrounding paragraphs '+i,[...dom.querySelectorAll('.el-p > p')].some(p=>p.textContent==='Before')&&[...dom.querySelectorAll('.el-p > p')].some(p=>p.textContent==='After'));
   check(name+' no nested paragraphs '+i,!dom.querySelector('p p'));
  }
 };
 const edit=async(name,needle,insert,tex)=>{
  const at=current.indexOf(needle);if(at<0)throw Error('Missing edit target: '+needle);
  current=current.slice(0,at)+insert+current.slice(at+needle.length);
  cm.dispatch({changes:{from:at,to:at+needle.length,insert},selection:{anchor:0},userEvent:'input.type'});
  await verify(name,tex);
 };
 try{
  await app.vault.adapter.write('CrossSectionEditing.md',current);await wait(50);
  await leaf.setViewState({type:'markdown',state:{file:'CrossSectionEditing.md',mode:'source',source:false}});
  cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});
  for(let i=0;i<2;i++){
   const pane=app.workspace.getLeaf('split','vertical');panes.push(pane);
   await pane.setViewState({type:'markdown',state:{file:'CrossSectionEditing.md',mode:'preview'}});
  }
  await verify('Initial','321+\n\n4');
  await edit('Closing section only','4\\]','5\\]','321+\n\n5');
  await edit('Opening section only','321','654','654+\n\n5');
  await edit('Operator identity','654+','654-','654-\n\n5');
  await edit('Insert middle section','\n\n5','\n\n\\alpha+\n\n5','654-\n\n\\alpha+\n\n5');
  await edit('Middle command identity','\\alpha','\\beta','654-\n\n\\beta+\n\n5');
  await wait(600);
  const beforeRemoval=current;
  await edit('Remove closing delimiter','\\]','',null);
  // An incomplete display must have no plugin math, including stale previews.
  await verify('Incomplete display stays literal',null);
  app.workspace.setActiveLeaf(leaf,{focus:true});cm.focus();
  cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',keyCode:90,metaKey:true,bubbles:true,cancelable:true}));
  current=beforeRemoval;await verify('Undo delimiter removal','654-\n\n\\beta+\n\n5');
  cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'Z',code:'KeyZ',keyCode:90,metaKey:true,shiftKey:true,bubbles:true,cancelable:true}));
  current=beforeRemoval.replace('\\]','');await verify('Redo delimiter removal',null);
  await edit('Restore closing delimiter','5.','5\\].','654-\n\n\\beta+\n\n5');
  await edit('Remove opening delimiter','\\[','',null);
  await edit('Restore opening delimiter','654','\\[654','654-\n\n\\beta+\n\n5');
  await edit('Underbrace structure','\\beta',String.raw`\underbrace{\frac{1}{2}}_{\text{even}}`,String.raw`654-

\underbrace{\frac{1}{2}}_{\text{even}}+

5`);
  await verify('Settled result remains current',String.raw`654-

\underbrace{\frac{1}{2}}_{\text{even}}+

5`);
  const finalTex=String.raw`654-

\underbrace{\frac{1}{2}}_{\text{even}}+

5`;
  for(const digit of ['6','7']){
   const at=current.indexOf(current.match(/(\d)\\\]\./)[1]+'\\]');
   current=current.slice(0,at)+digit+current.slice(at+1);
   cm.dispatch({changes:{from:at,to:at+1,insert:digit},selection:{anchor:0},userEvent:'input.type'});await wait(20);
  }
  await verify('Rapid closing edits use newest revision',finalTex.replace(/5$/,'7'));
  current=current.replace('7\\]','8\\]');
  await app.vault.modify(app.vault.getAbstractFileByPath('CrossSectionEditing.md'),current);
  await verify('External file update',finalTex.replace(/5$/,'8'));
  await edit('Prepare lifecycle revision','8\\]','9\\]',finalTex.replace(/5$/,'9'));
  const at=current.indexOf('9\\]');current=current.slice(0,at)+'6'+current.slice(at+1);
  cm.dispatch({changes:{from:at,to:at+1,insert:'6'},selection:{anchor:0},userEvent:'input.type'});
  await app.plugins.disablePlugin('latex-standard-delimiters');await wait(250);
  await verify('Disable while refresh is queued',null);
  for(const pane of panes){
   const paragraphs=()=>[...pane.view.previewMode.containerEl.querySelectorAll('.el-p > p')].map(p=>p.textContent);
   const restored=paragraphs();pane.view.previewMode.rerender(true);await wait(150);
   check('Unload restoration matches native paragraphs',JSON.stringify(restored)===JSON.stringify(paragraphs()),{restored,native:paragraphs()});
  }
  await app.plugins.enablePlugin('latex-standard-delimiters');
  for(const pane of panes)pane.view.previewMode.rerender(true);
  await verify('Re-enable and fresh native rendering',finalTex.replace(/5$/,'6'));
  const closeAt=current.indexOf('6\\]');current=current.slice(0,closeAt)+'7'+current.slice(closeAt+1);
  cm.dispatch({changes:{from:closeAt,to:closeAt+1,insert:'7'},selection:{anchor:0},userEvent:'input.type'});
  panes.pop().detach();await wait(250);
  await verify('Close pane during queued refresh',finalTex.replace(/5$/,'7'));
  current='Before\n\nInline \\(123+4\\). Display \\[654-\n\n5\\].\n\nAfter\n';
  cm.dispatch({changes:{from:0,to:cm.state.doc.length,insert:current},selection:{anchor:0}});
  const inline={tex:'123+4',display:false},split={tex:'654-\n\n5',display:true};
  await verify('Shared section contains inline and split display',[inline,split]);
  await edit('Shared section remove closing delimiter','\\]','',[inline]);
  await edit('Shared section restore closing delimiter','5.','5\\].',[inline,split]);
  await app.plugins.disablePlugin('latex-standard-delimiters');await wait(250);
  await verify('Stable toggle unload restores source',null);
  await app.plugins.enablePlugin('latex-standard-delimiters');
  await verify('Stable toggle re-enable without manual refresh',[inline,split]);
  const idleStart=performance.now();while(app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.size>0&&performance.now()-idleStart<1200)await wait(25);
  check('No refresh entries remain',app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.size===0,{waitMs:performance.now()-idleStart});
  check('No captured runtime errors',errors.length===0,errors);
 }catch(error){check('Harness completed',false,String(error.stack??error));}
 finally{
  for(const pane of panes)pane.detach();
  try{await leaf.setViewState(original);}finally{
   window.removeEventListener('error',capture);window.removeEventListener('unhandledrejection',capture);window.lsdRuntimeChecksRunning=false;
   const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),timestamp:new Date().toISOString(),passed:results.every(r=>r.passed),results};
   fs.writeFileSync(root+'/cross-section-editing-report.json',JSON.stringify(report,null,2));console.log('CROSS_SECTION_EDITING_DONE',report.passed);
  }
 }
})();
