// TestVault only; run separately from the runtime suite with its script path set.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault')||window.lsdRuntimeChecksRunning)throw Error('Disposable idle TestVault required');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
 const check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});
 const modal=()=>document.querySelector('.lsd-equation-diagnostic');
 const button=text=>[...modal().querySelectorAll('button')].find(b=>b.textContent===text);
 const close=()=>button('Close').click();
 const until=async(fn)=>{const start=performance.now();while(!fn()&&performance.now()-start<2500)await wait(20);return Boolean(fn());};
 const bare='[\n\\boxed{\\begin{pmatrix}A_\\rho\\\\A_\\phi\\\\A_z\\end{pmatrix}}\n]';
 let editor,cm,fixtureId=0,currentPath;
 const checkDisk=async(path,text)=>{
  const start=performance.now();
  while(await app.vault.adapter.read(path)!==text&&performance.now()-start<2500)await wait(50);
  check('Saved fixture bytes match the editor: '+path,await app.vault.adapter.read(path)===text);
 };
 const fixture=async(body)=>{
  const previous=currentPath,previousText=editor?.getValue();
  const path='EquationDiagnostics-'+Date.now()+'-'+(++fixtureId)+'.md',text='Before\n\n'+body+'\n\nAfter\n';
  await app.vault.create(path,text);
  await leaf.setViewState({type:'markdown',state:{file:path,mode:'source',source:false}});
  if(previous)await checkDisk(previous,previousText);
  currentPath=path;
  app.workspace.setActiveLeaf(leaf,{focus:true});editor=leaf.view.editor;cm=editor.cm;
  editor.setSelection(editor.offsetToPos(8),editor.offsetToPos(8+body.length));cm.focus();await wait(100);
  if(editor.getValue()!==text)throw Error('Initial fixture bytes differ: '+path);
  return text;
 };
 const command=id=>app.commands.executeCommandById('latex-standard-delimiters:'+id);
 try{
  let text=await fixture(bare);
  command('diagnose-selected-equation');await until(()=>modal());
  check('Diagnosis explains missing outer delimiters',modal().textContent.includes('missing one or both backslashes'));
  check('Diagnosis shows exact selected source',modal().querySelector('pre').textContent===bare);
  check('Diagnosis does not change source',editor.getValue()===text);close();await wait(50);
  command('preview-equation-repair');await until(()=>button('Apply delimiter repair')&&!button('Apply delimiter repair').disabled);
  check('Repair displays exact before and after',modal().querySelectorAll('pre')[1].textContent==='\\'+bare.slice(0,-1)+'\\]');
  check('Repair MathJax preview succeeds',!!modal().querySelector('mjx-math')&&!modal().querySelector('mjx-merror'));
  check('Preview leaves source unchanged until Apply',editor.getValue()===text);
  button('Apply delimiter repair').click();await wait(200);
  const expected='Before\n\n\\'+bare.slice(0,-1)+'\\]\n\nAfter\n';
  check('Apply changes only the selected outer delimiters',editor.getValue()===expected);
  editor.setCursor(editor.offsetToPos(expected.length));await wait(250);
  check('Repaired block renders in Live Preview',cm.dom.querySelectorAll('.lsd-math mjx-math').length===1&&!cm.dom.querySelector('mjx-merror'));
  cm.focus();cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',keyCode:90,metaKey:true,bubbles:true,cancelable:true}));await wait(200);
  check('One scripted undo restores exact original source',editor.getValue()===text);
  editor.setSelection(editor.offsetToPos(8),editor.offsetToPos(8+bare.length));
  command('preview-equation-repair');await until(()=>button('Apply delimiter repair')&&!button('Apply delimiter repair').disabled);
  editor.replaceRange('!',{line:0,ch:0});const changed=editor.getValue();button('Apply delimiter repair').click();await wait(100);
  check('Stale repair does not overwrite newer edits',editor.getValue()===changed&&button('Apply delimiter repair').disabled);close();
  const fence=String.fromCharCode(96).repeat(3);
  text=await fixture(fence+'\n'+bare+'\n'+fence);
  editor.setSelection(editor.offsetToPos(8+fence.length+1),editor.offsetToPos(8+fence.length+1+bare.length));
  command('preview-equation-repair');await until(()=>modal());
  check('Code exclusion is explained with no Apply button',modal().textContent.includes('intentionally stay literal')&&!button('Apply delimiter repair'));
  check('Code fixture remains unchanged',editor.getValue()===text);close();
  text=await fixture('\\[\\begin{pmatrix}x\\end{bmatrix}\\]');
  command('diagnose-selected-equation');await until(()=>modal()&&modal().textContent.includes('MathJax rejected'));
  check('Invalid TeX reports a MathJax error',modal().textContent.includes('MathJax rejected')&&!!modal().querySelector('mjx-merror'));close();
  check('Invalid TeX diagnosis preserves source',editor.getValue()===text);
  text=await fixture('\\[\\begin{aligned}[\\mathbf r]_{\\mathrm{cyl}} &= x\\end{aligned}\\]');
  command('diagnose-selected-equation');await until(()=>modal()?.textContent.includes('MathJax rendered'));
  check('Bracket ambiguity warns even when MathJax reports no error',modal().textContent.includes('optional alignment argument')&&!modal().querySelector('mjx-merror'));
  check('Ambiguity diagnosis leaves exact source unchanged',editor.getValue()===text);close();
  text=await fixture('\\[\\begin{aligned}{[\\mathbf r]}_{\\mathrm{cyl}} &= x\\end{aligned}\\]');
  command('diagnose-selected-equation');await until(()=>modal()?.textContent.includes('MathJax rendered'));
  check('Grouped expression retains brackets and bold r',!!modal().querySelector('mjx-c.mjx-c5B')&&!!modal().querySelector('mjx-c.mjx-c5D')&&!!modal().querySelector('mjx-c.mjx-c1D42B')&&!modal().textContent.includes('optional alignment argument'));
  check('Grouped diagnosis leaves exact source unchanged',editor.getValue()===text);close();
  text=await fixture(bare);command('preview-equation-repair');await until(()=>modal());
  await app.plugins.disablePlugin('latex-standard-delimiters');
  check('Plugin unload closes owned dialogs',!modal());await app.plugins.enablePlugin('latex-standard-delimiters');
  check('Unload/reload preserves fixture source',editor.getValue()===text);
 }catch(error){check('Harness completed',false,String(error.stack??error));}
 finally{
  if(modal())close();const finalText=editor?.getValue();await leaf.setViewState(original);
  if(currentPath)await checkDisk(currentPath,finalText);
  window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters']?.manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/styles.css')).digest('hex'),hostVersion:window.lsdTestHostVersion,scope:'Actual Obsidian diagnostic/repair commands, source preservation, explicit Apply, scripted undo, stale preview, code exclusions, MathJax errors and unload. TestVault only.',results,passed:results.every(r=>r.passed)};
  fs.writeFileSync(root+'/equation-diagnostics-report.json',JSON.stringify(report,null,2));console.log('EQUATION_DIAGNOSTICS_DONE',report.passed);
 }
})();
