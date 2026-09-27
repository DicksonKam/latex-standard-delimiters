// Expanded container boundaries and adjacent-equation identity checks.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable work/TestVault only');if(window.lsdRuntimeChecksRunning)throw Error('Tests active');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],errors=[],diagnostics=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});const capture=e=>errors.push(String(e.message??e.reason));window.addEventListener('error',capture);window.addEventListener('unhandledrejection',capture);
 const digits=node=>[...node.querySelectorAll('mjx-mn mjx-c')].map(c=>{const m=c.className.match(/mjx-c([0-9A-F]+)/i);return m?String.fromCodePoint(parseInt(m[1],16)):'';}).join('');
 const identity=dom=>[...dom.querySelectorAll('.lsd-math:not(.lsd-editing-preview) mjx-container')].map(digits);
 const cases=[];
 for(const marker of ['- ','+ ','* ','1. ','12) '])for(const suffix of ['', '.', ' then continue.'])cases.push([marker+suffix,marker+'\\[321+\n'+' '.repeat(marker.length)+'4\\]'+suffix,['3214']]);
 cases.push(['list-prose','- Given \\[321+\n  4\\] then continue.',['3214']],['list-continuation','- Given\n\n  \\[321+\n  4\\].',['3214']],['task','- [ ] \\[321+\n      4\\].',['3214']],['nested-list','- Outer\n  - \\[321+\n    4\\].',['3214']]);
 for(const prefix of ['> ','> > '])cases.push(['quote-list'+prefix,prefix+'[!note] Title\n'+prefix+'- \\[321+\n'+prefix+'  4\\].',['3214']]);
 cases.push(['adjacent-inline',String.raw`\(321+4\)\(654+7\)`,['3214','6547']],['adjacent-display',String.raw`\[321+
4\]\[654+
7\]`,['3214','6547']],['mixed-line',String.raw`Given \(321+4\) then \[654+
7\].`,['3214','6547']],['unicode',String.raw`漢字 😀 \[321+
4\] 中文.`,['3214']],['blank-math-row',String.raw`\[321+

4\].`,['3214']]);
 cases.push(['identical-blank-displays',String.raw`\[321+

4\].

\[321+

4\].`,['3214','3214']]);
 cases.push(['two-blank-displays' ,String.raw`\[321+

4\]

\[654+

7\].`,['3214','6547']],['blank-lookalike',String.raw`Literal [321+4].

\[321+

4\].`,['3214']],['blank-quote',String.raw`> [!note] Title
> \[321+
>
> 4\].`,['3214']],['blank-list',String.raw`- \[321+

  4\].`,['3214']]);
 try{
 for(let round=0;round<2;round++)for(const [name,body,expected]of cases){
  await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});const text='Before\n\n'+body+'\n\nAfter\n';await app.vault.adapter.write('BoundaryStress.md',text);await wait(25);
  for(const mode of ['source','preview']){
   await leaf.setViewState({type:'markdown',state:{file:'BoundaryStress.md',mode,source:false}});if(mode==='source')leaf.view.editor.cm.dispatch({selection:{anchor:0}});await wait(200);
   const dom=mode==='source'?leaf.view.editor.cm.dom:leaf.view.previewMode.containerEl,actual=identity(dom);check(round+'/'+name+'/'+mode+' identity',JSON.stringify(actual)===JSON.stringify(expected),{actual,expected});check(round+'/'+name+'/'+mode+' no math errors',!dom.querySelector('.lsd-math mjx-merror'));
   if(JSON.stringify(actual)!==JSON.stringify(expected))diagnostics.push({name,mode,body,html:dom.innerHTML.slice(0,30000)});
   if(mode==='source'){
    const cm=leaf.view.editor.cm,pos=text.indexOf('321',text.indexOf('\\'));cm.dispatch({selection:{anchor:pos+1}});await wait(100);check(round+'/'+name+' active identity',digits(cm.dom.querySelector('.lsd-editing-preview')??document.createElement('div'))==='3214');check(round+'/'+name+' active no quote leak',!cm.dom.querySelector('.lsd-editing-preview .mjx-c3E'));cm.dispatch({selection:{anchor:0}});await wait(80);check(round+'/'+name+' exit restores identity',JSON.stringify(identity(cm.dom))===JSON.stringify(expected));check(round+'/'+name+' exact editor source',cm.state.doc.toString()===text);
   }
  }
  if(name==='blank-math-row'){
   await app.plugins.disablePlugin('latex-standard-delimiters');await wait(100);
   const dom=leaf.view.previewMode.containerEl;check(round+'/blank unload removes math',identity(dom).length===0);check(round+'/blank unload restores paragraph text',JSON.stringify([...dom.querySelectorAll('.el-p > p')].map(p=>p.textContent))===JSON.stringify(['Before','[321+','4].','After']));check(round+'/blank unload avoids nested paragraphs',!dom.querySelector('p p'));await app.plugins.enablePlugin('latex-standard-delimiters');
  }
  check(round+'/'+name+' exact disk source' ,fs.readFileSync(root+'/BoundaryStress.md','utf8')===text);
 }
 check('No uncaught errors',errors.length===0,errors);
 }catch(e){check('Harness completes',false,String(e));}
 finally{await leaf.setViewState(original);window.removeEventListener('error',capture);window.removeEventListener('unhandledrejection',capture);window.lsdRuntimeChecksRunning=false;const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'31 boundary/adjacency layouts, two cycles, both views, active identity and source preservation; synthetic editor selections.',results,errors,diagnostics};fs.writeFileSync(root+'/boundary-stress-report.json',JSON.stringify(report,null,2));console.log('BOUNDARY_STRESS',results.filter(r=>!r.passed));}
})();
