// Actual Obsidian regression checks. Disposable fixture only; never plugin startup.
(async()=>{
 const fs=require('node:fs'),path=require('node:path'),root=app.vault.adapter.getBasePath();
 if(app.vault.getName()!=='TestVault')throw Error('Disposable TestVault only');
 const file='Containers.md',before=fs.readFileSync(path.join(root,file),'utf8');
 const results=[],check=(name,passed,detail='')=>results.push({name,passed:Boolean(passed),detail});
 const wait=async(condition=()=>true)=>{for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,125));if(condition())return;}};
 const leaf=app.workspace.activeLeaf;
 try {
 await leaf.setViewState({type:'markdown',state:{file,mode:'source',source:false}});await wait();
 const cm=leaf.view.editor.cm;cm.focus();cm.dispatch({selection:{anchor:0}});
 await wait(()=>leaf.view.containerEl.querySelectorAll('.lsd-math mjx-container').length>=2);
 const listStart=before.indexOf('\\['),listEnd=before.indexOf('\\]')+2,quoteStart=before.lastIndexOf('\\['),quoteEnd=before.lastIndexOf('\\]')+2;
 check('List display renders in Live Preview',!!cm.dom.querySelector('.HyperMD-list-line .lsd-math mjx-container'));
 check('Native inactive callout body renders',!!cm.dom.querySelector('.callout-content .lsd-math mjx-container'));
 const listWidget=cm.dom.querySelector('.HyperMD-list-line .lsd-math');listWidget?.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));cm.dom.ownerDocument.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,button:0}));await wait();check('Click list equation reveals original source',cm.state.selection.main.head===listStart+2);
 cm.dispatch({selection:{anchor:0}});await wait();
 check('List bullet and callout title remain',!!cm.dom.querySelector('.list-bullet')&&cm.dom.querySelector('.callout-title-inner')?.textContent==='Callout');
 const calloutWidget=cm.dom.querySelector('.callout-content .lsd-math');calloutWidget?.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));await wait();check('Click callout equation reveals original source',cm.state.selection.main.head===quoteStart+2);
 cm.dispatch({selection:{anchor:0}});await wait();
 for(const [kind,start,end] of [['list',listStart,listEnd],['callout',quoteStart,quoteEnd]]){
  if(kind==='callout'){cm.dispatch({selection:{anchor:end+1}});await wait();cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));await wait();}
  cm.dispatch({selection:{anchor:start+3}});await wait(()=>cm.dom.querySelector('.lsd-editing-preview'));
  check(kind+' source remains exact',cm.state.doc.toString()===before);
  check(kind+' preview has valid MathJax',!!cm.dom.querySelector('.lsd-editing-preview mjx-container')&&!cm.dom.querySelector('.lsd-editing-preview mjx-merror'));
  const openingLine=cm.state.doc.lineAt(start).text;await wait(()=>[...cm.dom.querySelectorAll('.cm-line')].some(x=>x.textContent===openingLine));const visibleLines=[...cm.dom.querySelectorAll('.cm-line')].map(x=>x.textContent);check(kind+' original opening line reveals once',visibleLines.filter(x=>x===openingLine).length===1,JSON.stringify({openingLine,visibleLines,editorHasFocus:cm.hasFocus,documentHasFocus:cm.dom.ownerDocument.hasFocus(),activeElement:cm.dom.ownerDocument.activeElement?.className}));
  cm.dispatch({selection:{anchor:start+3,head:end-2}});await wait();
  check(kind+' selection hides active preview',!cm.dom.querySelector('.lsd-editing-preview'));
  check(kind+' selected source includes original prefixes',cm.state.doc.sliceString(cm.state.selection.main.from,cm.state.selection.main.to)===before.slice(start+3,end-2));
  const copied=new DataTransfer();cm.contentDOM.dispatchEvent(new ClipboardEvent('copy',{clipboardData:copied,bubbles:true,cancelable:true}));check(kind+' copy preserves raw container source',copied.getData('text/plain')===before.slice(start+3,end-2));
  cm.dispatch({selection:{anchor:start+3},changes:{from:start+3,insert:'z'},userEvent:'input.type'});await wait();
  check(kind+' typing retains surrounding Markdown',cm.state.doc.toString()===before.slice(0,start+3)+'z'+before.slice(start+3));
  const undo=()=>cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',metaKey:true,bubbles:true,cancelable:true})),redo=()=>cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'Z',code:'KeyZ',keyCode:90,metaKey:true,shiftKey:true,bubbles:true,cancelable:true}));undo();await wait();check(kind+' undo restores exact source',cm.state.doc.toString()===before);
  redo();await wait();check(kind+' redo restores insertion',cm.state.doc.toString()===before.slice(0,start+3)+'z'+before.slice(start+3));undo();await wait();
  const insertion=before.indexOf('x_1+y',start)+1;cm.dispatch({selection:{anchor:insertion}});const pasted=new DataTransfer();pasted.setData('text/plain',String.raw`\alpha_2`);cm.contentDOM.dispatchEvent(new ClipboardEvent('paste',{clipboardData:pasted,bubbles:true,cancelable:true}));await wait();check(kind+' paste preserves exact TeX and prefixes',cm.state.doc.toString()===before.slice(0,insertion)+String.raw`\alpha_2`+before.slice(insertion));undo();await wait();check(kind+' undo paste restores source',cm.state.doc.toString()===before);
  cm.dispatch({selection:{anchor:end+1}});await wait();cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));await wait();
  check(kind+' ArrowUp enters equation',cm.state.selection.main.head>=start&&cm.state.selection.main.head<=end,JSON.stringify({head:cm.state.selection.main.head,start,end}));
 }
 const Selection=cm.state.selection.constructor;cm.dispatch({selection:Selection.create([Selection.cursor(listStart+3),Selection.cursor(quoteStart+3)])});await wait();check('Container multiple cursors suppress previews',cm.state.selection.ranges.length===2&&!cm.dom.querySelector('.lsd-editing-preview'));check('Multiple cursors preserve source',cm.state.doc.toString()===before);
 cm.dispatch({selection:{anchor:0}});await wait();
 await leaf.setViewState({type:'markdown',state:{file,mode:'preview'}});await wait(()=>leaf.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-container').length>=2);
 check('Both container equations render in Reading View',leaf.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-container').length===2);
 check('Fixture bytes unchanged after editing and mode switch',fs.readFileSync(path.join(root,file),'utf8')===before);
 } catch(error) { check('Container harness completes',false,String(error)); } finally {
  if(leaf.view.file?.path===file && leaf.view.editor?.getValue()!==before)leaf.view.editor?.setValue(before);
  fs.writeFileSync(path.join(root,file),before);
 }
 const report={pluginVersion:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'.obsidian/plugins/latex-standard-delimiters/main.js'))).digest('hex'),results};
 fs.writeFileSync(path.join(root,'container-editing-report.json'),JSON.stringify(report,null,2));console.log('CONTAINER_EDITING',results.filter(x=>!x.passed));
})();
