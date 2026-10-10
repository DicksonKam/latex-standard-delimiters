// Actual Obsidian geometry checks; run only in the disposable TestVault.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault')||window.lsdRuntimeChecksRunning)throw Error('Disposable idle TestVault required');
 if(!document.hasFocus())throw Error('Close DevTools before the delayed run so the editor document owns focus');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],observations=[],notes=[];
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),check=(name,passed)=>results.push({name,passed:Boolean(passed)});
 const repo=window.lsdTestScriptsPath+'/..';
 const matrix=JSON.parse(fs.readFileSync(repo+'/tests/fixtures/matrix-formulas.json','utf8'))[1].tex;
 const list=String.raw`- **Interval Projectors and Measurement Probabilities:** Restricting the identity-resolution integral to \([a_1,a_2]\) gives its spectral projector:

  $$
  \boxed{P_{[a_1,a_2]}=\int_{a_1}^{a_2}|a\rangle\langle a|\,da}
  $$

  For normalized \(|\psi\rangle\),
  \[
  \begin{aligned}
  \Pr(a\in[a_1,a_2])
  &=\langle\psi|P_{[a_1,a_2]}|\psi\rangle \\
  &=\int_{a_1}^{a_2}\langle\psi|a\rangle\langle a|\psi\rangle\,da \\
  &=\int_{a_1}^{a_2}|\psi(a)|^2\,da
  \end{aligned}
\]
asdfadsfasf`;
 const tex=String.raw`\begin{aligned}
a&=b\\
&=c\\
&=d
\end{aligned}`;
 const indent=(text,prefix)=>text.split('\n').map(x=>prefix+x).join('\n');
 const cases=[['exact list',list],['indented closing',list.replace('\n\\]\n','\n  \\]\n')],['ordered list','12. Item\n\n'+indent('\\[\n'+tex+'\n\\]','    ')+'\nAfter'],['task list','- [ ] Item\n\n'+indent('\\[\n'+tex+'\n\\]','  ')+'\nAfter'],['nested list','- Outer\n  - Inner\n\n'+indent('\\[\n'+tex+'\n\\]','    ')+'\nAfter'],['callout','> [!note] Math\n'+indent('\\[\n'+tex+'\n\\]','> ')+'\n\nAfter'],['quoted list','> - Item\n>\n'+indent('\\[\n'+tex+'\n\\]','>   ')+'\nAfter'],['blank TeX rows','- Item\n\n'+indent('\\[\n'+tex.replace('a&=b','\n\na&=b')+'\n\\]','  ')+'\nAfter'],['closing prose','- Item\n\n'+indent('\\[\n'+tex+'\n\\] Closing prose','  ')+'\nAfter'],['indented plain','Before\n\n'+indent('\\[\n'+tex+'\n\\]',' ')+'\nAfter']];
 const theme=document.createElement('style');
 theme.textContent=fs.readFileSync(root+'/.obsidian/themes/Minimal/theme.css','utf8');
 document.head.appendChild(theme);
 const hadDivider=document.body.classList.contains('h1-l');document.body.classList.add('h1-l');
 try{
  for(const [name,source] of cases){
   const file=await app.vault.create('Layout-regression-'+Date.now()+'.md',source);notes.push({path:file.path,source});
   await leaf.setViewState({type:'markdown',state:{file:file.path,mode:'source',source:false}});
   const cm=leaf.view.editor.cm;cm.focus();cm.dispatch({selection:{anchor:source.length},scrollIntoView:true});await wait(250);
   const lines=[...cm.contentDOM.querySelectorAll('.lsd-math-hidden-line')],heights=lines.map(n=>n.getBoundingClientRect().height);
   const nativeCallout=cm.dom.querySelector('.callout-content');
   check(name+': hidden TeX rows have zero visual height',nativeCallout ? !nativeCallout.textContent.includes('\\begin{aligned}') : heights.length>=4&&heights.every(h=>h<0.1));
   check(name+': display renders without MathJax errors',cm.dom.querySelectorAll('.lsd-math mjx-container').length>0&&!cm.dom.querySelector('.lsd-math mjx-merror'));
   const after=[...cm.contentDOM.querySelectorAll('.cm-line')].find(n=>n.textContent.includes(name==='exact list'||name==='indented closing'?'asdfadsfasf':'After'));
   check(name+': following prose remains visible',!!after&&after.getBoundingClientRect().height>10&&!after.classList.contains('lsd-math-hidden-line'));
   if(name==='closing prose')check(name+': closing-line prose stays visible',[...cm.contentDOM.querySelectorAll('.cm-line')].some(n=>n.textContent.includes('Closing prose')&&n.getBoundingClientRect().height>10));
   if(name==='exact list')check('Native dollar display remains native',!!cm.dom.querySelector('.math-block'));
   observations.push({name,heights});
   const opening=source.indexOf('\\['),closing=source.indexOf('\\]',opening)+2;
   if(!nativeCallout){
    const boundary=cm.state.doc.lineAt(opening).from;
    cm.dispatch({selection:{anchor:Math.max(0,boundary-1)}});
    cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));await wait(150);
    check(name+': Down enters math across preserved indentation',cm.state.selection.main.head>=opening&&cm.state.selection.main.head<=closing);
    cm.dispatch({selection:{anchor:source.length}});
    cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));await wait(150);
    check(name+': Up enters math across hidden source rows',cm.state.selection.main.head>=opening&&cm.state.selection.main.head<=closing);
   }

   // Enter an interior source row, then leave it: geometry must rebuild both ways.
   if(nativeCallout){cm.dom.querySelector('.callout-content .lsd-math')?.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));await wait(200);}
   cm.dispatch({selection:{anchor:source.indexOf('\\begin{aligned}')+3},scrollIntoView:true});cm.focus();await wait(350);
   if(name==='callout')observations.push({name:'callout entry',head:cm.state.selection.main.head,focus:cm.hasFocus,lines:[...cm.contentDOM.querySelectorAll('.cm-line')].map(n=>({text:n.textContent,cls:n.className})),callout:!!cm.dom.querySelector('.callout-content')});
   check(name+': caret entry reveals editable rows',!cm.dom.querySelector('.lsd-math-hidden-line')&&!!cm.dom.querySelector('.lsd-math-source'));
   check(name+': source bytes preserved',cm.state.doc.toString()===source);
   cm.dispatch({selection:{anchor:source.length},scrollIntoView:true});await wait(150);
   check(name+': leaving equation collapses rows again',cm.dom.querySelectorAll('.lsd-math-hidden-line').length>=4||!!cm.dom.querySelector('.callout-content .lsd-math'));
   if(name==='exact list'){
    await leaf.setViewState({type:'markdown',state:{file:file.path,mode:'preview'}});await wait(300);
    const container=leaf.view.previewMode.containerEl,display=container.querySelector('.lsd-math-block');
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let following=null;
    while(walker.nextNode()){const node=walker.currentNode,index=node.textContent.indexOf('asdfadsfasf');if(index>=0){following=document.createRange();following.setStart(node,index);following.setEnd(node,index+11);break;}}
    const gap=display&&following?following.getBoundingClientRect().top-display.getBoundingClientRect().bottom:null;
    check('Exact list Reading View renders custom and native math',container.querySelectorAll('.lsd-math mjx-container').length===3&&!!container.querySelector('.math-block'));
    check('Exact list Reading View has no residual source-row gap',gap!==null&&gap>=-1&&gap<100);
    observations.push({name:'Reading View exact list',gap});
   }

  }
  for(const spaces of ['', '  ']){
   const source='# Ordinary heading\n\nBefore\n\n\\[ \n'+matrix.trim().split('\n').map(x=>x+spaces).join('\n')+'\n\\]\n\nAfter';
   const file=await app.vault.create('Layout-typography-'+Date.now()+'.md',source);notes.push({path:file.path,source});
   await leaf.setViewState({type:'markdown',state:{file:file.path,mode:'source',source:false}});
   const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:source.indexOf('\n=')+1},scrollIntoView:true});await wait(200);
   const base=parseFloat(getComputedStyle(cm.contentDOM).fontSize),parts=[...cm.dom.querySelectorAll('.lsd-math-source-line,.lsd-math-source-line .cm-header,.lsd-math-source,.lsd-math-source *')];
   check('Setext '+spaces.length+': all wrappers and tokens use body size',parts.length>0&&parts.every(n=>Math.abs(parseFloat(getComputedStyle(n).fontSize)-base)<.1));
   check('Setext '+spaces.length+': no heading border or margin', [...cm.dom.querySelectorAll('.lsd-math-source-line.HyperMD-header')].every(n=>{const s=getComputedStyle(n);return parseFloat(s.borderBottomWidth)===0&&parseFloat(s.marginBottom)===0;}));
   const heading=[...cm.dom.querySelectorAll('.cm-line')].find(n=>n.textContent.includes('Ordinary heading'));
   check('Setext '+spaces.length+': ordinary heading retains divider',!!heading&&parseFloat(getComputedStyle(heading).borderBottomWidth)>0);
   check('Setext '+spaces.length+': exact source preserved',cm.state.doc.toString()===source);
  }
 }catch(error){check('Harness completed: '+String(error.stack??error),false);}
 finally{
  theme.remove();if(!hadDivider)document.body.classList.remove('h1-l');await leaf.setViewState(original);
  for(const note of notes)check('Disk source preserved: '+note.path,await app.vault.adapter.read(note.path)===note.source);
  window.lsdRuntimeChecksRunning=false;
  const report={timestamp:new Date().toISOString(),version:app.plugins.plugins['latex-standard-delimiters']?.manifest.version,mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/styles.css')).digest('hex'),scope:'Actual desktop line geometry and source typography with Minimal heading dividers; synthetic caret transitions, not native arrow input.',results,observations,passed:results.every(r=>r.passed)};
  fs.writeFileSync(root+'/equation-layout-report.json',JSON.stringify(report,null,2));console.log('EQUATION_LAYOUT_DONE',report.passed,results.filter(r=>!r.passed));
 }
})();
