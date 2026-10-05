// TestVault only. Close DevTools, run Preview equation repair via the palette,
// click Apply delimiter repair, then press Cmd-Z before running the finish script.
(async()=>{
 const root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault')||window.lsdRuntimeChecksRunning)throw Error('Disposable idle TestVault required');
 window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState();
 const body='[\n\\boxed{\\begin{pmatrix}A_\\rho\\\\A_\\phi\\\\A_z\\end{pmatrix}}\n]';
 const text='Before\n\n'+body+'\n\nAfter\n',expected='Before\n\n\\'+body.slice(0,-1)+'\\]\n\nAfter\n';
 const path='NativeEquationDiagnostics-'+Date.now()+'.md';await app.vault.create(path,text);
 await leaf.setViewState({type:'markdown',state:{file:path,mode:'source',source:false}});
 app.workspace.setActiveLeaf(leaf,{focus:true});const editor=leaf.view.editor,records=[],timers=new Set();
 editor.setSelection(editor.offsetToPos(8),editor.offsetToPos(8+body.length));editor.focus();
 const record=event=>{
  const kind=event.type==='click'&&event.target.closest?.('button')?.textContent==='Apply delimiter repair'?'apply':event.type==='keydown'&&event.metaKey&&event.key.toLowerCase()==='z'?'undo':null;
  if(!kind)return;const trusted=event.isTrusted;
  const timer=setTimeout(()=>{timers.delete(timer);records.push({kind,trusted,source:editor.getValue()});},100);timers.add(timer);
 };
 document.addEventListener('click',record,true);editor.cm.contentDOM.addEventListener('keydown',record,true);
 window.lsdNativeEquationDiagnostics={leaf,original,editor,path,text,expected,records,cleanup:()=>{
  document.removeEventListener('click',record,true);editor.cm.contentDOM.removeEventListener('keydown',record,true);for(const timer of timers)clearTimeout(timer);
 }};
 console.log('NATIVE_EQUATION_DIAGNOSTICS_READY');
})();
