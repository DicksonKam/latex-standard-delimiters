// Developer checks: disposable TestVault only. Run once, in the foreground.
(async()=>{
  if(app.vault.getName()!=='TestVault') throw new Error('TestVault only');
  const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf;
  const results=[],timings=[],check=(name,passed,detail='')=>results.push({name,passed:Boolean(passed),detail});
  const wait=(ms=200)=>new Promise(r=>setTimeout(r,ms));
  const file=root+'/Audit.md',before=fs.readFileSync(file,'utf8');
  const plugin=app.plugins.plugins['latex-standard-delimiters'];
  const originalPreview=plugin.editingPreviews;
  const config=root+'/.obsidian/community-plugins.json',originalConfig=fs.readFileSync(config,'utf8');
  let view;
  try {
    for(const mode of ['source','preview']){
      await leaf.setViewState({type:'markdown',state:{file:'Audit.md',mode,source:false}});await wait(500);
      const container=leaf.view.containerEl.querySelector(mode==='source'?'.cm-editor':'.markdown-preview-view');
      check(mode+': inline math in list/callout/table renders',container.querySelectorAll('.lsd-math-inline mjx-container').length===6,container.querySelectorAll('.lsd-math-inline mjx-container').length);
      check(mode+': comment closing delimiter stays in full formula',Boolean(container.querySelector('.lsd-math-block .mjx-c1D466')));
      check(mode+': literal parentheses in table/title stay literal',container.textContent.includes('Plain (x_1), math')&&container.textContent.includes('literal (z), math'));
      check(mode+': malformed LaTeX has visible error',Boolean(container.querySelector('mjx-merror,.lsd-render-error')));
    }
    await leaf.setViewState({type:'markdown',state:{file:'EmbedHost.md',mode:'preview',source:false}});await wait(800);
    check('Embedded note renders its standard delimiters',leaf.view.containerEl.querySelectorAll('.markdown-preview-view .lsd-math-inline mjx-container').length===6);
    await leaf.setViewState({type:'markdown',state:{file:'Audit.md',mode:'source',source:false}});await wait();
    view=leaf.view.editor.cm;
    const first=before.indexOf('\\(a_b'),second=before.indexOf('\\(c_d');
    view.dispatch({selection:{anchor:first+2}});await wait();
    check('Exactly one editing preview',view.dom.querySelectorAll('.lsd-editing-preview').length===1);
    view.dispatch({selection:{anchor:first,head:second+7}});await wait();
    check('Broad selection has no editing previews',!view.dom.querySelector('.lsd-editing-preview'));
    const Selection=view.state.selection.constructor;
    view.dispatch({selection:Selection.create([Selection.cursor(first+2),Selection.cursor(second+2)])});await wait();
    check('Multiple cursors have no extra previews',view.state.selection.ranges.length===2&&!view.dom.querySelector('.lsd-editing-preview'));
    view.dispatch({selection:{anchor:first,head:second+7}});await wait();
    const data=new DataTransfer();view.contentDOM.dispatchEvent(new ClipboardEvent('copy',{clipboardData:data,bubbles:true,cancelable:true}));
    check('Copy uses raw selected delimiters',data.getData('text/plain')===view.state.sliceDoc(first,second+7),data.getData('text/plain'));
    view.dispatch({selection:{anchor:first+2}});await wait();
    plugin.editingPreviews=false;await plugin.saveColors();await wait();
    check('Preview option applies without reload',!view.dom.querySelector('.lsd-editing-preview')&&Boolean(view.dom.querySelector('.lsd-token-command,.lsd-token-brace,.lsd-token-operator')));
    check('Preview preference persists',(await plugin.loadData()).editingPreviews===false);
    plugin.editingPreviews=true;await plugin.saveColors();await wait();
    check('Preview option restores without reload',view.dom.querySelectorAll('.lsd-editing-preview').length===1);
    const content=view.state.doc.toString();
    view.dispatch({changes:{from:first+2,to:first+2,insert:'q'},userEvent:'input.type'});await wait();
    view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',metaKey:true,bubbles:true,cancelable:true}));await wait();
    check('Undo restores source after typing',view.state.doc.toString()===content);
    view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'Z',code:'KeyZ',keyCode:90,metaKey:true,shiftKey:true,bubbles:true,cancelable:true}));await wait();
    check('Redo restores source edit',view.state.doc.toString()===content.slice(0,first+2)+'q'+content.slice(first+2),view.state.doc.toString());
    view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});await wait();
    view.dispatch({changes:{from:first,to:first+2,insert:''},selection:{anchor:first}});await wait();
    check('Deleting opener remains editable',!view.dom.querySelector('.lsd-editing-preview')&&view.state.doc.toString()===before.slice(0,first)+before.slice(first+2));
    view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});await wait();
    view.dispatch({selection:{anchor:first+2}});await wait();
    const pasted=new DataTransfer();pasted.setData('text/plain',String.raw`\alpha_2`);
    view.contentDOM.dispatchEvent(new ClipboardEvent('paste',{clipboardData:pasted,bubbles:true,cancelable:true}));await wait();
    check('Paste retains exact LaTeX text',view.state.doc.toString()===before.slice(0,first+2)+String.raw`\alpha_2`+before.slice(first+2));
    view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});await wait();
    const native=before.indexOf('$x_1$')+1;
    view.dispatch({selection:{anchor:native}});await wait();
    check('Native math does not gain our editing preview',!view.dom.querySelector('.lsd-editing-preview'));
    // Theme classes exercise theme-variable defaults without installing a theme.
    for(const theme of ['theme-light','theme-dark']){
      const originalClass=document.body.className;document.body.classList.remove('theme-light','theme-dark');document.body.classList.add(theme);
      view.dispatch({selection:{anchor:first+2}});await wait();
      const token=view.dom.querySelector('.lsd-token-operator');
      check(theme+': source token visible',token&&getComputedStyle(token).color!==getComputedStyle(token).backgroundColor);
      document.body.className=originalClass;
    }
    for(const count of [100,500,1000]){
      const text=Array.from({length:count},(_,i)=>'Equation '+i+': \\(x_'+i+'+1\\). '+'prose '.repeat(8)+'\n\n').join('');
      await app.vault.adapter.write('Large.md',text);await wait();
      const start=performance.now();await leaf.setViewState({type:'markdown',state:{file:'Large.md',mode:'source',source:false}});await wait(100);
      const large=leaf.view.editor.cm,openMs=performance.now()-start;
      const samples=[];for(let i=0;i<20;i++){const t=performance.now();large.dispatch({selection:{anchor:i%2?text.indexOf('\\(')+2:0}});samples.push(performance.now()-t);}
      timings.push({count,characters:text.length,openIncluding100msWait:openMs,selectionMeanMs:samples.reduce((a,b)=>a+b)/samples.length,selectionMaxMs:Math.max(...samples)});
      check('Large note '+count+' retains source',large.state.doc.toString()===text);
    }
    await leaf.setViewState({type:'markdown',state:{file:'Audit.md',mode:'source',source:false}});await wait();view=leaf.view.editor.cm;
    // Enable and disable the conflicting ID after startup; polling must recover.
    fs.writeFileSync(config,JSON.stringify([...JSON.parse(originalConfig),'latex-delimiter-renderer']));await wait(2600);
    check('Conflict enabled later pauses ours',!view.dom.querySelector('.lsd-math'));
    fs.writeFileSync(config,originalConfig);await wait(2600);
    check('Conflict removal automatically resumes ours',Boolean(view.dom.querySelector('.lsd-math')));
    await app.plugins.disablePlugin('latex-standard-delimiters');await wait();
    check('Unload removes our editor decorations',!view.dom.querySelector('.lsd-math,.lsd-token-operator'));
    await app.plugins.enablePlugin('latex-standard-delimiters');await wait();
    check('Reload does not duplicate widgets',view.dom.querySelectorAll('.lsd-math-inline').length===6);
    check('Audit note unchanged',view.state.doc.toString()===before&&fs.readFileSync(file,'utf8')===before);
  } finally {
    fs.writeFileSync(config,originalConfig);
    const current=app.plugins.plugins['latex-standard-delimiters'];if(current){current.editingPreviews=originalPreview;await current.saveColors();}
    if(view&&view.state.doc.toString()!==before)view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});
  }
  fs.writeFileSync(root+'/beta-audit-report.json',JSON.stringify({version:JSON.parse(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/manifest.json','utf8')).version,results,timings},null,2));
  console.log('BETA AUDIT',results.filter(r=>!r.passed),timings);
})();
