// TestVault only. Set lsdTestScriptsPath as for run-runtime-suite.js.
(async()=>{
 if(typeof window.lsdTestScriptsPath!=='string')throw Error('Set lsdTestScriptsPath to the repository scripts folder');
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('TestVault only');
 if(window.lsdRuntimeChecksRunning)throw Error('Other tests active');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),cases=JSON.parse(fs.readFileSync(window.lsdTestScriptsPath+'/../tests/fixtures/matrix-formulas.json','utf8')),results=[];
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const expectedContent=(node,c)=>{const glyphs=node?[...node.querySelectorAll('mjx-c')].map(n=>n.classList):[];return !!node&&c.requiredGlyphs.every(glyph=>glyphs.some(classes=>classes.contains(glyph)))&&glyphs.filter(classes=>classes.contains('mjx-c3D')).length===c.equalsCount&&!node.querySelector('mjx-merror');};
 const shape=n=>n.nodeType===1? [n.tagName,[...n.classList].filter(c=>!/^MJX-|^mjx-id/.test(c)).sort().join(' '),[...n.children].map(shape)]:null;
 try{
  for(const c of cases)for(const placement of ['plain','callout','list','indented','blankrows']){
   const math='\\['+c.tex+'\\]';
   const source=(placement==='callout'?'> [!NOTE] Matrix\n'+math.split('\n').map(s=>'> '+s).join('\n'):placement==='list'?'- '+math.split('\n').map((s,i)=>i?'  '+s:s).join('\n'):placement==='indented'?math.split('\n').map((line,i)=>i?' '+line:line).join('\n'):placement==='blankrows'?math.replaceAll('\n','\n\n'):math)+'\n\nAfter\n';
   const path='MatrixProbe.md',file=app.vault.getAbstractFileByPath(path);
   if(file)await app.vault.modify(file,source);else await app.vault.create(path,source);
   await leaf.setViewState({type:'markdown',state:{file:path,mode:'preview'}});await wait(400);
   const ref=await window.MathJax.tex2chtmlPromise(c.tex,{display:true});const expected=JSON.stringify(shape(ref.querySelector('mjx-math')));
   let actual=leaf.view.previewMode.containerEl.querySelector('.lsd-math mjx-math');
   results.push({case:c.name,placement,mode:'reading',passed:expectedContent(actual,c)&&JSON.stringify(shape(actual))===expected,errors:[...leaf.view.previewMode.containerEl.querySelectorAll('mjx-merror')].map(e=>e.textContent),html:actual?'':leaf.view.previewMode.containerEl.innerHTML.slice(0,10000)});
   await leaf.setViewState({type:'markdown',state:{file:path,mode:'source',source:false}});const cm=leaf.view.editor.cm;
   cm.dispatch({selection:{anchor:source.length},scrollIntoView:true});await wait(400);
   actual=cm.dom.querySelector('.lsd-math mjx-math');
   results.push({case:c.name,placement,mode:'live',passed:expectedContent(actual,c)&&JSON.stringify(shape(actual))===expected,errors:[...cm.dom.querySelectorAll('mjx-merror')].map(e=>e.textContent)});
   if(placement==='plain'){
    cm.dispatch({selection:{anchor:source.indexOf('begin')+5},scrollIntoView:true});cm.focus();await wait(400);
    actual=cm.dom.querySelector('.lsd-editing-preview mjx-math');
    results.push({case:c.name,placement,mode:'editing',passed:expectedContent(actual,c)&&JSON.stringify(shape(actual))===expected,sourceExact:cm.state.doc.toString()===source,visible:cm.contentDOM.textContent});
   }
  }
 }catch(e){results.push({passed:false,error:String(e.stack??e)});}
 finally{
  await leaf.setViewState(original);window.lsdRuntimeChecksRunning=false;
  const report={timestamp:new Date().toISOString(),version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/styles.css')).digest('hex'),hostVersion:window.lsdTestHostVersion,scope:'Independent required glyph/operator checks plus reconstructed intended matrix equations, not the exact user note: semantic MathJax comparison in Reading/Live Preview, plain editing previews, callouts, lists, indentation and blank rows.',reconstructed:true,results,passed:results.every(r=>r.passed)};
  fs.writeFileSync(root+'/matrix-rendering-report.json',JSON.stringify(report,null,2));console.log('MATRIX_PROBE_DONE',report.passed);
 }
})();
