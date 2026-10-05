// Run on the old bundle to reproduce, then on the fixed candidate. TestVault only.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault')||window.lsdRuntimeChecksRunning)throw Error('Disposable idle TestVault required');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],observations=[];
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(name,passed)=>results.push({name,passed:Boolean(passed)});
 const fixtures=JSON.parse(fs.readFileSync(window.lsdTestScriptsPath+'/../tests/fixtures/matrix-formulas.json','utf8'));
 const boxed=fixtures[1].tex.replace('\\end{pmatrix}\n=','\n\\end{pmatrix}\n=');
 const cases=[['boxed Setext heading',boxed],['invisible blank rows',boxed.replace('\n\n\\end','\n\u200b\n\u200b\n\n\\end')],['Markdown emphasis','\\text{**stars** and _underscores_}'],['TeX heading-like text','\n% comment\n# editing text\nx\n']];
 const notes=[];
 try{
  for(const [name,tex] of cases){
   const source='# Ordinary heading\n\nBefore\n\n\\['+tex+'\\]\n\nAfter\n',path='Typography-'+Date.now()+'.md';
   await app.vault.create(path,source);notes.push({path,source});
   await leaf.setViewState({type:'markdown',state:{file:path,mode:'source',source:false}});
   const cm=leaf.view.editor.cm;app.workspace.setActiveLeaf(leaf,{focus:true});
   const anchor=name.includes('Setext')?source.indexOf('\n=')+1:source.indexOf('\\[')+2;
   cm.dispatch({selection:{anchor},scrollIntoView:true});cm.focus();await wait(250);
   const base=parseFloat(getComputedStyle(cm.contentDOM).fontSize);
   const parts=[...cm.dom.querySelectorAll('.lsd-math-source,.lsd-math-source *,.lsd-math-source-marker')];
   const styles=parts.map(n=>({text:n.textContent,font:getComputedStyle(n).fontSize,weight:getComputedStyle(n).fontWeight,style:getComputedStyle(n).fontStyle}));
   check(name+': source size matches editor text',styles.length>0&&styles.every(s=>Math.abs(parseFloat(s.font)-base)<0.1));
   check(name+': source has normal weight and style',styles.length>0&&styles.every(s=>s.weight==='400'&&s.style==='normal'));
   check(name+': exact editor source remains intact',leaf.view.editor.getValue()===source);
   const heading=[...cm.dom.querySelectorAll('.cm-line')].find(n=>n.textContent.includes('Ordinary heading'));
   check(name+': ordinary heading stays a heading',!!heading&&!heading.classList.contains('lsd-math-source-line')&&parseFloat(getComputedStyle(heading).fontSize)>base);
   observations.push({name,base,styles:styles.filter(s=>parseFloat(s.font)!==base||s.weight!=='400'||s.style!=='normal')});
  }
  const source='# Heading with \\(x_1\\)\n\nAfter\n',path='Typography-inline-'+Date.now()+'.md';
  await app.vault.create(path,source);notes.push({path,source});await leaf.setViewState({type:'markdown',state:{file:path,mode:'source',source:false}});
  const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:source.indexOf('x_1')}});cm.focus();await wait(200);
  const line=cm.dom.querySelector('.cm-line');check('Inline math does not reset its surrounding heading',!line.classList.contains('lsd-math-source-line')&&parseFloat(getComputedStyle(line).fontSize)>parseFloat(getComputedStyle(cm.contentDOM).fontSize));
  check('Inline heading exact source is preserved',leaf.view.editor.getValue()===source);
 }catch(error){check('Harness completed: '+String(error.stack??error),false);}
 finally{
  await leaf.setViewState(original);
  for(const note of notes){const start=performance.now();while(await app.vault.adapter.read(note.path)!==note.source&&performance.now()-start<1500)await wait(25);check('Saved exact bytes: '+note.path,await app.vault.adapter.read(note.path)===note.source);}
  window.lsdRuntimeChecksRunning=false;
  const report={timestamp:new Date().toISOString(),version:app.plugins.plugins['latex-standard-delimiters']?.manifest.version,hostVersion:window.lsdTestHostVersion,mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/styles.css')).digest('hex'),scope:'Actual computed math-source typography, ordinary/mixed headings, emphasis, invisible blank rows, source and disk bytes in disposable TestVault; synthetic caret placement, not all themes/platforms.',results,observations,passed:results.every(r=>r.passed)};
  fs.writeFileSync(root+'/source-typography-report.json',JSON.stringify(report,null,2));console.log('SOURCE_TYPOGRAPHY_DONE',report.passed);
 }
})();
